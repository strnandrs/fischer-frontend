// Routing — LANGUAGE root folders × BRAND sub-folders in one Storyblok space (folder-level translation).
//  - LOCALE: every ROOT folder whose slug is a language code (`de/`, `en/`, `fr/`, `es/`) — lib/languages.ts.
//  - BRAND: every story in the root folder `config/` with content type `site-config` (`config/fischer`,
//    `config/fischertechnik`; slug = brand) — AUTO-DISCOVERED from the Delivery API (fallback: the
//    sub-folders of the default-locale folder `de/`). Each locale folder holds `{locale}/{brand}/` with
//    the brand's startpage (landing page) and the rest of its pages.
//
//   /                                     -> redirect /de (default locale)
//   /{locale}                             -> brand picker
//   /{locale}/{brand}[/{rest…}]           -> story `{locale}/{brand}/` (startpage) or `{locale}/{brand}/{rest}`
//   /[{fieldLang}/]config/{brand}         -> editor-only chrome preview of the site-config (Visual Editor only);
//                                            field-level language from the prefix or `?_storyblok_lang`
//
// These are exactly the Visual Editor preview URLs (`/{full_slug}`; a field-level language switch in
// the editor prefixes it: `/fr/config/fischer`, `/fr/de/fischer/…` — the extra prefix is ignored for
// content). PRODUCTION: env BRAND_HOSTS maps request hosts to brands; the proxy then rewrites
// `/{locale}/…` to `/{locale}/{brand}/…` so each brand serves at its domain root (hrefs drop the brand
// segment, see hrefFor).

import { apiBase, getLinks, isLanguageCode, SOURCE_LANG } from "@/lib/languages";

export type Brand = string;

export interface BrandInfo {
  slug: string;
  /** Display name (site-config story name, else the brand folder name). */
  name: string;
}

/** Root folder holding the brand site-configs (`config/{brand}`) — never a locale or brand. */
export const CONFIG_FOLDER = "config";

const TTL_MS = 60 * 1000;
let memo: { at: number; value: BrandInfo[] } | null = null;
let inflight: Promise<BrandInfo[]> | null = null;

/** Brands = `site-config` stories directly in `config/` (draft: they exist before publish). */
async function loadFromConfigs(token: string): Promise<BrandInfo[]> {
  const cv = Math.floor(Date.now() / TTL_MS);
  const qs = new URLSearchParams({
    starts_with: `${CONFIG_FOLDER}/`,
    content_type: "site-config",
    per_page: "100",
    version: "draft",
    cv: String(cv),
    token,
  });
  const res = await fetch(`${apiBase()}/stories?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as { stories?: { slug?: string; name?: string; full_slug?: string }[] };
  return (data.stories ?? [])
    .filter((s) => s.slug && s.full_slug === `${CONFIG_FOLDER}/${s.slug}`)
    .map((s) => ({ slug: s.slug!, name: s.name || s.slug! }));
}

/** Fallback: the sub-folders of the default-locale folder (`de/fischer`, `de/fischertechnik`). */
async function loadFromDefaultFolder(): Promise<BrandInfo[]> {
  const links = await getLinks();
  const root = links.find((l) => l.is_folder && !l.parent_id && l.slug === SOURCE_LANG);
  if (!root?.id) return [];
  return links
    .filter((l) => l.is_folder && l.parent_id === root.id && l.slug)
    .map((l) => {
      const slug = l.slug!.split("/").pop()!;
      return { slug, name: l.name || slug };
    });
}

async function load(): Promise<BrandInfo[]> {
  const token = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN;
  if (!token) return memo?.value ?? [];
  try {
    let brands = await loadFromConfigs(token).catch(() => [] as BrandInfo[]);
    if (brands.length === 0) brands = await loadFromDefaultFolder();
    if (brands.length === 0 && memo) return memo.value;
    return brands.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return memo?.value ?? [];
  }
}

/** All brands (site-config stories in `config/`), cached in-process ~60 seconds. */
export async function getBrands(): Promise<BrandInfo[]> {
  if (memo && Date.now() - memo.at < TTL_MS) return memo.value;
  inflight ??= load().then((value) => {
    memo = { at: Date.now(), value };
    inflight = null;
    return value;
  });
  return inflight;
}

export async function getBrandSlugs(): Promise<string[]> {
  return (await getBrands()).map((b) => b.slug);
}

/** Parse env BRAND_HOSTS ("host=brand,host2=brand") into a lowercase host → brand map. */
export function parseBrandHosts(raw = process.env.BRAND_HOSTS ?? ""): Record<string, string> {
  const map: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const [host, brand] = pair.split("=").map((s) => s?.trim());
    if (host && brand) map[host.toLowerCase()] = brand;
  }
  return map;
}

/** Brand for a request host (port stripped), or null (localhost / unknown host → path prefixes). */
export function brandForHost(host: string | null | undefined): Brand | null {
  if (!host) return null;
  return parseBrandHosts()[host.toLowerCase().replace(/:\d+$/, "")] ?? null;
}

export type RouteKind = "index" | "page" | "site-config";

export interface ResolvedRoute {
  kind: RouteKind;
  /** Locale = language folder of the request (site-config preview: its field-level language). */
  lang: string;
  /** Brand of the request — null on the picker. */
  brand: Brand | null;
  /** Path after `/{locale}/{brand}` ("" for the landing page). */
  rest: string;
  /** Storyblok full_slug to fetch (`{locale}/{brand}/…`, `config/{brand}`), "" for the picker. */
  slug: string;
}

/** A segment that names a language: a site locale, or (field-level prefixes) any language code. */
const isLang = (seg: string | undefined, languages: readonly string[]) =>
  !!seg && (languages.includes(seg) || isLanguageCode(seg));

/**
 * Resolve URL segments. `null` = not routable (the proxy redirects to `/{locale}` or `/de`).
 * Pure — no I/O.
 */
export function resolveRoute(
  segments: string[],
  languages: readonly string[],
  brands: readonly string[]
): ResolvedRoute | null {
  let segs = [...segments];
  // Visual Editor field-level language prefix in front of a language folder (`/fr/de/fischer/…`):
  // content is folder-translated, the prefix carries no meaning → drop it.
  if (isLang(segs[0], languages) && languages.includes(segs[1] ?? "")) segs = segs.slice(1);

  // Site-config preview: `/config/{brand}` (default language) or `/{fieldLang}/config/{brand}`.
  const cfgAt = segs[0] === CONFIG_FOLDER ? 0 : segs[1] === CONFIG_FOLDER && isLang(segs[0], languages) ? 1 : -1;
  if (cfgAt >= 0) {
    const brand = segs[cfgAt + 1];
    if (!brand || segs.length !== cfgAt + 2 || !brands.includes(brand)) return null;
    const lang = cfgAt === 1 ? segs[0] : SOURCE_LANG;
    return { kind: "site-config", lang, brand, rest: "", slug: `${CONFIG_FOLDER}/${brand}` };
  }

  const [lang, first, ...after] = segs;
  if (!lang || !languages.includes(lang)) return null;
  if (!first) return { kind: "index", lang, brand: null, rest: "", slug: "" };
  if (!brands.includes(first)) return null;
  // `/{locale}/{brand}/home` is the landing page too.
  const rest = after.length === 1 && after[0] === "home" ? "" : after.join("/");
  return { kind: "page", lang, brand: first, rest, slug: rest ? `${lang}/${first}/${rest}` : `${lang}/${first}/` };
}

/**
 * Public URL for a brand path in a locale — ALWAYS locale-prefixed: `/de/fischer`,
 * `/en/fischer/produkte`. When `hostBrand` equals the brand (served on its own domain) the brand
 * segment is dropped: `/de`, `/en/produkte`.
 */
export function hrefFor(lang: string, brand: Brand, rest = "", hostBrand: Brand | null = null): string {
  const parts = rest.split("/").filter(Boolean);
  const path = (hostBrand && hostBrand === brand ? parts : [brand, ...parts]).join("/");
  return `/${lang || SOURCE_LANG}/${path}`.replace(/\/$/, "");
}

/**
 * Public URL of a story full_slug as delivered by the API, RE-TARGETED to the requested locale:
 * the language folder is swapped for `lang` (`de/fischer/produkte/` on an /en page →
 * `/en/fischer/produkte`). A leading field-level language prefix (site-config links fetched with
 * `language=fr`: `fr/de/fischer/x`) is stripped first.
 */
export function storyHref(
  fullSlug: string,
  lang: string,
  languages: readonly string[],
  hostBrand: Brand | null = null
): string {
  let segs = fullSlug.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  if (isLang(segs[0], languages) && isLang(segs[1], languages)) segs = segs.slice(1);
  if (isLang(segs[0], languages)) segs = segs.slice(1);
  const [brand, ...rest] = segs;
  return brand ? hrefFor(lang, brand, rest.join("/"), hostBrand) : `/${lang || SOURCE_LANG}`;
}

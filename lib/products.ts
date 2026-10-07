// Server-side product data: picker-ref normalization, live product fetches (Delivery API, draft —
// folder-level translation: stories of the request's language folder, NO language param), category
// folder listing, material labels and the request's product context (brand / locale / theme preset /
// shop texts from the proxy headers + site-config).
// Server only (next/headers). Pure tile mapping lives in lib/product-tile.ts.
import { cache } from "react";
import { headers } from "next/headers";
import { apiBase, apiLanguage, SOURCE_LANG } from "@/lib/languages";
import { fetchSiteConfig } from "@/lib/site-config";
import { resolveTheme, type ThemeFields } from "@/lib/theme";
import { isPreviewRequest } from "@/lib/preview";
import type { ProductStory } from "@/lib/product-tile";

export type { ProductStory } from "@/lib/product-tile";

// ------------------------------------------------------------------------------------------------
// Picker refs
// ------------------------------------------------------------------------------------------------

/** One product reference as stored by a picker field (native `options`/internal_stories = uuid strings). */
export type ProductRef = { uuid: string } | { id: number } | { full_slug: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function refFromString(s: string): ProductRef | null {
  const v = s.trim();
  if (!v) return null;
  if (UUID.test(v)) return { uuid: v.toLowerCase() };
  if (/^\d+$/.test(v)) return { id: Number(v) };
  return { full_slug: v.replace(/^\/+|\/+$/g, "") };
}

function refFromObject(o: Record<string, unknown>): ProductRef | null {
  const inner = (o.story ?? o.content) as Record<string, unknown> | undefined;
  if (typeof o.uuid === "string" && o.uuid) return { uuid: o.uuid.toLowerCase() };
  if (typeof o.id === "number" || (typeof o.id === "string" && /^\d+$/.test(o.id))) return { id: Number(o.id) };
  if (typeof o.full_slug === "string" && o.full_slug) return { full_slug: o.full_slug.replace(/^\/+|\/+$/g, "") };
  if (typeof o.slug === "string" && o.slug) return { full_slug: o.slug.replace(/^\/+|\/+$/g, "") };
  if (inner && typeof inner === "object") return refFromObject(inner);
  return null;
}

/**
 * Normalize any picker value into an ordered, de-duplicated ref list. Accepts: an array (of uuid/id/
 * slug strings or objects carrying uuid | id | full_slug | slug, also nested under .story/.content), an
 * object holding such an array under items | stories | value | selected, or a single string/object.
 * Unknown shapes → [] (dev-only console.warn with the raw value).
 */
export function normalizeProductRefs(value: unknown): ProductRef[] {
  if (value === null || value === undefined || value === "") return [];
  let list: unknown[] | null = null;
  if (Array.isArray(value)) list = value;
  else if (typeof value === "string") list = value.includes(",") ? value.split(",") : [value];
  else if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    const arr = [o.items, o.stories, o.value, o.selected].find(Array.isArray) as unknown[] | undefined;
    list = arr ?? [o];
  }
  const out: ProductRef[] = [];
  const seen = new Set<string>();
  for (const entry of list ?? []) {
    const ref =
      typeof entry === "string"
        ? refFromString(entry)
        : typeof entry === "number"
          ? { id: entry }
          : entry && typeof entry === "object"
            ? refFromObject(entry as Record<string, unknown>)
            : null;
    if (!ref) continue;
    const key = JSON.stringify(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ref);
  }
  if (out.length === 0 && process.env.NODE_ENV !== "production") {
    console.warn("[normalizeProductRefs] unrecognized picker value", value);
  }
  return out;
}

// ------------------------------------------------------------------------------------------------
// Fetching
// ------------------------------------------------------------------------------------------------

export interface FetchOpts {
  /** Request locale = language folder the results must live in (no API language param). */
  lang?: string;
  /** Kept for API symmetry with the page fetch; the site always renders draft (unpublished demos). */
  preview?: boolean;
}

async function sbGet(path: string, params: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  // Lazy import: lib/storyblok imports the component map, whose components import this module.
  const { getStoryblokApi } = await import("@/lib/storyblok");
  try {
    const { data } = await getStoryblokApi().get(path, { version: "draft", ...params } as never);
    return data as Record<string, unknown>;
  } catch {
    return null;
  }
}

const trimSlug = (fullSlug: string | undefined) => (fullSlug ?? "").replace(/^\/+/, "");

const isProduct = (s: ProductStory) => s?.content?.component === "product";

const fetchByRefsCached = cache(async (key: string): Promise<ProductStory[]> => {
  const { refs, lang, brand } = JSON.parse(key) as { refs: ProductRef[]; lang?: string; brand?: string | null };
  if (refs.length === 0) return [];
  const uuids = refs.flatMap((r) => ("uuid" in r ? [r.uuid] : []));
  const slugs = refs.flatMap((r) => ("full_slug" in r ? [r.full_slug] : []));
  const ids = refs.flatMap((r) => ("id" in r ? [r.id] : []));
  const [byUuid, bySlug, byId] = await Promise.all([
    uuids.length
      ? sbGet("cdn/stories", { by_uuids_ordered: uuids.join(","), per_page: 100 }).then(
          (d) => ((d?.stories as ProductStory[]) ?? [])
        )
      : Promise.resolve([] as ProductStory[]),
    slugs.length
      ? sbGet("cdn/stories", { by_slugs: slugs.join(","), per_page: 100 }).then(
          (d) => ((d?.stories as ProductStory[]) ?? [])
        )
      : Promise.resolve([] as ProductStory[]),
    Promise.all(ids.map((id) => sbGet(`cdn/stories/${id}`, {}).then((d) => (d?.story as ProductStory) ?? null))),
  ]);

  // Re-assemble in editor order; keep only products of the request's language + brand folder.
  const scope = `${lang ?? SOURCE_LANG}/${brand ? `${brand}/` : ""}`;
  const out: ProductStory[] = [];
  const seen = new Set<string>();
  for (const r of refs) {
    let s: ProductStory | null | undefined;
    if ("uuid" in r) s = byUuid.find((x) => x.uuid?.toLowerCase() === r.uuid);
    else if ("full_slug" in r) s = bySlug.find((x) => trimSlug(x.full_slug) === r.full_slug);
    else s = byId[ids.indexOf(r.id)];
    if (!s || !isProduct(s)) continue;
    if (!trimSlug(s.full_slug).startsWith(scope)) continue;
    const k = s.uuid ?? String(s.id);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
});

/**
 * Live product stories for picker refs, in editor order (draft). Pickers store uuids of products in
 * the same language folder; only `product` stories under `{lang}/{brand}/…` (`{lang}/…` without a
 * brand) are kept.
 */
export async function fetchProductsByRefs(
  refs: ProductRef[],
  opts: FetchOpts & { brand?: string | null } = {}
): Promise<ProductStory[]> {
  return fetchByRefsCached(JSON.stringify({ refs, lang: opts.lang ?? SOURCE_LANG, brand: opts.brand ?? null }));
}

const fetchFolderCached = cache(async (folder: string): Promise<ProductStory[]> => {
  const startsWith = folder.replace(/^\/+/, "").replace(/\/?$/, "/");
  const all: ProductStory[] = [];
  for (let page = 1; page <= 10; page++) {
    const d = await sbGet("cdn/stories", {
      starts_with: startsWith,
      content_type: "product",
      per_page: 100,
      page,
      sort_by: "position:asc",
    });
    const batch = (d?.stories as ProductStory[]) ?? [];
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all
    .filter(isProduct)
    .sort(
      (a, b) =>
        (a.position ?? 0) - (b.position ?? 0) ||
        (a.content?.name || a.name || "").localeCompare(b.content?.name || b.name || "")
    );
});

/**
 * Every `product` story inside a folder (category listing), folder order then name. The folder is
 * the story's own full_slug folder — already language-scoped (`en/fischer/produkte/stahlanker`).
 */
export async function fetchProductsInFolder(folderFullSlug: string): Promise<ProductStory[]> {
  return fetchFolderCached(folderFullSlug);
}

/**
 * Material value → display label for a locale (datasource `product-materials`; non-default locales
 * use its dimension, falling back to the default name).
 */
export const materialLabels = cache(async (lang: string = SOURCE_LANG): Promise<Record<string, string>> => {
  const token = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN;
  if (!token) return {};
  const dimension = apiLanguage(lang);
  const qs = new URLSearchParams({ datasource: "product-materials", per_page: "1000", token });
  if (dimension) qs.set("dimension", dimension);
  qs.set("cv", String(Math.floor(Date.now() / 60000)));
  try {
    const res = await fetch(`${apiBase()}/datasource_entries?${qs}`, { cache: "no-store" });
    if (!res.ok) return {};
    const data = (await res.json()) as {
      datasource_entries?: { value: string; name: string; dimension_value?: string | null }[];
    };
    const map: Record<string, string> = {};
    for (const e of data.datasource_entries ?? []) map[e.value] = e.dimension_value || e.name;
    return map;
  } catch {
    return {};
  }
});

/**
 * Ordered entry values of a datasource (e.g. `drill-diameters`, `age-from`) — the option list of a
 * category facet. Empty on error (callers fall back to the values present on the products).
 */
export const datasourceValues = cache(async (slug: string): Promise<string[]> => {
  const token = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN;
  if (!token) return [];
  const qs = new URLSearchParams({ datasource: slug, per_page: "1000", token });
  qs.set("cv", String(Math.floor(Date.now() / 60000)));
  try {
    const res = await fetch(`${apiBase()}/datasource_entries?${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { datasource_entries?: { value: string }[] };
    return (data.datasource_entries ?? []).map((e) => e.value);
  } catch {
    return [];
  }
});

// ------------------------------------------------------------------------------------------------
// Request context
// ------------------------------------------------------------------------------------------------

export interface ShopTexts {
  cartLabel?: string;
  cartToast?: string;
  vatNote?: string;
  /** richtext doc from site-config.shipping_info */
  shippingInfo?: unknown;
}

export interface ProductContext {
  brand: string | null;
  lang: string;
  preview: boolean;
  /** Theme preset of the brand (data-brand): drives tile look + PDP head layout. */
  preset: string;
  shop: ShopTexts;
}

/**
 * Brand / locale from the proxy headers (x-brand, x-lang = the URL's language folder), theme preset +
 * Shop texts from the brand's site-config (field-level, fetched in that locale). `brandOverride` = harness/fixture-only brand (no proxy headers on /preview/*).
 * Shop fields are read defensively (any may be missing/empty → German fallbacks in the UI).
 */
export async function getProductContext(brandOverride?: string | null): Promise<ProductContext> {
  const h = await headers();
  const brand = brandOverride || h.get("x-brand") || null;
  const lang = h.get("x-lang") || SOURCE_LANG;
  const cfg = await fetchSiteConfig(brand, lang);
  const content = (cfg?.content ?? {}) as Record<string, unknown> & ThemeFields;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  return {
    brand,
    lang,
    preview: isPreviewRequest(h),
    preset: resolveTheme(brand, cfg ? content : null).preset,
    shop: {
      cartLabel: str(content.cart_label),
      cartToast: str(content.cart_toast),
      vatNote: str(content.vat_note),
      shippingInfo: content.shipping_info,
    },
  };
}

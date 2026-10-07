// Site LOCALES — Storyblok FOLDER-LEVEL translation. Every ROOT folder whose slug is a language code
// (`de/`, `en/`, `fr/`, `es/`) is a locale holding a full copy of the content, AUTO-DISCOVERED from
// the Delivery API links (`cdn/links`): adding a language folder in Storyblok makes it routable
// (`/{locale}/{brand}/…`) and listed in the language switch with no code change. Other root folders
// (`config/`) are not locales. The default locale (`de`) comes first, the rest in Storyblok tree order.
//
// FIELD-LEVEL translation survives only for the brand site-configs (`config/{brand}`, space languages
// en/fr/es, default = German): fetched with `language={locale}` (apiLanguage) matching the folder locale.
// Plain fetch (no SDK import): used from proxy.ts as well as server components.

export const SOURCE_LANG = "de";

export interface SiteLanguage {
  code: string;
  label: string;
}

/** One entry of the Delivery API `cdn/links` response (the fields this app reads). */
export interface SbLinkEntry {
  id?: number;
  slug?: string;
  name?: string;
  is_folder?: boolean;
  is_startpage?: boolean;
  parent_id?: number | null;
  position?: number;
}

const TTL_MS = 60 * 1000;
const FALLBACK: SiteLanguage[] = [{ code: SOURCE_LANG, label: "Deutsch" }];

export function apiBase(): string {
  const region = process.env.NEXT_PUBLIC_STORYBLOK_REGION ?? "eu";
  const host = region === "eu" ? "api.storyblok.com" : `api-${region}.storyblok.com`;
  return `https://${host}/v2/cdn`;
}

// ------------------------------------------------------------------------------------------------
// Links (shared by locale + brand discovery)
// ------------------------------------------------------------------------------------------------

let linksMemo: { at: number; value: SbLinkEntry[] } | null = null;
let linksInflight: Promise<SbLinkEntry[]> | null = null;

async function loadLinks(): Promise<SbLinkEntry[]> {
  const token = process.env.NEXT_PUBLIC_STORYBLOK_TOKEN;
  if (!token) throw new Error("no token");
  const cv = Math.floor(Date.now() / TTL_MS);
  // version=draft: folders exist as soon as they are created (before publish).
  const res = await fetch(`${apiBase()}/links?per_page=1000&version=draft&cv=${cv}&token=${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(String(res.status));
  const data = (await res.json()) as { links?: Record<string, SbLinkEntry> };
  return Object.values(data.links ?? {});
}

/** All Delivery API links (draft), cached in-process ~60 seconds. Throws only without a cached value. */
export async function getLinks(): Promise<SbLinkEntry[]> {
  if (linksMemo && Date.now() - linksMemo.at < TTL_MS) return linksMemo.value;
  linksInflight ??= loadLinks()
    .then((value) => {
      linksMemo = { at: Date.now(), value };
      return value;
    })
    .catch((err) => {
      if (linksMemo) return linksMemo.value;
      throw err;
    })
    .finally(() => {
      linksInflight = null;
    });
  return linksInflight;
}

// ------------------------------------------------------------------------------------------------
// Locales
// ------------------------------------------------------------------------------------------------

/** Native language name for a code ("fr" → "Français"), or null when the code is no known language. */
function languageName(code: string): string | null {
  if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i.test(code)) return null;
  try {
    const [canonical] = Intl.getCanonicalLocales(code);
    const name = new Intl.DisplayNames([canonical], { type: "language", fallback: "none" }).of(canonical);
    if (!name || name.toLowerCase() === code.toLowerCase()) return null;
    return name.charAt(0).toLocaleUpperCase(canonical) + name.slice(1);
  } catch {
    return null;
  }
}

/** Is this slug a language code (`de`, `en`, `pt-br`)? Pure — `config`, brand slugs etc. are not. */
export function isLanguageCode(slug: string | undefined | null): boolean {
  return !!slug && languageName(slug) !== null;
}

let memo: { at: number; value: SiteLanguage[] } | null = null;
let inflight: Promise<SiteLanguage[]> | null = null;

async function load(): Promise<SiteLanguage[]> {
  try {
    const roots = (await getLinks())
      .filter((l) => l.is_folder && !l.parent_id && l.slug && isLanguageCode(l.slug))
      // Creation order (link id): new language folders are appended, regardless of their tree position.
      .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    const codes = roots.map((l) => l.slug!).filter((c) => c !== SOURCE_LANG);
    return [FALLBACK[0], ...codes.map((code) => ({ code, label: languageName(code) ?? code.toUpperCase() }))];
  } catch {
    return memo?.value ?? FALLBACK;
  }
}

/** All site locales (default first, then the language folders in tree order), cached ~60 seconds. */
export async function getLanguages(): Promise<SiteLanguage[]> {
  if (memo && Date.now() - memo.at < TTL_MS) return memo.value;
  inflight ??= load().then((value) => {
    memo = { at: Date.now(), value };
    inflight = null;
    return value;
  });
  return inflight;
}

export async function getLanguageCodes(): Promise<string[]> {
  return (await getLanguages()).map((l) => l.code);
}

/**
 * Storyblok FIELD-LEVEL `language` param for a locale — undefined for the default locale. Only for
 * the site-config fetch and datasource dimensions; content stories are read from their language
 * folder WITHOUT a language param.
 */
export function apiLanguage(lang: string): string | undefined {
  return lang && lang !== SOURCE_LANG ? lang : undefined;
}

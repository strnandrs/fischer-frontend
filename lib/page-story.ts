import { cache } from "react";
import { headers } from "next/headers";
import { apiLanguage, getLanguages, SOURCE_LANG, type SiteLanguage } from "@/lib/languages";
import { getBrandSlugs, hrefFor, resolveRoute, type ResolvedRoute } from "@/lib/brands";
import { isPreviewRequest } from "@/lib/preview";

// One route resolution + story fetch per request, shared by the root layout, the catch-all page,
// generateMetadata and in-page components — React `cache` dedupes on primitive args
// (path, preview, hostBrand): path = decoded segments joined by "/".

export interface PageStory extends Record<string, unknown> {
  id?: number;
  name?: string;
  full_slug?: string;
  content?: {
    component?: string;
    title?: string;
    description?: string;
    og_image?: { filename?: string; alt?: string };
  };
}

/** A locale version of the current page. */
export interface PageAlternate extends SiteLanguage {
  href: string;
}

export interface PageResult {
  route: ResolvedRoute | null;
  story?: PageStory;
  /** Locale the page is served in (= the language folder of the URL). */
  servedLang: string;
  /** Every locale's URL of this page: the same relative path in every language folder. */
  alternates: PageAlternate[];
  languages: SiteLanguage[];
}

export const loadPage = cache(async (path: string, preview: boolean, hostBrand: string): Promise<PageResult> => {
  const [languages, brands] = await Promise.all([getLanguages(), getBrandSlugs()]);
  const codes = languages.map((l) => l.code);
  const route = resolveRoute(path ? path.split("/") : [], codes, brands);
  const empty: PageResult = { route, servedLang: route?.lang ?? SOURCE_LANG, alternates: [], languages };
  if (!route || route.kind === "index") return empty;
  // site-config is an editor-only object — routable in the Visual Editor only (public → 404).
  if (!preview && route.kind !== "page") return empty;

  const { getStoryblokApi } = await import("@/lib/storyblok");
  try {
    // Content stories live in their language folder (`{locale}/{brand}/…`): NO language param.
    // Only the site-config preview (`config/{brand}`) is field-level translated.
    const language = route.kind === "site-config" ? apiLanguage(route.lang) : undefined;
    const { data } = await getStoryblokApi().get(`cdn/stories/${route.slug}`, {
      version: "draft",
      ...(language ? { language } : {}),
    });
    const story = data.story as PageStory;
    const alternates = route.kind === "page" && route.brand
      ? languages.map((l) => ({ ...l, href: hrefFor(l.code, route.brand!, route.rest, hostBrand || null) }))
      : [];
    return { route, story, servedLang: route.lang, alternates, languages };
  } catch {
    return empty;
  }
});

/** Decode + normalize a pathname the way every loadPage() caller must (cache key). */
export function normalizePath(pathname: string): string {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    })
    .join("/");
}

/** loadPage() for the current request from the proxy's forwarded headers (layout, components). */
export async function loadPageFromHeaders(): Promise<PageResult | null> {
  const h = await headers();
  const pathname = h.get("x-pathname");
  if (pathname === null) return null; // not a proxied route (/preview/*)
  return loadPage(normalizePath(pathname), isPreviewRequest(h), h.get("x-host-brand") ?? "");
}

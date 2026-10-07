// Storyblok multilink -> href. Pure + server-safe (no hooks, no directive), shared by the server
// (`linkHref`) and the locale-aware client link (`components/SbLink.tsx`).
import { storyHref, type Brand } from "@/lib/brands";

export interface SbLinkValue {
  linktype?: string;
  url?: string;
  cached_url?: string;
  anchor?: string;
  email?: string;
  target?: string;
}

/**
 * Locale/brand routing context for story links. When given, a story link's `cached_url` (the
 * delivered full_slug, e.g. `en/fischer/produkte/`, or `fr/de/fischer/produkte/` from a site-config
 * fetched with a field-level language) is re-targeted to the ACTIVE locale's language folder and
 * drops the brand segment when the request host serves that brand (`hostBrand === brand`) — see
 * lib/brands `storyHref`.
 */
export interface LinkContext {
  lang: string;
  /** All locale codes (default first). Empty = no routing context → plain `/{cached_url}`. */
  languages: readonly string[];
  hostBrand?: Brand | null;
}

export function linkHref(link?: SbLinkValue | null, ctx?: LinkContext | null): string | undefined {
  if (!link) return undefined;
  const anchor = link.anchor ? `#${link.anchor}` : "";
  switch (link.linktype) {
    case "email":
      return link.email ? `mailto:${link.email}` : undefined;
    case "asset":
    case "url": {
      const u = link.url || link.cached_url;
      return u ? u + anchor : undefined;
    }
    case "story": {
      const u = (link.cached_url ?? "").replace(/^\/+|\/+$/g, "");
      if (!u && !anchor) return undefined;
      if (u && ctx && ctx.languages.length > 0) return storyHref(u, ctx.lang, ctx.languages, ctx.hostBrand ?? null) + anchor;
      return `/${u}${anchor}`;
    }
    default: {
      const u = link.url || link.cached_url;
      return u ? u + anchor : undefined;
    }
  }
}

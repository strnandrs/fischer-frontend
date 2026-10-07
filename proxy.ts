import { NextResponse, type NextRequest } from "next/server";
import { getLanguageCodes, isLanguageCode, SOURCE_LANG } from "@/lib/languages";
import { brandForHost, CONFIG_FOLDER, getBrandSlugs, resolveRoute } from "@/lib/brands";

// Next.js App Router layouts only receive `params` for dynamic segments at/above their own level
// — the ROOT layout sits above the catch-all, so the proxy (née Middleware, Next 16) resolves the
// route once and forwards it as request headers (read via next/headers):
//   x-lang         locale = language folder of the request (site-config preview: field-level language)
//   x-brand        brand slug ("" on the picker)
//   x-host-brand   brand of the request HOST (production host map), "" on localhost
//   x-route-kind   index | page | site-config (lib/brands.ts resolveRoute)
//   x-pathname     (rewritten) route path → lib/page-story loadPageFromHeaders()
//   x-sb-preview / x-storyblok-preview: "1" inside the Storyblok Visual Editor (`?_storyblok`)
//
// URLs always carry the locale (folder-level translation): `/` redirects to `/de`, an unknown path
// to `/{locale}` (or `/de`). Site-config preview: `/config/{brand}?_storyblok_lang=fr` is rewritten to
// `/fr/config/{brand}` so the field-level language is part of the route path (loadPage cache key).
// Production: when the request host is in env BRAND_HOSTS, `/{locale}/…` is rewritten to
// `/{locale}/{brand}/…` (and `/…` without a locale redirects to `/de/…`).
// Locales and brands are auto-discovered from the Delivery API (cached ~60s).
export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { searchParams } = url;
  const hostBrand = brandForHost(request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  const [languages, brands] = await Promise.all([getLanguageCodes(), getBrandSlugs()]);

  const redirect = (pathname: string) => {
    url.pathname = pathname;
    return NextResponse.redirect(url, 307);
  };

  let segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return redirect(`/${SOURCE_LANG}`);

  let rewritten = false;
  if (segments[0] === CONFIG_FOLDER) {
    // Field-level language switch of the Visual Editor on the site-config: `?_storyblok_lang=fr`.
    const fieldLang = searchParams.get("_storyblok_lang");
    if (fieldLang && fieldLang !== "default" && isLanguageCode(fieldLang)) {
      segments = [fieldLang, ...segments];
      rewritten = true;
    }
  } else if (!languages.includes(segments[0])) {
    // No locale prefix: `/fischer/x` (old URLs) or a host-mapped `/produkte` → default locale.
    if (hostBrand || brands.includes(segments[0])) return redirect(`/${SOURCE_LANG}/${segments.join("/")}`);
    if (!(segments[1] === CONFIG_FOLDER && isLanguageCode(segments[0]))) return redirect(`/${SOURCE_LANG}`);
  } else if (
    hostBrand &&
    segments[1] !== hostBrand &&
    segments[1] !== CONFIG_FOLDER &&
    !languages.includes(segments[1] ?? "")
  ) {
    // Host map: insert the host's brand after the locale (unless already there / an editor prefix).
    segments = [segments[0], hostBrand, ...segments.slice(1)];
    rewritten = true;
  }

  const pathname = "/" + segments.join("/");
  const route = resolveRoute(segments, languages, brands);

  if (!route) {
    if (hostBrand) return new NextResponse("Not found", { status: 404 });
    return redirect(languages.includes(segments[0]) ? `/${segments[0]}` : `/${SOURCE_LANG}`);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-lang", route.lang);
  requestHeaders.set("x-brand", route.brand ?? "");
  requestHeaders.set("x-host-brand", hostBrand ?? "");
  requestHeaders.set("x-route-kind", route.kind);
  requestHeaders.set("x-pathname", pathname);
  const isPreview = searchParams.has("_storyblok") ? "1" : "0";
  requestHeaders.set("x-sb-preview", isPreview);
  requestHeaders.set("x-storyblok-preview", isPreview);

  if (rewritten) {
    url.pathname = pathname;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Skip Next internals, the editor-only /preview/* routes, API routes and static files (any last
  // segment with a file extension).
  matcher: ["/((?!_next|favicon.ico|preview/|api|.*\\.[a-zA-Z0-9]+$).*)"],
};

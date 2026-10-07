// Is this request a Storyblok preview (Visual Editor) request?
//  - `x-sb-preview: 1` — set by proxy.ts when the request URL carries `_storyblok`.
//  - Referer from app.storyblok.com (initial iframe load) or from a page URL carrying `_storyblok`
//    (live-edit re-renders inside the iframe).
export function isPreviewRequest(h: Headers): boolean {
  if (h.get("x-sb-preview") === "1") return true;
  const referer = h.get("referer") ?? "";
  return /(^https?:\/\/([a-z0-9-]+\.)*storyblok\.com\/)|[?&]_storyblok(=|&|$)/i.test(referer);
}

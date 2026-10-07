// Bynder DAM images (field plugin `storyblok-bynder`) — first choice over the Storyblok asset field.
// The plugin stores the selected Bynder asset(s) from the Compact View; depending on plugin version
// that is an array of assets or an object wrapping them (`assets` / `items` / `value` / `selected`).
// Each asset carries its delivery URLs under `files.*.url` (webImage, transformBaseUrl, original…),
// `derivatives.*`, `thumbnails.*` or flat `url` / `src` / `originalUrl` keys. Read defensively and
// return the best web-sized image, or null so the caller falls back to the Storyblok asset.

export interface BynderImage {
  src: string;
  alt: string;
}

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const isUrl = (v: unknown): v is string => typeof v === "string" && /^https?:\/\//.test(v);

/** URL candidates of one asset, best first (web-sized rendition before thumbnails / originals). */
function urlsOf(asset: Obj): string[] {
  const out: string[] = [];
  const push = (v: unknown) => {
    if (isUrl(v)) out.push(v);
    else if (isObj(v) && isUrl(v.url)) out.push(v.url);
  };
  const files = isObj(asset.files) ? asset.files : {};
  for (const key of ["webImage", "transformBaseUrl", "mini", "thul", "original"]) push(files[key]);
  for (const group of ["derivatives", "thumbnails"]) {
    const g = asset[group];
    if (isObj(g)) for (const key of ["webimage", "webImage", "transformBaseUrl", "thul", "mini"]) push(g[key]);
  }
  for (const key of ["webImage", "url", "src", "originalUrl", "previewUrl", "transformBaseUrl", "thumbnail"]) push(asset[key]);
  return out;
}

function assetsOf(value: unknown): Obj[] {
  if (Array.isArray(value)) return value.filter(isObj);
  if (!isObj(value)) return [];
  for (const key of ["assets", "items", "value", "selected", "asset"]) {
    const v = value[key];
    if (Array.isArray(v)) return v.filter(isObj);
    if (isObj(v)) return [v];
  }
  return urlsOf(value).length ? [value] : [];
}

/** The first selected Bynder image, or null when the field is empty / has no usable URL. */
export function bynderImage(value: unknown): BynderImage | null {
  for (const asset of assetsOf(value)) {
    const src = urlsOf(asset)[0];
    if (src) {
      const alt = [asset.alt, asset.altText, asset.description, asset.name, asset.title].find(
        (v): v is string => typeof v === "string" && v.trim().length > 0
      );
      return { src, alt: alt?.trim() ?? "" };
    }
  }
  return null;
}

import type { ProductTileData } from "@/lib/product-tile";

// Akeneo PIM picks (field plugin `sb-akeneo`, product-category › Highlights › `akeneo_products`).
// Stored value: { plugin: "sb-akeneo", items: [{ id, sku, name: [{data, locale}], description: [...],
// price: [{ data: [{ amount, currency }] }], image: [{ data, _links: { download: { href } } }] }] }.
// Mapped onto the shared ProductTileData so the picks render in the same recommendations rail as the
// Storyblok products. Akeneo image downloads require API auth (401), so the photo comes from the
// public fischer CDN via publicImage() below; PIM tiles are not links (no Storyblok story behind them).

interface AkeneoValue {
  data?: unknown;
  locale?: string | null;
}

interface AkeneoItem {
  id?: string;
  sku?: string;
  name?: AkeneoValue[];
  description?: AkeneoValue[];
  price?: Array<{ data?: Array<{ amount?: string; currency?: string }> }>;
}

/** Akeneo locale codes per site locale, most specific first. */
const LOCALES: Record<string, string[]> = {
  de: ["de_DE", "de_AT", "de_CH"],
  en: ["en_GB", "en_US"],
  fr: ["fr_FR", "fr_BE"],
  es: ["es_ES"],
};

/** The localized text of an Akeneo attribute: site locale → German → English → first value. */
function localized(values: AkeneoValue[] | undefined, lang: string): string {
  if (!Array.isArray(values) || values.length === 0) return "";
  const prefs = [...(LOCALES[lang] ?? []), ...LOCALES.de, ...LOCALES.en];
  for (const code of prefs) {
    const hit = values.find((v) => v.locale === code && typeof v.data === "string" && v.data.trim());
    if (hit) return String(hit.data).trim();
  }
  const any = values.find((v) => typeof v.data === "string" && v.data.trim());
  return any ? String(any.data).trim() : "";
}

/**
 * Public image for an Akeneo media file. Akeneo's own download URL needs API auth, but fischer's PIM
 * media are mirrored on the public fischer CDN under the same name with hyphens in the product part:
 *   Akeneo  7/2/e/e/<hash>_W1_P_P_FA_ST_II_BOX_GESCHLOSSEN_CGI_F_SALL_AQQ_V2.webp
 *   CDN     …/Product Pictures fischer/W1_P_P_FA-ST-II-BOX-GESCHLOSSEN-CGI_F_SALL_AQQ_V2.jpg
 * Names that don't follow the fischer media pattern get no image (tile renders without photo).
 */
const FISCHER_CDN = "https://media.fischer.group/v7/_pim-media-prod_/Product%20Pictures/Product%20Pictures%20fischer/";

function publicImage(item: AkeneoItem): { filename: string; alt: string } | undefined {
  const data = (item as { image?: Array<{ data?: unknown }> }).image?.[0]?.data;
  if (typeof data !== "string") return undefined;
  const base = data.split("/").pop()?.replace(/^[0-9a-f]{40}_/, "").replace(/\.[a-z0-9]+$/i, "");
  const m = base?.match(/^(W\d_[A-Z]+_[A-Z]+_)(.+?)(_F_[A-Z]+_[A-Z]+_V\d+)$/);
  if (!m) return undefined;
  const name = `${m[1]}${m[2].replace(/_/g, "-")}${m[3]}`;
  return { filename: `${FISCHER_CDN}${name}.jpg?trim=5&func=fit&w=600`, alt: "" };
}

function eurPrice(item: AkeneoItem): number | undefined {
  const prices = item.price?.[0]?.data ?? [];
  const eur = prices.find((p) => p.currency === "EUR") ?? prices[0];
  const n = Number(eur?.amount);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Tiles for the Akeneo picks (empty when the field is unset or malformed). */
export function akeneoTiles(value: unknown, lang: string): ProductTileData[] {
  const items = (value as { items?: AkeneoItem[] } | null)?.items;
  if (!Array.isArray(items)) return [];
  return items
    .filter((it) => it && (it.id || it.sku))
    .map((it) => {
      const description = localized(it.description, lang);
      const name = localized(it.name, lang) || it.sku || "";
      const img = publicImage(it);
      return {
        uuid: `akeneo-${it.id ?? it.sku}`,
        fullSlug: "",
        name,
        eyebrow: "Akeneo PIM",
        articleNumber: it.sku ?? "",
        image: img ? ({ ...img, alt: name } as ProductTileData["image"]) : undefined,
        features: description ? [description] : [],
        variantCount: 0,
        price: eurPrice(it),
        ageFrom: "",
        material: "",
        drillDiameters: [],
      };
    });
}

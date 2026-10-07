// Pure product → tile mapping, shared by server (lib/products.ts, PDP rail, featured-products) and
// client code (category ProductListing). No I/O, no server-only imports.

export interface ProductAsset {
  filename?: string;
  alt?: string;
}

/** The `product` content type fields a tile reads. */
export interface ProductContent {
  component?: string;
  name?: string;
  eyebrow?: string;
  tagline?: string;
  article_number?: string;
  gallery?: ProductAsset[];
  features?: unknown;
  price?: number | string;
  material?: string;
  drill_diameters?: string[];
  age_from?: string;
  variants?: unknown[];
  variant_count?: number | string;
  [key: string]: unknown;
}

/** Minimal CDN story shape. */
export interface ProductStory {
  id?: number;
  uuid?: string;
  name?: string;
  slug?: string;
  full_slug?: string;
  position?: number;
  content?: ProductContent;
}

/** Plain, serializable data one ProductTile renders. */
export interface ProductTileData {
  uuid: string;
  /** Delivered full_slug (`fischer/produkte/stahlanker/x`) — the tile links via SbLink (locale/host aware). */
  fullSlug: string;
  name: string;
  eyebrow: string;
  articleNumber: string;
  image?: ProductAsset;
  /** Plain-text bullets from the `features` richtext (list items, else paragraphs). */
  features: string[];
  /** 0 = hide the badge. */
  variantCount: number;
  /** Raw number field; formatted per locale in the tile. */
  price?: number;
  ageFrom: string;
  material: string;
  drillDiameters: string[];
}

/** Tile look by brand theme preset: fischer → family tile, fischertechnik (or any shop) → shop tile. */
export type TileVariant = "family" | "shop";
export function tileVariantFor(preset?: string | null): TileVariant {
  return preset === "fischertechnik" ? "shop" : "family";
}

interface RtNode {
  type?: string;
  text?: string;
  content?: RtNode[];
}
function textOf(n: RtNode | undefined): string {
  if (!n) return "";
  if (typeof n.text === "string") return n.text;
  return (n.content ?? []).map(textOf).join("");
}

/** Bullet texts of a richtext doc: every list item; falls back to non-empty paragraphs. */
export function richtextBullets(doc: unknown): string[] {
  const root = doc as RtNode | undefined;
  if (!root || typeof root !== "object") return [];
  const items: string[] = [];
  const walk = (n: RtNode) => {
    if (n.type === "list_item") {
      const t = textOf(n).trim();
      if (t) items.push(t);
      return;
    }
    (n.content ?? []).forEach(walk);
  };
  walk(root);
  if (items.length) return items;
  return (root.content ?? []).filter((n) => n.type === "paragraph").map((n) => textOf(n).trim()).filter(Boolean);
}

/** True when a richtext doc has any text. */
export function hasRichText(doc: unknown): boolean {
  return textOf(doc as RtNode).trim().length > 0;
}

function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function toTileData(story: ProductStory): ProductTileData {
  const c = story.content ?? {};
  const gallery = Array.isArray(c.gallery) ? c.gallery.filter((a) => a?.filename) : [];
  const variants = Array.isArray(c.variants) ? c.variants.length : 0;
  return {
    uuid: story.uuid ?? String(story.id ?? story.full_slug ?? ""),
    fullSlug: story.full_slug ?? "",
    name: c.name || story.name || "",
    eyebrow: c.eyebrow ?? "",
    articleNumber: c.article_number ?? "",
    image: gallery[0],
    features: richtextBullets(c.features),
    variantCount: num(c.variant_count) ?? variants,
    price: num(c.price),
    ageFrom: c.age_from ?? "",
    material: c.material ?? "",
    drillDiameters: Array.isArray(c.drill_diameters) ? c.drill_diameters : [],
  };
}

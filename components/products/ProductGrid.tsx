import { ProductTile } from "@/components/products/ProductTile";
import type { ProductTileData, TileVariant } from "@/lib/product-tile";

/**
 * Plain product tile grid (no filtering): 5 columns @1440 with 24px gaps — family tiles 210px
 * (fischer, next to the 210px sidebar → 4 cols in a narrower column via `columns`), shop tiles
 * 257px (fischertechnik, full 1380 width). Hook-free: usable from server and client trees.
 */
export function ProductGrid({
  products,
  variant,
  lang,
  vatNote,
  className = "",
}: {
  products: ProductTileData[];
  variant: TileVariant;
  lang?: string;
  vatNote?: string;
  className?: string;
}) {
  if (products.length === 0) return null;
  return (
    <ul
      className={`grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 ${
        variant === "family" ? "xl:grid-cols-[repeat(5,210px)]" : ""
      } ${className}`}
    >
      {products.map((p) => (
        <li key={p.uuid} className="flex">
          <ProductTile product={p} variant={variant} size="grid" lang={lang} vatNote={vatNote} />
        </li>
      ))}
    </ul>
  );
}

export default ProductGrid;

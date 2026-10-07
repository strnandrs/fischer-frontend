import { ProductRailClient } from "@/components/interactive/ProductRailClient";
import { ProductTile } from "@/components/products/ProductTile";
import { productLabels } from "@/lib/product-i18n";
import type { ProductTileData, TileVariant } from "@/lib/product-tile";

/**
 * Product carousel (PDP related products, featured-products). Renders the INNER rail only — header
 * row (h2 21/31 600 + 44px arrows) and the slide track, in the source's inset 1146px column
 * (4 × 268.5 shop tiles / 5 × 210 family tiles + 24px gaps). The caller owns the band (background,
 * vertical padding, container). Tiles use the brand's look (`variant`).
 */
export function ProductRail({
  products,
  variant,
  headline,
  lang,
  vatNote,
  headingAs: H = "h2",
}: {
  products: ProductTileData[];
  variant: TileVariant;
  headline?: string;
  lang?: string;
  vatNote?: string;
  headingAs?: "h2" | "h3";
}) {
  if (products.length === 0) return null;
  const l = productLabels(lang);
  const tileClass = variant === "shop" ? "w-[268.5px] max-w-[80vw]" : "w-[210px]";
  return (
    <div className="mx-auto w-full max-w-[1146px]">
      <ProductRailClient
        heading={headline ? <H className="text-[21px] leading-[31px] font-[600] text-text">{headline}</H> : undefined}
        tileClass={tileClass}
        prevLabel={l.prev}
        nextLabel={l.next}
        tiles={products.map((p) => (
          <ProductTile key={p.uuid} product={p} variant={variant} size="rail" lang={lang} vatNote={vatNote} />
        ))}
      />
    </div>
  );
}

export default ProductRail;

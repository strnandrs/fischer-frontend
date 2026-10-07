import { SbLink } from "@/components/SbLink";
import { Icon } from "@/components/icons";
import { formatPrice, productLabels, variantsLabel } from "@/lib/product-i18n";
import type { ProductTileData, TileVariant } from "@/lib/product-tile";

/**
 * ONE product tile (renderer component, not an editor block) — two looks by brand theme preset
 * (`tileVariantFor(preset)`), measured from the category grids + the ft related rail:
 *  - family (fischer): 210×363 white, shadow 0 0 30px rgba(0,0,0,.1), padding 18; image box 174×146
 *    contain + 1px rule; eyebrow 14/24 300; name 18/28 600; feature bullets 12/22 300 (square);
 *    badge "N Varianten" bg secondary, white 14/24 300, padding 2×6, bottom-left.
 *  - shop (fischertechnik): grid 257×451 / rail 268.5×386, white, no shadow, padding 18; image 221
 *    square (rail 160 tall) + 1px rule; grid: name 18/28 600 centered + "Art.-Nr." 14/24 300
 *    secondary, bottom row age (icon + "Alter ab" + value) | price; rail: "Art.-Nr." 14/18 above a
 *    left-aligned name, price right-aligned. Price 21/31 600 primary + VAT note 14/24 secondary.
 * No hooks: renders inside server trees (rails) and client trees (category listing) alike. The whole
 * tile links to the product story via SbLink (locale + host-brand aware).
 */
export function ProductTile({
  product,
  variant,
  size = "grid",
  lang,
  vatNote,
}: {
  product: ProductTileData;
  variant: TileVariant;
  size?: "grid" | "rail";
  lang?: string;
  /** site-config.vat_note (falls back to the i18n label) */
  vatNote?: string;
}) {
  const l = productLabels(lang);
  const link = product.fullSlug ? { linktype: "story", cached_url: product.fullSlug } : undefined;
  const img = product.image?.filename;

  if (variant === "family") {
    return (
      <SbLink
        link={link}
        data-product-tile="family"
        className="group flex h-full min-h-[363px] w-full flex-col bg-white p-[18px] text-text shadow-[0_0_30px_rgba(0,0,0,0.1)]"
      >
        <span className="flex h-[146px] w-full shrink-0 items-center justify-center">
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={product.image?.alt ?? ""} loading="lazy" className="max-h-full max-w-full object-contain" />
          )}
        </span>
        <span className="mt-[18px] block border-t border-panel-strong" aria-hidden="true" />
        {product.eyebrow && (
          <span className="mt-6 block text-[14px] leading-6 font-light">{product.eyebrow}</span>
        )}
        <span className={`${product.eyebrow ? "" : "mt-6 "}block text-[18px] leading-7 font-[600] group-hover:underline`}>
          {product.name}
        </span>
        {product.features.length > 0 && (
          <ul className="mt-3 list-[square] pl-4 text-[12px] leading-[22px] font-light marker:text-[10px]">
            {product.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        )}
        {product.variantCount > 0 && (
          <span className="mt-auto block pt-6">
            <span className="inline-block bg-secondary px-1.5 py-0.5 text-[14px] leading-6 font-light text-white">
              {variantsLabel(product.variantCount, lang)}
            </span>
          </span>
        )}
      </SbLink>
    );
  }

  const price = formatPrice(product.price, lang);
  const vat = vatNote || l.vat_note;
  const isRail = size === "rail";
  return (
    <SbLink
      link={link}
      data-product-tile="shop"
      className={`group flex h-full w-full flex-col bg-white p-[18px] text-text ${isRail ? "min-h-[386px]" : "min-h-[451px]"}`}
    >
      <span className={`flex w-full shrink-0 items-center justify-center ${isRail ? "h-[160px]" : "aspect-square"}`}>
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={product.image?.alt ?? ""} loading="lazy" className="max-h-full max-w-full object-contain" />
        )}
      </span>
      <span className="mt-3 block border-t border-panel-strong" aria-hidden="true" />
      {isRail ? (
        <>
          {product.articleNumber && (
            <span className="mt-2 block text-[14px] leading-[18px] font-light text-secondary">
              {l.art_nr} {product.articleNumber}
            </span>
          )}
          <span className="mt-2 block text-[18px] leading-7 font-[600] group-hover:underline">{product.name}</span>
        </>
      ) : (
        <span className="mt-3 flex flex-col items-center text-center">
          <span className="block text-[18px] leading-7 font-[600] group-hover:underline">{product.name}</span>
          {product.articleNumber && (
            <span className="block text-[14px] leading-6 font-light text-secondary">
              {l.art_nr} {product.articleNumber}
            </span>
          )}
        </span>
      )}
      <span className="mt-auto flex items-end justify-between gap-3 pt-6">
        {!isRail && product.ageFrom ? (
          <span className="flex items-center gap-2">
            <Icon name="age" strokeWidth={1.25} className="h-[26px] w-[26px] shrink-0 text-primary" />
            <span className="flex flex-col">
              <span className="text-[14px] leading-[18px] font-light text-secondary">{l.age_from}</span>
              <span className="text-[18px] leading-[22px] font-light">{product.ageFrom}</span>
            </span>
          </span>
        ) : (
          <span />
        )}
        {price && (
          <span className="flex flex-col items-end text-right">
            <span className="text-[21px] leading-[31px] font-[600] text-primary">{price}</span>
            <span className="text-[14px] leading-6 font-light text-secondary">{vat}</span>
          </span>
        )}
      </span>
    </SbLink>
  );
}

export default ProductTile;

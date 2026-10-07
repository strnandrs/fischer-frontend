import type { CSSProperties } from "react";
import { storyblokEditable } from "@storyblok/react/rsc";
import { bg, container, space } from "@/lib/tokens";
import { BRAND_DEFAULTS, themeStyle } from "@/lib/theme";
import { ProductRail } from "@/components/products/ProductRail";
import { ProductTile } from "@/components/products/ProductTile";
import { fetchProductsByRefs, getProductContext, normalizeProductRefs } from "@/lib/products";
import { tileVariantFor, toTileData, type ProductStory } from "@/lib/product-tile";
import Button from "./Button";

interface ButtonBlok {
  _uid: string;
  component: string;
  label?: string;
  link?: never;
  style?: string;
}

interface FeaturedProductsBlok {
  _uid: string;
  component: string;
  headline?: string;
  /** native options/internal_stories picker: ordered uuid strings */
  products?: unknown;
  cta?: ButtonBlok[];
  background?: string;
  spacing_top?: string;
  spacing_bottom?: string;
  /** harness/fixture-only: render under this brand's theme + site-config (never a schema field) */
  _brand?: string;
  /** harness/fixture-only: product stories used instead of the live fetch (never a schema field) */
  _products?: ProductStory[];
}

/**
 * featured-products — headline + hand-picked product tiles (live product data: current name, image,
 * price in the request locale, current brand only) + optional CTA button. Layout from the ft PDP
 * related rail: full-bleed band, content in the narrow 1146px column; headline 21/31 600 left, arrow
 * pair right (inside ProductRail). More than 4 products -> ProductRail carousel; up to 4 -> static
 * row of tiles (no arrows). CTA centered below (mt 48). Band padding = spacing tokens.
 */
export default async function FeaturedProducts({ blok }: { blok: FeaturedProductsBlok }) {
  await import("@/lib/storyblok");

  const harnessTheme = blok._brand && BRAND_DEFAULTS[blok._brand] ? BRAND_DEFAULTS[blok._brand] : null;
  const ctx = await getProductContext(harnessTheme ? blok._brand : null);
  const preset = harnessTheme ? harnessTheme.preset : ctx.preset;
  const variant = tileVariantFor(preset);
  const lang = ctx.lang;

  const stories: ProductStory[] = blok._products
    ? blok._products
    : await fetchProductsByRefs(normalizeProductRefs(blok.products), { lang, preview: ctx.preview, brand: ctx.brand });
  const products = stories.map(toTileData);
  const cta = blok.cta?.[0];

  const harnessProps = harnessTheme
    ? {
        "data-brand": harnessTheme.preset,
        "data-button": harnessTheme.button,
        style: themeStyle(harnessTheme) as CSSProperties,
      }
    : {};

  const useRail = products.length > 4;
  const tileW = variant === "shop" ? "w-[268.5px] max-w-full" : "w-[210px] max-w-full";

  if (products.length === 0 && !blok.headline) return null;

  return (
    <section
      data-block="featured-products"
      {...storyblokEditable(blok as never)}
      {...harnessProps}
      className={`${bg(blok.background ?? "panel-strong")} ${space(blok.spacing_top, "top")} ${space(blok.spacing_bottom, "bottom")}${harnessTheme ? " font-sans text-text" : ""}`}
    >
      <div className={container("contained")}>
        {products.length > 0 &&
          (useRail ? (
            <ProductRail
              products={products}
              variant={variant}
              headline={blok.headline}
              lang={lang}
              vatNote={ctx.shop.vatNote}
            />
          ) : (
            <div className="mx-auto w-full max-w-[1146px]">
              {blok.headline && <h2 className="mb-[72px] text-[21px] leading-[31px] font-[600] text-text">{blok.headline}</h2>}
              <ul className="flex flex-wrap gap-6">
                {products.map((p) => (
                  <li key={p.uuid} className={`flex ${tileW}`}>
                    <ProductTile product={p} variant={variant} size="rail" lang={lang} vatNote={ctx.shop.vatNote} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        {products.length === 0 && blok.headline && (
          <h2 className="text-[21px] leading-[31px] font-[600] text-text">{blok.headline}</h2>
        )}
        {cta && (
          <div className="mt-12 flex justify-center">
            <Button blok={cta as never} />
          </div>
        )}
      </div>
    </section>
  );
}

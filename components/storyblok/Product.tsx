import type { CSSProperties } from "react";
import {
  storyblokEditable,
  StoryblokServerComponent,
  StoryblokServerRichText,
} from "@storyblok/react/rsc";
import { container } from "@/lib/tokens";
import { BRAND_DEFAULTS, themeStyle } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { ProductGalleryClient } from "@/components/interactive/ProductGalleryClient";
import { ProductOptionsClient } from "@/components/interactive/ProductOptionsClient";
import { AddToCartClient } from "@/components/interactive/AddToCartClient";
import { ProductRail } from "@/components/products/ProductRail";
import { fetchProductsByRefs, getProductContext, normalizeProductRefs } from "@/lib/products";
import {
  hasRichText,
  tileVariantFor,
  toTileData,
  type ProductAsset,
  type ProductStory,
} from "@/lib/product-tile";
import { formatPrice, productLabels } from "@/lib/product-i18n";
// Known atoms rendered directly (typed, no map lookup); body sections + links go through the map.
import ProductVariant from "./ProductVariant";
import ProductProperty from "./ProductProperty";
import AccordionItem from "./AccordionItem";
import Button from "./Button";

interface ChildBlok {
  _uid: string;
  component: string;
  [key: string]: unknown;
}
interface SpecBlok extends ChildBlok {
  label?: string;
  value?: string;
}
interface VariantBlok extends ChildBlok {
  specs?: SpecBlok[];
}

interface ProductBlok {
  _uid: string;
  component: string;
  name?: string;
  eyebrow?: string;
  tagline?: string;
  article_number?: string;
  gallery?: ProductAsset[];
  intro?: unknown;
  links?: ChildBlok[];
  features?: unknown;
  properties?: ChildBlok[];
  price?: number | string;
  variants?: VariantBlok[];
  variant_count?: number | string;
  details?: ChildBlok[];
  body?: ChildBlok[];
  related_headline?: string;
  related_products?: unknown;
  /** harness/fixture-only: render under this brand's theme + site-config (never a schema field) */
  _brand?: string;
  /** harness/fixture-only: related product stories used instead of the live fetch (never a schema field) */
  _related?: ProductStory[];
}

const toNum = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/** "Verfügbare Optionen": the first 4 spec labels of variant #1 → distinct values across all variants. */
function deriveOptions(variants: VariantBlok[]): { label: string; values: string[] }[] {
  const labels = (variants[0]?.specs ?? []).slice(0, 4).map((s) => s.label).filter((l): l is string => !!l);
  const collator = new Intl.Collator("de", { numeric: true });
  return labels
    .map((label) => {
      const set = new Set<string>();
      for (const v of variants) {
        const val = v.specs?.find((s) => s.label === label)?.value?.trim();
        if (val) set.add(val);
      }
      return { label, values: [...set].sort(collator.compare) };
    })
    .filter((g) => g.values.length > 0);
}

const rtProse =
  "[&_p]:m-0 [&_p+p]:mt-[18px] [&_a]:underline [&_strong]:font-[600] [&_ul]:list-[square] [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6";

/**
 * product — content type: one product (family) = its own detail page, shared by both brands.
 * Page order: head → variants (#varianten) → details accordion → body sections → related rail.
 * The head layout follows the brand THEME PRESET (site-config theme_preset → data-brand):
 *  - family (fischer): tagline 21/31 600 primary (mb 9) above a 678 | 678 grid (24px gap): left = H1
 *    42/52 600 (mb 24), text links (gap 12×48, pb 24, 1px panel-strong rule), gallery (my 54), intro
 *    18/28 300; right = panel (p 24): "Verfügbare Optionen" 21/31 600 + option groups (gap 48) derived
 *    from the variants + solid primary CTA "Varianten anzeigen (N)" (mt 42) → #varianten.
 *  - shop (fischertechnik): 12-col grid; left 6 cols = gallery (534 wide, mx 72, thumbs + dots);
 *    right 6 cols = "Art.-Nr." 18/28 600 secondary, tagline 21/31 600 primary, H1 (mb 36), links (pb 18
 *    + rule), "Top Features" chip (secondary) + square-bullet list 16/26 300, "Eigenschaften" chip
 *    (primary) + product-property row, price 24/34 600 primary + VAT note + demo cart + shipping info.
 * Parts render only when filled. Root is a <div> (the Layout owns <main>).
 */
export default async function Product({ blok }: { blok: ProductBlok }) {
  // Register the SDK component map for nested StoryblokServerComponent children (harness route).
  await import("@/lib/storyblok");

  const harnessTheme = blok._brand && BRAND_DEFAULTS[blok._brand] ? BRAND_DEFAULTS[blok._brand] : null;
  const ctx = await getProductContext(harnessTheme ? blok._brand : null);
  const preset = harnessTheme ? harnessTheme.preset : ctx.preset;
  const look = tileVariantFor(preset); // family | shop
  const lang = ctx.lang;
  const l = productLabels(lang);

  const gallery = (blok.gallery ?? []).filter((a): a is { filename: string; alt?: string } => !!a?.filename);
  const links = blok.links ?? [];
  const variants = blok.variants ?? [];
  const variantCount = toNum(blok.variant_count) ?? variants.length;
  const details = blok.details ?? [];
  const body = blok.body ?? [];
  const properties = blok.properties ?? [];
  const price = formatPrice(blok.price, lang);

  // Related rail: picker value → refs → live fetch (current brand only) → tiles.
  const relatedStories: ProductStory[] = blok._related
    ? blok._related
    : await fetchProductsByRefs(normalizeProductRefs(blok.related_products), { lang, brand: ctx.brand });
  const related = relatedStories.map(toTileData);

  const harnessProps = harnessTheme
    ? {
        "data-brand": harnessTheme.preset,
        "data-button": harnessTheme.button,
        style: themeStyle(harnessTheme) as CSSProperties,
      }
    : {};

  const linkRow = (cls: string) =>
    links.length > 0 && (
      <div className={cls}>
        {links.map((b) => (
          <Button blok={b as never} key={b._uid} />
        ))}
      </div>
    );

  const galleryEl = (
    <ProductGalleryClient
      images={gallery}
      look={look}
      zoomLabel={look === "shop" ? l.larger_view : l.zoom}
      prevLabel={l.prev}
      nextLabel={l.next}
      goToLabel={l.go_to}
    />
  );

  const familyHead = (
    <div className="pt-6">
      {blok.tagline && (
        <p className="mb-[9px] text-[21px] leading-[31px] font-[600] text-primary">{blok.tagline}</p>
      )}
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 lg:grid-cols-2">
        <div>
          <h1 className="mb-6 text-[32px] leading-[42px] font-[600] text-text md:text-[42px] md:leading-[52px]">
            {blok.name}
          </h1>
          {linkRow("flex flex-wrap gap-x-12 gap-y-3 border-b border-panel-strong pb-6")}
          {gallery.length > 0 && <div className="my-[54px]">{galleryEl}</div>}
          {hasRichText(blok.intro) && (
            <StoryblokServerRichText
              document={blok.intro as never}
              className={`mb-[30px] text-[18px] leading-[28px] font-light text-text ${rtProse}`}
            />
          )}
        </div>
        {(variants.length > 0 || variantCount > 0) && (
          <div className="bg-panel p-6">
            {variants.length > 0 && (
              <>
                <p className="mb-6 text-[21px] leading-[31px] font-[600] text-text">{l.available_options}</p>
                <div className="flex flex-col gap-12">
                  {deriveOptions(variants).map((g) => (
                    <ProductOptionsClient
                      key={g.label}
                      label={g.label}
                      values={g.values}
                      moreLabel={l.show_more}
                      lessLabel={l.show_less}
                    />
                  ))}
                </div>
              </>
            )}
            <a
              href="#varianten"
              className="mt-[42px] inline-block rounded-none border-2 border-transparent bg-primary px-9 py-[17px] text-[18px] leading-[22px] font-[600] text-white transition-colors hover:bg-text"
            >
              {l.show_variants} ({variantCount})
            </a>
          </div>
        )}
      </div>
    </div>
  );

  const shop = ctx.shop;
  const shopHead = (
    <div className="pt-9">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          {gallery.length > 0 && <div className="lg:mx-[72px]">{galleryEl}</div>}
        </div>
        <div className="lg:col-span-6">
          {blok.article_number && (
            <p className="mb-1.5 text-[18px] leading-[28px] font-[600] text-secondary">
              {l.art_nr} {blok.article_number}
            </p>
          )}
          {blok.tagline && (
            <p className="my-3 text-[21px] leading-[31px] font-[600] text-primary">{blok.tagline}</p>
          )}
          <h1 className="mb-9 text-[32px] leading-[42px] font-[600] text-text md:text-[42px] md:leading-[52px]">
            {blok.name}
          </h1>
          {linkRow("flex flex-wrap gap-x-12 gap-y-3 border-b border-panel-strong pb-[18px] [&>*]:mb-3")}
          <div className="max-w-[561px]">
            {hasRichText(blok.features) && (
              <div className="mt-[42px]">
                <p className="mb-6 inline-block bg-secondary px-1.5 text-[16px] leading-[26px] font-light text-white">
                  {l.top_features}
                </p>
                <StoryblokServerRichText
                  document={blok.features as never}
                  className="text-[16px] leading-[26px] font-light text-black [&_li]:mb-3 [&_li]:pl-1.5 [&_li:last-child]:mb-0 [&_li_p]:m-0 [&_ul]:list-[square] [&_ul]:pl-6"
                />
              </div>
            )}
            {properties.length > 0 && (
              <div className="mt-12">
                <p className="mb-6 inline-block bg-primary px-1.5 text-[16px] leading-[26px] font-light text-white">
                  {l.properties}
                </p>
                <div className="flex flex-wrap gap-x-9 gap-y-6">
                  {properties.map((p) => (
                    <ProductProperty blok={p} key={p._uid} />
                  ))}
                </div>
              </div>
            )}
            {price && (
              <div className="mt-[72px]">
                <p className="mb-1.5 text-[24px] leading-[34px] font-[600] text-primary">{price}</p>
                <p className="mb-3 text-[14px] leading-6 font-light text-secondary">{shop.vatNote || l.vat_note}</p>
                <AddToCartClient label={shop.cartLabel || l.cart_label} toast={shop.cartToast || l.cart_toast} />
                {hasRichText(shop.shippingInfo) && (
                  <StoryblokServerRichText
                    document={shop.shippingInfo as never}
                    className="mt-6 text-[16px] leading-[22px] font-light text-secondary [&_li]:mb-[18px] [&_li]:pl-2 [&_li]:marker:text-[12px] [&_li]:marker:text-secondary [&_li_p]:m-0 [&_p]:m-0 [&_ul]:list-[square] [&_ul]:pl-[9px]"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Variants table (fischer family page): static filter bars + column header labels from the specs.
  const columnLabels = (variants[0]?.specs ?? []).slice(0, 4).map((s) => s.label ?? "");
  const variantsSection = variants.length > 0 && (
    <section id="varianten" className={`${container("contained")} mt-[72px] scroll-mt-24`}>
      <h2 className="mb-9 text-[21px] leading-[31px] font-[600] text-text">{l.product_variants}</h2>
      <div className="mb-6 grid grid-cols-2 gap-6 lg:grid-cols-4" aria-hidden="true">
        {columnLabels.map((c, k) => (
          <div
            key={k}
            className="flex h-[60px] items-center justify-between border-b-2 border-muted bg-panel px-3 text-[16px] leading-[22px] font-[600] text-text"
          >
            <span className="truncate">{c}</span>
            <Icon name="chevron-down" strokeWidth={1.5} className="h-5 w-5 shrink-0" />
          </div>
        ))}
      </div>
      <p className="mb-[60px] inline-flex items-center gap-3 text-[16px] leading-6 font-light text-text" aria-hidden="true">
        {l.all_filters}
        <Icon name="chevron-down" strokeWidth={1.5} className="h-4 w-4" />
      </p>
      <div className="hidden grid-cols-[90px_minmax(0,1.4fr)_repeat(4,minmax(0,1fr))_30px] gap-x-6 px-[42px] pb-3 text-[14px] leading-6 font-light text-secondary md:grid">
        <span className="col-span-2">
          {variantCount} {l.product_variants}
        </span>
        {columnLabels.map((c, k) => (
          <span key={k}>{c}</span>
        ))}
      </div>
      <div className="flex flex-col gap-[18px]">
        {variants.map((v) => (
          <ProductVariant blok={v as never} key={v._uid} />
        ))}
      </div>
    </section>
  );

  const detailsSection = details.length > 0 && (
    <section className={`${container("contained")} ${look === "shop" ? "" : "mt-[96px]"}`}>
      <div className="mx-auto max-w-[1194px]">
        {details.map((d) => (
          <AccordionItem blok={d} key={d._uid} />
        ))}
      </div>
    </section>
  );

  return (
    <div
      data-block="product"
      {...storyblokEditable(blok as never)}
      {...harnessProps}
      className={harnessTheme ? "font-sans text-text" : undefined}
    >
      <section className={`${container("contained")} ${look === "shop" ? "pb-30" : "pb-0"}`}>
        {look === "shop" ? shopHead : familyHead}
      </section>
      {variantsSection}
      {detailsSection}
      {body.length > 0 && (
        <div className="mt-[96px]">
          {body.map((b) => (
            <StoryblokServerComponent blok={b} key={b._uid} />
          ))}
        </div>
      )}
      {related.length > 0 && (
        <section className="mt-[96px] bg-panel-strong pt-[72px] pb-24">
          <div className={container("contained")}>
            <ProductRail
              products={related}
              variant={look}
              headline={blok.related_headline}
              lang={lang}
              vatNote={shop.vatNote}
            />
          </div>
        </section>
      )}
    </div>
  );
}

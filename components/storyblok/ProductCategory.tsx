import type { CSSProperties } from "react";
import { akeneoTiles } from "@/lib/akeneo";
import { storyblokEditable, StoryblokServerRichText } from "@storyblok/react/rsc";
import { container } from "@/lib/tokens";
import { BRAND_DEFAULTS, themeStyle } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { SbLink, type SbLinkValue } from "@/lib/link";
import { ProductRail } from "@/components/products/ProductRail";
import { ProductListingClient, type FacetConfig } from "@/components/interactive/ProductListingClient";
import {
  datasourceValues,
  fetchProductsByRefs,
  fetchProductsInFolder,
  getProductContext,
  materialLabels,
  normalizeProductRefs,
} from "@/lib/products";
import { hasRichText, tileVariantFor, toTileData, type ProductStory, type ProductTileData } from "@/lib/product-tile";
import { productLabels } from "@/lib/product-i18n";
import { loadPageFromHeaders } from "@/lib/page-story";

interface NavLinkBlok {
  _uid: string;
  component: string;
  label?: string;
  link?: SbLinkValue;
  image?: { filename?: string; alt?: string };
}

interface FacetFilterBlok {
  _uid: string;
  component: string;
  facet?: string;
  label?: string;
  open?: boolean;
}

interface ProductCategoryBlok {
  _uid: string;
  component: string;
  headline?: string;
  intro?: unknown;
  result_label?: string;
  subcategories?: NavLinkBlok[];
  filter_layout?: string;
  facets?: FacetFilterBlok[];
  highlights_headline?: string;
  highlighted_products?: unknown;
  /** Akeneo PIM picks (field plugin sb-akeneo) — appended to the recommendations rail */
  akeneo_products?: unknown;
  /** harness/fixture-only: render under this brand's theme + site-config (never a schema field) */
  _brand?: string;
  /** harness/fixture-only: the category's product stories instead of the live folder fetch */
  _products?: ProductStory[];
  /** harness/fixture-only: highlighted product stories instead of the live picker fetch */
  _highlights?: ProductStory[];
}

/**
 * Category folder of the current story (language folder included — folder-level translation):
 * startpage `en/a/b/` → `en/a/b`; a non-startpage → its parent.
 */
function folderOf(fullSlug: string): string {
  const s = fullSlug.replace(/^\/+/, "");
  if (s.endsWith("/")) return s.replace(/\/+$/, "");
  return s.split("/").slice(0, -1).join("/");
}

/** Facet keys that filter live (mirrors ProductListingClient; client-module values are not importable here). */
const INTERACTIVE_FACETS = ["material", "drill_diameter", "age_from"];

const numSort = (a: string, b: string) => parseFloat(a) - parseFloat(b) || a.localeCompare(b);

/**
 * product-category — content type: startpage of a category folder. Lists EVERY `product` story of
 * its folder (live, current locale), with editor-configured facets (live client filtering) and an
 * optional highlights rail. Layout by `filter_layout`:
 *  - sidebar (fischer): H1 48/58 600 centred (pb 60) → 210px sidebar ("Kategorien" box: header 48
 *    bg secondary white 16/26 600 pl 18, links 14/24 600 p 12 + 1px panel-strong rule + chevron) +
 *    "Filter" box, beside the result column (count line + 5 × 210 family tiles, gap 24).
 *  - top-bar (fischertechnik): H1 → facet bar (radio chips) → "Kategorien" 16/26 600 + image chips
 *    (257 wide, 5/row, image 145 tall + label 16/26 600 p 24 on panel) → full-bleed panel band with
 *    count line + 5-col shop tile grid.
 * Root is a <div> (the Layout owns <main>).
 */
export default async function ProductCategory({ blok }: { blok: ProductCategoryBlok }) {
  const harnessTheme = blok._brand && BRAND_DEFAULTS[blok._brand] ? BRAND_DEFAULTS[blok._brand] : null;
  const ctx = await getProductContext(harnessTheme ? blok._brand : null);
  const preset = harnessTheme ? harnessTheme.preset : ctx.preset;
  const variant = tileVariantFor(preset);
  const lang = ctx.lang;
  const l = productLabels(lang);
  const layout: "sidebar" | "top-bar" = blok.filter_layout === "top-bar" ? "top-bar" : "sidebar";

  // Products of this category folder (live) — or the harness fixture.
  let stories: ProductStory[] = blok._products ?? [];
  if (!blok._products) {
    const page = await loadPageFromHeaders();
    const fullSlug = page?.story?.full_slug;
    if (fullSlug) {
      const folder = folderOf(fullSlug);
      if (folder) stories = await fetchProductsInFolder(folder);
    }
  }
  const products: ProductTileData[] = stories.map(toTileData);

  const hasPicks = Array.isArray(blok.highlighted_products)
    ? blok.highlighted_products.length > 0
    : !!blok.highlighted_products;
  const highlightStories: ProductStory[] = blok._highlights
    ? blok._highlights
    : hasPicks
      ? await fetchProductsByRefs(normalizeProductRefs(blok.highlighted_products), { lang, brand: ctx.brand })
      : [];
  // Storyblok picks first, then the Akeneo PIM picks (lib/akeneo.ts) in the same rail.
  const highlights = [...highlightStories.map(toTileData), ...akeneoTiles(blok.akeneo_products, lang)];

  // Facet config → option lists (datasource order; fallback = values present on the products).
  const facetBloks = (blok.facets ?? []).filter((f) => f.facet);
  const needs = new Set(facetBloks.map((f) => f.facet));
  const [materials, drills, ages] = await Promise.all([
    needs.has("material") ? materialLabels(lang) : Promise.resolve({} as Record<string, string>),
    needs.has("drill_diameter") ? datasourceValues("drill-diameters") : Promise.resolve([] as string[]),
    needs.has("age_from") ? datasourceValues("age-from") : Promise.resolve([] as string[]),
  ]);
  const present = (pick: (p: ProductTileData) => string[]) =>
    [...new Set(products.flatMap(pick).filter(Boolean))].sort(numSort);

  const facets: FacetConfig[] = facetBloks.map((f) => {
    const key = f.facet as string;
    let options: { value: string; label: string }[] = [];
    if (INTERACTIVE_FACETS.includes(key)) {
      if (key === "material") {
        const values = Object.keys(materials).length ? Object.keys(materials) : present((p) => [p.material]);
        options = values
          .map((v) => ({ value: v, label: materials[v] ?? v }))
          .sort((a, b) => a.label.localeCompare(b.label, lang));
      } else if (key === "drill_diameter") {
        options = (drills.length ? [...drills].sort(numSort) : present((p) => p.drillDiameters)).map((v) => ({ value: v, label: `${v} mm` }));
      } else {
        options = (ages.length ? [...ages].sort(numSort) : present((p) => [p.ageFrom])).map((v) => ({ value: v, label: `${v} ${l.years}` }));
      }
    }
    return {
      uid: f._uid,
      facet: key,
      label: f.label ?? "",
      open: !!f.open,
      options,
      editable: storyblokEditable(f as never) as Record<string, string>,
    };
  });

  const subs = blok.subcategories ?? [];
  const categoriesNode =
    subs.length === 0 ? null : layout === "sidebar" ? (
      <nav aria-label={l.categories} className="mb-6 bg-white">
        <div className="flex min-h-[48px] items-center bg-secondary pl-[18px] text-[16px] leading-[26px] font-[600] text-white">
          {l.categories}
        </div>
        <ul className="mt-4">
          {subs.map((s) => (
            <li {...storyblokEditable(s as never)} key={s._uid} data-block="nav-link">
              <SbLink
                link={s.link}
                className="flex items-center justify-between gap-2 border-b border-panel-strong p-3 pr-0 text-[14px] leading-6 font-[600] text-text hover:text-primary"
              >
                <span>{s.label}</span>
                <Icon name="chevron-down" strokeWidth={1.25} className="h-[30px] w-[30px] shrink-0 -rotate-90" />
              </SbLink>
            </li>
          ))}
        </ul>
      </nav>
    ) : (
      <nav aria-label={l.categories} className="mt-[18px]">
        <p className="mb-6 text-[16px] leading-[26px] font-[600] text-text">{l.categories}</p>
        <ul className="-mx-3 flex flex-wrap">
          {subs.map((s) => (
            <li
              {...storyblokEditable(s as never)}
              key={s._uid}
              data-block="nav-link"
              className="mx-3 mb-6 w-[calc(50%-24px)] md:w-[calc(33.333%-24px)] lg:w-[calc(20%-24px)]"
            >
              <SbLink link={s.link} className="group flex h-full flex-col bg-panel text-text">
                {s.image?.filename && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image.filename}
                    alt={s.image.alt ?? ""}
                    loading="lazy"
                    className="aspect-[257/145] w-full object-cover"
                  />
                )}
                <span className="flex flex-1 items-center justify-between">
                  <span className="py-6 pl-6 text-[16px] leading-[26px] font-[600] group-hover:underline">{s.label}</span>
                  <svg viewBox="0 0 44 44" className="mr-3 h-11 w-11 shrink-0" aria-hidden="true">
                    <circle cx="22" cy="22" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              </SbLink>
            </li>
          ))}
        </ul>
      </nav>
    );

  const highlightsNode =
    highlights.length > 0 ? (
      <div className={layout === "sidebar" ? "mb-12" : "mb-20"}>
        <ProductRail
          products={highlights}
          variant={variant}
          headline={blok.highlights_headline || undefined}
          lang={lang}
          vatNote={ctx.shop.vatNote}
        />
      </div>
    ) : null;

  const harnessProps = harnessTheme
    ? {
        "data-brand": harnessTheme.preset,
        "data-button": harnessTheme.button,
        style: themeStyle(harnessTheme) as CSSProperties,
      }
    : {};

  return (
    <div
      data-block="product-category"
      data-filter-layout={layout}
      {...storyblokEditable(blok as never)}
      {...harnessProps}
      className="bg-white pb-[120px] text-text"
    >
      <div className={container("contained")}>
        <h1 className="pb-10 text-center text-[32px] leading-[42px] font-[600] md:pb-[60px] md:text-[48px] md:leading-[58px]">
          {blok.headline}
        </h1>
        {hasRichText(blok.intro) && (
          <StoryblokServerRichText
            document={blok.intro as never}
            className="mx-auto -mt-6 mb-[60px] max-w-[678px] text-center text-[18px] leading-[28px] font-light [&_a]:underline [&_p+p]:mt-[18px] [&_strong]:font-[600]"
          />
        )}
        <ProductListingClient
          layout={layout}
          products={products}
          facets={facets}
          resultLabel={blok.result_label || "{count}"}
          variant={variant}
          lang={lang}
          vatNote={ctx.shop.vatNote}
          labels={{ filter: l.filter, noResults: l.no_results, showMore: l.show_more, showLess: l.show_less }}
          categories={categoriesNode}
          highlights={highlightsNode}
        />
      </div>
    </div>
  );
}

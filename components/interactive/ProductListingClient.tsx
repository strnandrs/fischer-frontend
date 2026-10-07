"use client";
import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { ProductGrid } from "@/components/products/ProductGrid";
import type { ProductTileData, TileVariant } from "@/lib/product-tile";

/** Facet keys that map to product fields and filter live; every other key renders as a static header. */
const INTERACTIVE_FACETS = ["material", "drill_diameter", "age_from"] as const;
type FacetKey = (typeof INTERACTIVE_FACETS)[number];

export interface FacetConfig {
  uid: string;
  facet: string;
  label: string;
  open: boolean;
  /** ordered option values + display labels (empty for static facets) */
  options: { value: string; label: string }[];
  /** storyblokEditable(blok) attributes of the facet-filter atom */
  editable?: Record<string, string>;
}

export interface ListingLabels {
  filter: string;
  noResults: string;
  showMore: string;
  showLess: string;
}

function productValues(p: ProductTileData, facet: string): string[] {
  switch (facet as FacetKey) {
    case "material":
      return p.material ? [p.material] : [];
    case "drill_diameter":
      return p.drillDiameters;
    case "age_from":
      return p.ageFrom ? [p.ageFrom] : [];
    default:
      return [];
  }
}

const isInteractive = (f: string): f is FacetKey => (INTERACTIVE_FACETS as readonly string[]).includes(f);

/** AND across facets, OR within a facet; `skip` = facet to ignore (for that facet's own counts). */
function matches(p: ProductTileData, sel: Record<string, string[]>, skip?: string): boolean {
  for (const [facet, values] of Object.entries(sel)) {
    if (facet === skip || values.length === 0) continue;
    const pv = productValues(p, facet);
    if (!values.some((v) => pv.includes(v))) return false;
  }
  return true;
}

function fillLabel(template: string, count: number, variants: number): string {
  return template.replace(/\{count\}/g, String(count)).replace(/\{variants\}/g, String(variants));
}

/**
 * Category listing (client): filter state, live counts, result label and the tile grid.
 *  - sidebar (fischer): left 210px column = `categories` node + "Filter" box (header bg secondary,
 *    white 16/26 600, 48px, pl 18) with facet accordions (checkboxes 20px, "label (n)", first 6 +
 *    "mehr anzeigen"); right column = highlights + count line 16/22 300 (mb 6) + 5 × 210 family grid.
 *  - top-bar (fischertechnik): facet rows (label 16/26 600 mb 24; radio chips 44px bg panel pl 18,
 *    16/26 600, mr/mb 18; single-select, re-click clears, no counts) → `categories` node → full-bleed
 *    panel band (mt 70, py 80, px 18) with highlights + count line + 5-col shop grid (p 12, gap 24).
 * Static facets (no product field) render as collapsed headers with a chevron.
 */
export function ProductListingClient({
  layout,
  products,
  facets,
  resultLabel,
  variant,
  lang,
  vatNote,
  labels,
  categories,
  highlights,
}: {
  layout: "sidebar" | "top-bar";
  products: ProductTileData[];
  facets: FacetConfig[];
  resultLabel: string;
  variant: TileVariant;
  lang?: string;
  vatNote?: string;
  labels: ListingLabels;
  categories?: ReactNode;
  highlights?: ReactNode;
}) {
  const [sel, setSel] = useState<Record<string, string[]>>({});
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(facets.map((f) => [f.uid, f.open]))
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const visible = useMemo(() => products.filter((p) => matches(p, sel)), [products, sel]);
  const variantSum = visible.reduce((n, p) => n + (p.variantCount || 0), 0);
  const label = fillLabel(resultLabel, visible.length, variantSum);

  const countFor = (facet: string, value: string) =>
    products.filter((p) => matches(p, sel, facet) && productValues(p, facet).includes(value)).length;

  const toggle = (facet: string, value: string, single: boolean) =>
    setSel((s) => {
      const cur = s[facet] ?? [];
      const has = cur.includes(value);
      const next = single ? (has ? [] : [value]) : has ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...s, [facet]: next };
    });

  const results = (
    <>
      {highlights && <div>{highlights}</div>}
      <p data-result-count className="mb-1.5 min-h-[22px] text-[16px] leading-[22px] font-light text-text" aria-live="polite">
        {label}
      </p>
      {visible.length > 0 ? (
        <ProductGrid
          products={visible}
          variant={variant}
          lang={lang}
          vatNote={vatNote}
          className={layout === "sidebar" ? "mt-6" : "p-3"}
        />
      ) : (
        <p className="py-12 text-[16px] leading-[26px] font-light text-text">{labels.noResults}</p>
      )}
    </>
  );

  if (layout === "top-bar") {
    return (
      <>
        {facets.length > 0 && (
          <div className="flex flex-col gap-6 py-6">
            {facets.map((f) => (
              <div key={f.uid} data-block="facet-filter" data-facet={f.facet} {...f.editable}>
                <p className="mb-6 text-[16px] leading-[26px] font-[600] text-text">{f.label}</p>
                {isInteractive(f.facet) && (
                  <div role="radiogroup" aria-label={f.label} className="flex flex-wrap">
                    {f.options.map((o) => {
                      const checked = (sel[f.facet] ?? []).includes(o.value);
                      return (
                        <button
                          key={o.value}
                          type="button"
                          role="radio"
                          aria-checked={checked}
                          onClick={() => toggle(f.facet, o.value, true)}
                          className="mr-[18px] mb-[18px] inline-flex min-h-[44px] items-center bg-panel pl-[18px] text-[16px] leading-[26px] font-[600] text-text"
                        >
                          {o.label}
                          <svg viewBox="0 0 44 44" className="h-11 w-11 shrink-0" aria-hidden="true">
                            <circle cx="22" cy="22" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            {checked && <circle cx="22" cy="22" r="5.5" fill="currentColor" />}
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {categories && <div>{categories}</div>}
        <div className="relative -mx-[30px] mt-[70px] bg-panel px-[18px] py-20">{results}</div>
      </>
    );
  }

  // sidebar
  return (
    <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="mb-6 lg:mb-0 lg:pt-[52px]">
        {categories && <div>{categories}</div>}
        {facets.length > 0 && (
          <div className="mb-6 bg-white">
            <div className="flex min-h-[48px] items-center bg-secondary pl-[18px] text-[16px] leading-[26px] font-[600] text-white">
              {labels.filter}
            </div>
            <div className="mt-4 flex flex-col">
              {facets.map((f) => {
                const isOpen = !!open[f.uid] && isInteractive(f.facet);
                const showAll = !!expanded[f.uid];
                const opts = showAll ? f.options : f.options.slice(0, 6);
                return (
                  <div
                    key={f.uid}
                    data-block="facet-filter"
                    data-facet={f.facet}
                    {...f.editable}
                    className="border-b border-panel-strong"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => isInteractive(f.facet) && setOpen((o) => ({ ...o, [f.uid]: !o[f.uid] }))}
                      className="flex min-h-[48px] w-full items-center justify-between gap-2 py-3 pl-3 text-left text-[14px] leading-6 font-[600] text-text"
                    >
                      <span>{f.label}</span>
                      <Icon
                        name="chevron-down"
                        strokeWidth={1.25}
                        className={`h-[30px] w-[30px] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pb-3">
                        <ul>
                          {opts.map((o) => {
                            const n = countFor(f.facet, o.value);
                            const checked = (sel[f.facet] ?? []).includes(o.value);
                            const disabled = n === 0 && !checked;
                            return (
                              <li key={o.value}>
                                <label
                                  className={`flex items-start gap-3 py-3 pl-3 text-[14px] leading-6 font-light text-text ${
                                    disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={() => toggle(f.facet, o.value, false)}
                                  />
                                  <span
                                    aria-hidden="true"
                                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-text peer-focus-visible:outline-2 peer-focus-visible:outline-primary ${
                                      checked ? "bg-text" : "bg-white"
                                    }`}
                                  >
                                    {checked && (
                                      <svg viewBox="0 0 20 20" className="h-4 w-4 text-white">
                                        <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="min-w-0 [overflow-wrap:anywhere]">
                                    {o.label}&nbsp; ({n})
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                        {f.options.length > 6 && (
                          <button
                            type="button"
                            aria-expanded={showAll}
                            onClick={() => setExpanded((e) => ({ ...e, [f.uid]: !e[f.uid] }))}
                            className="ml-3 inline-flex items-center gap-1 text-[14px] leading-6 font-light text-primary"
                          >
                            {showAll ? labels.showLess : labels.showMore}
                            <Icon
                              name="chevron-down"
                              strokeWidth={1.5}
                              className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>
      <div className="min-w-0">{results}</div>
    </div>
  );
}

export default ProductListingClient;

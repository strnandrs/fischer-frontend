// Token maps: datasource value -> Tailwind classes. MEASURED GEOMETRY authored by the orchestrator
// from ~/forge-sites/fischer/{fischer-at,fischertechnik-de}/design-tokens.json (@1440).
// Brand-agnostic by construction: colors resolve through the semantic CSS variables set from the
// brand's site-config (bg-primary, bg-panel, text-text, …) and the type scale through the per-brand
// --fs-*/--lh-* variables in app/globals.css (<html data-brand>). Both brands share the Sitecore
// `*-fi` geometry: 0px radius everywhere, 1380px content (1920 max, 30px gutters), 12-col / 24px gap,
// vertical rhythm from 96/120px spacers (here: section padding in the section's own background).

const pick = <T extends Record<string, string>>(m: T, k: string | undefined, fallback: keyof T): string =>
  (k && m[k]) || m[fallback as string];

/** background-colors — the section band (spacing padding sits inside it, like the bg-matched dividers) */
export const bgMap = {
  white: "bg-white",
  panel: "bg-panel",
  "panel-strong": "bg-panel-strong",
  primary: "bg-primary text-inverse",
  dark: "bg-dark text-inverse",
} as const;
export const bg = (v?: string) => pick(bgMap, v, "white");

/** text-colors */
export const textMap = {
  default: "text-text",
  inverse: "text-inverse",
} as const;
export const text = (v?: string) => pick(textMap, v, "default");

/** layout-columns — 12-col grid, 24px gap; 3 cols → 444px tiles, 4 cols → 327px, 5 cols → 210px category tiles */
export const gridColsMap = {
  "2": "grid grid-cols-1 gap-6 md:grid-cols-2",
  "3": "grid grid-cols-1 gap-6 md:grid-cols-3",
  "4": "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
  "5": "grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5",
} as const;
export const gridCols = (v?: string) => pick(gridColsMap, v, "3");

/**
 * button-styles. `primary` = the brand's button (site-config button_style → <html data-button>):
 *  outline (fischer): transparent, 2px solid text color, hover filled text color + inverse text
 *  solid (fischertechnik): primary fill, 2px transparent border, white text
 * Both: 0px radius, padding 5px 18px, min-height 42px, 600 16px/28px, 0.3s background transition.
 * `arrow` = bare 24px right-arrow link (the tile/banner itself is the link).
 * `secondary` = always the outline look (2px text color, transparent; hover filled) on both brands.
 * `text-link` = label 18/28 600 + trailing arrow, no box (PDP "Zum e-Learning").
 */
export const buttonMap = {
  primary:
    "inline-flex min-h-[42px] items-center justify-center rounded-none border-2 px-[18px] py-[5px] " +
    "font-[600] text-[16px] leading-[28px] transition-colors duration-300 " +
    "[[data-button=outline]_&]:border-text [[data-button=outline]_&]:bg-transparent [[data-button=outline]_&]:text-text " +
    "[[data-button=outline]_&]:hover:bg-text [[data-button=outline]_&]:hover:text-inverse " +
    "[[data-button=solid]_&]:border-transparent [[data-button=solid]_&]:bg-primary [[data-button=solid]_&]:text-inverse " +
    "[[data-button=solid]_&]:hover:bg-secondary",
  arrow: "inline-flex h-6 w-6 items-center justify-center text-current",
  secondary:
    "inline-flex min-h-[42px] items-center justify-center rounded-none border-2 border-text bg-transparent px-[18px] py-[5px] " +
    "font-[600] text-[16px] leading-[28px] text-text transition-colors duration-300 hover:bg-text hover:text-inverse",
  "text-link": "inline-flex items-center gap-2 font-[600] text-[18px] leading-[28px] text-text hover:underline underline-offset-4",
} as const;
export const button = (v?: string) => pick(buttonMap, v, "primary");

/**
 * spacing-scale — section padding (in the section's background): none 0 / md 96px / lg 120px.
 * Classes are spelled out literally (Tailwind only generates classes it can see in source).
 */
const spaceMap = {
  top: { none: "pt-0", md: "pt-24", lg: "pt-30" },
  bottom: { none: "pb-0", md: "pb-24", lg: "pb-30" },
  y: { none: "py-0", md: "py-24", lg: "py-30" },
} as const;
export const space = (v?: string, side: "top" | "bottom" | "y" = "y") => {
  const m = spaceMap[side];
  return m[(v ?? "none") as keyof typeof m] ?? m.none;
};

/** fonts — the family itself comes from --font-brand (layout); kept for completeness */
export const fontMap = {
  archivo: "font-sans",
  montserrat: "font-sans",
} as const;
export const font = (v?: string) => pick(fontMap, v, "archivo");

/** content-align */
export const alignMap = {
  left: "text-left items-start",
  center: "text-center items-center",
  right: "text-right items-end",
} as const;
export const align = (v?: string) => pick(alignMap, v, "left");

/**
 * composition: container. contained = 1920 max + 30px gutters (→ 1380px content @1440);
 * narrow = the centred text column (fischer text band 912px); icons = the centred icon-tile row
 * (3 × 390px slots = 1170px); full-bleed = edge to edge (hero, banners).
 */
export const containerMap = {
  contained: "mx-auto w-full max-w-[1920px] px-[30px]",
  narrow: "mx-auto w-full max-w-[972px] px-[30px]",
  icons: "mx-auto w-full max-w-[1230px] px-[30px]",
  "full-bleed": "w-full",
} as const;
export const container = (v?: string) => pick(containerMap, v, "contained");

/** Brand type scale (per-brand variables in app/globals.css) */
export const type = {
  hero: "font-[var(--fw-head)] text-[length:var(--fs-hero)] leading-[var(--lh-hero)]",
  heroSub: "font-[var(--fw-body)] text-[length:var(--fs-hero-sub)] leading-[var(--lh-hero-sub)]",
  h2: "font-[var(--fw-head)] text-[length:var(--fs-h2)] leading-[var(--lh-h2)]",
  h2Large: "font-[var(--fw-head)] text-[length:var(--fs-h2-lg)] leading-[var(--lh-h2-lg)]",
  eyebrow: "font-[var(--fw-head)] text-primary text-[length:var(--fs-eyebrow)] leading-[var(--lh-eyebrow)] mb-3",
  h3: "font-[var(--fw-head)] text-[length:var(--fs-h3)] leading-[var(--lh-h3)]",
  tile: "font-[var(--fw-head)] text-[length:var(--fs-tile)] leading-[var(--lh-tile)]",
  body: "font-[var(--fw-body)] text-[length:var(--fs-body)] leading-[var(--lh-body)]",
  bodyLarge: "font-[var(--fw-body)] text-[length:var(--fs-body-lg)] leading-[var(--lh-body-lg)]",
  groupHeadMargin: "mb-[var(--mb-group-head)]",
} as const;

/**
 * card-styles (all 0px radius, no border):
 *  product-teaser — white or panel tile: image 444×291, text block padding 30px, title → text 18px,
 *                   button 30px below; hover shadow 0 0 30px rgba(0,0,0,.1)
 *  image-link     — fischertechnik category tile: cut-out image on a colored block, title + arrow
 *  info           — panel (#F2F1EF / #EEF3F5) tile: icon/image, title, paragraph
 *  label-chip     — image with a white label box (padding 30px) overlapping bottom-left + arrow
 *  category-tile  — 210×328 white tile, 110px image, centred 21/31 600 label (product overview)
 *  image-square   — 444px square image + h3 + text (fischertechnik PDP teaser group)
 */
export const cardMap = {
  "product-teaser": "flex h-full flex-col rounded-none transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.1)]",
  "image-link": "group flex h-full flex-col rounded-none",
  info: "flex h-full flex-col rounded-none bg-panel",
  "label-chip": "group relative block overflow-hidden rounded-none",
  "category-tile": "group flex h-[328px] flex-col items-center rounded-none bg-white px-[18px] pt-[72px] pb-6 text-center",
  "image-square": "flex h-full flex-col rounded-none",
} as const;
export const card = (v?: string) => pick(cardMap, v, "product-teaser");
export const cardBodyPadding = "p-[30px]";

/** icon-tile: 366×202 panel tile, padding 12px 42px 42px, 132px icon (mb -18px), centred label */
export const iconTile =
  "flex h-[202px] flex-col items-center rounded-none bg-panel px-[42px] pt-3 pb-[42px] text-center";
export const iconTileIcon = "-mb-[18px] h-[132px] w-[132px]";

/** carousel controls: 44px white square arrows (hover: primary icon + soft shadow), 12px round dots, 12px gap */
export const carousel = {
  arrow:
    "inline-flex h-11 w-11 items-center justify-center rounded-none bg-white text-text transition " +
    "hover:text-primary hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]",
  dots: "flex items-center justify-center gap-3",
  dot: "h-3 w-3 rounded-full bg-muted",
  dotActive: "h-3 w-3 rounded-full bg-primary",
} as const;

/** Fixed spacing before the footer (both brands: 120px). */
export const footerGap = "mt-30";

import type { CSSProperties } from "react";
import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc";
import { bg, container, gridCols, space, type } from "@/lib/tokens";
import { BRAND_DEFAULTS, themeStyle } from "@/lib/theme";

interface ChildBlok {
  _uid: string;
  component: string;
  [key: string]: unknown;
}

interface CardGridBlok {
  _uid: string;
  component: string;
  eyebrow?: string;
  headline?: string;
  cards?: ChildBlok[];
  card_style?: string;
  columns?: string;
  background?: string;
  spacing_top?: string;
  spacing_bottom?: string;
  /** harness/fixture-only: render under another brand's theme (never a schema field) */
  _brand?: string;
}

/**
 * card-grid — the Sitecore `fi-grid` tile row shared by both brands (12-col / 24px gap in a 1920-max,
 * 30px-gutter container → 1380px content @1440).
 *  - Header row (optional): eyebrow (24/34 600 primary, mb 12) + h2 (group scale: fischer 48/58,
 *    fischertechnik 42/52) constrained to one third of the grid (444px @1440) so it wraps like the
 *    source, then the per-brand group-head gap (72px fischer) to the tiles.
 *  - Card children: one grid (gridCols map) of `card` atoms; `card_style` + `onPanel` are passed down.
 *  - Icon-tile rows (every child an icon-tile): 366px tiles, 24px gap, centred in the `icons`
 *    container; on mobile a horizontal scroll-snap swipe row (source `carousel-fi--destroyed` on desktop).
 */
export default async function CardGrid({ blok }: { blok: CardGridBlok }) {
  // Ensure the SDK component map is registered before nested StoryblokServerComponent calls. On public
  // pages it already is (the page fetch imports lib/storyblok); the /preview/harness route never imports
  // it, so children would render as empty <div>s. Lazy import (same pattern as lib/site-config.ts) to
  // avoid the lib/storyblok -> component map -> CardGrid import cycle. Module is evaluated once.
  await import("@/lib/storyblok");
  const cards = blok.cards ?? [];
  const iconRow = cards.length > 0 && cards.every((c) => c.component === "icon-tile");
  const onPanel = blok.background === "panel";
  const hasHeader = !!(blok.eyebrow || blok.headline);

  const harnessTheme = blok._brand && BRAND_DEFAULTS[blok._brand] ? BRAND_DEFAULTS[blok._brand] : null;
  const harnessProps = harnessTheme
    ? { "data-brand": harnessTheme.preset, style: themeStyle(harnessTheme) as CSSProperties }
    : {};

  const renderChild = (c: ChildBlok) => (
    <StoryblokServerComponent blok={c} key={c._uid} cardStyle={blok.card_style} onPanel={onPanel} />
  );

  return (
    <section
      data-block="card-grid"
      {...storyblokEditable(blok as never)}
      {...harnessProps}
      className={`${bg(blok.background)} ${space(blok.spacing_top, "top")} ${space(blok.spacing_bottom, "bottom")}${
        harnessTheme ? " font-sans text-text" : ""
      }`}
    >
      <div className={container(iconRow ? "icons" : "contained")}>
        {hasHeader && (
          <div
            className={`${blok.eyebrow ? "md:w-[calc((100%-48px)/3)]" : "max-w-[912px]"} ${type.groupHeadMargin}`}
          >
            {blok.eyebrow && <p className={`block ${type.eyebrow}`}>{blok.eyebrow}</p>}
            {blok.headline && <h2 className={type.h2Large}>{blok.headline}</h2>}
          </div>
        )}

        {iconRow ? (
          <ul className="-mx-[30px] flex snap-x snap-mandatory gap-6 overflow-x-auto px-[30px] [scrollbar-width:none] md:mx-0 md:justify-center md:overflow-visible md:px-0">
            {cards.map((c) => (
              <li key={c._uid} className="flex w-[min(366px,80vw)] shrink-0 snap-start flex-col md:w-[366px]">
                {renderChild(c)}
              </li>
            ))}
          </ul>
        ) : (
          <div
            className={`${gridCols(blok.columns)}${
              blok.card_style === "category-tile" ? " lg:grid-cols-[repeat(5,210px)] lg:justify-center" : ""
            }`}
          >{cards.map(renderChild)}</div>
        )}
      </div>
    </section>
  );
}

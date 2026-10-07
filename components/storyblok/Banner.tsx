import type { CSSProperties } from "react";
import {
  storyblokEditable,
  StoryblokServerComponent,
  StoryblokServerRichText,
} from "@storyblok/react/rsc";
import { align, space, text, type } from "@/lib/tokens";
import { BRAND_DEFAULTS, themeStyle } from "@/lib/theme";

interface Asset {
  filename?: string;
  alt?: string;
}
interface ChildBlok {
  _uid: string;
  component: string;
  style?: string;
  [key: string]: unknown;
}
interface BannerBlok {
  _uid: string;
  component: string;
  headline?: string;
  body?: unknown;
  cta?: ChildBlok[];
  image?: Asset;
  image_mobile?: Asset;
  content_position?: string;
  text_color?: string;
  spacing_top?: string;
  spacing_bottom?: string;
  /** harness/fixture-only: render under another brand's theme (never a schema field) */
  _brand?: string;
}

function hasRichText(doc: unknown): boolean {
  if (!doc || typeof doc !== "object") return false;
  const content = (doc as { content?: unknown[] }).content;
  return Array.isArray(content) && content.some((n) => {
    const c = (n as { content?: unknown[] }).content;
    return Array.isArray(c) && c.length > 0;
  });
}

/**
 * banner — the Sitecore `horizontal-banner-fi` band (fischertechnik#3/#4/#6/#7).
 * Desktop: 360px full-bleed band (1920 max), image cover/center — the coloured panel + diagonal are
 * baked into the image. Content sits in the 1380px 12-col grid (30px gutters, 24px gap), vertically
 * centred: a 5-col column (561px @1440) at col 1 (left) or col 8 (right, text stays left-aligned as on
 * the source), centre = cols 4-9. h2 42/52 600 mb 24, body 18/28 300, CTA: primary button 18px below
 * the text, or the 24px arrow 24px below — the arrow's stretched link (Button atom `after:inset-0`)
 * makes the whole band the link.
 * Mobile (no source evidence): image (image_mobile if set) stacked above the copy on the panel colour.
 */
export default async function Banner({ blok }: { blok: BannerBlok }) {
  // Ensure the SDK component map is registered before the nested button renders (harness route).
  await import("@/lib/storyblok");
  const img = blok.image?.filename;
  const mobile = blok.image_mobile?.filename;
  const cta = blok.cta?.[0];
  const isArrow = cta?.style === "arrow";
  const hasContent = !!(blok.headline || hasRichText(blok.body) || cta);
  const pos = blok.content_position ?? "left";
  const column =
    pos === "right"
      ? "md:col-start-8 md:col-span-5 text-left items-start"
      : pos === "center"
        ? `md:col-start-4 md:col-span-6 ${align("center")}`
        : `md:col-start-1 md:col-span-5 ${align("left")}`;

  const harnessTheme = blok._brand && BRAND_DEFAULTS[blok._brand] ? BRAND_DEFAULTS[blok._brand] : null;
  const harnessProps = harnessTheme
    ? {
        "data-brand": harnessTheme.preset,
        "data-button": harnessTheme.button,
        style: themeStyle(harnessTheme) as CSSProperties,
      }
    : {};

  return (
    <section
      data-block="banner"
      {...storyblokEditable(blok as never)}
      {...harnessProps}
      className={`w-full bg-white ${space(blok.spacing_top, "top")} ${space(blok.spacing_bottom, "bottom")}`}
    >
      <div className="relative mx-auto w-full max-w-[1920px] overflow-hidden bg-panel md:h-[360px]">
        {img && (
          <picture className="block md:absolute md:inset-0">
            {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img}
              alt={blok.image?.alt ?? ""}
              className="block h-auto w-full md:h-full md:object-cover md:object-center"
            />
          </picture>
        )}
        {hasContent && (
        <div className="relative mx-auto flex w-full max-w-[1920px] items-center px-[30px] max-md:py-[30px] md:h-full">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-12">
            <div className={`flex flex-col ${column} ${text(blok.text_color)} max-md:text-text`}>
              {blok.headline && <h2 className={`${type.h2} mb-6`}>{blok.headline}</h2>}
              {hasRichText(blok.body) && (
                <StoryblokServerRichText
                  document={blok.body as never}
                  className={`${type.bodyLarge} [&_a]:underline [&_p+p]:mt-[18px]`}
                />
              )}
              {cta && (
                <div className={isArrow ? "mt-6 flex h-6" : "mt-[18px]"}>
                  <StoryblokServerComponent blok={cta} key={cta._uid} />
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}

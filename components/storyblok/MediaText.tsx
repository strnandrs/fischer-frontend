import type { CSSProperties } from "react";
import {
  storyblokEditable,
  StoryblokServerComponent,
  StoryblokServerRichText,
} from "@storyblok/react/rsc";
import { bg, space, type } from "@/lib/tokens";
import { BRAND_DEFAULTS, themeStyle } from "@/lib/theme";

interface Asset {
  filename?: string;
  alt?: string;
}
interface ChildBlok {
  _uid: string;
  component: string;
  [key: string]: unknown;
}
interface MediaTextBlok {
  _uid: string;
  component: string;
  headline?: string;
  body?: unknown;
  buttons?: ChildBlok[];
  image?: Asset;
  reverse?: boolean;
  background?: string;
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
 * media-text — the Sitecore `teaser-big-image-element-fi` row (fischertechnik PDP #7).
 * Desktop: full-bleed (1920 max) row, height = image height (864x648 cover = 60% of 1440, 4:3), image on the
 * right by default (`reverse` → left); text column the remaining 40%, 42px side padding, vertically
 * centred, inner max 500px, 42/48 vertical padding. h2 30/40 600, body 18/28 300, paragraph gap 18px.
 * Mobile (no source evidence): image on top, copy below with 30px gutters.
 */
export default async function MediaText({ blok }: { blok: MediaTextBlok }) {
  // Ensure the SDK component map is registered before nested buttons render (harness route).
  await import("@/lib/storyblok");
  const img = blok.image?.filename;
  const buttons = blok.buttons ?? [];

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
      data-block="media-text"
      {...storyblokEditable(blok as never)}
      {...harnessProps}
      className={`w-full ${bg(blok.background)} ${space(blok.spacing_top, "top")} ${space(blok.spacing_bottom, "bottom")}`}
    >
      <div
        className={`mx-auto flex w-full max-w-[1920px] flex-col text-text ${
          blok.reverse ? "md:flex-row" : "md:flex-row-reverse"
        }`}
      >
        <div className="relative w-full overflow-hidden md:w-3/5">
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={blok.image?.alt ?? ""}
              className="block aspect-[4/3] h-auto w-full object-cover"
            />
          )}
        </div>
        <div className="flex w-full items-center justify-center px-[30px] max-md:py-[30px] md:w-2/5 md:px-[42px]">
          <div className="w-full max-w-[500px] md:pt-[42px] md:pb-12">
            {blok.headline && (
              <h2 className="mb-6 font-[var(--fw-head)] text-[30px] leading-[40px]">{blok.headline}</h2>
            )}
            {hasRichText(blok.body) && (
              <StoryblokServerRichText
                document={blok.body as never}
                className={`${type.bodyLarge} [&_a]:underline [&_p+p]:mt-[18px]`}
              />
            )}
            {buttons.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-6">
                {buttons.map((b) => (
                  <StoryblokServerComponent blok={b} key={b._uid} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

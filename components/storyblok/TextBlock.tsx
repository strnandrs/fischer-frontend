import type { CSSProperties } from "react";
import {
  storyblokEditable,
  StoryblokServerComponent,
  StoryblokServerRichText,
} from "@storyblok/react/rsc";
import { align, bg, container, space, type } from "@/lib/tokens";
import { BRAND_DEFAULTS, themeStyle } from "@/lib/theme";

interface ChildBlok {
  _uid: string;
  component: string;
  [key: string]: unknown;
}
interface TextBlockBlok {
  _uid: string;
  component: string;
  subheadline?: string;
  headline?: string;
  body?: unknown;
  buttons?: ChildBlok[];
  text_align?: string;
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

const justifyMap: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

/**
 * text-block — the Sitecore centred text band (fischer#3 "Innovationen weltweit").
 * Full-bleed band in the section background (spacing_top/bottom padding sits inside the band, like
 * the source's bg-matched 120px spacers); 1920 max, 30px gutters; text column = 8 of 12 cols
 * (912px @1440) centred → the `narrow` container. h2 42/52 600 mb 24; body 18/28 mb 18;
 * buttons (primary = brand button: fischer outline 2px / 5px 18px) directly below.
 */
export default async function TextBlock({ blok }: { blok: TextBlockBlok }) {
  // Ensure the SDK component map is registered before the nested buttons render (harness route).
  await import("@/lib/storyblok");
  const buttons = blok.buttons ?? [];
  const alignValue = blok.text_align ?? "center";

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
      data-block="text-block"
      {...storyblokEditable(blok as never)}
      {...harnessProps}
      className={`w-full ${bg(blok.background ?? "panel")} ${space(blok.spacing_top, "top")} ${space(blok.spacing_bottom, "bottom")}`}
    >
      <div className={`${container("narrow")} flex flex-col ${align(alignValue)}`}>
        {blok.headline && <h2 className={`${type.h2} mb-6 w-full`}>{blok.headline}</h2>}
        {blok.subheadline && (
          <p className="mt-6 mb-3 w-full text-[21px] font-[600] leading-[31px] text-text">{blok.subheadline}</p>
        )}
        {hasRichText(blok.body) && (
          <StoryblokServerRichText
            document={blok.body as never}
            className={`${type.bodyLarge} w-full [&_a]:underline [&_p]:mb-[18px] [&_ol]:mb-[18px] [&_ul]:mb-[18px] [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-6 [&_ul]:pl-6${buttons.length ? "" : " [&>*:last-child]:mb-0"}`}
          />
        )}
        {buttons.length > 0 && (
          <div className={`flex w-full flex-wrap gap-6 ${justifyMap[alignValue] ?? "justify-center"}`}>
            {buttons.map((b) => (
              <StoryblokServerComponent blok={b} key={b._uid} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

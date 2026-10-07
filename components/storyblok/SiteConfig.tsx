import type { CSSProperties } from "react";
import { storyblokEditable } from "@storyblok/react/rsc";
import SiteHeader from "@/components/chrome/SiteHeader";
import SiteFooter from "@/components/chrome/SiteFooter";
import { resolveTheme, themeStyle, type ThemeFields } from "@/lib/theme";

// Editor-only preview component for the `site-config` content type: the Visual Editor opens
// `/config/{brand}` (field-level language switch: `?_storyblok_lang=fr` or `/fr/config/{brand}`) and
// sees header + footer stacked, live-editable, in that language. (On public pages
// the root layout renders the same SiteHeader/SiteFooter around the page; this component is NOT
// rendered there.) The wrapper re-applies THIS config's theme (CSS vars + data-brand / data-button /
// data-brand-box) so Theme-tab edits preview immediately. With a brand box there is no hero below the
// header here, so a preview-only primary underlay stands in for the box's top 80px behind the logo.
/** Shop tab fields (read by the product page + product tiles; empty on fischer). */
export interface SiteConfigShopFields {
  cart_label?: string;
  cart_toast?: string;
  vat_note?: string;
  shipping_info?: unknown; // richtext doc
}

/** Full site-config content: theme + shop fields (nav/footer bloks stay loosely typed). */
export type SiteConfigContent = ThemeFields & SiteConfigShopFields & Record<string, unknown>;

export default function SiteConfig({ blok }: { blok: Record<string, unknown> & { _uid?: string; component?: string } }) {
  const fields = blok as ThemeFields;
  const theme = resolveTheme(fields.theme_preset ?? null, fields);
  const attrs = {
    "data-brand": theme.preset,
    "data-button": theme.button,
    "data-brand-box": String(theme.brandBox),
  };
  return (
    <div
      data-block="site-config"
      {...storyblokEditable(blok as never)}
      {...attrs}
      style={themeStyle(theme) as CSSProperties}
      className="relative min-h-screen bg-white font-sans text-text"
    >
      {theme.brandBox && (
        <div aria-hidden className="absolute top-0 left-0 h-20 w-[400px] max-w-[50%] bg-primary min-[1920px]:left-[calc(50%-960px)]" />
      )}
      <SiteHeader blok={blok} />
      <div className="h-30" aria-hidden />
      <SiteFooter blok={blok} />
    </div>
  );
}

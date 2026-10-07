// Brand theme — resolved from the brand's `config/{brand}` site-config story (Theme tab) into CSS
// variables + data attributes set on <html> by app/layout.tsx. Components are brand-agnostic:
// they only use the semantic Tailwind colors (bg-primary, text-text, bg-panel, …) which map to
// these variables in app/globals.css. Defaults = Color Mapping Table in state.md (fallback when the
// site-config is missing or a field is empty).

export interface BrandTheme {
  preset: string; // data-brand
  primary: string;
  secondary: string;
  text: string;
  panel: string;
  /** darker panel: breadcrumb dividers, related-products band */
  panelStrong: string;
  muted: string;
  white: string;
  dark: string;
  inverse: string;
  font: "archivo" | "montserrat";
  button: "outline" | "solid"; // data-button
  brandBox: boolean; // data-brand-box
}

export const BRAND_DEFAULTS: Record<string, BrandTheme> = {
  fischer: {
    preset: "fischer",
    primary: "#FF0000",
    secondary: "#8C827A",
    text: "#000000",
    panel: "#F2F1EF",
    panelStrong: "#E5E3DF",
    muted: "#BDBAB0",
    white: "#FFFFFF",
    dark: "#000000",
    inverse: "#FFFFFF",
    font: "archivo",
    button: "outline",
    brandBox: true,
  },
  fischertechnik: {
    preset: "fischertechnik",
    primary: "#0069B4",
    secondary: "#60676C",
    text: "#242627",
    panel: "#EEF3F5",
    panelStrong: "#DBE2E6",
    muted: "#96A2A8",
    white: "#FFFFFF",
    dark: "#2C292A",
    inverse: "#FFFFFF",
    font: "montserrat",
    button: "solid",
    brandBox: false,
  },
};

export const DEFAULT_BRAND = "fischer";

export const FONT_STACKS: Record<BrandTheme["font"], string> = {
  archivo: '"Archivo", Arial, Helvetica, sans-serif',
  montserrat: '"Montserrat", Arial, Helvetica, sans-serif',
};

const HEX = /^#[0-9A-Fa-f]{6}$/;
const hex = (v: unknown, fallback: string) => (typeof v === "string" && HEX.test(v.trim()) ? v.trim() : fallback);

export interface ThemeFields {
  theme_preset?: string;
  color_primary?: string;
  color_secondary?: string;
  color_text?: string;
  color_panel?: string;
  color_panel_strong?: string;
  color_muted?: string;
  font?: string;
  button_style?: string;
  brand_box?: boolean | string;
}

/** Merge a site-config's theme fields over the brand's defaults (unknown brand → fischer defaults). */
export function resolveTheme(brand: string | null, content?: ThemeFields | null): BrandTheme {
  const base = BRAND_DEFAULTS[brand ?? ""] ?? BRAND_DEFAULTS[DEFAULT_BRAND];
  if (!content) return base;
  const font = content.font === "archivo" || content.font === "montserrat" ? content.font : base.font;
  const button = content.button_style === "outline" || content.button_style === "solid" ? content.button_style : base.button;
  const box = content.brand_box;
  return {
    ...base,
    preset: content.theme_preset || base.preset,
    primary: hex(content.color_primary, base.primary),
    secondary: hex(content.color_secondary, base.secondary),
    text: hex(content.color_text, base.text),
    panel: hex(content.color_panel, base.panel),
    panelStrong: hex(content.color_panel_strong, base.panelStrong),
    muted: hex(content.color_muted, base.muted),
    font,
    button,
    brandBox: typeof box === "boolean" ? box : box === "true" ? true : box === "false" ? false : base.brandBox,
  };
}

/** CSS variables for the <html> inline style. */
export function themeStyle(t: BrandTheme): Record<string, string> {
  return {
    "--color-primary": t.primary,
    "--color-secondary": t.secondary,
    "--color-text": t.text,
    "--color-panel": t.panel,
    "--color-panel-strong": t.panelStrong,
    "--color-muted": t.muted,
    "--color-white": t.white,
    "--color-dark": t.dark,
    "--color-inverse": t.inverse,
    "--font-brand": FONT_STACKS[t.font],
  };
}

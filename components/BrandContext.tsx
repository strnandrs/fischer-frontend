"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BrandInfo, Brand } from "@/lib/brands";
import type { SiteLanguage } from "@/lib/languages";

export interface PageAlternateLink extends SiteLanguage {
  href: string;
}

export interface BrandInfoContext {
  /** Brand of the request — null on the picker. */
  brand: Brand | null;
  /** Brand of the request host (production host map) — null on localhost. Links drop the brand segment when equal. */
  hostBrand: Brand | null;
  /** Requested locale (= language folder of the URL). */
  lang: string;
  /** All site locales (auto-discovered language root folders, default first). */
  languages: SiteLanguage[];
  /** All brands (site-config stories in `config/`). */
  brands: BrandInfo[];
  /** Every locale's URL of the CURRENT page (server-computed). Empty = editor/picker route. */
  alternates: PageAlternateLink[];
}

const Ctx = createContext<BrandInfoContext>({
  brand: null,
  hostBrand: null,
  lang: "de",
  languages: [],
  brands: [],
  alternates: [],
});

export function BrandProvider({ value, children }: { value: BrandInfoContext; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Consumed by the header's language switch and links (use hrefFor/storyHref from lib/brands). */
export function useBrand(): BrandInfoContext {
  return useContext(Ctx);
}

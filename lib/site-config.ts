import { cache } from "react";
import type { ISbStoryData } from "@storyblok/react/rsc";
import { apiLanguage, SOURCE_LANG } from "@/lib/languages";
import { CONFIG_FOLDER, type Brand } from "@/lib/brands";

/**
 * The brand's `config/{brand}` site-config story (draft — chrome edits show without a publish). The
 * site-configs are the one FIELD-LEVEL translated content in the space: fetched with
 * `language={lang}` (omitted for the default locale) matching the request's language folder;
 * untranslated fields fall back to German. Its story links point to the `de/…` copies (with a
 * language: `fr/de/…`) — lib/brands storyHref re-targets them to the request locale. Never throws:
 * a missing story, token or network error resolves to `null` (layout falls back to the brand's
 * default theme, no chrome). React-cached per request.
 */
export const fetchSiteConfig = cache(
  async (brand: Brand | null, lang: string = SOURCE_LANG): Promise<ISbStoryData | null> => {
    if (!brand) return null;
    // Lazy import: lib/storyblok imports the component map, whose components may import this module.
    const { getStoryblokApi } = await import("@/lib/storyblok");
    try {
      const language = apiLanguage(lang);
      const { data } = await getStoryblokApi().get(`cdn/stories/${CONFIG_FOLDER}/${brand}`, {
        version: "draft",
        ...(language ? { language } : {}),
      });
      const story = data?.story as ISbStoryData | undefined;
      return story?.content?.component === "site-config" ? story : null;
    } catch {
      return null;
    }
  }
);

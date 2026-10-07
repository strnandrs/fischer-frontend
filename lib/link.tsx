// Storyblok multilink helpers — stable import path for every block.
//  - linkHref(link, ctx?)  server-safe; with a LinkContext, story links are re-targeted to the active
//                          locale's language folder and
//                          drop the brand segment on the brand's own host (lib/brands storyHref).
//  - <SbLink link>         locale/host-aware link (client component reading BrandContext), usable
//                          from server and client components alike.
export { linkHref, type SbLinkValue, type LinkContext } from "@/lib/link-core";
export { SbLink } from "@/components/SbLink";

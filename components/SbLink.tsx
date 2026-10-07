"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useBrand } from "@/components/BrandContext";
import { linkHref, type SbLinkValue } from "@/lib/link-core";

/**
 * `<a>` when the link resolves, otherwise a plain `<span>` (so unlinked blocks still render).
 * Story links follow the ACTIVE locale + host-mapped brand (BrandContext): the language folder of the
 * delivered slug is swapped for the active one (`de/fischer/x` on an /en page → `/en/fischer/x`, or
 * `/en/x` on the brand's own domain). Client component so it works from server and client trees
 * (props are plain data + server-rendered children).
 */
export function SbLink({
  link,
  children,
  ...rest
}: { link?: SbLinkValue | null; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { lang, languages, hostBrand } = useBrand();
  const href = linkHref(link, { lang, languages: languages.map((l) => l.code), hostBrand });
  if (!href) return <span {...(rest as object)}>{children}</span>;
  const external = link?.target === "_blank";
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
      {children}
    </a>
  );
}

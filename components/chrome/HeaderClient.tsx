"use client";

// Client islands of the site header: brand home link, language switch (globe), mobile drawer toggle.
// Everything data-driven comes in as plain props / server-rendered nodes; locale + brand from
// BrandContext (useBrand).
import { useEffect, useState, type ReactNode } from "react";
import { useBrand } from "@/components/BrandContext";
import { Icon } from "@/components/icons";
import NavFlyout from "@/components/interactive/NavFlyout";
import { hrefFor } from "@/lib/brands";
import { container, type } from "@/lib/tokens";

// Fixed UI strings (not editor content) per locale; unknown locale → English.
const UI: Record<string, { close: string; menu: string }> = {
  de: { close: "Schließen", menu: "Menü" },
  en: { close: "Close", menu: "Menu" },
  fr: { close: "Fermer", menu: "Menu" },
  es: { close: "Cerrar", menu: "Menú" },
};
export const ui = (lang: string) => UI[lang] ?? UI.en;

/** Link to the current brand's landing page in the active locale (host-mapped brand → `/`). */
export function HomeLink({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  const { brand, hostBrand, lang } = useBrand();
  const href = brand ? hrefFor(lang, brand, "", hostBrand) : `/${lang}`;
  return (
    <a href={href} className={className} aria-label={label}>
      {children}
    </a>
  );
}

/**
 * Globe = language switch: a flyout listing every site locale (auto-discovered language folders),
 * each linking to the SAME relative path in that language folder (server-computed alternates; brand
 * landing page as fallback on editor routes). The current locale is marked.
 */
export function LanguageSwitch({ label, className }: { label: string; className?: string }) {
  const { brand, hostBrand, lang, languages, alternates } = useBrand();
  const closeLabel = ui(lang).close;
  const items = languages.map((l) => {
    const alt = alternates.find((a) => a.code === l.code);
    return { ...l, href: alt?.href ?? (brand ? hrefFor(l.code, brand, "", hostBrand) : `/${l.code}`) };
  });
  return (
    <NavFlyout
      id="language-switch"
      label={<Icon name="globe" className="h-11 w-11" strokeWidth={1.25} title={label} />}
      ariaLabel={label}
      closeLabel={closeLabel}
      triggerClassName={`relative inline-flex h-20 items-center text-text hover:text-primary ${className ?? ""}`}
    >
      <div className={`${container("contained")} py-8`}>
        <p className={`${type.body} mb-4 !font-[600]`}>{label}</p>
        <ul className="flex flex-wrap gap-x-10 gap-y-2">
          {items.map((l) => {
            const current = l.code === lang;
            return (
              <li key={l.code}>
                <a
                  href={l.href}
                  hrefLang={l.code}
                  lang={l.code}
                  aria-current={current ? "page" : undefined}
                  className={`${type.body} inline-flex items-center gap-2 transition-colors hover:text-primary ${
                    current ? "!font-[600] text-primary" : "text-text"
                  }`}
                >
                  <span className="w-6 text-[12px] uppercase tracking-wide opacity-70">{l.code}</span>
                  {l.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </NavFlyout>
  );
}

/** Hamburger toggling the mobile drawer (nav tree rendered server-side, passed as children). */
export function MobileMenu({ children }: { children: ReactNode }) {
  const { lang } = useBrand();
  const { menu: openLabel, close: closeLabel } = ui(lang);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-20 w-14 items-center justify-center text-text hover:text-primary"
      >
        <span className="relative block h-[14px] w-6" aria-hidden>
          <span className={`absolute left-0 h-[2px] w-6 bg-current transition-transform ${open ? "top-[6px] rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-[6px] h-[2px] w-6 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 h-[2px] w-6 bg-current transition-transform ${open ? "top-[6px] -rotate-45" : "top-3"}`} />
        </span>
      </button>
      <div
        id="mobile-drawer"
        hidden={!open}
        className="fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
      >
        {children}
      </div>
    </>
  );
}

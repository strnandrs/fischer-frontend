import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";
import { HomeLink } from "@/components/chrome/HeaderClient";
import type { ChromeProps } from "./SiteHeader";

// Site footer — brand-agnostic (theme colors only), from the brand's `site-config` Footer tab.
// Measured @1440 (both brands): panel link band, 120px top/bottom padding, 1248px inner (96px side
// inset), 4 columns at x=96/414/732/1050 (24px gap); footer logo at the bottom of column 1 (aligned
// with the tallest column); socials (30px secondary squares, 9px gap) under column 4, 60px below the
// columns; white 84px legal bar, centered 14px/24px "company · link · link". No top margin — the
// page root owns the 120px gap before the footer.

interface Blok {
  _uid: string;
  component: string;
  [key: string]: unknown;
}

const bloks = (v: unknown) => (Array.isArray(v) ? (v as Blok[]) : []);
const render = (b: Blok) => <StoryblokServerComponent blok={b as never} key={b._uid} />;

export default function SiteFooter({ blok }: ChromeProps) {
  const columns = bloks(blok.footer_columns);
  const socials = bloks(blok.social_links);
  const legal = bloks(blok.legal_links);
  const logo = (blok.footer_logo ?? {}) as { filename?: string; alt?: string };
  const company = typeof blok.legal_company === "string" ? blok.legal_company : "";
  const [first, ...rest] = columns;

  const logoEl = logo.filename ? (
    <HomeLink className="mt-auto inline-flex self-start pt-[30px]" label={logo.alt || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo.filename} alt={logo.alt ?? ""} className="h-[30px] w-auto" loading="lazy" />
    </HomeLink>
  ) : null;

  return (
    <footer data-chrome="footer" {...storyblokEditable(blok as never)} className="text-text">
      {/* links band — links 16px/300 in both brands (fischertechnik body scale is 18px) */}
      <div
        className={
          "bg-panel py-20 lg:py-30 [--fs-body:16px] [--lh-body:24px] " +
          // footer-column rhythm measured on the source: heading (18/28) → first link 35px, links 34px apart
          "[&_[data-block=footer-column]>p]:!mb-[35px] [&_[data-block=footer-column]>ul]:!gap-[10px]"
        }
      >
        <div className="mx-auto w-full max-w-[1440px] px-[30px] lg:px-24">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {first ? (
              <div className="flex flex-col">
                {render(first)}
                {logoEl}
              </div>
            ) : (
              logoEl && <div className="flex flex-col">{logoEl}</div>
            )}
            {rest.map(render)}
            {socials.length > 0 && (
              <ul className="flex flex-wrap gap-[9px] lg:col-start-4 lg:mt-5">
                {socials.map((s) => (
                  <li key={s._uid} className="flex">
                    {render(s)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* legal bar */}
      {(company || legal.length > 0) && (
        <div className="bg-white [--fs-body:14px] [--lh-body:24px]">
          <ul className="mx-auto flex min-h-[84px] w-full max-w-[1440px] flex-wrap items-center justify-center gap-y-1 px-[30px] py-[30px] text-[14px] font-[300] leading-6">
            {company && <li>{company}</li>}
            {legal.map((l, i) => (
              <li
                key={l._uid}
                className={company || i > 0 ? "before:mx-[7px] before:content-['·']" : undefined}
              >
                {render(l)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </footer>
  );
}

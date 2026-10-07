import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";
import { Icon } from "@/components/icons";
import { HomeLink, LanguageSwitch, MobileMenu } from "@/components/chrome/HeaderClient";
import { SbLink, linkHref, type SbLinkValue } from "@/lib/link";
import { type } from "@/lib/tokens";

// Site header — brand-agnostic, rendered from the brand's `site-config` (layout on every page +
// SiteConfig editor preview). Look per brand comes ONLY from the theme:
//  - colors via semantic utilities (bg-primary / bg-secondary / text-text → brand CSS vars);
//  - `brand_box` → data-brand-box="true" (layout <html>; SiteConfig wrapper in the preview): the left
//    400px logo area stays transparent so the hero slide's primary box (rising 80px into the header)
//    shows through; the white logo stacks above it and the white bar starts right of it. Otherwise a
//    plain colored logo at x=30 on the white bar.
// Desktop (≥1380px — the source's full nav needs ~1380): logo · main nav (NavItem flyouts) · globe
// language switch · account (icon + 14px label), left-aligned; search block on secondary pinned to the
// right edge (overlays a too-long nav, as on the source).
// Below: logo · globe · (search ≥md) · hamburger → drawer with the nav tree as accordions.

export interface ChromeProps {
  blok: Record<string, unknown>;
}

interface Blok {
  _uid: string;
  component: string;
  [key: string]: unknown;
}
interface Asset {
  filename?: string;
  alt?: string;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const bloks = (v: unknown) => (Array.isArray(v) ? (v as Blok[]) : []);

function SearchBox({ id, placeholder, className }: { id: string; placeholder: string; className?: string }) {
  return (
    <form role="search" className={`relative flex h-20 items-center bg-secondary px-[30px] ${className ?? ""}`}>
      <label className="sr-only" htmlFor={id}>
        {placeholder}
      </label>
      <input
        id={id}
        type="search"
        name="q"
        placeholder={placeholder}
        className={`${type.body} w-full min-w-0 appearance-none rounded-none border-b-2 border-white bg-transparent pt-[13px] pr-[45px] pb-[7px] text-white placeholder:text-white/70 focus:outline-none`}
      />
      <button type="submit" aria-label={placeholder} className="absolute right-[30px] top-1/2 -translate-y-1/2 text-white">
        <Icon name="search" className="h-11 w-11" />
      </button>
    </form>
  );
}

function AccountLink({ label, link, className }: { label: string; link?: SbLinkValue; className?: string }) {
  if (!label) return null;
  return (
    <SbLink link={link} className={`flex flex-col items-center justify-center text-text transition-colors hover:text-primary ${className ?? ""}`}>
      <Icon name="user" className="h-11 w-11" />
      <span className="-mt-[10px] block whitespace-nowrap text-[14px] font-[300] leading-6">{label}</span>
    </SbLink>
  );
}

const drawerRow = `${type.body} flex w-full items-center justify-between border-b border-panel px-4 py-4 text-text hover:text-primary`;

/** One level of the mobile drawer tree: nav-link → row link; nav-item / nav-group with children → accordion. */
function DrawerNode({ b, depth }: { b: Blok; depth: number }) {
  const pad = depth === 0 ? "" : depth === 1 ? "pl-8" : "pl-12";
  const label = str(b.component === "nav-group" ? b.headline : b.label);
  const kids = b.component === "nav-link" ? [] : [...bloks(b.overview_links), ...bloks(b.children), ...bloks(b.links)];
  if (kids.length === 0) {
    return (
      <li>
        <SbLink link={b.link as SbLinkValue} className={`${drawerRow} ${pad}`}>
          {label}
        </SbLink>
      </li>
    );
  }
  return (
    <li>
      <details className="group">
        <summary className={`${drawerRow} ${pad} cursor-pointer list-none [&::-webkit-details-marker]:hidden ${depth > 0 ? "!font-[600]" : ""}`}>
          {label}
          <Icon name="chevron-down" className="h-8 w-8 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <ul>
          {kids.map((k) => (
            <DrawerNode key={k._uid} b={k} depth={depth + 1} />
          ))}
        </ul>
      </details>
    </li>
  );
}

export default function SiteHeader({ blok, brandBox = true }: ChromeProps & { brandBox?: boolean }) {
  // `logo` is the variant for the brand box (fischer: white on red). Without the box the header
  // falls back to the footer logo (the colored variant on white), else `logo`.
  const boxLogo = (blok.logo ?? {}) as Asset;
  const footerLogo = (blok.footer_logo ?? {}) as Asset;
  const logo = !brandBox && footerLogo.filename ? footerLogo : boxLogo;
  const nav = bloks(blok.main_nav);
  const countryLabel = str(blok.country_switch_label) || "Länderauswahl";
  const countryLink = blok.country_switch_link as SbLinkValue | undefined;
  const accountLabel = str(blok.account_label);
  const accountLink = blok.account_link as SbLinkValue | undefined;
  const placeholder = str(blok.search_placeholder) || "Ihr Suchbegriff";

  // Globe: an editor-set country page wins; otherwise the auto-discovered language flyout.
  const globe = linkHref(countryLink) ? (
    <SbLink link={countryLink} aria-label={countryLabel} className="inline-flex h-20 items-center text-text hover:text-primary">
      <Icon name="globe" className="h-11 w-11" strokeWidth={1.25} />
    </SbLink>
  ) : (
    <LanguageSwitch label={countryLabel} />
  );

  return (
    <header
      data-chrome="header"
      {...storyblokEditable(blok as never)}
      // nav + chrome links are 16px/300 in both brands (fischertechnik's body scale is 18px)
      className="sticky top-0 z-50 h-20 bg-white text-text [--fs-body:16px] [--lh-body:24px] [[data-brand-box=true]_&]:bg-transparent"
    >
      <div className="relative mx-auto flex h-20 w-full max-w-[1920px] items-stretch">
        {/* Logo — on the 400px primary brand box when data-brand-box=true */}
        <div
          className={
            // brand box: TRANSPARENT 400px area — the hero slide's primary box rises 80px under it
            // (-top-20, z-10); the white logo stacks above (z-20). The white bar starts right of it.
            "relative z-20 flex h-20 shrink-0 items-center px-4 min-[480px]:px-[30px] " +
            "[[data-brand-box=true]_&]:w-[400px] [[data-brand-box=true]_&]:max-w-[50%]"
          }
        >
          <HomeLink className="flex items-center" label={logo.alt || undefined}>
            {logo.filename ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo.filename} alt={logo.alt ?? ""} className="h-[22px] w-auto min-[480px]:h-[30px]" />
            ) : (
              <span className="text-[24px] font-[700] text-primary [[data-brand-box=true]_&]:text-inverse">Logo</span>
            )}
          </HomeLink>
        </div>

        <div className="flex min-w-0 flex-1 items-stretch bg-white">
          {/* Desktop main nav — NavItem renders trigger + multi-level flyout from content */}
          <nav aria-label="Main" className="hidden whitespace-nowrap min-[1380px]:flex">
            <ul className="flex items-center">
              {nav.map((b) => (
                <StoryblokServerComponent blok={b as never} key={b._uid} />
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center min-[1380px]:ml-[6px]">{globe}</div>

          <AccountLink label={accountLabel} link={accountLink} className="ml-3 hidden min-[1380px]:flex" />

          {/* Source geometry: nav flows left-aligned after the logo; the search block is pinned to the
              right edge (absolute on desktop) and overlays anything that runs under it. */}
          <SearchBox
            id="site-search"
            placeholder={placeholder}
            className="hidden w-[220px] shrink-0 md:flex min-[1380px]:absolute min-[1380px]:top-0 min-[1380px]:right-0 min-[1380px]:z-10"
          />

          <div className="flex items-center min-[1380px]:hidden">
            <MobileMenu>
              <nav aria-label="Main">
                <ul>
                  {nav.map((b) => (
                    <DrawerNode key={b._uid} b={b} depth={0} />
                  ))}
                </ul>
              </nav>
              {accountLabel && (
                <div className="flex px-4 py-4">
                  <AccountLink label={accountLabel} link={accountLink} />
                </div>
              )}
              <SearchBox id="site-search-mobile" placeholder={placeholder} className="md:hidden" />
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

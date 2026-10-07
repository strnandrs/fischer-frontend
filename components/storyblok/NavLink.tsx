import { storyblokEditable } from "@storyblok/react/rsc";
import { Icon } from "@/components/icons";
import { SbLink, type SbLinkValue } from "@/lib/link";
import { type } from "@/lib/tokens";

interface NavLinkBlok {
  _uid: string;
  component: string;
  label?: string;
  link?: SbLinkValue;
  image?: { filename?: string; alt?: string };
  icon?: string;
}

export default function NavLink({ blok }: { blok: NavLinkBlok }) {
  const thumb = blok.image?.filename;
  return (
    <SbLink
      link={blok.link}
      data-block="nav-link"
      {...storyblokEditable(blok as never)}
      className={`${type.body} inline-flex items-center text-text transition-colors hover:text-primary ${
        thumb ? "gap-4" : blok.icon ? "gap-6" : ""
      }`}
    >
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt={blok.image?.alt ?? ""} width={60} height={60} loading="lazy" className="h-[60px] w-[60px] shrink-0 object-contain" />
      )}
      {!thumb && blok.icon && <Icon name={blok.icon} className="h-6 w-6 shrink-0" />}
      <span>{blok.label}</span>
    </SbLink>
  );
}

import { storyblokEditable } from "@storyblok/react/rsc";
import { Icon } from "@/components/icons";
import { SbLink, type SbLinkValue } from "@/lib/link";
import { iconTile, iconTileIcon } from "@/lib/tokens";

interface IconTileBlok {
  _uid: string;
  component: string;
  icon?: string;
  label?: string;
  link?: SbLinkValue;
}

export default function IconTile({ blok }: { blok: IconTileBlok }) {
  return (
    <SbLink link={blok.link} data-block="icon-tile" {...storyblokEditable(blok as never)} className={`${iconTile} text-text`}>
      <Icon name={blok.icon} className={iconTileIcon} />
      <p className="mt-auto font-[var(--fw-head)] text-[24px] leading-[34px]">{blok.label}</p>
    </SbLink>
  );
}

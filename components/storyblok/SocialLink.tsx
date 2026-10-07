import { storyblokEditable } from "@storyblok/react/rsc";
import { Icon } from "@/components/icons";
import { SbLink, type SbLinkValue } from "@/lib/link";

interface SocialLinkBlok {
  _uid: string;
  component: string;
  platform?: string;
  link?: SbLinkValue;
}

const LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
};

export default function SocialLink({ blok }: { blok: SocialLinkBlok }) {
  const label = LABELS[blok.platform ?? ""] ?? blok.platform;
  return (
    <SbLink
      link={blok.link}
      data-block="social-link"
      {...storyblokEditable(blok as never)}
      aria-label={label}
      className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-none bg-secondary text-inverse transition-opacity hover:opacity-80"
    >
      <Icon name={blok.platform} className="h-6 w-6" />
    </SbLink>
  );
}

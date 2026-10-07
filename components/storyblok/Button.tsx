import { storyblokEditable } from "@storyblok/react/rsc";
import { button } from "@/lib/tokens";
import { Icon } from "@/components/icons";
import { SbLink, type SbLinkValue } from "@/lib/link";

interface ButtonBlok {
  _uid: string;
  component: string;
  label?: string;
  link?: SbLinkValue;
  style?: string;
}

export default function Button({ blok }: { blok: ButtonBlok }) {
  const isArrow = blok.style === "arrow";
  const isTextLink = blok.style === "text-link";
  return (
    <SbLink
      link={blok.link}
      data-block="button"
      {...storyblokEditable(blok as never)}
      // arrow inside a banner: the link stretches over the nearest positioned ancestor (whole banner)
      className={`${button(blok.style)}${isArrow ? " after:absolute after:inset-0 after:content-['']" : ""}`}
      {...(isArrow ? { "aria-label": blok.label } : {})}
    >
      {isArrow ? (
        <>
          <span className="sr-only">{blok.label}</span>
          <Icon name="arrow-right" className="h-6 w-6" />
        </>
      ) : isTextLink ? (
        <>
          {blok.label}
          <Icon name="arrow-right" className="h-6 w-6 shrink-0" />
        </>
      ) : (
        blok.label
      )}
    </SbLink>
  );
}

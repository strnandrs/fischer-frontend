import { storyblokEditable } from "@storyblok/react/rsc";
import { Icon } from "@/components/icons";
import { SbLink, type SbLinkValue } from "@/lib/link";
import { type } from "@/lib/tokens";
import { bynderImage } from "@/lib/bynder";

interface Asset {
  filename?: string;
  alt?: string;
}
interface HeroSlideBlok {
  _uid: string;
  component: string;
  headline?: string;
  subheadline?: string;
  link?: SbLinkValue;
  image?: Asset;
  image_mobile?: Asset;
  /** Bynder DAM image (field plugin storyblok-bynder) — wins over `image` / `image_mobile` when set */
  image_bynder?: unknown;
  text_align?: string;
}

/**
 * One slide in HeroCarousel's track. The whole slide is the link (source: the slide <a> spans the
 * image); the arrow is a decorative affordance. The slide root does NOT clip vertically so the brand
 * box can rise into the header zone; the image layer clips itself.
 *
 * brand-box mode (html[data-brand-box=true], fischer): copy in a 400x534 primary box at the slide's
 * top-left, starting 80px ABOVE the slide (under the header logo, as on the source), content
 * bottom-anchored (padding 0 30px 42px), subline clamped to 2 lines, 24px arrow in a 44px row.
 * Default (fischertechnik): a 444px column (max 33.333% - 36px, 30px inset + 30px padding, gap 24)
 * vertically centred on the image, left or right per text_align.
 * Image source: the Bynder pick (`image_bynder`, lib/bynder.ts) first — used on every breakpoint;
 * the Storyblok assets `image` (+ `image_mobile` below 768px) are the fallback.
 */
export default function HeroSlide({ blok }: { blok: HeroSlideBlok }) {
  const bynder = bynderImage(blok.image_bynder);
  const img = bynder?.src ?? blok.image?.filename;
  const alt = bynder ? bynder.alt || blok.image?.alt || "" : blok.image?.alt ?? "";
  const mobile = bynder ? undefined : blok.image_mobile?.filename;
  const right = blok.text_align === "right";
  return (
    <div
      data-block="hero-slide"
      {...storyblokEditable(blok as never)}
      className="relative h-[540px] w-full text-inverse [[data-brand=fischer]_&]:h-[648px]"
    >
      <SbLink link={blok.link} aria-label={blok.headline} className="block h-full w-full">
        <span className="absolute inset-0 block overflow-hidden bg-panel">
          {img && (
            <picture>
              {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={alt} className="h-full w-full object-cover" />
            </picture>
          )}
        </span>
        <span
          className={
            "absolute inset-0 z-10 mx-auto flex max-w-[1920px] items-center px-[30px] " +
            (right ? "justify-end " : "justify-start ") +
            "[[data-brand-box=true]_&]:justify-start [[data-brand-box=true]_&]:px-0"
          }
        >
          <span
            className={
              "flex w-[444px] max-w-[calc(33.333%-36px)] flex-col gap-6 p-[30px] text-left max-md:max-w-full " +
              "[[data-brand-box=true]_&]:absolute [[data-brand-box=true]_&]:-top-20 [[data-brand-box=true]_&]:left-0 " +
              "[[data-brand-box=true]_&]:h-[534px] [[data-brand-box=true]_&]:w-[400px] [[data-brand-box=true]_&]:max-w-none " +
              "[[data-brand-box=true]_&]:justify-end [[data-brand-box=true]_&]:gap-0 [[data-brand-box=true]_&]:bg-primary " +
              "[[data-brand-box=true]_&]:px-[30px] [[data-brand-box=true]_&]:pt-0 [[data-brand-box=true]_&]:pb-[42px]"
            }
          >
            <span className={`${type.hero} block text-inverse`}>{blok.headline}</span>
            {blok.subheadline && (
              <span
                className={`${type.heroSub} block text-inverse [[data-brand-box=true]_&]:mt-3 [[data-brand-box=true]_&]:line-clamp-2`}
              >
                {blok.subheadline}
              </span>
            )}
            <span className="block text-inverse [[data-brand-box=true]_&]:h-11" aria-hidden="true">
              <Icon name="arrow-right" className="h-6 w-6 [[data-brand-box=true]_&]:mt-3" />
            </span>
          </span>
        </span>
      </SbLink>
    </div>
  );
}

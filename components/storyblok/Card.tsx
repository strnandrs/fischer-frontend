import { storyblokEditable } from "@storyblok/react/rsc";
import { Icon } from "@/components/icons";
import { SbLink, type SbLinkValue } from "@/lib/link";
import { button, card, cardBodyPadding, type } from "@/lib/tokens";

interface Asset {
  filename?: string;
  alt?: string;
}
interface CardBlok {
  _uid: string;
  component: string;
  image?: Asset;
  headline?: string;
  text?: string;
  link?: SbLinkValue;
  link_label?: string;
  /** harness/fixture fallback for the parent grid's card_style */
  _card_style?: string;
}

/**
 * The parent card-grid passes `cardStyle` (card-styles datasource) and `onPanel` (grid background is
 * 'panel' -> product-teaser tiles turn white) as props via StoryblokServerComponent.
 */
export default function Card({
  blok,
  cardStyle,
  onPanel,
}: {
  blok: CardBlok;
  cardStyle?: string;
  onPanel?: boolean;
}) {
  const style = cardStyle ?? blok._card_style ?? "product-teaser";
  const img = blok.image?.filename;
  const alt = blok.image?.alt ?? "";
  const common = { "data-block": "card", ...storyblokEditable(blok as never) };

  if (style === "image-link") {
    // fischertechnik category tile (snapshot ft#2): 327x164 image (cut-out product on its colored block,
    // baked into the image), body p-30: h3 21/31 600, optional text (mt 18), 24px arrow in a 34px row.
    return (
      <SbLink link={blok.link} {...common} className={`${card(style)} bg-white text-text`}>
        <div className="aspect-[327/164] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img && <img src={img} alt={alt} className="block h-full w-full object-cover" />}
        </div>
        <div className={`${cardBodyPadding} flex flex-1 flex-col items-start`}>
          <div className="flex-1">
            <h3 className={type.h3}>{blok.headline}</h3>
            {blok.text && <p className={`${type.body} mt-[18px]`}>{blok.text}</p>}
          </div>
          <span className={`flex h-[34px] items-center ${blok.text ? "" : "mt-[18px]"}`}>
            <Icon name="arrow-right" className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </SbLink>
    );
  }

  if (style === "category-tile") {
    // product-overview category tile: white 210x328, 110px contained image, centred 21/31 600 label.
    // No image: label only, same offset (tile padding carries it).
    return (
      <SbLink link={blok.link} {...common} className={`${card(style)}`}>
        <div className="flex h-[110px] w-[110px] shrink-0 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img && <img src={img} alt={alt} className="block h-full w-full object-contain" />}
        </div>
        <h3 className={`${type.h3} mt-6 !text-[21px] !leading-[31px] !font-[600] hyphens-auto break-words`}>{blok.headline}</h3>
      </SbLink>
    );
  }

  if (style === "image-square") {
    // PDP teaser: 444 square image (cover), then h3 24/34 600 + text 18/28 300 with 30px left inset.
    const inner = (
      <>
        <div className="aspect-square w-full overflow-hidden bg-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img && <img src={img} alt={alt} className="block h-full w-full object-cover" />}
        </div>
        <div className="pt-6 pl-[30px]">
          <h3 className={type.h3}>{blok.headline}</h3>
          {blok.text && <p className={`${type.bodyLarge} mt-[18px]`}>{blok.text}</p>}
        </div>
      </>
    );
    return blok.link?.url || blok.link?.cached_url ? (
      <SbLink link={blok.link} {...common} className={`${card(style)} text-text`}>
        {inner}
      </SbLink>
    ) : (
      <article {...common} className={`${card(style)} text-text`}>
        {inner}
      </article>
    );
  }

  if (style === "info") {
    // fischertechnik info tile (snapshot ft#5): panel tile, full-width 2:1 image (round icon on the
    // panel), body p-30: title 18/28 600 (mb 18) + paragraph 18/28 300. No link.
    return (
      <article {...common} className={`${card(style)} text-text`}>
        <div className="aspect-[2/1] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img && <img src={img} alt={alt} className="block h-full w-full object-contain" />}
        </div>
        <div className={cardBodyPadding}>
          <h3 className={`${type.bodyLarge} !font-[600] mb-[18px]`}>{blok.headline}</h3>
          {blok.text && <p className={type.bodyLarge}>{blok.text}</p>}
        </div>
      </article>
    );
  }

  if (style === "label-chip") {
    // news tile (snapshot ft#9): 444x250 image, white chip absolute bottom-left, p-30, 16/22 600 + 16px arrow
    return (
      <SbLink link={blok.link} {...common} className={`${card(style)} bg-white text-text`}>
        <div className="aspect-[444/250] w-full overflow-hidden bg-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img && <img src={img} alt={alt} className="block h-full w-full object-cover" />}
        </div>
        <div className="absolute bottom-0 left-0 max-w-[85%] bg-white p-[30px]">
          <h3 className="inline text-[16px] font-[600] leading-[22px]">{blok.headline}</h3>
          <Icon
            name="arrow-right"
            className="ml-0.5 inline-block h-4 w-4 align-[-2px] transition-transform group-hover:translate-x-1"
          />
        </div>
      </SbLink>
    );
  }

  // product-teaser (default)
  return (
    <article {...common} className={`${card("product-teaser")} ${onPanel ? "bg-white" : ""}`}>
      <SbLink link={blok.link} className="block aspect-[444/291] w-full overflow-hidden bg-panel" tabIndex={-1} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img && <img src={img} alt={alt} className="h-full w-full object-cover" />}
      </SbLink>
      <div className={`${cardBodyPadding} flex flex-1 flex-col items-start`}>
        <div className="flex-1">
          <h3 className={type.h3}>{blok.headline}</h3>
          {blok.text && <p className={`${type.bodyLarge} mt-[18px]`}>{blok.text}</p>}
        </div>
        {blok.link_label && (
          <div className="mt-[30px]">
            <SbLink link={blok.link} className={button("primary")}>
              {blok.link_label}
            </SbLink>
          </div>
        )}
      </div>
    </article>
  );
}

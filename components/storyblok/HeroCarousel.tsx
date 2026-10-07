import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc";
import { HeroCarouselClient } from "@/components/interactive/HeroCarouselClient";
import HeroSlide from "./HeroSlide";

interface HeroCarouselBlok {
  _uid: string;
  component: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slides?: any[];
}

/**
 * Full-bleed hero carousel (both brands). Slide height lives in HeroSlide (540px; 648px under
 * [data-brand=fischer]). Below the image: a 54px band (source: 42px margin + 12px padding) holding
 * the dots; the arrow pair overlaps the image's bottom edge. Server shell; state in the client wrapper.
 */
export default function HeroCarousel({ blok }: { blok: HeroCarouselBlok }) {
  const slides = blok.slides ?? [];
  return (
    <section
      data-block="hero-carousel"
      {...storyblokEditable(blok as never)}
      className="relative w-full bg-white pb-[54px]"
    >
      <HeroCarouselClient
        // hero-slide (the only whitelisted child) renders directly — independent of SDK-map init
        // order (the harness route doesn't init the SDK); anything else goes through the map.
        slides={slides.map((b) =>
          b.component === "hero-slide" ? (
            <HeroSlide blok={b} key={b._uid} />
          ) : (
            <StoryblokServerComponent blok={b} key={b._uid} />
          ),
        )}
      />
    </section>
  );
}

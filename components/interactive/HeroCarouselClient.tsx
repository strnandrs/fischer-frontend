"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { carousel } from "@/lib/tokens";

const AUTOPLAY_MS = 5000; // Splide default interval (source: Splide autoplay, interval not overridden)

/**
 * Hero carousel: 1-up sliding track, looped, autoplay (pauses on hover / focus within / reduced
 * motion), 44px white square prev/next pair overlapping the image's bottom edge (right 122px),
 * 12px round dots centred 30px below the image. Slide 1 is the SSR resting state.
 */
export function HeroCarouselClient({ slides, label }: { slides: ReactNode[]; label?: string }) {
  const n = slides.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (n < 2 || paused || reduced) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % n), AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [n, paused, reduced]);

  const go = useCallback((to: number) => setI(((to % n) + n) % n), [n]);

  if (n === 0) return null;

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label={label ?? "Hero"}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(i - 1);
        else if (e.key === "ArrowRight") go(i + 1);
      }}
    >
      {/* clip horizontally only — the brand box may rise above the track into the header zone */}
      <div className="overflow-x-clip">
        <div
          className="flex transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${i * 100}%)` }}
          aria-live={paused ? "polite" : "off"}
        >
          {slides.map((s, d) => (
            <div
              key={d}
              role="group"
              aria-roledescription="slide"
              aria-label={`${d + 1} / ${n}`}
              aria-hidden={d !== i}
              inert={d !== i}
              className="w-full shrink-0"
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {n > 1 && (
        <>
          <div className="absolute right-[122px] -bottom-[22px] z-20 flex max-md:right-[30px]">
            <button type="button" aria-label="Previous slide" className={carousel.arrow} onClick={() => go(i - 1)}>
              <Icon name="arrow-right" className="h-6 w-6 rotate-180" />
            </button>
            <button type="button" aria-label="Next slide" className={carousel.arrow} onClick={() => go(i + 1)}>
              <Icon name="arrow-right" className="h-6 w-6" />
            </button>
          </div>
          <div className={`absolute top-full right-0 left-0 mt-[19px] h-[22px] ${carousel.dots}`}>
            {slides.map((_, d) => (
              <button
                key={d}
                type="button"
                aria-label={`Go to slide ${d + 1}`}
                aria-current={d === i}
                className={d === i ? carousel.dotActive : carousel.dot}
                onClick={() => go(d)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

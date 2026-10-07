"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { carousel } from "@/lib/tokens";

/**
 * Horizontal product carousel (source: Splide rail, 4 tiles visible, arrows top-right, no dots).
 * Native scroll-snap track moved by the 44px arrow buttons one page at a time; arrows hide when the
 * tiles fit (static row) and grey out at either end. SSR: first tiles visible, no JS needed.
 */
export function ProductRailClient({
  heading,
  tiles,
  tileClass,
  prevLabel,
  nextLabel,
}: {
  heading?: ReactNode;
  tiles: ReactNode[];
  /** width class of one slide (e.g. "w-[268.5px]") */
  tileClass: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [state, setState] = useState({ overflow: false, start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState({ overflow: max > 2, start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const page = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth + 24), behavior: "smooth" });
  };

  const arrow = (dir: 1 | -1, disabled: boolean) => (
    <button
      type="button"
      aria-label={dir < 0 ? prevLabel : nextLabel}
      disabled={disabled}
      onClick={() => page(dir)}
      className={`${carousel.arrow} disabled:cursor-default disabled:text-muted disabled:shadow-none`}
    >
      <Icon name="arrow-right" className={`h-5 w-5 ${dir < 0 ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <div aria-roledescription="carousel">
      <div className="mb-[66px] flex min-h-11 items-center justify-between gap-6">
        <div className="min-w-0">{heading}</div>
        {state.overflow && (
          <div className="flex shrink-0 gap-1.5">
            {arrow(-1, state.start)}
            {arrow(1, state.end)}
          </div>
        )}
      </div>
      <ul
        ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tiles.map((t, i) => (
          <li key={i} aria-roledescription="slide" className={`flex shrink-0 snap-start ${tileClass}`}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

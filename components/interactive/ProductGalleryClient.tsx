"use client";
import { useState } from "react";
import { Icon } from "@/components/icons";

interface GalleryImage {
  filename: string;
  alt?: string;
}

/**
 * PDP gallery (source: Splide fade slider + thumbnail strip). Main stage on white with 80px side
 * padding (image object-contain), 44px panel-colored arrow squares overlaid at the vertical centre,
 * a zoom label top-left (muted, 16/22 300); thumbnails below (24px gap) — 3 slots spread
 * edge-to-edge, scrollable beyond 3; optional 12px dots (fischertechnik). Slides fade (opacity).
 * Sizes: fischer stage 678×381 / thumbs 210×118; fischertechnik stage 534×300 / thumbs 178×100.
 */
export function ProductGalleryClient({
  images,
  look,
  zoomLabel,
  prevLabel,
  nextLabel,
  goToLabel,
}: {
  images: GalleryImage[];
  look: "family" | "shop";
  zoomLabel: string;
  prevLabel: string;
  nextLabel: string;
  /** "Bild {n} anzeigen" */
  goToLabel: string;
}) {
  const [i, setI] = useState(0);
  const n = images.length;
  if (n === 0) return null;
  const go = (d: number) => setI((v) => (v + d + n) % n);
  const shop = look === "shop";
  const stage = shop ? "aspect-[534/300]" : "aspect-[678/381]";
  const thumb = shop ? "w-[178px] h-[100px]" : "w-[210px] h-[118px]";

  return (
    <div aria-roledescription="carousel" className="w-full">
      <div className={`relative w-full overflow-hidden bg-white ${stage}`}>
        {images.map((img, k) => (
          <div
            key={k}
            aria-hidden={k !== i}
            className={`absolute inset-0 flex items-center justify-center px-[80px] transition-opacity duration-500 ${
              k === i ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.filename}
              alt={img.alt ?? ""}
              loading={k === 0 ? "eager" : "lazy"}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
        <span className="absolute top-0 left-0 flex h-11 items-center text-[16px] leading-[22px] font-light text-muted">
          <svg viewBox="0 0 44 44" className="-ml-[9px] h-11 w-11" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.25">
            <circle cx="20" cy="20" r="8" />
            <path d="M20 16.5v7M16.5 20h7M26 26l4 4" />
          </svg>
          {zoomLabel}
        </span>
        {n > 1 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                aria-label={d < 0 ? prevLabel : nextLabel}
                onClick={() => go(d)}
                className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center bg-panel text-text transition-colors hover:text-primary"
              >
                <Icon name="arrow-right" className={`h-6 w-6 ${d < 0 ? "rotate-180" : ""}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {n > 1 && (
        <ul
          className={`mt-6 flex gap-6 overflow-x-auto [scrollbar-width:none] ${n <= 3 ? "justify-between" : ""}`}
        >
          {images.map((img, k) => (
            <li key={k} className="shrink-0">
              <button
                type="button"
                aria-label={goToLabel.replace("{n}", String(k + 1))}
                aria-current={k === i}
                onClick={() => setI(k)}
                className={`relative block bg-white ${thumb} ${k === i ? "" : "opacity-90 hover:opacity-100"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.filename}
                  alt=""
                  loading="lazy"
                  className={`h-full w-full ${shop ? "object-contain" : "object-cover"}`}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {shop && n > 1 && (
        <div className="mt-[22px] flex items-center justify-center gap-3">
          {images.map((_, k) => (
            <button
              key={k}
              type="button"
              aria-label={goToLabel.replace("{n}", String(k + 1))}
              aria-current={k === i}
              onClick={() => setI(k)}
              className={`h-3 w-3 rounded-full ${k === i ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

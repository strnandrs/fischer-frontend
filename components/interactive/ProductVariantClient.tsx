"use client";
import { useId, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";

export function ProductVariantClient({
  image,
  imageAlt,
  name,
  articleNumber,
  cells,
  details,
}: {
  image?: string;
  imageAlt?: string;
  name?: string;
  articleNumber?: string;
  cells: ReactNode[];
  details: ReactNode[];
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="grid min-h-[102px] w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 px-[42px] py-3 text-left md:grid-cols-[90px_minmax(0,1.4fr)_repeat(4,minmax(0,1fr))_30px]"
      >
        <span className="hidden h-[90px] w-[90px] md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {image && <img src={image} alt={imageAlt ?? ""} className="h-[90px] w-[90px] object-contain" />}
        </span>
        <span className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-[18px] leading-[28px] font-[600] text-primary">
            {name}
            <Icon name="arrow-right" className="h-5 w-5 shrink-0" />
          </span>
          {articleNumber && (
            <span className="text-[16px] leading-[24px] font-light text-secondary">Art.-Nr. {articleNumber}</span>
          )}
        </span>
        {cells.map((c, i) => (
          <span key={i} className="hidden md:block">
            {c}
          </span>
        ))}
        <Icon
          name="chevron-down"
          strokeWidth={1.25}
          className={`h-[30px] w-[30px] shrink-0 text-text transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div id={id} hidden={!open} className="px-[42px] pt-3 pb-[30px]">
        <p className="mb-4 text-[16px] leading-[24px] font-[600] text-text">Merkmale</p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">{details}</div>
      </div>
    </>
  );
}

"use client";
import { useState } from "react";
import { Icon } from "@/components/icons";

/**
 * One "Verfügbare Optionen" group: label 16/22 600 + wrap of white value chips (112px min, padding
 * 12×24, 14/24 600, 12px gap). Shows the first 10 values; "mehr anzeigen" (14/24 300 primary +
 * chevron) toggles the rest.
 */
export function ProductOptionsClient({
  label,
  values,
  moreLabel,
  lessLabel,
}: {
  label: string;
  values: string[];
  moreLabel: string;
  lessLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const limit = 10;
  const shown = open ? values : values.slice(0, limit);
  return (
    <div>
      <p className="mb-[18px] text-[16px] leading-[22px] font-[600] text-text">{label}</p>
      <ul className="flex flex-wrap gap-3">
        {shown.map((v) => (
          <li
            key={v}
            className="flex min-w-[112px] items-center justify-center bg-white px-6 py-3 text-[14px] leading-6 font-[600] text-text"
          >
            {v}
          </li>
        ))}
      </ul>
      {values.length > limit && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="mt-[18px] inline-flex items-center gap-2 text-[14px] leading-6 font-light text-primary"
        >
          {open ? lessLabel : moreLabel}
          <Icon name="chevron-down" strokeWidth={1.5} className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}

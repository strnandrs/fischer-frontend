"use client";
import { useId, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";

export function AccordionItemClient({
  headline,
  children,
  defaultOpen = false,
}: {
  headline?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <>
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-[81px] w-full cursor-pointer items-center justify-between gap-6 px-6 text-left text-[21px] leading-[31px] font-[600] text-text"
        >
          <span>{headline}</span>
          <Icon
            name="chevron-down"
            strokeWidth={1.25}
            className={`h-[30px] w-[30px] shrink-0 text-text transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      <div id={id} role="region" hidden={!open} className="px-6 pb-[30px]">
        {children}
      </div>
    </>
  );
}

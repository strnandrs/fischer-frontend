"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const OPEN_EVENT = "nav-flyout-open";

/**
 * Flyout open/close for a nav item: hover (mouse only, with a short close delay), click toggle,
 * Escape / outside click / close button to dismiss, aria-expanded on the trigger. Opening one flyout
 * closes all others via a window event, so the header needs no shared state. Optionally controlled
 * (`open` + `onOpenChange`) when a header client component wants to orchestrate.
 */
export default function NavFlyout({
  id,
  label,
  ariaLabel,
  closeLabel,
  triggerClassName,
  children,
  open: controlled,
  onOpenChange,
}: {
  id: string;
  /** Trigger content — text, or any node (e.g. an icon; then pass ariaLabel). */
  label: ReactNode;
  ariaLabel?: string;
  closeLabel: string;
  triggerClassName?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [inner, setInner] = useState(false);
  const open = controlled ?? inner;
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAt = useRef(0);

  const set = useCallback(
    (v: boolean) => {
      setInner(v);
      onOpenChange?.(v);
      if (v) window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    },
    [id, onOpenChange]
  );

  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== id) setInner(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        set(false);
        trigger.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (open && wrap.current && !wrap.current.contains(e.target as Node)) set(false);
    };
    window.addEventListener(OPEN_EVENT, onOther);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOther);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [id, open, set]);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <div
      ref={wrap}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        clear();
        if (!open) hoverOpenedAt.current = Date.now();
        set(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        clear();
        timer.current = setTimeout(() => set(false), 150);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={`${triggerClassName ?? ""} ${open ? "after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:bg-primary" : ""}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={`flyout-${id}`}
        onClick={() => {
          if (!open || Date.now() - hoverOpenedAt.current > 300) set(!open);
        }}
      >
        {label}
      </button>
      <div
        id={`flyout-${id}`}
        hidden={!open}
        className="fixed inset-x-0 top-20 z-40 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
      >
        {children}
        <div className="mx-auto flex w-full max-w-[1920px] justify-end px-[30px] pb-4">
          <button type="button" className="text-[16px] font-[300] hover:text-primary" onClick={() => { set(false); trigger.current?.focus(); }}>
            {closeLabel} ×
          </button>
        </div>
      </div>
    </div>
  );
}

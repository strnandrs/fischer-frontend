"use client";
import { useEffect, useState } from "react";

/**
 * Demo add-to-cart: solid primary large button (padding 17×36, 18/22 600, 2px transparent border →
 * 60px tall). Click shows a client-side toast (site-config.cart_toast) for 3s — no cart, no request.
 */
export function AddToCartClient({ label, toast }: { label: string; toast: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown(false), 3000);
    return () => clearTimeout(t);
  }, [shown]);
  return (
    <>
      <button
        type="button"
        onClick={() => setShown(true)}
        className="inline-block rounded-none border-2 border-transparent bg-primary px-9 py-[17px] text-[18px] leading-[22px] font-[600] text-white transition-colors hover:bg-secondary"
      >
        {label}
      </button>
      <div
        role="status"
        aria-live="polite"
        className={`fixed right-6 bottom-6 z-[60] max-w-sm bg-text px-6 py-4 text-[16px] leading-6 text-white shadow-[0_0_30px_rgba(0,0,0,0.2)] transition-all duration-300 ${
          shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {shown ? toast : ""}
      </div>
    </>
  );
}

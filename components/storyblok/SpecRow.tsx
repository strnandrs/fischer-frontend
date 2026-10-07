import { storyblokEditable } from "@storyblok/react/rsc";
import { type } from "@/lib/tokens";

interface SpecRowBlok {
  _uid: string;
  component: string;
  label?: string;
  value?: string;
}

/**
 * Context-rendered by the parent. Default `row` = technical-data row (label left, value right-aligned,
 * 1px divider); `cell` = variant table cell (value only); `pair` = 'Merkmale' detail pair.
 */
export default function SpecRow({
  blok,
  mode = "row",
}: {
  blok: SpecRowBlok;
  mode?: "row" | "cell" | "pair";
}) {
  const common = { "data-block": "spec-row", ...storyblokEditable(blok as never) };
  if (mode === "cell") {
    return (
      <div {...common} className={`${type.body} font-light text-secondary`}>
        {blok.value}
      </div>
    );
  }
  if (mode === "pair") {
    return (
      <div {...common} className={`${type.body} flex flex-col gap-1 font-light text-secondary`}>
        <span className="text-[14px] leading-6 font-[600]">{blok.label}</span>
        <span>{blok.value}</span>
      </div>
    );
  }
  return (
    <div
      {...common}
      className="flex items-center justify-between gap-6 border-b border-panel-strong py-[10px] text-[16px] leading-[22px] font-light text-secondary"
    >
      <span>{blok.label}</span>
      <span className="text-right">{blok.value}</span>
    </div>
  );
}

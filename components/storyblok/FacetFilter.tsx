import { storyblokEditable } from "@storyblok/react/rsc";
import { Icon } from "@/components/icons";

interface FacetFilterBlok {
  _uid: string;
  component: string;
  facet?: string;
  label?: string;
  open?: boolean;
}

/**
 * Editor config atom. The live filtering UI is built by the product-category block's client
 * component, which reads facet/label/open from these bloks. Standalone it renders a static header.
 */
export default function FacetFilter({ blok }: { blok: FacetFilterBlok }) {
  return (
    <div
      data-block="facet-filter"
      data-facet={blok.facet}
      {...storyblokEditable(blok as never)}
      className="border-b border-panel-strong"
    >
      <div className="flex min-h-[48px] items-center justify-between text-[16px] leading-[28px] font-light text-text">
        <span>{blok.label}</span>
        <Icon
          name="chevron-down"
          strokeWidth={1.25}
          className={`h-[30px] w-[30px] ${blok.open ? "rotate-180" : ""}`}
        />
      </div>
    </div>
  );
}

import { storyblokEditable } from "@storyblok/react/rsc";
import { Icon } from "@/components/icons";

interface ProductPropertyBlok {
  _uid: string;
  component: string;
  icon?: string;
  label?: string;
  value?: string;
}

export default function ProductProperty({ blok }: { blok: ProductPropertyBlok }) {
  return (
    <div
      data-block="product-property"
      {...storyblokEditable(blok as never)}
      className="inline-flex items-center gap-3"
    >
      <Icon name={blok.icon} strokeWidth={1.25} className="h-11 w-11 shrink-0 text-primary" />
      <div className="flex flex-col">
        <span className="text-[14px] leading-6 font-[600] text-secondary">{blok.label}</span>
        <span className="text-[18px] leading-[18px] font-light text-text">{blok.value}</span>
      </div>
    </div>
  );
}

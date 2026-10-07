import { storyblokEditable } from "@storyblok/react/rsc";
import { ProductVariantClient } from "@/components/interactive/ProductVariantClient";
import SpecRow from "./SpecRow";

interface Asset {
  filename?: string;
  alt?: string;
}
interface SpecBlok {
  _uid: string;
  component: string;
  label?: string;
  value?: string;
}
interface ProductVariantBlok {
  _uid: string;
  component: string;
  name?: string;
  article_number?: string;
  image?: Asset;
  specs?: SpecBlok[];
}

export default function ProductVariant({ blok }: { blok: ProductVariantBlok }) {
  const specs = blok.specs ?? [];
  return (
    <div
      data-block="product-variant"
      {...storyblokEditable(blok as never)}
      className="bg-panel"
    >
      <ProductVariantClient
        image={blok.image?.filename}
        imageAlt={blok.image?.alt}
        name={blok.name}
        articleNumber={blok.article_number}
        cells={specs.slice(0, 4).map((s) => (
          <SpecRow key={s._uid} blok={s} mode="cell" />
        ))}
        details={specs.map((s) => (
          <SpecRow key={s._uid} blok={s} mode="pair" />
        ))}
      />
    </div>
  );
}

import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";
import { type } from "@/lib/tokens";

interface Blok {
  _uid: string;
  component: string;
  [key: string]: unknown;
}
interface FooterColumnBlok extends Blok {
  headline?: string;
  links?: Blok[];
}

export default function FooterColumn({ blok }: { blok: FooterColumnBlok }) {
  return (
    <div data-block="footer-column" {...storyblokEditable(blok as never)}>
      <p className={`${type.bodyLarge} mb-3 !font-[600]`}>{blok.headline}</p>
      <ul className="flex flex-col gap-[6px]">
        {blok.links?.map((l) => (
          <li key={l._uid}>
            <StoryblokServerComponent blok={l as never} />
          </li>
        ))}
      </ul>
    </div>
  );
}

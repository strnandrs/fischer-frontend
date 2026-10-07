import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";
import { type } from "@/lib/tokens";

interface Blok {
  _uid: string;
  component: string;
  [key: string]: unknown;
}
interface NavGroupBlok extends Blok {
  headline?: string;
  links?: Blok[];
}

export default function NavGroup({ blok }: { blok: NavGroupBlok }) {
  return (
    <div data-block="nav-group" {...storyblokEditable(blok as never)}>
      {blok.headline && <p className={`${type.body} mb-3 !font-[600]`}>{blok.headline}</p>}
      <ul className="flex flex-col gap-2">
        {blok.links?.map((l) => (
          <li key={l._uid}>
            <StoryblokServerComponent blok={l as never} />
          </li>
        ))}
      </ul>
    </div>
  );
}

import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";
import { container } from "@/lib/tokens";

interface Blok {
  _uid: string;
  component: string;
  headline?: string;
  body?: Blok[];
  [key: string]: unknown;
}

// `page` content type root — a div (the Layout owns the single <main>).
// Sections own their spacing; the only page-level gap is the fixed 120px gap before the footer
// (tokens.footerGap = mt-30 is a margin-top for the footer; applied here as literal pb-30 so Tailwind
// scans it and the gap sits on the page root bottom).
export default function Page({ blok }: { blok: Blok }) {
  // A panel band as the last section runs straight into the footer (source), so the white
  // 120px footer gap is only added after white sections.
  const last = blok.body?.[blok.body.length - 1];
  const bandLast = typeof last?.background === "string" && last.background.startsWith("panel");
  return (
    <div data-block="page" className={bandLast ? "pb-0" : "pb-30"} {...storyblokEditable(blok as never)}>
      {blok.headline && (
        <div className={`${container("contained")} pb-30`}>
          <h1 className="text-[48px] font-[600] leading-[58px] text-text max-md:text-[32px] max-md:leading-[40px]">{blok.headline}</h1>
        </div>
      )}
      {blok.body?.map((b) => <StoryblokServerComponent blok={b as never} key={b._uid} />)}
    </div>
  );
}

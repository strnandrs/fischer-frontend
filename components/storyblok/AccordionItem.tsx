import {
  storyblokEditable,
  StoryblokServerComponent,
  StoryblokServerRichText,
} from "@storyblok/react/rsc";
import { AccordionItemClient } from "@/components/interactive/AccordionItemClient";
import { type } from "@/lib/tokens";

interface AccordionItemBlok {
  _uid: string;
  component: string;
  headline?: string;
  body?: unknown;
  rows?: { _uid: string; component: string }[];
  /** set by a parent that wants the item open initially */
  _open?: boolean;
}

function hasRichText(doc: unknown): boolean {
  const c = (doc as { content?: { content?: unknown[] }[] } | undefined)?.content;
  return !!c && c.some((n) => (n.content?.length ?? 0) > 0);
}

export default function AccordionItem({ blok }: { blok: AccordionItemBlok }) {
  return (
    <div
      data-block="accordion-item"
      {...storyblokEditable(blok as never)}
      className="border-y border-panel-strong -mt-px"
    >
      <AccordionItemClient headline={blok.headline} defaultOpen={blok._open}>
        {hasRichText(blok.body) && (
          <StoryblokServerRichText
            document={blok.body as never}
            className={`${type.bodyLarge} font-light [&_a]:underline [&_p+p]:mt-[18px] [&_p>strong]:font-[600]`}
          />
        )}
        {blok.rows && blok.rows.length > 0 && (
          <div className="mt-6">
            {blok.rows.map((r) => (
              <StoryblokServerComponent blok={r} key={r._uid} />
            ))}
          </div>
        )}
      </AccordionItemClient>
    </div>
  );
}

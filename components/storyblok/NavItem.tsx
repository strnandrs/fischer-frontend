import { StoryblokServerComponent, storyblokEditable } from "@storyblok/react/rsc";
import { SbLink, type SbLinkValue } from "@/lib/link";
import { container, type } from "@/lib/tokens";
import NavFlyout from "@/components/interactive/NavFlyout";

interface Blok {
  _uid: string;
  component: string;
  [key: string]: unknown;
}
interface NavItemBlok extends Blok {
  label?: string;
  link?: SbLinkValue;
  overview_links?: Blok[];
  children?: Blok[];
}

const triggerCls = `${type.body} relative inline-flex h-20 items-center px-3 text-text hover:text-primary`;

/**
 * Level-1 nav item. No children + no overview -> direct link. Otherwise a flyout (client NavFlyout owns
 * open/close: hover, click, Escape, aria-expanded; opening one closes the others). Flyout layout is
 * derived from content: thumbnails -> thumbnail grid; nav-group children -> labelled columns; plain
 * nav-links -> list.
 */
export default function NavItem({ blok, closeLabel }: { blok: NavItemBlok; closeLabel?: string }) {
  const kids = blok.children ?? [];
  const overview = blok.overview_links ?? [];
  const editable = storyblokEditable(blok as never);

  if (kids.length === 0 && overview.length === 0) {
    return (
      <li data-block="nav-item" {...editable}>
        <SbLink link={blok.link} className={triggerCls}>
          {blok.label}
        </SbLink>
      </li>
    );
  }

  const hasThumbs = kids.some((k) => k.component === "nav-link" && (k.image as { filename?: string } | undefined)?.filename);
  const hasGroups = kids.some((k) => k.component === "nav-group");
  const render = (b: Blok) => <StoryblokServerComponent blok={b as never} key={b._uid} />;

  let body: React.ReactNode;
  if (hasThumbs) {
    body = <ul className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3 lg:grid-cols-4">{kids.map((k) => <li key={k._uid}>{render(k)}</li>)}</ul>;
  } else if (hasGroups) {
    // consecutive plain links collapse into one unlabelled column
    const cols: Blok[][] = [];
    for (const k of kids) {
      if (k.component === "nav-group") cols.push([k]);
      else if (cols.length && cols[cols.length - 1][0].component !== "nav-group") cols[cols.length - 1].push(k);
      else cols.push([k]);
    }
    body = (
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
        {cols.map((c) =>
          c[0].component === "nav-group" ? (
            render(c[0])
          ) : (
            <ul key={c[0]._uid} className="flex flex-col gap-2">
              {c.map((k) => <li key={k._uid}>{render(k)}</li>)}
            </ul>
          )
        )}
      </div>
    );
  } else {
    body = <ul className="flex flex-col gap-2 md:columns-2 lg:columns-3">{kids.map((k) => <li key={k._uid}>{render(k)}</li>)}</ul>;
  }

  return (
    <li data-block="nav-item" {...editable}>
      <NavFlyout id={blok._uid} label={blok.label ?? ""} closeLabel={closeLabel ?? "Schließen"} triggerClassName={triggerCls}>
        <div className={`${container("contained")} py-8`}>
          {overview.length > 0 && (
            <ul className="mb-6 flex flex-wrap gap-x-10 gap-y-2 border-b border-muted pb-5">
              {overview.map((o) => <li key={o._uid}>{render(o)}</li>)}
            </ul>
          )}
          {body}
        </div>
      </NavFlyout>
    </li>
  );
}

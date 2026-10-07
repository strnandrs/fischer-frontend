import { hrefFor } from "@/lib/brands";
import { container } from "@/lib/tokens";
import type { PageResult } from "@/lib/page-story";

// Breadcrumb — layout feature, no editor field: derived from the story path. Measured on both
// sources (breadcrumb.json): a 76px row under the 80px nav (padding 30px 0), 12px/300 links in the
// secondary color, the last item in the text color; no separator glyph — every item carries a 1px
// right border in --color-panel-strong with 14px padding-right and 12px margin-right.
// Labels: each ancestor folder's startpage `headline` (else its name) from the current language
// folder (`{locale}/{brand}/…/`, no language param); the current page uses its own headline/name.
// Home = the brand landing page `/{locale}/{brand}`. Only rendered below the brand start page.

interface Crumb {
  label: string;
  href?: string;
}

type StoryLike = { name?: string; content?: { headline?: unknown; name?: unknown } };

const labelOf = (s: StoryLike | undefined, fallback: string) =>
  (typeof s?.content?.headline === "string" && s.content.headline.trim()) ||
  (typeof s?.content?.name === "string" && s.content.name.trim()) ||
  s?.name ||
  fallback;

async function fetchStartpage(path: string): Promise<StoryLike | undefined> {
  const { getStoryblokApi } = await import("@/lib/storyblok");
  try {
    const { data } = await getStoryblokApi().get(`cdn/stories/${path}/`, { version: "draft" });
    return data.story as StoryLike;
  } catch {
    return undefined;
  }
}

export async function Breadcrumb({ page, hostBrand }: { page: PageResult | null; hostBrand: string | null }) {
  const route = page?.route;
  if (!route?.brand || !page?.story) return null;
  const segs = route.rest.split("/").filter(Boolean);
  if (segs.length === 0) return null; // brand start page: no breadcrumb

  const lang = route.lang;
  const ancestors = await Promise.all(
    segs.slice(0, -1).map((_, i) => fetchStartpage([lang, route.brand, ...segs.slice(0, i + 1)].join("/")))
  );
  const crumbs: Crumb[] = [
    { label: "Home", href: hrefFor(lang, route.brand, "", hostBrand) },
    ...ancestors.map((s, i) => ({
      label: labelOf(s, segs[i]),
      href: hrefFor(lang, route.brand!, segs.slice(0, i + 1).join("/"), hostBrand),
    })),
    { label: labelOf(page.story as StoryLike, segs[segs.length - 1]) },
  ];

  return (
    <nav aria-label="Breadcrumb" data-chrome="breadcrumb" className="py-[30px]">
      <div className={container("contained")}>
        <ol className="flex flex-wrap items-center text-[12px] leading-4 font-[300]">
          {crumbs.map((c, i) => (
            <li key={i} className="mr-3 flex border-r border-panel-strong pr-[14px]">
              {c.href ? (
                <a href={c.href} className="text-secondary hover:underline underline-offset-2">
                  {c.label}
                </a>
              ) : (
                <span aria-current="page" className="text-text">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

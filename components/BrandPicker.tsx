import { getBrands, hrefFor } from "@/lib/brands";

/** `/{locale}` — simple brand picker (local development / no host match). */
export async function BrandPicker({ lang }: { lang: string }) {
  const brands = await getBrands();
  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <h1 className="mb-8 text-3xl font-semibold">Brands</h1>
      {brands.length === 0 ? (
        <p>No brands yet (no site-config story in the config/ folder).</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {brands.map((b) => (
            <li key={b.slug}>
              <a className="block border border-text px-6 py-4 hover:bg-panel" href={hrefFor(lang, b.slug)}>
                {b.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

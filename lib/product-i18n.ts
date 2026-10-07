// Fixed product UI microcopy (NOT editor content — guide Rule 0): labels that are identical on every
// product of a brand/locale. Brand-level shop texts (cart label, toast, VAT note, shipping info) live
// in the site-config "Shop" tab; these are only their German fallbacks. Pure module: safe in server
// and client components.
import { SOURCE_LANG } from "@/lib/languages";

const DICT = {
  de: {
    categories: "Kategorien",
    filter: "Filter",
    no_results: "Keine Produkte gefunden",
    reset_filters: "Filter zurücksetzen",
    art_nr: "Art.-Nr.",
    top_features: "Top Features",
    properties: "Eigenschaften",
    available_options: "Verfügbare Optionen",
    show_variants: "Varianten anzeigen",
    product_variants: "Produktvarianten",
    variants_one: "{n} Variante",
    variants_other: "{n} Varianten",
    age_from: "Alter ab",
    years: "Jahr(e)",
    show_more: "mehr anzeigen",
    show_less: "weniger anzeigen",
    zoom: "Zoom",
    larger_view: "Größere Ansicht",
    all_filters: "Alle Filter anzeigen",
    prev: "Zurück",
    next: "Weiter",
    go_to: "Bild {n} anzeigen",
    cart_label: "In den Warenkorb legen",
    cart_toast: "Demo: Der Artikel wurde in den Warenkorb gelegt.",
    vat_note: "inkl. MwSt.",
  },
  en: {
    categories: "Categories",
    filter: "Filter",
    no_results: "No products found",
    reset_filters: "Reset filters",
    art_nr: "Item no.",
    top_features: "Top features",
    properties: "Properties",
    available_options: "Available options",
    show_variants: "Show variants",
    product_variants: "Product variants",
    variants_one: "{n} variant",
    variants_other: "{n} variants",
    age_from: "Age from",
    years: "year(s)",
    show_more: "show more",
    show_less: "show less",
    zoom: "Zoom",
    larger_view: "Larger view",
    all_filters: "Show all filters",
    prev: "Previous",
    next: "Next",
    go_to: "Show image {n}",
    cart_label: "Add to cart",
    cart_toast: "Demo: the item was added to the cart.",
    vat_note: "incl. VAT",
  },
  fr: {
    categories: "Catégories",
    filter: "Filtre",
    no_results: "Aucun produit trouvé",
    reset_filters: "Réinitialiser les filtres",
    art_nr: "Réf.",
    top_features: "Points forts",
    properties: "Caractéristiques",
    available_options: "Options disponibles",
    show_variants: "Afficher les variantes",
    product_variants: "Variantes du produit",
    variants_one: "{n} variante",
    variants_other: "{n} variantes",
    age_from: "À partir de",
    years: "an(s)",
    show_more: "afficher plus",
    show_less: "afficher moins",
    zoom: "Zoom",
    larger_view: "Agrandir",
    all_filters: "Afficher tous les filtres",
    prev: "Précédent",
    next: "Suivant",
    go_to: "Afficher l'image {n}",
    cart_label: "Ajouter au panier",
    cart_toast: "Démo : l'article a été ajouté au panier.",
    vat_note: "TVA incl.",
  },
  es: {
    categories: "Categorías",
    filter: "Filtro",
    no_results: "No se encontraron productos",
    reset_filters: "Restablecer filtros",
    art_nr: "Ref.",
    top_features: "Características principales",
    properties: "Propiedades",
    available_options: "Opciones disponibles",
    show_variants: "Mostrar variantes",
    product_variants: "Variantes del producto",
    variants_one: "{n} variante",
    variants_other: "{n} variantes",
    age_from: "Edad desde",
    years: "año(s)",
    show_more: "mostrar más",
    show_less: "mostrar menos",
    zoom: "Zoom",
    larger_view: "Vista ampliada",
    all_filters: "Mostrar todos los filtros",
    prev: "Anterior",
    next: "Siguiente",
    go_to: "Mostrar imagen {n}",
    cart_label: "Añadir al carrito",
    cart_toast: "Demo: el artículo se ha añadido al carrito.",
    vat_note: "IVA incl.",
  },
} as const;

export type ProductLabelKey = keyof (typeof DICT)["de"];
export type ProductLabels = Record<ProductLabelKey, string>;

/** Product UI labels for a locale (unknown locale → German). */
export function productLabels(lang?: string): ProductLabels {
  return (DICT as Record<string, ProductLabels>)[lang ?? SOURCE_LANG] ?? DICT.de;
}

/** "{n} Varianten" / "1 Variante". */
export function variantsLabel(n: number, lang?: string): string {
  const l = productLabels(lang);
  return (n === 1 ? l.variants_one : l.variants_other).replace("{n}", String(n));
}

const NUMBER_LOCALES: Record<string, string> = { de: "de-DE", en: "en-GB", fr: "fr-FR", es: "es-ES" };

/** Gross EUR price in the locale's format ("9,99 €"). Empty/invalid → "". */
export function formatPrice(price: unknown, lang?: string): string {
  const n = typeof price === "number" ? price : parseFloat(String(price ?? "").replace(",", "."));
  if (!Number.isFinite(n) || String(price ?? "").trim() === "") return "";
  try {
    return new Intl.NumberFormat(NUMBER_LOCALES[lang ?? SOURCE_LANG] ?? lang ?? "de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(n);
  } catch {
    return `${n.toFixed(2)} €`;
  }
}

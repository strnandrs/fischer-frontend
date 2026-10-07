// Component map: Storyblok component name -> React component. Map key = block `name`.
// generate-block returns entries; the orchestrator batch-registers them here.
// `page` and `site-config` are the content-type roots (site-config = editor-only chrome preview).
import Page from "./Page";
import SiteConfig from "./SiteConfig";
// atoms (shared by both brands)
import Button from "./Button";
import NavLink from "./NavLink";
import NavGroup from "./NavGroup";
import NavItem from "./NavItem";
import FooterColumn from "./FooterColumn";
import SocialLink from "./SocialLink";
import HeroSlide from "./HeroSlide";
import Card from "./Card";
import IconTile from "./IconTile";
// sections (shared by both brands)
import HeroCarousel from "./HeroCarousel";
import CardGrid from "./CardGrid";
import Banner from "./Banner";
import TextBlock from "./TextBlock";
import MediaText from "./MediaText";
import Product from "./Product";
import FeaturedProducts from "./FeaturedProducts";
import ProductCategory from "./ProductCategory";
// product atoms
import SpecRow from "./SpecRow";
import ProductVariant from "./ProductVariant";
import AccordionItem from "./AccordionItem";
import ProductProperty from "./ProductProperty";
import FacetFilter from "./FacetFilter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const components: Record<string, any> = {
  page: Page,
  "site-config": SiteConfig,
  button: Button,
  "nav-link": NavLink,
  "nav-group": NavGroup,
  "nav-item": NavItem,
  "footer-column": FooterColumn,
  "social-link": SocialLink,
  "hero-slide": HeroSlide,
  card: Card,
  "icon-tile": IconTile,
  "hero-carousel": HeroCarousel,
  "card-grid": CardGrid,
  banner: Banner,
  "text-block": TextBlock,
  "media-text": MediaText,
  product: Product,
  "featured-products": FeaturedProducts,
  "product-category": ProductCategory,
  "spec-row": SpecRow,
  "product-variant": ProductVariant,
  "accordion-item": AccordionItem,
  "product-property": ProductProperty,
  "facet-filter": FacetFilter,
};

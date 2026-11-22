import React, { useState, useEffect } from "react";
import { ArrowUp, ChevronRight } from "lucide-react";
import { type Product } from "./ProductCard";
import { CompactCatalogCard } from "./CompactCatalogCard";
import { VariantSelectorSheet } from "./VariantSelectorSheet";

export interface CategoryShelfConfig {
  key: string;
  title: string;
  subtitle?: string;
  categorySlug: string;
  discoveryTag?: string;
}

export const SHELF_CONFIGS: CategoryShelfConfig[] = [
  {
    key: "paints",
    title: "Paints & Emulsions",
    subtitle: "Interior luxury, weatherproof exterior & primers",
    categorySlug: "paint",
    discoveryTag: "All Paints ▸",
  },
  {
    key: "cement",
    title: "Cement & Plaster",
    subtitle: "Bulk rates available • 60 min site delivery",
    categorySlug: "cement",
    discoveryTag: "All Cement ▸",
  },
  {
    key: "steel",
    title: "TMT Steel Bars",
    subtitle: "Tata Tiscon, JSW & Kamdhenu primary steel",
    categorySlug: "steel",
    discoveryTag: "All Steel ▸",
  },
  {
    key: "plywood",
    title: "Plywood, MDF & HDHMR",
    subtitle: "Calibrated, BWP marine & Action TESA boards",
    categorySlug: "wood",
    discoveryTag: "All Plywood ▸",
  },
  {
    key: "hardware",
    title: "Hardware & Fittings",
    subtitle: "Hettich channels, Godrej locks & Dorset hinges",
    categorySlug: "hardware",
    discoveryTag: "All Hardware ▸",
  },
  {
    key: "waterproofing",
    title: "Waterproofing & Adhesives",
    subtitle: "Dr. Fixit, Fevicol SH & Roff tile adhesives",
    categorySlug: "adhesives",
    discoveryTag: "All Adhesives ▸",
  },
  {
    key: "tiles",
    title: "Tiles & Marble",
    subtitle: "Kajaria vitrified, GVT & floor stones",
    categorySlug: "tiles",
    discoveryTag: "All Tiles ▸",
  },
  {
    key: "electrical",
    title: "Electricals & Wires",
    subtitle: "Polycab, Finolex wires & modular switches",
    categorySlug: "electrical",
    discoveryTag: "All Electrical ▸",
  },
  {
    key: "plumbing",
    title: "Plumbing & Sanitary",
    subtitle: "Astral CPVC, Ashirvad pipes & Jaquar fittings",
    categorySlug: "plumbing",
    discoveryTag: "All Plumbing ▸",
  },
  {
    key: "sand-bricks",
    title: "Bricks, Sand & Aggregate",
    subtitle: "River sand, gitti & first-class red bricks",
    categorySlug: "sand",
    discoveryTag: "All Masonry ▸",
  },
];

interface CategoryShowcaseFeedProps {
  getProductsForCategory: (cat: string) => Product[];
  getCartQty: (category: string, name: string) => number;
  onAddToCart: (product: Product, quantity?: number) => void;
  onSetCartQty: (product: Product, quantity: number) => void;
  onSelectCategory: (category: string) => void;
  onOpenDetail?: (product: Product) => void;
}

export const CategoryShowcaseFeed: React.FC<CategoryShowcaseFeedProps> = ({
  getProductsForCategory,
  getCartQty,
  onAddToCart,
  onSetCartQty,
  onSelectCategory,
  onOpenDetail,
}) => {
  // Variant bottom sheet state
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  // Floating Back to Top state
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full relative mt-4 space-y-9">
      {/* ────────────────────────────────────────────────────────────
          FLOATING BACK TO TOP PILL (Appears on scroll past hero)
          ──────────────────────────────────────────────────────────── */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-40 bg-white/95 hover:bg-white active:scale-95 transition-all backdrop-blur-md text-[#1C1C1C] text-[12px] font-extrabold px-3.5 py-1.5 rounded-full shadow-lg border border-black/10 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <ArrowUp className="w-3.5 h-3.5 text-[#1C1C1C]" strokeWidth={2.8} />
          <span>Back to top</span>
        </button>
      )}

      {/* ────────────────────────────────────────────────────────────
          SEQUENTIAL CATEGORY-WISE SHELVES
          ──────────────────────────────────────────────────────────── */}
      {SHELF_CONFIGS.map((shelf, shelfIdx) => {
        const rawProducts = getProductsForCategory(shelf.categorySlug);
        // Show up to 6 top SKUs (2 rows of 3)
        const products = rawProducts.slice(0, 6);

        if (products.length === 0) return null;

        // Extract 3 thumbnails for the Category Footer CTA
        const footerThumbnails = products.slice(0, 3).map((p) => p.image).filter(Boolean) as string[];

        return (
          <section
            key={shelf.key}
            id={`shelf-${shelf.categorySlug}`}
            className="w-full px-3.5 sm:px-6 lg:px-8"
            style={{ contentVisibility: shelfIdx > 2 ? "auto" : "visible" }}
          >
            {/* Shelf Header */}
            <div className="flex items-end justify-between mb-3 px-0.5">
              <div>
                <h3 className="text-[17px] sm:text-[18px] font-black text-[#1C1C1C] tracking-tight leading-snug">
                  {shelf.title}
                </h3>
                {shelf.subtitle && (
                  <p className="text-[11px] font-semibold text-slate-500 leading-tight mt-0.5">
                    {shelf.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* High-Density 3-Column Mobile Grid (4/6 cols on tablet/desktop) */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-4 lg:grid-cols-6 sm:gap-4 w-full">
              {products.map((p, idx) => {
                const qty = getCartQty(p.materialTag, p.title);
                const isPriceDrop = idx === 1 || idx === 5; // Strategic high-conversion price-drop variant
                const lowReturnRate = idx === 2; // Real retail trust signals matching reference

                return (
                  <CompactCatalogCard
                    key={p.id}
                    product={p}
                    cartQty={qty}
                    onAdd={(prod) => onAddToCart(prod, 1)}
                    onSetQty={(prod, quantity) => onSetCartQty(prod, quantity)}
                    onOpenDetail={onOpenDetail}
                    onOpenVariants={(prod) => setVariantProduct(prod)}
                    optionsCount={p.hasOptions ? 3 : idx % 2 === 0 ? 2 : undefined}
                    isPriceDrop={isPriceDrop}
                    lowReturnRate={lowReturnRate}
                    discoveryTag={idx === 0 ? shelf.discoveryTag : undefined}
                    onDiscoveryClick={() => onSelectCategory(shelf.categorySlug)}
                  />
                );
              })}
            </div>

            {/* Signature Category Footer CTA (See all products ▸ with 3 overlapping thumbnails) */}
            <button
              onClick={() => onSelectCategory(shelf.categorySlug)}
              aria-label={`See all products in ${shelf.title}`}
              className="w-full rounded-2xl bg-[#F4F6FA] hover:bg-[#EAEFF7] border border-[#E6EAF0] py-2.5 px-4 flex items-center justify-center gap-2.5 mt-4 active:scale-[0.99] transition group shadow-2xs"
            >
              {/* 3 Overlapping circular product thumbnails */}
              {footerThumbnails.length > 0 && (
                <div className="flex items-center">
                  {footerThumbnails.map((thumb, tIdx) => (
                    <img
                      key={tIdx}
                      src={thumb}
                      alt="Thumbnail"
                      className="w-6 h-6 rounded-full border-2 border-white bg-white object-contain -ml-2 first:ml-0 shadow-2xs shrink-0"
                    />
                  ))}
                </div>
              )}

              {/* Bold label */}
              <span className="text-[12.5px] font-black text-[#0B2545] tracking-tight group-hover:text-blue-800 transition-colors">
                See all {shelf.title} ▸
              </span>
            </button>
          </section>
        );
      })}

      {/* Variant Selector Bottom Sheet */}
      <VariantSelectorSheet
        product={variantProduct}
        isOpen={Boolean(variantProduct)}
        onClose={() => setVariantProduct(null)}
        onSelectVariant={(prod, variant) => {
          onAddToCart(
            {
              ...prod,
              price: variant.price,
              mrp: variant.mrp,
              unit: variant.unit,
              title: `${prod.title} (${variant.label})`,
            },
            1
          );
        }}
      />
    </div>
  );
};

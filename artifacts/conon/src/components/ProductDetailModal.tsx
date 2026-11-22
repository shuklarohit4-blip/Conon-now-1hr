import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Star, Truck, ShoppingCart, ArrowRight } from "lucide-react";
import type { Product, ProductSpec } from "./ProductCard";
import { CononImage } from "./CononImage";
import { QuantityStepper } from "./QuantityStepper";
import { CATALOG_PRODUCTS } from "@/data/catalogData";

const BLINKIT_GREEN = "#1848a0";

/* Build a sensible spec list when a product doesn't supply explicit specs,
   so the technical block is never empty. */
function deriveSpecs(p: any): ProductSpec[] {
  if (p.specifications && Array.isArray(p.specifications) && p.specifications.length > 0) {
    return p.specifications;
  }
  if (p.specs && Array.isArray(p.specs) && p.specs.length > 0) {
    return p.specs;
  }
  // Try finding in CATALOG_PRODUCTS
  const found = CATALOG_PRODUCTS.find(
    (cp) => cp.slug === p.slug || cp.id === p.id || cp.title === p.title
  );
  if (found && found.specifications && found.specifications.length > 0) {
    return found.specifications;
  }

  const specs: ProductSpec[] = [];
  if (p.unit) specs.push({ label: "Pack / Unit", value: p.unit });
  if (p.brand || p.vendor) specs.push({ label: "Brand", value: p.brand || p.vendor! });
  if (p.materialTag) specs.push({ label: "Material", value: p.materialTag });
  specs.push({ label: "Delivery", value: p.deliveryEta || "60 Mins" });
  return specs;
}

export type ProductDetailModalProps = {
  product: any | null;
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  onAddToCart?: (product: any, qty?: number) => void;
  /** Set the cart quantity (enables a −/+ stepper in the footer). */
  onSetQty?: (product: any, qty: number) => void;
  isAdding?: boolean;
  cartQty?: number;
};

/**
 * ProductDetailModal — Blinkit-style product detail bottom sheet that slides
 * up from the bottom. Drag handle + X close, edge-to-edge hero image, title /
 * brand / pricing row, a grid-based technical specifications block, and a
 * sticky full-width solid-green "Add to Cart" footer. Backdrop dims + blurs.
 */
export function ProductDetailModal({
  product,
  open,
  isOpen: isOpenProp,
  onClose,
  onAddToCart,
  onSetQty,
  isAdding = false,
  cartQty = 0,
}: ProductDetailModalProps) {
  const isSheetOpen = Boolean((open ?? isOpenProp ?? (product !== null)) && product !== null);

  // Lock background scroll while the sheet is open.
  React.useEffect(() => {
    if (!isSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSheetOpen]);

  // Image gallery — prefer the explicit images[] list, fall back to the single
  // hero image so older products keep working. Active thumbnail is local state.
  const galleryImages = React.useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length) return product.images;
    const found = CATALOG_PRODUCTS.find(
      (cp) => cp.slug === product.slug || cp.id === product.id || cp.title === product.title
    );
    if (found && found.images && found.images.length) return found.images;
    return product.image ? [product.image] : [];
  }, [product]);

  const [activeImg, setActiveImg] = React.useState(0);
  React.useEffect(() => {
    setActiveImg(0);
  }, [product?.id, isSheetOpen]);

  const heroSrc = galleryImages[activeImg] ?? product?.image;

  const discountPct =
    product && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  const specs = product ? deriveSpecs(product) : [];

  const catalogItem = React.useMemo(() => {
    if (!product) return null;
    return (
      CATALOG_PRODUCTS.find(
        (cp) => cp.slug === product.slug || cp.id === product.id || cp.title === product.title
      ) || null
    );
  }, [product]);

  const productSlug = product?.slug || catalogItem?.slug || product?.id;
  const description = product?.description || catalogItem?.description;
  const highlights = product?.highlights || catalogItem?.highlights || product?.features || [];

  return (
    <AnimatePresence>
      {isSheetOpen && product && (
        <motion.div
          key="product-detail-overlay"
          className="fixed inset-0 z-[70] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop — dark + blur */}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Sheet */}
          <motion.div
            className="relative w-full max-w-[520px] bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-10"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            {/* Scrollable body */}
            <div className="overflow-y-auto pb-6">
              {/* Hero image — massive, edge-to-edge, with floating handle + close */}
              <div className="relative w-full aspect-square bg-[#F8FAFC] flex items-center justify-center p-4">
                <CononImage
                  key={activeImg}
                  src={heroSrc}
                  alt={product.title || product.name}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-1.5 w-10 rounded-full bg-black/15" />
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center active:scale-90 transition hover:bg-white"
                >
                  <X className="w-5 h-5 text-slate-700" strokeWidth={2.6} />
                </button>
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {galleryImages.map((_: string, i: number) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all ${
                          i === activeImg ? "w-4 bg-slate-800" : "w-1.5 bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip — tap to switch the hero image */}
              {galleryImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto px-4 pt-3 scrollbar-hide">
                  {galleryImages.map((img: string, i: number) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`View image ${i + 1}`}
                      onClick={() => setActiveImg(i)}
                      className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                        i === activeImg ? "border-[#16A34A] ring-2 ring-[#16A34A]/20" : "border-slate-200"
                      }`}
                    >
                      <CononImage src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}

              {/* Padded content */}
              <div className="px-5">
                {/* Core info */}
                <div className="mt-3.5 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {product.brand || product.vendor || "CONON-NOW"}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    ⚡ 60 Mins Delivery
                  </span>
                </div>
                <h2 className="mt-2 text-[19px] font-black text-slate-900 leading-tight">
                  {product.title || product.name}
                </h2>

                {/* Rating */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[12px] font-black">
                    {(product.rating || 4.8).toFixed(1)} <Star className="w-3 h-3" fill="currentColor" strokeWidth={0} />
                  </span>
                  <span className="text-[12px] text-slate-400 font-semibold">
                    {(product.reviews || product.reviewsCount || 120).toLocaleString("en-IN")} ratings
                  </span>
                </div>

                {/* Pricing row */}
                <div className="mt-3.5 flex items-baseline flex-wrap gap-x-2.5 gap-y-1">
                  <span className="text-[28px] font-black leading-none text-slate-900 tracking-tight">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-[14px] text-slate-400 line-through">
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="text-[14px] font-black text-[#16A34A]">
                      {discountPct}% OFF
                    </span>
                  )}
                </div>

                {/* Key Highlights */}
                {highlights && highlights.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <h3 className="text-[12px] font-black uppercase tracking-wider text-slate-800 mb-2">
                      Key Highlights
                    </h3>
                    <ul className="space-y-1 text-[13px] text-slate-700">
                      {highlights.map((h: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#16A34A] font-bold shrink-0">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Specifications grid — clean table with #F8FAFC alternating tint */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <h3 className="mb-2.5 text-[12px] font-black uppercase tracking-wider text-slate-800">
                    Technical Specifications
                  </h3>
                  <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 bg-white">
                    {specs.map((s: any, i: number) => (
                      <div
                        key={`${s.label}-${i}`}
                        className={`flex items-center justify-between px-3.5 py-2.5 text-[13px] ${
                          i % 2 === 0 ? "bg-[#F8FAFC]" : "bg-white"
                        }`}
                      >
                        <span className="font-medium text-slate-500 w-2/5 shrink-0">{s.label}</span>
                        <span className="font-semibold text-slate-900 w-3/5 text-right">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {description && (
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <h3 className="mb-1.5 text-[12px] font-black uppercase tracking-wider text-slate-800">
                      Product Description
                    </h3>
                    <p className="text-[13px] leading-relaxed text-slate-600">
                      {description}
                    </p>
                  </div>
                )}

                {/* Link to full product page */}
                {productSlug && (
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <a
                      href={`/product/${productSlug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>View full Product Detail Page</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky footer — solid green Add to Cart / −qty+ stepper */}
            <div
              className="shrink-0 border-t border-slate-100 bg-white px-5 py-3.5"
              style={{ paddingBottom: "calc(0.85rem + env(safe-area-inset-bottom))" }}
            >
              {onSetQty && cartQty > 0 ? (
                <div className="flex items-center gap-3">
                  <QuantityStepper
                    qty={cartQty}
                    onChange={(q) => onSetQty(product, q)}
                    isBusy={isAdding}
                    size="lg"
                    solid
                    className="flex-1"
                    fullWidth
                  />
                  <span className="text-[16px] font-black text-slate-900 shrink-0">
                    ₹{(product.price * cartQty).toLocaleString("en-IN")}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={() => {
                    if (onSetQty) {
                      onSetQty(product, 1);
                    } else if (onAddToCart) {
                      onAddToCart(product, 1);
                    }
                  }}
                  className="w-full flex items-center justify-between px-6 py-3.5 rounded-xl text-white font-black text-[16px] shadow-md active:scale-[0.98] transition disabled:opacity-60 bg-[#16A34A] hover:bg-[#15803D]"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" strokeWidth={2.4} />
                    Add to Cart
                  </span>
                  <span>₹{product.price.toLocaleString("en-IN")}</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Star, Truck, ShoppingCart, Check } from "lucide-react";
import type { Product, ProductSpec } from "./ProductCard";
import { CononImage } from "./CononImage";
import { QuantityStepper } from "./QuantityStepper";

const BLINKIT_GREEN = "#0c831f";

/* Build a sensible spec list when a product doesn't supply explicit specs,
   so the technical block is never empty. */
function deriveSpecs(p: Product): ProductSpec[] {
  if (p.specs && p.specs.length) return p.specs;
  const specs: ProductSpec[] = [];
  if (p.unit) specs.push({ label: "Pack / Unit", value: p.unit });
  if (p.brand || p.vendor) specs.push({ label: "Brand", value: p.brand || p.vendor! });
  if (p.materialTag) specs.push({ label: "Material", value: p.materialTag });
  specs.push({ label: "Delivery", value: p.deliveryEta });
  return specs;
}

export type ProductDetailModalProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  /** Set the cart quantity (enables a −/+ stepper in the footer). */
  onSetQty?: (product: Product, qty: number) => void;
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
  onClose,
  onAddToCart,
  onSetQty,
  isAdding = false,
  cartQty = 0,
}: ProductDetailModalProps) {
  const isOpen = open && product !== null;

  // Lock background scroll while the sheet is open.
  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Image gallery — prefer the explicit images[] list, fall back to the single
  // hero image so older products keep working. Active thumbnail is local state.
  const galleryImages = product
    ? product.images && product.images.length
      ? product.images
      : product.image
        ? [product.image]
        : []
    : [];
  const [activeImg, setActiveImg] = React.useState(0);
  // Reset the gallery to the first image whenever a new product is opened OR the
  // sheet is reopened (so reopening the same product never shows a stale thumb).
  React.useEffect(() => { setActiveImg(0); }, [product?.id, isOpen]);
  const heroSrc = galleryImages[activeImg] ?? product?.image;

  const discountPct =
    product && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  const specs = product ? deriveSpecs(product) : [];

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div
          key="product-detail-overlay"
          className="fixed inset-0 z-[60] flex items-end justify-center"
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            className="relative w-full max-w-[480px] bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            {/* Scrollable body */}
            <div className="overflow-y-auto pb-4">
              {/* Hero image — massive, edge-to-edge, with floating handle + close */}
              <div className="relative w-full aspect-square bg-slate-50">
                <CononImage
                  key={activeImg}
                  src={heroSrc}
                  alt={product.title}
                  className="w-full h-full"
                  loading="eager"
                />
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-1.5 w-10 rounded-full bg-black/15" />
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center active:scale-90 transition"
                >
                  <X className="w-5 h-5 text-slate-700" strokeWidth={2.6} />
                </button>
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {galleryImages.map((_, i) => (
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
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`View image ${i + 1}`}
                      onClick={() => setActiveImg(i)}
                      className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                        i === activeImg
                          ? "border-emerald-600"
                          : "border-slate-200"
                      }`}
                    >
                      <CononImage src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full" />
                    </button>
                  ))}
                </div>
              )}

              {/* Padded content */}
              <div className="px-4">
              {/* Core info */}
              <p className="mt-3 text-[12px] font-bold uppercase tracking-wide text-sky-700">
                {product.brand || product.vendor || "CONON Marketplace"}
              </p>
              <h2 className="mt-0.5 text-[20px] font-black text-slate-900 leading-tight">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[12px] font-black">
                  {product.rating.toFixed(1)} <Star className="w-3 h-3" fill="currentColor" strokeWidth={0} />
                </span>
                <span className="text-[12px] text-slate-400 font-semibold">
                  {product.reviews.toLocaleString("en-IN")} ratings
                </span>
              </div>

              {/* Pricing row */}
              <div className="mt-3 flex items-baseline flex-wrap gap-x-2.5 gap-y-1">
                <span className="text-[28px] font-black leading-none text-slate-900 tracking-tight">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.mrp > product.price && (
                  <span className="text-[14px] text-slate-400 line-through">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {discountPct > 0 && (
                  <span className="text-[14px] font-black" style={{ color: BLINKIT_GREEN }}>
                    {discountPct}% OFF
                  </span>
                )}
              </div>

              {/* Delivery */}
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                <Truck className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={2.2} />
                <p className="text-[13px] text-slate-700">
                  FREE delivery by{" "}
                  <span className="font-black text-slate-900">{product.deliveryEta}</span>
                </p>
              </div>

              {/* Specifications grid — slate card, two columns */}
              <h3 className="mt-5 mb-3 text-[13px] font-black uppercase tracking-wide text-slate-800">
                Specifications Grid
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {specs.map((s, i) => (
                  <div key={`${s.label}-${i}`}>
                    <p className="text-[11px] text-slate-500 mb-1">{s.label}</p>
                    <p className="text-[13px] font-semibold text-slate-900">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Rich text description */}
              <h3 className="mt-6 mb-2 text-[13px] font-black uppercase tracking-wide text-slate-800">
                Description
              </h3>
              <p className="text-[13px] leading-relaxed text-slate-600">
                {product.description?.trim()
                  ? product.description
                  : `${product.title} is a premium, quality-checked material sourced and delivered by CONON. Every batch is inspected for grade, consistency and durability so it performs reliably on site, with free unloading and on-time delivery.`}
              </p>

              {/* Features — bullet list */}
              {product.features && product.features.length > 0 && (
                <>
                  <h3 className="mt-6 mb-2 text-[13px] font-black uppercase tracking-wide text-slate-800">
                    Features
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-[13px] leading-relaxed text-slate-600">
                    {product.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </>
              )}
              </div>
            </div>

            {/* Sticky footer — solid green Add to Cart / −qty+ stepper */}
            <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
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
                  onClick={() => (onSetQty ? onSetQty(product, 1) : onAddToCart?.(product))}
                  className="w-full flex items-center justify-between px-6 py-3.5 rounded-xl text-white font-black text-[16px] shadow-md active:scale-[0.98] transition disabled:opacity-60"
                  style={{ background: BLINKIT_GREEN }}
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" strokeWidth={2.4} />
                    Add to cart
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

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, ChevronDown, Plus, Minus,
  Truck, ShieldCheck, Clock, CheckCircle2, FileText,
  Layers, Package, AlertCircle, Share2, Sparkles, ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { enrichProduct, type EnrichedProductData, type ProductVariant, type BulkTier } from "@/lib/productMetadata";
import { ProductGallerySlide } from "./ProductGallerySlide";
import { RealProductImage } from "./RealProductImage";
import { resolveRealProductImage } from "@/utils/realMediaResolver";

const BLINKIT_GREEN = "#0C831F";
const BLINKIT_GREEN_HOVER = "#0A6E1A";

export interface ProductDetailSheetProps {
  product: any | null;
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onAddToCart?: (product: any, qty?: number) => void;
  onSetQty?: (product: any, qty: number) => void;
  cartQty?: number;
  initialVariantId?: string;
  initialScrollToBulk?: boolean;
}

export function ProductDetailSheet({
  product: rawProduct,
  isOpen: isOpenProp,
  open: openProp,
  onClose,
  onAddToCart,
  onSetQty,
  cartQty = 0,
  initialVariantId,
  initialScrollToBulk = false,
}: ProductDetailSheetProps) {
  const isSheetOpen = Boolean((openProp ?? isOpenProp ?? (rawProduct !== null)) && rawProduct !== null);

  // Enrich product with civil specs, highlights, and verified pricing
  const product: EnrichedProductData | null = useMemo(() => {
    if (!rawProduct) return null;
    return enrichProduct(rawProduct);
  }, [rawProduct]);

  // Gallery carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Scroll state for sticky header
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bulkSectionRef = useRef<HTMLDivElement>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  // Accordion collapse states
  const [accordionKeyInfo, setAccordionKeyInfo] = useState(true);
  const [accordionUsage, setAccordionUsage] = useState(false);
  const [accordionPolicy, setAccordionPolicy] = useState(false);

  // Initialize or reset variant when product changes
  useEffect(() => {
    if (!product) return;
    setActiveSlide(0);
    if (initialVariantId && product.variants.length > 0) {
      const found = product.variants.find((v) => v.id === initialVariantId);
      setSelectedVariant(found || product.variants[0]);
    } else if (product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product?.id, initialVariantId]);

  // Scroll to bulk section if requested
  useEffect(() => {
    if (initialScrollToBulk && isSheetOpen && bulkSectionRef.current) {
      setTimeout(() => {
        bulkSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    }
  }, [initialScrollToBulk, isSheetOpen]);

  // Handle escape key and lock body scroll
  useEffect(() => {
    if (!isSheetOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Deep-link URL & Browser Back support: Push ?product=<slug> into history
    const slug = product?.slug || product?.id;
    if (slug) {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get("product") !== slug) {
          url.searchParams.set("product", slug);
          window.history.pushState({ modalSlug: slug }, "", url.toString());
        }
      } catch (err) {
        // Safe fallback in restricted sandboxes
      }
    }

    const handlePopState = () => {
      onClose();
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);

      // Clean up URL query parameter when modal closes
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has("product")) {
          url.searchParams.delete("product");
          window.history.replaceState({}, "", url.toString());
        }
      } catch (err) {
        // Safe fallback
      }
    };
  }, [isSheetOpen, lightboxOpen, onClose, product?.id, product?.slug]);

  // Scroll listener for sticky compact product header
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const top = scrollContainerRef.current.scrollTop;
    setShowStickyHeader(top > 240);
  }, []);

  if (!isSheetOpen || !product) return null;

  // Derive current effective price, mrp, unit, and bulk tiers based on variant
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentUnit = selectedVariant ? selectedVariant.unit : product.unit;
  const currentDiscountPercent =
    currentMrp > 0 && currentMrp > currentPrice
      ? Math.max(0, Math.round(((currentMrp - currentPrice) / currentMrp) * 100))
      : 0;
  const currentBulkTiers = (selectedVariant?.bulkPricingTiers && selectedVariant.bulkPricingTiers.length > 0)
    ? selectedVariant.bulkPricingTiers
    : product.bulkPricingTiers;

  // Add to cart handler
  const handleAdd = () => {
    const payload = {
      ...rawProduct,
      price: currentPrice,
      mrp: currentMrp,
      unit: currentUnit,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant?.label,
    };
    if (onAddToCart) {
      onAddToCart(payload, 1);
    } else if (onSetQty) {
      onSetQty(payload, (cartQty || 0) + 1);
    }
    toast.success(`Added ${product.title} (${currentUnit}) to cart`);
  };

  const handleStepQty = (delta: number) => {
    const newQty = Math.max(0, (cartQty || 0) + delta);
    const payload = {
      ...rawProduct,
      price: currentPrice,
      mrp: currentMrp,
      unit: currentUnit,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant?.label,
    };
    if (onSetQty) {
      onSetQty(payload, newQty);
    } else if (onAddToCart && delta > 0) {
      onAddToCart(payload, delta);
    }
  };

  const handleApplyBulkTier = (tier: BulkTier) => {
    const payload = {
      ...rawProduct,
      price: tier.price,
      mrp: currentMrp,
      unit: currentUnit,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant?.label,
      isBulkRate: true,
    };
    if (onSetQty) {
      onSetQty(payload, tier.minQty);
    } else if (onAddToCart) {
      onAddToCart(payload, tier.minQty);
    }
    toast.success(`Applied wholesale price ₹${tier.price} (${tier.minQty} units)`);
  };

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4">
        {/* Backdrop (Dark + Blur) */}
        <motion.div
          key="detail-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
        />

        {/* Floating Circular Dark-Translucent Close Button (Outside & Above Sheet) */}
        <motion.div
          key="floating-close-btn"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="relative z-[110] mb-2 sm:mb-3 flex items-center justify-center shrink-0"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Product Details"
            className="w-10 h-10 rounded-full bg-zinc-900/85 hover:bg-zinc-900 text-white flex items-center justify-center shadow-2xl active:scale-90 transition border border-white/20 backdrop-blur-md cursor-pointer"
          >
            <X className="w-5 h-5 text-white stroke-[2.5]" />
          </button>
        </motion.div>

        {/* Sheet Card Container */}
        <motion.div
          key="detail-sheet-container"
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 32, stiffness: 340 }}
          className="relative w-full max-w-[620px] bg-white rounded-t-[24px] sm:rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex flex-col max-h-[88vh] sm:max-h-[86vh] overflow-hidden z-[105]"
        >
          {/* Smart Sticky Compact Product Header (Pins when scrolling past hero) */}
          <div
            className={`absolute top-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-3 transition-all duration-200 ${
              showStickyHeader ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <RealProductImage
                product={product}
                src={product.image}
                title={product.title}
                brand={product.brand}
                category={product.categoryTag}
                alt={product.title}
                className="w-11 h-11 rounded-xl object-contain bg-gray-50 border border-gray-100 p-0.5 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate leading-snug">
                  {product.title}
                </p>
                <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <span>{currentUnit}</span>
                  <span>·</span>
                  <span className="font-bold text-gray-900">₹{currentPrice}</span>
                  {currentDiscountPercent > 0 && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                      {currentDiscountPercent}% OFF
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0 active:scale-95 transition"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto overscroll-contain pb-24"
          >
            {/* ── 1. MULTI-IMAGE CAROUSEL SECTION ──────────────────────── */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#F8FAFC] border-b border-gray-100 overflow-hidden flex items-center justify-center select-none">
              {/* Product Slide Renderer with zero-broken fallback info cards */}
              <div className="w-full h-full">
                <ProductGallerySlide
                  key={activeSlide}
                  src={product.images[activeSlide] || product.image}
                  slideIndex={activeSlide}
                  product={product}
                  onZoom={() => setLightboxOpen(true)}
                />
              </div>

              {/* Prev / Next Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    aria-label="Previous slide"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md active:scale-90 transition backdrop-blur-sm z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    aria-label="Next slide"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md active:scale-90 transition backdrop-blur-sm z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Top Overlaid Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                {currentDiscountPercent > 0 && (
                  <span className="bg-[#1D4ED8] text-white text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md shadow-xs">
                    {currentDiscountPercent}% OFF
                  </span>
                )}
                <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 60 Mins
                </span>
              </div>

              {/* Tap to Zoom Hint */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-gray-600 flex items-center justify-center shadow-xs active:scale-95 transition z-10"
                title="Tap to zoom image"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Bottom Carousel Pill Counter */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 right-3 z-10">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {activeSlide + 1} / {product.images.length}
                  </span>
                </div>
              )}

              {/* Dot Indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        i === activeSlide ? "w-5 bg-gray-900" : "w-1.5 bg-gray-300"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    ></button>
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Mini Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2 px-4 py-2.5 overflow-x-auto border-b border-gray-100 bg-white scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`relative w-12 h-12 rounded-lg border-2 p-0.5 shrink-0 transition-all bg-gray-50 flex items-center justify-center ${
                      i === activeSlide ? "border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs" : "border-gray-200 opacity-70"
                    }`}
                  >
                    {i === 0 ? (
                      <RealProductImage
                        product={product}
                        src={img}
                        title={product.title}
                        brand={product.brand}
                        category={product.categoryTag}
                        alt="Thumbnail 1"
                        variant="thumb"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-950 text-white rounded text-[8px] font-black leading-tight text-center p-0.5">
                        <span>SLIDE</span>
                        <span>{i + 1}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── 2. PRODUCT HEADLINE & PRICING HEADER ─────────────────── */}
            <div className="p-4 sm:p-5 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {product.brand}
                </span>
                <span className="text-[11px] font-semibold text-gray-500">
                  {product.categoryTag}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-2 leading-snug">
                {product.title}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                {product.shortTagline}
              </p>

              {product.fitGuardrailBadge && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>{product.fitGuardrailBadge}</span>
                </div>
              )}

              {/* Price & Unit Display in Header */}
              <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-baseline gap-2.5">
                <span className="text-2xl font-black text-gray-900">
                  ₹{currentPrice}
                </span>
                {currentMrp > currentPrice && (
                  <>
                    <span className="text-sm text-gray-400 font-medium">MRP</span>
                    <span className="text-sm text-gray-400 line-through font-medium">
                      ₹{currentMrp}
                    </span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {currentDiscountPercent}% OFF
                    </span>
                  </>
                )}
                <span className="text-xs font-semibold text-gray-500 ml-auto">
                  Per {currentUnit}
                </span>
              </div>
            </div>

            {/* ── 3. VARIANT SELECTOR (IF MULTI-PACK / MULTI-OPTION) ──── */}
            {product.variants.length > 0 && (
              <div className="px-4 sm:px-5 pb-4">
                <p className="text-[13px] font-bold text-gray-900 mb-2 flex items-center justify-between">
                  <span>Select Pack Size / Option</span>
                  <span className="text-xs font-semibold text-emerald-700">{product.variants.length} Options</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vDiscount = Math.max(0, Math.round(((v.mrp - v.price) / v.mrp) * 100));
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-emerald-950" : "text-gray-900"}`}>
                          {v.label}
                        </p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xs font-black text-gray-900">₹{v.price}</span>
                          {v.mrp > v.price && (
                            <span className="text-[10px] text-gray-400 line-through">₹{v.mrp}</span>
                          )}
                        </div>
                        {vDiscount > 0 && (
                          <span className="text-[9px] font-bold text-emerald-700 block mt-0.5">
                            {vDiscount}% OFF
                          </span>
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 4. "HIGHLIGHTS" SECTION (EXACT TWO-TONE 3-COL GRID) ───── */}
            <div className="px-4 sm:px-5 pb-5">
              <h3 className="text-[17px] font-bold text-gray-900 mb-2.5">
                Highlights
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.highlights.map((h, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-100 overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                  >
                    {/* Top strip: Soft cool-gray header */}
                    <div className="bg-[#F3F4F6] px-3 py-1.5 text-[11px] font-medium text-gray-500 truncate border-b border-gray-100">
                      {h.label}
                    </div>
                    {/* Bottom strip: Pure white value area */}
                    <div className="bg-white px-3 py-2 text-[13px] font-semibold text-gray-900 leading-snug">
                      {h.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 4.5 FREQUENTLY PAIRED WITH / CROSS-SELL STRIP ─────── */}
            {product.pairedProducts && product.pairedProducts.length > 0 && (
              <div className="px-4 sm:px-5 pb-5">
                <div className="bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200/80 rounded-2xl p-3.5">
                  <h3 className="text-[14px] font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Frequently Paired With · Site Essentials</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.pairedProducts.map((paired) => (
                      <div
                        key={paired.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <RealProductImage
                            product={paired}
                            src={paired.image}
                            title={paired.name}
                            brand={paired.brand}
                            category={product.categoryTag}
                            alt={paired.name}
                            variant="thumb"
                            className="w-11 h-11 rounded-lg object-contain bg-gray-50 border border-gray-100 p-0.5 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-gray-900 truncate leading-snug">
                              {paired.name}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium">
                              {paired.brand}
                            </p>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-[13px] font-black text-gray-900">
                                ₹{paired.price}
                              </span>
                              {paired.mrp && paired.mrp > paired.price && (
                                <span className="text-[10px] text-gray-400 line-through">
                                  ₹{paired.mrp}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onAddToCart) {
                              onAddToCart(paired, 1);
                              toast.success(`Added ${paired.name} to cart!`);
                            }
                          }}
                          className="ml-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 active:scale-95 transition shrink-0 cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 5. BULK PRICING STRIP (COMPACT & CLICKABLE) ─────────── */}
            {currentBulkTiers.length > 0 && (
              <div ref={bulkSectionRef} className="px-4 sm:px-5 pb-5">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 uppercase tracking-wide">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span>Wholesale Site Project Tiers</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      Tap to Apply
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {currentBulkTiers.map((tier, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyBulkTier(tier)}
                        className="bg-white hover:bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200 text-left flex items-center justify-between active:scale-[0.98] transition shadow-2xs cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-900">{tier.label}</p>
                          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            Save ₹{tier.savingsPerUnit} per {currentUnit}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-800">₹{tier.price}</span>
                          <span className="text-[9px] text-gray-400 block font-bold">each</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 6. "ALL DETAILS" SECTION (EXACT ACCORDION CARDS) ────── */}
            <div className="px-4 sm:px-5 pb-6">
              <h3 className="text-[17px] font-bold text-gray-900 mb-2.5">
                All details
              </h3>

              <div className="bg-[#F8F9FB] rounded-2xl border border-gray-100 overflow-hidden shadow-2xs divide-y divide-gray-100">
                {/* Accordion 1: Key Information (Expanded by default) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setAccordionKeyInfo((prev) => !prev)}
                    className="w-full px-4 py-3.5 flex items-center justify-between bg-white text-left active:bg-gray-50 transition cursor-pointer"
                  >
                    <span className="text-sm font-bold text-gray-900">Key Information</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        accordionKeyInfo ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {accordionKeyInfo && (
                    <div className="px-4 pb-3.5 pt-1 bg-[#F8F9FB]">
                      <div className="divide-y divide-gray-200/60">
                        {product.keyInformation.map((row, idx) => (
                          <div key={idx} className="py-2.5 flex items-start text-[13px]">
                            {/* Left column (42% width) */}
                            <div className="w-[42%] pr-3 font-semibold text-gray-900 shrink-0 leading-snug">
                              {row.label}
                            </div>
                            {/* Right column (58% width) */}
                            <div className="w-[58%] text-gray-600 leading-snug break-words">
                              {row.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Usage, Storage & Site Tips */}
                <div>
                  <button
                    type="button"
                    onClick={() => setAccordionUsage((prev) => !prev)}
                    className="w-full px-4 py-3.5 flex items-center justify-between bg-white text-left active:bg-gray-50 transition cursor-pointer"
                  >
                    <span className="text-sm font-bold text-gray-900">Usage, Storage &amp; Site Tips</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        accordionUsage ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {accordionUsage && (
                    <div className="px-4 py-3.5 bg-[#F8F9FB] space-y-2.5">
                      {product.usageTips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="font-medium">{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordion 3: Delivery, Cashback & Replacement Policy */}
                <div>
                  <button
                    type="button"
                    onClick={() => setAccordionPolicy((prev) => !prev)}
                    className="w-full px-4 py-3.5 flex items-center justify-between bg-white text-left active:bg-gray-50 transition cursor-pointer"
                  >
                    <span className="text-sm font-bold text-gray-900">Delivery, Cashback &amp; Replacement Policy</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        accordionPolicy ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {accordionPolicy && (
                    <div className="px-4 py-3.5 bg-[#F8F9FB] space-y-2 text-xs text-gray-700 leading-relaxed font-medium">
                      <p className="flex items-start gap-2">
                        <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{product.policyInfo.deliverySla}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{product.policyInfo.replacement}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{product.policyInfo.gstInvoice}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── 7. STICKY BOTTOM ACTION BAR (EXACT BLINKIT FOOTER MATCH) ── */}
          <div className="absolute inset-x-0 bottom-0 bg-white border-t border-gray-100 px-4 py-3.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 z-30">
            {/* Left Side: Unit, Bold Price, MRP, Tax caption */}
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-gray-700 truncate">
                {currentUnit}
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-[17px] font-black text-gray-900">
                  ₹{currentPrice}
                </span>
                {currentMrp > currentPrice && (
                  <>
                    <span className="text-[12px] text-gray-400 font-medium">MRP</span>
                    <span className="text-[13px] text-gray-400 line-through font-medium">
                      ₹{currentMrp}
                    </span>
                    {currentDiscountPercent > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {currentDiscountPercent}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                Inclusive of all taxes
              </p>
            </div>

            {/* Right Side: Solid Green CTA Button or Stepper */}
            <div className="shrink-0">
              {(cartQty || 0) > 0 ? (
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-white font-black text-base shadow-sm"
                  style={{ background: BLINKIT_GREEN }}
                >
                  <button
                    type="button"
                    onClick={() => handleStepQty(-1)}
                    className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center active:scale-90 transition cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-white stroke-[2.5]" />
                  </button>
                  <span className="min-w-[24px] text-center text-sm font-bold">
                    {cartQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStepQty(1)}
                    className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center active:scale-90 transition cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="text-white font-semibold text-[15px] rounded-xl px-7 py-3 min-w-[140px] shadow-sm active:scale-95 transition-all duration-150 cursor-pointer flex items-center justify-center"
                  style={{ background: BLINKIT_GREEN }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = BLINKIT_GREEN_HOVER)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = BLINKIT_GREEN)}
                >
                  Add to cart
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── 8. FULLSCREEN ZOOM LIGHTBOX MODAL ───────────────────────── */}
        {lightboxOpen && (
          <div
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-20 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative max-w-[90vw] max-h-[85vh] p-2">
              <RealProductImage
                product={product}
                src={product.images[activeSlide] || product.image}
                title={product.title}
                brand={product.brand}
                category={product.categoryTag}
                alt={product.title}
                variant="modal"
                className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
              />
              <p className="text-center text-white/80 text-xs mt-3 font-semibold">
                {product.title} · Slide {activeSlide + 1} of {product.images.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}

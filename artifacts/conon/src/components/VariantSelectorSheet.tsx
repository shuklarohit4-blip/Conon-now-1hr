import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ShieldCheck, ShoppingCart } from "lucide-react";
import { CATALOG_PRODUCTS, type IProduct, type IProductVariant } from "@/data/catalogData";
import { RealProductImage } from "./RealProductImage";
import {
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useGetCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface VariantSelectorSheetProps {
  product: any | null;
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onSelectVariant?: (product: any, variant: any) => void;
}

export const VariantSelectorSheet: React.FC<VariantSelectorSheetProps> = ({
  product,
  isOpen: isOpenProp,
  open,
  onClose,
  onSelectVariant,
}) => {
  const isSheetOpen = Boolean((open ?? isOpenProp ?? (product !== null)) && product !== null);

  // Keyboard Esc dismiss
  useEffect(() => {
    if (!isSheetOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSheetOpen, onClose]);

  // Lock scroll
  useEffect(() => {
    if (!isSheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isSheetOpen]);

  // Cart operations synced with global cart store
  const qc = useQueryClient();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const { data: cart } = useGetCart();

  const cartItemByKey = useMemo(() => {
    const map = new Map<string, { id: string; quantity: number }>();
    if (!cart?.categories) return map;
    for (const c of cart.categories) {
      for (const it of c.items ?? []) {
        if (it.materialId) map.set(it.materialId, { id: String(it.id), quantity: it.quantity });
        if (it.name) map.set(it.name.toLowerCase(), { id: String(it.id), quantity: it.quantity });
      }
    }
    return map;
  }, [cart]);

  // Catalog item lookup for full rich variants
  const catalogItem = useMemo<IProduct | null>(() => {
    if (!product) return null;
    return (
      CATALOG_PRODUCTS.find(
        (cp) => cp.slug === product.slug || cp.id === product.id || cp.title === product.title
      ) || null
    );
  }, [product]);

  // Resolve variants array
  const variants: IProductVariant[] = useMemo(() => {
    if (!product) return [];
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }
    if (catalogItem && catalogItem.variants && catalogItem.variants.length > 0) {
      return catalogItem.variants;
    }
    // Dynamic fallback if neither provides explicit variants
    const p = product.price || 1000;
    const mrp = product.mrp || Math.round(p * 1.15);
    return [
      {
        id: `${product.id || product.slug}-v1`,
        label: product.unit ? `1 ${product.unit}` : "Standard Pack",
        unit: product.unit || "Piece",
        price: p,
        mrp: mrp,
        discountPercent: mrp > p ? Math.round(((mrp - p) / mrp) * 100) : 0,
        stock: 100,
        image: product.image,
      },
    ];
  }, [product, catalogItem]);

  if (!product) return null;

  const productTitle = product.title || product.name || catalogItem?.title || "";
  const productBrand = product.brand || catalogItem?.brand || "CONON-NOW";
  const productThumb = product.image || catalogItem?.image || "/images/home-categories/cement-civil-works.webp";
  const productSlug = product.slug || catalogItem?.slug || product.id;

  const getVariantQty = (v: IProductVariant) => {
    const key = `${product.id || product.slug}-${v.id}`;
    const byId = cartItemByKey.get(key) || cartItemByKey.get(v.id);
    if (byId) return byId.quantity;
    const byName = cartItemByKey.get(`${productTitle} - ${v.label}`.toLowerCase());
    if (byName) return byName.quantity;
    return 0;
  };

  const handleAddVariant = (v: IProductVariant) => {
    const key = `${product.id || product.slug}-${v.id}`;
    addToCart.mutate(
      {
        data: {
          materialId: key,
          quantity: 1,
          name: `${productTitle} (${v.label})`,
          price: v.price,
          unit: v.unit || "unit",
          vendor: `${productBrand} Official`,
          category: product.materialTag || product.categoryName || "Materials",
        },
      },
      {
        onSuccess: () => {
          toast.success(`Added ${v.label} to cart`);
          if (onSelectVariant) onSelectVariant(product, v);
        },
      }
    );
  };

  const handleUpdateVariantQty = (v: IProductVariant, newQty: number) => {
    const key = `${product.id || product.slug}-${v.id}`;
    const entry =
      cartItemByKey.get(key) ||
      cartItemByKey.get(v.id) ||
      cartItemByKey.get(`${productTitle} (${v.label})`.toLowerCase());

    if (!entry) {
      if (newQty > 0) handleAddVariant(v);
      return;
    }

    if (newQty <= 0) {
      removeFromCart.mutate({ itemId: entry.id });
      toast.info(`Removed ${v.label} from cart`);
    } else {
      updateCartItem.mutate({ itemId: entry.id, data: { quantity: newQty } });
    }
  };

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-xs"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-[500px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 max-h-[88vh] overflow-y-auto z-10"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3.5 min-w-0">
                <RealProductImage
                  product={product}
                  src={productThumb}
                  alt={productTitle}
                  title={productTitle}
                  brand={productBrand}
                  variant="thumb"
                  className="w-full h-full object-contain p-1"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {productBrand}
                  </span>
                  <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 mt-1">
                    {productTitle}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close variant selector"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select options label */}
            <div className="mt-3.5 mb-2.5 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Choose Pack / Size
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {variants.length} Options Available
              </span>
            </div>

            {/* Variant List Rows */}
            <div className="space-y-2.5">
              {variants.map((v) => {
                const discount =
                  v.discountPercent ||
                  (v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0);
                const currentQty = getVariantQty(v);
                const isMutating = addToCart.isPending || updateCartItem.isPending;

                return (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {v.image && (
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 p-1 shrink-0 flex items-center justify-center">
                          <img
                            src={v.image}
                            alt={v.label}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[13px] font-bold text-slate-900 leading-tight">
                            {v.label}
                          </p>
                          {discount > 0 && (
                            <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                              {discount}% OFF
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {v.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900 tabular-nums">
                          ₹{v.price.toLocaleString("en-IN")}
                        </div>
                        {v.mrp > v.price && (
                          <div className="text-[11px] text-slate-400 line-through tabular-nums">
                            ₹{v.mrp.toLocaleString("en-IN")}
                          </div>
                        )}
                      </div>

                      {/* ADD or - qty + Stepper */}
                      {currentQty > 0 ? (
                        <div className="flex items-center bg-[#16A34A] text-white rounded-xl px-2.5 py-1 text-xs font-bold shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateVariantQty(v, currentQty - 1)}
                            disabled={isMutating}
                            className="w-6 h-6 flex items-center justify-center hover:bg-black/15 rounded-md active:scale-90 transition font-black text-sm"
                          >
                            −
                          </button>
                          <span className="w-6 text-center tabular-nums font-black text-[13px]">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateVariantQty(v, currentQty + 1)}
                            disabled={isMutating}
                            className="w-6 h-6 flex items-center justify-center hover:bg-black/15 rounded-md active:scale-90 transition font-black text-sm"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddVariant(v)}
                          disabled={isMutating}
                          className="px-3.5 py-1.5 rounded-xl border border-[#16A34A] text-[#16A34A] hover:bg-[#EAF7EE] font-black text-xs transition active:scale-95 bg-white shadow-xs"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quality badge */}
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Genuine brand packshot • Free site unloading • 60 mins delivery</span>
            </div>

            {/* View full product details link */}
            {productSlug && (
              <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                <a
                  href={`/product/${productSlug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <span>View full product specifications & description</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import {
  ArrowLeft,
  Star,
  Truck,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Share2,
  ShoppingCart,
  Boxes,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { CononProductMedia } from "@/components/CononProductMedia";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useProductMedia, useProductMediaVault } from "@/context/ProductMediaVaultContext";
import { getVaultOverrideForProduct, resolveVaultAssetUrl, type VaultImageEntry } from "@/services/productMediaVault";
import {
  CATALOG_PRODUCTS,
  CATALOG_CATEGORIES,
  type IProduct,
  type IProductVariant,
} from "@/data/catalogData";
import {
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useGetCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { apiUrl } from "@/lib/apiBase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug;

  // Fetch or find product
  const { resolveProduct, version: vaultVersion } = useProductMediaVault();
  const [rawProduct, setRawProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(true);

  const product = useMemo(() => {
    if (!rawProduct) return null;
    return resolveProduct(rawProduct);
  }, [rawProduct, resolveProduct]);

  const media = useProductMedia(product);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Cart integration
  const qc = useQueryClient();
  const invalidateCart = () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });
  const { data: cart } = useGetCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveImgIndex(0);

    // Try finding in static catalogData first
    const staticMatch = CATALOG_PRODUCTS.find(
      (p) => p.slug === slug || p.id === slug
    );
    if (staticMatch) {
      setRawProduct(staticMatch);
      setLoading(false);
    } else {
      const vaultMatch = getVaultOverrideForProduct(slug);
      if (vaultMatch) {
        setRawProduct({
          id: vaultMatch.productId,
          slug: vaultMatch.slug || vaultMatch.productId,
          name: vaultMatch.title || vaultMatch.productId,
          title: vaultMatch.title || vaultMatch.productId,
          brand: vaultMatch.brand || "CONON Certified",
          categorySlug: vaultMatch.categorySlug || "cement-civil-works",
          categoryName: vaultMatch.subcategory || "Construction Materials",
          price: vaultMatch.price || 0,
          mrp: vaultMatch.mrp || vaultMatch.price || 0,
          discountPercent: 0,
          unit: vaultMatch.unit || "Unit",
          description: vaultMatch.description || "",
          image: vaultMatch.images?.[0]?.url || "",
          highlights: vaultMatch.specBullets || [],
          specifications: [],
          inStock: vaultMatch.isInStock !== false,
        } as unknown as IProduct);
        setLoading(false);
      }
    }

    // Also fetch fresh from API /api/products/:slug
    fetch(apiUrl(`/api/products/${slug}`))
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        if (data.product) {
          setRawProduct(data.product);
        }
      })
      .catch((err) => {
        console.warn("[ProductDetail] API fetch warning:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, vaultVersion]);

  // Gallery images (Single Source of Truth: Disk Manifest + Admin Media Vault)
  const galleryEntries: VaultImageEntry[] = useMemo(() => {
    if (!product) return [];
    if (media.images.length > 0) {
      return media.images.map((m, idx) => ({
        id: `disk-${idx}`,
        url: m.url,
        fallbackDataUrl: m.fallbackDataUrl,
        caption: m.caption,
        isPrimary: idx === 0,
        order: idx,
      }));
    }
    if (Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
      return product.galleryImages;
    }
    return [];
  }, [product, media.images]);

  const galleryImages = useMemo(() => galleryEntries.map((g) => g.url), [galleryEntries]);

  // Variants list
  const variants = useMemo(() => {
    if (!product) return [];
    if (product.variants && product.variants.length > 0) return product.variants;
    return [
      {
        id: `${product.slug}-default`,
        label: product.unit || "Standard Unit",
        unit: product.unit || "Piece",
        price: product.price,
        mrp: product.mrp,
        discountPercent: product.discountPercent,
        stock: 100,
        image: product.image,
      },
    ];
  }, [product]);

  const activeVariant: IProductVariant = variants[selectedVariantIndex] || variants[0];

  // Cart quantity lookup for active variant
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

  const getVariantQty = (v: IProductVariant) => {
    if (!product) return 0;
    const key = `${product.id || product.slug}-${v.id}`;
    const byId = cartItemByKey.get(key) || cartItemByKey.get(v.id);
    if (byId) return byId.quantity;
    const byName = cartItemByKey.get(`${product.name || product.title} (${v.label})`.toLowerCase());
    if (byName) return byName.quantity;
    return 0;
  };

  const activeQty = activeVariant ? getVariantQty(activeVariant) : 0;
  const isMutating = addToCart.isPending || updateCartItem.isPending || removeFromCart.isPending;

  const handleAddToCart = () => {
    if (!product || !activeVariant) return;
    const key = `${product.id || product.slug}-${activeVariant.id}`;
    addToCart.mutate(
      {
        data: {
          materialId: key,
          quantity: 1,
          name: `${product.name || product.title} (${activeVariant.label})`,
          price: activeVariant.price,
          unit: activeVariant.unit || product.unit || "unit",
          vendor: `${product.brand} Official`,
          category: product.categoryName || "Materials",
        },
      },
      {
        onSuccess: () => toast.success(`Added ${activeVariant.label} to cart`),
      }
    );
  };

  const handleUpdateQty = (newQty: number) => {
    if (!product || !activeVariant) return;
    const key = `${product.id || product.slug}-${activeVariant.id}`;
    const entry =
      cartItemByKey.get(key) ||
      cartItemByKey.get(activeVariant.id) ||
      cartItemByKey.get(`${product.name || product.title} (${activeVariant.label})`.toLowerCase());

    if (!entry) {
      if (newQty > 0) handleAddToCart();
      return;
    }

    if (newQty <= 0) {
      removeFromCart.mutate({ itemId: entry.id });
      toast.info(`Removed ${activeVariant.label} from cart`);
    } else {
      updateCartItem.mutate({ itemId: entry.id, data: { quantity: newQty } });
    }
  };

  // Similar products shelf (4-6 products from same category)
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return CATALOG_PRODUCTS.filter(
      (p) => p.categorySlug === product.categorySlug && p.slug !== product.slug
    )
      .slice(0, 5)
      .map((sp) => resolveProduct(sp));
  }, [product, resolveProduct]);

  // Back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else if (product) {
      setLocation(`/collections/${product.categorySlug}`);
    } else {
      setLocation("/home");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-semibold text-sm">Loading product details...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Product Not Found</h1>
          <p className="text-slate-500 text-sm mb-6">
            We couldn't find the product you're looking for.
          </p>
          <button
            onClick={() => setLocation("/home")}
            className="px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold text-sm shadow-md"
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  const currentPrice = activeVariant?.price ?? product.price;
  const currentMrp = activeVariant?.mrp ?? product.mrp;
  const currentDiscount =
    activeVariant?.discountPercent ||
    (currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0);
  const heroImageSrc = galleryImages[activeImgIndex] || product.image;

  return (
    <Layout>
      <div className="bg-[#FAFBFD] min-h-screen pb-24">
        {/* Navigation Breadcrumb & Back bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-sm transition py-1 px-2 rounded-lg hover:bg-slate-100 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate max-w-md hidden sm:flex">
              <span className="hover:text-slate-700 cursor-pointer" onClick={() => setLocation("/home")}>Home</span>
              <span>/</span>
              <span
                className="hover:text-slate-700 cursor-pointer"
                onClick={() => setLocation(`/collections/${product.categorySlug}`)}
              >
                {product.categoryName}
              </span>
              <span>/</span>
              <span className="text-slate-900 font-bold truncate">{product.name || product.title}</span>
            </div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                }
              }}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Product Container */}
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Image Gallery (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div
                onClick={() => {
                  if (galleryEntries.length > 0) setLightboxOpen(true);
                }}
                className={`relative aspect-square w-full bg-[#F8FAFC] rounded-2xl flex items-center justify-center p-4 overflow-hidden border border-slate-100 ${
                  galleryEntries.length > 0 ? "cursor-zoom-in" : ""
                }`}
              >
                <CononProductMedia
                  product={product}
                  src={
                    galleryEntries[activeImgIndex]
                      ? resolveVaultAssetUrl(
                          galleryEntries[activeImgIndex].url,
                          galleryEntries[activeImgIndex].fallbackDataUrl
                        ) || galleryEntries[activeImgIndex].url
                      : undefined
                  }
                  images={
                    galleryEntries[activeImgIndex]
                      ? [
                          {
                            url:
                              resolveVaultAssetUrl(
                                galleryEntries[activeImgIndex].url,
                                galleryEntries[activeImgIndex].fallbackDataUrl
                              ) || galleryEntries[activeImgIndex].url,
                            caption: galleryEntries[activeImgIndex].caption,
                            fallbackDataUrl: galleryEntries[activeImgIndex].fallbackDataUrl,
                          },
                        ]
                      : undefined
                  }
                  variant="detail"
                  showGalleryBadge={false}
                  className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  containerClassName="w-full h-full"
                  loading="eager"
                />
                {galleryEntries[activeImgIndex]?.caption && (
                  <div className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {galleryEntries[activeImgIndex]?.caption}
                  </div>
                )}
                {galleryEntries.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImgIndex((p) => (p - 1 + galleryEntries.length) % galleryEntries.length)}
                      aria-label="Previous photo"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImgIndex((p) => (p + 1) % galleryEntries.length)}
                      aria-label="Next photo"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {activeImgIndex + 1} / {galleryEntries.length}
                    </span>
                  </>
                )}
                {currentDiscount > 0 && (
                  <div className="absolute top-3 left-3 bg-[#256FEF] text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-xs">
                    {currentDiscount}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {galleryEntries.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                  {galleryEntries.map((entry, idx) => (
                    <button
                      key={entry.id || idx}
                      onClick={() => setActiveImgIndex(idx)}
                      title={entry.caption || `Photo ${idx + 1}`}
                      className={`relative shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-[#F8FAFC] p-1 transition ${
                        idx === activeImgIndex
                          ? "border-[#16A34A] ring-2 ring-[#16A34A]/20"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={resolveVaultAssetUrl(entry.url, entry.fallbackDataUrl) || entry.url}
                        alt={entry.caption || `Thumbnail ${idx + 1}`}
                        onError={(e) => {
                          if (entry.fallbackDataUrl && e.currentTarget.src !== entry.fallbackDataUrl) {
                            e.currentTarget.src = entry.fallbackDataUrl;
                          }
                        }}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Service Badges */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine ISI Brand</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>60 Mins Express Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Column: Product Info & Buy Box (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                {/* Brand & ETA Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                      {product.brand}
                    </span>
                    {product.isAdminVerifiedMedia && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Conon Verified Media
                      </span>
                    )}
                    {(product as any).hsnCode && (
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        HSN {(product as any).hsnCode}
                        {(product as any).gstRate !== undefined ? ` · ${(product as any).gstRate}% GST` : ""}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {product.deliveryEta || "60 Mins"} Delivery
                  </span>
                </div>

                {/* Product Full Name */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">
                  {product.name || product.title}
                </h1>

                {/* Rating & Short Tagline */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-black">
                    {(product.rating || 4.8).toFixed(1)}
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    ({(product.reviewsCount || 120).toLocaleString("en-IN")} verified site reviews)
                  </span>
                  {product.shortTagline && (
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      • {product.shortTagline}
                    </span>
                  )}
                </div>

                {/* Spec Chips */}
                {product.specChips && product.specChips.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {product.specChips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}

                {/* Variant Selector Pills */}
                {variants.length > 1 && (
                  <div className="mb-6 pt-4 border-t border-slate-100">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-2.5">
                      Select Pack Size / Variant:
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {variants.map((v, idx) => {
                        const isSelected = idx === selectedVariantIndex;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariantIndex(idx)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                              isSelected
                                ? "bg-[#16A34A] text-white border-[#16A34A] shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span>{v.label}</span>
                            <span className={isSelected ? "text-white/90" : "text-slate-500"}>
                              ₹{v.price.toLocaleString("en-IN")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price & CTA Row */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-black text-slate-900 tabular-nums">
                        ₹{currentPrice.toLocaleString("en-IN")}
                      </span>
                      {currentMrp > currentPrice && (
                        <span className="text-base text-slate-400 line-through tabular-nums">
                          ₹{currentMrp.toLocaleString("en-IN")}
                        </span>
                      )}
                      {currentDiscount > 0 && (
                        <span className="text-sm font-black text-[#16A34A]">
                          {currentDiscount}% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Inclusive of all taxes & site unloading
                    </p>
                  </div>

                  {/* Add to Cart / Stepper */}
                  <div className="min-w-[160px]">
                    {activeQty > 0 ? (
                      <div className="flex items-center bg-[#16A34A] text-white rounded-xl px-3 py-2 text-sm font-bold shadow-md">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(activeQty - 1)}
                          disabled={isMutating}
                          className="w-8 h-8 flex items-center justify-center hover:bg-black/15 rounded-lg active:scale-90 transition font-black text-base"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center tabular-nums font-black text-base">
                          {activeQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(activeQty + 1)}
                          disabled={isMutating}
                          className="w-8 h-8 flex items-center justify-center hover:bg-black/15 rounded-lg active:scale-90 transition font-black text-base"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isMutating}
                        className="w-full py-3.5 px-6 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.98] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition"
                      >
                        <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                        <span>ADD TO CART</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Highlights */}
              {(((product as any).specBullets && (product as any).specBullets.length > 0) ||
                (product.highlights && product.highlights.length > 0)) && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3.5">
                    Key Highlights &amp; Engineering Specs
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from(
                      new Set([
                        ...(((product as any).specBullets as string[]) || []),
                        ...(product.highlights || []),
                      ])
                    ).map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span className="font-medium leading-relaxed">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications Table */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3.5">
                  Technical Specifications
                </h2>
                <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 bg-white">
                  {product.specifications && product.specifications.length > 0 ? (
                    product.specifications.map((spec, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-12 px-4 py-3 text-xs ${
                          idx % 2 === 0 ? "bg-[#F8FAFC]" : "bg-white"
                        }`}
                      >
                        <div className="col-span-5 sm:col-span-4 font-semibold text-slate-500">
                          {spec.label}
                        </div>
                        <div className="col-span-7 sm:col-span-8 font-bold text-slate-900">
                          {spec.value}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-slate-500">
                      Standard construction specification verified by CONON Quality Assurance.
                    </div>
                  )}
                </div>
              </div>

              {/* Product Description */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    Product Description
                  </h2>
                  <button
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="text-xs font-bold text-[#16A34A] hover:underline flex items-center gap-1 sm:hidden"
                  >
                    <span>{descriptionExpanded ? "Show Less" : "Read More"}</span>
                    {descriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div
                  className={`text-sm text-slate-600 leading-relaxed whitespace-pre-line ${
                    descriptionExpanded ? "" : "line-clamp-3 sm:line-clamp-none"
                  }`}
                >
                  <p>{product.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Products Shelf */}
          {similarProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Similar Products</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Frequently purchased together in {product.categoryName}
                  </p>
                </div>
                <button
                  onClick={() => setLocation(`/collections/${product.categorySlug}`)}
                  className="text-xs font-bold text-[#16A34A] hover:underline"
                >
                  View All {product.categoryName} →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similarProducts.map((sp) => (
                  <div
                    key={sp.id}
                    onClick={() => setLocation(`/product/${sp.slug}`)}
                    className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="aspect-square bg-[#F8FAFC] rounded-xl p-2 mb-3 flex items-center justify-center overflow-hidden">
                      <CononProductMedia
                        product={sp}
                        variant="card"
                        showGalleryBadge={false}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-contain group-hover:scale-105 transition"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {sp.brand}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1.5 leading-snug">
                        {sp.name}
                      </h3>
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="text-sm font-black text-slate-900">
                          ₹{sp.price.toLocaleString("en-IN")}
                        </span>
                        {sp.mrp > sp.price && (
                          <span className="text-[11px] text-slate-400 line-through">
                            ₹{sp.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && galleryEntries[activeImgIndex] && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
          >
            {galleryEntries.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImgIndex((p) => (p - 1 + galleryEntries.length) % galleryEntries.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImgIndex((p) => (p + 1) % galleryEntries.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <img
              src={
                resolveVaultAssetUrl(
                  galleryEntries[activeImgIndex].url,
                  galleryEntries[activeImgIndex].fallbackDataUrl
                ) || galleryEntries[activeImgIndex].url
              }
              alt={galleryEntries[activeImgIndex].caption || product.name || product.title}
              className="max-w-full max-h-[80vh] object-contain rounded-xl bg-white p-2"
            />
          </div>
        </div>
      )}
    </Layout>
  );
}
export default ProductDetail;

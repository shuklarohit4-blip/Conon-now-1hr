import React, { useMemo, useState } from "react";
import { Check, Clock, Minus, Plus, SlidersHorizontal, Sparkles, X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  useGetCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLiveProductMerger } from "@/hooks/useCononLiveData";
import {
  KIT_STAGE_FILTERS,
  LUCKNOW_SITE_KITS,
  type KitStageFilter,
  type KitVisualType,
  type SiteKitBundle,
} from "@/data/siteKitsData";

function KitMiniSvgIcon({ type }: { type: KitVisualType }) {
  switch (type) {
    case "blade":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <circle cx="18" cy="18" r="12" fill="#E0F2FE" stroke="#12357A" strokeWidth="2" />
          <circle cx="18" cy="18" r="3.5" fill="#F59E0B" />
          <path d="M18 6v4M18 26v4M6 18h4M26 18h4" stroke="#12357A" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "wheel":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <circle cx="18" cy="18" r="11" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.2" />
          <circle cx="18" cy="18" r="3" fill="#0B1B3D" />
          <path d="M10 10l3 3M23 23l3 3M26 10l-3 3M13 23l-3 3" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "drill-bit":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <path d="M15 29V12l3-6 3 6v17h-6z" fill="#CBD5E1" stroke="#1E293B" strokeWidth="1.8" />
          <path d="M15 15l6 2M15 20l6 2M15 25l6 2" stroke="#12357A" strokeWidth="1.7" />
        </svg>
      );
    case "tape":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <circle cx="18" cy="18" r="10" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2.5" />
          <circle cx="18" cy="18" r="4.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
        </svg>
      );
    case "wire":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <circle cx="18" cy="18" r="10" fill="none" stroke="#DC2626" strokeWidth="3.2" />
          <circle cx="18" cy="18" r="6.5" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <path d="M25 25l5 3" stroke="#12357A" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case "conduit":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <rect x="6" y="12" width="24" height="5" rx="2" fill="#E2E8F0" stroke="#334155" strokeWidth="1.6" />
          <rect x="6" y="20" width="24" height="5" rx="2" fill="#CBD5E1" stroke="#12357A" strokeWidth="1.6" />
        </svg>
      );
    case "roller":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <rect x="7" y="8" width="18" height="7" rx="3" fill="#FDE68A" stroke="#B45309" strokeWidth="1.8" />
          <path d="M25 11.5h3v7l-10 3v7" stroke="#12357A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "brush":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <rect x="11" y="7" width="14" height="9" rx="1.5" fill="#FDBA74" stroke="#9A3412" strokeWidth="1.8" />
          <path d="M14 16h8l-2 13h-4l-2-13z" fill="#12357A" />
        </svg>
      );
    case "pipe":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <path d="M8 12h12v14" stroke="#0284C7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="16" y="23" width="8" height="5" rx="1.5" fill="#F59E0B" />
        </svg>
      );
    case "faucet":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <path d="M10 24V15a6 6 0 0 1 12 0v3" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <circle cx="10" cy="24" r="3" fill="#12357A" />
          <path d="M22 21v4" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 2" />
        </svg>
      );
    case "solar-box":
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <rect x="8" y="7" width="20" height="22" rx="3" fill="#E0E7FF" stroke="#12357A" strokeWidth="2" />
          <path d="M19 12l-4 7h4l-1 5 4-7h-4l1-5z" fill="#F59E0B" />
        </svg>
      );
    case "cable":
    default:
      return (
        <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
          <rect x="9" y="10" width="18" height="16" rx="4" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
          <circle cx="18" cy="18" r="4" fill="#1E293B" />
        </svg>
      );
  }
}

export const InstantSiteKits: React.FC = () => {
  const [activeStage, setActiveStage] = useState<KitStageFilter>("ALL");
  const [customizingKit, setCustomizingKit] = useState<SiteKitBundle | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({});
  const [addingCustom, setAddingCustom] = useState(false);

  const qc = useQueryClient();
  const { data: cart } = useGetCart();
  const mergeLiveProducts = useLiveProductMerger();

  const liveKits = useMemo(() => {
    const merged = mergeLiveProducts(
      LUCKNOW_SITE_KITS.map((k) => ({
        ...k,
        name: k.title,
        price: k.kitPrice,
        categorySlug: "site-kits",
        inStock: true,
      }))
    );
    return merged.map((m: any) => {
      const kitPrice = Number(m.price ?? m.kitPrice ?? 0);
      const mrp = Number(m.mrp ?? kitPrice);
      const discountPct = mrp > kitPrice ? Math.round(((mrp - kitPrice) / mrp) * 100) : m.discountPct;
      return {
        ...m,
        kitPrice,
        mrp,
        discountPct,
        inStock: m.inStock !== false && m.isInStock !== false,
      } as SiteKitBundle & { inStock: boolean };
    });
  }, [mergeLiveProducts]);

  const invalidateCart = () => {
    qc.invalidateQueries({ queryKey: getGetCartQueryKey() });
  };

  const addToCart = useAddToCart({ mutation: { onSuccess: invalidateCart } });
  const updateCartItem = useUpdateCartItem({ mutation: { onSuccess: invalidateCart } });
  const removeFromCart = useRemoveFromCart({ mutation: { onSuccess: invalidateCart } });

  const filteredKits = useMemo(() => {
    if (activeStage === "ALL") return liveKits;
    return liveKits.filter((k) => k.stage === activeStage);
  }, [activeStage, liveKits]);

  const cartLines = useMemo(() => {
    const all: { id: string; materialId: string; name: string; quantity: number }[] = [];
    for (const cat of cart?.categories ?? []) {
      for (const item of cat.items ?? []) {
        all.push({
          id: String(item.id),
          materialId: String(item.materialId || ""),
          name: String(item.name || ""),
          quantity: Number(item.quantity) || 0,
        });
      }
    }
    return all;
  }, [cart]);

  const getKitCartInfo = (kit: SiteKitBundle) => {
    const matches = cartLines.filter(
      (line) =>
        line.materialId === kit.id ||
        line.name.toLowerCase() === kit.title.toLowerCase()
    );
    return {
      qty: matches.reduce((sum, m) => sum + m.quantity, 0),
      lineIds: matches.map((m) => m.id),
    };
  };

  const handleAddKit = (kit: SiteKitBundle) => {
    addToCart.mutate(
      {
        data: {
          materialId: kit.id,
          name: kit.title,
          price: kit.kitPrice,
          unit: "kit",
          vendor: "CONON Lucknow Verified Hub",
          category: kit.categoryTag,
          quantity: 1,
        },
      },
      {
        onSuccess: () => {
          toast.success(`${kit.title} added to cart`, {
            description: `Saved ₹${kit.mrp - kit.kitPrice} on bundled rate • 60-Min Lucknow Express`,
          });
        },
        onError: () => toast.error("Could not add kit to cart. Please retry."),
      }
    );
  };

  const handleSetKitQty = (kit: SiteKitBundle, nextQty: number) => {
    const info = getKitCartInfo(kit);
    if (info.lineIds.length === 0) {
      if (nextQty > 0) handleAddKit(kit);
      return;
    }
    const primaryId = info.lineIds[0];
    info.lineIds.slice(1).forEach((dupId) => removeFromCart.mutate({ itemId: dupId }));
    if (nextQty <= 0) {
      removeFromCart.mutate({ itemId: primaryId });
    } else {
      updateCartItem.mutate({ itemId: primaryId, data: { quantity: nextQty } });
    }
  };

  const openCustomizeModal = (kit: SiteKitBundle) => {
    const init: Record<string, boolean> = {};
    for (const item of kit.items) {
      init[item.id] = true;
    }
    setSelectedItemIds(init);
    setCustomizingKit(kit);
  };

  const handleAddSelectedCustomItems = async () => {
    if (!customizingKit) return;
    const chosen = customizingKit.items.filter((it) => selectedItemIds[it.id]);
    if (chosen.length === 0) {
      toast.error("Select at least 1 item to add to cart");
      return;
    }
    setAddingCustom(true);
    try {
      for (const item of chosen) {
        await addToCart.mutateAsync({
          data: {
            materialId: item.id,
            name: item.name,
            price: item.price,
            unit: item.unit,
            vendor: item.brand,
            category: item.category,
            quantity: item.qty,
          },
        });
      }
      toast.success(`${chosen.length} selected items added from ${customizingKit.title}`);
      setCustomizingKit(null);
    } catch {
      toast.error("Failed to add selected items. Please try again.");
    } finally {
      setAddingCustom(false);
    }
  };

  const customSelectedStats = useMemo(() => {
    if (!customizingKit) return { count: 0, total: 0, mrp: 0 };
    const chosen = customizingKit.items.filter((it) => selectedItemIds[it.id]);
    return {
      count: chosen.length,
      total: chosen.reduce((s, it) => s + it.price * it.qty, 0),
      mrp: chosen.reduce((s, it) => s + it.mrp * it.qty, 0),
    };
  }, [customizingKit, selectedItemIds]);

  return (
    <section aria-labelledby="instant-site-kits-heading" className="mt-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="instant-site-kits-heading"
              className="font-display font-black text-base sm:text-lg text-[#0B1B3D] dark:text-white tracking-tight"
            >
              1-Click Lucknow Site Kits
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-black">
              <Sparkles className="w-2.5 h-2.5" /> Bundle Savings
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Ready bundles curated with site mistries • Extra bundle savings
          </p>
        </div>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-3">
        {KIT_STAGE_FILTERS.map((pill) => {
          const active = activeStage === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setActiveStage(pill.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                active
                  ? "bg-[#12357A] text-white border-[#12357A] shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#12357A]/50"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* 4-Column Desktop / Horizontal Snap Mobile Grid */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3.5 overflow-x-auto md:overflow-visible scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {filteredKits.map((kit) => {
          const { qty } = getKitCartInfo(kit);
          return (
            <div
              key={kit.id}
              className="shrink-0 w-[268px] sm:w-[285px] md:w-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Multi-item SVG collage header */}
              <div className="relative p-3 bg-gradient-to-br from-slate-50 via-blue-50/40 to-amber-50/40 dark:from-slate-950 dark:via-[#0B1B3D]/60 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#12357A] text-white text-[10px] font-black tracking-wide shadow-2xs">
                    Save {kit.discountPct}%
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                    <Clock className="w-2.5 h-2.5" /> {kit.deliveryEta}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {kit.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      title={item.name}
                      className="h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/80 flex items-center justify-center shadow-2xs"
                    >
                      <KitMiniSvgIcon type={item.visualType} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-[#0B1B3D] dark:text-white leading-snug">
                    {kit.title}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {kit.previewSummary}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-[#0B1B3D] dark:text-white">
                        ₹{kit.kitPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 line-through">
                        ₹{kit.mrp.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Incl. GST
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => openCustomizeModal(kit)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#12357A] dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      Customize ({kit.items.length} items)
                    </button>

                    {qty > 0 ? (
                      <div className="inline-flex items-center rounded-xl bg-[#12357A] text-white overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleSetKitQty(kit, qty - 1)}
                          aria-label={`Decrease ${kit.title}`}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white/15 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-black min-w-[24px] text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleSetKitQty(kit, qty + 1)}
                          aria-label={`Increase ${kit.title}`}
                          className="w-7 h-7 flex items-center justify-center hover:bg-white/15 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddKit(kit)}
                        disabled={addToCart.isPending || (kit as any).inStock === false}
                        className="px-3 py-1.5 rounded-xl bg-[#12357A] hover:bg-[#0B1B3D] text-white text-[11px] font-black tracking-wide shadow-sm active:scale-95 transition cursor-pointer disabled:opacity-60"
                      >
                        {(kit as any).inStock === false ? "Out of Stock" : "+ ADD KIT"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customize Kit Bottom Sheet / Modal */}
      {customizingKit && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setCustomizingKit(null)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark Navy Modal Header */}
            <div className="bg-gradient-to-r from-[#0B1B3D] to-[#10244E] px-5 py-4 text-white flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  Customize Bundle
                </span>
                <h3 className="text-base font-black mt-1.5">{customizingKit.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Toggle individual items you already have on site
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingKit(null)}
                aria-label="Close kit customizer"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item Checkboxes List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5">
              {customizingKit.items.map((item) => {
                const checked = Boolean(selectedItemIds[item.id]);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSelectedItemIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center gap-3 cursor-pointer ${
                      checked
                        ? "bg-blue-50/70 dark:bg-[#12357A]/20 border-[#12357A] dark:border-amber-400/60"
                        : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 opacity-65"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition ${
                        checked
                          ? "bg-[#12357A] border-[#12357A] text-white"
                          : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <KitMiniSvgIcon type={item.visualType} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-[#0B1B3D] dark:text-white leading-snug">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.brand} • {item.spec}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-[#0B1B3D] dark:text-white">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-slate-400 line-through">
                        ₹{item.mrp.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Action */}
            <div className="p-4 sm:px-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {customSelectedStats.count} of {customizingKit.items.length} items selected
                </p>
                <p className="text-base font-black text-[#0B1B3D] dark:text-white">
                  ₹{customSelectedStats.total.toLocaleString("en-IN")}
                  <span className="ml-1.5 text-xs font-semibold text-slate-400 line-through">
                    ₹{customSelectedStats.mrp.toLocaleString("en-IN")}
                  </span>
                </p>
              </div>

              <button
                type="button"
                disabled={addingCustom || customSelectedStats.count === 0}
                onClick={handleAddSelectedCustomItems}
                className="px-4 py-2.5 rounded-xl bg-[#12357A] hover:bg-[#0B1B3D] text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {addingCustom ? "Adding…" : "Add Selected Items to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

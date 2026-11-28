import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Camera,
  PackageCheck,
  PackageX,
  PlusCircle,
  Search,
  CheckCircle2,
  Power,
  RefreshCw,
  Sparkles,
  Sliders,
  X,
  Droplets,
  Layers,
  Grid,
  ShieldAlert,
  Zap,
  Coffee,
  Package,
  Lock,
  Bath,
  Square,
  Tv,
  Sun,
  Paintbrush,
  Wrench,
  IndianRupee,
  ShieldCheck,
  ArrowUpDown,
  Filter,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  type VendorCatalogItem,
  type VendorCategoryMeta,
  type VendorCatalogState,
  fetchVendorHubCatalog,
  updateProductStockApi,
  updateProductImageApi,
  resetProductImageApi,
  updateProductPriceApi,
  addVendorProductApi,
  toggleCategoryApi,
  restockCategoryApi,
  subscribeToCatalogBus,
} from "@/services/vendorCatalogSync";
import { ProductImageUploader, optimizeImageFile } from "./ProductImageUploader";
import { getSocket } from "@/services/socket";
import { CononProductMedia } from "../CononProductMedia";
import { useVendorTheme, VendorThemeToggle } from "@/context/VendorThemeContext";
import { useVendorLang, VendorLanguageToggle } from "@/context/VendorLanguageContext";
import { isProductAdminLocked } from "@/services/adminMasterCatalog";
import { useProductMediaVault } from "@/context/ProductMediaVaultContext";

// Map category slug to lucide icon component
export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "cctv-networking": Camera,
  "cpvc-plumbing-tanks": Droplets,
  "cement-civil-works": Layers,
  "plywood-boards": Grid,
  "fevicol-adhesives-sealants": ShieldAlert,
  "wires-mcb-electrical": Zap,
  "kitchen-sinks-faucets": Coffee,
  "furniture-wardrobe-bed-hardware": Sliders,
  "modular-kitchen-systems": Package,
  "door-hardware-locks": Lock,
  "sanitary-bath-fittings": Bath,
  "tile-stone-installation": Square,
  "home-appliances": Tv,
  lighting: Sun,
  "solar-rooftop-power": Sun,
  painting: Paintbrush,
  "power-tools-safety": Wrench,
  "safety-workwear": ShieldCheck,
  "safety-ppe-workwear": ShieldCheck,
  "tools-hardware": Wrench,
  "waterproofing-repairing": ShieldAlert,
  "bricks-sand-gitti-aac": Layers,
};

export interface VendorCatalogStudioProps {
  hubId?: string;
  isDrawer?: boolean;
  onClose?: () => void;
}

export function VendorCatalogStudio({
  hubId = "hub-naka",
  isDrawer = false,
  onClose,
}: VendorCatalogStudioProps) {
  const { isDark } = useVendorTheme();
  const { t, lang } = useVendorLang();
  const { resolveProduct } = useProductMediaVault();

  const [catalogState, setCatalogState] = useState<VendorCatalogState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "out_of_stock" | "custom_photos">("all");

  // Photo Uploader Modal Target
  const [activePhotoProduct, setActivePhotoProduct] = useState<VendorCatalogItem | null>(null);

  // Add Product Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("cement-civil-works");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdUnit, setNewProdUnit] = useState("Bag");
  const [newProdDealerPrice, setNewProdDealerPrice] = useState("");
  const [newProdMrp, setNewProdMrp] = useState("");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdInStock, setNewProdInStock] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Inline Price & Qty Edit States (by productId)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editQty, setEditQty] = useState<number>(0);

  // Load catalog data
  const loadData = useCallback(async () => {
    try {
      const data = await fetchVendorHubCatalog(hubId, {
        category: activeCategory,
        search: searchQuery,
        status: statusFilter,
      });
      setCatalogState(data);
    } catch {
      toast.error(lang === "hi" ? "कैटलॉग डेटा लोड करने में त्रुटि" : "Failed to load catalog data.");
    } finally {
      setIsLoading(false);
    }
  }, [hubId, activeCategory, searchQuery, statusFilter, lang]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Real-time listener for Socket.io & Cross-Tab Broadcast Channel
  useEffect(() => {
    const unsubscribeBus = subscribeToCatalogBus(() => {
      void loadData();
    });

    const socket = getSocket();
    const handleSocketUpdate = () => {
      void loadData();
    };

    socket?.on("catalog:stock_updated", handleSocketUpdate);
    socket?.on("catalog:image_updated", handleSocketUpdate);
    socket?.on("catalog:product_created", handleSocketUpdate);
    socket?.on("catalog:category_toggled", handleSocketUpdate);
    socket?.on("catalog:category_restocked", handleSocketUpdate);

    return () => {
      unsubscribeBus();
      socket?.off("catalog:stock_updated", handleSocketUpdate);
      socket?.off("catalog:image_updated", handleSocketUpdate);
      socket?.off("catalog:product_created", handleSocketUpdate);
      socket?.off("catalog:category_toggled", handleSocketUpdate);
      socket?.off("catalog:category_restocked", handleSocketUpdate);
    };
  }, [loadData]);

  // 1-Tap Stock Toggle Handler
  const handleToggleStock = async (product: VendorCatalogItem) => {
    const nextState = !product.inStock;
    setCatalogState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === product.id ? { ...i, inStock: nextState } : i
        ),
      };
    });

    await updateProductStockApi(hubId, product.id, nextState, product.stockQty);
    toast.success(
      lang === "hi"
        ? `${product.name} को अब ${nextState ? "स्टॉक में" : "स्टॉक खत्म (आउट ऑफ स्टॉक)"} मार्क कर दिया है`
        : `${product.name} is now marked ${nextState ? "IN STOCK" : "OUT OF STOCK"}`
    );
  };

  // Morning 1-Click Restock All
  const handleRestockCategory = async (catSlug: string) => {
    await restockCategoryApi(hubId, catSlug);
    toast.success(
      catSlug === "all"
        ? lang === "hi"
          ? "सुबह रीस्टॉक: सभी 16 केटेगरी 100% स्टॉक में मार्क!"
          : "Morning Restock: All categories marked 100% In Stock!"
        : lang === "hi"
        ? "इस केटेगरी के सभी सामान स्टॉक में मार्क हो गए!"
        : "All items in this category marked In Stock!"
    );
    void loadData();
  };

  // Category Toggle Switch
  const handleToggleCategory = async (catSlug: string, currentEnabled: boolean) => {
    const next = !currentEnabled;
    await toggleCategoryApi(hubId, catSlug, next);
    toast.info(
      lang === "hi"
        ? `केटेगरी ${catSlug} ${next ? "सक्रिय" : "रोक दी गई"}`
        : `Category ${catSlug} ${next ? "Enabled" : "Disabled"}`
    );
    void loadData();
  };

  // Inline Price & Qty Save
  const handleSaveInlineEdit = async (product: VendorCatalogItem) => {
    await updateProductPriceApi(hubId, product.id, editPrice, product.mrp, editQty);
    setEditingId(null);
    toast.success(
      lang === "hi"
        ? `${product.name} का भाव व स्टॉक अपडेट हो गया!`
        : `Updated ${product.name} price & stock quantity!`
    );
    void loadData();
  };

  // Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdDealerPrice) {
      toast.error(lang === "hi" ? "कृपया उत्पाद का नाम व डीलर भाव दर्ज करें" : "Please provide product name and dealer price.");
      return;
    }

    try {
      setIsAddingProduct(true);
      const created = await addVendorProductApi(hubId, {
        categorySlug: newProdCategory,
        name: newProdName.trim(),
        brand: newProdBrand.trim() || "Conon Verified",
        unit: newProdUnit.trim() || "Unit",
        dealerPrice: Number(newProdDealerPrice),
        mrp: Number(newProdMrp) || Number(newProdDealerPrice) * 1.25,
        imageUrl: newProdImage || undefined,
        inStock: newProdInStock,
        stockQty: newProdInStock ? 50 : 0,
      });

      if (created) {
        toast.success(
          lang === "hi"
            ? `${created.name} को ${created.categoryName} में जोड़ा गया!`
            : `Added ${created.name} to ${created.categoryName}!`
        );
        setAddModalOpen(false);
        setNewProdName("");
        setNewProdBrand("");
        setNewProdUnit("Bag");
        setNewProdDealerPrice("");
        setNewProdMrp("");
        setNewProdImage("");
        setNewProdInStock(true);
        void loadData();
      }
    } catch {
      toast.error(lang === "hi" ? "नया सामान जोड़ने में त्रुटि हुई" : "Failed to add product.");
    } finally {
      setIsAddingProduct(false);
    }
  };

  const categories = catalogState?.categories || [];
  const items = catalogState?.items || [];

  const themeContainerClass = isDark
    ? "bg-[#0B1120] text-slate-100"
    : "bg-[#F6F7F9] text-slate-900";

  const themeCardClass = isDark
    ? "bg-[#111827] border-slate-800 text-slate-100 shadow-md"
    : "bg-white border-slate-200 text-slate-900 shadow-xs";

  const themeSubtextClass = isDark ? "text-slate-400" : "text-slate-500";
  const themeTitleClass = isDark ? "text-white" : "text-slate-900";

  return (
    <div
      className={`flex flex-col transition-colors duration-200 ${themeContainerClass} ${
        isDrawer ? "h-full p-4 sm:p-6" : "rounded-3xl border border-slate-800 p-6 shadow-2xl"
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BAR & CONTROLS
      ────────────────────────────────────────────────────────────── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 pb-5 border-b ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                isDark ? "text-amber-400" : "text-amber-600"
              }`}
            >
              {t("brandTagline", "CONON PARTNER")}
            </span>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                isDark
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : "bg-emerald-50 text-emerald-700 border-emerald-300"
              }`}
            >
              {lang === "hi" ? "16-केटेगरी स्टूडियो" : "16-Category Studio"}
            </span>
            <span className={`text-[9px] font-bold ${themeSubtextClass}`}>
              {lang === "hi" ? "स्टोरफ्रंट रियल-टाइम सिंक" : "Live Storefront Sync"}
            </span>
          </div>
          <h2 className={`text-lg font-black mt-0.5 flex items-center gap-2 ${themeTitleClass}`}>
            {t("col2Title", "16-Category Visual Catalog & Hedge")}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Language Switcher */}
          <VendorLanguageToggle />

          {/* Theme Toggle */}
          <VendorThemeToggle />

          {/* Morning Restock Button */}
          <button
            type="button"
            onClick={() => handleRestockCategory(activeCategory)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isDark
                ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
            }`}
            title="1-Click Mark All Items In Stock for Morning Counter Opening"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>{lang === "hi" ? "सुबह 1-टैप रीस्टॉक" : "Morning 1-Tap Restock"}</span>
          </button>

          {/* Add Product Modal Trigger */}
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t("addNewProductBtn", "+ Add New Product")}</span>
          </button>

          {isDrawer && onClose && (
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KPI SUMMARY METRICS STRIP
      ────────────────────────────────────────────────────────────── */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b ${
          isDark ? "border-slate-800/80" : "border-slate-200"
        }`}
      >
        <div className={`p-3 rounded-2xl border ${themeCardClass}`}>
          <span className={`text-[10px] font-bold block ${themeSubtextClass}`}>
            {lang === "hi" ? "कुल सक्रिय उत्पाद (SKU)" : "Total Active SKUs"}
          </span>
          <strong className={`text-lg font-black mt-0.5 block ${themeTitleClass}`}>
            {catalogState?.totalItems ?? "..."} {lang === "hi" ? "सामान" : "Items"}
          </strong>
        </div>

        <div
          className={`p-3 rounded-2xl border ${
            isDark
              ? "bg-emerald-950/20 border-emerald-900/40"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
            <PackageCheck className="w-3 h-3" />
            {t("inStockCountLabel", "In Stock")}
          </span>
          <strong className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5 block">
            {catalogState?.inStockCount ?? 0}
          </strong>
        </div>

        <div
          className={`p-3 rounded-2xl border ${
            isDark
              ? "bg-rose-950/20 border-rose-900/40"
              : "bg-rose-50 border-rose-200"
          }`}
        >
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block flex items-center gap-1">
            <PackageX className="w-3 h-3" />
            {t("outOfStockCountLabel", "Out of Stock")}
          </span>
          <strong className="text-lg font-black text-rose-700 dark:text-rose-300 mt-0.5 block">
            {catalogState?.outOfStockCount ?? 0}
          </strong>
        </div>

        <div
          className={`p-3 rounded-2xl border ${
            isDark
              ? "bg-purple-950/20 border-purple-900/40"
              : "bg-purple-50 border-purple-200"
          }`}
        >
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {lang === "hi" ? "दुकान की असली फोटो" : "Custom Shop Floor Photos"}
          </span>
          <strong className="text-lg font-black text-purple-700 dark:text-purple-300 mt-0.5 block">
            {catalogState?.customPhotosCount ?? 0}
          </strong>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. 16-CATEGORY HORIZONTAL PILL STRIP WITH POWER TOGGLE
      ────────────────────────────────────────────────────────────── */}
      <div className={`py-4 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5" />
            {lang === "hi" ? "16 स्टोरफ्रंट केटेगरी और स्टॉक अनुपात:" : "16 Storefront Categories & Stock Ratios:"}
          </span>
          <span className={`text-[11px] ${themeSubtextClass}`}>
            {lang === "hi" ? "दाएं स्क्रॉल करें ➔" : "Scroll sideways ➔"}
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {/* "All Categories" Pill */}
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeCategory === "all"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : isDark
                ? "bg-[#111827] text-slate-300 hover:bg-slate-800 border border-slate-800"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>{t("allCategoriesTab", "All Categories")}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeCategory === "all"
                  ? "bg-slate-950 text-amber-400"
                  : isDark
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {catalogState?.totalItems ?? 0}
            </span>
          </button>

          {/* 16 Category Pills */}
          {categories.map((cat) => {
            const IconComp = CATEGORY_ICON_MAP[cat.slug] || Package;
            const isSelected = activeCategory === cat.slug;

            return (
              <div
                key={cat.slug}
                className={`px-3 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? isDark
                      ? "bg-amber-400/15 border-amber-400 text-amber-300 shadow-md"
                      : "bg-amber-50 border-amber-400 text-amber-900 shadow-xs"
                    : isDark
                    ? "bg-[#111827] border-slate-800 text-slate-300 hover:bg-slate-800/80"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveCategory(cat.slug)}
                  className="flex items-center gap-2 cursor-pointer text-left"
                >
                  <IconComp className={`w-4 h-4 ${isSelected ? "text-amber-500" : "text-slate-400"}`} />
                  <span className="truncate max-w-[140px]">{cat.name}</span>
                </button>

                {/* Live Stock Ratio Badge */}
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                    cat.inStockCount === cat.totalItems && cat.totalItems > 0
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : cat.inStockCount === 0
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                      : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}
                  title={`${cat.inStockCount} of ${cat.totalItems} In Stock`}
                >
                  {cat.inStockCount}/{cat.totalItems}
                </span>

                {/* Category Power Toggle Switch */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleToggleCategory(cat.slug, cat.enabled);
                  }}
                  className={`p-1 rounded-lg transition cursor-pointer ${
                    cat.enabled
                      ? "text-emerald-500 hover:bg-emerald-500/20"
                      : "text-rose-500 hover:bg-rose-500/20"
                  }`}
                  title={cat.enabled ? "Category is Active (Click to Pause)" : "Category is Paused"}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. SEARCH BAR & QUICK FILTERS
      ────────────────────────────────────────────────────────────── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 py-4 border-b ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${themeSubtextClass}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchCatalogPlaceholder", "Search SKU code, product name, or brand...")}
            className={`w-full rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-amber-400 border transition ${
              isDark
                ? "bg-[#111827] border-slate-800 text-white placeholder-slate-500"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 hover:text-slate-900 dark:hover:text-white ${themeSubtextClass}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === "all"
                ? isDark
                  ? "bg-slate-700 text-white font-black"
                  : "bg-slate-900 text-white font-black"
                : isDark
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            {lang === "hi" ? "सभी आइटम" : "All Items"}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("in_stock")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              statusFilter === "in_stock"
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 font-black"
                : isDark
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>{t("inStockBadge", "IN STOCK")}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("out_of_stock")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              statusFilter === "out_of_stock"
                ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 font-black"
                : isDark
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <PackageX className="w-3.5 h-3.5" />
            <span>{t("outOfStockBadge", "OUT OF STOCK")}</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("custom_photos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              statusFilter === "custom_photos"
                ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40 font-black"
                : isDark
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? "कस्टम फोटो" : "Custom Photos"}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. VISUAL PRODUCT CARDS GRID
      ────────────────────────────────────────────────────────────── */}
      <div className="py-6 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-2" />
            <p className="text-xs font-bold">
              {lang === "hi" ? "16 केटेगरी कैटलॉग लोड हो रहा है..." : "Loading 16-category vendor catalog..."}
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${themeCardClass}`}>
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className={`text-sm font-bold ${themeTitleClass}`}>
              {lang === "hi" ? "कोई उत्पाद मैच नहीं हुआ" : "No products match current filters"}
            </h4>
            <p className={`text-xs mt-1 mb-4 ${themeSubtextClass}`}>
              {lang === "hi" ? "केटेगरी बदलें या सर्च शब्द साफ़ करें।" : "Try switching category or clearing the search query."}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              {lang === "hi" ? "सभी फ़िल्टर रीसेट करें" : "Reset All Filters"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((rawProd) => {
              const prod = resolveProduct(rawProd) as typeof rawProd & {
                isAdminVerifiedMedia?: boolean;
                name?: string;
                title?: string;
              };
              const hasCustomPhoto = Boolean(prod.customImage || prod.imageUrl?.startsWith("data:"));
              const isEditing = editingId === prod.id;
              const isVaultVerified = Boolean(prod.isAdminVerifiedMedia);
              const isMasterLocked = Boolean(
                (prod as any).adminLocked ||
                  isVaultVerified ||
                  isProductAdminLocked(prod.id) ||
                  isProductAdminLocked(prod.name)
              );

              return (
                <div
                  key={prod.id}
                  className={`rounded-2xl border transition-all flex flex-col overflow-hidden relative ${
                    prod.inStock
                      ? themeCardClass
                      : isDark
                      ? "bg-[#111827]/60 border-rose-900/40 opacity-85"
                      : "bg-rose-50/50 border-rose-200 opacity-85"
                  }`}
                >
                  {/* Out of Stock Crimson Top Ribbon */}
                  {!prod.inStock && (
                    <div className="bg-rose-600 text-white text-[9px] font-black tracking-wider uppercase text-center py-1">
                      {lang === "hi" ? "आउट ऑफ स्टॉक • स्टोरफ्रंट से छिपा हुआ" : "OUT OF STOCK • HIDDEN ON STOREFRONT"}
                    </div>
                  )}

                  {/* Thumbnail Container with Camera Overlay */}
                  <div
                    className={`relative aspect-4/3 overflow-hidden flex items-center justify-center p-3 group ${
                      isDark ? "bg-slate-900/80" : "bg-slate-100"
                    }`}
                  >
                    <CononProductMedia
                      product={prod}
                      src={prod.imageUrl}
                      title={prod.name}
                      brand={prod.brand}
                      category={prod.categorySlug || prod.categoryName}
                      categorySlug={prod.categorySlug}
                      alt={prod.name}
                      variant="card"
                      isDark={isDark}
                      containerClassName="w-full h-full"
                      className={`w-full h-full object-contain transition-transform duration-200 group-hover:scale-105 ${
                        !prod.inStock ? "grayscale" : ""
                      }`}
                    />

                    {/* Camera Overlay on Hover */}
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isMasterLocked) {
                            toast.info(
                              lang === "hi"
                                ? "यह उत्पाद एडमिन वेरिफाइड मास्टर है। मूल फ़ोटो एडमिन द्वारा सुरक्षित है।"
                                : "Admin Verified Master: Core photo is locked & protected by Conon Admin."
                            );
                            return;
                          }
                          setActivePhotoProduct(prod);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-400/20 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{t("updatePhotoBtn", "Update Photo")}</span>
                      </button>
                    </div>

                    {/* SKU Code Pill */}
                    <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-slate-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border border-slate-800">
                      {prod.skuCode}
                    </span>

                    {/* Admin Verified Media / Master Gold Badge */}
                    {isVaultVerified ? (
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[9px] font-black tracking-wide px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 border border-emerald-300">
                        <Lock className="w-2.5 h-2.5 text-white" />
                        <span>{lang === "hi" ? "एडमिन वेरिफाइड मीडिया" : "Admin Verified Media"}</span>
                      </span>
                    ) : isMasterLocked ? (
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[9px] font-black tracking-wide px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 border border-amber-300">
                        <Lock className="w-2.5 h-2.5 text-slate-950" />
                        <span>{lang === "hi" ? "एडमिन वेरिफाइड मास्टर" : "Admin Verified Master"}</span>
                      </span>
                    ) : hasCustomPhoto ? (
                      <span className="absolute top-2 right-2 bg-purple-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {lang === "hi" ? "कस्टम" : "Custom"}
                      </span>
                    ) : null}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {prod.categoryName}
                        </span>
                        <span className={themeSubtextClass}>{prod.brand}</span>
                      </div>
                      <h4 className={`font-bold text-xs mt-1 line-clamp-2 ${themeTitleClass}`} title={prod.name}>
                        {prod.name}
                      </h4>
                      <p className={`text-[10px] mt-0.5 font-medium ${themeSubtextClass}`}>
                        {lang === "hi" ? "इकाई" : "Unit"}: {prod.unit}
                      </p>
                    </div>

                    {/* Price & Stock Stats (or Inline Editor) */}
                    {isEditing ? (
                      <div
                        className={`p-2.5 rounded-xl border space-y-2 ${
                          isDark ? "bg-slate-900 border-amber-500/40" : "bg-slate-50 border-amber-400"
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className={`text-[9px] block font-bold ${themeSubtextClass}`}>
                              {lang === "hi" ? "डीलर ₹" : "Dealer ₹"}
                            </label>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(Number(e.target.value))}
                              className={`w-full rounded-lg px-2 py-1 text-xs font-bold border ${
                                isDark
                                  ? "bg-[#122444] border-slate-700 text-white"
                                  : "bg-white border-slate-300 text-slate-900"
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`text-[9px] block font-bold ${themeSubtextClass}`}>
                              {lang === "hi" ? "उपलब्ध स्टॉक" : "Stock Qty"}
                            </label>
                            <input
                              type="number"
                              value={editQty}
                              onChange={(e) => setEditQty(Number(e.target.value))}
                              className={`w-full rounded-lg px-2 py-1 text-xs font-bold border ${
                                isDark
                                  ? "bg-[#172847] border-slate-700 text-white"
                                  : "bg-white border-slate-300 text-slate-900"
                              }`}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className={`px-2 py-1 rounded text-[10px] ${themeSubtextClass}`}
                          >
                            {lang === "hi" ? "रद्द करें" : "Cancel"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveInlineEdit(prod)}
                            className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 text-[10px] font-black cursor-pointer shadow-xs"
                          >
                            {lang === "hi" ? "सहेजें" : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`pt-2 border-t flex items-center justify-between text-xs ${
                          isDark ? "border-slate-800" : "border-slate-100"
                        }`}
                      >
                        <div>
                          <span className={`text-[9px] block ${themeSubtextClass}`}>
                            {lang === "hi" ? "डीलर भाव" : "Dealer Price"}
                          </span>
                          <strong className={`font-mono font-bold ${themeTitleClass}`}>
                            ₹{prod.dealerPrice.toLocaleString("en-IN")}
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className={`text-[9px] block ${themeSubtextClass}`}>
                            {lang === "hi" ? "स्टॉक मात्रा" : "Available Qty"}
                          </span>
                          <strong className="text-amber-500 font-mono font-bold">
                            {prod.stockQty} {prod.unit}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(prod.id);
                            setEditPrice(prod.dealerPrice);
                            setEditQty(prod.stockQty);
                          }}
                          className={`p-1 transition cursor-pointer hover:text-amber-500 ${themeSubtextClass}`}
                          title="Edit price & quantity"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* 1-Tap In-Stock / Out-of-Stock Button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(prod)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98 ${
                          prod.inStock
                            ? isDark
                              ? "bg-emerald-500/20 hover:bg-rose-500/20 text-emerald-400 hover:text-rose-400 border border-emerald-500/40 hover:border-rose-500/40"
                              : "bg-emerald-100 hover:bg-rose-100 text-emerald-900 hover:text-rose-900 border border-emerald-300 hover:border-rose-300"
                            : isDark
                            ? "bg-rose-500/20 hover:bg-emerald-500/20 text-rose-400 hover:text-emerald-400 border border-rose-500/40 hover:border-emerald-500/40"
                            : "bg-rose-100 hover:bg-emerald-100 text-rose-900 hover:text-emerald-900 border border-rose-300 hover:border-emerald-300"
                        }`}
                      >
                        {prod.inStock ? (
                          <>
                            <PackageCheck className="w-4 h-4" />
                            <span>
                              {lang === "hi" ? "स्टॉक में है (रोकने के लिए दबाएं)" : "IN STOCK (TAP TO PAUSE)"}
                            </span>
                          </>
                        ) : (
                          <>
                            <PackageX className="w-4 h-4" />
                            <span>
                              {lang === "hi" ? "स्टॉक खत्म (चालू करने के लिए दबाएं)" : "OUT OF STOCK (TAP TO RESTOCK)"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. PHOTO UPLOADER MODAL
      ────────────────────────────────────────────────────────────── */}
      {activePhotoProduct && (
        <ProductImageUploader
          productId={activePhotoProduct.id}
          productName={activePhotoProduct.name}
          productBrand={activePhotoProduct.brand}
          categoryName={activePhotoProduct.categoryName}
          dealerPrice={activePhotoProduct.dealerPrice}
          mrp={activePhotoProduct.mrp}
          currentImageUrl={activePhotoProduct.imageUrl}
          isCustomPhoto={Boolean(activePhotoProduct.customImage)}
          onSaveImage={async (id, dataUrl) => {
            await updateProductImageApi(hubId, id, dataUrl);
            void loadData();
          }}
          onResetImage={async (id) => {
            await resetProductImageApi(hubId, id);
            void loadData();
          }}
          onClose={() => setActivePhotoProduct(null)}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. + ADD NEW PRODUCT MODAL
      ────────────────────────────────────────────────────────────── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`border rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col ${
              isDark ? "bg-[#111827] border-slate-700" : "bg-white border-slate-300 text-slate-900"
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? "bg-[#161F30] border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-500" />
                <h3 className={`text-sm font-black ${themeTitleClass}`}>
                  {lang === "hi" ? "कैटलॉग में नया सामान जोड़ें" : "Add New Product to Catalog"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className={`p-1 hover:text-slate-900 dark:hover:text-white ${themeSubtextClass}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4">
              <div>
                <label className={`text-xs font-bold block mb-1 ${themeTitleClass}`}>
                  {lang === "hi" ? "स्टोरफ्रंट केटेगरी" : "Storefront Category"}
                </label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark
                      ? "bg-[#161F30] border-slate-700 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1 ${themeTitleClass}`}>
                  {lang === "hi" ? "उत्पाद का नाम / विवरण" : "Product Title"}
                </label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Astral CPVC Pro Pipe 1 Inch SDR 11"
                  required
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${
                    isDark
                      ? "bg-[#161F30] border-slate-700 text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold block mb-1 ${themeTitleClass}`}>
                    {lang === "hi" ? "ब्रांड का नाम" : "Brand Name"}
                  </label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    placeholder="e.g. Astral, UltraTech"
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark
                        ? "bg-[#161F30] border-slate-700 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold block mb-1 ${themeTitleClass}`}>
                    {lang === "hi" ? "बिक्री इकाई (यूनिट)" : "Selling Unit"}
                  </label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark
                        ? "bg-[#161F30] border-slate-700 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="Bag">Bag (50kg / 25kg)</option>
                    <option value="Kg">Kg</option>
                    <option value="Piece">Piece / Unit</option>
                    <option value="Box">Box / Carton</option>
                    <option value="Litre">Litre (Can / Bucket)</option>
                    <option value="Bundle">Bundle / Coil</option>
                    <option value="CBM">CBM / CFT</option>
                  </select>
                </div>
              </div>

              {/* Initial Stock Toggle */}
              <div>
                <label className={`text-xs font-bold block mb-1 ${themeTitleClass}`}>
                  {lang === "hi" ? "स्टॉक उपलब्धता" : "Initial Stock Availability"}
                </label>
                <button
                  type="button"
                  onClick={() => setNewProdInStock(!newProdInStock)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-black transition flex items-center justify-between cursor-pointer ${
                    newProdInStock
                      ? isDark
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : isDark
                      ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                      : "bg-rose-50 border-rose-300 text-rose-900"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {newProdInStock ? (
                      <PackageCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <PackageX className="w-4 h-4 text-rose-500" />
                    )}
                    <span>
                      {newProdInStock
                        ? lang === "hi" ? "स्टॉक में है (60 मिनट डिस्पैच)" : "IN STOCK (Ready for 60-Min Dispatch)"
                        : lang === "hi" ? "आउट ऑफ स्टॉक (स्टोरफ्रंट से छिपा)" : "OUT OF STOCK (Hidden from Storefront)"}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      newProdInStock
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {newProdInStock ? (lang === "hi" ? "चालू" : "ACTIVE") : (lang === "hi" ? "बंद" : "PAUSED")}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold block mb-1 ${themeTitleClass}`}>
                    {lang === "hi" ? "डीलर खरीद भाव (₹)" : "Dealer Landing Price (₹)"}
                  </label>
                  <input
                    type="number"
                    value={newProdDealerPrice}
                    onChange={(e) => setNewProdDealerPrice(e.target.value)}
                    placeholder="e.g. 420"
                    required
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark
                        ? "bg-[#161F30] border-slate-700 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold block mb-1 ${themeTitleClass}`}>
                    {lang === "hi" ? "एमआरपी / खुदरा भाव (₹)" : "M.R.P. (₹)"}
                  </label>
                  <input
                    type="number"
                    value={newProdMrp}
                    onChange={(e) => setNewProdMrp(e.target.value)}
                    placeholder="e.g. 520"
                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                      isDark
                        ? "bg-[#161F30] border-slate-700 text-white"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1 ${themeTitleClass}`}>
                  {lang === "hi" ? "उत्पाद फोटो" : "Product Photo"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const res = await optimizeImageFile(e.target.files[0]);
                          setNewProdImage(res.dataUrl);
                          toast.success(lang === "hi" ? "फोटो कंप्रेस हो गई!" : "Photo compressed via Canvas!");
                        } catch {
                          toast.error("Failed to process image.");
                        }
                      }
                    }}
                    className={`text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black ${
                      isDark
                        ? "text-slate-400 file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700"
                        : "text-slate-600 file:bg-slate-100 file:text-amber-700 hover:file:bg-slate-200"
                    }`}
                  />
                  {newProdImage && (
                    <CononProductMedia
                      src={newProdImage}
                      alt="Preview"
                      variant="thumb"
                      showGalleryBadge={false}
                      containerClassName="w-10 h-10 rounded-lg border border-slate-700 overflow-hidden shrink-0"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              <div className={`pt-3 border-t flex items-center justify-end gap-3 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className={`px-4 py-2 text-xs font-bold hover:underline ${themeSubtextClass}`}
                >
                  {lang === "hi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isAddingProduct}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase cursor-pointer shadow-md"
                >
                  {isAddingProduct
                    ? lang === "hi" ? "जोड़ रहे हैं..." : "Adding..."
                    : lang === "hi" ? "लाइव हब में जोड़ें" : "Add to Live Hub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorCatalogStudio;

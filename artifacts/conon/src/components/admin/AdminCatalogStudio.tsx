import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Upload,
  RefreshCw,
  Truck,
  Bike,
  Eye,
  EyeOff,
  X,
  Package,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  Copy,
  Save,
  GripVertical,
  Table2,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { CononProductMedia } from "@/components/CononProductMedia";
import { ProductDetailSheet } from "@/components/ProductDetailSheet";
import { AdminProductEditorModal } from "@/components/admin/AdminProductEditorModal";
import { apiUrl } from "@/lib/apiBase";
import { subscribeSseSync } from "@/services/sseSyncClient";
import {
  resolveCategoryAssetUrl,
  uploadCategoryImageFile,
  reorderBackendCategories,
  refreshLiveCategories,
} from "@/services/liveCategoriesStore";
import {
  type AdminMasterCategory,
  type AdminMasterProduct,
  fetchMasterCategories,
  fetchMasterProducts,
  saveMasterCategory,
  saveMasterProduct,
  bulkUpdateMasterProducts,
  importCsvMasterProducts,
  deleteMasterProduct,
} from "@/services/adminMasterCatalog";

interface AdminCatalogStudioProps {
  initialSubTab?: "products" | "categories";
  onRefreshParent?: () => void;
}

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function isLightHex(hex?: string): boolean {
  if (!hex || !hex.startsWith("#") || hex.length !== 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

export function AdminCatalogStudio({
  initialSubTab = "products",
  onRefreshParent,
}: AdminCatalogStudioProps) {
  const [subTab, setSubTab] = useState<"products" | "categories">(initialSubTab);
  const [categories, setCategories] = useState<AdminMasterCategory[]>([]);
  const [products, setProducts] = useState<AdminMasterProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLockFilter, setSelectedLockFilter] = useState<"all" | "locked" | "unlocked">("all");
  const [inlineEditMode, setInlineEditMode] = useState(false);
  const [inlineDrafts, setInlineDrafts] = useState<
    Record<
      string,
      {
        sellingPrice: number;
        mrp: number;
        bulkPrice: number;
        stockQty: number;
        isInStock: boolean;
      }
    >
  >({});
  const [savingBulk, setSavingBulk] = useState(false);

  // Category Modal + Drag State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catDirty, setCatDirty] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminMasterCategory | null>(null);
  const [catFormName, setCatFormName] = useState("");
  const [catFormNameHi, setCatFormNameHi] = useState("");
  const [catFormSlug, setCatFormSlug] = useState("");
  const [catFormBadge, setCatFormBadge] = useState("");
  const [catFormBadgeColor, setCatFormBadgeColor] = useState("#F2B705");
  const [catFormOrder, setCatFormOrder] = useState<number>(1);
  const [catFormGst, setCatFormGst] = useState<number>(18);
  const [catFormVehicle, setCatFormVehicle] = useState<"LOADER" | "BIKE">("LOADER");
  const [catFormActive, setCatFormActive] = useState(true);
  const [catFormImage, setCatFormImage] = useState("");
  const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);
  const [dragCategoryIndex, setDragCategoryIndex] = useState<number | null>(null);
  const catFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Product Editor + Live Blinkit Preview Sheet
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminMasterProduct | null>(null);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);

  const loadCatalogData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        fetchMasterCategories(),
        fetchMasterProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load catalog data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalogData();

    const handleBusUpdate = (e: any) => {
      const detail = e?.detail;
      if (!detail || detail.type === "category" || detail.type === "product") {
        void loadCatalogData();
      }
    };
    window.addEventListener("conon_catalog_bus", handleBusUpdate);

    const unsubSse = subscribeSseSync((msg) => {
      if (
        msg.type === "CATEGORIES_UPDATED" ||
        msg.type === "CATALOG_UPDATED" ||
        msg.type === "FORCE_SYNC"
      ) {
        void loadCatalogData();
      }
    });

    return () => {
      window.removeEventListener("conon_catalog_bus", handleBusUpdate);
      unsubSse();
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.categorySlug === selectedCategory;
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.hsnCode.includes(term) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(term));
      const matchesLock =
        selectedLockFilter === "all" ||
        (selectedLockFilter === "locked" && p.adminLocked) ||
        (selectedLockFilter === "unlocked" && !p.adminLocked);

      return matchesCategory && matchesSearch && matchesLock;
    });
  }, [products, selectedCategory, searchQuery, selectedLockFilter]);

  /* ── CATEGORY HANDLERS ─────────────────────────────────────────── */
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatDirty(false);
    setCatFormName("");
    setCatFormNameHi("");
    setCatFormSlug("");
    setCatFormBadge("");
    setCatFormBadgeColor("#F2B705");
    setCatFormOrder(categories.length + 1);
    setCatFormGst(18);
    setCatFormVehicle("LOADER");
    setCatFormActive(true);
    setCatFormImage("/images/home-categories/cement-civil-works.webp");
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: AdminMasterCategory) => {
    setEditingCategory(cat);
    setCatDirty(false);
    setCatFormName(cat.name);
    setCatFormNameHi(cat.nameHi || "");
    setCatFormSlug(cat.slug);
    setCatFormBadge(cat.badge || "");
    setCatFormBadgeColor(cat.badgeColor || "#F2B705");
    setCatFormOrder(Number(cat.displayOrder ?? cat.sortOrder ?? 1));
    setCatFormGst(cat.defaultGstRate || 18);
    setCatFormVehicle(cat.vehicleType || "LOADER");
    setCatFormActive(cat.isActive !== false);
    setCatFormImage(cat.imageUrl || "");
    setIsCategoryModalOpen(true);
  };

  const handleCloseCatModalSafe = () => {
    if (catDirty && !window.confirm("Discard unsaved category edits?")) return;
    setIsCategoryModalOpen(false);
  };

  const handleCategoryImageFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Category photo must be <= 5MB.");
      return;
    }
    if (file.type && !ALLOWED_IMAGE_MIMES.has(file.type.toLowerCase())) {
      toast.error("Only JPG, PNG, WebP, or AVIF images are allowed.");
      return;
    }

    try {
      setIsUploadingCatImage(true);
      const targetSlug =
        catFormSlug.trim() ||
        catFormName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") ||
        "category";

      const uploaded = await uploadCategoryImageFile(
        file,
        targetSlug,
        editingCategory?.id || editingCategory?.slug
      );
      setCatDirty(true);
      setCatFormImage(uploaded.url);
      if (editingCategory) {
        await loadCatalogData();
      }
      toast.success(`Uploaded WebP to ${uploaded.rawPath}!`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload category image");
    } finally {
      setIsUploadingCatImage(false);
    }
  };

  const handleToggleCategoryActive = async (cat: AdminMasterCategory) => {
    try {
      await saveMasterCategory({
        ...cat,
        isActive: !cat.isActive,
      });
      toast.success(
        `${cat.name} is now ${!cat.isActive ? "Active on Customer Home" : "Hidden from Customer Home"}`
      );
      await loadCatalogData();
      onRefreshParent?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update visibility");
    }
  };

  const handleReorderTo = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= categories.length || fromIdx === toIdx) return;
    const reordered = [...categories];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const items = reordered.map((c, idx) => ({
      id: c.id,
      slug: c.slug,
      displayOrder: idx + 1,
    }));
    try {
      setCategories(reordered.map((c, idx) => ({ ...c, sortOrder: idx + 1, displayOrder: idx + 1 })));
      await reorderBackendCategories(items);
      await loadCatalogData();
      onRefreshParent?.();
      toast.success(`Moved "${moved.name}" to position #${toIdx + 1}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to reorder categories");
      void loadCatalogData();
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim() || !catFormSlug.trim() || !catFormImage) {
      toast.error("Please provide category name, slug, and image");
      return;
    }

    try {
      await saveMasterCategory({
        id: editingCategory?.id,
        name: catFormName.trim(),
        nameHi: catFormNameHi.trim() || undefined,
        slug: catFormSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        badge: catFormBadge.trim(),
        badgeColor: catFormBadge.trim() ? catFormBadgeColor : "",
        sortOrder: Number(catFormOrder) || 1,
        displayOrder: Number(catFormOrder) || 1,
        defaultGstRate: Number(catFormGst),
        vehicleType: catFormVehicle,
        isActive: catFormActive,
        imageUrl: catFormImage,
      });

      await refreshLiveCategories(true);
      toast.success(
        editingCategory
          ? `Updated "${catFormName}" live on Home & Admin`
          : `Created category "${catFormName}" live on Home & Admin`
      );
      setCatDirty(false);
      setIsCategoryModalOpen(false);
      await loadCatalogData();
      onRefreshParent?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save category");
    }
  };

  /* ── PRODUCT HANDLERS ──────────────────────────────────────────── */
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: AdminMasterProduct) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleDuplicateProduct = (prod: AdminMasterProduct) => {
    setEditingProduct({
      ...prod,
      id: "",
      title: `${prod.title} (Copy)`,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveModalProduct = async (
    payload: Partial<AdminMasterProduct> & {
      title: string;
      brand: string;
      categorySlug: string;
      imageUrl: string;
    }
  ) => {
    try {
      await saveMasterProduct(payload);
      toast.success(
        payload.id ? `Saved "${payload.title}" live!` : `Created "${payload.title}" live!`
      );
      setIsProductModalOpen(false);
      await loadCatalogData();
      onRefreshParent?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save product");
      throw err;
    }
  };

  const handleToggleLock = async (prod: AdminMasterProduct) => {
    try {
      await saveMasterProduct({ ...prod, adminLocked: !prod.adminLocked });
      toast.success(!prod.adminLocked ? "Master Locked" : "Unlocked");
      void loadCatalogData();
    } catch {
      toast.error("Failed to toggle lock status");
    }
  };

  const handleToggleStock = async (prod: AdminMasterProduct) => {
    try {
      await saveMasterProduct({ ...prod, isInStock: !prod.isInStock });
      toast.success(!prod.isInStock ? `Marked IN STOCK` : `Marked OUT OF STOCK`);
      void loadCatalogData();
    } catch {
      toast.error("Failed to toggle stock");
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" permanently from master catalog?`)) return;
    try {
      await deleteMasterProduct(id);
      toast.success(`Deleted "${title}"`);
      void loadCatalogData();
      onRefreshParent?.();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const updateInlineDraft = (prod: AdminMasterProduct, patch: Partial<{
    sellingPrice: number;
    mrp: number;
    bulkPrice: number;
    stockQty: number;
    isInStock: boolean;
  }>) => {
    setInlineDrafts((prev) => {
      const current = prev[prod.id] || {
        sellingPrice: prod.sellingPrice,
        mrp: prod.mrp,
        bulkPrice: prod.bulkPrice,
        stockQty: prod.stockQty ?? 100,
        isInStock: prod.isInStock,
      };
      return {
        ...prev,
        [prod.id]: { ...current, ...patch },
      };
    });
  };

  const handleSaveInlineBulk = async () => {
    const entries = Object.entries(inlineDrafts);
    if (entries.length === 0) return;
    setSavingBulk(true);
    try {
      const updates = entries.map(([id, vals]) => ({ id, ...vals }));
      await bulkUpdateMasterProducts(updates);
      setInlineDrafts({});
      toast.success(`Updated ${updates.length} products live across all LAN devices!`);
      await loadCatalogData();
      onRefreshParent?.();
    } catch (err: any) {
      toast.error(err?.message || "Bulk update failed");
    } finally {
      setSavingBulk(false);
    }
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) throw new Error("CSV file has no data rows");
      const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = cols[i];
        });
        return {
          id: obj.id,
          mrp: obj.mrp !== undefined ? Number(obj.mrp) : undefined,
          sellingPrice: obj.sellingPrice !== undefined ? Number(obj.sellingPrice) : undefined,
          bulkPrice: obj.bulkPrice !== undefined ? Number(obj.bulkPrice) : undefined,
          stockQty: obj.stockQty !== undefined ? Number(obj.stockQty) : undefined,
          isInStock: obj.isInStock !== undefined ? obj.isInStock !== "false" : undefined,
        };
      }).filter((r) => Boolean(r.id));

      const count = await importCsvMasterProducts(rows);
      toast.success(`Imported & synced CSV rates for ${count} SKUs!`);
      await loadCatalogData();
    } catch (err: any) {
      toast.error(err?.message || "CSV import failed");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const openLiveBlinkitPreview = (prod: AdminMasterProduct) => {
    setPreviewProduct({
      id: prod.id,
      slug: (prod as any).slug || prod.id,
      title: prod.title,
      name: prod.title,
      brand: prod.brand,
      categorySlug: prod.categorySlug,
      categoryTag: prod.categorySlug,
      unit: prod.unit,
      price: prod.sellingPrice,
      mrp: prod.mrp,
      image: prod.imageUrl,
      images: (prod.images || []).map((g) => g.url).filter(Boolean),
      galleryImages: prod.images || [],
      description: prod.description,
      highlightTiles: prod.highlights,
      keyInfo: prod.keyInfo,
      usageTips: prod.usageTips,
      variants: prod.variants,
      bulkPricingTiers: (prod.bulkSlabs || []).map((s) => ({
        minQty: s.minQty,
        pricePerUnit: s.price,
        label: s.label,
      })),
      inStock: prod.isInStock,
    });
  };

  const previewBadgeTextColor = isLightHex(catFormBadgeColor) ? "#1E293B" : "#FFFFFF";

  return (
    <div className="space-y-6">
      {/* Top Banner / Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{subTab === "categories" ? "CATEGORY STUDIO" : "PRODUCT & PRICING MASTER"}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                SSE Live Sync
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {subTab === "categories"
                ? "Drag-and-drop reorder, 5MB WebP photo uploads, custom badges & instant Customer Home preview."
                : "Multi-image Blinkit details, variants/bulk slabs, inline price & stock table, and CSV market rate sync."}
            </p>
          </div>
        </div>

        {/* Action Tabs & Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSubTab("products")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subTab === "products"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products ({products.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab("categories")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                subTab === "categories"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Categories ({categories.length})</span>
            </button>
          </div>

          {subTab === "products" ? (
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => void loadCatalogData()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Refresh Catalog Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          SUBTAB 1: MASTER PRODUCT MANAGER (CARDS + INLINE BULK SPREADSHEET + CSV)
      ──────────────────────────────────────────────────────────────────────────── */}
      {subTab === "products" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, brand, HSN code, or category..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 cursor-pointer"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedLockFilter}
                onChange={(e) => setSelectedLockFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 cursor-pointer"
              >
                <option value="all">Lock: All</option>
                <option value="locked">🔒 Admin Locked</option>
                <option value="unlocked">🔓 Unlocked</option>
              </select>

              <button
                type="button"
                onClick={() => setInlineEditMode((v) => !v)}
                className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border cursor-pointer ${
                  inlineEditMode
                    ? "bg-amber-400 text-slate-950 border-amber-300"
                    : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {inlineEditMode ? <LayoutGrid className="w-3.5 h-3.5" /> : <Table2 className="w-3.5 h-3.5" />}
                <span>{inlineEditMode ? "Card View" : "Quick Inline Price & Stock"}</span>
              </button>

              <a
                href={apiUrl("/api/admin/catalog/products/export.csv")}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV Export</span>
              </a>

              <input
                ref={csvFileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvImport}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => csvFileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Import CSV</span>
              </button>
            </div>
          </div>

          {inlineEditMode && Object.keys(inlineDrafts).length > 0 && (
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-xs font-black text-amber-300">
                {Object.keys(inlineDrafts).length} product row(s) modified inline — ready to sync across LAN devices.
              </span>
              <button
                type="button"
                disabled={savingBulk}
                onClick={() => void handleSaveInlineBulk()}
                className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingBulk ? "Saving..." : `Save All Changes (${Object.keys(inlineDrafts).length})`}</span>
              </button>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No products found</h3>
            </div>
          ) : inlineEditMode ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Product &amp; Brand</th>
                    <th className="p-3">Selling Price (₹)</th>
                    <th className="p-3">MRP (₹)</th>
                    <th className="p-3">Bulk Rate (₹)</th>
                    <th className="p-3">Stock Qty</th>
                    <th className="p-3">In Stock</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.slice(0, 80).map((prod) => {
                    const draft = inlineDrafts[prod.id];
                    const curSell = draft?.sellingPrice ?? prod.sellingPrice;
                    const curMrp = draft?.mrp ?? prod.mrp;
                    const curBulk = draft?.bulkPrice ?? prod.bulkPrice;
                    const curStock = draft?.stockQty ?? prod.stockQty ?? 100;
                    const curInStock = draft?.isInStock ?? prod.isInStock;
                    return (
                      <tr key={prod.id} className={draft ? "bg-amber-400/5" : "hover:bg-slate-800/40"}>
                        <td className="p-3 max-w-[260px]">
                          <div className="font-bold text-white truncate">{prod.title}</div>
                          <div className="text-[10px] text-slate-400">{prod.brand} · {prod.unit}</div>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={curSell}
                            onChange={(e) => updateInlineDraft(prod, { sellingPrice: Number(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 font-mono text-emerald-400 font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={curMrp}
                            onChange={(e) => updateInlineDraft(prod, { mrp: Number(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 font-mono text-slate-300"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={curBulk}
                            onChange={(e) => updateInlineDraft(prod, { bulkPrice: Number(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 font-mono text-amber-300"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={curStock}
                            onChange={(e) => updateInlineDraft(prod, { stockQty: Number(e.target.value) || 0 })}
                            className="w-20 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={curInStock}
                            onChange={(e) => updateInlineDraft(prod, { isInStock: e.target.checked })}
                            className="w-4 h-4 accent-emerald-400 cursor-pointer"
                          />
                        </td>
                        <td className="p-2 text-right space-x-1 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openLiveBlinkitPreview(prod)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 cursor-pointer"
                            title="Preview Blinkit Product Sheet"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer"
                            title="Full Editor"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.slice(0, 60).map((prod) => (
                <div
                  key={prod.id}
                  className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all hover:border-slate-700 ${
                    prod.adminLocked ? "border-amber-500/30" : "border-slate-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        HSN: {prod.hsnCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleToggleLock(prod)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                          prod.adminLocked
                            ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {prod.adminLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{prod.adminLocked ? "Locked" : "Open"}</span>
                      </button>
                    </div>

                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-3 relative border border-slate-800 mb-3">
                      <CononProductMedia
                        product={prod}
                        src={prod.imageUrl}
                        title={prod.title}
                        brand={prod.brand}
                        category={prod.categorySlug}
                        alt={prod.title}
                        variant="card"
                        isDark
                        containerClassName="w-full h-full"
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-2 left-2 bg-slate-900/90 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1">
                        {prod.vehicleRequirement === "LOADER" ? <Truck className="w-3 h-3 text-amber-400" /> : <Bike className="w-3 h-3 text-emerald-400" />}
                        <span>{prod.vehicleRequirement === "LOADER" ? "Loader" : "Bike"}</span>
                      </span>
                    </div>

                    <div className="text-[10px] font-bold text-amber-400 uppercase">{prod.brand} · {prod.unit}</div>
                    <h4 className="text-sm font-bold text-white line-clamp-2 mt-0.5">{prod.title}</h4>

                    <div className="mt-2.5 flex items-baseline justify-between">
                      <div>
                        <span className="text-base font-black text-emerald-400 font-mono">₹{prod.sellingPrice}</span>
                        {prod.mrp > prod.sellingPrice && (
                          <span className="text-xs text-slate-500 line-through ml-1.5 font-mono">₹{prod.mrp}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleToggleStock(prod)}
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full cursor-pointer ${
                          prod.isInStock
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {prod.isInStock ? `In Stock (${prod.stockQty ?? 100})` : "Out of Stock"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => openLiveBlinkitPreview(prod)}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Preview Customer Blinkit Sheet"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateProduct(prod)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="Duplicate Product"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteProduct(prod.id, prod.title)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────────
          SUBTAB 2: CATEGORY STUDIO (DRAG-AND-DROP REORDER + LIVE CARD PREVIEW)
      ──────────────────────────────────────────────────────────────────────────── */}
      {subTab === "categories" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs">
            <div className="text-slate-300 font-bold">
              Drag any category card (or use ▲/▼) to reorder live on Customer Home:{" "}
              <span className="text-emerald-400">
                {categories.filter((c) => c.isActive !== false).length} Active / {categories.length} Total
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Single Source of Truth: <code className="text-amber-300">/api/categories</code>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                draggable
                onDragStart={() => setDragCategoryIndex(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragCategoryIndex !== null && dragCategoryIndex !== idx) {
                    void handleReorderTo(dragCategoryIndex, idx);
                  }
                  setDragCategoryIndex(null);
                }}
                onDragEnd={() => setDragCategoryIndex(null)}
                className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-amber-400/50 transition-all cursor-grab active:cursor-grabbing ${
                  dragCategoryIndex === idx ? "border-amber-400 opacity-60 scale-98" : "border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700 flex items-center gap-1 truncate">
                      <GripVertical className="w-3 h-3 text-slate-500 shrink-0" />
                      #{cat.displayOrder ?? cat.sortOrder ?? idx + 1} · /{cat.slug}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleToggleCategoryActive(cat)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer ${
                        cat.isActive !== false
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {cat.isActive !== false ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                      {cat.isActive !== false ? "Active" : "Hidden"}
                    </button>
                  </div>

                  <div className="relative aspect-16/9 rounded-xl overflow-visible bg-slate-950 flex items-center justify-center p-2 border border-slate-800 mb-3">
                    {cat.badge && (
                      <span
                        style={{
                          backgroundColor: cat.badgeColor || "#F2B705",
                          color: isLightHex(cat.badgeColor || "#F2B705") ? "#1E293B" : "#FFFFFF",
                        }}
                        className="absolute -top-2 left-3 text-[9px] font-black px-2 py-0.5 rounded-full shadow border border-black/15 uppercase tracking-wider"
                      >
                        {cat.badge}
                      </span>
                    )}
                    <img
                      src={resolveCategoryAssetUrl(cat.imageUrl, cat.updatedAt)}
                      alt={cat.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                  {cat.nameHi && (
                    <div className="text-xs text-amber-400/90 font-medium mt-0.5">{cat.nameHi}</div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Default GST / Fleet:</span>
                      <strong className="text-slate-200 font-mono">
                        {cat.defaultGstRate}% · {cat.vehicleType}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Live SKUs:</span>
                      <strong className="text-emerald-400">{cat.productCount || 0} Products</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => void handleReorderTo(idx, idx - 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === categories.length - 1}
                      onClick={() => void handleReorderTo(idx, idx + 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditCategory(cat)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit &amp; Preview</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────────
          MODAL: CATEGORY EDIT / ADD WITH LIVE CUSTOMER CARD PREVIEW
      ──────────────────────────────────────────────────────────────────────────── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>{editingCategory ? `Edit Category: ${editingCategory.name}` : "Add New Category"}</span>
              </h3>
              <button type="button" onClick={handleCloseCatModalSafe} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left 7 Cols: Controls */}
              <div className="md:col-span-7 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={catFormName}
                    onChange={(e) => {
                      setCatDirty(true);
                      setCatFormName(e.target.value);
                      if (!editingCategory) {
                        setCatFormSlug(
                          e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                        );
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category Name (Hindi / Optional)</label>
                  <input
                    type="text"
                    value={catFormNameHi}
                    onChange={(e) => { setCatDirty(true); setCatFormNameHi(e.target.value); }}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Slug *</label>
                    <input
                      type="text"
                      required
                      value={catFormSlug}
                      onChange={(e) => { setCatDirty(true); setCatFormSlug(e.target.value); }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Display Order</label>
                    <input
                      type="number"
                      min={1}
                      value={catFormOrder}
                      onChange={(e) => { setCatDirty(true); setCatFormOrder(Number(e.target.value) || 1); }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Default GST Slab</label>
                    <select
                      value={catFormGst}
                      onChange={(e) => { setCatDirty(true); setCatFormGst(Number(e.target.value)); }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      {[5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}% GST</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Logistics Vehicle</label>
                    <select
                      value={catFormVehicle}
                      onChange={(e) => { setCatDirty(true); setCatFormVehicle(e.target.value as any); }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="LOADER">Chhota Hathi (Loader)</option>
                      <option value="BIKE">Delivery Bike (&lt;=30kg)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 items-end">
                  <div className="col-span-2">
                    <label className="font-bold text-slate-300 block mb-1">Top Ribbon Badge (Optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={catFormBadge}
                        onChange={(e) => { setCatDirty(true); setCatFormBadge(e.target.value); }}
                        placeholder="e.g. PLANT DIRECT or blank"
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                      />
                      <input
                        type="color"
                        value={catFormBadgeColor}
                        onChange={(e) => { setCatDirty(true); setCatFormBadgeColor(e.target.value); }}
                        className="w-9 h-9 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer shrink-0"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pb-2 font-bold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catFormActive}
                      onChange={(e) => { setCatDirty(true); setCatFormActive(e.target.checked); }}
                    />
                    <span>Active</span>
                  </label>
                </div>

                {/* Dropzone / File Upload / URL */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) void handleCategoryImageFile(f);
                  }}
                  className="p-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-300">Category Photo (JPG/PNG/WebP/AVIF &le; 5MB)</span>
                    <input
                      ref={catFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleCategoryImageFile(f);
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingCatImage}
                      onClick={() => catFileInputRef.current?.click()}
                      className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{isUploadingCatImage ? "Uploading..." : "Upload File"}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={catFormImage}
                    onChange={(e) => { setCatDirty(true); setCatFormImage(e.target.value); }}
                    placeholder="/uploads/categories/... or /images/home-categories/..."
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300"
                  />
                </div>
              </div>

              {/* Right 5 Cols: Live Customer Home Card Preview */}
              <div className="md:col-span-5 flex flex-col justify-between rounded-2xl bg-white p-5 text-slate-900 border border-slate-200">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-3 text-center">
                    Live Customer Home Card Preview
                  </div>
                  <div className="max-w-[160px] mx-auto flex flex-col items-center text-center">
                    <div className="relative w-full aspect-square bg-[#F4F6F8] rounded-[18px] p-4 flex items-center justify-center shadow-sm">
                      {catFormBadge.trim() && (
                        <span
                          style={{
                            backgroundColor: catFormBadgeColor || "#F2B705",
                            color: previewBadgeTextColor,
                          }}
                          className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8.5px] font-extrabold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap border border-black/10 uppercase tracking-wider"
                        >
                          {catFormBadge.trim()}
                        </span>
                      )}
                      <img
                        src={resolveCategoryAssetUrl(catFormImage, editingCategory?.updatedAt)}
                        alt={catFormName || "Preview"}
                        className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.06)]"
                      />
                    </div>
                    <span className="mt-2.5 text-[13px] font-medium text-[#1E293B] leading-snug line-clamp-2">
                      {catFormName || "Category Title"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleCloseCatModalSafe}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow cursor-pointer"
                  >
                    Save Category Live
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4-Tab Master Product Editor */}
      <AdminProductEditorModal
        open={isProductModalOpen}
        editingProduct={editingProduct}
        categories={categories}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveModalProduct}
      />

      {/* Live Blinkit-Style Product Detail Sheet Preview */}
      <ProductDetailSheet
        product={previewProduct}
        open={Boolean(previewProduct)}
        onClose={() => setPreviewProduct(null)}
        onAddToCart={() => toast.info("Preview Mode — Live storefront Cart works for customers!")}
      />
    </div>
  );
}

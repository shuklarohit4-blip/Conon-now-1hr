import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Truck,
  Bike,
  Shield,
  Eye,
  Sliders,
  X,
  IndianRupee,
  Package,
  Check,
  Percent,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { CononProductMedia } from "@/components/CononProductMedia";
import {
  type AdminMasterCategory,
  type AdminMasterProduct,
  fetchMasterCategories,
  fetchMasterProducts,
  saveMasterCategory,
  saveMasterProduct,
  deleteMasterProduct,
  compressImageToWebP,
  getCivilAutoFill,
} from "@/services/adminMasterCatalog";

interface AdminCatalogStudioProps {
  onRefreshParent?: () => void;
}

export function AdminCatalogStudio({ onRefreshParent }: AdminCatalogStudioProps) {
  const [subTab, setSubTab] = useState<"products" | "categories">("products");
  const [categories, setCategories] = useState<AdminMasterCategory[]>([]);
  const [products, setProducts] = useState<AdminMasterProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLockFilter, setSelectedLockFilter] = useState<"all" | "locked" | "unlocked">("all");

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminMasterCategory | null>(null);
  const [catFormName, setCatFormName] = useState("");
  const [catFormNameHi, setCatFormNameHi] = useState("");
  const [catFormSlug, setCatFormSlug] = useState("");
  const [catFormGst, setCatFormGst] = useState<number>(18);
  const [catFormVehicle, setCatFormVehicle] = useState<"LOADER" | "BIKE">("LOADER");
  const [catFormActive, setCatFormActive] = useState(true);
  const [catFormImage, setCatFormImage] = useState("");
  const [isCompressingCatImage, setIsCompressingCatImage] = useState(false);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  // Product Modal / Drawer State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminMasterProduct | null>(null);
  const [prodFormTitle, setProdFormTitle] = useState("");
  const [prodFormBrand, setProdFormBrand] = useState("");
  const [prodFormCategory, setProdFormCategory] = useState("cement-civil-works");
  const [prodFormSubcategory, setProdFormSubcategory] = useState("");
  const [prodFormUnit, setProdFormUnit] = useState("Bag (50kg)");
  const [prodFormMrp, setProdFormMrp] = useState<number | string>(410);
  const [prodFormSellingPrice, setProdFormSellingPrice] = useState<number | string>(385);
  const [prodFormBulkPrice, setProdFormBulkPrice] = useState<number | string>(365);
  const [prodFormBulkMinQty, setProdFormBulkMinQty] = useState<number | string>(50);
  const [prodFormHsn, setProdFormHsn] = useState("25232910");
  const [prodFormGst, setProdFormGst] = useState<number>(28);
  const [prodFormVehicle, setProdFormVehicle] = useState<"LOADER" | "BIKE">("LOADER");
  const [prodFormImage, setProdFormImage] = useState("");
  const [prodFormDesc, setProdFormDesc] = useState("");
  const [prodFormSpecs, setProdFormSpecs] = useState<Array<{ label: string; value: string }>>([]);
  const [prodFormInStock, setProdFormInStock] = useState(true);
  const [prodFormLocked, setProdFormLocked] = useState(true);
  const [isCompressingProdImage, setIsCompressingProdImage] = useState(false);
  const prodFileInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  const loadCatalogData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        fetchMasterCategories(),
        fetchMasterProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch {
      toast.error("Failed to load catalog data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalogData();

    // Listen to real-time bus
    const handleBusUpdate = (e: any) => {
      const detail = e?.detail;
      if (detail?.type === "category" || detail?.type === "product") {
        void loadCatalogData();
      }
    };

    window.addEventListener("conon_catalog_bus", handleBusUpdate);
    return () => {
      window.removeEventListener("conon_catalog_bus", handleBusUpdate);
    };
  }, []);

  // Filtered Products
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

  // Open Add Category Modal
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatFormName("");
    setCatFormNameHi("");
    setCatFormSlug("");
    setCatFormGst(18);
    setCatFormVehicle("LOADER");
    setCatFormActive(true);
    setCatFormImage("/images/home-categories/cement-civil-works.webp");
    setIsCategoryModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: AdminMasterCategory) => {
    setEditingCategory(cat);
    setCatFormName(cat.name);
    setCatFormNameHi(cat.nameHi || "");
    setCatFormSlug(cat.slug);
    setCatFormGst(cat.defaultGstRate || 18);
    setCatFormVehicle(cat.vehicleType || "LOADER");
    setCatFormActive(cat.isActive !== false);
    setCatFormImage(cat.imageUrl || "");
    setIsCategoryModalOpen(true);
  };

  // Handle Category Image Compression
  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingCatImage(true);
      const compressedWebp = await compressImageToWebP(file, 800, 0.82);
      setCatFormImage(compressedWebp);
      toast.success("Category image compressed to WebP (max 800px)!");
    } catch {
      toast.error("Failed to compress category image");
    } finally {
      setIsCompressingCatImage(false);
    }
  };

  // Save Category
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
        defaultGstRate: Number(catFormGst),
        vehicleType: catFormVehicle,
        isActive: catFormActive,
        imageUrl: catFormImage,
      });

      toast.success(
        editingCategory
          ? `Updated "${catFormName}" successfully`
          : `Created category "${catFormName}" with real-time sync`
      );
      setIsCategoryModalOpen(false);
      void loadCatalogData();
      onRefreshParent?.();
    } catch {
      toast.error("Failed to save category");
    }
  };

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdFormTitle("");
    setProdFormBrand("");
    const defaultCat = categories[0]?.slug || "cement-civil-works";
    setProdFormCategory(defaultCat);
    setProdFormSubcategory("");
    setProdFormUnit("Bag (50kg)");
    setProdFormMrp(450);
    setProdFormSellingPrice(400);
    setProdFormBulkPrice(380);
    setProdFormBulkMinQty(25);
    setProdFormHsn("25232910");
    setProdFormGst(28);
    setProdFormVehicle("LOADER");
    setProdFormImage("");
    setProdFormDesc("");
    setProdFormSpecs([
      { label: "Grade", value: "PPC / OPC 53" },
      { label: "Standard", value: "IS 1489" },
    ]);
    setProdFormInStock(true);
    setProdFormLocked(true);
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: AdminMasterProduct) => {
    setEditingProduct(prod);
    setProdFormTitle(prod.title);
    setProdFormBrand(prod.brand);
    setProdFormCategory(prod.categorySlug);
    setProdFormSubcategory(prod.subcategory || "");
    setProdFormUnit(prod.unit);
    setProdFormMrp(prod.mrp);
    setProdFormSellingPrice(prod.sellingPrice);
    setProdFormBulkPrice(prod.bulkPrice);
    setProdFormBulkMinQty(prod.bulkMinQty);
    setProdFormHsn(prod.hsnCode);
    setProdFormGst(prod.gstRate);
    setProdFormVehicle(prod.vehicleRequirement);
    setProdFormImage(prod.imageUrl);
    setProdFormDesc(prod.description);
    setProdFormSpecs(prod.specTags && prod.specTags.length > 0 ? [...prod.specTags] : []);
    setProdFormInStock(prod.isInStock);
    setProdFormLocked(prod.adminLocked);
    setIsProductModalOpen(true);
  };

  // 1-Click Auto-Fill Civil Specs & HSN
  const handleAutoFillCivilSpecs = () => {
    const auto = getCivilAutoFill(prodFormCategory, prodFormBrand, prodFormTitle);
    setProdFormHsn(auto.hsnCode);
    setProdFormGst(auto.gstRate);
    setProdFormVehicle(auto.vehicleRequirement);
    if (auto.unit) setProdFormUnit(auto.unit);
    if (auto.mrp) setProdFormMrp(auto.mrp);
    if (auto.sellingPrice) setProdFormSellingPrice(auto.sellingPrice);
    if (auto.bulkPrice) setProdFormBulkPrice(auto.bulkPrice);
    if (auto.bulkMinQty) setProdFormBulkMinQty(auto.bulkMinQty);
    if (auto.specTags) setProdFormSpecs(auto.specTags);

    toast.success(
      `Auto-filled HSN ${auto.hsnCode} (${auto.gstRate}% GST) & IS Specs!`,
      { icon: "✨" }
    );
  };

  // Handle Product Image Compression
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingProdImage(true);
      const compressedWebp = await compressImageToWebP(file, 800, 0.82);
      setProdFormImage(compressedWebp);
      toast.success("Studio photo compressed to WebP (max 800px)!");
    } catch {
      toast.error("Failed to compress product image");
    } finally {
      setIsCompressingProdImage(false);
    }
  };

  // Toggle Master Lock
  const handleToggleLock = async (prod: AdminMasterProduct) => {
    const nextLocked = !prod.adminLocked;
    try {
      await saveMasterProduct({
        ...prod,
        adminLocked: nextLocked,
      });
      toast.success(
        nextLocked
          ? `🔒 "${prod.title}" locked. Vendors cannot modify core specs!`
          : `🔓 "${prod.title}" unlocked for vendor customization.`
      );
      void loadCatalogData();
    } catch {
      toast.error("Failed to toggle lock status");
    }
  };

  // Toggle Stock Status
  const handleToggleStock = async (prod: AdminMasterProduct) => {
    const nextStock = !prod.isInStock;
    try {
      await saveMasterProduct({
        ...prod,
        isInStock: nextStock,
      });
      toast.success(
        nextStock ? `Marked "${prod.title}" IN STOCK` : `Marked "${prod.title}" OUT OF STOCK`
      );
      void loadCatalogData();
    } catch {
      toast.error("Failed to toggle stock");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" from master catalog?`)) {
      return;
    }
    try {
      await deleteMasterProduct(id);
      toast.success(`Deleted "${title}"`);
      void loadCatalogData();
      onRefreshParent?.();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  // Save Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormTitle.trim() || !prodFormBrand.trim() || !prodFormImage) {
      toast.error("Please provide product title, brand, and studio image");
      return;
    }

    try {
      await saveMasterProduct({
        id: editingProduct?.id,
        title: prodFormTitle.trim(),
        brand: prodFormBrand.trim(),
        categorySlug: prodFormCategory,
        subcategory: prodFormSubcategory.trim() || undefined,
        unit: prodFormUnit.trim(),
        mrp: Number(prodFormMrp) || Number(prodFormSellingPrice),
        sellingPrice: Number(prodFormSellingPrice),
        bulkPrice: Number(prodFormBulkPrice) || Number(prodFormSellingPrice),
        bulkMinQty: Number(prodFormBulkMinQty) || 10,
        hsnCode: prodFormHsn.trim(),
        gstRate: Number(prodFormGst),
        vehicleRequirement: prodFormVehicle,
        imageUrl: prodFormImage,
        description: prodFormDesc.trim(),
        specTags: prodFormSpecs.filter((s) => s.label && s.value),
        isInStock: prodFormInStock,
        adminLocked: prodFormLocked,
      });

      toast.success(
        editingProduct
          ? `Updated "${prodFormTitle}" with Master Lock`
          : `Added "${prodFormTitle}" to Master Catalog!`
      );
      setIsProductModalOpen(false);
      void loadCatalogData();
      onRefreshParent?.();
    } catch {
      toast.error("Failed to save master product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>CATALOG STUDIO</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Master CMS
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Central control for all 16 categories, authentic civil specs, HSN tax rates, and vendor master locks.
              </p>
            </div>
          </div>
        </div>

        {/* Action Tabs & Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSubTab("products")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subTab === "products"
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Master Products ({products.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab("categories")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subTab === "categories"
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
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
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Master Product</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Category</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => void loadCatalogData()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Catalog Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          SUBTAB 1: MASTER PRODUCT MANAGER
      ──────────────────────────────────────────────────────────────────────────── */}
      {subTab === "products" && (
        <div className="space-y-4">
          {/* Search & Filters Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, brand, HSN code, or subcategory..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Lock Filter */}
              <select
                value={selectedLockFilter}
                onChange={(e) => setSelectedLockFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Lock: All Status</option>
                <option value="locked">🔒 Admin Locked Only</option>
                <option value="unlocked">🔓 Unlocked Only</option>
              </select>
            </div>
          </div>

          {/* Master Product Grid / Table */}
          {filteredProducts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No products found</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search query or category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 shadow-md ${
                    prod.adminLocked ? "border-amber-500/30 ring-1 ring-amber-500/10" : "border-slate-800"
                  }`}
                >
                  <div>
                    {/* Top Status & Lock Bar */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                        HSN: {prod.hsnCode}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => void handleToggleLock(prod)}
                          title={prod.adminLocked ? "Admin Locked - Click to unlock" : "Unlocked - Click to lock"}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            prod.adminLocked
                              ? "bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {prod.adminLocked ? (
                            <div className="flex items-center gap-1 text-[10px]">
                              <Lock className="w-3 h-3 text-amber-400" />
                              <span>Master Lock</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px]">
                              <Unlock className="w-3 h-3 text-slate-400" />
                              <span>Unlocked</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Image Thumbnail */}
                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-3 relative group border border-slate-800/80 mb-3">
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
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                      />

                      {/* Vehicle Badge */}
                      <span className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1">
                        {prod.vehicleRequirement === "LOADER" ? (
                          <>
                            <Truck className="w-3 h-3 text-amber-400" />
                            <span>Chhota Hathi</span>
                          </>
                        ) : (
                          <>
                            <Bike className="w-3 h-3 text-emerald-400" />
                            <span>Bike &lt;=30kg</span>
                          </>
                        )}
                      </span>

                      {/* GST Badge */}
                      <span className="absolute bottom-2 right-2 bg-slate-900/90 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-800">
                        {prod.gstRate}% GST
                      </span>
                    </div>

                    {/* Details */}
                    <div>
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        {prod.brand}
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2 mt-0.5 leading-snug">
                        {prod.title}
                      </h4>
                      {prod.subcategory && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {prod.subcategory} • {prod.unit}
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400">Selling Price</div>
                          <div className="text-sm font-black text-white">
                            ₹{prod.sellingPrice.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-amber-400 font-bold">Bulk Slab</div>
                          <div className="text-xs font-bold text-amber-300">
                            ₹{prod.bulkPrice} (&gt;={prod.bulkMinQty})
                          </div>
                        </div>
                      </div>

                      {/* Spec Tags Preview */}
                      {prod.specTags && prod.specTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {prod.specTags.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800"
                            >
                              {s.label}: <strong className="text-slate-200">{s.value}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => void handleToggleStock(prod)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        prod.isInStock
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {prod.isInStock ? "In Stock" : "Out of Stock"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        title="Edit Master Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteProduct(prod.id, prod.title)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
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
          SUBTAB 2: CATEGORY MANAGER
      ──────────────────────────────────────────────────────────────────────────── */}
      {subTab === "categories" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                      /{cat.slug}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>

                  <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 border border-slate-800 mb-3">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                  {cat.nameHi && (
                    <div className="text-xs text-amber-400/90 font-medium mt-0.5">
                      {cat.nameHi}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Default GST Slab:</span>
                      <strong className="text-amber-300 font-mono">{cat.defaultGstRate}%</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Logistics Class:</span>
                      <strong className="text-slate-200 flex items-center gap-1">
                        {cat.vehicleType === "LOADER" ? (
                          <>
                            <Truck className="w-3 h-3 text-amber-400" />
                            <span>Chhota Hathi</span>
                          </>
                        ) : (
                          <>
                            <Bike className="w-3 h-3 text-emerald-400" />
                            <span>Bike Delivery</span>
                          </>
                        )}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Active SKUs:</span>
                      <strong className="text-slate-200">
                        {cat.productCount || 0} Products
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEditCategory(cat)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Category</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT CATEGORY
      ──────────────────────────────────────────────────────────────────────────── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>{editingCategory ? "Edit Category" : "Add New Category"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Category Name (English)
                </label>
                <input
                  type="text"
                  required
                  value={catFormName}
                  onChange={(e) => {
                    setCatFormName(e.target.value);
                    if (!editingCategory) {
                      setCatFormSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Cement & Civil Works"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Category Name (Hindi / Devanagari)
                </label>
                <input
                  type="text"
                  value={catFormNameHi}
                  onChange={(e) => setCatFormNameHi(e.target.value)}
                  placeholder="उदा. सीमेंट और सिविल कार्य"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Slug (URL Key)
                  </label>
                  <input
                    type="text"
                    required
                    value={catFormSlug}
                    onChange={(e) => setCatFormSlug(e.target.value)}
                    placeholder="cement-civil-works"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Default GST Slab
                  </label>
                  <select
                    value={catFormGst}
                    onChange={(e) => setCatFormGst(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value={5}>5% (Bricks, Aggregates)</option>
                    <option value={12}>12% (AAC Blocks)</option>
                    <option value={18}>18% (Steel, Paints, Wires, CPVC)</option>
                    <option value={28}>28% (Cement)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Logistics Vehicle
                  </label>
                  <select
                    value={catFormVehicle}
                    onChange={(e) => setCatFormVehicle(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="LOADER">🚚 Chhota Hathi (1.5T Loader)</option>
                    <option value="BIKE">🏍️ Delivery Bike (&lt;=30kg)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Storefront Visibility
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="catActive"
                      checked={catFormActive}
                      onChange={(e) => setCatFormActive(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400"
                    />
                    <label htmlFor="catActive" className="text-xs text-slate-300 font-bold">
                      Active on Storefront
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Upload with Client-Side Canvas Compression */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Category Image (Auto-Compress to WebP)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    {catFormImage ? (
                      <img src={catFormImage} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={catFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isCompressingCatImage}
                      onClick={() => catFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isCompressingCatImage ? "Compressing..." : "Choose Image File"}</span>
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Canvas scales to max 800px &amp; compresses to WebP automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-400/20"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────────
          MODAL / DRAWER: ADD / EDIT MASTER PRODUCT
      ──────────────────────────────────────────────────────────────────────────── */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingProduct ? "Edit Master SKU & Specs" : "Add New Master Product"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defines official price, HSN, civil specs, and vendor master locks.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Row 1: Title & Brand */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodFormTitle}
                    onChange={(e) => setProdFormTitle(e.target.value)}
                    placeholder="e.g. UltraTech Super PPC Weather-Shield Cement 50kg"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodFormBrand}
                    onChange={(e) => setProdFormBrand(e.target.value)}
                    placeholder="e.g. UltraTech / Tata"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Row 2: Category, Subcategory, Auto-Fill Button */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={prodFormCategory}
                    onChange={(e) => setProdFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={prodFormSubcategory}
                    onChange={(e) => setProdFormSubcategory(e.target.value)}
                    placeholder="e.g. PPC Cement / SDR 11"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleAutoFillCivilSpecs}
                    className="w-full px-3 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto-Fill Specs &amp; HSN</span>
                  </button>
                </div>
              </div>

              {/* Row 3: HSN Code & GST Slab & Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    8-Digit HSN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodFormHsn}
                    onChange={(e) => setProdFormHsn(e.target.value)}
                    placeholder="25232910"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    GST Rate Slab *
                  </label>
                  <select
                    value={prodFormGst}
                    onChange={(e) => setProdFormGst(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value={5}>5% GST (Bricks, Sand)</option>
                    <option value={12}>12% GST (AAC Blocks)</option>
                    <option value={18}>18% GST (Steel, Paints, CPVC, Wires)</option>
                    <option value={28}>28% GST (Cement)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Vehicle Class *
                  </label>
                  <select
                    value={prodFormVehicle}
                    onChange={(e) => setProdFormVehicle(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="LOADER">🚚 Chhota Hathi 1.5T</option>
                    <option value="BIKE">🏍️ Bike &lt;=30kg</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Pricing & Bulk Tier */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={prodFormUnit}
                    onChange={(e) => setProdFormUnit(e.target.value)}
                    placeholder="Bag (50kg)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={prodFormMrp}
                    onChange={(e) => setProdFormMrp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodFormSellingPrice}
                    onChange={(e) => setProdFormSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Bulk Price (₹)
                  </label>
                  <input
                    type="number"
                    value={prodFormBulkPrice}
                    onChange={(e) => setProdFormBulkPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Min Bulk Qty
                  </label>
                  <input
                    type="number"
                    value={prodFormBulkMinQty}
                    onChange={(e) => setProdFormBulkMinQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Row 5: Studio Image Upload & Live Card Preview */}
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Live Thumbnail Preview */}
                  <div className="w-24 h-24 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    {prodFormImage ? (
                      <img src={prodFormImage} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Real Studio Photography (Drag &amp; Drop or Upload)
                    </label>
                    <input
                      ref={prodFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isCompressingProdImage}
                        onClick={() => prodFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isCompressingProdImage ? "Compressing WebP..." : "Browse Studio File"}</span>
                      </button>
                      <span className="text-[10px] text-slate-500">
                        Client-side canvas downsampled to max 800px WebP (0.82 quality)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 6: Description */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Product Description &amp; Usage Notes
                </label>
                <textarea
                  rows={2}
                  value={prodFormDesc}
                  onChange={(e) => setProdFormDesc(e.target.value)}
                  placeholder="Engineered for high compressive strength in residential slab casting..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Row 7: Civil Technical Specs Key-Values */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300">
                    Civil Technical Specifications (Key-Value)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setProdFormSpecs([...prodFormSpecs, { label: "Spec", value: "Value" }])
                    }
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Spec Row</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {prodFormSpecs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={spec.label}
                        onChange={(e) => {
                          const updated = [...prodFormSpecs];
                          updated[sIdx].label = e.target.value;
                          setProdFormSpecs(updated);
                        }}
                        placeholder="Label (e.g. Grade)"
                        className="w-1/3 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => {
                          const updated = [...prodFormSpecs];
                          updated[sIdx].value = e.target.value;
                          setProdFormSpecs(updated);
                        }}
                        placeholder="Value (e.g. IS 1489)"
                        className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProdFormSpecs(prodFormSpecs.filter((_, idx) => idx !== sIdx));
                        }}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 8: Admin Master Lock & Stock Toggles */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prodLocked"
                      checked={prodFormLocked}
                      onChange={(e) => setProdFormLocked(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 cursor-pointer"
                    />
                    <label htmlFor="prodLocked" className="text-xs text-white font-bold cursor-pointer">
                      🔒 Admin Master Lock (Protected Specs)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prodInStock"
                      checked={prodFormInStock}
                      onChange={(e) => setProdFormInStock(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 cursor-pointer"
                    />
                    <label htmlFor="prodInStock" className="text-xs text-slate-300 font-bold cursor-pointer">
                      In Stock
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-400/20"
                  >
                    Save Master SKU
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

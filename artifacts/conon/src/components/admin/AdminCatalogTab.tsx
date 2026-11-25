import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Zap,
  Check,
  X,
  Edit3,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Truck,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Save,
  Star,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { resolveApiUrl } from "@/lib/apiBase";
import { useLiveCatalog, type MasterCatalogSKU } from "@/context/LiveCatalogContext";
import { ProductImage } from "../ProductImage";
import { ProductStudioDrawer } from "./ProductStudioDrawer";

interface AdminCatalogTabProps {
  initialSelectedSkuId?: string | null;
}

export function AdminCatalogTab({ initialSelectedSkuId }: AdminCatalogTabProps = {}) {
  const {
    items,
    categories,
    brands,
    kpis,
    isLoading,
    refetch,
  } = useLiveCatalog();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedGst, setSelectedGst] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [selectedStock, setSelectedStock] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 50;

  // Selected Checkboxes
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Inline edit state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [inlinePriceVal, setInlinePriceVal] = useState<string>("");
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [inlineCostVal, setInlineCostVal] = useState<string>("");

  // Drawer & Modal states
  const [inspectSku, setInspectSku] = useState<MasterCatalogSKU | null>(null);
  const [isAddSkuOpen, setIsAddSkuOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Bulk update form state
  const [bulkAdjustmentType, setBulkAdjustmentType] = useState<
    "flat_add" | "flat_sub" | "percent_add" | "percent_sub" | "set_stock_in" | "set_stock_out"
  >("percent_add");
  const [bulkVal, setBulkVal] = useState<string>("5");
  const [bulkDryRunResult, setBulkDryRunResult] = useState<any | null>(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Filtered Items computation
  const filteredItems = useMemo(() => {
    let result = items;

    if (activeKpiFilter === "in_stock") {
      result = result.filter((i) => i.inStock);
    } else if (activeKpiFilter === "out_of_stock") {
      result = result.filter((i) => !i.inStock);
    } else if (activeKpiFilter === "low_margin") {
      result = result.filter((i) => {
        const margin = i.sellingPrice - i.dealerLandingCost;
        const marginPct = i.sellingPrice > 0 ? (margin / i.sellingPrice) * 100 : 0;
        return marginPct < 5;
      });
    } else if (activeKpiFilter === "missing_photo") {
      result = result.filter(
        (i) => !i.imageUrl || i.imageUrl.includes("placeholder") || i.imageUrl.endsWith(".svg")
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((i) => i.category === selectedCategory);
    }

    if (selectedBrand !== "all") {
      result = result.filter((i) => i.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (selectedGst !== "all") {
      const g = Number(selectedGst);
      result = result.filter((i) => i.gstPercent === g);
    }

    if (selectedVehicle !== "all") {
      result = result.filter((i) => i.deliveryVehicleType === selectedVehicle);
    }

    if (selectedStock !== "all") {
      const inStock = selectedStock === "in_stock";
      result = result.filter((i) => i.inStock === inStock);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          (i.hsnCode && i.hsnCode.includes(q)) ||
          (i.category && i.category.toLowerCase().includes(q))
      );
    }

    return result;
  }, [
    items,
    activeKpiFilter,
    selectedCategory,
    selectedBrand,
    selectedGst,
    selectedVehicle,
    selectedStock,
    search,
  ]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Checkbox helpers
  const handleSelectAllOnPage = () => {
    const next = new Set(selectedIds);
    const allSelected = paginatedItems.every((i) => next.has(i.id));
    if (allSelected) {
      paginatedItems.forEach((i) => next.delete(i.id));
    } else {
      paginatedItems.forEach((i) => next.add(i.id));
    }
    setSelectedIds(next);
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Optimistic Stock Toggle
  const handleToggleStock = async (item: MasterCatalogSKU) => {
    const nextStock = !item.inStock;
    try {
      const res = await fetch(resolveApiUrl(`/api/admin/catalog/sku/${item.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: nextStock }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      refetch();
      toast.success(`${item.name.slice(0, 24)}... marked ${nextStock ? "In Stock" : "Out of Stock"}`);
    } catch {
      toast.error("Failed to update stock status");
    }
  };

  // Optimistic Featured Toggle
  const handleToggleFeatured = async (item: MasterCatalogSKU) => {
    const nextFeatured = !item.isFeatured;
    try {
      const res = await fetch(resolveApiUrl(`/api/admin/catalog/sku/${item.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextFeatured }),
      });
      if (!res.ok) throw new Error("Failed to update featured flag");
      refetch();
      toast.success(
        `${item.name.slice(0, 24)}... ${nextFeatured ? "marked as Bestseller ⭐" : "removed from Bestsellers"}`
      );
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  // 1-Click Duplicate SKU
  const handleDuplicateSku = async (id: string) => {
    try {
      const res = await fetch(resolveApiUrl(`/api/admin/catalog/sku/${id}/duplicate`), {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Duplicate failed");
      refetch();
      toast.success(`Duplicated SKU: ${data.sku.name}`);
      setInspectSku(data.sku);
    } catch (err: any) {
      toast.error(err.message || "Failed to duplicate SKU");
    }
  };

  // Inline Price Save
  const handleSaveInlinePrice = async (item: MasterCatalogSKU) => {
    const p = Number(inlinePriceVal);
    if (!p || isNaN(p) || p <= 0) {
      toast.error("Valid price required");
      return;
    }

    try {
      const res = await fetch(resolveApiUrl(`/api/admin/catalog/sku/${item.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellingPrice: p }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingPriceId(null);
      refetch();
      toast.success(`Updated ${item.name.slice(0, 24)} to ₹${p} • Live on Storefront!`);
    } catch {
      toast.error("Failed to update price");
    }
  };

  // Inline Dealer Landing Cost Save
  const handleSaveInlineCost = async (item: MasterCatalogSKU) => {
    const c = Number(inlineCostVal);
    if (isNaN(c) || c < 0) {
      toast.error("Valid cost required");
      return;
    }

    try {
      const res = await fetch(resolveApiUrl(`/api/admin/catalog/sku/${item.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealerLandingCost: c }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingCostId(null);
      refetch();
      toast.success(`Dealer cost updated to ₹${c}`);
    } catch {
      toast.error("Failed to update cost");
    }
  };

  // Bulk Update Preview & Execution
  const handleRunBulkPreview = async () => {
    const valNum = Number(bulkVal);
    const scopeIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;
    const cat = selectedCategory !== "all" ? selectedCategory : undefined;
    const br = selectedBrand !== "all" ? selectedBrand : undefined;

    try {
      const res = await fetch(resolveApiUrl("/api/admin/catalog/bulk-update"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skuIds: scopeIds,
          category: cat,
          brand: br,
          adjustmentType: bulkAdjustmentType,
          value: valNum,
          dryRun: true,
        }),
      });
      const data = await res.json();
      setBulkDryRunResult(data);
    } catch {
      toast.error("Failed to calculate bulk preview");
    }
  };

  const handleExecuteBulkUpdate = async () => {
    setBulkSubmitting(true);
    const valNum = Number(bulkVal);
    const scopeIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;
    const cat = selectedCategory !== "all" ? selectedCategory : undefined;
    const br = selectedBrand !== "all" ? selectedBrand : undefined;

    try {
      const res = await fetch(resolveApiUrl("/api/admin/catalog/bulk-update"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skuIds: scopeIds,
          category: cat,
          brand: br,
          adjustmentType: bulkAdjustmentType,
          value: valNum,
          dryRun: false,
        }),
      });
      const data = await res.json();
      refetch();
      setIsBulkModalOpen(false);
      setBulkDryRunResult(null);
      setSelectedIds(new Set());
      toast.success(`Successfully updated ${data.affectedCount} SKUs! Live on Storefront.`);
    } catch {
      toast.error("Failed to apply bulk update");
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── TOP KPI BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveKpiFilter(null)}
          className={`p-4 rounded-2xl border text-left transition ${
            activeKpiFilter === null
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white text-slate-800 border-slate-200/90 hover:bg-slate-50"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Total Live SKUs
          </span>
          <span className="text-2xl font-black tabular-nums mt-1 block">
            {kpis.totalSkus.toLocaleString("en-IN")}
          </span>
        </button>

        <button
          onClick={() => setActiveKpiFilter(activeKpiFilter === "in_stock" ? null : "in_stock")}
          className={`p-4 rounded-2xl border text-left transition ${
            activeKpiFilter === "in_stock"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : "bg-white text-emerald-800 border-slate-200/90 hover:bg-emerald-50/50"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            In Stock
          </span>
          <span className="text-2xl font-black tabular-nums mt-1 block text-emerald-600">
            {kpis.inStockCount.toLocaleString("en-IN")}
          </span>
        </button>

        <button
          onClick={() => setActiveKpiFilter(activeKpiFilter === "out_of_stock" ? null : "out_of_stock")}
          className={`p-4 rounded-2xl border text-left transition ${
            activeKpiFilter === "out_of_stock"
              ? "bg-rose-600 text-white border-rose-600 shadow-md"
              : "bg-white text-rose-800 border-slate-200/90 hover:bg-rose-50/50"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Out of Stock
          </span>
          <span className="text-2xl font-black tabular-nums mt-1 block text-rose-600">
            {kpis.outOfStockCount.toLocaleString("en-IN")}
          </span>
        </button>

        <button
          onClick={() => setActiveKpiFilter(activeKpiFilter === "low_margin" ? null : "low_margin")}
          className={`p-4 rounded-2xl border text-left transition ${
            activeKpiFilter === "low_margin"
              ? "bg-amber-500 text-white border-amber-500 shadow-md"
              : "bg-white text-amber-800 border-slate-200/90 hover:bg-amber-50/50"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Low Margin (&lt;5%)
          </span>
          <span className="text-2xl font-black tabular-nums mt-1 block text-amber-600">
            {kpis.lowMarginCount.toLocaleString("en-IN")}
          </span>
        </button>

        <button
          onClick={() => setActiveKpiFilter(activeKpiFilter === "missing_photo" ? null : "missing_photo")}
          className={`p-4 rounded-2xl border text-left transition col-span-2 sm:col-span-1 ${
            activeKpiFilter === "missing_photo"
              ? "bg-purple-600 text-white border-purple-600 shadow-md"
              : "bg-white text-purple-800 border-slate-200/90 hover:bg-purple-50/50"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Missing Photos
          </span>
          <span className="text-2xl font-black tabular-nums mt-1 block text-purple-600">
            {kpis.missingPhotoCount.toLocaleString("en-IN")}
          </span>
        </button>
      </div>

      {/* ── HORIZONTAL CATEGORY PILL STRIP ── */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-sm overflow-x-auto scrollbar-none flex items-center gap-1.5">
        <button
          onClick={() => {
            setSelectedCategory("all");
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
            selectedCategory === "all"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
          }`}
        >
          <span>All Categories</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              selectedCategory === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
            }`}
          >
            {items.length}
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-800"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── POWER FILTER & ACTION BAR ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Instant Search Bar */}
          <div className="w-full lg:max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by SKU name, brand, HSN code, or category..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <button
              onClick={() => {
                setIsBulkModalOpen(true);
                handleRunBulkPreview();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Bulk Price Update</span>
              {selectedIds.size > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">
                  {selectedIds.size}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsAddSkuOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New SKU</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          {/* Brand */}
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* GST % */}
          <select
            value={selectedGst}
            onChange={(e) => {
              setSelectedGst(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">All GST Tiers</option>
            <option value="5">5% GST (Sand / Aggregate)</option>
            <option value="12">12% GST (Bricks / AAC)</option>
            <option value="18">18% GST (Cement / Hardware / Paints)</option>
          </select>

          {/* Delivery Vehicle */}
          <select
            value={selectedVehicle}
            onChange={(e) => {
              setSelectedVehicle(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">All Vehicles</option>
            <option value="2W_BIKE">2W Bike (Small Parts)</option>
            <option value="3W_ELECTRIC_LOADER">3W E-Loader (Mid Pack)</option>
            <option value="4W_PICKUP">4W Pickup (Cement / TMT)</option>
            <option value="HEAVY_TRUCK">Heavy Truck (Sand / Bricks)</option>
          </select>

          {/* Stock Status */}
          <select
            value={selectedStock}
            onChange={(e) => {
              setSelectedStock(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* ── PAGINATED SKU TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3 px-3 w-10 text-center">
                  <button onClick={handleSelectAllOnPage} className="text-slate-400 hover:text-slate-700">
                    {paginatedItems.length > 0 && paginatedItems.every((i) => selectedIds.has(i.id)) ? (
                      <CheckSquare className="w-4 h-4 text-slate-900" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Product / Brand / SKU ID</th>
                <th className="py-3 px-3">Unit & Spec</th>
                <th className="py-3 px-3">GST / HSN</th>
                <th className="py-3 px-3 text-center">Vehicle</th>
                <th className="py-3 px-3 text-right">Selling Price (₹)</th>
                <th className="py-3 px-3 text-right">Dealer Cost (₹)</th>
                <th className="py-3 px-3 text-right">Auto Margin</th>
                <th className="py-3 px-3 text-center">Stock Toggle</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading Live Catalog SKUs...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No matching SKUs found. Try clearing filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const isEditingPrice = editingPriceId === item.id;
                  const isEditingCost = editingCostId === item.id;

                  const margin = item.sellingPrice - item.dealerLandingCost;
                  const marginPct =
                    item.sellingPrice > 0 ? (margin / item.sellingPrice) * 100 : 0;
                  const marginColor =
                    marginPct >= 8
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : marginPct >= 4
                      ? "text-amber-700 bg-amber-50 border-amber-200"
                      : "text-rose-700 bg-rose-50 border-rose-200";

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-amber-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(item.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-slate-900" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Product Info */}
                      <td className="py-3 px-3 min-w-[220px]">
                        <div className="flex items-center gap-2.5">
                          <div
                            onClick={() => setInspectSku(item)}
                            title="Click to edit or upload packshot"
                            className="w-10 h-10 rounded-lg border border-slate-200 bg-white p-0.5 shrink-0 overflow-hidden shadow-xs cursor-pointer hover:border-amber-400 group relative"
                          >
                            <ProductImage
                              src={item.imageUrl}
                              alt={item.name}
                              sku={item.id}
                              className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition">
                              Edit
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h4
                              className="font-bold text-slate-900 truncate hover:text-blue-700 cursor-pointer"
                              title={item.name}
                              onClick={() => setInspectSku(item)}
                            >
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                              <span className="font-semibold text-slate-700">{item.brand}</span>
                              <span>•</span>
                              <span className="font-mono">{item.id}</span>
                              {item.isFeatured && (
                                <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                  ⭐ Bestseller
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Unit & Spec */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[11px]">
                          {item.unit}
                        </span>
                        {item.subcategory && (
                          <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                            {item.subcategory}
                          </span>
                        )}
                      </td>

                      {/* GST / HSN */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-800">{item.gstPercent}%</div>
                        <div className="text-[10px] text-slate-400 font-mono">HSN: {item.hsnCode}</div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.deliveryVehicleType === "4W_PICKUP"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : item.deliveryVehicleType === "3W_ELECTRIC_LOADER"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : item.deliveryVehicleType === "HEAVY_TRUCK"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.deliveryVehicleType === "4W_PICKUP"
                            ? "4W Pickup"
                            : item.deliveryVehicleType === "3W_ELECTRIC_LOADER"
                            ? "3W E-Loader"
                            : item.deliveryVehicleType === "HEAVY_TRUCK"
                            ? "Truck"
                            : "2W Bike"}
                        </span>
                      </td>

                      {/* Inline Selling Price */}
                      <td className="py-3 px-3 text-right">
                        {isEditingPrice ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={inlinePriceVal}
                              onChange={(e) => setInlinePriceVal(e.target.value)}
                              autoFocus
                              className="w-20 px-1.5 py-0.5 text-right font-black border border-amber-400 rounded text-xs"
                            />
                            <button
                              onClick={() => handleSaveInlinePrice(item)}
                              className="p-1 rounded bg-emerald-600 text-white"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="p-1 rounded bg-slate-200 text-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 group">
                            <span className="font-black text-slate-900 text-sm tabular-nums">
                              ₹{item.sellingPrice.toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setInlinePriceVal(String(item.sellingPrice));
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-600 transition"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 block line-through">
                          ₹{item.mrp.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Inline Dealer Landing Cost */}
                      <td className="py-3 px-3 text-right">
                        {isEditingCost ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              value={inlineCostVal}
                              onChange={(e) => setInlineCostVal(e.target.value)}
                              autoFocus
                              className="w-20 px-1.5 py-0.5 text-right font-black border border-amber-400 rounded text-xs"
                            />
                            <button
                              onClick={() => handleSaveInlineCost(item)}
                              className="p-1 rounded bg-emerald-600 text-white"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingCostId(null)}
                              className="p-1 rounded bg-slate-200 text-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 group">
                            <span className="font-semibold text-slate-600 text-xs tabular-nums">
                              ₹{item.dealerLandingCost.toLocaleString("en-IN")}
                            </span>
                            <button
                              onClick={() => {
                                setEditingCostId(item.id);
                                setInlineCostVal(String(item.dealerLandingCost));
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-600 transition"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-black border tabular-nums ${marginColor}`}
                        >
                          +₹{margin.toLocaleString("en-IN")} ({marginPct.toFixed(1)}%)
                        </span>
                      </td>

                      {/* Stock Toggle Switch */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleStock(item)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black transition active:scale-95 ${
                            item.inStock
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          {item.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleFeatured(item)}
                            title={item.isFeatured ? "Bestseller (Click to unset)" : "Set as Bestseller"}
                            className={`p-1.5 rounded-lg border transition ${
                              item.isFeatured
                                ? "border-amber-400 bg-amber-50 text-amber-600"
                                : "border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-300"
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${item.isFeatured ? "fill-amber-400" : ""}`} />
                          </button>
                          <button
                            onClick={() => handleDuplicateSku(item.id)}
                            title="Duplicate SKU"
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-800 text-slate-500 hover:text-slate-900 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setInspectSku(item)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-800 text-slate-700 font-bold text-xs transition active:scale-95 bg-white"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-900">
              {Math.min(currentPage * pageSize, filteredItems.length)}
            </span>{" "}
            of <span className="font-bold text-slate-900">{filteredItems.length}</span> SKUs
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── PRODUCT MERCHANDISING STUDIO DRAWER (EDIT MODE) ── */}
      <ProductStudioDrawer
        sku={inspectSku}
        isOpen={Boolean(inspectSku)}
        onClose={() => setInspectSku(null)}
      />

      {/* ── BULK UPDATE MODAL ── */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Bulk Price & Stock Adjustment</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target:{" "}
                  <strong className="text-slate-800">
                    {selectedIds.size > 0
                      ? `${selectedIds.size} Selected SKUs`
                      : selectedCategory !== "all"
                      ? `Category: ${selectedCategory}`
                      : "Entire Master Catalog"}
                  </strong>
                </p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Operation</label>
                <select
                  value={bulkAdjustmentType}
                  onChange={(e) => setBulkAdjustmentType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl font-bold bg-white text-slate-800"
                >
                  <option value="percent_add">Increase Price by % (+X%)</option>
                  <option value="percent_sub">Decrease Price by % (-X%)</option>
                  <option value="flat_add">Add Flat ₹ (+₹X)</option>
                  <option value="flat_sub">Subtract Flat ₹ (-₹X)</option>
                  <option value="set_stock_in">Mark All As In Stock</option>
                  <option value="set_stock_out">Mark All As Out of Stock</option>
                </select>
              </div>

              {!bulkAdjustmentType.startsWith("set_stock") && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Adjustment Value ({bulkAdjustmentType.includes("percent") ? "%" : "₹"})
                  </label>
                  <input
                    type="number"
                    value={bulkVal}
                    onChange={(e) => setBulkVal(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 border rounded-xl font-bold text-sm"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleRunBulkPreview}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition"
              >
                Refresh Preview Simulation
              </button>

              {/* Dry Run Preview Box */}
              {bulkDryRunResult && (
                <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Impacted SKUs: {bulkDryRunResult.affectedCount}</span>
                    <span className="text-emerald-700 text-[11px]">Ready to Apply</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 text-[11px]">
                    {bulkDryRunResult.preview?.map((p: any) => (
                      <div key={p.id} className="py-1 flex items-center justify-between">
                        <span className="truncate max-w-[200px]">{p.name}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400">₹{p.oldPrice}</span>
                          <span>→</span>
                          <span className="font-bold text-slate-900">₹{p.newPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteBulkUpdate}
                  disabled={bulkSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {bulkSubmitting ? "Applying..." : "Confirm & Apply Live"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT MERCHANDISING STUDIO DRAWER (CREATE MODE) ── */}
      <ProductStudioDrawer
        sku={null}
        isOpen={isAddSkuOpen}
        onClose={() => setIsAddSkuOpen(false)}
      />
    </div>
  );
}

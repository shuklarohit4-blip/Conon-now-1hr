import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Save,
  Copy,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Info,
  Truck,
  Star,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  ShoppingBag,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { resolveApiUrl } from "@/lib/apiBase";
import { useLiveCatalog, type MasterCatalogSKU } from "@/context/LiveCatalogContext";
import { CononProductMedia } from "../CononProductMedia";

interface ProductStudioDrawerProps {
  sku: MasterCatalogSKU | null; // null means adding a new SKU
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (savedSku: MasterCatalogSKU) => void;
}

export function ProductStudioDrawer({
  sku,
  isOpen,
  onClose,
  onSaved,
}: ProductStudioDrawerProps) {
  const { items, categories, brands, refetch } = useLiveCatalog();

  // Form state
  const isEditing = Boolean(sku);
  const [name, setName] = useState(sku?.name || "");
  const [brand, setBrand] = useState(sku?.brand || "");
  const [category, setCategory] = useState(sku?.category || "cement-tmt-chemicals");
  const [subcategory, setSubcategory] = useState(sku?.subcategory || "");
  const [unit, setUnit] = useState(sku?.unit || "Piece");
  const [packSize, setPackSize] = useState(sku?.packSize || "");
  const [oemModelCode, setOemModelCode] = useState(sku?.oemModelCode || "");

  // Media state
  const [imageUrl, setImageUrl] = useState(sku?.imageUrl || "");
  const [imageMode, setImageMode] = useState<"upload" | "url" | "auto">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [candidatePhotos, setCandidatePhotos] = useState<any[]>([]);
  const [autoFetchWarning, setAutoFetchWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content state
  const [shortDescription, setShortDescription] = useState(sku?.shortDescription || "");
  const [highlights, setHighlights] = useState<string[]>(
    sku?.highlights && sku.highlights.length > 0
      ? sku.highlights
      : ["ISI Certified Material", "Verified 60-Min Express Dispatch", "100% Genuine Lucknow Dealer Stock"]
  );
  const [highlightInput, setHighlightInput] = useState("");
  const [specs, setSpecs] = useState<Array<{ label: string; value: string }>>(
    sku?.specs && sku.specs.length > 0
      ? sku.specs
      : [
          { label: "Material Grade", value: "Standard Residential" },
          { label: "Warranty", value: "Manufacturer Standard" },
        ]
  );
  const [fitGuardrailBadge, setFitGuardrailBadge] = useState(sku?.fitGuardrailBadge || "");

  // Pricing & Tax state
  const [mrp, setMrp] = useState<number>(sku?.mrp || 1000);
  const [sellingPrice, setSellingPrice] = useState<number>(sku?.sellingPrice || 850);
  const [dealerLandingCost, setDealerLandingCost] = useState<number>(sku?.dealerLandingCost || 750);
  const [gstPercent, setGstPercent] = useState<number>(sku?.gstPercent || 18);
  const [hsnCode, setHsnCode] = useState<string>(sku?.hsnCode || "8467");
  const [preferredVendorId, setPreferredVendorId] = useState<string>(
    sku?.preferredVendorId || "VEND-LKO-LATOUCHE"
  );

  // Logistics & Status state
  const [deliveryVehicleType, setDeliveryVehicleType] = useState<
    "2W_BIKE" | "3W_ELECTRIC_LOADER" | "4W_PICKUP" | "HEAVY_TRUCK"
  >(sku?.deliveryVehicleType || "2W_BIKE");
  const [inStock, setInStock] = useState<boolean>(sku?.inStock !== false);
  const [express60Min, setExpress60Min] = useState<boolean>(sku?.express60Min !== false);
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(sku?.isFeatured));
  const [isArchived, setIsArchived] = useState<boolean>(Boolean(sku?.archived));
  const [pairedSkuIds, setPairedSkuIds] = useState<string[]>(sku?.pairedSkuIds || []);
  const [pairedSearchQuery, setPairedSearchQuery] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Reset form when sku changes
  useEffect(() => {
    if (sku) {
      setName(sku.name || "");
      setBrand(sku.brand || "");
      setCategory(sku.category || "cement-tmt-chemicals");
      setSubcategory(sku.subcategory || "");
      setUnit(sku.unit || "Piece");
      setPackSize(sku.packSize || "");
      setOemModelCode(sku.oemModelCode || "");
      setImageUrl(sku.imageUrl || "");
      setShortDescription(sku.shortDescription || "");
      setHighlights(
        sku.highlights && sku.highlights.length > 0
          ? sku.highlights
          : ["ISI Certified Material", "Verified 60-Min Express Dispatch", "100% Genuine Lucknow Dealer Stock"]
      );
      setSpecs(
        sku.specs && sku.specs.length > 0
          ? sku.specs
          : [
              { label: "Material Grade", value: "Standard Residential" },
              { label: "Warranty", value: "Manufacturer Standard" },
            ]
      );
      setFitGuardrailBadge(sku.fitGuardrailBadge || "");
      setMrp(sku.mrp || 1000);
      setSellingPrice(sku.sellingPrice || 850);
      setDealerLandingCost(sku.dealerLandingCost || 750);
      setGstPercent(sku.gstPercent || 18);
      setHsnCode(sku.hsnCode || "8467");
      setPreferredVendorId(sku.preferredVendorId || "VEND-LKO-LATOUCHE");
      setDeliveryVehicleType(sku.deliveryVehicleType || "2W_BIKE");
      setInStock(sku.inStock !== false);
      setExpress60Min(sku.express60Min !== false);
      setIsFeatured(Boolean(sku.isFeatured));
      setIsArchived(Boolean(sku.archived));
      setPairedSkuIds(sku.pairedSkuIds || []);
    } else {
      // New SKU defaults
      setName("");
      setBrand("");
      setCategory("cement-tmt-chemicals");
      setSubcategory("");
      setUnit("Piece");
      setPackSize("");
      setOemModelCode("");
      setImageUrl("");
      setShortDescription("");
      setHighlights(["ISI Certified Material", "Fast 60-Min Hub Dispatch"]);
      setSpecs([{ label: "Grade", value: "Standard" }]);
      setFitGuardrailBadge("");
      setMrp(1000);
      setSellingPrice(850);
      setDealerLandingCost(750);
      setGstPercent(18);
      setHsnCode("8467");
      setPreferredVendorId("VEND-LKO-LATOUCHE");
      setDeliveryVehicleType("2W_BIKE");
      setInStock(true);
      setExpress60Min(true);
      setIsFeatured(false);
      setIsArchived(false);
      setPairedSkuIds([]);
    }
  }, [sku]);

  // Derived financials
  const discountPercent = useMemo(() => {
    if (!mrp || mrp <= sellingPrice) return 0;
    return Math.round(((mrp - sellingPrice) / mrp) * 100);
  }, [mrp, sellingPrice]);

  const preGstBase = useMemo(() => {
    return Math.round((sellingPrice / (1 + gstPercent / 100)) * 100) / 100;
  }, [sellingPrice, gstPercent]);

  const gstAmount = useMemo(() => {
    return Math.round((sellingPrice - preGstBase) * 100) / 100;
  }, [sellingPrice, preGstBase]);

  const netProfit = useMemo(() => {
    return Math.round((preGstBase - dealerLandingCost) * 100) / 100;
  }, [preGstBase, dealerLandingCost]);

  const netMarginPercent = useMemo(() => {
    if (!sellingPrice || sellingPrice <= 0) return 0;
    return Math.round((netProfit / sellingPrice) * 1000) / 10;
  }, [netProfit, sellingPrice]);

  // Heavy vehicle safety check
  const vehicleWarning = useMemo(() => {
    const heavyCategories = ["cement-tmt-chemicals", "bricks-sand-gitti-aac", "plywood", "tiles-marble-granite"];
    if (deliveryVehicleType === "2W_BIKE" && heavyCategories.includes(category)) {
      return "Safety Alert: Heavy construction materials (Cement, TMT, Sand, Tiles) must be dispatched via E-Loader, Pickup, or Heavy Truck/Trolley.";
    }
    return null;
  }, [category, deliveryVehicleType]);

  // ── Image Handlers ──────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    setIsProcessingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("categorySlug", category);
    fd.append("skuSlug", name ? name.toLowerCase().replace(/[^a-z0-9]/g, "-") : "product");

    try {
      const res = await fetch(resolveApiUrl("/api/admin/catalog/image"), {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Image upload failed");

      setImageUrl(data.imageUrl);
      toast.success("Image processed to 800x800 WebP and saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleUrlFetch = async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a valid image URL");
      return;
    }
    setIsProcessingImage(true);

    try {
      const res = await fetch(resolveApiUrl("/api/admin/catalog/image"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "url",
          imageUrl: urlInput.trim(),
          categorySlug: category,
          skuSlug: name ? name.toLowerCase().replace(/[^a-z0-9]/g, "-") : "product",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "URL processing failed");

      setImageUrl(data.imageUrl);
      setUrlInput("");
      toast.success("Remote image optimized and saved to storefront!");
    } catch (err: any) {
      toast.error(err.message || "Failed to process image URL");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleMagicAutoFetch = async () => {
    if (!name && !brand) {
      toast.error("Please enter Brand and Product Name first");
      return;
    }
    setIsProcessingImage(true);
    setAutoFetchWarning(null);

    try {
      const res = await fetch(resolveApiUrl("/api/admin/catalog/image"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "auto-fetch",
          brand,
          productName: name,
          oemModelCode,
          categorySlug: category,
        }),
      });
      const data = await res.json();
      if (data.candidates && data.candidates.length > 0) {
        setCandidatePhotos(data.candidates);
        if (data.warning) setAutoFetchWarning(data.warning);
        toast.success(`Found ${data.candidates.length} packshot candidates! Pick one below.`);
      } else {
        toast.info("No candidates found. You can paste an image URL or drag & drop a file.");
      }
    } catch (err: any) {
      toast.error(err.message || "Auto-fetch failed");
    } finally {
      setIsProcessingImage(false);
    }
  };

  // ── Highlight & Spec helpers ────────────────────────────────
  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setHighlights([...highlights, highlightInput.trim()]);
    setHighlightInput("");
  };

  const removeHighlight = (idx: number) => {
    setHighlights(highlights.filter((_, i) => i !== idx));
  };

  const addSpecRow = () => {
    setSpecs([...specs, { label: "Specification", value: "Value" }]);
  };

  const updateSpec = (idx: number, key: "label" | "value", val: string) => {
    const updated = [...specs];
    updated[idx][key] = val;
    setSpecs(updated);
  };

  const removeSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  // Auto-suggest smart cross-sell pairings based on category
  const handleAutoSuggestPairings = () => {
    let suggestions: string[] = [];
    if (category.includes("cement") || category.includes("tmt")) {
      suggestions = items
        .filter((i) => i.category.includes("sand") || i.category.includes("brick"))
        .slice(0, 3)
        .map((i) => i.id);
    } else if (category.includes("home-appliances") || category.includes("geyser")) {
      suggestions = items
        .filter((i) => i.name.toLowerCase().includes("angle valve") || i.name.toLowerCase().includes("pipe"))
        .slice(0, 3)
        .map((i) => i.id);
    } else if (category.includes("kitchen-sinks")) {
      suggestions = items
        .filter((i) => i.name.toLowerCase().includes("faucet") || i.name.toLowerCase().includes("waste coupling"))
        .slice(0, 3)
        .map((i) => i.id);
    } else {
      suggestions = items.filter((i) => i.category === category && i.id !== sku?.id).slice(0, 3).map((i) => i.id);
    }

    if (suggestions.length > 0) {
      setPairedSkuIds(suggestions);
      toast.success(`Attached ${suggestions.length} smart companion SKUs!`);
    } else {
      toast.info("No matching companion SKUs found.");
    }
  };

  // ── Save & Publish Handler ──────────────────────────────────
  const handleSave = async (andAddAnother: boolean = false) => {
    if (!name.trim()) {
      toast.error("Product Name is required");
      return;
    }
    if (!brand.trim()) {
      toast.error("Brand is required");
      return;
    }
    if (sellingPrice <= 0) {
      toast.error("Selling Price must be greater than 0");
      return;
    }
    if (mrp && sellingPrice > mrp) {
      toast.error("Selling Price cannot exceed MRP");
      return;
    }

    setIsSaving(true);

    const payload = {
      name: name.trim(),
      brand: brand.trim(),
      category,
      subcategory: subcategory.trim() || undefined,
      unit,
      packSize: packSize.trim() || undefined,
      oemModelCode: oemModelCode.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      highlights,
      specs,
      fitGuardrailBadge: fitGuardrailBadge.trim() || undefined,
      sellingPrice: Number(sellingPrice),
      mrp: Number(mrp),
      dealerLandingCost: Number(dealerLandingCost),
      preferredVendorId,
      gstPercent: Number(gstPercent),
      hsnCode: hsnCode.trim() || "8467",
      deliveryVehicleType,
      imageUrl: imageUrl.trim(),
      inStock,
      express60Min,
      isFeatured,
      archived: isArchived,
      pairedSkuIds,
    };

    try {
      let res: Response;
      if (isEditing && sku) {
        res = await fetch(resolveApiUrl(`/api/admin/catalog/sku/${sku.id}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(resolveApiUrl("/api/admin/catalog/sku"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Save failed");

      refetch();
      if (onSaved) onSaved(data.sku);

      toast.success(
        isEditing
          ? `Updated "${name.slice(0, 24)}..." — Live on storefront!`
          : `Published "${name.slice(0, 24)}..." live to customer storefront!`
      );

      if (andAddAnother) {
        setName("");
        setOemModelCode("");
        setImageUrl("");
        setShortDescription("");
        setFitGuardrailBadge("");
      } else {
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Duplicate SKU Handler ───────────────────────────────────
  const handleDuplicate = async () => {
    if (!sku) return;
    setIsSaving(true);
    try {
      const res = await fetch(resolveApiUrl(`/api/admin/catalog/sku/${sku.id}/duplicate`), {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to duplicate");
      refetch();
      toast.success(`Duplicated SKU: ${data.sku.name}`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Duplicate failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-6xl bg-slate-50 h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
        {/* ── DRAWER HEADER ── */}
        <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center font-black text-slate-950 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  {isEditing ? `Edit Product: ${sku?.id}` : "Add Brand-New Product to Storefront"}
                </h2>
                {isEditing && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    {sku?.id}
                  </span>
                )}
                {isFeatured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Bestseller
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Lucknow Zero-Inventory Catalog Studio • Instant Live Sync to Customer Storefront
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing && (
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Duplicate SKU</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ── DRAWER BODY (TWO-COLUMN WORKSPACE) ── */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* ═════════════════════════════════════════════════════════════
              LEFT COLUMN: STRUCTURED MERCHANDISING CONTROLS (7 Cols)
          ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 p-6 space-y-6 overflow-y-auto">
            {/* SECTION A: IDENTITY & CATEGORIZATION */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                  A
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Identity & Categorization
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. UltraTech Super OPC 53 Grade Cement 50kg"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      list="existing-brands"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. UltraTech, Astral, Havells"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-400 transition"
                    />
                    <datalist id="existing-brands">
                      {brands.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-400 transition"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name} ({c.count})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subcategory</label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g. Storage Geysers"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit / Billing UOM</label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="Piece, 50kg Bag, 100 CFT"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pack Size / Spec</label>
                    <input
                      type="text"
                      value={packSize}
                      onChange={(e) => setPackSize(e.target.value)}
                      placeholder="e.g. 50 kg, 20 Ltr"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">OEM / Manufacturer Model Code</label>
                  <input
                    type="text"
                    value={oemModelCode}
                    onChange={(e) => setOemModelCode(e.target.value)}
                    placeholder="e.g. SGS-PLUS-006, WDFL-906-HAC"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* SECTION B: TRI-MODE VISUAL MEDIA STUDIO */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs">
                    B
                  </span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Tri-Mode Visual Media Studio (800×800 White WebP)
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      imageMode === "upload" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    📁 Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      imageMode === "url" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    🔗 Paste URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("auto")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      imageMode === "auto" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    ✨ Magic Auto-Find
                  </button>
                </div>
              </div>

              {/* Mode 1: Drag & Drop Upload */}
              {imageMode === "upload" && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/40 rounded-2xl p-6 text-center cursor-pointer transition group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-black text-slate-800">
                    {isProcessingImage ? "Optimizing to 800×800 WebP..." : "Drag & Drop Image or Click to Browse"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports PNG, JPG, WEBP up to 10MB • Auto-centered on pure white canvas
                  </p>
                </div>
              )}

              {/* Mode 2: Remote URL Paste */}
              {imageMode === "url" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/product-packshot.jpg"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUrlFetch}
                      disabled={isProcessingImage}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      {isProcessingImage ? "Fetching..." : "Fetch & Optimize"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Image will be downloaded safely, verified for image mime-type, and formatted to WebP.
                  </p>
                </div>
              )}

              {/* Mode 3: Magic Auto-Find */}
              {imageMode === "auto" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600 font-medium">
                      Search real manufacturer packshots for <strong>{brand || "Brand"}</strong> {name || "Product"}
                    </p>
                    <button
                      type="button"
                      onClick={handleMagicAutoFetch}
                      disabled={isProcessingImage}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isProcessingImage ? "Searching..." : "1-Click Magic Find"}</span>
                    </button>
                  </div>

                  {autoFetchWarning && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>{autoFetchWarning}</span>
                    </div>
                  )}

                  {candidatePhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {candidatePhotos.map((c, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setImageUrl(c.url);
                            toast.success("Applied candidate packshot!");
                          }}
                          className={`p-2 rounded-xl border cursor-pointer hover:border-amber-500 hover:shadow-xs transition bg-white text-center group ${
                            imageUrl === c.url ? "border-amber-500 ring-2 ring-amber-400" : "border-slate-200"
                          }`}
                        >
                          <div className="w-full h-20 rounded-lg overflow-hidden bg-white flex items-center justify-center mb-1">
                            <img src={c.thumbnailUrl || c.url} alt={c.title} className="w-full h-full object-contain" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-700 truncate">{c.title}</p>
                          <span className="text-[9px] text-emerald-700 font-bold group-hover:underline">Pick Photo</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Current Active Image Preview Pill */}
              {imageUrl && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                      <CononProductMedia src={imageUrl} title={name || "Product"} brand={brand} alt={name} variant="thumb" containerClassName="w-full h-full" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate max-w-[280px]">{imageUrl}</p>
                      <span className="text-[10px] font-bold text-emerald-600">800×800 Square WebP Ready</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* SECTION C: DESCRIPTION, HIGHLIGHTS & SPECS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                  C
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Description, Highlights & Technical Specs
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Short Description (PDP & Quick View)</label>
                  <textarea
                    rows={2}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="e.g. UltraTech Super OPC 53 Grade delivers high initial compressive strength ideal for heavy RCC foundations, beams, and columns across Lucknow high-rise construction."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                {/* Bullet Highlights */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700">Key Bullet Highlights</label>
                    <span className="text-[10px] text-slate-400">{highlights.length} highlights added</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addHighlight();
                        }
                      }}
                      placeholder="e.g. 8-Bar High-Rise Geyser Rating"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={addHighlight}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {highlights.map((h, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
                      >
                        <span>• {h}</span>
                        <button
                          type="button"
                          onClick={() => removeHighlight(i)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technical Specifications Key-Value Builder */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700">Technical Specifications (Key : Value)</label>
                    <button
                      type="button"
                      onClick={addSpecRow}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700"
                    >
                      + Add Spec Row
                    </button>
                  </div>
                  <div className="space-y-2">
                    {specs.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={s.label}
                          onChange={(e) => updateSpec(idx, "label", e.target.value)}
                          placeholder="Spec Name (e.g. Coverage)"
                          className="w-1/3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs"
                        />
                        <input
                          type="text"
                          value={s.value}
                          onChange={(e) => updateSpec(idx, "value", e.target.value)}
                          placeholder="Value (e.g. 55-60 sq ft / bag)"
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpec(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fit Guardrail Pill */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Site / Fit Guardrail Warning Pill (Optional)
                  </label>
                  <input
                    type="text"
                    value={fitGuardrailBadge}
                    onChange={(e) => setFitGuardrailBadge(e.target.value)}
                    placeholder="e.g. Requires 35–65mm Wooden Door • Single-Batch Dye Lot"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-900"
                  />
                </div>
              </div>
            </div>

            {/* SECTION D: PRICING, GST & NET PROFIT */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-xs">
                  D
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Pricing, GST & Dealer Net Margin Breakdown
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">MRP / List (₹)</label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price incl. GST (₹)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dealer Landing Cost (₹)</label>
                  <input
                    type="number"
                    value={dealerLandingCost}
                    onChange={(e) => setDealerLandingCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900"
                  />
                </div>
              </div>

              {/* Conon Net Profit Real-Time Card */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Live Profit Controller</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      netMarginPercent >= 8
                        ? "bg-emerald-500/20 text-emerald-300"
                        : netMarginPercent >= 4
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-red-500/20 text-red-300 animate-pulse"
                    }`}
                  >
                    Net Margin: {netMarginPercent}% {netMarginPercent < 4 && "⚠ Low Margin"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-[10px] text-slate-400">Pre-GST Base</p>
                    <p className="font-black text-white mt-0.5">₹{preGstBase.toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-[10px] text-slate-400">GST ({gstPercent}%)</p>
                    <p className="font-black text-white mt-0.5">₹{gstAmount.toFixed(2)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-[10px] text-slate-400">Dealer Cost</p>
                    <p className="font-black text-slate-300 mt-0.5">₹{dealerLandingCost}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <p className="text-[10px] text-emerald-400 font-bold">Net Profit ₹</p>
                    <p className="font-black text-emerald-300 mt-0.5">₹{netProfit.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST Slab</label>
                  <div className="flex gap-1.5">
                    {[5, 12, 18].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGstPercent(g)}
                        className={`flex-1 py-1.5 rounded-xl font-black text-xs transition ${
                          gstPercent === g
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {g}%
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* SECTION E: LOGISTICS, SWITCHES & CROSS-SELL */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                  E
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Logistics, Merchandising & Cross-Sell
                </h3>
              </div>

              {/* Delivery Vehicle Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-xs">Delivery Vehicle Class</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "2W_BIKE", label: "2-Wheeler", sub: "Small items, Wires, Locks" },
                    { id: "3W_ELECTRIC_LOADER", label: "E-Loader", sub: "Tanks, Geysers, Sinks" },
                    { id: "4W_PICKUP", label: "Pickup Truck", sub: "Doors, Tiles, Plywood" },
                    { id: "HEAVY_TRUCK", label: "Heavy / Trolley", sub: "Cement, Sand, Sariya" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setDeliveryVehicleType(v.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        deliveryVehicleType === v.id
                          ? "border-amber-500 bg-amber-50/50 ring-1 ring-amber-400"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <Truck className={`w-4 h-4 mb-1 ${deliveryVehicleType === v.id ? "text-amber-600" : "text-slate-400"}`} />
                      <p className="text-xs font-black text-slate-900 leading-tight">{v.label}</p>
                      <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{v.sub}</p>
                    </button>
                  ))}
                </div>
                {vehicleWarning && (
                  <p className="text-[11px] font-bold text-amber-700 bg-amber-50 p-2 rounded-xl mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{vehicleWarning}</span>
                  </p>
                )}
              </div>

              {/* Status Switches */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <label className="p-3 border rounded-xl flex items-center justify-between cursor-pointer bg-slate-50">
                  <span className="font-bold text-slate-800">In Stock</span>
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>
                <label className="p-3 border rounded-xl flex items-center justify-between cursor-pointer bg-slate-50">
                  <span className="font-bold text-slate-800">60-Min Express</span>
                  <input
                    type="checkbox"
                    checked={express60Min}
                    onChange={(e) => setExpress60Min(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>
                <label className="p-3 border rounded-xl flex items-center justify-between cursor-pointer bg-slate-50">
                  <span className="font-bold text-slate-800">Featured</span>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                </label>
                <label className="p-3 border rounded-xl flex items-center justify-between cursor-pointer bg-slate-50">
                  <span className="font-bold text-red-600">Archive / Hide</span>
                  <input
                    type="checkbox"
                    checked={isArchived}
                    onChange={(e) => setIsArchived(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                </label>
              </div>

              {/* Frequently Paired With Cross-Sell Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <label className="font-bold text-slate-700">Frequently Paired With (Cross-Sell)</label>
                  <button
                    type="button"
                    onClick={handleAutoSuggestPairings}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Suggest Smart Pairings
                  </button>
                </div>
                <div className="flex gap-2 mb-2 text-xs">
                  <input
                    type="text"
                    value={pairedSearchQuery}
                    onChange={(e) => setPairedSearchQuery(e.target.value)}
                    placeholder="Search SKU by name to attach as companion item..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                {pairedSearchQuery.trim() && (
                  <div className="max-h-36 overflow-y-auto border rounded-xl divide-y bg-white text-xs mb-2">
                    {items
                      .filter(
                        (i) =>
                          i.name.toLowerCase().includes(pairedSearchQuery.toLowerCase()) &&
                          !pairedSkuIds.includes(i.id) &&
                          i.id !== sku?.id
                      )
                      .slice(0, 5)
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setPairedSkuIds([...pairedSkuIds, p.id]);
                            setPairedSearchQuery("");
                          }}
                          className="p-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate max-w-[280px] font-bold text-slate-800">{p.name}</span>
                          <span className="text-amber-600 font-bold shrink-0">+ Attach</span>
                        </div>
                      ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {pairedSkuIds.map((pid) => {
                    const match = items.find((i) => i.id === pid);
                    return (
                      <span
                        key={pid}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold"
                      >
                        <span className="truncate max-w-[180px]">{match?.name || pid}</span>
                        <button
                          type="button"
                          onClick={() => setPairedSkuIds(pairedSkuIds.filter((id) => id !== pid))}
                          className="text-amber-700 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════
              RIGHT COLUMN: STICKY STOREFRONT LIVE PREVIEW (5 Cols)
          ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 p-6 bg-slate-100/70 space-y-6">
            <div className="sticky top-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Storefront Preview
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {typeof window !== "undefined" ? window.location.host : "conon-storefront"}/home
                </span>
              </div>

              {/* Exact Storefront Product Card Preview */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md space-y-3 max-w-[320px] mx-auto">
                <div className="relative aspect-square w-full rounded-xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center p-2">
                  <CononProductMedia
                    src={imageUrl}
                    title={name || "Product Preview"}
                    brand={brand}
                    alt={name || "Product Preview"}
                    variant="card"
                    containerClassName="w-full h-full"
                    className="w-full h-full object-contain"
                  />
                  {express60Min && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-slate-900 text-amber-400 flex items-center gap-1 shadow-xs">
                      <Clock className="w-2.5 h-2.5" /> 60-MIN
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-600 text-white shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                    {brand || "BRAND"}
                  </p>
                  <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-tight mt-0.5">
                    {name || "Product Title Preview"}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{unit || "1 Piece"}</p>
                </div>

                {fitGuardrailBadge && (
                  <div className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-900 line-clamp-1">
                    ⚠ {fitGuardrailBadge}
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-base font-black text-slate-950">₹{sellingPrice}</span>
                    {mrp > sellingPrice && (
                      <span className="text-xs text-slate-400 line-through ml-1.5 font-medium">₹{mrp}</span>
                    )}
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                    ADD
                  </span>
                </div>
              </div>

              {/* Mini PDP Sheet Specs Preview */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 text-xs">
                <p className="font-black text-slate-900 border-b pb-1.5 text-xs">Customer PDP Highlights</p>
                {shortDescription && (
                  <p className="text-slate-600 text-[11px] leading-relaxed italic">"{shortDescription}"</p>
                )}
                <div className="space-y-1">
                  {highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
                {specs.length > 0 && (
                  <div className="border rounded-xl divide-y text-[10px]">
                    {specs.slice(0, 3).map((s, idx) => (
                      <div key={idx} className="flex justify-between p-1.5">
                        <span className="text-slate-500 font-bold">{s.label}</span>
                        <span className="text-slate-900 font-medium">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── STICKY FOOTER ── */}
        <footer className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-black transition disabled:opacity-50"
              >
                Save & Add Another
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black shadow-md transition active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{isSaving ? "Saving Live..." : isEditing ? "Save & Publish Changes" : "Publish Live to Storefront"}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

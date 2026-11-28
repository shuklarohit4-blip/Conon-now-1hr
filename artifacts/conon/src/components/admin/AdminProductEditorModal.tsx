import React, { useEffect, useState } from "react";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Package,
  Image as ImageIcon,
  ListChecks,
  Layers,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AdminMasterCategory,
  type AdminMasterProduct,
  getCivilAutoFill,
} from "@/services/adminMasterCatalog";
import { uploadProductImageFile } from "@/services/liveProductsStore";
import { resolveCategoryAssetUrl } from "@/services/liveCategoriesStore";

interface AdminProductEditorModalProps {
  open: boolean;
  editingProduct: AdminMasterProduct | null;
  categories: AdminMasterCategory[];
  onClose: () => void;
  onSave: (product: Partial<AdminMasterProduct> & {
    title: string;
    brand: string;
    categorySlug: string;
    imageUrl: string;
  }) => Promise<void>;
}

type EditorTab = "basic" | "gallery" | "blinkit" | "variants";

const SLOT_LABELS: Array<{ slot: "front" | "back" | "specs" | "application" | "packaging"; label: string }> = [
  { slot: "front", label: "1. Front View" },
  { slot: "back", label: "2. Back / Ingredients" },
  { slot: "specs", label: "3. Spec Sheet / ISI" },
  { slot: "application", label: "4. On-Site Application" },
  { slot: "packaging", label: "5. Packaging / Box" },
];

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function validateFileClient(file: File): string | null {
  if (file.size > 5 * 1024 * 1024) {
    return "Image exceeds 5MB limit. Please choose a smaller image.";
  }
  if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    return "Only JPG, PNG, WebP, and AVIF images are allowed.";
  }
  return null;
}

export function AdminProductEditorModal({
  open,
  editingProduct,
  categories,
  onClose,
  onSave,
}: AdminProductEditorModalProps) {
  const [tab, setTab] = useState<EditorTab>("basic");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingSlotIdx, setUploadingSlotIdx] = useState<number | null>(null);

  // Basic & Pricing
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [categorySlug, setCategorySlug] = useState("cement-civil-works");
  const [subcategory, setSubcategory] = useState("");
  const [unit, setUnit] = useState("Bag (50kg)");
  const [mrp, setMrp] = useState<number>(410);
  const [sellingPrice, setSellingPrice] = useState<number>(385);
  const [cashbackPercent, setCashbackPercent] = useState<number>(2);
  const [stockQty, setStockQty] = useState<number>(120);
  const [isInStock, setIsInStock] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [hsnCode, setHsnCode] = useState("25232910");
  const [gstRate, setGstRate] = useState<number>(18);
  const [vehicleRequirement, setVehicleRequirement] = useState<"BIKE" | "LOADER">("LOADER");
  const [adminLocked, setAdminLocked] = useState<boolean>(true);

  // Multi-image gallery (up to 5)
  const [images, setImages] = useState<
    Array<{
      id: string;
      url: string;
      slot?: "front" | "back" | "specs" | "application" | "packaging";
      caption?: string;
      isPrimary?: boolean;
      order: number;
    }>
  >([]);

  // Blinkit Highlights & All Details
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<Array<{ label: string; value: string }>>([]);
  const [keyInfo, setKeyInfo] = useState<Array<{ label: string; value: string }>>([]);
  const [usageTips, setUsageTips] = useState<string[]>([]);

  // Variants & Bulk Slabs
  const [variants, setVariants] = useState<
    Array<{ id: string; label: string; unit: string; price: number; mrp: number; stock?: number }>
  >([]);
  const [bulkSlabs, setBulkSlabs] = useState<
    Array<{ minQty: number; price: number; label?: string }>
  >([]);

  useEffect(() => {
    if (!open) return;
    setTab("basic");
    setDirty(false);
    if (editingProduct) {
      setTitle(editingProduct.title || "");
      setBrand(editingProduct.brand || "");
      setCategorySlug(editingProduct.categorySlug || categories[0]?.slug || "cement-civil-works");
      setSubcategory(editingProduct.subcategory || "");
      setUnit(editingProduct.unit || "Unit");
      setMrp(Number(editingProduct.mrp) || 0);
      setSellingPrice(Number(editingProduct.sellingPrice) || 0);
      setCashbackPercent(Number(editingProduct.cashbackPercent ?? 2));
      setStockQty(Number(editingProduct.stockQty ?? (editingProduct.isInStock ? 100 : 0)));
      setIsInStock(editingProduct.isInStock !== false);
      setIsFeatured(Boolean(editingProduct.isFeatured));
      setHsnCode(editingProduct.hsnCode || "38245010");
      setGstRate(Number(editingProduct.gstRate ?? 18));
      setVehicleRequirement(editingProduct.vehicleRequirement === "BIKE" ? "BIKE" : "LOADER");
      setAdminLocked(editingProduct.adminLocked !== false);
      setDescription(editingProduct.description || "");
      setImages(
        editingProduct.images && editingProduct.images.length > 0
          ? editingProduct.images.slice(0, 5)
          : editingProduct.imageUrl
          ? [
              {
                id: "img_1",
                url: editingProduct.imageUrl,
                slot: "front",
                caption: "Front View",
                isPrimary: true,
                order: 0,
              },
            ]
          : []
      );
      setHighlights(
        editingProduct.highlights?.length
          ? editingProduct.highlights
          : editingProduct.specTags?.slice(0, 6) || []
      );
      setKeyInfo(
        editingProduct.keyInfo?.length
          ? editingProduct.keyInfo
          : editingProduct.specTags || []
      );
      setUsageTips(
        editingProduct.usageTips?.length
          ? editingProduct.usageTips
          : [
              "Verify batch number and factory seal before unloading.",
              "Store in dry covered space away from moisture.",
            ]
      );
      setVariants(editingProduct.variants || []);
      setBulkSlabs(
        editingProduct.bulkSlabs?.length
          ? editingProduct.bulkSlabs
          : [
              {
                minQty: Number(editingProduct.bulkMinQty || 10),
                price: Number(editingProduct.bulkPrice || editingProduct.sellingPrice || 0),
                label: "Wholesale Contractor Slab",
              },
            ]
      );
    } else {
      setTitle("");
      setBrand("");
      setCategorySlug(categories[0]?.slug || "cement-civil-works");
      setSubcategory("");
      setUnit("Unit");
      setMrp(500);
      setSellingPrice(425);
      setCashbackPercent(2);
      setStockQty(100);
      setIsInStock(true);
      setIsFeatured(false);
      setHsnCode("38245010");
      setGstRate(18);
      setVehicleRequirement("LOADER");
      setAdminLocked(true);
      setDescription("");
      setImages([]);
      setHighlights([
        { label: "Grade", value: "Commercial / ISI Certified" },
        { label: "Delivery SLA", value: "60 Mins Lucknow Express" },
      ]);
      setKeyInfo([
        { label: "Standard", value: "BIS / IS Certified" },
        { label: "Origin", value: "India" },
      ]);
      setUsageTips(["Follow manufacturer specification during installation."]);
      setVariants([]);
      setBulkSlabs([{ minQty: 10, price: 395, label: "10+ Units Bulk Rate" }]);
    }
  }, [open, editingProduct, categories]);

  if (!open) return null;

  const savePercent = mrp > sellingPrice && mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const priceInvalidWarning = sellingPrice > mrp && mrp > 0;

  const handleCloseSafe = () => {
    if (dirty && !window.confirm("Discard unsaved product changes?")) return;
    onClose();
  };

  const handleAutoFill = () => {
    const auto = getCivilAutoFill(categorySlug, brand, title);
    setDirty(true);
    setHsnCode(auto.hsnCode);
    setGstRate(auto.gstRate);
    setVehicleRequirement(auto.vehicleRequirement);
    if (auto.unit) setUnit(auto.unit);
    if (auto.mrp) setMrp(auto.mrp);
    if (auto.sellingPrice) setSellingPrice(auto.sellingPrice);
    if (auto.bulkPrice) {
      setBulkSlabs([{ minQty: auto.bulkMinQty || 10, price: auto.bulkPrice, label: "Bulk Contractor Slab" }]);
    }
    if (auto.specTags) {
      setHighlights(auto.specTags.slice(0, 6));
      setKeyInfo(auto.specTags);
    }
    toast.success(`Auto-filled HSN ${auto.hsnCode} (${auto.gstRate}% GST) & specs!`);
  };

  const handleUploadImageForSlot = async (
    file: File,
    slotIdx: number,
    slotDef: { slot: "front" | "back" | "specs" | "application" | "packaging"; label: string }
  ) => {
    const errMsg = validateFileClient(file);
    if (errMsg) {
      toast.error(errMsg);
      return;
    }
    setUploadingSlotIdx(slotIdx);
    try {
      const slug = editingProduct?.id || title || brand || "product";
      const uploaded = await uploadProductImageFile(file, slug);
      setDirty(true);
      setImages((prev) => {
        const next = [...prev];
        const newEntry = {
          id: `pimg_${Date.now()}_${slotIdx}`,
          url: uploaded.url,
          slot: slotDef.slot,
          caption: slotDef.label.replace(/^\d+\.\s*/, ""),
          isPrimary: slotIdx === 0,
          order: slotIdx,
        };
        if (slotIdx < next.length) {
          next[slotIdx] = newEntry;
        } else {
          next.push(newEntry);
        }
        return next.slice(0, 5).map((item, i) => ({ ...item, isPrimary: i === 0, order: i }));
      });
      toast.success(`Uploaded photo to ${slotDef.label}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed uploading product image");
    } finally {
      setUploadingSlotIdx(null);
    }
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    setDirty(true);
    const next = [...images];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setImages(next.map((im, i) => ({ ...im, isPrimary: i === 0, order: i })));
  };

  const removeImage = (idx: number) => {
    setDirty(true);
    setImages((prev) =>
      prev.filter((_, i) => i !== idx).map((im, i) => ({ ...im, isPrimary: i === 0, order: i }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brand.trim()) {
      toast.error("Product Title and Brand are required.");
      setTab("basic");
      return;
    }
    if (sellingPrice < 0 || mrp < 0) {
      toast.error("Prices cannot be negative.");
      setTab("basic");
      return;
    }

    const firstBulk = bulkSlabs[0];
    const primaryUrl =
      images[0]?.url ||
      editingProduct?.imageUrl ||
      "/images/home-categories/cement-civil-works.webp";

    setSaving(true);
    try {
      await onSave({
        id: editingProduct?.id,
        title: title.trim(),
        brand: brand.trim(),
        categorySlug,
        subcategory: subcategory.trim() || undefined,
        unit: unit.trim() || "Unit",
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        bulkPrice: firstBulk ? Number(firstBulk.price) : Number(sellingPrice),
        bulkMinQty: firstBulk ? Number(firstBulk.minQty) : 10,
        cashbackPercent: Number(cashbackPercent),
        stockQty: Number(stockQty),
        isInStock,
        isFeatured,
        hsnCode: hsnCode.trim(),
        gstRate: Number(gstRate),
        vehicleRequirement,
        adminLocked,
        imageUrl: primaryUrl,
        images,
        description: description.trim(),
        specTags: keyInfo.filter((k) => k.label.trim() && k.value.trim()),
        highlights: highlights.filter((h) => h.label.trim() && h.value.trim()).slice(0, 6),
        keyInfo: keyInfo.filter((k) => k.label.trim() && k.value.trim()),
        usageTips: usageTips.map((u) => u.trim()).filter(Boolean),
        variants,
        bulkSlabs,
      });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white"
      >
        {/* Top Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-black">
                {editingProduct ? `Edit Product: ${editingProduct.title}` : "Create Master Product"}
              </h3>
              <p className="text-[11px] text-slate-400">
                Blinkit-Grade Details · Relative `/uploads/products/` Photos · Live SSE Sync
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dirty && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300">
                Unsaved
              </span>
            )}
            <button
              type="button"
              onClick={handleAutoFill}
              className="px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-black flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-Fill Specs
            </button>
            <button
              type="button"
              onClick={handleCloseSafe}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Editor Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 flex flex-wrap gap-2 bg-slate-950/40">
          {(
            [
              { id: "basic", label: "Basic & Pricing", icon: Package },
              { id: "gallery", label: `Multi-Image (${images.length}/5)`, icon: ImageIcon },
              { id: "blinkit", label: "Highlights & All Details", icon: ListChecks },
              { id: "variants", label: `Variants & Bulk Slabs`, icon: Layers },
            ] as Array<{ id: EditorTab; label: string; icon: any }>
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-black flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                tab === t.id
                  ? "border-amber-400 text-amber-300 bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {tab === "basic" && (
            <div className="space-y-4">
              {priceInvalidWarning && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    Warning: Selling Price (₹{sellingPrice}) is higher than MRP (₹{mrp}). Buyers expect Selling Price ≤ MRP.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => { setDirty(true); setTitle(e.target.value); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => { setDirty(true); setBrand(e.target.value); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category *</label>
                  <select
                    value={categorySlug}
                    onChange={(e) => { setDirty(true); setCategorySlug(e.target.value); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Unit / Pack Size *</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => { setDirty(true); setUnit(e.target.value); }}
                    placeholder="e.g. Bag (50kg), Roll (90m)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={sellingPrice}
                    onChange={(e) => { setDirty(true); setSellingPrice(Number(e.target.value) || 0); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={mrp}
                    onChange={(e) => { setDirty(true); setMrp(Number(e.target.value) || 0); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Auto Discount Badge</label>
                  <div className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-center">
                    {savePercent > 0 ? `SAVE ${savePercent}%` : "No Discount"}
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Cashback %</label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    step={0.5}
                    value={cashbackPercent}
                    onChange={(e) => { setDirty(true); setCashbackPercent(Number(e.target.value) || 0); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={stockQty}
                    onChange={(e) => { setDirty(true); setStockQty(Number(e.target.value) || 0); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => { setDirty(true); setHsnCode(e.target.value); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">GST Slab %</label>
                  <select
                    value={gstRate}
                    onChange={(e) => { setDirty(true); setGstRate(Number(e.target.value)); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    {[5, 12, 18, 28].map((r) => (
                      <option key={r} value={r}>{r}% GST</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Vehicle Class</label>
                  <select
                    value={vehicleRequirement}
                    onChange={(e) => { setDirty(true); setVehicleRequirement(e.target.value as any); }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <option value="LOADER">Chhota Hathi (Loader)</option>
                    <option value="BIKE">Delivery Bike (&lt;=30kg)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInStock}
                    onChange={(e) => { setDirty(true); setIsInStock(e.target.checked); }}
                  />
                  <span>In Stock (Available for 60-Min Order)</span>
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => { setDirty(true); setIsFeatured(e.target.checked); }}
                  />
                  <span>Featured Product on Storefront</span>
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminLocked}
                    onChange={(e) => { setDirty(true); setAdminLocked(e.target.checked); }}
                  />
                  <span>Master Lock (Vendors cannot alter core specs)</span>
                </label>
              </div>
            </div>
          )}

          {tab === "gallery" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Upload up to 5 verified product images (`Front`, `Back`, `Specs`, `Application`, `Packaging`). Stored permanently in `/uploads/products/` with zero localhost URLs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {SLOT_LABELS.map((slotDef, idx) => {
                  const existingImg = images[idx];
                  return (
                    <div
                      key={slotDef.slot}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 flex flex-col justify-between space-y-2"
                    >
                      <div className="text-[11px] font-black text-amber-300 flex items-center justify-between">
                        <span>{slotDef.label}</span>
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">
                            PRIMARY
                          </span>
                        )}
                      </div>

                      <div className="aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-1">
                        {existingImg?.url ? (
                          <img
                            src={resolveCategoryAssetUrl(existingImg.url)}
                            alt={slotDef.label}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-700" />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="w-full px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer">
                          <Upload className="w-3 h-3 text-amber-400" />
                          <span>
                            {uploadingSlotIdx === idx
                              ? "Uploading..."
                              : existingImg
                              ? "Replace"
                              : "Upload"}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void handleUploadImageForSlot(f, idx, slotDef);
                            }}
                          />
                        </label>

                        {existingImg && (
                          <div className="flex items-center justify-between gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveImage(idx, -1)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                              title="Move Left"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === images.length - 1}
                              onClick={() => moveImage(idx, 1)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                              title="Move Right"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 cursor-pointer"
                              title="Remove Photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "blinkit" && (
            <div className="space-y-5">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => { setDirty(true); setDescription(e.target.value); }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800"
                />
              </div>

              {/* 6 Highlight Tiles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-300">
                    Blinkit Top Highlight Tiles ({highlights.length}/6)
                  </span>
                  {highlights.length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDirty(true);
                        setHighlights([...highlights, { label: "", value: "" }]);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Tile
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Label (e.g. Standard)"
                        value={h.label}
                        onChange={(e) => {
                          setDirty(true);
                          setHighlights(highlights.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x));
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. IS 1489)"
                        value={h.value}
                        onChange={(e) => {
                          setDirty(true);
                          setHighlights(highlights.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x));
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDirty(true);
                          setHighlights(highlights.filter((_, idx) => idx !== i));
                        }}
                        className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Information Rows */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sky-300">All Details &rarr; Key Information Rows</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDirty(true);
                      setKeyInfo([...keyInfo, { label: "", value: "" }]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Row
                  </button>
                </div>
                <div className="space-y-1.5">
                  {keyInfo.map((row, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Key"
                        value={row.label}
                        onChange={(e) => {
                          setDirty(true);
                          setKeyInfo(keyInfo.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x));
                        }}
                        className="w-1/3 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={row.value}
                        onChange={(e) => {
                          setDirty(true);
                          setKeyInfo(keyInfo.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x));
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setDirty(true);
                          setKeyInfo(keyInfo.filter((_, idx) => idx !== i));
                        }}
                        className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage & Storage Tips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-300">Usage &amp; Storage Tips</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDirty(true);
                      setUsageTips([...usageTips, ""]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Tip
                  </button>
                </div>
                {usageTips.map((tip, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => {
                        setDirty(true);
                        setUsageTips(usageTips.map((x, idx) => idx === i ? e.target.value : x));
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDirty(true);
                        setUsageTips(usageTips.filter((_, idx) => idx !== i));
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "variants" && (
            <div className="space-y-5">
              {/* Variants */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-300">Pack / Size Variants (e.g. 1 Kg / 5 Kg / 25 Kg / 50 Kg)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDirty(true);
                      setVariants([
                        ...variants,
                        { id: `var_${Date.now()}`, label: "25 Kg", unit: "25 Kg", price: sellingPrice, mrp, stock: 50 },
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Variant
                  </button>
                </div>
                {variants.map((v, i) => (
                  <div key={v.id} className="grid grid-cols-5 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Label (5 Kg)"
                      value={v.label}
                      onChange={(e) => {
                        setDirty(true);
                        setVariants(variants.map((x, idx) => idx === i ? { ...x, label: e.target.value, unit: e.target.value } : x));
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800"
                    />
                    <input
                      type="number"
                      placeholder="Price ₹"
                      value={v.price}
                      onChange={(e) => {
                        setDirty(true);
                        setVariants(variants.map((x, idx) => idx === i ? { ...x, price: Number(e.target.value) || 0 } : x));
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono"
                    />
                    <input
                      type="number"
                      placeholder="MRP ₹"
                      value={v.mrp}
                      onChange={(e) => {
                        setDirty(true);
                        setVariants(variants.map((x, idx) => idx === i ? { ...x, mrp: Number(e.target.value) || 0 } : x));
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={v.stock ?? 50}
                      onChange={(e) => {
                        setDirty(true);
                        setVariants(variants.map((x, idx) => idx === i ? { ...x, stock: Number(e.target.value) || 0 } : x));
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDirty(true);
                        setVariants(variants.filter((_, idx) => idx !== i));
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 justify-self-start cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bulk Pricing Slabs */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-300">Quantity Bulk Slabs (10+ Bags, 50+ Bags)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDirty(true);
                      setBulkSlabs([
                        ...bulkSlabs,
                        { minQty: 50, price: Math.round(sellingPrice * 0.92), label: "50+ Units Site Rate" },
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Bulk Slab
                  </button>
                </div>
                {bulkSlabs.map((slab, i) => {
                  const savePerUnit = Math.max(0, sellingPrice - slab.price);
                  return (
                    <div key={i} className="grid grid-cols-5 gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Min Qty"
                        value={slab.minQty}
                        onChange={(e) => {
                          setDirty(true);
                          setBulkSlabs(bulkSlabs.map((x, idx) => idx === i ? { ...x, minQty: Number(e.target.value) || 1 } : x));
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Slab Price ₹"
                        value={slab.price}
                        onChange={(e) => {
                          setDirty(true);
                          setBulkSlabs(bulkSlabs.map((x, idx) => idx === i ? { ...x, price: Number(e.target.value) || 0 } : x));
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-emerald-400"
                      />
                      <input
                        type="text"
                        placeholder="Slab Label"
                        value={slab.label || ""}
                        onChange={(e) => {
                          setDirty(true);
                          setBulkSlabs(bulkSlabs.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x));
                        }}
                        className="col-span-2 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-emerald-400">
                          -₹{savePerUnit}/u
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDirty(true);
                            setBulkSlabs(bulkSlabs.filter((_, idx) => idx !== i));
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/60">
          <button
            type="button"
            onClick={handleCloseSafe}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Publishing..." : "Save & Publish Live"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

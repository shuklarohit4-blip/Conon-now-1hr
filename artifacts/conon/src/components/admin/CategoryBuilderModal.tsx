import React, { useState } from "react";
import { X, Upload, ClipboardPaste, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import type { HomeCategory } from "@/data/homeCategories";
import {
  resolveCategoryAssetUrl,
  saveBackendCategory,
  uploadCategoryImageDataUrl,
  uploadCategoryImageFile,
} from "@/services/liveCategoriesStore";

interface CategoryBuilderModalProps {
  isDark: boolean;
  editingCategory?: HomeCategory | null;
  onClose: () => void;
  onSaved: (savedSlug: string, savedTitle: string) => void;
}

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function CategoryBuilderModal({
  isDark,
  editingCategory,
  onClose,
  onSaved,
}: CategoryBuilderModalProps) {
  const masterSync = useSafeCononMasterSync();

  const [nameEn, setNameEn] = useState(editingCategory?.title || "");
  const [nameHi, setNameHi] = useState(editingCategory?.titleHi || "");
  const [slug, setSlug] = useState(editingCategory?.slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(editingCategory));
  const [categoryType, setCategoryType] = useState<"MATERIAL" | "RMC" | "SERVICE" | "RENTAL">(
    editingCategory?.categoryType || "MATERIAL"
  );
  const [coverUrl, setCoverUrl] = useState(editingCategory?.imageUrl || editingCategory?.image || "");
  const [badge, setBadge] = useState(editingCategory?.badge ?? "");
  const [badgeColor, setBadgeColor] = useState(editingCategory?.badgeColor || "#F2B705");
  const [defaultHsn, setDefaultHsn] = useState(editingCategory?.defaultHsn || "38245010");
  const [defaultGst, setDefaultGst] = useState<number>(editingCategory?.defaultGst ?? 18);
  const [vehicleClass, setVehicleClass] = useState(
    editingCategory?.vehicleClass || "Chhota Hathi Loader"
  );
  const [displayOrder, setDisplayOrder] = useState<number>(editingCategory?.displayOrder ?? 10);
  const [isActive, setIsActive] = useState<boolean>(editingCategory?.isActive ?? true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleNameChange = (val: string) => {
    setNameEn(val);
    if (!slugEdited) setSlug(toSlug(val));
  };

  const uploadCoverDataUrl = async (dataUrl: string) => {
    const targetSlug = slug || toSlug(nameEn) || "custom-category";
    setUploadingCover(true);
    try {
      const uploaded = await uploadCategoryImageDataUrl(
        dataUrl,
        targetSlug,
        editingCategory?.slug
      );
      setCoverUrl(uploaded.url);
      toast.success(`Uploaded category photo: ${uploaded.rawPath}`);
    } catch {
      setCoverUrl(dataUrl);
      toast.error("Backend upload failed; staged locally");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleFile = async (file: File) => {
    const targetSlug = slug || toSlug(nameEn) || "custom-category";
    setUploadingCover(true);
    try {
      const uploaded = await uploadCategoryImageFile(
        file,
        targetSlug,
        editingCategory?.slug
      );
      setCoverUrl(uploaded.url);
      toast.success(`Uploaded & optimized WebP photo: ${uploaded.rawPath}`);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          void uploadCoverDataUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          void handleFile(file);
          return;
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = toSlug(slug || nameEn);
    if (!nameEn.trim() || !finalSlug) {
      toast.error("Category Name & Slug are required");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveBackendCategory(
        {
          id: editingCategory?.id,
          slug: finalSlug,
          name: nameEn.trim(),
          title: nameEn.trim(),
          nameHi: nameHi.trim() || undefined,
          titleHi: nameHi.trim() || undefined,
          department:
            categoryType === "RMC"
              ? "Civil & Structural"
              : categoryType === "SERVICE"
              ? "Skilled Services"
              : categoryType === "RENTAL"
              ? "Heavy Rentals"
              : editingCategory?.department || "Construction Materials",
          imageUrl: coverUrl || "/images/home-categories/cement-civil-works.webp",
          image: coverUrl || "/images/home-categories/cement-civil-works.webp",
          dbCategory: editingCategory?.dbCategory || finalSlug,
          route:
            editingCategory?.route ||
            (finalSlug === "rmc-ready-mix-concrete"
              ? "/category/rmc-ready-mix-concrete"
              : `/categories?cat=${finalSlug}`),
          badge: badge.trim() || "",
          badgeColor: badge.trim() ? badgeColor : "",
          categoryType,
          defaultHsn: defaultHsn.trim(),
          defaultGst,
          defaultGstRate: defaultGst,
          vehicleType: vehicleClass.toLowerCase().includes("bike") ? "BIKE" : "LOADER",
          vehicleClass,
          displayOrder,
          sortOrder: displayOrder,
          isActive,
          subcategories: editingCategory?.subcategories || [],
        },
        { idOrSlug: editingCategory ? String(editingCategory.id || editingCategory.slug) : undefined }
      );

      // Keep CononMasterSyncContext in parity as well
      if (masterSync) {
        const prevCats = masterSync.state.categories;
        const hiddenSlugs = new Set(prevCats.hiddenCategorySlugs || []);
        if (isActive) hiddenSlugs.delete(finalSlug);
        else hiddenSlugs.add(finalSlug);
        await masterSync.patchMasterState(
          {
            categories: {
              hiddenCategorySlugs: Array.from(hiddenSlugs),
              overrides: {
                ...(prevCats.overrides || {}),
                [finalSlug]: saved,
              },
            },
          },
          "categories"
        ).catch(() => {});
      }

      toast.success(`Category "${saved.title}" published live to Storefront & Admin!`);
      onSaved(saved.slug, saved.title);
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish category");
    } finally {
      setSaving(false);
    }
  };

  const cardCls = isDark
    ? "bg-[#0F172A] border-slate-700 text-white"
    : "bg-white border-slate-200 text-slate-900";
  const inputCls = isDark
    ? "bg-slate-900 border-slate-700 text-white"
    : "bg-slate-50 border-slate-300 text-slate-900";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onPaste={handlePaste}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-xl rounded-3xl border p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto ${cardCls}`}
      >
        <div className="flex items-center justify-between border-b border-slate-800/30 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black">
              {editingCategory ? `Edit Category: ${editingCategory.title}` : "Create New Storefront Category"}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-bold block mb-1">Category Name (English) *</label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Solar & Inverters"
              className={`w-full px-3 py-2 rounded-xl border ${inputCls}`}
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Hindi Subtitle (Optional)</label>
            <input
              type="text"
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              placeholder="e.g. सोलर पैनल और इन्वर्टर"
              className={`w-full px-3 py-2 rounded-xl border ${inputCls}`}
            />
          </div>
          <div>
            <label className="font-bold block mb-1">URL Slug (/category/:slug)</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(toSlug(e.target.value));
              }}
              placeholder="solar-and-inverters"
              className={`w-full px-3 py-2 rounded-xl border font-mono ${inputCls}`}
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Category Type</label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value as any)}
              className={`w-full px-3 py-2 rounded-xl border ${inputCls}`}
            >
              <option value="MATERIAL">Construction Material</option>
              <option value="RMC">RMC / Bulk Concrete</option>
              <option value="SERVICE">Skilled Service</option>
              <option value="RENTAL">Machine Rental</option>
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">Default HSN / SAC</label>
            <input
              type="text"
              value={defaultHsn}
              onChange={(e) => setDefaultHsn(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-mono ${inputCls}`}
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Default GST Rate</label>
            <select
              value={defaultGst}
              onChange={(e) => setDefaultGst(Number(e.target.value))}
              className={`w-full px-3 py-2 rounded-xl border ${inputCls}`}
            >
              {[5, 12, 18, 28].map((r) => (
                <option key={r} value={r}>{r}% GST</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">Default Vehicle Class</label>
            <select
              value={vehicleClass}
              onChange={(e) => setVehicleClass(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border ${inputCls}`}
            >
              <option value="Bike <=30kg">Bike (&lt;= 30kg)</option>
              <option value="Chhota Hathi Loader">Chhota Hathi Loader</option>
              <option value="Heavy Tipper / TM">Heavy Tipper / TM</option>
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">Ribbon Badge, Color &amp; Order</label>
            <div className="flex gap-1.5 items-center">
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Optional (e.g. Bulk Rates)"
                className={`flex-1 px-3 py-2 rounded-xl border ${inputCls}`}
              />
              <input
                type="color"
                value={badgeColor}
                onChange={(e) => setBadgeColor(e.target.value)}
                title="Ribbon Badge Color"
                className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
              />
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value) || 1)}
                title="Display Order (1 = Top Row)"
                className={`w-14 px-2 py-2 rounded-xl border font-mono text-center ${inputCls}`}
              />
            </div>
          </div>
        </div>

        {/* Cover Photo Dropzone + Cmd+V Paste */}
        <div
          className={`p-4 rounded-2xl border border-dashed text-center space-y-2 text-xs ${
            isDark ? "border-slate-700 bg-slate-900/50" : "border-slate-300 bg-slate-50"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) void handleFile(f);
          }}
        >
          <div className="flex items-center justify-center gap-2 font-bold">
            <ClipboardPaste className="w-4 h-4 text-amber-500" />
            <span>
              {uploadingCover
                ? "Uploading optimized WebP cover to /uploads/categories/..."
                : "Drag-Drop, Paste (Cmd+V), or Choose Cover Photo"}
            </span>
          </div>
          {coverUrl && (
            <img
              src={resolveCategoryAssetUrl(coverUrl, editingCategory?.updatedAt)}
              alt="Category Cover"
              className="h-20 mx-auto rounded-xl object-contain border border-slate-700/30"
            />
          )}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Choose Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span>Live on Storefront (uncheck for Draft / Hidden)</span>
        </label>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/30">
          <button type="button" onClick={onClose} className="px-3 py-2 text-xs font-bold cursor-pointer">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {saving ? "Publishing..." : "Save & Publish Category Live"}
          </button>
        </div>
      </form>
    </div>
  );
}

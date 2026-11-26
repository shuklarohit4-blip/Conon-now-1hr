import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  ClipboardPaste,
  ImagePlus,
  Star,
  ArrowLeft,
  ArrowRight,
  Trash2,
  ZoomIn,
  CheckCircle2,
  AlertTriangle,
  Download,
  UploadCloud,
  Plus,
  Search,
  Sparkles,
  Copy,
  RotateCcw,
  Eye,
  X,
  Layers,
  Check,
  Save,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";
import { useProductMediaVault } from "@/context/ProductMediaVaultContext";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import {
  VAULT_CAPTION_OPTIONS,
  resolveProductWithVault,
  type ProductMediaOverride,
  type VaultImageEntry,
  type VaultImageCaption,
} from "@/services/productMediaVault";
import {
  uploadOptimizedVaultImage,
  saveProductMediaVault,
  bulkApplyVaultImages,
  resetProductVaultOverride,
  buildVaultBackupPayload,
  importVaultBackupJson,
  resolvePreviewSrc,
} from "@/services/adminMediaVaultApi";
import {
  VAULT_CATEGORIES,
  getUnifiedVaultItems,
  type UnifiedVaultItem,
} from "@/services/adminMediaCatalogIndex";
import { CononProductMedia } from "@/components/CononProductMedia";
import { sanitizeFolderSlug } from "@/services/productMediaVault";

export interface AdminMediaVaultStudioProps {
  isDark?: boolean;
}

type StatusFilter = "all" | "missing_real" | "multi_image" | "verified";

interface DraftEditorState {
  productId: string;
  slug: string;
  categorySlug: string;
  title: string;
  brand: string;
  subcategory: string;
  description: string;
  specBullets: string[];
  images: VaultImageEntry[];
  price: number;
  mrp: number;
  bulkPrice: number | "";
  bulkMinQty: number | "";
  unit: string;
  hsnCode: string;
  gstRate: number;
  isInStock: boolean;
  isCustomItem?: boolean;
}

function buildDraftFromItem(
  item: UnifiedVaultItem,
  override?: ProductMediaOverride
): DraftEditorState {
  return {
    productId: item.id,
    slug: override?.slug || item.slug || item.id,
    categorySlug: override?.categorySlug || item.categorySlug,
    title: override?.title || item.title,
    brand: override?.brand || item.brand,
    subcategory: override?.subcategory || item.subcategory,
    description: override?.description !== undefined ? override.description : item.description,
    specBullets:
      override?.specBullets && override.specBullets.length > 0
        ? [...override.specBullets]
        : [...item.specBullets],
    images:
      override?.images && override.images.length > 0
        ? override.images.map((im, idx) => ({ ...im, isPrimary: idx === 0, order: idx }))
        : [],
    price: override?.price !== undefined ? override.price : item.price,
    mrp: override?.mrp !== undefined ? override.mrp : item.mrp,
    bulkPrice:
      override?.bulkPrice !== undefined
        ? override.bulkPrice
        : item.bulkPrice !== undefined
        ? item.bulkPrice
        : "",
    bulkMinQty:
      override?.bulkMinQty !== undefined
        ? override.bulkMinQty
        : item.bulkMinQty !== undefined
        ? item.bulkMinQty
        : "",
    unit: override?.unit || item.unit,
    hsnCode: override?.hsnCode || item.hsnCode,
    gstRate: override?.gstRate !== undefined ? override.gstRate : item.gstRate,
    isInStock: override?.isInStock !== undefined ? override.isInStock : item.isInStock,
    isCustomItem: Boolean(override?.isCustomItem),
  };
}

export function AdminMediaVaultStudio({ isDark = false }: AdminMediaVaultStudioProps) {
  const { version, overridesMap, getOverride } = useProductMediaVault();
  const masterSync = useSafeCononMasterSync();

  const allItems = useMemo(() => getUnifiedVaultItems(), [version]);

  // Selection & filter state
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("cpvc-plumbing-tanks");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  // Editor draft & async upload/save states
  const [draft, setDraft] = useState<DraftEditorState | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedDiskInfo, setLastSavedDiskInfo] = useState<{ folderPath: string; savedFiles: string[] } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [newSpecBullet, setNewSpecBullet] = useState("");

  // Modals & previews
  const [zoomPhotoIdx, setZoomPhotoIdx] = useState<number | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMode, setBulkMode] = useState<"cover_only" | "full_gallery">("cover_only");
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);
  const [bulkSearch, setBulkSearch] = useState("");
  const [isBulkApplying, setIsBulkApplying] = useState(false);

  // Add New Item modal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    title: "",
    brand: "",
    categorySlug: "cpvc-plumbing-tanks",
    subcategory: "General",
    price: "299",
    mrp: "360",
    unit: "1 Piece",
    hsnCode: "39172390",
    gstRate: "18",
    description: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Compute live verified/total stats across categories
  const statsByCategory = useMemo(() => {
    const map: Record<string, { total: number; verified: number; multi: number }> = {};
    for (const c of VAULT_CATEGORIES) {
      map[c.slug] = { total: 0, verified: 0, multi: 0 };
    }
    let globalTotal = 0;
    let globalVerified = 0;
    let globalMulti = 0;

    for (const item of allItems) {
      globalTotal += 1;
      const ov = getOverride({ id: item.id, slug: item.slug, title: item.title });
      const verified = Boolean(ov?.isAdminVerifiedMedia && ov.images && ov.images.length > 0);
      const multi = Boolean(verified && (ov?.images?.length || 0) >= 2);
      if (verified) globalVerified += 1;
      if (multi) globalMulti += 1;
      if (!map[item.categorySlug]) {
        map[item.categorySlug] = { total: 0, verified: 0, multi: 0 };
      }
      map[item.categorySlug].total += 1;
      if (verified) map[item.categorySlug].verified += 1;
      if (multi) map[item.categorySlug].multi += 1;
    }

    return { map, globalTotal, globalVerified, globalMulti };
  }, [allItems, getOverride, version]);

  // Subcategories in active category
  const subcategoriesInScope = useMemo(() => {
    const set = new Set<string>();
    for (const item of allItems) {
      if (selectedCategorySlug === "all" || item.categorySlug === selectedCategorySlug) {
        if (item.subcategory) set.add(item.subcategory);
      }
    }
    return Array.from(set).sort();
  }, [allItems, selectedCategorySlug]);

  // Filtered Middle Navigator items
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      if (selectedCategorySlug !== "all" && item.categorySlug !== selectedCategorySlug) {
        return false;
      }
      if (selectedSubcategory !== "all" && item.subcategory !== selectedSubcategory) {
        return false;
      }
      const ov = getOverride({ id: item.id, slug: item.slug, title: item.title });
      const isVerified = Boolean(ov?.isAdminVerifiedMedia && ov.images && ov.images.length > 0);
      const photoCount = ov?.images?.length || 0;

      if (statusFilter === "missing_real" && isVerified) return false;
      if (statusFilter === "multi_image" && photoCount < 2) return false;
      if (statusFilter === "verified" && !isVerified) return false;

      if (q) {
        const hay = `${ov?.title || item.title} ${ov?.brand || item.brand} ${item.id} ${item.slug || ""} ${ov?.subcategory || item.subcategory} ${ov?.hsnCode || item.hsnCode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    allItems,
    selectedCategorySlug,
    selectedSubcategory,
    statusFilter,
    searchQuery,
    getOverride,
    version,
  ]);

  // Reset subcategory filter when category changes
  useEffect(() => {
    setSelectedSubcategory("all");
  }, [selectedCategorySlug]);

  // Select first item in list when current selection disappears or initially empty
  useEffect(() => {
    if (filteredItems.length === 0) return;
    const stillVisible = filteredItems.some((it) => it.id === selectedItemId);
    if (!stillVisible) {
      setSelectedItemId(filteredItems[0].id);
    }
  }, [filteredItems, selectedItemId]);

  const selectedItem = useMemo(
    () => allItems.find((it) => it.id === selectedItemId) || filteredItems[0] || null,
    [allItems, filteredItems, selectedItemId]
  );

  // Sync draft when switching selected item
  useEffect(() => {
    if (!selectedItem) {
      setDraft(null);
      return;
    }
    const ov = getOverride({ id: selectedItem.id, slug: selectedItem.slug, title: selectedItem.title });
    setDraft(buildDraftFromItem(selectedItem, ov));
    setIsDirty(false);
    setPreviewSlideIdx(0);
  }, [selectedItem?.id]);

  // Refresh metadata badges when vault updates cleanly without stomping unsaved edits
  useEffect(() => {
    if (!selectedItem || isDirty) return;
    const ov = getOverride({ id: selectedItem.id, slug: selectedItem.slug, title: selectedItem.title });
    setDraft(buildDraftFromItem(selectedItem, ov));
  }, [version]);

  // Helper: upload multiple Files / Blobs (drag-drop, picker, clipboard paste)
  const handleProcessFiles = useCallback(
    async (files: File[] | Blob[]) => {
      if (!draft || files.length === 0) return;
      const imageFiles = files.filter((f) => !f.type || f.type.startsWith("image/"));
      if (imageFiles.length === 0) {
        toast.error("Please drop or paste valid image files (PNG, JPG, WebP)");
        return;
      }

      const availableSlots = Math.max(0, 6 - draft.images.length);
      if (availableSlots === 0) {
        toast.error("Maximum 6 photos allowed per item. Remove one slot first.");
        return;
      }

      const filesToProcess = imageFiles.slice(0, availableSlots);
      if (imageFiles.length > availableSlots) {
        toast.info(`Adding first ${availableSlots} photo(s) to fit the 6-photo limit.`);
      }

      setIsUploading(true);
      try {
        const uploadedEntries: VaultImageEntry[] = [];
        for (let i = 0; i < filesToProcess.length; i++) {
          const defaultCaption: VaultImageCaption =
            draft.images.length === 0 && i === 0
              ? "Front View"
              : VAULT_CAPTION_OPTIONS[Math.min(draft.images.length + i, VAULT_CAPTION_OPTIONS.length - 1)];
          const entry = await uploadOptimizedVaultImage(filesToProcess[i], draft.productId, defaultCaption);
          uploadedEntries.push(entry);
        }

        setDraft((prev) => {
          if (!prev) return prev;
          const combined = [...prev.images, ...uploadedEntries]
            .slice(0, 6)
            .map((im, idx) => ({ ...im, isPrimary: idx === 0, order: idx }));
          return { ...prev, images: combined };
        });
        setIsDirty(true);
        toast.success(
          `Optimized & staged ${uploadedEntries.length} studio photo${uploadedEntries.length > 1 ? "s" : ""}. Click "Save & Publish Live"!`
        );
      } catch (err: any) {
        toast.error(err?.message || "Failed to process uploaded image");
      } finally {
        setIsUploading(false);
      }
    },
    [draft]
  );

  // Workbench clipboard paste (Cmd+V / Ctrl+V)
  const handleWorkbenchPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const blobs: Blob[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const blob = items[i].getAsFile();
          if (blob) blobs.push(blob);
        }
      }
      if (blobs.length > 0) {
        e.preventDefault();
        void handleProcessFiles(blobs);
      }
    },
    [handleProcessFiles]
  );

  // Drag & Drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) {
      void handleProcessFiles(dropped);
    }
  };

  // Gallery slot manipulation
  const setAsPrimary = (idx: number) => {
    setDraft((prev) => {
      if (!prev || idx <= 0 || idx >= prev.images.length) return prev;
      const next = [...prev.images];
      const [chosen] = next.splice(idx, 1);
      next.unshift(chosen);
      return {
        ...prev,
        images: next.map((im, i) => ({ ...im, isPrimary: i === 0, order: i })),
      };
    });
    setIsDirty(true);
  };

  const moveSlot = (idx: number, dir: -1 | 1) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.images.length) return prev;
      const next = [...prev.images];
      const [moved] = next.splice(idx, 1);
      next.splice(target, 0, moved);
      return {
        ...prev,
        images: next.map((im, i) => ({ ...im, isPrimary: i === 0, order: i })),
      };
    });
    setIsDirty(true);
  };

  const removeSlot = (idx: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = prev.images
        .filter((_, i) => i !== idx)
        .map((im, i) => ({ ...im, isPrimary: i === 0, order: i }));
      return { ...prev, images: next };
    });
    setIsDirty(true);
  };

  const updateSlotCaption = (idx: number, caption: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = prev.images.map((im, i) => (i === idx ? { ...im, caption } : im));
      return { ...prev, images: next };
    });
    setIsDirty(true);
  };

  // Save & Publish Live handler
  const handleSaveAndPublish = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const payload: ProductMediaOverride = {
        productId: draft.productId,
        slug: draft.slug,
        categorySlug: draft.categorySlug,
        title: draft.title.trim(),
        brand: draft.brand.trim(),
        subcategory: draft.subcategory.trim(),
        description: draft.description,
        specBullets: draft.specBullets.map((b) => b.trim()).filter(Boolean),
        images: draft.images.map((im, idx) => ({
          ...im,
          isPrimary: idx === 0,
          order: idx,
        })),
        price: Number(draft.price) || 0,
        mrp: Number(draft.mrp) || Number(draft.price) || 0,
        bulkPrice: draft.bulkPrice === "" ? undefined : Number(draft.bulkPrice),
        bulkMinQty: draft.bulkMinQty === "" ? undefined : Number(draft.bulkMinQty),
        unit: draft.unit.trim(),
        hsnCode: draft.hsnCode.trim(),
        gstRate: Number(draft.gstRate) || 0,
        isInStock: draft.isInStock,
        isAdminVerifiedMedia: draft.images.length > 0,
        isCustomItem: draft.isCustomItem,
        updatedAt: new Date().toISOString(),
      };

      const res = await saveProductMediaVault(payload);
      masterSync?.refreshFromSources().catch(() => {});
      setDraft((prev) => (prev ? { ...prev, images: res.override.images } : prev));
      setLastSavedDiskInfo({ folderPath: res.folderPath, savedFiles: res.savedFiles });
      setIsDirty(false);
      toast.success(
        res.diskSaved
          ? `Saved to disk: ${res.folderPath} (${res.savedFiles.join(", ") || "meta.json"})`
          : `Published live locally (${payload.images.length} photos)`
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish Media Vault changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetOverride = async () => {
    if (!draft) return;
    await resetProductVaultOverride(draft.productId, draft.categorySlug);
    masterSync?.refreshFromSources().catch(() => {});
    setDraft((prev) => (prev ? { ...prev, images: [] } : prev));
    setLastSavedDiskInfo(null);
    setIsDirty(false);
    toast.info(`Cleared real photos from disk for "${draft.title}".`);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonText = buildVaultBackupPayload();
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `conon-media-vault-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded Media Vault JSON backup.");
  };

  // Import JSON Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await importVaultBackupJson(text);
      toast.success(`Imported ${res.count} Media Vault item overrides live!`);
    } catch (err: any) {
      toast.error(err?.message || "Invalid backup JSON file");
    } finally {
      e.target.value = "";
    }
  };

  // Bulk Apply Similar Items Modal helpers
  const bulkCandidates = useMemo(() => {
    if (!draft) return [];
    const q = bulkSearch.trim().toLowerCase();
    return allItems.filter((it) => {
      if (it.id === draft.productId) return false;
      if (it.categorySlug !== draft.categorySlug && !q) return false;
      if (q) {
        return `${it.title} ${it.brand} ${it.id} ${it.subcategory}`.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allItems, draft, bulkSearch]);

  const openBulkModal = () => {
    if (!draft || draft.images.length === 0) {
      toast.error("Upload at least 1 photo first before applying to similar items.");
      return;
    }
    // Pre-select items sharing exact brand inside the same category
    const sameBrandIds = allItems
      .filter(
        (it) =>
          it.id !== draft.productId &&
          it.categorySlug === draft.categorySlug &&
          it.brand.toLowerCase() === draft.brand.toLowerCase()
      )
      .map((it) => it.id);
    setBulkSelectedIds(sameBrandIds.slice(0, 15));
    setBulkSearch("");
    setShowBulkModal(true);
  };

  const handleConfirmBulkApply = async () => {
    if (!draft || bulkSelectedIds.length === 0) return;
    setIsBulkApplying(true);
    try {
      const itemsMeta: Record<string, { title?: string; brand?: string; slug?: string; categorySlug?: string; subcategory?: string }> = {};
      for (const pid of bulkSelectedIds) {
        const it = allItems.find((x) => x.id === pid);
        if (it) {
          itemsMeta[pid] = {
            title: it.title,
            brand: it.brand,
            slug: it.slug,
            categorySlug: it.categorySlug,
            subcategory: it.subcategory,
          };
        }
      }
      const res = await bulkApplyVaultImages({
        sourceProductId: draft.productId,
        sourceSlug: draft.slug,
        productIds: bulkSelectedIds,
        images: draft.images,
        categorySlug: draft.categorySlug,
        copyMode: bulkMode,
        itemsMeta,
      });
      setShowBulkModal(false);
      toast.success(
        `Applied ${bulkMode === "cover_only" ? "Cover Photo" : "Full Gallery"} live to ${res.count} similar items!`
      );
    } catch (err: any) {
      toast.error(err?.message || "Bulk apply failed");
    } finally {
      setIsBulkApplying(false);
    }
  };

  // Create Brand-New Item
  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.title.trim()) {
      toast.error("Product / Service title is required");
      return;
    }
    const slugBase = newItemForm.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);
    const customId = `vault-custom-${slugBase || "item"}-${Date.now().toString(36)}`;
    const newOv: ProductMediaOverride = {
      productId: customId,
      slug: customId,
      categorySlug: newItemForm.categorySlug,
      title: newItemForm.title.trim(),
      brand: newItemForm.brand.trim() || "CONON Certified",
      subcategory: newItemForm.subcategory.trim() || "General",
      description: newItemForm.description.trim(),
      specBullets: [],
      images: [],
      price: Number(newItemForm.price) || 0,
      mrp: Number(newItemForm.mrp) || Number(newItemForm.price) || 0,
      unit: newItemForm.unit.trim() || "Unit",
      hsnCode: newItemForm.hsnCode.trim(),
      gstRate: Number(newItemForm.gstRate) || 18,
      isInStock: true,
      isAdminVerifiedMedia: false,
      isCustomItem: true,
      updatedAt: new Date().toISOString(),
    };
    await saveProductMediaVault(newOv);
    setSelectedCategorySlug(newItemForm.categorySlug);
    setSelectedItemId(customId);
    setShowAddItemModal(false);
    toast.success(`Added "${newOv.title}" to Media Vault. Upload up to 6 real photos now!`);
  };

  // Theme surfaces
  const panelBg = isDark ? "bg-[#0d1528] border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900";
  const subSurfaceBg = isDark ? "bg-slate-900/70 border-slate-800" : "bg-slate-50 border-slate-200";
  const inputCls = isDark
    ? "bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";

  const activeCategoryObj = VAULT_CATEGORIES.find((c) => c.slug === selectedCategorySlug);

  // Live Preview resolved object
  const previewResolved = useMemo(() => {
    if (!draft) return null;
    return resolveProductWithVault({
      id: draft.productId,
      slug: draft.slug,
      title: draft.title,
      brand: draft.brand,
      categorySlug: draft.categorySlug,
      description: draft.description,
      specBullets: draft.specBullets,
      images: draft.images.map((im) => resolvePreviewSrc(im)),
      image: draft.images[0] ? resolvePreviewSrc(draft.images[0]) : "",
      price: draft.price,
      mrp: draft.mrp,
      unit: draft.unit,
      hsnCode: draft.hsnCode,
      gstRate: draft.gstRate,
      inStock: draft.isInStock,
    });
  }, [draft]);

  const materialsCats = VAULT_CATEGORIES.filter((c) => c.group === "MATERIALS");
  const opsCats = VAULT_CATEGORIES.filter((c) => c.group !== "MATERIALS");

  return (
    <div className="space-y-4">
      {/* ── TOP HEADER TOOLBAR ──────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 ${panelBg}`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <span>Master Media &amp; Product Vault</span>
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Cross-Panel Sync
            </span>
          </div>
          <p className={`text-xs mt-1 ${mutedText}`}>
            Control 1–6 real photos, cover image, full descriptions, specs &amp; GST/HSN across all 16+ Material Categories, Services &amp; Heavy Rentals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${subSurfaceBg}`}>
            <span className="text-emerald-500">{statsByCategory.globalVerified}</span>
            <span className={mutedText}> / {statsByCategory.globalTotal} Verified</span>
            <span className="mx-1.5 opacity-40">•</span>
            <span className="text-blue-500">{statsByCategory.globalMulti} Multi-Photo</span>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isDark ? "border-slate-700 hover:bg-slate-800 text-slate-200" : "border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Vault JSON</span>
          </button>

          <button
            type="button"
            onClick={() => backupInputRef.current?.click()}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isDark ? "border-slate-700 hover:bg-slate-800 text-slate-200" : "border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
          <input
            ref={backupInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportBackup}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              setNewItemForm((f) => ({
                ...f,
                categorySlug: selectedCategorySlug === "all" ? "cpvc-plumbing-tanks" : selectedCategorySlug,
                hsnCode: activeCategoryObj?.defaultHsnOrSac || "39172390",
                gstRate: String(activeCategoryObj?.defaultGstRate ?? 18),
              }));
              setShowAddItemModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* ── 3-PANE PIM WORKBENCH ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* PANE 1: LEFT CATEGORY RAIL */}
        <div className={`lg:col-span-3 rounded-2xl border p-3 space-y-2 max-h-[780px] overflow-y-auto ${panelBg}`}>
          <div className="px-1.5 pb-1 flex items-center justify-between">
            <span className={`text-[11px] font-black uppercase tracking-wider ${mutedText}`}>
              Categories ({VAULT_CATEGORIES.length})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedCategorySlug("all")}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
              selectedCategorySlug === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : isDark
                ? "hover:bg-slate-800/80 text-slate-200"
                : "hover:bg-slate-100 text-slate-800"
            }`}
          >
            <span className="truncate flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 shrink-0" />
              <span>All Ecosystem Items</span>
            </span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                selectedCategorySlug === "all"
                  ? "bg-white/20 text-white"
                  : isDark
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {statsByCategory.globalVerified}/{statsByCategory.globalTotal} Real
            </span>
          </button>

          <div className={`text-[10px] font-black uppercase tracking-wider px-1.5 pt-2 ${mutedText}`}>
            Building Materials
          </div>
          <div className="space-y-1">
            {materialsCats.map((cat) => {
              const st = statsByCategory.map[cat.slug] || { total: 0, verified: 0, multi: 0 };
              const active = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : isDark
                      ? "hover:bg-slate-800/70 text-slate-300"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                      active
                        ? "bg-white/20 text-white"
                        : st.verified > 0
                        ? "bg-emerald-500/15 text-emerald-500"
                        : isDark
                        ? "bg-slate-800 text-slate-400"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {st.verified}/{st.total} Real Photos
                  </span>
                </button>
              );
            })}
          </div>

          <div className={`text-[10px] font-black uppercase tracking-wider px-1.5 pt-2 ${mutedText}`}>
            Services &amp; Fleet
          </div>
          <div className="space-y-1">
            {opsCats.map((cat) => {
              const st = statsByCategory.map[cat.slug] || { total: 0, verified: 0, multi: 0 };
              const active = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : isDark
                      ? "hover:bg-slate-800/70 text-slate-300"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                      active
                        ? "bg-white/20 text-white"
                        : st.verified > 0
                        ? "bg-emerald-500/15 text-emerald-500"
                        : isDark
                        ? "bg-slate-800 text-slate-400"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {st.verified}/{st.total} Real Photos
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PANE 2: MIDDLE ITEM NAVIGATOR */}
        <div className={`lg:col-span-4 rounded-2xl border p-3 flex flex-col gap-3 max-h-[780px] ${panelBg}`}>
          {/* Search Input */}
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, brand, SKU ID, HSN..."
              className={`w-full pl-9 pr-8 py-2 rounded-xl border text-xs outline-none ${inputCls}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${mutedText} hover:opacity-80`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: "all", label: "All Items" },
                { id: "missing_real", label: "Missing Real Photo" },
                { id: "multi_image", label: "Multi-Image (2+)" },
                { id: "verified", label: "Admin Verified" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  statusFilter === f.id
                    ? "bg-emerald-600 text-white"
                    : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Subcategory Quick Chips */}
          {subcategoriesInScope.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              <button
                type="button"
                onClick={() => setSelectedSubcategory("all")}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 cursor-pointer ${
                  selectedSubcategory === "all"
                    ? "bg-blue-600 text-white"
                    : isDark
                    ? "bg-slate-800 text-slate-400"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                All Subcategories
              </button>
              {subcategoriesInScope.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 cursor-pointer ${
                    selectedSubcategory === sub
                      ? "bg-blue-600 text-white"
                      : isDark
                      ? "bg-slate-800 text-slate-400"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          <div className={`text-[11px] font-bold flex items-center justify-between px-0.5 ${mutedText}`}>
            <span>{filteredItems.length} item(s) shown</span>
            {activeCategoryObj && <span>Default GST {activeCategoryObj.defaultGstRate}%</span>}
          </div>

          {/* Item Rows */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredItems.length === 0 ? (
              <div className={`p-6 rounded-xl border text-center text-xs ${subSurfaceBg}`}>
                <p className="font-bold">No items match the current filters.</p>
                <p className={`mt-1 ${mutedText}`}>Try clearing search text or switching filter pills.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const ov = getOverride({ id: item.id, slug: item.slug, title: item.title });
                const isSelected = selectedItem?.id === item.id;
                const isVerified = Boolean(ov?.isAdminVerifiedMedia && ov.images && ov.images.length > 0);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (isDirty && selectedItem?.id !== item.id) {
                        toast.info("Loaded selected item (previous unsaved draft discarded).");
                      }
                      setSelectedItemId(item.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
                      isSelected
                        ? isDark
                          ? "border-emerald-500 bg-emerald-950/35 ring-1 ring-emerald-500/40"
                          : "border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600/30"
                        : isDark
                        ? "border-slate-800 hover:border-slate-700 bg-slate-900/40"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center p-1">
                      <CononProductMedia
                        product={{
                          id: item.id,
                          slug: item.slug,
                          title: ov?.title || item.title,
                          brand: ov?.brand || item.brand,
                          categorySlug: item.categorySlug,
                          unit: ov?.unit || item.unit,
                        }}
                        src={ov?.images?.[0] ? resolvePreviewSrc(ov.images[0]) : undefined}
                        title={ov?.title || item.title}
                        brand={ov?.brand || item.brand}
                        categorySlug={item.categorySlug}
                        variant="thumb"
                        showGalleryBadge={false}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold leading-snug line-clamp-2">
                        {ov?.title || item.title}
                      </p>
                      <p className={`text-[10px] mt-0.5 truncate ${mutedText}`}>
                        {ov?.brand || item.brand} · <span className="font-mono">{item.id}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[11px] font-black">
                          ₹{(ov?.price ?? item.price).toLocaleString("en-IN")}
                        </span>
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {ov?.images.length} Photo{(ov?.images.length || 0) > 1 ? "s" : ""} · Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Needs Real Photo
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANE 3: RIGHT LIVE EDITOR WORKBENCH */}
        <div
          onPaste={handleWorkbenchPaste}
          className={`lg:col-span-5 rounded-2xl border p-4 space-y-5 max-h-[780px] overflow-y-auto ${panelBg}`}
        >
          {!draft ? (
            <div className="py-16 text-center text-xs">
              Select any item on the left to inspect or upload real product photos and descriptions.
            </div>
          ) : (
            <>
              {/* Workbench Action Header */}
              <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-200/20">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-500">
                      {draft.brand}
                    </span>
                    <span className={`text-[10px] font-mono ${mutedText}`}>{draft.productId}</span>
                  </div>
                  <h3 className="text-sm font-black mt-1 leading-snug">{draft.title}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewSlideIdx(0);
                      setShowLivePreview((p) => !p);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                      showLivePreview
                        ? "bg-blue-600 border-blue-600 text-white"
                        : isDark
                        ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  {overridesMap[draft.productId] && (
                    <button
                      type="button"
                      onClick={handleResetOverride}
                      title="Delete physical photos from disk and restore Clean Brand Spec Card"
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                        isDark
                          ? "border-rose-500/40 text-rose-400 hover:bg-rose-950/30"
                          : "border-rose-200 text-rose-600 hover:bg-rose-50"
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Real Photos</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveAndPublish}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving to Disk..." : "Save & Publish to Disk"}</span>
                  </button>
                </div>
              </div>

              <div className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 ${subSurfaceBg}`}>
                <span className="truncate">
                  Disk Folder:{" "}
                  <strong className="text-emerald-500">
                    public/real-products/{sanitizeFolderSlug(draft.categorySlug || "general")}/
                    {sanitizeFolderSlug(draft.slug || draft.productId || "item")}/
                  </strong>
                </span>
                {lastSavedDiskInfo && (
                  <span className="text-emerald-500 font-bold">
                    ✓ Saved {lastSavedDiskInfo.savedFiles.length} WebP file(s)
                  </span>
                )}
              </div>

              {/* Optional Live Customer Preview Box */}
              {showLivePreview && previewResolved && (
                <div className={`rounded-xl border p-3.5 space-y-3 ${subSurfaceBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Live Customer Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLivePreview(false)}
                      className={`text-[11px] font-bold ${mutedText}`}
                    >
                      Close
                    </button>
                  </div>

                  <div className="bg-white text-slate-900 rounded-xl border border-slate-200 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="relative aspect-square bg-[#F7F8FA] rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center p-2">
                        <CononProductMedia
                          product={{
                            id: draft.productId,
                            slug: draft.slug,
                            title: draft.title,
                            brand: draft.brand,
                            categorySlug: draft.categorySlug,
                            unit: draft.unit,
                          }}
                          src={previewResolved.galleryImages[previewSlideIdx]?.url}
                          images={
                            previewResolved.galleryImages[previewSlideIdx]?.url
                              ? [previewResolved.galleryImages[previewSlideIdx]]
                              : undefined
                          }
                          variant="detail"
                          showGalleryBadge={false}
                          containerClassName="w-full h-full"
                          className="w-full h-full object-contain"
                        />
                        {previewResolved.galleryImages[previewSlideIdx]?.caption && (
                          <span className="absolute bottom-2 left-2 bg-black/65 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {previewResolved.galleryImages[previewSlideIdx]?.caption}
                          </span>
                        )}
                      </div>
                      {previewResolved.galleryImages.length > 1 && (
                        <div className="flex gap-1.5 mt-2 overflow-x-auto">
                          {previewResolved.galleryImages.map((g, i) => (
                            <button
                              key={g.id || i}
                              type="button"
                              onClick={() => setPreviewSlideIdx(i)}
                              className={`w-10 h-10 rounded-md border overflow-hidden p-0.5 ${
                                i === previewSlideIdx ? "border-emerald-600 ring-1 ring-emerald-600" : "border-slate-200"
                              }`}
                            >
                              <img src={g.url} alt="" className="w-full h-full object-contain" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {draft.brand}
                      </span>
                      <p className="font-bold text-slate-900 leading-snug">{draft.title}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-slate-900">₹{draft.price}</span>
                        {draft.mrp > draft.price && (
                          <span className="text-xs line-through text-slate-400">₹{draft.mrp}</span>
                        )}
                        <span className="text-[10px] text-slate-500">/ {draft.unit}</span>
                      </div>
                      {draft.description && (
                        <p className="text-[11px] text-slate-600 line-clamp-3 whitespace-pre-line">
                          {draft.description}
                        </p>
                      )}
                      {draft.specBullets.length > 0 && (
                        <ul className="space-y-0.5 pt-1">
                          {draft.specBullets.slice(0, 3).map((b, idx) => (
                            <li key={idx} className="text-[10px] text-slate-700 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 1: MULTI-IMAGE GALLERY STUDIO (1-6 PHOTOS) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      Multi-Image Studio ({draft.images.length}/6 Photos)
                    </h4>
                    <p className={`text-[11px] ${mutedText}`}>
                      Slot #1 is the Storefront Cover Photo. Compressed automatically to &lt;150 KB WebP.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openBulkModal}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer ${
                      isDark
                        ? "border-blue-500/40 bg-blue-950/30 text-blue-300 hover:bg-blue-950/50"
                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                    <span>Apply to Similar</span>
                  </button>
                </div>

                {/* Drag & Drop + File Picker + Clipboard Paste Pad */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={handleDrop}
                  className={`rounded-2xl border-2 border-dashed p-3.5 transition text-center space-y-2 ${
                    isDraggingOver
                      ? "border-emerald-500 bg-emerald-500/10"
                      : isDark
                      ? "border-slate-700 bg-slate-900/50"
                      : "border-slate-300 bg-slate-50"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      disabled={isUploading || draft.images.length >= 6}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>{isUploading ? "Optimizing WebP..." : "Upload 1–6 Real Photos"}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const list = Array.from(e.target.files || []);
                        e.target.value = "";
                        if (list.length > 0) void handleProcessFiles(list);
                      }}
                      className="hidden"
                    />

                    <div
                      tabIndex={0}
                      onPaste={handleWorkbenchPaste}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                        isDark
                          ? "border-slate-700 bg-slate-950 text-slate-300"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <ClipboardPaste className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Click &amp; Press Cmd+V to Paste</span>
                    </div>
                  </div>
                  <p className={`text-[10px] ${mutedText}`}>
                    Drag &amp; drop photos anywhere here, select multiple files, or paste direct screenshots from Manufacturer PDF / Google Images.
                  </p>
                </div>

                {/* Slots Grid */}
                {draft.images.length === 0 ? (
                  <div className={`rounded-xl border p-4 text-center text-xs ${subSurfaceBg}`}>
                    <p className="font-bold text-amber-500">No Vault Photos Uploaded Yet</p>
                    <p className={`mt-0.5 ${mutedText}`}>
                      Currently falling back to default local studio asset. Upload real photos above to verify this SKU.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {draft.images.map((img, idx) => {
                      const src = resolvePreviewSrc(img);
                      return (
                        <div
                          key={img.id}
                          className={`rounded-xl border p-2.5 space-y-2 ${
                            idx === 0
                              ? isDark
                                ? "border-emerald-500 bg-emerald-950/20"
                                : "border-emerald-600 bg-emerald-50/40"
                              : isDark
                              ? "border-slate-800 bg-slate-900/50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            {idx === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                #1 Primary Cover
                              </span>
                            ) : (
                              <span className={`text-[10px] font-bold uppercase ${mutedText}`}>
                                #Gallery #{idx + 1}
                              </span>
                            )}

                            <div className="flex items-center gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setAsPrimary(idx)}
                                  title="Set as Primary Cover Photo"
                                  className="p-1 rounded hover:bg-emerald-500/20 text-emerald-500 cursor-pointer"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveSlot(idx, -1)}
                                title="Move Left"
                                className="p-1 rounded hover:bg-slate-500/20 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === draft.images.length - 1}
                                onClick={() => moveSlot(idx, 1)}
                                title="Move Right"
                                className="p-1 rounded hover:bg-slate-500/20 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSlot(idx)}
                                title="Remove Photo"
                                className="p-1 rounded hover:bg-rose-500/20 text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div
                            onClick={() => setZoomPhotoIdx(idx)}
                            className="relative h-28 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 cursor-zoom-in group"
                          >
                            <img src={src} alt={img.caption || `Slot ${idx + 1}`} className="w-full h-full object-contain" />
                            <span className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <ZoomIn className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          <select
                            value={img.caption || "Front View"}
                            onChange={(e) => updateSlotCaption(idx, e.target.value)}
                            className={`w-full px-2 py-1 rounded-lg border text-[11px] font-semibold outline-none ${inputCls}`}
                          >
                            {VAULT_CAPTION_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 2: CONTENT, DESCRIPTION & TECHNICAL SPECS */}
              <div className="space-y-3 pt-2 border-t border-slate-200/20">
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Product Information &amp; Technical Specs
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Title</label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => {
                        setDraft({ ...draft, title: e.target.value });
                        setIsDirty(true);
                      }}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none ${inputCls}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Brand</label>
                    <input
                      type="text"
                      value={draft.brand}
                      onChange={(e) => {
                        setDraft({ ...draft, brand: e.target.value });
                        setIsDirty(true);
                      }}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${inputCls}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Subcategory</label>
                    <input
                      type="text"
                      value={draft.subcategory}
                      onChange={(e) => {
                        setDraft({ ...draft, subcategory: e.target.value });
                        setIsDirty(true);
                      }}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${inputCls}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>
                    Full Product Description (Multi-line supported)
                  </label>
                  <textarea
                    rows={4}
                    value={draft.description}
                    onChange={(e) => {
                      setDraft({ ...draft, description: e.target.value });
                      setIsDirty(true);
                    }}
                    placeholder="Write clear grade details, site applications, coverage/yield, and ISI standards..."
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${inputCls}`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>
                    Key Technical Spec Bullets ({draft.specBullets.length})
                  </label>
                  <div className="space-y-1.5 mb-2">
                    {draft.specBullets.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => {
                            const next = [...draft.specBullets];
                            next[idx] = e.target.value;
                            setDraft({ ...draft, specBullets: next });
                            setIsDirty(true);
                          }}
                          className={`flex-1 px-2.5 py-1.5 rounded-lg border text-xs outline-none ${inputCls}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDraft({
                              ...draft,
                              specBullets: draft.specBullets.filter((_, i) => i !== idx),
                            });
                            setIsDirty(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/15 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newSpecBullet}
                      onChange={(e) => setNewSpecBullet(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newSpecBullet.trim()) {
                          e.preventDefault();
                          setDraft({
                            ...draft,
                            specBullets: [...draft.specBullets, newSpecBullet.trim()],
                          });
                          setNewSpecBullet("");
                          setIsDirty(true);
                        }
                      }}
                      placeholder="Add spec bullet (e.g., SDR 11 · IS 15778 Certified)"
                      className={`flex-1 px-2.5 py-1.5 rounded-lg border text-xs outline-none ${inputCls}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newSpecBullet.trim()) return;
                        setDraft({
                          ...draft,
                          specBullets: [...draft.specBullets, newSpecBullet.trim()],
                        });
                        setNewSpecBullet("");
                        setIsDirty(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                    >
                      + Add Spec
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: COMMERCIAL, GST & STOCK */}
              <div className="space-y-3 pt-2 border-t border-slate-200/20">
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Commercial Pricing, HSN/SAC &amp; Availability
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>MRP (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={draft.mrp}
                      onChange={(e) => {
                        setDraft({ ...draft, mrp: Number(e.target.value) });
                        setIsDirty(true);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold outline-none ${inputCls}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Selling Price (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={draft.price}
                      onChange={(e) => {
                        setDraft({ ...draft, price: Number(e.target.value) });
                        setIsDirty(true);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold outline-none ${inputCls}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Unit</label>
                    <input
                      type="text"
                      value={draft.unit}
                      onChange={(e) => {
                        setDraft({ ...draft, unit: e.target.value });
                        setIsDirty(true);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none ${inputCls}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Bulk Rate (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={draft.bulkPrice}
                      onChange={(e) => {
                        setDraft({ ...draft, bulkPrice: e.target.value === "" ? "" : Number(e.target.value) });
                        setIsDirty(true);
                      }}
                      placeholder="Optional"
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs outline-none ${inputCls}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>HSN / SAC Code</label>
                    <input
                      type="text"
                      value={draft.hsnCode}
                      onChange={(e) => {
                        setDraft({ ...draft, hsnCode: e.target.value });
                        setIsDirty(true);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono outline-none ${inputCls}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>GST Slab</label>
                    <select
                      value={draft.gstRate}
                      onChange={(e) => {
                        setDraft({ ...draft, gstRate: Number(e.target.value) });
                        setIsDirty(true);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold outline-none ${inputCls}`}
                    >
                      {[0, 5, 12, 18, 28].map((g) => (
                        <option key={g} value={g}>
                          {g}% GST
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.isInStock}
                      onChange={(e) => {
                        setDraft({ ...draft, isInStock: e.target.checked });
                        setIsDirty(true);
                      }}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span>Available &amp; Active on Storefront</span>
                  </label>

                  {isDirty && (
                    <span className="text-[11px] font-bold text-amber-500">
                      Unsaved changes staged
                    </span>
                  )}
                </div>
              </div>

              {/* Sticky Bottom Save Footer */}
              <div className="sticky bottom-0 pt-3 pb-1 border-t border-slate-200/20 flex items-center justify-between gap-3 bg-inherit">
                <span className={`text-[11px] ${mutedText}`}>
                  {draft.images.length > 0
                    ? `${draft.images.length} photo(s) ready • Slot #1 is Primary Cover`
                    : "Upload real photos above to mark Admin Verified"}
                </span>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveAndPublish}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving to Disk..." : "Save & Publish to Disk"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── PHOTO ZOOM LIGHTBOX ─────────────────────────────────────────── */}
      {zoomPhotoIdx !== null && draft && draft.images[zoomPhotoIdx] && (
        <div
          onClick={() => setZoomPhotoIdx(null)}
          className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between text-slate-900">
              <p className="text-xs font-black">
                {draft.title} · {draft.images[zoomPhotoIdx].caption || `Photo ${zoomPhotoIdx + 1}`}
              </p>
              <button
                type="button"
                onClick={() => setZoomPhotoIdx(null)}
                className="p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={resolvePreviewSrc(draft.images[zoomPhotoIdx])}
              alt=""
              className="w-full max-h-[70vh] object-contain rounded-xl bg-[#F7F8FA]"
            />
          </div>
        </div>
      )}

      {/* ── BULK APPLY TO SIMILAR ITEMS MODAL ────────────────────────────── */}
      {showBulkModal && draft && (
        <div
          onClick={() => setShowBulkModal(false)}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-xl rounded-2xl border p-5 space-y-4 shadow-2xl ${panelBg}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-black">Apply Photos to Similar Items</h3>
                <p className={`text-xs mt-0.5 ${mutedText}`}>
                  Copy photos from &ldquo;{draft.title}&rdquo; across multiple variants or pack sizes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-full hover:bg-slate-500/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBulkMode("cover_only")}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                  bulkMode === "cover_only"
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : subSurfaceBg
                }`}
              >
                Copy Primary Cover Only (1 Photo)
              </button>
              <button
                type="button"
                onClick={() => setBulkMode("full_gallery")}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                  bulkMode === "full_gallery"
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : subSurfaceBg
                }`}
              >
                Copy Full Gallery ({draft.images.length} Photos)
              </button>
            </div>

            <input
              type="text"
              value={bulkSearch}
              onChange={(e) => setBulkSearch(e.target.value)}
              placeholder="Search items in any category..."
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${inputCls}`}
            />

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {bulkCandidates.map((cand) => {
                const checked = bulkSelectedIds.includes(cand.id);
                return (
                  <label
                    key={cand.id}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer text-xs ${
                      checked
                        ? "border-emerald-500 bg-emerald-500/10"
                        : isDark
                        ? "border-slate-800 hover:bg-slate-800/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkSelectedIds((prev) => [...prev, cand.id]);
                        } else {
                          setBulkSelectedIds((prev) => prev.filter((id) => id !== cand.id));
                        }
                      }}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate">{cand.title}</p>
                      <p className={`text-[10px] ${mutedText}`}>
                        {cand.brand} · {cand.unit} · {cand.id}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/20">
              <span className={`text-xs font-bold ${mutedText}`}>
                {bulkSelectedIds.length} item(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${mutedText}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isBulkApplying || bulkSelectedIds.length === 0}
                  onClick={handleConfirmBulkApply}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black cursor-pointer"
                >
                  {isBulkApplying ? "Applying..." : `Apply to ${bulkSelectedIds.length} Items Live`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD NEW CUSTOM ITEM MODAL ───────────────────────────────────── */}
      {showAddItemModal && (
        <div
          onClick={() => setShowAddItemModal(false)}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleCreateNewItem}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-2xl border p-5 space-y-3.5 shadow-2xl ${panelBg}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">Add New Product / Service / Rental Item</h3>
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="p-1 rounded-full hover:bg-slate-500/15"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="sm:col-span-2">
                <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Item Title *</label>
                <input
                  required
                  type="text"
                  value={newItemForm.title}
                  onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                  placeholder="e.g., Astral CPVC Tank Connector 1 Inch"
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Category</label>
                <select
                  value={newItemForm.categorySlug}
                  onChange={(e) => {
                    const cat = VAULT_CATEGORIES.find((c) => c.slug === e.target.value);
                    setNewItemForm({
                      ...newItemForm,
                      categorySlug: e.target.value,
                      hsnCode: cat?.defaultHsnOrSac || newItemForm.hsnCode,
                      gstRate: String(cat?.defaultGstRate ?? 18),
                    });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${inputCls}`}
                >
                  {VAULT_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Brand</label>
                <input
                  type="text"
                  value={newItemForm.brand}
                  onChange={(e) => setNewItemForm({ ...newItemForm, brand: e.target.value })}
                  placeholder="e.g., Astral"
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Selling Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={newItemForm.price}
                  onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>MRP (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={newItemForm.mrp}
                  onChange={(e) => setNewItemForm({ ...newItemForm, mrp: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Unit</label>
                <input
                  type="text"
                  value={newItemForm.unit}
                  onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>HSN / SAC</label>
                <input
                  type="text"
                  value={newItemForm.hsnCode}
                  onChange={(e) => setNewItemForm({ ...newItemForm, hsnCode: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border font-mono outline-none ${inputCls}`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`block text-[11px] font-bold mb-1 ${mutedText}`}>Description</label>
                <textarea
                  rows={2}
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${inputCls}`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${mutedText}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
              >
                Create &amp; Upload Photos
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminMediaVaultStudio;

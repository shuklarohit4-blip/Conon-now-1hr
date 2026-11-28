import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Layers,
  LayoutGrid,
  Link2,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  MERCHANDISING_THEME_PRESETS,
  resolveMerchandisingAssetUrl,
  saveHomeMerchandising,
  uploadMerchandisingImage,
  useLiveMerchandising,
  type BentoDealCard,
  type HeroBrandBanner,
  type HomeMerchandisingData,
  type LinkType,
  type OfferCarouselStrip,
  type PromoAnnouncementStrip,
  type ThemePresetName,
} from "@/services/liveMerchandisingStore";
import { useLiveCategoriesStore } from "@/services/liveCategoriesStore";
import { useLiveProductsStore } from "@/services/liveProductsStore";
import {
  MerchandisingHeroBannerCarousel,
  MerchandisingMastheadAndBento,
  MerchandisingOfferCarousel,
  MerchandisingPromoStrips,
} from "@/components/HomeMerchandisingSections";

type StudioTab = "masthead" | "bento" | "offers_strips" | "banners" | "layout";

function SmartLinkPicker({
  linkType,
  linkTarget,
  onChange,
  categories,
  products,
  isDark,
}: {
  linkType: LinkType;
  linkTarget: string;
  onChange: (nextType: LinkType, nextTarget: string) => void;
  categories: { slug: string; title: string }[];
  products: { id: string; slug: string; title: string }[];
  isDark: boolean;
}) {
  const inputCls = isDark
    ? "bg-slate-900 border-slate-700 text-white"
    : "bg-white border-slate-300 text-slate-900";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 block mb-1">
          Destination Type
        </label>
        <select
          value={linkType}
          onChange={(e) => {
            const t = e.target.value as LinkType;
            const defaultTarget =
              t === "category"
                ? categories[0]?.slug || "cement-civil-works"
                : t === "product"
                  ? products[0]?.id || ""
                  : t === "search"
                    ? "UltraTech"
                    : "/builder-kit";
            onChange(t, defaultTarget);
          }}
          className={`w-full rounded-xl border px-2.5 py-2 text-xs font-semibold outline-none ${inputCls}`}
        >
          <option value="category">Category Page</option>
          <option value="product">Product Detail Sheet</option>
          <option value="search">Search Query</option>
          <option value="url">Custom Route / URL</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 block mb-1">
          {linkType === "category"
            ? "Select Target Category"
            : linkType === "product"
              ? "Select Target Product"
              : linkType === "search"
                ? "Search Keyword"
                : "Route (/builder-kit) or URL"}
        </label>
        {linkType === "category" ? (
          <select
            value={linkTarget}
            onChange={(e) => onChange("category", e.target.value)}
            className={`w-full rounded-xl border px-2.5 py-2 text-xs font-semibold outline-none ${inputCls}`}
          >
            <option value="">-- Choose Category --</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title} ({c.slug})
              </option>
            ))}
          </select>
        ) : linkType === "product" ? (
          <select
            value={linkTarget}
            onChange={(e) => onChange("product", e.target.value)}
            className={`w-full rounded-xl border px-2.5 py-2 text-xs font-semibold outline-none ${inputCls}`}
          >
            <option value="">-- Choose Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        ) : (
          <div className="relative">
            <Link2 className="w-3.5 h-3.5 opacity-50 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={linkTarget}
              onChange={(e) => onChange(linkType, e.target.value)}
              placeholder={linkType === "search" ? "e.g. ACC Cement" : "/builder-kit"}
              className={`w-full rounded-xl border pl-8 pr-2.5 py-2 text-xs font-semibold outline-none ${inputCls}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ImageUploadButton({
  currentUrl,
  updatedAt,
  prefix,
  hint,
  onUploaded,
  isDark,
}: {
  currentUrl?: string;
  updatedAt?: string;
  prefix: string;
  hint?: string;
  onUploaded: (url: string) => void;
  isDark: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMerchandisingImage(file, prefix);
      onUploaded(url);
      toast.success("Image uploaded to /uploads/banners — click Save & Push Live to publish");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resolved = resolveMerchandisingAssetUrl(currentUrl, updatedAt);

  return (
    <div
      className={`rounded-xl border border-dashed p-2.5 flex items-center gap-3 ${
        isDark ? "border-slate-700 bg-slate-900/60" : "border-slate-300 bg-slate-50"
      }`}
    >
      <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
        {resolved ? (
          <img src={resolved} alt="" className="w-full h-full object-contain" />
        ) : (
          <ImagePlus className="w-5 h-5 text-slate-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />
            <span>{uploading ? "Optimizing WebP..." : "Upload Image"}</span>
          </button>
          {currentUrl && (
            <button
              type="button"
              onClick={() => onUploaded("")}
              className="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-500 text-[10.5px] font-bold hover:bg-rose-500/25 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-[10px] opacity-65 mt-1 truncate">
          {hint || "PNG / JPG / WebP up to 5MB (saved locally as /uploads/banners/...)"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            void handleFile(f);
          }}
        />
      </div>
    </div>
  );
}

export function AdminHomeBannersStudio({ isDark = true }: { isDark?: boolean }) {
  const live = useLiveMerchandising({ activeOnly: false });
  const { categories } = useLiveCategoriesStore({ includeInactive: false });
  const { products } = useLiveProductsStore();

  const [draft, setDraft] = useState<HomeMerchandisingData | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<StudioTab>("masthead");
  const [selectedBentoId, setSelectedBentoId] = useState<string>("");
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  useEffect(() => {
    if (!dirty && live.masthead) {
      const cloned: HomeMerchandisingData = {
        masthead: { ...live.masthead },
        bentoCards: live.bentoCards.map((c) => ({ ...c })),
        offerStrips: live.offerStrips.map((o) => ({ ...o })),
        heroBanners: live.heroBanners.map((b) => ({ ...b })),
        promoStrips: live.promoStrips.map((p) => ({ ...p })),
        sectionLayout: live.sectionLayout.map((s) => ({ ...s })),
        updatedAt: live.updatedAt,
      };
      setDraft(cloned);
      if (!selectedBentoId && cloned.bentoCards[0]) {
        setSelectedBentoId(cloned.bentoCards[0].id);
      }
    }
  }, [live.updatedAt, live.loaded, dirty]);

  const cardBg = isDark
    ? "bg-[#0D1426] border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-xs";
  const subPanel = isDark
    ? "bg-[#070B14] border-slate-800 text-slate-200"
    : "bg-slate-50 border-slate-200 text-slate-900";
  const inputCls = isDark
    ? "bg-slate-900 border-slate-700 text-white focus:border-amber-400"
    : "bg-white border-slate-300 text-slate-900 focus:border-blue-600";

  const updateDraft = (updater: (prev: HomeMerchandisingData) => HomeMerchandisingData) => {
    setDraft((prev) => {
      if (!prev) return prev;
      setDirty(true);
      return updater(prev);
    });
  };

  const handleSaveLive = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const saved = await saveHomeMerchandising(draft);
      setDraft(saved);
      setDirty(false);
      toast.success("Home & Banners pushed LIVE across Localhost, LAN & DevTunnels!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save Home Merchandising");
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (presetKey: Exclude<ThemePresetName, "custom">) => {
    const preset = MERCHANDISING_THEME_PRESETS[presetKey];
    updateDraft((prev) => ({
      ...prev,
      masthead: {
        ...prev.masthead,
        presetName: presetKey,
        isEnabled: preset.isEnabled,
        bgGradientStart: preset.bgGradientStart,
        bgGradientEnd: preset.bgGradientEnd,
        accentColor: preset.accentColor,
        textColor: preset.textColor,
        pillBgColor: preset.pillBgColor,
        pillTextColor: preset.pillTextColor,
      },
    }));
    toast.info(`Applied preset: ${preset.label}`);
  };

  const moveItem = <T extends { order?: number; slotOrder?: number }>(
    arr: T[],
    idx: number,
    dir: -1 | 1,
    key: "order" | "slotOrder" = "order"
  ): T[] => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= arr.length) return arr;
    const copy = [...arr];
    const [picked] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, picked);
    return copy.map((item, i) => ({ ...item, [key]: i + 1 }));
  };

  const orderedBento = useMemo(
    () => [...(draft?.bentoCards || [])].sort((a, b) => a.slotOrder - b.slotOrder),
    [draft?.bentoCards]
  );
  const selectedBento =
    orderedBento.find((c) => c.id === selectedBentoId) || orderedBento[0] || null;

  if (!draft) {
    return (
      <div className={`rounded-3xl border p-8 text-center ${cardBg}`}>
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
        <p className="text-sm font-bold">Loading Home & Banners Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className={`rounded-2xl border p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 ${cardBg}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
              Blinkit + Flipkart Minutes Engine
            </span>
            {dirty && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Unsaved Preview Changes
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-black mt-1">
            Home & Banners Studio (100% Live Merchandising)
          </h2>
          <p className="text-xs opacity-70">
            Customize header takeover colors, 5-card Bento deals, offer pills, sponsored brand carousels & section order.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMobilePreviewOpen(true)}
            className="xl:hidden px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview Phone</span>
          </button>

          {dirty && (
            <button
              type="button"
              onClick={async () => {
                setDirty(false);
                await live.refresh();
                toast.info("Reverted unsaved changes to live DB state");
              }}
              className="px-3 py-2 rounded-xl border border-slate-700 text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Discard Draft
            </button>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveLive}
            className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-400/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Pushing Live..." : "Save & Push Live to All Devices"}</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="flex flex-col xl:flex-row gap-4 items-start">
        {/* LEFT COLUMN: 5-TAB VISUAL EDITOR */}
        <div className="w-full xl:flex-1 min-w-0 space-y-4">
          {/* Navigation Tabs */}
          <div className={`rounded-2xl border p-1.5 flex flex-wrap gap-1 ${cardBg}`}>
            {[
              { id: "masthead" as StudioTab, label: "1. Theme & Masthead", icon: Palette },
              { id: "bento" as StudioTab, label: "2. 5-Card Bento Grid", icon: LayoutGrid },
              { id: "offers_strips" as StudioTab, label: "3. Offers & Promo Strips", icon: Tag },
              { id: "banners" as StudioTab, label: "4. Hero & Mid Banners", icon: Sparkles },
              { id: "layout" as StudioTab, label: "5. Section Order", icon: Layers },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    active
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : isDark
                        ? "text-slate-300 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: THEME & MASTHEAD STUDIO */}
          {activeTab === "masthead" && (
            <div className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardBg}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/40">
                <div>
                  <h3 className="text-sm font-black">Blinkit-Style Theme Takeover Mode</h3>
                  <p className="text-xs opacity-70">
                    When ON, the header bar + category strip + bento showcase share a cohesive campaign gradient.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft((p) => ({
                      ...p,
                      masthead: { ...p.masthead, isEnabled: !p.masthead.isEnabled },
                    }))
                  }
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                    draft.masthead.isEnabled
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {draft.masthead.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{draft.masthead.isEnabled ? "Takeover ACTIVE" : "Takeover OFF (Clean White)"}</span>
                </button>
              </div>

              {/* One-Click Presets */}
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider opacity-70 mb-2 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>One-Click Theme Presets</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(MERCHANDISING_THEME_PRESETS) as Exclude<ThemePresetName, "custom">[]).map(
                    (key) => {
                      const preset = MERCHANDISING_THEME_PRESETS[key];
                      const isCur = draft.masthead.presetName === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => applyPreset(key)}
                          className={`rounded-xl border p-2 text-left transition cursor-pointer ${
                            isCur
                              ? "border-amber-400 ring-2 ring-amber-400/30"
                              : "border-slate-700/60 hover:border-slate-500"
                          }`}
                        >
                          <div
                            className="h-7 rounded-lg mb-1.5 border border-white/15 flex items-center justify-end px-1.5"
                            style={{
                              background: `linear-gradient(90deg, ${preset.bgGradientStart}, ${preset.bgGradientEnd})`,
                            }}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: preset.accentColor }}
                            />
                          </div>
                          <div className="text-[11px] font-black truncate">{preset.label}</div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold opacity-75 block mb-1">
                    Campaign Masthead Title
                  </label>
                  <input
                    type="text"
                    value={draft.masthead.campaignTitle}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        masthead: { ...p.masthead, campaignTitle: e.target.value },
                      }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold opacity-75 block mb-1">
                    Campaign Subtitle
                  </label>
                  <input
                    type="text"
                    value={draft.masthead.campaignSubtitle}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        masthead: { ...p.masthead, campaignSubtitle: e.target.value },
                      }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                  />
                </div>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {[
                  { key: "bgGradientStart" as const, label: "Grad Start" },
                  { key: "bgGradientEnd" as const, label: "Grad End" },
                  { key: "accentColor" as const, label: "Accent" },
                  { key: "textColor" as const, label: "Text" },
                  { key: "pillBgColor" as const, label: "Pill Bg" },
                  { key: "pillTextColor" as const, label: "Pill Text" },
                ].map((cp) => (
                  <label key={cp.key} className={`rounded-xl border p-2 cursor-pointer ${subPanel}`}>
                    <span className="text-[10px] font-bold opacity-70 block mb-1">{cp.label}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={draft.masthead[cp.key]}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            masthead: {
                              ...p.masthead,
                              presetName: "custom",
                              [cp.key]: e.target.value,
                            },
                          }))
                        }
                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <span className="text-[10px] font-mono uppercase">{draft.masthead[cp.key]}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Bottom Edge, Sparkles, Schedule & Background Pattern */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold opacity-75 block mb-1">
                    Bottom Edge Transition
                  </label>
                  <select
                    value={draft.masthead.bottomEdgeStyle}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        masthead: {
                          ...p.masthead,
                          bottomEdgeStyle: e.target.value as any,
                        },
                      }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                  >
                    <option value="dotted-pattern">Blinkit Dotted Edge</option>
                    <option value="curved">Smooth Curved Arch</option>
                    <option value="flat">Clean Flat Border</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold opacity-75 block mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={draft.masthead.startDate ? draft.masthead.startDate.slice(0, 10) : ""}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        masthead: { ...p.masthead, startDate: e.target.value || undefined },
                      }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold opacity-75 block mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={draft.masthead.endDate ? draft.masthead.endDate.slice(0, 10) : ""}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        masthead: { ...p.masthead, endDate: e.target.value || undefined },
                      }))
                    }
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.masthead.showSparkles}
                    onChange={(e) =>
                      updateDraft((p) => ({
                        ...p,
                        masthead: { ...p.masthead, showSparkles: e.target.checked },
                      }))
                    }
                    className="rounded accent-amber-400"
                  />
                  <span>Show Subtle Festive Sparkles in Masthead</span>
                </label>
              </div>

              <ImageUploadButton
                currentUrl={draft.masthead.bgPatternImageUrl}
                updatedAt={draft.updatedAt}
                prefix="masthead-pattern"
                hint="Optional subtle background texture/pattern overlay for Masthead"
                onUploaded={(url) =>
                  updateDraft((p) => ({
                    ...p,
                    masthead: { ...p.masthead, bgPatternImageUrl: url },
                  }))
                }
                isDark={isDark}
              />
            </div>
          )}

          {/* TAB 2: BENTO GRID VISUAL EDITOR */}
          {activeTab === "bento" && (
            <div className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardBg}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black">Interactive 5-Card Bento Diagram</h3>
                  <p className="text-xs opacity-70">
                    Click any card slot below (1 Left Tall Spotlight + 4 Right Deal Tiles) to customize image, price & target.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextOrder = draft.bentoCards.length + 1;
                    const newCard: BentoDealCard = {
                      id: `bento-${Date.now()}`,
                      slotType: nextOrder === 1 ? "HERO_LEFT" : "GRID_TILE",
                      slotOrder: nextOrder,
                      isActive: true,
                      badgePrefix: "Up to",
                      badgeHighlight: "25% OFF",
                      badgeColor: "#0F766E",
                      title: "New Deal Card",
                      subtitle: "Lucknow Direct",
                      imageUrl: "",
                      cardBgColor: "#F0FDF4",
                      linkType: "category",
                      linkTarget: categories[0]?.slug || "cement-civil-works",
                    };
                    updateDraft((p) => ({ ...p, bentoCards: [...p.bentoCards, newCard] }));
                    setSelectedBentoId(newCard.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Bento Slot</span>
                </button>
              </div>

              {/* Visual Diagram Map */}
              <div className={`rounded-2xl border p-3 grid grid-cols-12 gap-2 ${subPanel}`}>
                {orderedBento.map((card, idx) => {
                  const isSel = selectedBento?.id === card.id;
                  const isHero = card.slotType === "HERO_LEFT" && idx === 0;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedBentoId(card.id)}
                      className={`${
                        isHero ? "col-span-4 min-h-[116px]" : "col-span-4 sm:col-span-2 min-h-[54px]"
                      } rounded-xl border-2 p-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        isSel
                          ? "border-amber-400 ring-2 ring-amber-400/30"
                          : "border-slate-600/40 opacity-85 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: card.cardBgColor || "#FFFFFF", color: "#0F172A" }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-black uppercase bg-slate-900 text-white px-1.5 py-0.5 rounded">
                          {isHero ? "Hero Left" : `Tile #${idx}`}
                        </span>
                        {!card.isActive && (
                          <span className="text-[8px] font-black bg-rose-600 text-white px-1 rounded">OFF</span>
                        )}
                      </div>
                      <div className="text-[11px] font-black line-clamp-2 mt-1">{card.title}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Bento Editor */}
              {selectedBento && (
                <div className={`rounded-2xl border p-4 space-y-3 ${subPanel}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase text-amber-400">
                      Editing: {selectedBento.title || "Untitled Card"}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedBento.slotType}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            bentoCards: p.bentoCards.map((c) =>
                              c.id === selectedBento.id
                                ? { ...c, slotType: e.target.value as any }
                                : c
                            ),
                          }))
                        }
                        className={`rounded-lg border px-2 py-1 text-xs font-bold ${inputCls}`}
                      >
                        <option value="HERO_LEFT">HERO_LEFT (Tall Spotlight)</option>
                        <option value="GRID_TILE">GRID_TILE (Right 2x2 Tile)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((p) => ({
                            ...p,
                            bentoCards: p.bentoCards.map((c) =>
                              c.id === selectedBento.id ? { ...c, isActive: !c.isActive } : c
                            ),
                          }))
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer ${
                          selectedBento.isActive
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {selectedBento.isActive ? "Visible" : "Hidden"}
                      </button>

                      {draft.bentoCards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const remaining = draft.bentoCards.filter((c) => c.id !== selectedBento.id);
                            updateDraft((p) => ({ ...p, bentoCards: remaining }));
                            setSelectedBentoId(remaining[0]?.id || "");
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 cursor-pointer"
                          title="Delete card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10.5px] font-bold opacity-75 block mb-1">Card Title</label>
                      <input
                        type="text"
                        value={selectedBento.title}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            bentoCards: p.bentoCards.map((c) =>
                              c.id === selectedBento.id ? { ...c, title: e.target.value } : c
                            ),
                          }))
                        }
                        className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold opacity-75 block mb-1">Subtitle (Optional)</label>
                      <input
                        type="text"
                        value={selectedBento.subtitle || ""}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            bentoCards: p.bentoCards.map((c) =>
                              c.id === selectedBento.id ? { ...c, subtitle: e.target.value } : c
                            ),
                          }))
                        }
                        className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-bold opacity-75 block mb-1">Badge Prefix</label>
                      <input
                        type="text"
                        value={selectedBento.badgePrefix}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            bentoCards: p.bentoCards.map((c) =>
                              c.id === selectedBento.id ? { ...c, badgePrefix: e.target.value } : c
                            ),
                          }))
                        }
                        className={`w-full rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold opacity-75 block mb-1">Badge Highlight</label>
                      <input
                        type="text"
                        value={selectedBento.badgeHighlight}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            bentoCards: p.bentoCards.map((c) =>
                              c.id === selectedBento.id ? { ...c, badgeHighlight: e.target.value } : c
                            ),
                          }))
                        }
                        className={`w-full rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold opacity-75 block mb-1">Offer Price (₹)</label>
                      <input
                        type="number"
                        value={selectedBento.offerPrice ?? ""}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            bentoCards: p.bentoCards.map((c) =>
                              c.id === selectedBento.id
                                ? { ...c, offerPrice: e.target.value ? Number(e.target.value) : undefined }
                                : c
                            ),
                          }))
                        }
                        className={`w-full rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold opacity-75 block mb-1">MRP Strikethrough</label>
                      <input
                        type="number"
                        value={selectedBento.originalPrice ?? ""}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            bentoCards: p.bentoCards.map((c) =>
                              c.id === selectedBento.id
                                ? {
                                    ...c,
                                    originalPrice: e.target.value ? Number(e.target.value) : undefined,
                                  }
                                : c
                            ),
                          }))
                        }
                        className={`w-full rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold">
                      <input
                        type="color"
                        value={selectedBento.cardBgColor || "#FFF7ED"}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            bentoCards: p.bentoCards.map((c) =>
                              c.id === selectedBento.id ? { ...c, cardBgColor: e.target.value } : c
                            ),
                          }))
                        }
                        className="w-7 h-7 rounded border-0 cursor-pointer"
                      />
                      <span>Card Surface Color ({selectedBento.cardBgColor})</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold">
                      <input
                        type="color"
                        value={selectedBento.badgeColor || "#E11D48"}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            bentoCards: p.bentoCards.map((c) =>
                              c.id === selectedBento.id ? { ...c, badgeColor: e.target.value } : c
                            ),
                          }))
                        }
                        className="w-7 h-7 rounded border-0 cursor-pointer"
                      />
                      <span>Badge Pill Color ({selectedBento.badgeColor})</span>
                    </label>
                  </div>

                  <ImageUploadButton
                    currentUrl={selectedBento.imageUrl}
                    updatedAt={draft.updatedAt}
                    prefix="bento-card"
                    hint="Transparent cutout PNG or crisp studio WebP recommended"
                    onUploaded={(url) =>
                      updateDraft((p) => ({
                        ...p,
                        bentoCards: p.bentoCards.map((c) =>
                          c.id === selectedBento.id ? { ...c, imageUrl: url } : c
                        ),
                      }))
                    }
                    isDark={isDark}
                  />

                  <SmartLinkPicker
                    linkType={selectedBento.linkType}
                    linkTarget={selectedBento.linkTarget}
                    onChange={(nextType, nextTarget) =>
                      updateDraft((p) => ({
                        ...p,
                        bentoCards: p.bentoCards.map((c) =>
                          c.id === selectedBento.id
                            ? { ...c, linkType: nextType, linkTarget: nextTarget }
                            : c
                        ),
                      }))
                    }
                    categories={categories}
                    products={products}
                    isDark={isDark}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OFFER CAROUSEL & PROMO STRIPS */}
          {activeTab === "offers_strips" && (
            <div className="space-y-4">
              {/* Offer Carousel Pills */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardBg}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black">Horizontal Deal Pill Carousel</h3>
                    <p className="text-xs opacity-70">Swipeable deal pills directly under Bento Grid.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft((p) => ({
                        ...p,
                        offerStrips: [
                          ...p.offerStrips,
                          {
                            id: `offer-${Date.now()}`,
                            order: p.offerStrips.length + 1,
                            isActive: true,
                            iconType: "percent",
                            title: "New Flash Offer",
                            subtitle: "Limited-time Lucknow deal",
                            bgColor: "#0F2A38",
                            textColor: "#FFFFFF",
                            linkType: "search",
                            linkTarget: "Cement",
                          },
                        ],
                      }))
                    }
                    className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Deal Pill</span>
                  </button>
                </div>

                {draft.offerStrips.map((strip, idx) => (
                  <div key={strip.id} className={`rounded-xl border p-3 space-y-2.5 ${subPanel}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black">Pill #{idx + 1}: {strip.title}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft((p) => ({
                              ...p,
                              offerStrips: moveItem(p.offerStrips, idx, -1),
                            }))
                          }
                          className="p-1 rounded bg-slate-800 text-slate-200 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft((p) => ({
                              ...p,
                              offerStrips: moveItem(p.offerStrips, idx, 1),
                            }))
                          }
                          className="p-1 rounded bg-slate-800 text-slate-200 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft((p) => ({
                              ...p,
                              offerStrips: p.offerStrips.map((o) =>
                                o.id === strip.id ? { ...o, isActive: !o.isActive } : o
                              ),
                            }))
                          }
                          className={`px-2 py-1 rounded text-[11px] font-black cursor-pointer ${
                            strip.isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-white"
                          }`}
                        >
                          {strip.isActive ? "Active" : "Paused"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft((p) => ({
                              ...p,
                              offerStrips: p.offerStrips.filter((o) => o.id !== strip.id),
                            }))
                          }
                          className="p-1 rounded bg-rose-500/20 text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={strip.title}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            offerStrips: p.offerStrips.map((o) =>
                              o.id === strip.id ? { ...o, title: e.target.value } : o
                            ),
                          }))
                        }
                        placeholder="Title"
                        className={`rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                      <input
                        type="text"
                        value={strip.subtitle}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            offerStrips: p.offerStrips.map((o) =>
                              o.id === strip.id ? { ...o, subtitle: e.target.value } : o
                            ),
                          }))
                        }
                        placeholder="Subtitle"
                        className={`rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={strip.iconType}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              offerStrips: p.offerStrips.map((o) =>
                                o.id === strip.id ? { ...o, iconType: e.target.value as any } : o
                              ),
                            }))
                          }
                          className={`flex-1 rounded-xl border px-2 py-2 text-xs font-bold outline-none ${inputCls}`}
                        >
                          <option value="percent">% Percent</option>
                          <option value="truck">Truck</option>
                          <option value="bolt">Lightning Bolt</option>
                          <option value="tag">Price Tag</option>
                          <option value="custom">Custom Icon</option>
                        </select>
                        <input
                          type="color"
                          value={strip.bgColor}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              offerStrips: p.offerStrips.map((o) =>
                                o.id === strip.id ? { ...o, bgColor: e.target.value } : o
                              ),
                            }))
                          }
                          className="w-8 h-8 rounded cursor-pointer border-0"
                          title="Background color"
                        />
                        <input
                          type="color"
                          value={strip.textColor}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              offerStrips: p.offerStrips.map((o) =>
                                o.id === strip.id ? { ...o, textColor: e.target.value } : o
                              ),
                            }))
                          }
                          className="w-8 h-8 rounded cursor-pointer border-0"
                          title="Text color"
                        />
                      </div>
                    </div>

                    <SmartLinkPicker
                      linkType={strip.linkType}
                      linkTarget={strip.linkTarget}
                      onChange={(nt, ntgt) =>
                        updateDraft((p) => ({
                          ...p,
                          offerStrips: p.offerStrips.map((o) =>
                            o.id === strip.id ? { ...o, linkType: nt, linkTarget: ntgt } : o
                          ),
                        }))
                      }
                      categories={categories}
                      products={products}
                      isDark={isDark}
                    />
                  </div>
                ))}
              </div>

              {/* Thin Promo & Payment Partner Strips */}
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardBg}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black">Thin Offer & Payment Partner Strips</h3>
                    <p className="text-xs opacity-70">
                      Flipkart Minutes-style crisp GST cashback & payment partner strips.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft((p) => ({
                        ...p,
                        promoStrips: [
                          ...p.promoStrips,
                          {
                            id: `promo-${Date.now()}`,
                            order: p.promoStrips.length + 1,
                            isActive: true,
                            stripType: "PAYMENT_PARTNER",
                            badgeLabel: "UPI / GST",
                            boldText: "Extra 2% Off via Instant UPI",
                            regularText: "on all site supply orders",
                            termsText: "T&C Apply",
                            bgColor: "#EFF6FF",
                            textColor: "#1E3A8A",
                            borderColor: "#3B82F6",
                            linkType: "url",
                            linkTarget: "/checkout",
                          },
                        ],
                      }))
                    }
                    className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Promo Strip</span>
                  </button>
                </div>

                {draft.promoStrips.map((ps, idx) => (
                  <div key={ps.id} className={`rounded-xl border p-3 space-y-2.5 ${subPanel}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black">
                        Strip #{idx + 1}: {ps.badgeLabel} — {ps.boldText}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={ps.stripType}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              promoStrips: p.promoStrips.map((item) =>
                                item.id === ps.id ? { ...item, stripType: e.target.value as any } : item
                              ),
                            }))
                          }
                          className={`rounded-lg border px-2 py-1 text-[11px] font-bold ${inputCls}`}
                        >
                          <option value="OFFER_BAR">OFFER_BAR</option>
                          <option value="PAYMENT_PARTNER">PAYMENT_PARTNER</option>
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft((p) => ({
                              ...p,
                              promoStrips: p.promoStrips.map((item) =>
                                item.id === ps.id ? { ...item, isActive: !item.isActive } : item
                              ),
                            }))
                          }
                          className={`px-2 py-1 rounded text-[11px] font-black cursor-pointer ${
                            ps.isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-white"
                          }`}
                        >
                          {ps.isActive ? "Active" : "Paused"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft((p) => ({
                              ...p,
                              promoStrips: p.promoStrips.filter((item) => item.id !== ps.id),
                            }))
                          }
                          className="p-1 rounded bg-rose-500/20 text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={ps.badgeLabel}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            promoStrips: p.promoStrips.map((item) =>
                              item.id === ps.id ? { ...item, badgeLabel: e.target.value } : item
                            ),
                          }))
                        }
                        placeholder="Badge (e.g. RAZORPAY)"
                        className={`rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                      <input
                        type="text"
                        value={ps.boldText}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            promoStrips: p.promoStrips.map((item) =>
                              item.id === ps.id ? { ...item, boldText: e.target.value } : item
                            ),
                          }))
                        }
                        placeholder="Bold Headline"
                        className={`rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                      <input
                        type="text"
                        value={ps.regularText}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            promoStrips: p.promoStrips.map((item) =>
                              item.id === ps.id ? { ...item, regularText: e.target.value } : item
                            ),
                          }))
                        }
                        placeholder="Supporting copy"
                        className={`rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                      <input
                        type="text"
                        value={ps.termsText || ""}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            promoStrips: p.promoStrips.map((item) =>
                              item.id === ps.id ? { ...item, termsText: e.target.value } : item
                            ),
                          }))
                        }
                        placeholder="Terms (optional)"
                        className={`rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold">
                        <input
                          type="color"
                          value={ps.bgColor}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              promoStrips: p.promoStrips.map((item) =>
                                item.id === ps.id ? { ...item, bgColor: e.target.value } : item
                              ),
                            }))
                          }
                          className="w-6 h-6 rounded border-0"
                        />
                        <span>Bg</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold">
                        <input
                          type="color"
                          value={ps.borderColor}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              promoStrips: p.promoStrips.map((item) =>
                                item.id === ps.id ? { ...item, borderColor: e.target.value } : item
                              ),
                            }))
                          }
                          className="w-6 h-6 rounded border-0"
                        />
                        <span>Border</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold">
                        <input
                          type="color"
                          value={ps.textColor}
                          onChange={(e) =>
                            updateDraft((p) => ({
                              ...p,
                              promoStrips: p.promoStrips.map((item) =>
                                item.id === ps.id ? { ...item, textColor: e.target.value } : item
                              ),
                            }))
                          }
                          className="w-6 h-6 rounded border-0"
                        />
                        <span>Text</span>
                      </label>
                    </div>

                    <ImageUploadButton
                      currentUrl={ps.partnerLogoUrl}
                      updatedAt={draft.updatedAt}
                      prefix="partner-logo"
                      hint="Optional partner logo (replaces left pill badge)"
                      onUploaded={(url) =>
                        updateDraft((p) => ({
                          ...p,
                          promoStrips: p.promoStrips.map((item) =>
                            item.id === ps.id ? { ...item, partnerLogoUrl: url } : item
                          ),
                        }))
                      }
                      isDark={isDark}
                    />

                    <SmartLinkPicker
                      linkType={ps.linkType}
                      linkTarget={ps.linkTarget}
                      onChange={(nt, ntgt) =>
                        updateDraft((p) => ({
                          ...p,
                          promoStrips: p.promoStrips.map((item) =>
                            item.id === ps.id ? { ...item, linkType: nt, linkTarget: ntgt } : item
                          ),
                        }))
                      }
                      categories={categories}
                      products={products}
                      isDark={isDark}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SPONSORED BRAND HERO & MID-PAGE BANNERS */}
          {activeTab === "banners" && (
            <div className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardBg}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black">Brand Hero & Mid-Page Banners (16:7 Rounded Carousel)</h3>
                  <p className="text-xs opacity-70">
                    Sponsored brand campaign carousels rendered inside Flipkart Minutes rounded cards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const b: HeroBrandBanner = {
                      id: `banner-${Date.now()}`,
                      placement: "TOP_HERO",
                      order: draft.heroBanners.length + 1,
                      isActive: true,
                      bannerImageUrl: "",
                      headline: "New Sponsored Brand Campaign",
                      subheadline: "60-Minute Site Dispatch across 4 Lucknow Pincodes",
                      ctaText: "Explore Offers",
                      ctaBgColor: "#FACC15",
                      ctaTextColor: "#0F172A",
                      overlayGradient:
                        "linear-gradient(90deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.38) 60%, rgba(15,23,42,0.12) 100%)",
                      linkType: "category",
                      linkTarget: categories[0]?.slug || "cement-civil-works",
                    };
                    updateDraft((p) => ({ ...p, heroBanners: [...p.heroBanners, b] }));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Brand Banner</span>
                </button>
              </div>

              {draft.heroBanners.map((b, idx) => (
                <div key={b.id} className={`rounded-2xl border p-4 space-y-3 ${subPanel}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black">
                      Banner #{idx + 1}: {b.headline}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={b.placement}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            heroBanners: p.heroBanners.map((item) =>
                              item.id === b.id ? { ...item, placement: e.target.value as any } : item
                            ),
                          }))
                        }
                        className={`rounded-lg border px-2 py-1 text-[11px] font-bold ${inputCls}`}
                      >
                        <option value="TOP_HERO">TOP_HERO Carousel</option>
                        <option value="MID_PAGE">MID_PAGE Secondary</option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((p) => ({
                            ...p,
                            heroBanners: moveItem(p.heroBanners, idx, -1),
                          }))
                        }
                        className="p-1 rounded bg-slate-800 text-white cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((p) => ({
                            ...p,
                            heroBanners: moveItem(p.heroBanners, idx, 1),
                          }))
                        }
                        className="p-1 rounded bg-slate-800 text-white cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((p) => ({
                            ...p,
                            heroBanners: p.heroBanners.map((item) =>
                              item.id === b.id ? { ...item, isActive: !item.isActive } : item
                            ),
                          }))
                        }
                        className={`px-2 py-1 rounded text-[11px] font-black cursor-pointer ${
                          b.isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-white"
                        }`}
                      >
                        {b.isActive ? "Active" : "Paused"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((p) => ({
                            ...p,
                            heroBanners: p.heroBanners.filter((item) => item.id !== b.id),
                          }))
                        }
                        className="p-1 rounded bg-rose-500/20 text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10.5px] font-bold opacity-75 block mb-1">Headline</label>
                      <input
                        type="text"
                        value={b.headline}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            heroBanners: p.heroBanners.map((item) =>
                              item.id === b.id ? { ...item, headline: e.target.value } : item
                            ),
                          }))
                        }
                        className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold opacity-75 block mb-1">Subheadline</label>
                      <input
                        type="text"
                        value={b.subheadline}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            heroBanners: p.heroBanners.map((item) =>
                              item.id === b.id ? { ...item, subheadline: e.target.value } : item
                            ),
                          }))
                        }
                        className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10.5px] font-bold opacity-75 block mb-1">CTA Pill Label</label>
                      <input
                        type="text"
                        value={b.ctaText}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            heroBanners: p.heroBanners.map((item) =>
                              item.id === b.id ? { ...item, ctaText: e.target.value } : item
                            ),
                          }))
                        }
                        className={`w-full rounded-xl border px-2.5 py-2 text-xs font-bold outline-none ${inputCls}`}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold pt-4">
                      <input
                        type="color"
                        value={b.ctaBgColor}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            heroBanners: p.heroBanners.map((item) =>
                              item.id === b.id ? { ...item, ctaBgColor: e.target.value } : item
                            ),
                          }))
                        }
                        className="w-7 h-7 rounded border-0"
                      />
                      <span>CTA Fill</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold pt-4">
                      <input
                        type="color"
                        value={b.ctaTextColor}
                        onChange={(e) =>
                          updateDraft((p) => ({
                            ...p,
                            heroBanners: p.heroBanners.map((item) =>
                              item.id === b.id ? { ...item, ctaTextColor: e.target.value } : item
                            ),
                          }))
                        }
                        className="w-7 h-7 rounded border-0"
                      />
                      <span>CTA Text</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ImageUploadButton
                      currentUrl={b.bannerImageUrl}
                      updatedAt={draft.updatedAt}
                      prefix="hero-banner"
                      hint="16:7 landscape banner photo (1600x700 WebP recommended)"
                      onUploaded={(url) =>
                        updateDraft((p) => ({
                          ...p,
                          heroBanners: p.heroBanners.map((item) =>
                            item.id === b.id ? { ...item, bannerImageUrl: url } : item
                          ),
                        }))
                      }
                      isDark={isDark}
                    />
                    <ImageUploadButton
                      currentUrl={b.brandLogoUrl}
                      updatedAt={draft.updatedAt}
                      prefix="brand-logo"
                      hint="Optional partner brand logo pill top-left"
                      onUploaded={(url) =>
                        updateDraft((p) => ({
                          ...p,
                          heroBanners: p.heroBanners.map((item) =>
                            item.id === b.id ? { ...item, brandLogoUrl: url } : item
                          ),
                        }))
                      }
                      isDark={isDark}
                    />
                  </div>

                  <SmartLinkPicker
                    linkType={b.linkType}
                    linkTarget={b.linkTarget}
                    onChange={(nt, ntgt) =>
                      updateDraft((p) => ({
                        ...p,
                        heroBanners: p.heroBanners.map((item) =>
                          item.id === b.id ? { ...item, linkType: nt, linkTarget: ntgt } : item
                        ),
                      }))
                    }
                    categories={categories}
                    products={products}
                    isDark={isDark}
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: HOMEPAGE SECTION ORDER & VISIBILITY */}
          {activeTab === "layout" && (
            <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${cardBg}`}>
              <div>
                <h3 className="text-sm font-black">Homepage Section Order & Live Visibility</h3>
                <p className="text-xs opacity-70">
                  Reorder storefront blocks top-to-bottom or temporarily pause any campaign section.
                </p>
              </div>

              {[...draft.sectionLayout]
                .sort((a, b) => a.order - b.order)
                .map((sec, idx, arr) => (
                  <div
                    key={sec.id}
                    className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${subPanel}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-black truncate">{sec.label}</div>
                        <div className="text-[10px] font-mono opacity-60">{sec.id}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          updateDraft((p) => ({
                            ...p,
                            sectionLayout: moveItem(arr, idx, -1),
                          }))
                        }
                        className="p-1.5 rounded-lg bg-slate-800 text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === arr.length - 1}
                        onClick={() =>
                          updateDraft((p) => ({
                            ...p,
                            sectionLayout: moveItem(arr, idx, 1),
                          }))
                        }
                        className="p-1.5 rounded-lg bg-slate-800 text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((p) => ({
                            ...p,
                            sectionLayout: p.sectionLayout.map((s) =>
                              s.id === sec.id ? { ...s, isActive: !s.isActive } : s
                            ),
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                          sec.isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-white"
                        }`}
                      >
                        {sec.isActive ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE 375PX MOBILE PREVIEW */}
        <div
          className={`${
            mobilePreviewOpen
              ? "fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              : "hidden xl:block xl:w-[395px] shrink-0 sticky top-4"
          }`}
        >
          <div className="bg-slate-950 border-[6px] border-slate-800 rounded-[38px] shadow-2xl overflow-hidden w-full max-w-[375px]">
            {/* Phone Notch + Status Bar */}
            <div className="bg-slate-900 px-5 py-2 flex items-center justify-between text-[10px] font-bold text-slate-300">
              <span>Live 375px Storefront Preview</span>
              {mobilePreviewOpen ? (
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(false)}
                  className="p-1 rounded-full bg-slate-800 text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Smartphone className="w-3 h-3" /> Real-time
                </span>
              )}
            </div>

            {/* Simulated Mobile Screen */}
            <div className="bg-[#F8FAFC] max-h-[78vh] overflow-y-auto no-scrollbar">
              {/* Simulated Header synced to Masthead Theme */}
              <div
                className="px-3 py-2.5 flex items-center justify-between"
                style={
                  draft.masthead.isEnabled
                    ? {
                        background: draft.masthead.bgGradientStart,
                        color: draft.masthead.textColor,
                      }
                    : { background: "#FFFFFF", color: "#0F172A", borderBottom: "1px solid #E2E8F0" }
                }
              >
                <div className="font-black text-xs tracking-tight">
                  CONON-NOW <span className="opacity-70 font-semibold">• 60 mins (226030)</span>
                </div>
                <div className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-amber-400 text-slate-950">
                  ₹1,200 Gold
                </div>
              </div>

              {/* Render Live Draft Sections in Exact Configured Order */}
              {[...draft.sectionLayout]
                .filter((s) => s.isActive)
                .sort((a, b) => a.order - b.order)
                .map((sec) => {
                  if (sec.id === "MASTHEAD_BENTO") {
                    return (
                      <div key={sec.id} onClick={() => setActiveTab("bento")} className="cursor-pointer">
                        <MerchandisingMastheadAndBento
                          masthead={draft.masthead}
                          cards={draft.bentoCards}
                          updatedAt={draft.updatedAt}
                          compactPreview
                        />
                      </div>
                    );
                  }
                  if (sec.id === "OFFER_CAROUSEL") {
                    return (
                      <div
                        key={sec.id}
                        onClick={() => setActiveTab("offers_strips")}
                        className="cursor-pointer"
                      >
                        <MerchandisingOfferCarousel
                          strips={draft.offerStrips}
                          updatedAt={draft.updatedAt}
                          compactPreview
                        />
                      </div>
                    );
                  }
                  if (sec.id === "TOP_HERO_BANNER") {
                    return (
                      <div key={sec.id} onClick={() => setActiveTab("banners")} className="cursor-pointer">
                        <MerchandisingHeroBannerCarousel
                          banners={draft.heroBanners.filter((b) => b.placement === "TOP_HERO")}
                          updatedAt={draft.updatedAt}
                          compactPreview
                        />
                      </div>
                    );
                  }
                  if (sec.id === "PROMO_STRIPS") {
                    return (
                      <div
                        key={sec.id}
                        onClick={() => setActiveTab("offers_strips")}
                        className="cursor-pointer"
                      >
                        <MerchandisingPromoStrips
                          strips={draft.promoStrips}
                          updatedAt={draft.updatedAt}
                          compactPreview
                        />
                      </div>
                    );
                  }
                  if (sec.id === "CATEGORY_GRID") {
                    return (
                      <div key={sec.id} className="px-2.5 py-2">
                        <div className="text-[10px] font-black uppercase text-slate-500 mb-1.5">
                          16-Category Storefront Directory
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {categories.slice(0, 8).map((c) => (
                            <div
                              key={c.slug}
                              className="rounded-lg bg-white border border-slate-200 p-1.5 text-center"
                            >
                              <div className="text-[9px] font-bold text-slate-800 line-clamp-2 leading-tight">
                                {c.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (sec.id === "MID_PAGE_BANNER") {
                    return (
                      <div key={sec.id} onClick={() => setActiveTab("banners")} className="cursor-pointer">
                        <MerchandisingHeroBannerCarousel
                          banners={draft.heroBanners.filter((b) => b.placement === "MID_PAGE")}
                          updatedAt={draft.updatedAt}
                          compactPreview
                        />
                      </div>
                    );
                  }
                  return null;
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHomeBannersStudio;

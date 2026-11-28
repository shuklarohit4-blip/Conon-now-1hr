import React, { useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Settings,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Upload,
  CheckCircle2,
  Eye,
  EyeOff,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  useLiveStorefrontConfig,
  saveStorefrontConfig,
  uploadBannerImageFile,
  type HeroBannerRecord,
  type GlobalStoreSettings,
} from "@/services/liveStorefrontConfig";
import { useLiveCategoriesStore, resolveCategoryAssetUrl } from "@/services/liveCategoriesStore";

export function AdminStorefrontMerchandisingPanel({ isDark = true }: { isDark?: boolean }) {
  const { settings, allBanners, loading } = useLiveStorefrontConfig();
  const { categories } = useLiveCategoriesStore({ includeInactive: true });

  const [formSettings, setFormSettings] = useState<GlobalStoreSettings>(settings);
  const [banners, setBanners] = useState<HeroBannerRecord[]>(allBanners);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBannerId, setUploadingBannerId] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) {
      setFormSettings(settings);
      setBanners(allBanners);
    }
  }, [settings, allBanners, dirty]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const cardCls = isDark
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-sm";
  const inputCls = isDark
    ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500"
    : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400";

  const handleSaveAll = async () => {
    if (formSettings.freeDeliveryMinOrder < 0 || formSettings.deliveryFee < 0) {
      toast.error("Delivery fee and minimum free-delivery order cannot be negative");
      return;
    }
    setSaving(true);
    try {
      await saveStorefrontConfig({ settings: formSettings, banners });
      setDirty(false);
      toast.success("Storefront Settings & Banners synced live across all LAN devices!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save storefront settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddBanner = () => {
    setDirty(true);
    setBanners((prev) => [
      ...prev,
      {
        id: `banner_${Date.now()}`,
        title: "New Promotional Offer",
        subtitle: "Direct Factory Rates • 60-Min Express Dispatch",
        badge: "LIMITED OFFER",
        imageUrl: "/images/home-categories/cement-civil-works.webp",
        ctaLabel: "Shop Now",
        ctaRoute: "/categories",
        isActive: true,
        sortOrder: prev.length + 1,
      },
    ]);
  };

  const handleBannerFile = async (bannerId: string, file: File) => {
    setUploadingBannerId(bannerId);
    try {
      const url = await uploadBannerImageFile(file, bannerId);
      setDirty(true);
      setBanners((prev) =>
        prev.map((b) => (b.id === bannerId ? { ...b, imageUrl: url } : b))
      );
      toast.success("Uploaded banner image to /uploads/banners/");
    } catch (err: any) {
      toast.error(err?.message || "Banner upload failed");
    } finally {
      setUploadingBannerId(null);
    }
  };

  const moveBanner = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= banners.length) return;
    setDirty(true);
    const next = [...banners];
    const [moved] = next.splice(idx, 1);
    next.splice(target, 0, moved);
    setBanners(next.map((b, i) => ({ ...b, sortOrder: i + 1 })));
  };

  const removeBanner = (id: string) => {
    if (!window.confirm("Delete this promotional banner?")) return;
    setDirty(true);
    setBanners((prev) => prev.filter((b) => b.id !== id).map((b, i) => ({ ...b, sortOrder: i + 1 })));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${cardCls}`}>
        <div>
          <h2 className="text-lg font-black flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <span>Home Merchandising, Hero Banners &amp; Global Store Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Backed directly by DB/Disk JSON &amp; broadcasted via SSE (`SETTINGS_UPDATED` / `BANNERS_UPDATED`).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dirty && (
            <span className="px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-black">
              Unsaved Changes
            </span>
          )}
          <button
            type="button"
            disabled={saving || loading}
            onClick={() => void handleSaveAll()}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Publishing Live..." : "Publish All Changes Live"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Global Store Settings (Left 5 Cols) */}
        <div className={`xl:col-span-5 rounded-2xl border p-5 space-y-4 ${cardCls}`}>
          <h3 className="text-sm font-black flex items-center gap-2 pb-2 border-b border-slate-800">
            <Settings className="w-4 h-4 text-sky-400" />
            <span>Global Storefront Controls</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Store Brand Name</label>
                <input
                  type="text"
                  value={formSettings.storeName}
                  onChange={(e) => {
                    setDirty(true);
                    setFormSettings({ ...formSettings, storeName: e.target.value });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border ${inputCls}`}
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Delivery ETA Pill</label>
                <input
                  type="text"
                  value={formSettings.deliveryEtaText}
                  onChange={(e) => {
                    setDirty(true);
                    setFormSettings({ ...formSettings, deliveryEtaText: e.target.value });
                  }}
                  placeholder="60 Mins"
                  className={`w-full px-3 py-2 rounded-xl border ${inputCls}`}
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Brand Tagline</label>
              <input
                type="text"
                value={formSettings.tagline}
                onChange={(e) => {
                  setDirty(true);
                  setFormSettings({ ...formSettings, tagline: e.target.value });
                }}
                className={`w-full px-3 py-2 rounded-xl border ${inputCls}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Free Delivery Min (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={formSettings.freeDeliveryMinOrder}
                  onChange={(e) => {
                    setDirty(true);
                    setFormSettings({
                      ...formSettings,
                      freeDeliveryMinOrder: Number(e.target.value) || 0,
                    });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${inputCls}`}
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Standard Delivery Fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={formSettings.deliveryFee}
                  onChange={(e) => {
                    setDirty(true);
                    setFormSettings({ ...formSettings, deliveryFee: Number(e.target.value) || 0 });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${inputCls}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Assured Cashback %</label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  step={0.5}
                  value={formSettings.assuredCashbackPercent}
                  onChange={(e) => {
                    setDirty(true);
                    setFormSettings({
                      ...formSettings,
                      assuredCashbackPercent: Number(e.target.value) || 0,
                    });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${inputCls}`}
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Default GST Slab %</label>
                <select
                  value={formSettings.defaultGstPercent}
                  onChange={(e) => {
                    setDirty(true);
                    setFormSettings({
                      ...formSettings,
                      defaultGstPercent: Number(e.target.value),
                    });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border ${inputCls}`}
                >
                  {[5, 12, 18, 28].map((r) => (
                    <option key={r} value={r}>
                      {r}% GST
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Support Phone</label>
                <input
                  type="text"
                  value={formSettings.supportPhone}
                  onChange={(e) => {
                    setDirty(true);
                    setFormSettings({ ...formSettings, supportPhone: e.target.value });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${inputCls}`}
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">WhatsApp Desk</label>
                <input
                  type="text"
                  value={formSettings.supportWhatsapp}
                  onChange={(e) => {
                    setDirty(true);
                    setFormSettings({ ...formSettings, supportWhatsapp: e.target.value });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${inputCls}`}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formSettings.noticeStripEnabled}
                    onChange={(e) => {
                      setDirty(true);
                      setFormSettings({ ...formSettings, noticeStripEnabled: e.target.checked });
                    }}
                  />
                  <span>Top Storefront Notice Strip Active</span>
                </label>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    formSettings.noticeStripEnabled
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {formSettings.noticeStripEnabled ? "LIVE" : "OFF"}
                </span>
              </div>
              <textarea
                rows={2}
                value={formSettings.noticeStripText}
                onChange={(e) => {
                  setDirty(true);
                  setFormSettings({ ...formSettings, noticeStripText: e.target.value });
                }}
                placeholder="Announcement visible across customer Home & Categories..."
                className={`w-full px-3 py-2 rounded-xl border ${inputCls}`}
              />
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 cursor-pointer">
              <div>
                <div className="font-black text-rose-300">Maintenance / Emergency Dispatch Pause</div>
                <div className="text-[11px] text-rose-400/80">
                  Shows maintenance banner on storefront Home during scheduled maintenance.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formSettings.maintenanceMode}
                onChange={(e) => {
                  setDirty(true);
                  setFormSettings({ ...formSettings, maintenanceMode: e.target.checked });
                }}
                className="w-4 h-4 accent-rose-500"
              />
            </label>
          </div>
        </div>

        {/* Hero & Promotional Banners Manager (Right 7 Cols) */}
        <div className={`xl:col-span-7 rounded-2xl border p-5 space-y-4 ${cardCls}`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-black flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Hero &amp; Promotional Banners ({banners.length})</span>
            </h3>
            <button
              type="button"
              onClick={handleAddBanner}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-black flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Banner</span>
            </button>
          </div>

          <div className="space-y-4">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px] font-black">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDirty(true);
                        setBanners((prev) =>
                          prev.map((b) =>
                            b.id === banner.id ? { ...b, isActive: !b.isActive } : b
                          )
                        );
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 cursor-pointer ${
                        banner.isActive
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {banner.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {banner.isActive ? "Active" : "Hidden"}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveBanner(idx, -1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === banners.length - 1}
                      onClick={() => moveBanner(idx, 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBanner(banner.id)}
                      className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Banner Image Upload & Preview */}
                  <div className="space-y-2">
                    <div className="aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                      <img
                        src={resolveCategoryAssetUrl(banner.imageUrl, banner.updatedAt)}
                        alt={banner.title}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <label className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {uploadingBannerId === banner.id ? "Uploading..." : "Upload Banner (<=5MB)"}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void handleBannerFile(banner.id, f);
                        }}
                      />
                    </label>
                  </div>

                  {/* Banner Text + CTA */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-400 block mb-1">Banner Title</label>
                      <input
                        type="text"
                        value={banner.title}
                        onChange={(e) => {
                          setDirty(true);
                          setBanners((prev) =>
                            prev.map((b) =>
                              b.id === banner.id ? { ...b, title: e.target.value } : b
                            )
                          );
                        }}
                        className={`w-full px-3 py-1.5 rounded-xl border ${inputCls}`}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-400 block mb-1">Subtitle</label>
                      <input
                        type="text"
                        value={banner.subtitle}
                        onChange={(e) => {
                          setDirty(true);
                          setBanners((prev) =>
                            prev.map((b) =>
                              b.id === banner.id ? { ...b, subtitle: e.target.value } : b
                            )
                          );
                        }}
                        className={`w-full px-3 py-1.5 rounded-xl border ${inputCls}`}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-400 block mb-1">Badge Text</label>
                      <input
                        type="text"
                        value={banner.badge || ""}
                        onChange={(e) => {
                          setDirty(true);
                          setBanners((prev) =>
                            prev.map((b) =>
                              b.id === banner.id ? { ...b, badge: e.target.value } : b
                            )
                          );
                        }}
                        className={`w-full px-3 py-1.5 rounded-xl border ${inputCls}`}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-400 block mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={banner.ctaLabel}
                        onChange={(e) => {
                          setDirty(true);
                          setBanners((prev) =>
                            prev.map((b) =>
                              b.id === banner.id ? { ...b, ctaLabel: e.target.value } : b
                            )
                          );
                        }}
                        className={`w-full px-3 py-1.5 rounded-xl border ${inputCls}`}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-400 block mb-1 flex items-center gap-1">
                        <span>CTA Link / Target Category</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </label>
                      <select
                        value={banner.ctaRoute}
                        onChange={(e) => {
                          setDirty(true);
                          setBanners((prev) =>
                            prev.map((b) =>
                              b.id === banner.id ? { ...b, ctaRoute: e.target.value } : b
                            )
                          );
                        }}
                        className={`w-full px-3 py-1.5 rounded-xl border ${inputCls}`}
                      >
                        <option value="/categories">All Categories (/categories)</option>
                        <option value="/category/rmc-ready-mix-concrete">RMC Plant Direct</option>
                        <option value="/services">Skilled Services (18 Trades)</option>
                        <option value="/rentals">Heavy Machines on Rent</option>
                        <option value="/build">CONON-NOW Build Turnkey</option>
                        {categories.map((c) => (
                          <option key={c.slug} value={c.route || `/categories?cat=${c.slug}`}>
                            Category: {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  Inbox,
  Mic,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteAdminSynonym,
  fetchAdminSearchStudio,
  saveAdminSearchConfig,
  saveAdminSynonym,
  updateSourcingRequestStatus,
  type AdminSearchStudioData,
  type SearchStudioConfig,
  type SearchSynonymRule,
} from "@/services/liveSearchStore";
import { useLiveCategoriesStore } from "@/services/liveCategoriesStore";
import { subscribeSseSync } from "@/services/sseSyncClient";

type StudioSubTab = "config" | "synonyms" | "analytics";

export function AdminSearchStudio({ isDark = true }: { isDark?: boolean }) {
  const { categories } = useLiveCategoriesStore({ includeInactive: false });
  const [subTab, setSubTab] = useState<StudioSubTab>("config");
  const [days, setDays] = useState<7 | 30>(30);
  const [data, setData] = useState<AdminSearchStudioData | null>(null);
  const [configDraft, setConfigDraft] = useState<SearchStudioConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);

  // Add/Edit Synonym Form State
  const [synKeywords, setSynKeywords] = useState("");
  const [synMapsTo, setSynMapsTo] = useState("");
  const [synCategorySlug, setSynCategorySlug] = useState("");
  const [editingSynId, setEditingSynId] = useState<string | undefined>(undefined);
  const [savingSyn, setSavingSyn] = useState(false);

  // New Placeholder / Trending input state
  const [newPlaceholder, setNewPlaceholder] = useState("");
  const [newTrending, setNewTrending] = useState("");

  const loadData = useCallback(async (selectedDays = days) => {
    setLoading(true);
    try {
      const res = await fetchAdminSearchStudio(selectedDays);
      setData(res);
      setConfigDraft(res.config);
    } catch (err: any) {
      toast.error(err?.message || "Failed loading Search Studio");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void loadData(days);
  }, [days, loadData]);

  useEffect(() => {
    return subscribeSseSync((ev) => {
      if (ev.type === "SEARCH_UPDATED" || ev.type === "FORCE_SYNC") {
        void loadData(days);
      }
    });
  }, [days, loadData]);

  const cardBg = isDark
    ? "bg-[#0D1426] border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-xs";
  const subPanel = isDark
    ? "bg-[#070B14] border-slate-800 text-slate-200"
    : "bg-slate-50 border-slate-200 text-slate-900";
  const inputCls = isDark
    ? "bg-slate-900 border-slate-700 text-white focus:border-amber-400"
    : "bg-white border-slate-300 text-slate-900 focus:border-blue-600";

  const handleSaveConfig = async () => {
    if (!configDraft) return;
    setSavingConfig(true);
    try {
      const updated = await saveAdminSearchConfig(configDraft);
      setConfigDraft(updated);
      toast.success("Search Config saved & pushed LIVE via SSE!");
      await loadData(days);
    } catch (err: any) {
      toast.error(err?.message || "Failed saving Search Config");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveSynonym = async (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = synKeywords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!keywords.length || !synMapsTo.trim()) {
      toast.error("Enter comma-separated keywords and target term");
      return;
    }
    setSavingSyn(true);
    try {
      await saveAdminSynonym({
        id: editingSynId,
        keywords,
        mapsTo: synMapsTo.trim(),
        categorySlug: synCategorySlug,
        isActive: true,
      });
      toast.success(editingSynId ? "Synonym updated live!" : "Synonym added live!");
      setSynKeywords("");
      setSynMapsTo("");
      setSynCategorySlug("");
      setEditingSynId(undefined);
      await loadData(days);
    } catch (err: any) {
      toast.error(err?.message || "Failed saving synonym");
    } finally {
      setSavingSyn(false);
    }
  };

  const handleQuickAddSynonymFromZero = (missedTerm: string) => {
    setEditingSynId(undefined);
    setSynKeywords(missedTerm);
    setSynMapsTo("");
    setSubTab("synonyms");
    toast.info(`Loaded "${missedTerm}" into Synonym Mapper`);
  };

  const movePlaceholder = (idx: number, dir: -1 | 1) => {
    if (!configDraft) return;
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= configDraft.placeholders.length) return;
    const copy = [...configDraft.placeholders];
    const [picked] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, picked);
    setConfigDraft({ ...configDraft, placeholders: copy });
  };

  if (loading && !configDraft) {
    return (
      <div className={`rounded-3xl border p-8 text-center ${cardBg}`}>
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
        <p className="text-sm font-bold">Loading Search & Discovery Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 ${cardBg}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
              Hinglish + Fuzzy + Site Parchi Engine
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Live SSE Sync Active
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black mt-1">
            Search &amp; Discovery Studio
          </h2>
          <p className="text-xs opacity-70">
            Control rolling placeholders, trending pills, Hinglish synonym rules, missed-demand queries &amp; 60-min sourcing requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadData(days)}
            className="px-3 py-2 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            disabled={savingConfig}
            onClick={handleSaveConfig}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingConfig ? "Saving..." : "Save Config Live"}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className={`rounded-2xl border p-1.5 flex flex-wrap gap-1 ${cardBg}`}>
        {[
          { id: "config" as StudioSubTab, label: "1. Placeholders, Trending & Features", icon: Search },
          {
            id: "synonyms" as StudioSubTab,
            label: `2. Hinglish & Synonym Dictionary (${data?.synonyms.length || 0})`,
            icon: BookOpen,
          },
          {
            id: "analytics" as StudioSubTab,
            label: `3. Search Analytics & Sourcing Inbox (${data?.requests.filter((r) => r.status === "NEW").length || 0} New)`,
            icon: BarChart3,
          },
        ].map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                active
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SEARCH CONFIG MANAGER */}
      {subTab === "config" && configDraft && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Placeholders */}
          <div className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">Animated Search Bar Placeholders</h3>
              <span className="text-[11px] opacity-65">Slides every 2.5s</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newPlaceholder}
                onChange={(e) => setNewPlaceholder(e.target.value)}
                placeholder='e.g. Search "Birla Wall Putty 40 Kg"'
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
              />
              <button
                type="button"
                onClick={() => {
                  if (!newPlaceholder.trim()) return;
                  setConfigDraft({
                    ...configDraft,
                    placeholders: [...configDraft.placeholders, newPlaceholder.trim()],
                  });
                  setNewPlaceholder("");
                }}
                className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {configDraft.placeholders.map((ph, idx) => (
                <div
                  key={`${ph}-${idx}`}
                  className={`rounded-xl border px-3 py-2 flex items-center justify-between gap-2 ${subPanel}`}
                >
                  <span className="text-xs font-bold truncate">{ph}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => movePlaceholder(idx, -1)}
                      className="p-1 rounded bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePlaceholder(idx, 1)}
                      className="p-1 rounded bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfigDraft({
                          ...configDraft,
                          placeholders: configDraft.placeholders.filter((_, i) => i !== idx),
                        })
                      }
                      className="p-1 rounded bg-rose-500/20 text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Searches & Feature Toggles */}
          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
              <h3 className="text-sm font-black">Search Feature Controls</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setConfigDraft({
                      ...configDraft,
                      voiceSearchEnabled: !configDraft.voiceSearchEnabled,
                    })
                  }
                  className={`rounded-xl border p-3 text-left flex items-center justify-between cursor-pointer ${subPanel}`}
                >
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black">Voice Search Mic</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      configDraft.voiceSearchEnabled
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-700 text-white"
                    }`}
                  >
                    {configDraft.voiceSearchEnabled ? "ON" : "OFF"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setConfigDraft({
                      ...configDraft,
                      siteParchiEnabled: !configDraft.siteParchiEnabled,
                    })
                  }
                  className={`rounded-xl border p-3 text-left flex items-center justify-between cursor-pointer ${subPanel}`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black">Site Parchi Mode</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      configDraft.siteParchiEnabled
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-700 text-white"
                    }`}
                  >
                    {configDraft.siteParchiEnabled ? "ON" : "OFF"}
                  </span>
                </button>
              </div>
            </div>

            <div className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
              <h3 className="text-sm font-black">Trending Search Chips</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTrending}
                  onChange={(e) => setNewTrending(e.target.value)}
                  placeholder="Add trending chip (e.g. UltraTech Weather Plus)"
                  className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newTrending.trim()) return;
                    setConfigDraft({
                      ...configDraft,
                      trendingSearches: [...configDraft.trendingSearches, newTrending.trim()],
                    });
                    setNewTrending("");
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {configDraft.trendingSearches.map((chip, idx) => (
                  <span
                    key={`${chip}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold"
                  >
                    <span>{chip}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfigDraft({
                          ...configDraft,
                          trendingSearches: configDraft.trendingSearches.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-rose-400 hover:text-rose-300 cursor-pointer font-black"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stage Shortcuts */}
          <div className={`lg:col-span-2 rounded-2xl border p-4 space-y-3 ${cardBg}`}>
            <h3 className="text-sm font-black">Construction Stage Discovery Shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {configDraft.stageShortcuts.map((st, idx) => (
                <div key={st.id} className={`rounded-xl border p-3 space-y-2 ${subPanel}`}>
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => {
                        const copy = [...configDraft.stageShortcuts];
                        copy[idx] = { ...st, label: e.target.value };
                        setConfigDraft({ ...configDraft, stageShortcuts: copy });
                      }}
                      className={`flex-1 rounded-lg border px-2 py-1 text-xs font-black outline-none ${inputCls}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...configDraft.stageShortcuts];
                        copy[idx] = { ...st, isActive: !st.isActive };
                        setConfigDraft({ ...configDraft, stageShortcuts: copy });
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer ${
                        st.isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-white"
                      }`}
                    >
                      {st.isActive ? "Active" : "Off"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={st.description}
                    onChange={(e) => {
                      const copy = [...configDraft.stageShortcuts];
                      copy[idx] = { ...st, description: e.target.value };
                      setConfigDraft({ ...configDraft, stageShortcuts: copy });
                    }}
                    className={`w-full rounded-lg border px-2 py-1 text-[11px] font-medium outline-none ${inputCls}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HINGLISH & SYNONYM DICTIONARY */}
      {subTab === "synonyms" && (
        <div className="space-y-4">
          <form onSubmit={handleSaveSynonym} className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
            <h3 className="text-sm font-black">
              {editingSynId ? "Edit Synonym Mapping" : "Add New Hinglish / Local Lucknow Synonym"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold opacity-75 block mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={synKeywords}
                  onChange={(e) => setSynKeywords(e.target.value)}
                  placeholder="e.g. sariya, loha, rod"
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold opacity-75 block mb-1">
                  Maps To (Canonical Label)
                </label>
                <input
                  type="text"
                  required
                  value={synMapsTo}
                  onChange={(e) => setSynMapsTo(e.target.value)}
                  placeholder="e.g. TMT Bars / Steel"
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold opacity-75 block mb-1">
                  Boost Category (Optional)
                </label>
                <select
                  value={synCategorySlug}
                  onChange={(e) => setSynCategorySlug(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-bold outline-none ${inputCls}`}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={savingSyn}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
              >
                {savingSyn ? "Saving..." : editingSynId ? "Update Synonym Live" : "Save & Push Synonym Live"}
              </button>
              {editingSynId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSynId(undefined);
                    setSynKeywords("");
                    setSynMapsTo("");
                    setSynCategorySlug("");
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className={`rounded-2xl border p-4 space-y-2.5 ${cardBg}`}>
            <h3 className="text-sm font-black">Active Construction Synonym Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {(data?.synonyms || []).map((rule: SearchSynonymRule) => (
                <div
                  key={rule.id}
                  className={`rounded-xl border p-3 flex items-start justify-between gap-2 ${subPanel}`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="text-xs font-black text-amber-400">{rule.mapsTo}</div>
                    <div className="flex flex-wrap gap-1">
                      {rule.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[10.5px] font-semibold border border-slate-700"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                    {rule.categorySlug && (
                      <div className="text-[10px] font-mono opacity-60">
                        Category: {rule.categorySlug}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSynId(rule.id);
                        setSynKeywords(rule.keywords.join(", "));
                        setSynMapsTo(rule.mapsTo);
                        setSynCategorySlug(rule.categorySlug || "");
                      }}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-[10.5px] font-bold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteAdminSynonym(rule.id);
                        toast.success("Synonym removed");
                        await loadData(days);
                      }}
                      className="p-1.5 rounded bg-rose-500/20 text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SEARCH ANALYTICS & SOURCING INBOX */}
      {subTab === "analytics" && data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold opacity-75">
              Total Logged Searches ({days}d):{" "}
              <span className="font-black text-amber-400">{data.analytics.totalSearches}</span>
            </div>
            <div className="inline-flex rounded-xl border border-slate-700 overflow-hidden">
              {([7, 30] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 text-xs font-black cursor-pointer ${
                    days === d ? "bg-amber-400 text-slate-950" : "bg-slate-900 text-slate-300"
                  }`}
                >
                  Last {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Searched Terms */}
            <div className={`rounded-2xl border p-4 space-y-2.5 ${cardBg}`}>
              <h3 className="text-sm font-black">Top Searched Terms</h3>
              {data.analytics.topSearches.length === 0 ? (
                <p className="text-xs opacity-60">No searches recorded yet.</p>
              ) : (
                <div className="divide-y divide-slate-800/40">
                  {data.analytics.topSearches.map((t) => (
                    <div key={t.query} className="py-2 flex items-center justify-between text-xs">
                      <span className="font-bold">{t.query}</span>
                      <div className="flex items-center gap-3">
                        <span className="opacity-65">~{t.avgResults} results</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 font-black">
                          {t.count}×
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Zero-Result Missed Demand */}
            <div className={`rounded-2xl border p-4 space-y-2.5 ${cardBg}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-black">Zero-Result Missed Demand</h3>
              </div>
              {data.analytics.zeroResultQueries.length === 0 ? (
                <p className="text-xs opacity-60">Zero-result misses are empty — all searches matched!</p>
              ) : (
                <div className="divide-y divide-slate-800/40">
                  {data.analytics.zeroResultQueries.map((z) => (
                    <div key={z.query} className="py-2 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-rose-300">{z.query}</span>
                        <span className="ml-2 text-[10.5px] opacity-60">({z.count} misses)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickAddSynonymFromZero(z.query)}
                        className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[10.5px] font-black cursor-pointer"
                      >
                        + Teach Synonym
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Customer 60-Min Sourcing Requests Inbox */}
          <div className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black">
                Customer Material Requests Inbox ({data.requests.length})
              </h3>
            </div>
            {data.requests.length === 0 ? (
              <p className="text-xs opacity-60">No 60-Min sourcing requests submitted yet.</p>
            ) : (
              <div className="space-y-2">
                {data.requests.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-xl border p-3 flex flex-wrap items-center justify-between gap-3 ${subPanel}`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-black">{r.itemName}</div>
                      <div className="text-[11px] opacity-75">
                        Qty: <strong>{r.quantityText}</strong> · Phone: <strong>{r.phone || "N/A"}</strong> · PIN: {r.pincode || "Lucknow"}
                      </div>
                    </div>
                    <select
                      value={r.status}
                      onChange={async (e) => {
                        const next = e.target.value as any;
                        await updateSourcingRequestStatus(r.id, next);
                        toast.success(`Updated request status to ${next}`);
                        await loadData(days);
                      }}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-black outline-none ${inputCls}`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="ADDED_TO_CATALOG">ADDED_TO_CATALOG</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSearchStudio;

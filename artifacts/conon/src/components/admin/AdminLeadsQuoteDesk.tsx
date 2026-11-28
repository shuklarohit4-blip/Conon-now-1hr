import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  UploadCloud,
  X,
  ZoomIn,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminHeaders, resolveApiUrl } from "@/lib/apiBase";
import { useSafeFourPanelRelay } from "@/context/FourPanelRelayContext";
import { AdminTurnkeyBuildPanel } from "@/components/admin/AdminTurnkeyBuildPanel";
import { appendAdminAuditLog } from "@/services/adminAuditLog";

interface SolarLeadRecord {
  id: string;
  name: string;
  phone: string;
  locality: string;
  mvvnlAccount?: string;
  recommendedKw?: number;
  subsidyAmount?: number;
  systemType?: string;
  structureType?: string;
  monthlyBill?: number;
  status: "New" | "Survey Scheduled" | "MVVNL Applied" | "Installed";
  createdAt: string;
}

interface ParchaLeadRecord {
  referenceId: string;
  phone: string;
  locality: string;
  notes?: string;
  fileName: string;
  fileType: string;
  previewUrl?: string;
  status: "New" | "Quoted" | "Converted to Order";
  submittedAt: string;
}

interface BuilderBackendLead {
  id: string;
  name: string;
  phone: string;
  lucknowZone: string;
  builtUpSqFt: number;
  qualityTier: string;
  wallType: string;
  floors: number;
  grandTotal: number;
  notes?: string;
  status: string;
  createdAt: string;
  boqSummary?: any;
}

const SOLAR_STATUSES: SolarLeadRecord["status"][] = [
  "New",
  "Survey Scheduled",
  "MVVNL Applied",
  "Installed",
];

const PARCHA_STATUS_KEY = "conon_parcha_leads";
const SOLAR_STATUS_KEY = "conon_solar_leads";

export function AdminLeadsQuoteDesk({ isDark = false }: { isDark?: boolean }) {
  const relay = useSafeFourPanelRelay();
  const [subTab, setSubTab] = useState<"SOLAR" | "PARCHA" | "TURNKEY">("SOLAR");
  const [search, setSearch] = useState("");
  const [solarLeads, setSolarLeads] = useState<SolarLeadRecord[]>([]);
  const [parchaLeads, setParchaLeads] = useState<ParchaLeadRecord[]>([]);
  const [backendLeads, setBackendLeads] = useState<BuilderBackendLead[]>([]);
  const [loading, setLoading] = useState(false);

  // Image Zoom Viewer & Quote-to-Order Modal
  const [zoomParcha, setZoomParcha] = useState<ParchaLeadRecord | null>(null);
  const [quoteModalLead, setQuoteModalLead] = useState<ParchaLeadRecord | null>(null);
  const [quoteItemsText, setQuoteItemsText] = useState("UltraTech Cement 20 Bags + Havells 1.5 sq.mm Coil x2");
  const [quoteAmount, setQuoteAmount] = useState(11200);

  const loadAllLeads = async () => {
    setLoading(true);
    try {
      // 1. Read Solar leads from localStorage
      const localSolarRaw = localStorage.getItem(SOLAR_STATUS_KEY);
      const localSolar: any[] = localSolarRaw ? JSON.parse(localSolarRaw) : [];

      // 2. Read Parcha leads from localStorage
      const localParchaRaw = localStorage.getItem(PARCHA_STATUS_KEY);
      const localParcha: any[] = localParchaRaw ? JSON.parse(localParchaRaw) : [];

      // 3. Fetch backend /api/admin/leads
      let apiLeads: BuilderBackendLead[] = [];
      try {
        const res = await fetch(resolveApiUrl("/api/admin/leads"), {
          cache: "no-store",
          headers: getAdminHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.leads)) apiLeads = data.leads;
        }
      } catch {
        // Offline / fallback cleanly
      }
      setBackendLeads(apiLeads);

      // Merge backend + localStorage Solar leads cleanly
      const solarFromApi: SolarLeadRecord[] = apiLeads
        .filter((l) => l.boqSummary?.source === "SOLAR_SUBSIDY" || l.boqSummary?.estimatedSubsidy || /solar|mvvnl/i.test(l.notes || ""))
        .map((l) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          locality: l.lucknowZone,
          mvvnlAccount: l.boqSummary?.mvvnlAccount || l.boqSummary?.consumerNo || "MVVNL-LKO",
          recommendedKw: Number(l.boqSummary?.recommendedKw || 3),
          subsidyAmount: Number(l.boqSummary?.estimatedSubsidy || l.boqSummary?.subsidyAmount || 108000),
          systemType: l.boqSummary?.systemType || "On-Grid",
          structureType: l.boqSummary?.structureType || "Standard Low-Rise",
          monthlyBill: Number(l.boqSummary?.monthlyBill || 3500),
          status: (l.boqSummary?.pipelineStatus as SolarLeadRecord["status"]) || "New",
          createdAt: l.createdAt,
        }));

      const normalizedLocalSolar: SolarLeadRecord[] = (Array.isArray(localSolar) ? localSolar : []).map((s, idx) => ({
        id: String(s.id || `sol-local-${idx}`),
        name: String(s.name || "Lucknow Solar Homeowner"),
        phone: String(s.phone || s.whatsapp || ""),
        locality: String(s.locality || s.lucknowZone || "Gomti Nagar"),
        mvvnlAccount: s.mvvnlAccount || s.consumerAccount || "UPPCL-MVVNL",
        recommendedKw: Number(s.recommendedKw || s.systemKw || 3),
        subsidyAmount: Number(s.estimatedSubsidy || s.subsidyTotal || s.subsidyAmount || 108000),
        systemType: s.systemType || "On-Grid (Max Saving)",
        structureType: s.structureType || "Standard Low-Rise",
        monthlyBill: Number(s.monthlyBill || 3500),
        status: (s.status as SolarLeadRecord["status"]) || "New",
        createdAt: s.createdAt || new Date().toISOString(),
      }));

      const solarSeen = new Set<string>();
      const combinedSolar: SolarLeadRecord[] = [];
      for (const s of [...normalizedLocalSolar, ...solarFromApi]) {
        const key = `${s.phone}-${s.locality}-${s.createdAt?.slice(0, 13)}`;
        if (!solarSeen.has(key)) {
          solarSeen.add(key);
          combinedSolar.push(s);
        }
      }
      setSolarLeads(combinedSolar);

      // Merge backend + localStorage Parcha leads
      const parchaFromApi: ParchaLeadRecord[] = apiLeads
        .filter((l) => l.boqSummary?.source === "PARCHA_UPLOAD")
        .map((l) => ({
          referenceId: l.boqSummary?.referenceId || l.id,
          phone: l.phone,
          locality: l.lucknowZone,
          notes: l.notes,
          fileName: l.boqSummary?.fileName || "Parcha / BOQ Upload",
          fileType: l.boqSummary?.fileType || "image/jpeg",
          previewUrl: l.boqSummary?.previewUrl,
          status: (l.boqSummary?.pipelineStatus as ParchaLeadRecord["status"]) || "New",
          submittedAt: l.createdAt,
        }));

      const normalizedLocalParcha: ParchaLeadRecord[] = (Array.isArray(localParcha) ? localParcha : []).map((p, idx) => ({
        referenceId: String(p.referenceId || `CON-BOQ-${idx + 1}`),
        phone: String(p.phone || ""),
        locality: String(p.locality || "Gomti Nagar"),
        notes: p.notes || "",
        fileName: String(p.fileName || "Handwritten Parcha"),
        fileType: String(p.fileType || "image/jpeg"),
        previewUrl: p.previewUrl,
        status: p.status || "New",
        submittedAt: p.submittedAt || new Date().toISOString(),
      }));

      const parchaSeen = new Set<string>();
      const combinedParcha: ParchaLeadRecord[] = [];
      for (const p of [...normalizedLocalParcha, ...parchaFromApi]) {
        if (!parchaSeen.has(p.referenceId)) {
          parchaSeen.add(p.referenceId);
          combinedParcha.push(p);
        }
      }
      setParchaLeads(combinedParcha);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAllLeads();
    const onStorage = () => void loadAllLeads();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleUpdateSolarStatus = (leadId: string, nextStatus: SolarLeadRecord["status"]) => {
    setSolarLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l));
      try {
        localStorage.setItem(SOLAR_STATUS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    appendAdminAuditLog({
      category: "LEAD_UPDATE",
      action: `Solar Lead -> ${nextStatus}`,
      target: leadId,
      details: `Updated MVVNL Solar subsidy status pipeline to "${nextStatus}"`,
    });
    toast.success(`Solar lead marked as ${nextStatus}`);
  };

  const handleConvertParchaToOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteModalLead) return;
    const total = Math.max(100, Number(quoteAmount) || 0);
    if (relay?.placeCustomerRelayOrder) {
      relay.placeCustomerRelayOrder({
        customerName: `Parcha Buyer (${quoteModalLead.phone})`,
        customerPhone: `+91 ${quoteModalLead.phone}`,
        siteName: `${quoteModalLead.locality} (Parcha ${quoteModalLead.referenceId})`,
        siteAddress: `${quoteModalLead.locality}, Lucknow`,
        items: [{ name: quoteItemsText.trim() || "Verified Parcha BOQ Materials", quantity: 1, unit: "lot", category: "cement" }],
        totalAmount: total,
      });
    }
    setParchaLeads((prev) => {
      const updated = prev.map((p) =>
        p.referenceId === quoteModalLead.referenceId ? { ...p, status: "Converted to Order" as const } : p
      );
      try {
        localStorage.setItem(PARCHA_STATUS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    appendAdminAuditLog({
      category: "ORDER_DISPATCH",
      action: "Converted Parcha Lead -> Live Order",
      target: quoteModalLead.referenceId,
      details: `${quoteItemsText} (₹${total.toLocaleString("en-IN")}) for +91 ${quoteModalLead.phone}`,
    });
    toast.success(`Converted ${quoteModalLead.referenceId} into a Live 4-Panel Order!`, {
      description: `Dispatched ₹${total.toLocaleString("en-IN")} to Vendor Hub & Dispatch Radar.`,
    });
    setQuoteModalLead(null);
  };

  const q = search.trim().toLowerCase();
  const filteredSolar = useMemo(
    () =>
      solarLeads.filter(
        (l) => !q || `${l.name} ${l.phone} ${l.locality} ${l.mvvnlAccount || ""}`.toLowerCase().includes(q)
      ),
    [solarLeads, q]
  );
  const filteredParcha = useMemo(
    () =>
      parchaLeads.filter(
        (p) => !q || `${p.referenceId} ${p.phone} ${p.locality} ${p.fileName}`.toLowerCase().includes(q)
      ),
    [parchaLeads, q]
  );
  const filteredBuilderLeads = useMemo(
    () =>
      backendLeads.filter(
        (b) =>
          b.boqSummary?.source !== "PARCHA_UPLOAD" &&
          b.boqSummary?.source !== "SOLAR_SUBSIDY" &&
          (!q || `${b.name} ${b.phone} ${b.lucknowZone}`.toLowerCase().includes(q))
      ),
    [backendLeads, q]
  );

  const cardBg = isDark
    ? "bg-[#0F172A] border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-xs";

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header + Search + Refresh */}
      <div className={`rounded-3xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}>
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
            Phase 3 Leads &amp; Quote Desk
          </span>
          <h2 className="text-lg font-black mt-1.5">
            Solar MVVNL, Mistri Parcha &amp; Turnkey Requests
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every Customer submission syncs live across Local Storage &amp; Backend Admin Inbox
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone, locality, ref..."
              className={`pl-8 pr-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-200 text-slate-900"
              }`}
            />
          </div>
          <button
            type="button"
            onClick={() => void loadAllLeads()}
            className="px-3 py-2 rounded-xl bg-[#12357A] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Leads
          </button>
        </div>
      </div>

      {/* 3 Sub-Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "SOLAR" as const, label: `☀️ Solar & MVVNL Subsidy (${solarLeads.length})`, icon: Sun },
          { id: "PARCHA" as const, label: `📸 Mistri Parcha / BOQ (${parchaLeads.length})`, icon: UploadCloud },
          { id: "TURNKEY" as const, label: `🏠 Turnkey & Builder Kit (${filteredBuilderLeads.length})`, icon: Building2 },
        ].map((t) => {
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-black border transition cursor-pointer ${
                active
                  ? "bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                  : isDark
                  ? "bg-slate-900 border-slate-800 text-slate-300"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB A: Solar & MVVNL Subsidy Leads */}
      {subTab === "SOLAR" && (
        <div className="space-y-3">
          {filteredSolar.length === 0 ? (
            <div className={`rounded-3xl border p-8 text-center text-xs ${cardBg}`}>
              <Sun className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="font-bold">No Solar MVVNL subsidy leads yet.</p>
              <p className="text-slate-500 mt-1">
                Submit a Shadow Survey request from Solar &amp; Rooftop Power → SolarSubsidyModal to see it live here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredSolar.map((lead) => (
                <div key={lead.id} className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300">
                        {lead.recommendedKw || 3} kW • {lead.systemType}
                      </span>
                      <h3 className="text-sm font-black mt-1">{lead.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lead.locality} • +91 {lead.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block">UP Double Subsidy</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ₹{Number(lead.subsidyAmount || 108000).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block">MVVNL Consumer:</span>
                      <strong className="font-mono">{lead.mvvnlAccount || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Structure / Bill:</span>
                      <strong>{lead.structureType} • ₹{lead.monthlyBill}/mo</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <select
                      value={lead.status}
                      onChange={(e) => handleUpdateSolarStatus(lead.id, e.target.value as SolarLeadRecord["status"])}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold ${
                        isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      {SOLAR_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          Pipeline: {st}
                        </option>
                      ))}
                    </select>

                    <a
                      href={`https://wa.me/91${lead.phone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                        `Namaste ${lead.name}! Conon Solar Desk Lucknow here regarding your ${lead.recommendedKw || 3}kW rooftop solar MVVNL subsidy (₹1,08,000) survey in ${lead.locality}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Reply
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB B: Mistri Parcha / BOQ Uploads */}
      {subTab === "PARCHA" && (
        <div className="space-y-3">
          {filteredParcha.length === 0 ? (
            <div className={`rounded-3xl border p-8 text-center text-xs ${cardBg}`}>
              <UploadCloud className="w-8 h-8 text-sky-500 mx-auto mb-2" />
              <p className="font-bold">No Mistri Parcha / BOQ uploads yet.</p>
              <p className="text-slate-500 mt-1">
                Submit via Homepage → &ldquo;📸 Upload Parcha / BOQ&rdquo; to manage and convert into live orders.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredParcha.map((p) => (
                <div key={p.referenceId} className={`rounded-2xl border p-4 space-y-3 ${cardBg}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-sky-300">
                        {p.referenceId}
                      </span>
                      <h3 className="text-sm font-black mt-1">+91 {p.phone} • {p.locality}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {p.fileName}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        p.status === "Converted to Order"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-400/20 text-amber-600 dark:text-amber-300"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  {p.notes && (
                    <p className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                      {p.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setZoomParcha(p)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" /> Inspect File / Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setQuoteModalLead(p);
                        setQuoteItemsText(p.notes || `Parcha Items (${p.fileName})`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Build Quote &amp; Convert to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB C: Turnkey & Builder Kit Requests */}
      {subTab === "TURNKEY" && (
        <div className="space-y-5">
          {filteredBuilderLeads.length > 0 && (
            <div className={`rounded-2xl border p-4 space-y-2.5 ${cardBg}`}>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Builder Kit BOQ Submissions ({filteredBuilderLeads.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredBuilderLeads.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-black">{b.name} • +91 {b.phone}</p>
                      <p className="text-slate-500 text-[11px]">
                        {b.lucknowZone} • {b.builtUpSqFt} sq.ft • {b.qualityTier}
                      </p>
                    </div>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                      ₹{Number(b.grandTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <AdminTurnkeyBuildPanel isDark={isDark} />
        </div>
      )}

      {/* File Zoom Modal */}
      {zoomParcha && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
          onClick={() => setZoomParcha(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black">{zoomParcha.referenceId} — {zoomParcha.fileName}</h4>
              <button type="button" onClick={() => setZoomParcha(null)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            {zoomParcha.previewUrl ? (
              <img src={zoomParcha.previewUrl} alt={zoomParcha.fileName} className="w-full max-h-80 object-contain rounded-2xl border" />
            ) : (
              <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center text-xs space-y-1">
                <FileText className="w-8 h-8 mx-auto text-[#12357A] dark:text-amber-400" />
                <p className="font-bold">{zoomParcha.fileName}</p>
                <p className="text-slate-500">{zoomParcha.notes || "Parcha / PDF uploaded via Homepage Desk"}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1-Click Build Quote & Convert to Order Modal */}
      {quoteModalLead && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
          onClick={() => setQuoteModalLead(null)}
        >
          <form
            onSubmit={handleConvertParchaToOrder}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-emerald-500" />
                Convert {quoteModalLead.referenceId} → Live Order
              </h4>
              <button type="button" onClick={() => setQuoteModalLead(null)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold block mb-1">Verified Itemized Quote</label>
              <textarea
                rows={3}
                required
                value={quoteItemsText}
                onChange={(e) => setQuoteItemsText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold block mb-1">Total Quoted Order Value (₹)</label>
              <input
                type="number"
                required
                min={100}
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm font-black"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Dispatch Live 4-Panel Order →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

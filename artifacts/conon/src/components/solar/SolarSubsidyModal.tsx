import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Sun,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Calculator,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Info,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { SOLAR_PRODUCTS, type SolarProduct } from "@/data/solarCatalog";
import { apiUrl } from "@/lib/apiBase";

export type SolarPropertyType = "RESIDENTIAL" | "COMMERCIAL";
export type SolarSystemChoice = "ON_GRID" | "HYBRID";
export type SolarStructureChoice = "STANDARD" | "ELEVATED_8FT";
export type SolarRoofType = "RCC Slab" | "PEB / Tin Shed" | "Under Construction";

export const LUCKNOW_SOLAR_LOCALITIES = [
  "Gomti Nagar / Ext",
  "Sushant Golf City",
  "Aliganj / Jankipuram",
  "Vrindavan Yojna / Kanpur Rd",
  "Indira Nagar / Ayodhya Rd",
  "Barabanki / Outer Ring",
  "Other",
] as const;

export const LUCKNOW_PROTECTION_ADDONS = [
  {
    id: "monkey-proof-uv-conduit-shield",
    label: "🐒 Monkey-Proof Cable Shield",
    price: 2499,
  },
  {
    id: "monsoon-epdm-chemical-anchor-kit",
    label: "🌧️ Monsoon Zero-Leakage Chemical Anchor Kit",
    price: 1999,
  },
  {
    id: "solar-auto-wash-sprinkler-kit",
    label: "🧹 Auto-Wash Dust Sprinkler Kit",
    price: 2999,
  },
] as const;

export const SOLAR_LEADS_STORAGE_KEY = "conon_solar_leads";
const PRACTICAL_KW_SIZES = [1, 2, 3, 4, 5, 6, 8, 10] as const;

export interface SolarSubsidyCalculation {
  recommendedKw: number;
  panelsNeeded: number;
  roofAreaSqft: number;
  grossCost: number;
  addonsTotal: number;
  centralSubsidy: number;
  upnedaSubsidy: number;
  totalSubsidy: number;
  netCost: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: string;
  lifetimeSavings25Yr: number;
  matchedKit: SolarProduct;
}

export function computeLucknowSolarEstimate(params: {
  monthlyBill: number;
  propertyType: SolarPropertyType;
  systemType: SolarSystemChoice;
  structureType: SolarStructureChoice;
  addonsTotal?: number;
}): SolarSubsidyCalculation {
  const { monthlyBill, propertyType, systemType, structureType, addonsTotal = 0 } = params;
  const rawKw = Math.max(1, Math.min(10, Math.round(monthlyBill / 850)));
  const recommendedKw = PRACTICAL_KW_SIZES.reduce((best, candidate) =>
    Math.abs(candidate - rawKw) < Math.abs(best - rawKw) ? candidate : best,
  );

  const panelsNeeded = Math.ceil((recommendedKw * 1000) / 550);
  const roofAreaSqft = recommendedKw * 95;

  const basePerKw = systemType === "HYBRID" ? 88000 : 62000;
  const structurePerKw = structureType === "ELEVATED_8FT" ? 8500 : 0;
  const rawGross = recommendedKw * (basePerKw + structurePerKw);
  const bulkDiscountRate = recommendedKw >= 10 ? 0.07 : recommendedKw >= 5 ? 0.04 : 0;
  const grossCost = Math.round(rawGross * (1 - bulkDiscountRate)) + addonsTotal;

  let centralSubsidy = 0;
  let upnedaSubsidy = 0;
  if (propertyType === "RESIDENTIAL") {
    if (recommendedKw === 1) centralSubsidy = 30000;
    else if (recommendedKw === 2) centralSubsidy = 60000;
    else if (recommendedKw >= 3) centralSubsidy = 78000;

    upnedaSubsidy = recommendedKw === 1 ? 15000 : 30000;
  }

  const totalSubsidy = centralSubsidy + upnedaSubsidy;
  const netCost = Math.max(0, grossCost - totalSubsidy);

  const monthlySavings = Math.round(recommendedKw * 1200);
  const annualSavings = monthlySavings * 12;
  const paybackYears = annualSavings > 0 ? (netCost / annualSavings).toFixed(1) : "2.4";
  const lifetimeSavings25Yr = annualSavings * 25;

  let kitId = "conon-3kw-ongrid-topcon-dcr-kit";
  if (propertyType === "COMMERCIAL" && recommendedKw >= 8) {
    kitId = "conon-10kw-commercial-lawn-nondcr-kit";
  } else if (systemType === "HYBRID") {
    kitId = "utl-5kw-hybrid-topcon-lifepo4-kit";
  } else if (recommendedKw === 1) {
    kitId = "conon-1kw-ongrid-dcr-starter-kit";
  } else if (recommendedKw === 2) {
    kitId = "conon-2kw-ongrid-dcr-kit";
  } else if (recommendedKw >= 5) {
    kitId = "conon-5kw-ongrid-topcon-dcr-kit";
  }
  const matchedKit = SOLAR_PRODUCTS.find((p) => p.id === kitId) || SOLAR_PRODUCTS[10];

  return {
    recommendedKw,
    panelsNeeded,
    roofAreaSqft,
    grossCost,
    addonsTotal,
    centralSubsidy,
    upnedaSubsidy,
    totalSubsidy,
    netCost,
    monthlySavings,
    annualSavings,
    paybackYears,
    lifetimeSavings25Yr,
    matchedKit,
  };
}

export interface SavedSolarLead {
  referenceId: string;
  name: string;
  phone: string;
  locality: string;
  mvvnlAccount?: string;
  roofType: SolarRoofType;
  recommendedKw: number;
  sanctionedLoadKw: number;
  systemType: SolarSystemChoice;
  structureType: SolarStructureChoice;
  propertyType: SolarPropertyType;
  estimatedSubsidy: number;
  netCost: number;
  selectedAddonIds: string[];
  createdAt: string;
}

export interface SolarSubsidyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMatchedKit: (kitProduct: SolarProduct, addonProducts?: SolarProduct[]) => void;
  initialMonthlyBill?: number;
  initialTab?: "CALCULATOR" | "LEAD_FORM";
}

export function SolarSubsidyModal({
  isOpen,
  onClose,
  onAddMatchedKit,
  initialMonthlyBill = 3500,
  initialTab = "CALCULATOR",
}: SolarSubsidyModalProps) {
  const [activeTab, setActiveTab] = useState<"CALCULATOR" | "LEAD_FORM">(initialTab);
  const [monthlyBill, setMonthlyBill] = useState<number>(initialMonthlyBill);
  const [propertyType, setPropertyType] = useState<SolarPropertyType>("RESIDENTIAL");
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState<number>(3);
  const [userRoofAreaSqft, setUserRoofAreaSqft] = useState<number>(500);
  const [systemType, setSystemType] = useState<SolarSystemChoice>("ON_GRID");
  const [structureType, setStructureType] = useState<SolarStructureChoice>("STANDARD");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Tab 2 Lead Form State
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [locality, setLocality] = useState<string>(LUCKNOW_SOLAR_LOCALITIES[0]);
  const [mvvnlAccount, setMvvnlAccount] = useState<string>("");
  const [roofType, setRoofType] = useState<SolarRoofType>("RCC Slab");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedLead, setSubmittedLead] = useState<SavedSolarLead | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMonthlyBill(initialMonthlyBill);
      setActiveTab(initialTab);
      setFormError(null);
      setSubmittedLead(null);
    }
  }, [isOpen, initialMonthlyBill, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const addonsTotal = useMemo(
    () =>
      selectedAddonIds.reduce((sum, id) => {
        const hit = LUCKNOW_PROTECTION_ADDONS.find((a) => a.id === id);
        return sum + (hit?.price || 0);
      }, 0),
    [selectedAddonIds],
  );

  const calc = useMemo(
    () =>
      computeLucknowSolarEstimate({
        monthlyBill,
        propertyType,
        systemType,
        structureType,
        addonsTotal,
      }),
    [monthlyBill, propertyType, systemType, structureType, addonsTotal],
  );

  const freeTerraceSqft =
    structureType === "ELEVATED_8FT"
      ? userRoofAreaSqft
      : Math.max(0, userRoofAreaSqft - calc.roofAreaSqft);
  const coveragePct = Math.min(100, Math.round((calc.roofAreaSqft / Math.max(100, userRoofAreaSqft)) * 100));

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (!isOpen) return null;

  const systemLabel = systemType === "HYBRID" ? "Hybrid (LiFePO4)" : "On-Grid TOPCon DCR";
  const structureLabel = structureType === "ELEVATED_8FT" ? "8ft Elevated Walkable Terrace" : "Low-Rise HDGI";

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = fullName.trim();
    const cleanPhone = phone.replace(/\D/g, "");
    if (!trimmedName) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError("Please enter a valid 10-digit Indian mobile / WhatsApp number.");
      return;
    }

    setSubmitting(true);
    const refId = `CON-SOL-${Math.floor(1000 + Math.random() * 9000)}`;
    const leadRecord: SavedSolarLead = {
      referenceId: refId,
      name: trimmedName,
      phone: cleanPhone,
      locality,
      mvvnlAccount: mvvnlAccount.trim() || undefined,
      roofType,
      recommendedKw: calc.recommendedKw,
      sanctionedLoadKw,
      systemType,
      structureType,
      propertyType,
      estimatedSubsidy: calc.totalSubsidy,
      netCost: calc.netCost,
      selectedAddonIds,
      createdAt: new Date().toISOString(),
    };

    try {
      const existingRaw = localStorage.getItem(SOLAR_LEADS_STORAGE_KEY);
      const existingList = existingRaw ? (JSON.parse(existingRaw) as SavedSolarLead[]) : [];
      const nextList = [leadRecord, ...(Array.isArray(existingList) ? existingList : [])].slice(0, 50);
      localStorage.setItem(SOLAR_LEADS_STORAGE_KEY, JSON.stringify(nextList));
    } catch {}

    try {
      await fetch(apiUrl("/api/builder-kit/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: cleanPhone,
          lucknowZone: locality,
          builtUpSqFt: userRoofAreaSqft,
          qualityTier: "PREMIUM",
          wallType: "AAC_BLOCK",
          floors: 1,
          grandTotal: Math.max(1000, calc.netCost),
          notes: `[SOLAR ${refId}] ${calc.recommendedKw}kW ${systemLabel} • ${structureLabel} • Load: ${sanctionedLoadKw}kW • Roof: ${roofType}${
            mvvnlAccount.trim() ? ` • MVVNL A/C: ${mvvnlAccount.trim()}` : ""
          }`,
          boqSummary: leadRecord,
        }),
      });
    } catch {
      // Offline localStorage fallback already preserved
    } finally {
      setSubmitting(false);
    }

    setSubmittedLead(leadRecord);
    toast.success(`Solar Shadow Survey Booked (${refId})`, {
      description: "UPNEDA & MVVNL Desk will contact you within 24 hours.",
    });
  };

  const buildWhatsAppUrl = (lead: SavedSolarLead) => {
    const text = [
      `Hi Conon Now Solar Desk,`,
      `Ref ID: ${lead.referenceId}`,
      `Name: ${lead.name}`,
      `Mobile: +91 ${lead.phone}`,
      `Locality: ${lead.locality}`,
      `Roof Type: ${lead.roofType}`,
      `Sanctioned MVVNL Load: ${lead.sanctionedLoadKw} kW`,
      `System: ${lead.recommendedKw} kW ${lead.systemType === "HYBRID" ? "Hybrid (LiFePO4)" : "On-Grid TOPCon"} (${lead.structureType === "ELEVATED_8FT" ? "8ft Elevated" : "Low-Rise"})`,
      `Est. UP Subsidy: ₹${lead.estimatedSubsidy.toLocaleString("en-IN")}`,
      `Final Net Cost: ₹${lead.netCost.toLocaleString("en-IN")}`,
      lead.mvvnlAccount ? `MVVNL Account: ${lead.mvvnlAccount}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full sm:max-w-3xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark Navy Header */}
        <div
          className="px-4 sm:px-6 py-4 text-white flex items-start justify-between gap-3 shrink-0"
          style={{ background: "linear-gradient(110deg, #0B1B3D 0%, #10244E 60%, #12357A 100%)" }}
        >
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-amber-300/30">
              <Sun className="w-3.5 h-3.5" />
              Lucknow &amp; UP Exclusive • 2D Terrace Visualizer + UPNEDA
            </div>
            <h2 className="text-base sm:text-xl font-black mt-1.5 tracking-tight">
              Rooftop Visualizer, ₹1.08L Subsidy &amp; MVVNL Survey
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Solar Subsidy Modal"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 p-1.5 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("CALCULATOR")}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === "CALCULATOR"
                ? "bg-[#12357A] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>1. 2D Roof Map &amp; Subsidy ROI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("LEAD_FORM")}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === "LEAD_FORM"
                ? "bg-[#12357A] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-700"
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>2. Shadow Survey &amp; MVVNL File</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {activeTab === "CALCULATOR" ? (
            <>
              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="solar-bill-slider" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Monthly MVVNL Bill
                    </label>
                    <span className="text-sm font-black text-[#12357A] dark:text-amber-300">
                      ₹{monthlyBill.toLocaleString("en-IN")} / mo
                    </span>
                  </div>
                  <input
                    id="solar-bill-slider"
                    type="range"
                    min={1000}
                    max={25000}
                    step={500}
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    className="w-full accent-[#12357A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>₹1,000</span>
                    <span>₹3,500</span>
                    <span>₹10,000</span>
                    <span>₹25,000</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="solar-roof-slider" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Roof Area &amp; Sanctioned Load
                    </label>
                    <span className="text-xs font-black text-[#12357A] dark:text-amber-300">
                      {userRoofAreaSqft} sq.ft
                    </span>
                  </div>
                  <input
                    id="solar-roof-slider"
                    type="range"
                    min={150}
                    max={1500}
                    step={25}
                    value={userRoofAreaSqft}
                    onChange={(e) => setUserRoofAreaSqft(Number(e.target.value))}
                    className="w-full accent-[#12357A] cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
                      Current MVVNL Load:
                    </span>
                    <select
                      value={sanctionedLoadKw}
                      onChange={(e) => setSanctionedLoadKw(Number(e.target.value))}
                      aria-label="Current MVVNL Sanctioned Load"
                      className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((kw) => (
                        <option key={kw} value={kw}>
                          {kw} kW Sanctioned
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Property / System / Structure Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <p className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-slate-400">Property Type</p>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                    {(
                      [
                        { id: "RESIDENTIAL", label: "Residential (UP Subsidy)" },
                        { id: "COMMERCIAL", label: "Commercial / Lawn / PEB" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPropertyType(opt.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border text-left transition cursor-pointer ${
                          propertyType === opt.id
                            ? "bg-[#12357A] text-white border-[#12357A]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-slate-400">System Type</p>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                    {(
                      [
                        { id: "ON_GRID", label: "On-Grid (Max Saving)" },
                        { id: "HYBRID", label: "Hybrid (LiFePO4 Backup)" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSystemType(opt.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border text-left transition cursor-pointer ${
                          systemType === opt.id
                            ? "bg-[#12357A] text-white border-[#12357A]"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-slate-400">Structure</p>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
                    {(
                      [
                        { id: "STANDARD", label: "Low-Rise HDGI" },
                        { id: "ELEVATED_8FT", label: "8ft Walkable Terrace (+₹8.5k/kW)" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setStructureType(opt.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border text-left transition cursor-pointer ${
                          structureType === opt.id
                            ? "bg-amber-400 text-slate-950 border-amber-500 font-black"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive 2D Rooftop Visualizer Map */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                    2D Interactive Terrace Map ({calc.panelsNeeded} × 550Wp TOPCon DCR Panels)
                  </span>
                  {structureType === "ELEVATED_8FT" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      ✓ 8ft Walkable Pergola: 100% Terrace Usable Underneath
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Used: {calc.roofAreaSqft} sq.ft ({coveragePct}%) · Remaining Open Terrace: {freeTerraceSqft} sq.ft
                    </span>
                  )}
                </div>

                {/* 2D Roof Blueprint Surface */}
                <div
                  className={`relative rounded-xl border-2 p-3 transition-all ${
                    structureType === "ELEVATED_8FT"
                      ? "border-amber-400 bg-amber-50/40 dark:bg-amber-950/20"
                      : "border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  }`}
                >
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {Array.from({ length: calc.panelsNeeded }).map((_, idx) => (
                      <div
                        key={idx}
                        title={`Panel #${idx + 1} (550Wp TOPCon)`}
                        className="w-11 h-16 rounded-md bg-gradient-to-br from-[#12357A] to-[#0B1B3D] border border-sky-300/60 shadow-xs flex flex-col items-center justify-between p-1"
                      >
                        <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-0.5 opacity-80">
                          {Array.from({ length: 6 }).map((__, cellIdx) => (
                            <span key={cellIdx} className="bg-sky-400/35 rounded-[1px]" />
                          ))}
                        </div>
                        <span className="text-[8px] font-black text-amber-300 leading-none mt-0.5">
                          550W
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Smart MVVNL Compliance Alerts */}
              {(calc.recommendedKw > sanctionedLoadKw || calc.recommendedKw >= 6) && (
                <div className="space-y-1.5">
                  {calc.recommendedKw > sanctionedLoadKw && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        ⚠️ MVVNL Rule: Sanctioned Load upgrade needed ({sanctionedLoadKw}kW →{" "}
                        {calc.recommendedKw}kW) before net-metering — included free in Conon Turnkey.
                      </span>
                    </div>
                  )}
                  {calc.recommendedKw >= 6 && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-900 dark:text-blue-200">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>ℹ️ 3-Phase MVVNL connection required for 6kW+ plants.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Lucknow Protection Add-on Checkboxes */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
                  Lucknow Site Protection Add-Ons (Live Total Update)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LUCKNOW_PROTECTION_ADDONS.map((addon) => {
                    const checked = selectedAddonIds.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition cursor-pointer ${
                          checked
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                            checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-600"
                          }`}
                        >
                          {checked && <Check className="w-3 h-3" />}
                        </span>
                        <span className="text-[11px] font-bold leading-snug">
                          {addon.label}{" "}
                          <strong className="block text-[10.5px] font-black text-[#12357A] dark:text-amber-300">
                            +₹{addon.price.toLocaleString("en-IN")}
                          </strong>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Financial Output Summary Card */}
              <div
                className="rounded-2xl p-4 sm:p-5 text-white space-y-3 border border-blue-900/50"
                style={{ background: "linear-gradient(115deg, #0B1B3D 0%, #10244E 65%, #12357A 100%)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2.5">
                  <div>
                    <p className="text-[10.5px] uppercase tracking-wider font-black text-amber-300">
                      Recommended System
                    </p>
                    <h3 className="text-base sm:text-lg font-black">
                      {calc.recommendedKw} kW {systemLabel}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-slate-100">
                    {calc.panelsNeeded} × 550Wp • ~{calc.roofAreaSqft} sq.ft
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-[10px] text-slate-300 uppercase font-bold">Gross Cost</p>
                    <p className="text-base font-black">₹{calc.grossCost.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-slate-300">
                      {structureLabel}
                      {calc.addonsTotal > 0 ? ` + ₹${calc.addonsTotal.toLocaleString("en-IN")} shields` : ""}
                    </p>
                  </div>

                  <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-3">
                    <p className="text-[10px] text-emerald-200 uppercase font-bold">UP Double Subsidy</p>
                    <p className="text-base font-black text-emerald-300">
                      {calc.totalSubsidy > 0
                        ? `- ₹${calc.totalSubsidy.toLocaleString("en-IN")}`
                        : "₹0 (Commercial)"}
                    </p>
                    <p className="text-[10px] text-emerald-100">
                      {calc.totalSubsidy > 0
                        ? `PM ₹${(calc.centralSubsidy / 1000).toFixed(0)}k + UPNEDA ₹${(calc.upnedaSubsidy / 1000).toFixed(0)}k`
                        : "40% Accelerated Depreciation Tax Benefit"}
                    </p>
                  </div>

                  <div className="bg-amber-400/20 border border-amber-300/40 rounded-xl p-3">
                    <p className="text-[10px] text-amber-200 uppercase font-bold">Final Net Cost</p>
                    <p className="text-lg font-black text-amber-300">
                      ₹{calc.netCost.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-amber-100">
                      Save ~₹{calc.monthlySavings.toLocaleString("en-IN")}/mo · Payback ~{calc.paybackYears} yrs
                    </p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const addonProducts = selectedAddonIds
                      .map((id) => SOLAR_PRODUCTS.find((p) => p.id === id))
                      .filter((x): x is SolarProduct => Boolean(x));
                    onAddMatchedKit(calc.matchedKit, addonProducts);
                    onClose();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#12357A] hover:bg-[#0B1B3D] text-white text-xs sm:text-sm font-black shadow-md transition cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  <span>
                    Add Matched {calc.recommendedKw}kW Kit{selectedAddonIds.length > 0 ? ` + ${selectedAddonIds.length} Add-on(s)` : ""} to Cart
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("LEAD_FORM")}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black shadow-sm transition cursor-pointer active:scale-95"
                >
                  <span>Book Free Shadow Survey &amp; MVVNL File</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : submittedLead ? (
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-[#12357A] dark:text-amber-300 text-xs font-black tracking-wider border border-blue-200 dark:border-blue-800">
                  Reference ID: {submittedLead.referenceId}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2">
                  Lucknow Shadow Survey &amp; MVVNL File Scheduled!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                  Engineer visit within 24 hrs • UPNEDA + MVVNL file ready for{" "}
                  <strong>{submittedLead.locality}</strong> ({submittedLead.recommendedKw} kW{" "}
                  {submittedLead.systemType === "HYBRID" ? "Hybrid" : "On-Grid"}).
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 max-w-md mx-auto text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Customer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{submittedLead.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">WhatsApp / Mobile:</span>
                  <span className="font-bold text-slate-900 dark:text-white">+91 {submittedLead.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sanctioned Load:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{submittedLead.sanctionedLoadKw} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Est. UP Subsidy:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    ₹{submittedLead.estimatedSubsidy.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <a
                  href={buildWhatsAppUrl(submittedLead)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Summary on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Back to Solar Storefront
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs">
                <span className="font-black text-[#12357A] dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Selected: {calc.recommendedKw} kW {systemType === "HYBRID" ? "Hybrid" : "On-Grid"} •{" "}
                  {structureType === "ELEVATED_8FT" ? "8ft Elevated" : "Low-Rise"} • Subsidy ₹
                  {calc.totalSubsidy.toLocaleString("en-IN")}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("CALCULATOR")}
                  className="text-[11px] font-bold underline text-[#12357A] dark:text-blue-300 cursor-pointer"
                >
                  Edit Specs
                </button>
              </div>

              {formError && (
                <div className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Rajesh Tiwari"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#12357A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    10-Digit WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="e.g., 9839012345"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#12357A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Lucknow Locality
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LUCKNOW_SOLAR_LOCALITIES.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocality(loc)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                        locality === loc
                          ? "bg-[#12357A] text-white border-[#12357A]"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    MVVNL / UPPCL Account Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={mvvnlAccount}
                    onChange={(e) => setMvvnlAccount(e.target.value)}
                    placeholder="10-digit Consumer / Account ID"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#12357A]"
                  />
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                    Optional: Helps us pre-verify your sanctioned load for net metering.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Roof Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["RCC Slab", "PEB / Tin Shed", "Under Construction"] as SolarRoofType[]).map((rt) => (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => setRoofType(rt)}
                        className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                          roofType === rt
                            ? "bg-amber-400 text-slate-950 border-amber-500 font-black"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {rt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Zero spam • Dedicated Lucknow UPNEDA engineer desk
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-[#12357A] hover:bg-[#0B1B3D] disabled:opacity-60 text-white text-xs sm:text-sm font-black shadow-md transition cursor-pointer"
                >
                  {submitting ? "Booking Survey..." : "Schedule Free Shadow Survey & MVVNL File →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SolarSubsidyModal;

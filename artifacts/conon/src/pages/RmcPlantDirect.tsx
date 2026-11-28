import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { calculateRmcSlabVolume, CANONICAL_RMC_SLUG } from "@workspace/shared";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calculator,
  Truck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  FileText,
  X,
  Plus,
  Layers,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CononProductMedia } from "@/components/CononProductMedia";
import { CononEscrowPaymentSheet, type VerifiedEscrowPaymentResult } from "@/components/CononEscrowPaymentSheet";
import { ServiceabilityLockBanner } from "@/components/ServiceabilityLockBanner";
import { checkPincodeServiceability } from "@/utils/serviceabilityPolicy";
import { evaluateDispatchCompliance } from "@/utils/lucknowTrafficPolicy";
import { LucknowFleetComplianceCard, type DispatchSlotChoice } from "@/components/LucknowFleetComplianceCard";
import { useDeliveryLocation } from "@/context/LocationContext";
import { useLiveRmcGrades } from "@/hooks/useCononLiveData";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import { useWallet } from "@/context/WalletContext";
import { useUser } from "@/context/UserContext";
import { generateUtr } from "@/services/treasuryEngine";
import {
  RMC_PUMP_OPTIONS,
  RMC_ADMIXTURE_OPTIONS,
  type RmcGradeItem,
} from "@/data/lucknowRmcCatalog";
import { rmcSync, type RmcConvoyOrder } from "@/services/rmcSync";

const BRAND = "#1848a0";
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const LUCKNOW_ZONES = [
  "Gomti Nagar Extension",
  "Sushant Golf City / Shaheed Path",
  "Indira Nagar",
  "Alambagh / Transport Nagar",
  "Chinhat / Faizabad Road",
  "Sitapur Road / Jankipuram",
];

const RMC_BRANDS = [
  "Any Verified Lucknow Plant",
  "UltraTech RMC",
  "ACC RMC",
  "Nuvoco",
  "RDC Concrete",
  "JK Lakshmi",
];

type StructureKind = "SLAB" | "FOOTING" | "COLUMN" | "ROAD";

export function RmcPlantDirect() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const addToCart = useAddToCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });
  const rawGrades = useLiveRmcGrades();
  const grades = Array.isArray(rawGrades) ? rawGrades : [];
  const wallet = useWallet();
  const { user } = useUser();
  const masterSync = useSafeCononMasterSync();

  const [activeTab, setActiveTab] = useState<"STANDARD" | "SPECIALITY" | "DRY_MIX_BAGS" | "PUMPS">("STANDARD");
  const [selectedBrand, setSelectedBrand] = useState<string>(RMC_BRANDS[0]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("rmc-m25-rcc");
  const [selectedPumpId, setSelectedPumpId] = useState<string>("pump-stationary-line");
  const [selectedAdmixtureId, setSelectedAdmixtureId] = useState<string>("");

  // Interactive Volume & TM-Fleet Calculator
  const [structure, setStructure] = useState<StructureKind>("SLAB");
  const [lengthFt, setLengthFt] = useState<number>(40);
  const [widthFt, setWidthFt] = useState<number>(25);
  const [thicknessIn, setThicknessIn] = useState<number>(5);
  const [floorLevel, setFloorLevel] = useState<"GROUND" | "MID" | "HIGH">("MID");

  useEffect(() => {
    try {
      const volParam = Number(new URLSearchParams(window.location.search).get("volume") || 0);
      if (volParam > 0 && Number.isFinite(volParam)) {
        // Adjust dimensions to match requested m3 volume (1 m3 ≈ 35.3147 cft; thickness 5in = 0.4167ft)
        const targetSqft = (volParam * 35.3147) / (5 / 12);
        const side = Math.max(10, Math.round(Math.sqrt(targetSqft)));
        setLengthFt(side);
        setWidthFt(Math.max(10, Math.round(targetSqft / side)));
        setThicknessIn(5);
      }
    } catch {
      // ignore
    }
  }, []);

  // Convoy Bookings & Live Tracker
  const [orders, setOrders] = useState<RmcConvoyOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<RmcConvoyOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Booking Form
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerGstin, setCustomerGstin] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [lucknowZone, setLucknowZone] = useState(LUCKNOW_ZONES[0]);
  const [paymentMode, setPaymentMode] = useState<"LIVING_VAULT" | "UPI">("LIVING_VAULT");
  const [submitting, setSubmitting] = useState(false);

  // Live 90-min freshness ticker
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const loadOrders = async () => {
    const list = await rmcSync.fetchConvoyOrders();
    setOrders(list);
  };

  useEffect(() => {
    void loadOrders();
    const unsub = rmcSync.subscribe(() => void loadOrders());
    return () => unsub();
  }, []);

  useEffect(() => {
    if (activeOrder) {
      const fresh = orders.find((o) => o.id === activeOrder.id);
      if (fresh) setActiveOrder(fresh);
    }
  }, [orders]);

  // Exact Volume Calculation using unified @workspace/shared formula (+5% wastage buffer)
  const calc = useMemo(() => {
    const sharedCalc = calculateRmcSlabVolume({
      lengthFt,
      widthFt,
      thicknessInches: thicknessIn,
      gradeCode: "M25",
      floorLevel,
    });
    const recommendedPump =
      floorLevel === "GROUND"
        ? "pump-direct-chute"
        : floorLevel === "HIGH" || sharedCalc.bufferedVolumeM3 >= 30
        ? "pump-boom-placer"
        : "pump-stationary-line";
    return {
      netM3: sharedCalc.netVolumeM3,
      withBufferM3: sharedCalc.bufferedVolumeM3,
      tmCount: sharedCalc.transitMixers6M3,
      recommendedPump,
    };
  }, [lengthFt, widthFt, thicknessIn, floorLevel]);

  const handleAddGradeOrPourToCart = (grade: RmcGradeItem, qtyM3 = 1) => {
    addToCart.mutate(
      {
        data: {
          materialId: grade.id,
          quantity: qtyM3,
          name: `${grade.gradeCode} Grade RMC (${selectedBrand === RMC_BRANDS[0] ? "UltraTech/ACC Plant Direct" : selectedBrand})`,
          price: grade.ratePerM3,
          unit: grade.category === "DRY_MIX_BAGS" ? "40kg Bag" : "m³",
          vendor: "Lucknow RMC Batching Plant",
          category: CANONICAL_RMC_SLUG,
        },
      },
      {
        onSuccess: () =>
          toast.success(`Added ${qtyM3} ${grade.category === "DRY_MIX_BAGS" ? "bags" : "m³"} of ${grade.gradeCode} RMC to Cart!`),
        onError: () => toast.error("Could not add RMC to cart"),
      }
    );
  };

  const handleAddAddonToCart = (id: string, name: string, price: number, unit: string) => {
    addToCart.mutate(
      {
        data: {
          materialId: id,
          quantity: 1,
          name,
          price,
          unit,
          vendor: "CONON RMC Fleet & Lab",
          category: CANONICAL_RMC_SLUG,
        },
      },
      {
        onSuccess: () => toast.success(`Added ${name} to Cart!`),
        onError: () => toast.error("Could not add service to cart"),
      }
    );
  };

  const activeGrade = useMemo(
    () => grades.find((g) => g.id === selectedGradeId) || grades[3] || grades[0],
    [grades, selectedGradeId]
  );
  const activePump = useMemo(
    () => RMC_PUMP_OPTIONS.find((p) => p.id === selectedPumpId) || RMC_PUMP_OPTIONS[0],
    [selectedPumpId]
  );
  const activeAdmixture = useMemo(
    () => RMC_ADMIXTURE_OPTIONS.find((a) => a.id === selectedAdmixtureId) || null,
    [selectedAdmixtureId]
  );

  const financials = useMemo(() => {
    const vol = calc.withBufferM3;
    const concreteCost = Math.round((activeGrade?.ratePerM3 || 5065) * vol);
    const pumpCost =
      activePump.pricingType === "FREE"
        ? 0
        : activePump.pricingType === "FLAT_SHIFT"
        ? activePump.rate
        : Math.max(6500, Math.round(activePump.rate * Math.max(activePump.minVolumeM3 || 15, vol)));
    const admCost = activeAdmixture
      ? Math.round(activeAdmixture.ratePerKg * activeAdmixture.dosageKgPerM3 * vol)
      : 0;
    const subtotal = concreteCost + pumpCost + admCost;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    return { concreteCost, pumpCost, admCost, subtotal, gst, total };
  }, [calc.withBufferM3, activeGrade, activePump, activeAdmixture]);

  const applyPreset = (len: number, wid: number, thick: number, fl: "GROUND" | "MID" | "HIGH", st: StructureKind) => {
    setStructure(st);
    setLengthFt(len);
    setWidthFt(wid);
    setThicknessIn(thick);
    setFloorLevel(fl);
    setSelectedPumpId(fl === "GROUND" ? "pump-direct-chute" : fl === "HIGH" ? "pump-boom-placer" : "pump-stationary-line");
  };

  const [escrowPayOpen, setEscrowPayOpen] = useState(false);
  const { location: deliveryLoc } = useDeliveryLocation();
  const [sitePincode, setSitePincode] = useState(() => deliveryLoc.pincode || "226030");
  const [dispatchMode, setDispatchMode] = useState<DispatchSlotChoice>("STANDARD");
  const sitePinCheck = useMemo(
    () =>
      checkPincodeServiceability(
        sitePincode,
        masterSync?.state.globalControls?.serviceability
      ),
    [sitePincode, masterSync?.state.globalControls?.serviceability]
  );
  const rmcTrafficCompliance = useMemo(
    () =>
      evaluateDispatchCompliance({
        domain: "RMC",
        totalWeightKg: calc.withBufferM3 * 2400,
        pincode: sitePincode,
        rules: masterSync?.state.globalControls?.trafficPolicy,
      }),
    [calc.withBufferM3, sitePincode, masterSync?.state.globalControls?.trafficPolicy]
  );

  const handleBookConvoy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sitePinCheck.serviceable) {
      toast.error(sitePinCheck.messageEn);
      return;
    }
    if (rmcTrafficCompliance.isNoEntryWindow && dispatchMode === "STANDARD") {
      toast.error("Daytime Heavy No-Entry Active: Select Legal Night Window (11:00 PM – 06:00 AM) to proceed.");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !siteAddress.trim()) {
      toast.error("Enter Site Contact Name, Phone & Lucknow Site Address");
      return;
    }
    setEscrowPayOpen(true);
  };

  const executeRmcBookingAfterPayment = async (verified: VerifiedEscrowPaymentResult) => {
    setSubmitting(true);
    try {
      const created = await rmcSync.createConvoyBooking({
        gradeId: activeGrade.id,
        gradeCode: activeGrade.gradeCode,
        gradeName: activeGrade.nameEn,
        volumeM3: calc.withBufferM3,
        pumpId: activePump.id,
        pumpName: activePump.nameEn,
        admixtureId: activeAdmixture?.id,
        admixtureName: activeAdmixture?.nameEn,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerGstin: customerGstin.trim() || undefined,
        siteAddress: siteAddress.trim(),
        sitePincode: sitePinCheck.pincode,
        dispatchMode,
        lucknowZone,
        subtotalAmount: financials.subtotal,
        gstAmount: financials.gst,
        totalAmount: financials.total,
        paymentMode: verified.paymentMode as any,
        paymentStatus: verified.paymentStatus,
        paymentRef: verified.paymentRef,
        utrNumber: verified.utrNumber,
      } as any);

      if (verified.paymentMode === "PREPAID_VAULT") {
        wallet.spend(created.totalAmount, `RMC Escrow • ${created.shortId} (HSN 38245010)`);
      }

      if (masterSync) {
        const accounts = masterSync.state.treasury?.companyAccounts || [];
        const collectionAcct =
          accounts.find((a) => (a.role === "COLLECTION" || a.role === "ESCROW_NODAL") && a.isPrimary) ||
          accounts[0];
        masterSync
          .recordTreasuryEntry({
            id: `tr_rmc_${created.id}`,
            orderId: created.shortId,
            entryType: "CUSTOMER_INFLOW",
            direction: "CREDIT",
            fromAccountLabel: `Customer (${verified.paymentMode})`,
            fromAccountRef: customerPhone.trim(),
            toAccountLabel: collectionAcct?.label || "CONON Collection A/c",
            toAccountRef: collectionAcct
              ? `${collectionAcct.bankName} ${collectionAcct.accountNumberMasked}`
              : "CONON-COLLECTION",
            toIfsc: collectionAcct?.ifscCode || "",
            beneficiaryName: "CONON INFRABUILT PVT LTD",
            paymentMode: verified.paymentMode,
            utrNumber: verified.utrNumber || generateUtr("5"),
            grossAmount: created.totalAmount,
            platformMargin: Math.round(created.subtotalAmount * 0.08),
            taxAmount: created.gstAmount,
            netAmount: created.totalAmount,
            status: "SETTLED",
            createdAt: new Date().toISOString(),
            customerName: customerName.trim(),
          })
          .catch(() => {});
      }

      setEscrowPayOpen(false);
      setDrawerOpen(false);
      setActiveOrder(created);
      toast.success(`RMC Convoy ${created.shortId} Locked!`, {
        description: `${created.tmCount} Transit Mixers scheduled • Pour Start OTP: ${created.pourStartOtp}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const visibleGrades = useMemo(() => {
    if (activeTab === "PUMPS") return [];
    return grades.filter((g) => g.category === activeTab);
  }, [grades, activeTab]);

  return (
    <Layout>
      <ErrorBoundary fallbackTitle="RMC Plant Direct">
      <div className="min-h-screen bg-[#f4f7fb] pb-20">
        {/* TOP CATEGORY HEADER BAR (Matches Flagship CCTV & Networking Layout) */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLocation("/home")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black cursor-pointer transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#12357A] text-amber-300 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                    RMC Plant Direct (Ready Mix Concrete)
                  </h2>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Home &gt; Materials &gt; RMC Plant Direct
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black">
                ✦ 90-Min Fresh Concrete SLA
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Lucknow Batching Plants • IS 456 Verified
              </span>
            </div>
          </div>
        </div>

        {/* HERO VOLUME & TM-FLEET CALCULATOR */}
        <section className="bg-gradient-to-br from-[#0B1B3D] via-[#10244E] to-[#12357A] text-white py-7 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-6 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-400 text-slate-950">
                <Sparkles className="w-3.5 h-3.5" />
                CONON RMC PLANT DIRECT • IS 456:2000 • HSN 38245010
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Ready Mix Concrete Direct from Lucknow Batching Plants
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Computerized batching slip, 90-Minute Freshness Countdown (IS 456), Multi-TM Convoy dispatch, On-Site Slump Cone check &amp; 6-Cube 7/28-Day NABL Lab Reports.
              </p>

              {/* 1-Tap Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => applyPreset(40, 25, 5, "MID", "SLAB")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold cursor-pointer"
                >
                  1,000 sq.ft × 5&quot; Chhat
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(50, 40, 5.5, "MID", "SLAB")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold cursor-pointer"
                >
                  2,000 sq.ft × 5.5&quot; Commercial
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(100, 100, 6, "GROUND", "ROAD")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold cursor-pointer"
                >
                  10,000 sq.ft PEB Floor
                </button>
              </div>
            </div>

            {/* Interactive Volume & TM-Fleet Calculator Card */}
            <div className="lg:col-span-6 bg-white text-slate-900 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-700" />
                  Slab / Footing Volume &amp; TM-Fleet Calculator
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  +5% Buffer Included
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {(["SLAB", "FOOTING", "COLUMN", "ROAD"] as StructureKind[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStructure(st)}
                    className={`py-1.5 rounded-xl text-[11px] font-black cursor-pointer ${
                      structure === st ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Length (ft)</label>
                  <input
                    type="number"
                    min={1}
                    value={lengthFt}
                    onChange={(e) => setLengthFt(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Width (ft)</label>
                  <input
                    type="number"
                    min={1}
                    value={widthFt}
                    onChange={(e) => setWidthFt(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Thickness (in)</label>
                  <input
                    type="number"
                    min={1}
                    step={0.5}
                    value={thicknessIn}
                    onChange={(e) => setThicknessIn(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Grade Selected</label>
                  <select
                    value={selectedGradeId}
                    onChange={(e) => setSelectedGradeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.gradeCode} — ₹{g.ratePerM3}/m³
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Pour Height / Pump</label>
                  <select
                    value={floorLevel}
                    onChange={(e) => {
                      const fl = e.target.value as "GROUND" | "MID" | "HIGH";
                      setFloorLevel(fl);
                      setSelectedPumpId(
                        fl === "GROUND" ? "pump-direct-chute" : fl === "HIGH" ? "pump-boom-placer" : "pump-stationary-line"
                      );
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="GROUND">Ground Floor (Direct Chute)</option>
                    <option value="MID">1st–6th Floor (Line Pump)</option>
                    <option value="HIGH">High-Rise / Rapid (Boom Placer)</option>
                  </select>
                </div>
              </div>

              {/* Output Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] text-amber-300 font-black">
                    {calc.withBufferM3} m³ (Net {calc.netM3}m³ + 5%) • {calc.tmCount} Transit Mixer{calc.tmCount > 1 ? "s" : ""} (6m³)
                  </div>
                  <div className="text-xs text-slate-300">
                    {activePump.nameEn} • Spaced 35 mins apart
                  </div>
                  {financials.total >= 50000 && (
                    <div className="text-[10px] font-black text-emerald-400 mt-0.5">
                      ✓ UP E-Way Bill Mandatory (&gt;= ₹50,000) — Auto-flagged for Plant
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddGradeOrPourToCart(activeGrade, calc.withBufferM3)}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Add RMC Pour to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#12357A] hover:bg-blue-800 border border-white/20 text-white text-xs font-black cursor-pointer"
                  >
                    Schedule Dhalai Slot • {inr(financials.total)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE LIVE CONVOY & 90-MIN FRESHNESS TRACKER */}
        {orders.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-700" />
                  Live RMC Convoy, 90-Min Freshness Clock &amp; 6-Cube Lab Locker ({orders.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.slice(0, 4).map((o) => {
                  const activeTruck = o.trucks.find((t) => t.batchTime) || o.trucks[0];
                  const elapsedMins = activeTruck?.batchTime
                    ? Math.floor((nowMs - new Date(activeTruck.batchTime).getTime()) / 60000)
                    : 0;
                  const maxMins = o.admixtureId === "adm-traffic-retarder" ? 135 : 90;
                  const minsLeft = Math.max(0, maxMins - elapsedMins);
                  const expired = activeTruck?.batchTime && elapsedMins > maxMins;

                  return (
                    <div key={o.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900">
                          {o.shortId} • {o.gradeCode} ({o.volumeM3} m³)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                          {o.tmCount} TM Convoy
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {o.trucks.map((t) => (
                          <span key={t.tmIndex} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-[10px]">
                            TM #{t.tmIndex} ({t.volumeM3}m³): {t.status}
                          </span>
                        ))}
                      </div>
                      {activeTruck?.batchTime ? (
                        <div className={`p-2 rounded-xl font-bold flex items-center justify-between ${expired ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {expired ? `Freshness Exceeded (${elapsedMins}m)` : `${minsLeft} mins Freshness Left (IS 456)`}
                          </span>
                          {expired && (
                            <button
                              type="button"
                              onClick={() => rmcSync.markFreshnessClaim(o.id)}
                              className="px-2 py-0.5 rounded bg-rose-700 text-white text-[10px] font-black cursor-pointer"
                            >
                              Hold Escrow
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] font-bold text-slate-600">
                          Pour Start OTP: <span className="font-mono text-blue-700">{o.pourStartOtp}</span> • End OTP: <span className="font-mono text-emerald-700">{o.pourEndOtp}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                          6-Cube Lab: {o.cubeLab.day28Mpa ? `28d: ${o.cubeLab.day28Mpa} MPa (${o.cubeLab.passed ? "PASSED ✓" : "CHECK"})` : "7d / 28d Scheduled"}
                        </span>
                        <span className="font-mono font-bold text-slate-500">
                          {o.ewayBillRequired ? (o.ewayBillNo ? `EWB: ${o.ewayBillNo}` : "E-Way Bill Req") : "HSN 38245010"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 3 TABS: STANDARD GRADES | SPECIALITY MIXES | PUMPS & ADMIXTURES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-900">
              Lucknow RMC Grades, Speciality Concrete &amp; Pumps
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-800"
              >
                {RMC_BRANDS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {(
                [
                  ["STANDARD", "Standard Grades (M10–M50)"],
                  ["SPECIALITY", "Speciality Engineered (9)"],
                  ["DRY_MIX_BAGS", "Narrow-Lane Dry Mix (40kg)"],
                  ["PUMPS", "Pumps & Admixtures"],
                ] as const
              ).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setActiveTab(k)}
                  className={`px-4 py-2 rounded-full text-xs font-black cursor-pointer transition ${
                    activeTab === k ? "bg-blue-700 text-white" : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {activeTab !== "PUMPS" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {visibleGrades.map((g) => (
                <div
                  key={g.id}
                  className={`bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col justify-between transition ${
                    selectedGradeId === g.id ? "border-blue-600 ring-2 ring-blue-500/20" : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="relative h-40 bg-slate-100">
                      <CononProductMedia
                        mediaType="product"
                        itemId={g.id}
                        slug={g.slug}
                        src={g.imageUrl}
                        title={g.nameEn}
                        brand={`RMC ${g.gradeCode}`}
                        categorySlug="rmc-plant-direct"
                        unit="m³"
                        variant="cover"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900/80 text-amber-300">
                        {g.badge}
                      </span>
                      <span className="absolute bottom-2 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/80 text-white">
                        Slump {g.slumpSpecMm}
                      </span>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-black text-slate-900">{g.nameEn}</h3>
                          <p className="text-[11px] font-bold text-slate-500">{g.nameHi}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-black font-mono text-blue-700">
                            {inr(g.ratePerM3)}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-bold">/m³</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{g.recommendedFor}</p>
                    </div>
                  </div>
                  <div className="px-4 pb-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddGradeOrPourToCart(g, 1)}
                      className="flex-1 py-2 rounded-xl text-xs font-black text-white cursor-pointer inline-flex items-center justify-center gap-1"
                      style={{ background: BRAND }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGradeId(g.id);
                        setDrawerOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
                <h3 className="text-base font-black text-slate-900">Concrete Placement Pumps</h3>
                {RMC_PUMP_OPTIONS.map((p) => (
                  <div
                    key={p.id}
                    className={`w-full p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      selectedPumpId === p.id ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedPumpId(p.id)}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <div className="flex justify-between font-black text-xs text-slate-900">
                        <span>{p.nameEn}</span>
                        <span className="text-blue-700 font-mono">
                          {p.rate === 0 ? "FREE" : p.pricingType === "PER_M3" ? `₹${p.rate}/m³` : `₹${p.rate.toLocaleString("en-IN")}/day`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{p.description}</p>
                    </button>
                    {p.rate > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAddAddonToCart(
                            p.id,
                            p.nameEn,
                            p.pricingType === "FLAT_SHIFT" ? p.rate : Math.max(6500, p.rate * 15),
                            p.pricingType === "FLAT_SHIFT" ? "Shift" : "Pour Slot"
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-[#12357A] text-white text-[10px] font-black shrink-0 cursor-pointer"
                      >
                        + Cart
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
                <h3 className="text-base font-black text-slate-900">Plant Admixtures &amp; 28-Day Cube Lab</h3>
                {RMC_ADMIXTURE_OPTIONS.map((a) => (
                  <div
                    key={a.id}
                    className={`w-full p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      selectedAdmixtureId === a.id ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedAdmixtureId((prev) => (prev === a.id ? "" : a.id))}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <div className="flex justify-between font-black text-xs text-slate-900">
                        <span>{a.nameEn}</span>
                        <span className="text-amber-700 font-mono">₹{a.ratePerKg}/kg</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{a.benefit}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddAddonToCart(a.id, a.nameEn, Math.round(a.ratePerKg * a.dosageKgPerM3), "m³ Dose")}
                      className="px-2.5 py-1.5 rounded-xl bg-[#12357A] text-white text-[10px] font-black shrink-0 cursor-pointer"
                    >
                      + Cart
                    </button>
                  </div>
                ))}
                <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black text-emerald-950">28-Day Cube Testing Certificate (NABL 6-Cube Set)</div>
                    <p className="text-[11px] text-emerald-800">IS 516 7-Day &amp; 28-Day compressive strength report</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddAddonToCart("CON-RMC-LAB-CUBE28", "28-Day Cube Testing Certificate", 1800, "Certificate")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-[10px] font-black shrink-0 cursor-pointer"
                  >
                    + Add ₹1,800
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* BOOKING DRAWER */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <form onSubmit={handleBookConvoy} className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="text-[10px] font-black text-blue-700 uppercase">CONON RMC CONVOY ESCROW</span>
                  <h3 className="text-base font-black text-slate-900">
                    {activeGrade.gradeCode} • {calc.withBufferM3} m³ ({calc.tmCount} Transit Mixers)
                  </h3>
                </div>
                <button type="button" onClick={() => setDrawerOpen(false)} className="cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between"><span>Concrete ({calc.withBufferM3} m³ × ₹{activeGrade.ratePerM3})</span><strong>{inr(financials.concreteCost)}</strong></div>
                <div className="flex justify-between"><span>{activePump.nameEn}</span><strong>{inr(financials.pumpCost)}</strong></div>
                {financials.admCost > 0 && <div className="flex justify-between"><span>{activeAdmixture?.nameEn}</span><strong>{inr(financials.admCost)}</strong></div>}
                <div className="flex justify-between"><span>GST 18% (HSN 38245010)</span><strong>{inr(financials.gst)}</strong></div>
                <div className="flex justify-between pt-1 border-t font-black text-sm text-blue-800"><span>Total Escrow</span><span>{inr(financials.total)}</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <input type="text" required placeholder="Site Contact Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300" />
                <input type="tel" required placeholder="Phone *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300 font-mono" />
                <select value={lucknowZone} onChange={(e) => setLucknowZone(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-300">
                  {LUCKNOW_ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
                <input type="text" placeholder="GSTIN (Optional)" value={customerGstin} onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())} className="px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase" />
              </div>

              <input type="text" required placeholder="Lucknow Site Address & Nearest Approach Road *" value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs" />

              <ServiceabilityLockBanner
                pincode={sitePincode}
                onChangePincode={setSitePincode}
                label="RMC Pour Site Pin Code *"
              />

              <LucknowFleetComplianceCard
                compliance={rmcTrafficCompliance}
                dispatchMode={dispatchMode}
                onSelectDispatchMode={setDispatchMode}
              />

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-emerald-900">
                    100% Prepaid Escrow Required • Pay First to Confirm Plant Slot & Convoy
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    Pay on Delivery is disabled for Ready Mix Concrete. Funds stay in CONON Escrow until verified pour.
                  </div>
                </div>
              </div>

              <button type="submit" disabled={submitting || !sitePinCheck.serviceable || (rmcTrafficCompliance.isNoEntryWindow && dispatchMode === "STANDARD")} className="w-full py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? "Dispatching Convoy..." : `Pay ${inr(financials.total)} & Lock RMC Plant Booking`}
              </button>
            </form>
          </div>
        )}

        <CononEscrowPaymentSheet
          isOpen={escrowPayOpen}
          onClose={() => setEscrowPayOpen(false)}
          amount={financials.total}
          title={`RMC Plant Escrow • ${activeGrade.gradeCode} (${calc.withBufferM3} m³)`}
          subtitle={`${lucknowZone} • ${activePump.nameEn}`}
          ctaLabel={`Pay ${inr(financials.total)} & Lock RMC Plant Booking`}
          phoneNumber={customerPhone}
          isProcessingExternal={submitting}
          onPaymentVerified={executeRmcBookingAfterPayment}
        />
      </div>
      </ErrorBoundary>
    </Layout>
  );
}

export default RmcPlantDirect;

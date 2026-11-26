import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Tractor,
  Shield,
  Clock,
  CheckCircle2,
  MapPin,
  X,
  Gauge,
  Fuel,
  PauseCircle,
  PlayCircle,
  Wallet,
  CreditCard,
  AlertTriangle,
  Camera,
  Lock,
  Radio,
  Sparkles,
  FileText,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { CononProductMedia } from "@/components/CononProductMedia";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useSafeProductMediaVault } from "@/context/ProductMediaVaultContext";
import { useLiveRentals } from "@/hooks/useCononLiveData";
import { useWallet } from "@/context/WalletContext";
import { useUser } from "@/context/UserContext";
import {
  servicesRentalsSync,
  type MachineRentalCatalogItem,
  type MachineRentalBookingRecord,
  type RentalCategory,
  FALLBACK_RENTAL_CATALOG,
} from "@/services/servicesRentalsSync";

const BRAND = "#1848a0";
const AMBER = "#f59e0b";
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

type BillingUnit = "HOUR" | "SHIFT" | "WEEK";
type FuelMode = "WET" | "DRY";
type CatFilter = "ALL" | RentalCategory;

const CATEGORIES: { id: CatFilter; label: string }[] = [
  { id: "ALL", label: "All Machines" },
  { id: "EARTHMOVING", label: "Earthmoving" },
  { id: "CONCRETE", label: "Concrete & Dhalai" },
  { id: "TRANSPORT", label: "Transport" },
  { id: "TOOLS", label: "Shuttering & Tools" },
];

const LUCKNOW_ZONES = [
  "Gomti Nagar Extension",
  "Sushant Golf City",
  "Indira Nagar",
  "Alambagh / Transport Nagar",
  "Hazratganj / Mahanagar",
  "Shaheed Path Supply Corridor",
];

export function HeavyRentals() {
  const wallet = useWallet();
  const { user } = useUser();
  const vault = useSafeProductMediaVault();
  const vaultVersion = vault?.version ?? 0;
  const liveRentals = useLiveRentals();

  const [catalog, setCatalog] = useState<MachineRentalCatalogItem[]>(liveRentals);
  useEffect(() => {
    setCatalog(liveRentals);
  }, [liveRentals]);
  const [detailMachine, setDetailMachine] = useState<MachineRentalCatalogItem | null>(null);
  const [bookings, setBookings] = useState<MachineRentalBookingRecord[]>([]);
  const [activeCat, setActiveCat] = useState<CatFilter>("ALL");

  // Global 1-Tap Fuel & Billing Switchers
  const [billingUnit, setBillingUnit] = useState<BillingUnit>("SHIFT");
  const [fuelMode, setFuelMode] = useState<FuelMode>("WET");

  // Booking Drawer State
  const [bookingMachine, setBookingMachine] = useState<MachineRentalCatalogItem | null>(null);
  const [qtyUnits, setQtyUnits] = useState<number>(1);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerGstin, setCustomerGstin] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [lucknowZone, setLucknowZone] = useState(LUCKNOW_ZONES[0]);
  const [paymentMode, setPaymentMode] = useState<"LIVING_VAULT" | "UPI">("LIVING_VAULT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live HMR Meter Tracker Drawer
  const [activeTracker, setActiveTracker] = useState<MachineRentalBookingRecord | null>(null);
  const [pauseReason, setPauseReason] = useState("Hydraulic line check / Heavy rain site halt");

  const loadAll = async () => {
    const [items, bks] = await Promise.all([
      servicesRentalsSync.fetchRentalCatalog(),
      servicesRentalsSync.fetchRentalBookings(),
    ]);
    setCatalog(items);
    setBookings(bks);
  };

  useEffect(() => {
    void loadAll();
    const unsub = servicesRentalsSync.subscribe(() => {
      void loadAll();
    });
    return () => unsub();
  }, [vaultVersion]);

  useEffect(() => {
    if (activeTracker) {
      const fresh = bookings.find((b) => b.id === activeTracker.id);
      if (fresh) setActiveTracker(fresh);
    }
  }, [bookings]);

  const filteredMachines = useMemo(
    () => (activeCat === "ALL" ? catalog : catalog.filter((m) => m.category === activeCat)),
    [catalog, activeCat]
  );

  const getRateFor = (m: MachineRentalCatalogItem, mode: FuelMode, unit: BillingUnit): number => {
    const table = mode === "WET" ? m.wetRates : m.dryRates;
    return unit === "HOUR" ? table.hour : unit === "WEEK" ? table.week : table.shift;
  };

  const unitSuffix = billingUnit === "HOUR" ? "/hr" : billingUnit === "WEEK" ? "/wk" : "/8-hr shift";

  const drawerTotals = useMemo(() => {
    if (!bookingMachine) return { unitRate: 0, subtotal: 0, gst: 0, total: 0 };
    const unitRate = getRateFor(bookingMachine, fuelMode, billingUnit);
    const subtotal = Math.round(unitRate * qtyUnits + bookingMachine.mobilizationFee);
    const gst = Math.round(subtotal * 0.18);
    return { unitRate, subtotal, gst, total: subtotal + gst };
  }, [bookingMachine, fuelMode, billingUnit, qtyUnits]);

  const openBookDrawer = (eq: MachineRentalCatalogItem) => {
    setQtyUnits(billingUnit === "HOUR" ? 4 : 1);
    setBookingMachine(eq);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMachine) return;
    if (!customerName.trim() || !customerPhone.trim() || !siteAddress.trim()) {
      toast.error("Please fill Contact Name, Phone & Lucknow Site Address");
      return;
    }

    if (paymentMode === "LIVING_VAULT" && wallet.balance < drawerTotals.total) {
      toast.warning(`Living Vault balance (${inr(wallet.balance)}) below ${inr(drawerTotals.total)} — switched to UPI Escrow Lock.`);
      setPaymentMode("UPI");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await servicesRentalsSync.createRentalBooking({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerGstin: customerGstin.trim() || undefined,
        siteAddress: siteAddress.trim(),
        lucknowZone,
        machineId: bookingMachine.id,
        fuelMode,
        billingUnit,
        quantityUnits: qtyUnits,
        paymentMode,
      });

      if (paymentMode === "LIVING_VAULT") {
        wallet.spend(created.estimatedTotal, `HMR Escrow Lock • ${created.shortId} (${created.modelName})`);
      }

      setBookingMachine(null);
      setActiveTracker(created);
      toast.success(`Machine Booked with Digital HMR Lock • #${created.shortId}`, {
        description: `Start OTP: ${created.startOtp} | End OTP: ${created.endOtp}. Synced live with Partner Yard & Admin Radar!`,
      });
      void loadAll();
    } catch (err: any) {
      toast.error(err.message || "Machine booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBreakdownPause = async (booking: MachineRentalBookingRecord) => {
    try {
      const updated = await servicesRentalsSync.pauseRentalBreakdown(booking.id, pauseReason);
      setActiveTracker(updated);
      toast.error("RED Breakdown Pause Activated", {
        description: "Meter billing frozen immediately. Breakdown SOS alert fired to CONON Command OS!",
      });
      void loadAll();
    } catch (err: any) {
      toast.error(err.message || "Could not pause meter");
    }
  };

  const handleResumeMeter = async (booking: MachineRentalBookingRecord) => {
    try {
      const updated = await servicesRentalsSync.resumeRentalMeter(booking.id);
      setActiveTracker(updated);
      toast.success("Meter Resumed", {
        description: `Paused downtime logged (${updated.breakdownPausedMins} mins excluded).`,
      });
      void loadAll();
    } catch (err: any) {
      toast.error(err.message || "Could not resume meter");
    }
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-full pb-20">
        {/* HERO BANNER */}
        <section
          className="px-4 sm:px-8 pt-7 pb-8 rounded-b-[32px] shadow-lg text-white"
          style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #0f2f70 100%)` }}
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <Tractor className="w-5 h-5 text-amber-300" />
                </span>
                <div>
                  <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-none">
                    Heavy Rentals • Machines On Rent
                  </h1>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200 mt-1">
                    Digital HMR Optical Lock • Wet/Dry Fuel Clarity • SAC 9973 Tax Invoice
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl mt-2">
                JCB 3DX Loaders, Komatsu Excavators, 10W Tippers, Transit Mixers &amp; Dhalai Equipment — zero meter disputes with Start/End Hour-Meter Optical Photos and 1-tap Breakdown Billing Freeze.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold">
                  <Shield className="w-3.5 h-3.5 text-amber-300" /> Insured Commercial Fleet
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold">
                  <Gauge className="w-3.5 h-3.5 text-amber-300" /> Digital HMR Optical Lock
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold">
                  <PauseCircle className="w-3.5 h-3.5 text-amber-300" /> 1-Tap Breakdown Pause
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:min-w-[260px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200 flex items-center justify-between">
                <span>CONON Living Vault Balance</span>
                <Wallet className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {inr(wallet.balance)}
              </div>
              <p className="text-[10px] text-emerald-300 font-bold mt-1">
                ✓ Pay Only For Actual Optical HMR Hours
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 -mt-4">
          {/* LIVE ACTIVE RENTAL HMR TRACKERS (Zero-Dummy: visible only when customer has organic bookings) */}
          {bookings.length > 0 && (
            <section className="bg-white rounded-3xl border border-amber-300 shadow-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    Active Machine Dispatches &amp; Live HMR Meters ({bookings.length})
                  </h2>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  Click any card for Optical HMR Lock &amp; Breakdown Freeze
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setActiveTracker(b)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                      b.isBreakdownPaused
                        ? "bg-rose-50 border-rose-400"
                        : "bg-slate-50 border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            #{b.shortId}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              b.isBreakdownPaused
                                ? "bg-rose-600 text-white animate-pulse"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {b.isBreakdownPaused ? "PAUSED (BREAKDOWN SOS)" : b.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 mt-1">{b.modelName}</h3>
                        <p className="text-[11px] text-slate-500">
                          {b.fuelMode} Rate • {b.siteAddress} ({b.lucknowZone})
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black font-mono text-slate-900">
                          {inr(b.netBillAmount || b.estimatedTotal)}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700">Escrow: {b.escrowStatus}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono font-bold">
                          Start OTP: {b.startOtp}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-300 font-mono font-bold">
                          End OTP: {b.endOtp}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-blue-700">
                        {b.startHmr != null ? `Start HMR: ${b.startHmr} hrs` : "Awaiting Start HMR Lock"}
                        {b.endHmr != null ? ` → End: ${b.endHmr} hrs` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CATEGORY PILLS + GLOBAL 1-TAP FUEL & BILLING TOGGLES */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.map((c) => {
                  const on = activeCat === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCat(c.id)}
                      className={`shrink-0 px-4 py-2 rounded-full text-xs font-black transition cursor-pointer ${
                        on
                          ? "bg-blue-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {/* Global 1-Tap Duration & Wet/Dry Switchers */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Duration Mode */}
                <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(
                    [
                      { id: "HOUR", label: "Hourly" },
                      { id: "SHIFT", label: "8-Hr Shift" },
                      { id: "WEEK", label: "Weekly" },
                    ] as const
                  ).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setBillingUnit(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                        billingUnit === u.id
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>

                {/* Wet vs Dry Fuel Mode */}
                <div className="inline-flex bg-slate-900 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFuelMode("WET")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                      fuelMode === "WET"
                        ? "bg-amber-400 text-slate-950"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    <span>Wet Rate (Diesel + Operator)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelMode("DRY")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                      fuelMode === "DRY"
                        ? "bg-emerald-400 text-slate-950"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    Dry Rate (No Diesel)
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* CLEAN MULTI-COLUMN RESPONSIVE EQUIPMENT GRID */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMachines.map((eq, i) => {
              const liveRate = getRateFor(eq, fuelMode, billingUnit);
              return (
                <motion.div
                  key={eq.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Real Studio Photograph */}
                    <div
                      onClick={() => setDetailMachine(eq)}
                      className="relative aspect-[4/3] w-full bg-[#F7F8FA] overflow-hidden border-b border-slate-100 cursor-pointer"
                      title="Tap to inspect photos & machine specifications"
                    >
                      <CononProductMedia
                        mediaType="rental"
                        itemId={eq.id}
                        slug={eq.slug}
                        src={eq.imageUrl}
                        title={eq.modelName}
                        brand={eq.category || "HEAVY FLEET"}
                        categorySlug="heavy-machine-rentals"
                        unit="Shift / Hr"
                        variant="cover"
                      />
                      <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-xs">
                          {eq.tag}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/95 text-emerald-700 shadow-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          {eq.isFleetOnline
                            ? `${eq.activeFleetCount} Partner Live`
                            : "Yard Dispatch Ready"}
                        </span>
                      </div>
                      <span className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900/80 text-amber-300">
                        SAC {eq.sacCode}
                      </span>
                    </div>

                    <div className="p-4 space-y-2.5">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {eq.machineName}
                        </span>
                        <h3 className="text-base font-black text-slate-900 leading-tight mt-0.5">
                          {eq.modelName}
                        </h3>
                        <p className="text-[11px] font-bold text-blue-700 mt-1">{eq.capacitySpec}</p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {eq.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Insured Fleet
                        </span>
                        {eq.needsOperator && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            ✓ Verified Operator
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rate & Booking Action */}
                  <div className="px-4 pb-4 pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          {fuelMode === "WET" ? "Wet Rate (Incl. Diesel)" : "Dry Rate (Machine Only)"}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black font-mono" style={{ color: BRAND }}>
                            {inr(liveRate)}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{unitSuffix}</span>
                        </div>
                      </div>
                      <div className="text-right text-[10px] font-bold text-slate-500">
                        <div>Mob. Fee: {inr(eq.mobilizationFee)}</div>
                        <div>+18% GST Invoice</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openBookDrawer(eq)}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Gauge className="w-4 h-4" />
                      <span>Book Machine with Digital HMR Lock</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </section>
        </div>
      </div>

      {/* DIGITAL HMR BOOKING DRAWER */}
      <AnimatePresence>
        {bookingMachine && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
              onClick={() => setBookingMachine(null)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="fixed bottom-0 sm:bottom-auto sm:top-1/2 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg w-full bg-white rounded-t-3xl sm:rounded-3xl z-50 shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <form onSubmit={handleConfirmBooking} className="p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                      DIGITAL HMR OPTICAL LOCK • SAC 9973
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      {bookingMachine.modelName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingMachine(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Machine Summary Row */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white">
                    <CononProductMedia
                      mediaType="rental"
                      itemId={bookingMachine.id}
                      title={bookingMachine.machineName}
                      categorySlug="heavy-machine-rentals"
                      src={bookingMachine.imageUrl}
                      variant="thumb"
                      showGalleryBadge={false}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900">{bookingMachine.machineName}</p>
                    <p className="text-[11px] text-slate-500">{bookingMachine.capacitySpec}</p>
                    <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                      Start &amp; End Optical Hour-Meter Photo Lock Included
                    </p>
                  </div>
                </div>

                {/* Billing Unit & Fuel Mode */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(["HOUR", "SHIFT", "WEEK"] as BillingUnit[]).map((u) => {
                    const rate = getRateFor(bookingMachine, fuelMode, u);
                    const on = billingUnit === u;
                    return (
                      <button
                        key={u}
                        type="button"
                        onClick={() => {
                          setBillingUnit(u);
                          setQtyUnits(u === "HOUR" ? 4 : 1);
                        }}
                        className={`p-2.5 rounded-2xl border-2 text-center transition cursor-pointer ${
                          on ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase text-slate-500">
                          {u === "HOUR" ? "Per Hour" : u === "SHIFT" ? "8-Hr Shift" : "Weekly"}
                        </div>
                        <div className="font-mono font-black text-sm text-slate-900 mt-0.5">
                          {inr(rate)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">
                      Quantity ({billingUnit === "HOUR" ? "Hours" : billingUnit === "WEEK" ? "Weeks" : "Shifts"})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={qtyUnits}
                      onChange={(e) => setQtyUnits(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-black text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Fuel Supply Mode</label>
                    <select
                      value={fuelMode}
                      onChange={(e) => setFuelMode(e.target.value as FuelMode)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white"
                    >
                      <option value="WET">Wet Rate (Diesel + Operator)</option>
                      <option value="DRY">Dry Rate (Without Diesel)</option>
                    </select>
                  </div>
                </div>

                {/* Contact & Site */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Site Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Site Incharge Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit WhatsApp mobile"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Lucknow Zone</label>
                    <select
                      value={lucknowZone}
                      onChange={(e) => setLucknowZone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white font-semibold"
                    >
                      {LUCKNOW_ZONES.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">B2B GSTIN (Optional)</label>
                    <input
                      type="text"
                      placeholder="09AABCC1234F1Z5"
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-bold text-slate-600 block mb-1">Lucknow Site Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="Site plot address / landmark"
                    value={siteAddress}
                    onChange={(e) => setSiteAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>

                {/* Totals Box */}
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Machine ({qtyUnits} × {inr(drawerTotals.unitRate)}) + Mob. {inr(bookingMachine.mobilizationFee)}</span>
                    <span className="font-mono">{inr(drawerTotals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>18% GST (SAC 9973 Tax Credit Ready)</span>
                    <span className="font-mono">{inr(drawerTotals.gst)}</span>
                  </div>
                  <div className="flex justify-between font-black text-base pt-1.5 border-t border-slate-800 text-amber-300">
                    <span>Escrow Lock Total</span>
                    <span className="font-mono">{inr(drawerTotals.total)}</span>
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("LIVING_VAULT")}
                    className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                      paymentMode === "LIVING_VAULT"
                        ? "border-blue-700 bg-blue-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="font-black text-slate-900 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-blue-700" />
                      Living Vault
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">Avail: {inr(wallet.balance)}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode("UPI")}
                    className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                      paymentMode === "UPI"
                        ? "border-amber-500 bg-amber-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="font-black text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                      UPI Escrow
                    </div>
                    <div className="text-[10px] text-slate-500">Instant Verify</div>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "Locking Escrow..."
                      : `Confirm & Lock Digital HMR Escrow (${inr(drawerTotals.total)})`}
                  </span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LIVE DIGITAL HMR & BREAKDOWN TRACKER MODAL */}
      <AnimatePresence>
        {activeTracker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50"
              onClick={() => setActiveTracker(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-[92%] bg-white rounded-3xl p-5 sm:p-6 z-50 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-black text-blue-700 uppercase">
                    DIGITAL HMR TRACKER • #{activeTracker.shortId}
                  </span>
                  <h3 className="text-base font-black text-slate-900">{activeTracker.modelName}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTracker(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Start & End OTPs */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] font-bold uppercase text-amber-800">Start HMR OTP</div>
                  <div className="text-2xl font-black font-mono text-amber-700">{activeTracker.startOtp}</div>
                  <div className="text-[10px] text-amber-600">Operator unlocks meter</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-bold uppercase text-emerald-800">End HMR OTP</div>
                  <div className="text-2xl font-black font-mono text-emerald-700">{activeTracker.endOtp}</div>
                  <div className="text-[10px] text-emerald-600">Locks final optical bill</div>
                </div>
              </div>

              {/* Start / End Optical HMR Photos & Readings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-black text-slate-700 mb-1">Start HMR Optical Lock</div>
                  {activeTracker.startHmr != null ? (
                    <>
                      <div className="font-mono font-black text-base text-blue-700">
                        {activeTracker.startHmr} hrs
                      </div>
                      {activeTracker.startHmrPhoto && (
                        <img
                          src={activeTracker.startHmrPhoto}
                          alt="Start HMR"
                          className="w-full h-24 object-cover rounded-lg mt-1.5 border border-slate-200"
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-400 py-4 text-center">
                      Awaiting operator dashboard capture
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-black text-slate-700 mb-1">End HMR Optical Lock</div>
                  {activeTracker.endHmr != null ? (
                    <>
                      <div className="font-mono font-black text-base text-emerald-700">
                        {activeTracker.endHmr} hrs
                      </div>
                      {activeTracker.endHmrPhoto && (
                        <img
                          src={activeTracker.endHmrPhoto}
                          alt="End HMR"
                          className="w-full h-24 object-cover rounded-lg mt-1.5 border border-slate-200"
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-[11px] text-slate-400 py-4 text-center">
                      Locks upon job completion
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Tap Breakdown / Rain Pause Control */}
              {(activeTracker.status === "RUNNING_HMR" || activeTracker.status === "PAUSED_BREAKDOWN") && (
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    activeTracker.isBreakdownPaused
                      ? "bg-rose-50 border-rose-400"
                      : "bg-amber-50/70 border-amber-300"
                  }`}
                >
                  {activeTracker.isBreakdownPaused ? (
                    <>
                      <div className="flex items-center justify-between text-xs font-black text-rose-700">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 animate-pulse" />
                          METER PAUSED (BILLING FROZEN)
                        </span>
                        <span className="font-mono">SOS Active</span>
                      </div>
                      <p className="text-[11px] text-rose-700">
                        Reason: {activeTracker.breakdownReason}. Admin Command OS alerted for immediate mechanic/backup dispatch.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleResumeMeter(activeTracker)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Resume Running Meter</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-xs font-bold text-slate-800">
                        Machine Stalled or Rain Halt on Site?
                      </div>
                      <input
                        type="text"
                        value={pauseReason}
                        onChange={(e) => setPauseReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleBreakdownPause(activeTracker)}
                        className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PauseCircle className="w-4 h-4" />
                        <span>⏸ Pause Meter (Breakdown / Rain SOS)</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Exact Optical Net Bill Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Taxable Optical Usage + Mob.</span>
                  <span className="font-mono">{inr(activeTracker.taxableValue)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>18% GST (SAC 9973)</span>
                  <span className="font-mono">{inr(activeTracker.gstAmount)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-amber-300 pt-1 border-t border-slate-800">
                  <span>Exact Net Bill (Escrow {activeTracker.escrowStatus})</span>
                  <span className="font-mono">{inr(activeTracker.netBillAmount || activeTracker.estimatedTotal)}</span>
                </div>
                {activeTracker.settledUtr && (
                  <div className="text-[10px] font-mono text-emerald-400 pt-1">
                    ✓ Partner Paid via UTR: {activeTracker.settledUtr}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Multi-Image + Full Spec Inspection Modal for Heavy Machine Rentals */}
      <ProductDetailModal
        product={
          detailMachine
            ? {
                id: detailMachine.id,
                slug: detailMachine.slug,
                title: detailMachine.machineName,
                brand: detailMachine.modelName || "CONON Fleet",
                categoryTag: "Heavy Machine Rentals (SAC 9973)",
                price: getRateFor(detailMachine, fuelMode, billingUnit),
                mrp: Math.round(getRateFor(detailMachine, fuelMode, billingUnit) * 1.15),
                unit: billingUnit === "HOUR" ? "Hour" : billingUnit === "WEEK" ? "Week" : "8-Hr Shift",
                image: detailMachine.imageUrl,
                description: detailMachine.description,
                highlights: [detailMachine.capacitySpec, detailMachine.fuelNote, detailMachine.tag].filter(Boolean),
                hsnCode: detailMachine.sacCode || "9973",
                gstRate: 18,
              }
            : null
        }
        open={Boolean(detailMachine)}
        onClose={() => setDetailMachine(null)}
        onAddToCart={() => {
          if (detailMachine) {
            openBookDrawer(detailMachine);
            setDetailMachine(null);
          }
        }}
      />
    </Layout>
  );
}

export default HeavyRentals;

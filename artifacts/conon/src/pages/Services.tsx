import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Wrench,
  ShieldCheck,
  HardHat,
  Calculator,
  Sparkles,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  Users,
  Plus,
  Minus,
  X,
  Lock,
  Wallet,
  CreditCard,
  Camera,
  KeyRound,
  Tractor,
  Phone,
  FileText,
  ArrowRight,
  Radio,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { CononProductMedia } from "@/components/CononProductMedia";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useSafeProductMediaVault } from "@/context/ProductMediaVaultContext";
import { useWallet } from "@/context/WalletContext";
import { useUser } from "@/context/UserContext";
import {
  servicesRentalsSync,
  type ServiceCatalogItem,
  type ServiceBookingRecord,
  type ServiceCategory,
  FALLBACK_SERVICE_CATALOG,
} from "@/services/servicesRentalsSync";

const BRAND = "#1848a0";
const AMBER = "#f59e0b";
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

type FilterTab = "ALL" | ServiceCategory;

const TRADE_TABS: { id: FilterTab; label: string }[] = [
  { id: "ALL", label: "All Trades" },
  { id: "CIVIL", label: "Civil & Structure" },
  { id: "MEP", label: "MEP Plumbing/Electrical" },
  { id: "FINISHING", label: "Finishing" },
  { id: "AUDIT", label: "Engineering Audit" },
];

interface StagePreset {
  id: string;
  label: string;
  badge: string;
  defaultSqft: number;
  defaultDays: number;
  ratioNote: string;
  computeSquad: (sqft: number, days: number, catalog: ServiceCatalogItem[]) => Array<{
    serviceId: string;
    tradeName: string;
    qty: number;
    days: number;
    ratePerShift: number;
  }>;
  crossSell: { id: string; label: string; kind: "RENTAL" | "SERVICE"; rentalId?: string; priceLabel: string };
}

const STAGE_PRESETS: StagePreset[] = [
  {
    id: "dhalai",
    label: "Chhat Dhalai (Slab Pouring)",
    badge: "Most Popular",
    defaultSqft: 1000,
    defaultDays: 1,
    ratioNote: "1000 sq ft RCC roof slab pour crew",
    computeSquad: (sqft, days, catalog) => {
      const f = Math.max(1, sqft / 1000);
      const findRate = (id: string, def: number) => catalog.find((c) => c.id === id)?.shiftRate || def;
      return [
        { serviceId: "srv-head-mistri", tradeName: "Head Civil Mason (Raj Mistri)", qty: Math.max(1, Math.round(2 * f)), days, ratePerShift: findRate("srv-head-mistri", 950) },
        { serviceId: "srv-helper-beldar", tradeName: "Site Helper / Beldar", qty: Math.max(2, Math.round(4 * f)), days, ratePerShift: findRate("srv-helper-beldar", 550) },
        { serviceId: "srv-bar-bender", tradeName: "Bar-Bender & Steel Fitter", qty: Math.max(1, Math.round(1 * f)), days, ratePerShift: findRate("srv-bar-bender", 900) },
        { serviceId: "srv-shuttering-carpenter", tradeName: "Shuttering Carpenter", qty: Math.max(1, Math.round(1 * f)), days, ratePerShift: findRate("srv-shuttering-carpenter", 900) },
      ];
    },
    crossSell: { id: "add-vibrator", label: "+ Add Concrete Needle Vibrator (Rental)", kind: "RENTAL", rentalId: "rent-needle-vibrator", priceLabel: "₹1,100/shift" },
  },
  {
    id: "brickwork",
    label: "Brickwork & Plaster",
    badge: "Wall Masonry",
    defaultSqft: 800,
    defaultDays: 3,
    ratioNote: "4.5\"/9\" wall brickwork & cement plaster crew",
    computeSquad: (sqft, days, catalog) => {
      const f = Math.max(1, sqft / 800);
      const findRate = (id: string, def: number) => catalog.find((c) => c.id === id)?.shiftRate || def;
      return [
        { serviceId: "srv-head-mistri", tradeName: "Head Civil Mason (Raj Mistri)", qty: Math.max(1, Math.round(2 * f)), days, ratePerShift: findRate("srv-head-mistri", 950) },
        { serviceId: "srv-helper-beldar", tradeName: "Site Helper / Beldar", qty: Math.max(2, Math.round(3 * f)), days, ratePerShift: findRate("srv-helper-beldar", 550) },
      ];
    },
    crossSell: { id: "add-mixer", label: "+ Add 1-Bag Concrete/Mortar Mixer (Rental)", kind: "RENTAL", rentalId: "rent-one-bag-mixer", priceLabel: "₹1,650/shift" },
  },
  {
    id: "tile",
    label: "Tile & Marble Flooring",
    badge: "Laser Level",
    defaultSqft: 1000,
    defaultDays: 4,
    ratioNote: "GVT/PGVT vitrified flooring & granite border",
    computeSquad: (sqft, days, catalog) => {
      const f = Math.max(1, sqft / 1000);
      const findRate = (id: string, def: number) => catalog.find((c) => c.id === id)?.shiftRate || def;
      return [
        { serviceId: "srv-tile-mason", tradeName: "Tile, Granite & Marble Mason", qty: Math.max(1, Math.round(2 * f)), days, ratePerShift: findRate("srv-tile-mason", 1050) },
        { serviceId: "srv-helper-beldar", tradeName: "Site Helper / Beldar", qty: Math.max(1, Math.round(2 * f)), days, ratePerShift: findRate("srv-helper-beldar", 550) },
      ];
    },
    crossSell: { id: "add-audit", label: "+ Add ₹499 CONON Civil Engineer Site Audit", kind: "SERVICE", priceLabel: "₹499/visit" },
  },
  {
    id: "plumbing",
    label: "Complete Plumbing & CPVC",
    badge: "Pressure Test",
    defaultSqft: 1200,
    defaultDays: 2,
    ratioNote: "2-bathroom concealed CPVC/SWR line + fixtures",
    computeSquad: (sqft, days, catalog) => {
      const f = Math.max(1, sqft / 1200);
      const findRate = (id: string, def: number) => catalog.find((c) => c.id === id)?.shiftRate || def;
      return [
        { serviceId: "srv-cpvc-plumber", tradeName: "Master CPVC & Sanitary Plumber", qty: Math.max(1, Math.round(2 * f)), days, ratePerShift: findRate("srv-cpvc-plumber", 850) },
        { serviceId: "srv-helper-beldar", tradeName: "Site Helper / Beldar", qty: 1, days, ratePerShift: findRate("srv-helper-beldar", 550) },
      ];
    },
    crossSell: { id: "add-breaker", label: "+ Add Bosch Wall Chaser / Breaker (Rental)", kind: "RENTAL", rentalId: "rent-bosch-breaker", priceLabel: "₹1,450/shift" },
  },
  {
    id: "electrical",
    label: "House Wiring & MCB",
    badge: "3-Phase Safe",
    defaultSqft: 1200,
    defaultDays: 2,
    ratioNote: "Conduit piping, FR copper wire pull & DB dressing",
    computeSquad: (sqft, days, catalog) => {
      const f = Math.max(1, sqft / 1200);
      const findRate = (id: string, def: number) => catalog.find((c) => c.id === id)?.shiftRate || def;
      return [
        { serviceId: "srv-licensed-electrician", tradeName: "Certified Wireman & Electrician", qty: Math.max(1, Math.round(2 * f)), days, ratePerShift: findRate("srv-licensed-electrician", 850) },
        { serviceId: "srv-helper-beldar", tradeName: "Site Helper / Beldar", qty: 1, days, ratePerShift: findRate("srv-helper-beldar", 550) },
      ];
    },
    crossSell: { id: "add-audit", label: "+ Add ₹499 CONON Civil Engineer Site Audit", kind: "SERVICE", priceLabel: "₹499/visit" },
  },
  {
    id: "painting",
    label: "Interior Painting & Putty",
    badge: "Dust-Free",
    defaultSqft: 1500,
    defaultDays: 3,
    ratioNote: "2-coat Birla putty + primer + emulsion roller",
    computeSquad: (sqft, days, catalog) => {
      const f = Math.max(1, sqft / 1500);
      const findRate = (id: string, def: number) => catalog.find((c) => c.id === id)?.shiftRate || def;
      return [
        { serviceId: "srv-painter-putty", tradeName: "Painter & Birla Putty Specialist", qty: Math.max(2, Math.round(3 * f)), days, ratePerShift: findRate("srv-painter-putty", 800) },
        { serviceId: "srv-helper-beldar", tradeName: "Site Helper / Beldar", qty: 1, days, ratePerShift: findRate("srv-helper-beldar", 550) },
      ];
    },
    crossSell: { id: "add-scaffold", label: "+ Add MS Scaffolding Access Set (Rental)", kind: "RENTAL", rentalId: "rent-scaffolding-shuttering", priceLabel: "₹950/shift" },
  },
];

const LUCKNOW_ZONES = [
  "Gomti Nagar Extension",
  "Sushant Golf City",
  "Indira Nagar",
  "Alambagh / Transport Nagar",
  "Hazratganj / Mahanagar",
  "Jankipuram / Sitapur Rd",
];

export function Services() {
  const wallet = useWallet();
  const { user } = useUser();
  const vault = useSafeProductMediaVault();
  const vaultVersion = vault?.version ?? 0;

  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>(FALLBACK_SERVICE_CATALOG);
  const [detailService, setDetailService] = useState<ServiceCatalogItem | null>(null);
  const [bookings, setBookings] = useState<ServiceBookingRecord[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [crewQtys, setCrewQtys] = useState<Record<string, number>>({});

  // Smart Squad Builder State
  const [selectedPresetId, setSelectedPresetId] = useState<string>("dhalai");
  const [siteAreaSqft, setSiteAreaSqft] = useState<number>(1000);
  const [squadDays, setSquadDays] = useState<number>(1);
  const [addCrossSellRental, setAddCrossSellRental] = useState<boolean>(false);
  const [addCrossSellAudit, setAddCrossSellAudit] = useState<boolean>(false);

  // Booking Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftSquad, setDraftSquad] = useState<Array<{ serviceId: string; tradeName: string; qty: number; days: number; ratePerShift: number }>>([]);
  const [bookingTitle, setBookingTitle] = useState("");
  const [siteDate, setSiteDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [shiftSlot, setShiftSlot] = useState("Morning 8:30 AM – 5:00 PM");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerGstin, setCustomerGstin] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [lucknowZone, setLucknowZone] = useState(LUCKNOW_ZONES[0]);
  const [materialComboNote, setMaterialComboNote] = useState("");
  const [paymentMode, setPaymentMode] = useState<"LIVING_VAULT" | "UPI">("LIVING_VAULT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTrackerBooking, setActiveTrackerBooking] = useState<ServiceBookingRecord | null>(null);

  const loadAll = async () => {
    const [items, bks] = await Promise.all([
      servicesRentalsSync.fetchServiceCatalog(),
      servicesRentalsSync.fetchServiceBookings(),
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
    if (activeTrackerBooking) {
      const fresh = bookings.find((b) => b.id === activeTrackerBooking.id);
      if (fresh) setActiveTrackerBooking(fresh);
    }
  }, [bookings]);

  const activePreset = useMemo(
    () => STAGE_PRESETS.find((p) => p.id === selectedPresetId) || STAGE_PRESETS[0],
    [selectedPresetId]
  );

  const calculatedSquad = useMemo(
    () => activePreset.computeSquad(siteAreaSqft, squadDays, catalog),
    [activePreset, siteAreaSqft, squadDays, catalog]
  );

  const squadTotals = useMemo(() => {
    let subtotal = calculatedSquad.reduce((s, i) => s + i.qty * i.days * i.ratePerShift, 0);
    if (addCrossSellAudit) {
      const auditRate = catalog.find((c) => c.id === "srv-civil-engineer-audit")?.shiftRate || 499;
      subtotal += auditRate;
    }
    const gst = Math.round(subtotal * 0.18);
    return { subtotal, gst, total: subtotal + gst };
  }, [calculatedSquad, addCrossSellAudit, catalog]);

  const filteredCatalog = useMemo(
    () => (activeTab === "ALL" ? catalog : catalog.filter((c) => c.category === activeTab)),
    [catalog, activeTab]
  );

  const handleSelectPreset = (preset: StagePreset) => {
    setSelectedPresetId(preset.id);
    setSiteAreaSqft(preset.defaultSqft);
    setSquadDays(preset.defaultDays);
    setAddCrossSellRental(false);
    setAddCrossSellAudit(false);
  };

  const openBookEntireSquad = () => {
    const items = [...calculatedSquad];
    if (addCrossSellAudit && !items.some((i) => i.serviceId === "srv-civil-engineer-audit")) {
      const audit = catalog.find((c) => c.id === "srv-civil-engineer-audit");
      items.push({
        serviceId: "srv-civil-engineer-audit",
        tradeName: audit?.tradeName || "CONON Civil Engineer Site Audit",
        qty: 1,
        days: 1,
        ratePerShift: audit?.shiftRate || 499,
      });
    }
    setDraftSquad(items);
    setBookingTitle(`${activePreset.label} Verified Squad (${siteAreaSqft} sq ft)`);
    setDrawerOpen(true);
  };

  const openBookSingleTrade = (svc: ServiceCatalogItem) => {
    const qty = crewQtys[svc.id] || 1;
    setDraftSquad([
      {
        serviceId: svc.id,
        tradeName: svc.tradeName,
        qty,
        days: 1,
        ratePerShift: svc.shiftRate,
      },
    ]);
    setBookingTitle(`${svc.tradeName} × ${qty} Shift`);
    setDrawerOpen(true);
  };

  const draftFinancials = useMemo(() => {
    const subtotal = draftSquad.reduce((s, item) => s + item.qty * item.days * item.ratePerShift, 0);
    const gst = Math.round(subtotal * 0.18);
    return { subtotal, gst, total: subtotal + gst };
  }, [draftSquad]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !siteAddress.trim()) {
      toast.error("Please enter Site Contact Name, Phone & Lucknow Site Address");
      return;
    }

    if (paymentMode === "LIVING_VAULT" && wallet.balance < draftFinancials.total) {
      toast.warning(`Living Vault balance (${inr(wallet.balance)}) is below ${inr(draftFinancials.total)} — switched to UPI Escrow Lock.`);
      setPaymentMode("UPI");
      return;
    }

    setIsSubmitting(true);
    try {
      const addons: string[] = [];
      if (addCrossSellRental && activePreset.crossSell.kind === "RENTAL" && activePreset.crossSell.rentalId) {
        addons.push(activePreset.crossSell.label);
        await servicesRentalsSync.createRentalBooking({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerGstin: customerGstin.trim() || undefined,
          siteAddress: siteAddress.trim(),
          lucknowZone,
          machineId: activePreset.crossSell.rentalId,
          fuelMode: "WET",
          billingUnit: "SHIFT",
          quantityUnits: squadDays,
          paymentMode,
        });
      }

      const created = await servicesRentalsSync.createServiceBooking({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerGstin: customerGstin.trim() || undefined,
        siteAddress: siteAddress.trim(),
        lucknowZone,
        bookingDate: siteDate,
        shiftSlot,
        materialComboNote: materialComboNote.trim() || undefined,
        squadItems: draftSquad.map((d) => ({
          serviceId: d.serviceId,
          qty: d.qty,
          days: d.days,
        })),
        crossSellAddons: addons,
        paymentMode,
      });

      if (paymentMode === "LIVING_VAULT") {
        wallet.spend(created.totalAmount, `Escrow Lock • ${created.shortId} (SAC 9954)`);
      }

      setDrawerOpen(false);
      setActiveTrackerBooking(created);
      toast.success(`Skilled Squad Booked • #${created.shortId}`, {
        description: `Start OTP: ${created.startOtp} | End OTP: ${created.endOtp}. Sent live to Partner & Admin Radar!`,
      });
      void loadAll();
    } catch (err: any) {
      toast.error(err.message || "Could not complete booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-full pb-20">
        {/* TOP HERO STRIP */}
        <section
          className="px-4 sm:px-8 pt-7 pb-8 rounded-b-[32px] shadow-lg text-white"
          style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #0f2f70 100%)` }}
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-amber-300" />
                </span>
                <div>
                  <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight leading-none">
                    CONON Skilled Services Studio
                  </h1>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200 mt-1">
                    Verified Mistri Squads • GPS Selfie Haziri • Escrow Protected (SAC 9954)
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl mt-2 leading-relaxed">
                Book Aadhaar-verified Lucknow Raj Mistris, Steel Fitters, CPVC Plumbers, Electricians &amp; B.Tech Civil Auditors with transparent 8-hour shift rates and dual Start/End OTP protection.
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> Aadhaar + Skill Tested
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold">
                  <Camera className="w-3.5 h-3.5 text-amber-300" /> GPS Selfie Haziri
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-300" /> Escrow Until End OTP
                </span>
              </div>
            </div>

            {/* Active Living Vault Balance Pill */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:min-w-[260px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200 flex items-center justify-between">
                <span>CONON Living Vault Balance</span>
                <Wallet className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {inr(wallet.balance)}
              </div>
              <p className="text-[10px] text-emerald-300 font-bold mt-1">
                ✓ Instant 0-Fee Escrow Protection Active
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 -mt-4">
          {/* LIVE ACTIVE SERVICE TRACKER (Shown only when customer has organic bookings) */}
          {bookings.length > 0 && (
            <section className="bg-white rounded-3xl border border-amber-300 shadow-lg p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900">
                    Your Active Service Shifts ({bookings.length})
                  </h2>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  Live Socket.io Sync • Share OTP ONLY on site
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {bookings.map((b) => {
                  const steps = [
                    { key: "BOOKED", label: "Booked", done: true },
                    { key: "PARTNER_ACCEPTED", label: "Accepted", done: b.status !== "BOOKED" },
                    { key: "HAZIRI_VERIFIED_IN_PROGRESS", label: "GPS Haziri", done: b.haziriGpsVerified },
                    { key: "ESCROW_SETTLED", label: "Escrow Paid", done: b.escrowStatus === "SETTLED" },
                  ];
                  return (
                    <div
                      key={b.id}
                      onClick={() => setActiveTrackerBooking(b)}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:border-amber-400 transition cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              #{b.shortId}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {b.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-1">
                            {b.squadItems.map((i) => `${i.qty}× ${i.tradeName}`).join(" + ")}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {b.siteAddress} ({b.lucknowZone}) • {b.bookingDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-base text-slate-900 font-mono">{inr(b.totalAmount)}</span>
                          <span className="block text-[9px] font-bold text-emerald-700">Escrow: {b.escrowStatus}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {steps.map((s) => (
                          <div
                            key={s.key}
                            className={`text-center py-1 px-1 rounded-lg text-[10px] font-bold border ${
                              s.done
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-white border-slate-200 text-slate-400"
                            }`}
                          >
                            {s.done ? "✓ " : ""}{s.label}
                          </div>
                        ))}
                      </div>

                      {/* Start/End OTPs & Haziri Preview */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-mono font-black text-[11px]">
                            Start OTP: {b.startOtp}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-300 font-mono font-black text-[11px]">
                            End OTP: {b.endOtp}
                          </span>
                        </div>
                        {b.haziriGpsVerified && b.selfieHaziriUrl && (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> GPS Selfie Haziri Verified
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* WORLD-FIRST "SMART SQUAD BUILDER" CALCULATOR */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3" /> World-First Construction Tool
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-700" />
                  Smart Squad Builder — Auto-Calculate Verified Site Team
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">SAC 9954 • 18% GST Input Credit Ready</span>
            </div>

            {/* 6 Construction Stage Preset Chips */}
            <div className="mt-4">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2">
                1. Choose Construction Work Stage
              </label>
              <div className="flex flex-wrap gap-2">
                {STAGE_PRESETS.map((p) => {
                  const on = p.id === selectedPresetId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                        on
                          ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{p.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                          on ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {p.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Area & Duration Inputs + Live Calculated Squad Output */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5 items-stretch">
              <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>Site Area (sq ft)</span>
                    <span className="font-mono text-blue-700 font-black">{siteAreaSqft} sq ft</span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={5000}
                    step={100}
                    value={siteAreaSqft}
                    onChange={(e) => setSiteAreaSqft(Number(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>300 sq ft</span>
                    <span>{activePreset.ratioNote}</span>
                    <span>5,000 sq ft</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Duration (Days / Shifts)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 5, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSquadDays(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                          squadDays === d
                            ? "bg-amber-400 border-amber-400 text-slate-950"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Smart Cross-Sell Add-Ons */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Recommended Site Pairings (1-Tap)
                  </div>
                  {activePreset.crossSell.kind === "RENTAL" && (
                    <button
                      type="button"
                      onClick={() => setAddCrossSellRental((v) => !v)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        addCrossSellRental
                          ? "bg-amber-50 border-amber-400 text-amber-900"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Tractor className="w-3.5 h-3.5 text-amber-600" />
                        <span>{activePreset.crossSell.label}</span>
                      </span>
                      <span className="font-mono text-[11px] font-black text-amber-700">
                        {addCrossSellRental ? "✓ Added" : activePreset.crossSell.priceLabel}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setAddCrossSellAudit((v) => !v)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      addCrossSellAudit
                        ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+ Add ₹499 CONON Civil Engineer Site Audit</span>
                    </span>
                    <span className="font-mono text-[11px] font-black text-emerald-700">
                      {addCrossSellAudit ? "✓ Added" : "₹499/visit"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Calculated Squad Breakdown Card */}
              <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-[#0f172a] text-white rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      Recommended Verified Squad ({squadDays} {squadDays === 1 ? "Day" : "Days"})
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      Lucknow Benchmark Rates
                    </span>
                  </div>

                  <div className="space-y-2">
                    {calculatedSquad.map((s) => (
                      <div
                        key={s.serviceId}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70"
                      >
                        <div>
                          <span className="font-black text-amber-300 mr-1.5">{s.qty}×</span>
                          <span className="font-bold text-white">{s.tradeName}</span>
                          <span className="text-slate-400 ml-2 font-mono">
                            ({inr(s.ratePerShift)}/shift × {s.days}d)
                          </span>
                        </div>
                        <span className="font-mono font-black text-white">
                          {inr(s.qty * s.days * s.ratePerShift)}
                        </span>
                      </div>
                    ))}
                    {addCrossSellAudit && (
                      <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30">
                        <span className="font-bold text-emerald-300">+ CONON B.Tech Civil Engineer Site Audit</span>
                        <span className="font-mono font-black text-emerald-300">₹499</span>
                      </div>
                    )}
                    {addCrossSellRental && (
                      <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30">
                        <span className="font-bold text-amber-300">
                          + Cross-Sell Machine Rental ({activePreset.crossSell.label.replace("+ Add ", "")})
                        </span>
                        <span className="font-mono font-black text-amber-300">Auto-Booked</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] text-slate-400">
                      Subtotal {inr(squadTotals.subtotal)} + 18% GST (SAC 9954) {inr(squadTotals.gst)}
                    </div>
                    <div className="text-2xl font-black text-white font-mono">
                      {inr(squadTotals.total)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openBookEntireSquad}
                    className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Book Entire Squad (Escrow Protected)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* VERIFIED TRADE SERVICE CARDS + FILTER TABS */}
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Verified Construction Trades ({filteredCatalog.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Direct Lucknow shift rates • Zero middleman haggling • Real-time partner crew availability
                </p>
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {TRADE_TABS.map((t) => {
                  const on = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-black transition cursor-pointer ${
                        on
                          ? "bg-blue-700 text-white shadow-sm"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCatalog.map((svc, idx) => {
                const qty = crewQtys[svc.id] || 1;
                return (
                  <motion.div
                    key={svc.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Real Studio/Editorial Photo */}
                      <div
                        onClick={() => setDetailService(svc)}
                        className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
                        title="Tap to inspect photos & specifications"
                      >
                        <CononProductMedia
                          mediaType="service"
                          itemId={svc.id}
                          slug={svc.slug}
                          src={svc.imageUrl}
                          title={svc.tradeName}
                          brand={svc.category || "SKILLED CREW"}
                          categorySlug="skilled-services"
                          unit="Per Shift"
                          variant="cover"
                        />
                        <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-sm">
                            {svc.badge}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/95 text-emerald-700 shadow-xs flex items-center gap-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                svc.isPartnerOnline ? "bg-emerald-500 animate-ping" : "bg-emerald-500"
                              }`}
                            />
                            {svc.isPartnerOnline
                              ? `${svc.activePartnerCount} Partner Live`
                              : "Lucknow Dispatch Ready"}
                          </span>
                        </div>
                        <span className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-900/80 text-amber-300">
                          SAC {svc.sacCode}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-base font-black text-slate-900 leading-snug">
                                {svc.tradeName}
                              </h3>
                              <p className="text-[11px] font-bold text-slate-500">
                                {svc.tradeNameHi}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-lg font-black font-mono" style={{ color: BRAND }}>
                                {inr(svc.shiftRate)}
                              </span>
                              <span className="block text-[10px] font-bold text-slate-400">
                                /{svc.unit}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                            {svc.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {svc.highlights.slice(0, 3).map((h) => (
                            <span
                              key={h}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700"
                            >
                              ✓ {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer: Crew Qty Selector + Book Shift CTA */}
                    <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                        <button
                          type="button"
                          onClick={() => setCrewQtys((q) => ({ ...q, [svc.id]: Math.max(1, (q[svc.id] || 1) - 1) }))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white cursor-pointer"
                          aria-label="Decrease crew"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-black font-mono text-slate-900">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCrewQtys((q) => ({ ...q, [svc.id]: Math.min(20, (q[svc.id] || 1) + 1) }))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white cursor-pointer"
                          aria-label="Increase crew"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => openBookSingleTrade(svc)}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-white shadow-sm hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-1.5"
                        style={{ background: BRAND }}
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-300" />
                        <span>Book Shift • {inr(svc.shiftRate * qty)}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* SMART ESCROW BOOKING DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
              onClick={() => setDrawerOpen(false)}
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
                      CONON ESCROW DISPATCH • SAC 9954
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">{bookingTitle}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Squad Summary */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  {draftSquad.map((d) => (
                    <div key={d.serviceId} className="flex items-center justify-between font-bold text-slate-800">
                      <span>{d.qty}× {d.tradeName} ({d.days}d)</span>
                      <span className="font-mono">{inr(d.qty * d.days * d.ratePerShift)}</span>
                    </div>
                  ))}
                  <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>18% GST (SAC 9954 Tax Invoice)</span>
                    <span className="font-mono">{inr(draftFinancials.gst)}</span>
                  </div>
                  <div className="flex items-center justify-between font-black text-sm text-slate-900">
                    <span>Escrow Total Payable</span>
                    <span className="font-mono text-blue-700">{inr(draftFinancials.total)}</span>
                  </div>
                </div>

                {/* CONON Trust Lock Callout */}
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-black">CONON Trust Lock:</strong> Payment stays safely in Escrow until the crew completes <strong>GPS Group-Selfie Attendance</strong> on site + verifies your <strong>Start &amp; End OTP</strong>!
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Site Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                      value={siteDate}
                      onChange={(e) => setSiteDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Shift Slot</label>
                    <select
                      value={shiftSlot}
                      onChange={(e) => setShiftSlot(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
                    >
                      <option value="Morning 8:30 AM – 5:00 PM">Morning 8:30 AM – 5:00 PM</option>
                      <option value="Urgent 90-Min Dispatch">Urgent 90-Min Dispatch</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amit Kumar / Site Incharge"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit WhatsApp phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Lucknow Zone</label>
                    <select
                      value={lucknowZone}
                      onChange={(e) => setLucknowZone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900"
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
                      placeholder="e.g. 09AABCC1234F1Z5"
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Lucknow Site Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Plot / House No, Sector, Landmark in Lucknow"
                      value={siteAddress}
                      onChange={(e) => setSiteAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Optional Material Combo Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Also pairing 40 bags UltraTech OPC cement from Naka depot"
                      value={materialComboNote}
                      onChange={(e) => setMaterialComboNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Payment Mode Selector */}
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
                      Living Vault Escrow
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">
                      Avail: {inr(wallet.balance)}
                    </div>
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
                      UPI Escrow Hold
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                      GPay / PhonePe / Paytm
                    </div>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl text-white font-black text-sm shadow-lg transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: BRAND }}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>
                    {isSubmitting
                      ? "Locking Escrow & Dispatching..."
                      : `Lock ${inr(draftFinancials.total)} in Escrow & Book`}
                  </span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ACTIVE SERVICE BOOKING DETAIL MODAL */}
      <AnimatePresence>
        {activeTrackerBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
              onClick={() => setActiveTrackerBooking(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-[92%] bg-white rounded-3xl p-5 sm:p-6 z-50 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-black text-blue-700 uppercase">
                    Service Tracker • #{activeTrackerBooking.shortId}
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    GPS Selfie Haziri &amp; OTP Shield
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTrackerBooking(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] font-bold uppercase text-amber-800">Start Shift OTP</div>
                  <div className="text-2xl font-black font-mono text-amber-700 mt-0.5">
                    {activeTrackerBooking.startOtp}
                  </div>
                  <div className="text-[10px] text-amber-600">Share when crew arrives</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-bold uppercase text-emerald-800">End Shift OTP</div>
                  <div className="text-2xl font-black font-mono text-emerald-700 mt-0.5">
                    {activeTrackerBooking.endOtp}
                  </div>
                  <div className="text-[10px] text-emerald-600">Share after work check</div>
                </div>
              </div>

              {activeTrackerBooking.selfieHaziriUrl ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-800">
                    <span>✓ GPS Group-Selfie Haziri Verified</span>
                    <span className="font-mono text-[10px]">{activeTrackerBooking.haziriCoords}</span>
                  </div>
                  <img
                    src={activeTrackerBooking.selfieHaziriUrl}
                    alt="Crew GPS Selfie Haziri"
                    className="w-full h-40 object-cover rounded-xl border border-emerald-200"
                  />
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
                  <Radio className="w-6 h-6 text-amber-500 mx-auto mb-1.5 animate-pulse" />
                  Awaiting verified partner crew check-in with live GPS Selfie Haziri.
                </div>
              )}

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Partner:</span>
                  <span className="font-bold text-slate-900">
                    {activeTrackerBooking.assignedVendorName || "Assigning Verified Crew..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Escrow Status:</span>
                  <span className="font-black text-blue-700">{activeTrackerBooking.escrowStatus}</span>
                </div>
                {activeTrackerBooking.settledUtr && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">UPI Settlement Ref:</span>
                    <span className="font-mono font-bold text-emerald-700">{activeTrackerBooking.settledUtr}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Multi-Image + Full Spec Inspection Modal for Skilled Trades */}
      <ProductDetailModal
        product={
          detailService
            ? {
                id: detailService.id,
                slug: detailService.slug,
                title: detailService.tradeName,
                brand: detailService.badge || "CONON Verified Crew",
                categoryTag: "Skilled Services (SAC 9954)",
                price: detailService.shiftRate,
                mrp: Math.round(detailService.shiftRate * 1.15),
                unit: detailService.unit || "8-Hr Shift",
                image: detailService.imageUrl,
                description: detailService.description,
                highlights: detailService.highlights,
                hsnCode: detailService.sacCode || "9954",
                gstRate: 18,
              }
            : null
        }
        open={Boolean(detailService)}
        onClose={() => setDetailService(null)}
        onAddToCart={() => {
          if (detailService) {
            openBookSingleTrade(detailService);
            setDetailService(null);
          }
        }}
      />
    </Layout>
  );
}

export default Services;

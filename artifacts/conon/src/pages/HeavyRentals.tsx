import React, { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import {
  Tractor, Shield, Star, Zap, Clock, MapPin, X, CheckCircle2,
  CalendarDays, UserCheck, ShoppingCart, Construction,
} from "lucide-react";

import jcbImg from "@assets/rentals/jcb-3dx.jpg";
import excavatorImg from "@assets/rentals/excavator-pc210.jpg";
import miniExcavatorImg from "@assets/rentals/mini-excavator.jpg";
import tractorImg from "@assets/rentals/tractor-trolley.jpg";
import tipperImg from "@assets/rentals/tipper-dumper.png";
import mixerTruckImg from "@assets/rentals/transit-mixer.jpg";
import concreteMixerImg from "@assets/rentals/concrete-mixer.jpg";
import vibratorImg from "@assets/rentals/needle-vibrator.png";
import scaffoldingImg from "@assets/rentals/scaffolding.jpg";

const BRAND = "#1b4366";
const AMBER = "#f59e0b";
const NEON = "#84cc16";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

const OPERATOR_ADD = { hour: 100, shift: 600, week: 3600 } as const;
type RateType = keyof typeof OPERATOR_ADD;

type Equipment = {
  id: string;
  name: string;
  model: string;
  category: "earthmoving" | "transport" | "light";
  image: string;
  tag: string;
  availability: string;
  needsOperator: boolean;
  rates: { hour: number; shift: number; week: number };
};

const CATEGORIES = [
  { id: "all", label: "All Machines" },
  { id: "earthmoving", label: "Earthmoving" },
  { id: "transport", label: "Transport" },
  { id: "light", label: "Light Tools" },
] as const;

const EQUIPMENT: Equipment[] = [
  {
    id: "jcb-3dx", name: "JCB Backhoe Loader", model: "JCB 3DX Super",
    category: "earthmoving", image: jcbImg, tag: "Most Booked",
    availability: "Available in 2 Hours", needsOperator: true,
    rates: { hour: 800, shift: 5500, week: 32000 },
  },
  {
    id: "excavator-pc210", name: "Hydraulic Excavator", model: "Komatsu PC210",
    category: "earthmoving", image: excavatorImg, tag: "Heavy Duty",
    availability: "Available in 4 Hours", needsOperator: true,
    rates: { hour: 2100, shift: 14000, week: 82000 },
  },
  {
    id: "mini-excavator", name: "Mini Excavator", model: "Bobcat E20z",
    category: "earthmoving", image: miniExcavatorImg, tag: "Compact Sites",
    availability: "Available Now", needsOperator: true,
    rates: { hour: 950, shift: 6500, week: 38000 },
  },
  {
    id: "tractor-trolley", name: "Tractor with Trolley", model: "Mahindra 575 DI",
    category: "transport", image: tractorImg, tag: "Short Haul",
    availability: "Available Now", needsOperator: true,
    rates: { hour: 500, shift: 3500, week: 21000 },
  },
  {
    id: "tipper-dumper", name: "Tipper Dumper", model: "Tata 10-Wheel 16 m³",
    category: "transport", image: tipperImg, tag: "Bulk Haul",
    availability: "Available in 2 Hours", needsOperator: true,
    rates: { hour: 1100, shift: 7500, week: 44000 },
  },
  {
    id: "transit-mixer", name: "Transit Mixer", model: "Schwing Stetter 6 m³",
    category: "transport", image: mixerTruckImg, tag: "RMC Delivery",
    availability: "Available in 3 Hours", needsOperator: true,
    rates: { hour: 1500, shift: 9500, week: 55000 },
  },
  {
    id: "concrete-mixer", name: "Concrete Mixer", model: "10/7 Diesel Mixer",
    category: "light", image: concreteMixerImg, tag: "Site Casting",
    availability: "Available Now", needsOperator: false,
    rates: { hour: 250, shift: 1500, week: 8500 },
  },
  {
    id: "needle-vibrator", name: "Needle Vibrator Set", model: "40mm Electric Poker",
    category: "light", image: vibratorImg, tag: "Slab & Column",
    availability: "Available Now", needsOperator: false,
    rates: { hour: 180, shift: 1100, week: 6000 },
  },
  {
    id: "scaffolding", name: "Steel Scaffolding", model: "Cuplock · per 100 sqm",
    category: "light", image: scaffoldingImg, tag: "Access & Support",
    availability: "Available in 6 Hours", needsOperator: false,
    rates: { hour: 120, shift: 800, week: 4500 },
  },
];

const RATE_META: { id: RateType; label: string; sub: string }[] = [
  { id: "hour", label: "Per Hour", sub: "Min 4 hrs" },
  { id: "shift", label: "Per Shift", sub: "8 Hrs" },
  { id: "week", label: "Per Week", sub: "7 Days" },
];

export function HeavyRentals() {
  const [activeCat, setActiveCat] = useState<string>("all");
  const [booking, setBooking] = useState<Equipment | null>(null);
  const [rateType, setRateType] = useState<RateType>("shift");
  const [withOperator, setWithOperator] = useState(true);

  const qc = useQueryClient();
  const addToCart = useAddToCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });

  const list = useMemo(
    () => (activeCat === "all" ? EQUIPMENT : EQUIPMENT.filter((e) => e.category === activeCat)),
    [activeCat],
  );

  const openBooking = (eq: Equipment) => {
    setRateType("shift");
    setWithOperator(eq.needsOperator);
    setBooking(eq);
  };

  const operatorAdd = booking && withOperator && booking.needsOperator ? OPERATOR_ADD[rateType] : 0;
  const baseRate = booking ? booking.rates[rateType] : 0;
  const total = baseRate + operatorAdd;
  const rateLabel = RATE_META.find((r) => r.id === rateType)?.label ?? "Per Shift";

  const confirmBooking = () => {
    if (!booking) return;
    const eq = booking;
    addToCart.mutate(
      {
        data: {
          materialId: `rent-${eq.id}-${rateType}`,
          quantity: 1,
          name: `${eq.model} · ${rateLabel}${operatorAdd ? " + Operator" : ""}`,
          price: total,
          unit: rateLabel,
          vendor: "Conon Heavy Rentals",
          category: "rental",
        },
      },
      {
        onSuccess: () => {
          toast.success(`${eq.name} booked!`, {
            description: `${rateLabel} @ ${inr(total)} added to your cart · ${eq.availability}.`,
          });
          setBooking(null);
        },
        onError: () => toast.error("Couldn't book this machine. Please try again."),
      },
    );
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-full pb-6">
        {/* Hero */}
        <div className="px-5 pt-7 pb-7 rounded-b-[36px] shadow-lg" style={{ background: BRAND }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Tractor className="w-5 h-5 text-amber-300" strokeWidth={2.4} />
            </span>
            <div>
              <h2 className="font-display font-black italic text-2xl text-white leading-none">Heavy Rentals</h2>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em] mt-1">Machines On Rent · By the Hour</p>
            </div>
          </div>
          <p className="text-sm text-blue-100/90 leading-snug mt-3">
            JCBs, excavators, tippers &amp; site tools — delivered with certified operators.
            Transparent hourly, shift &amp; weekly rates.
          </p>
          <div className="flex gap-2 mt-4">
            <Trust icon={<Shield className="w-3 h-3" />} label="Insured Fleet" />
            <Trust icon={<Clock className="w-3 h-3" />} label="2-Hr Dispatch" />
            <Trust icon={<Star className="w-3 h-3" />} label="Verified Operators" />
          </div>
        </div>

        {/* Category filter */}
        <div className="px-4 mt-5">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((c) => {
              const on = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all"
                  style={{
                    background: on ? BRAND : "#fff",
                    color: on ? "#fff" : "#64748b",
                    border: on ? "none" : "1px solid #e2e8f0",
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Equipment grid */}
        <div className="px-4 mt-4 grid grid-cols-1 gap-4">
          {list.map((eq, i) => (
            <motion.div
              key={eq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm"
            >
              <div className="relative h-40 w-full bg-slate-100">
                <img src={eq.image} alt={eq.model} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                  <span
                    className="text-[9px] font-black px-2.5 py-1 rounded-full text-white backdrop-blur"
                    style={{ background: "rgba(27,67,102,0.82)" }}
                  >
                    {eq.tag}
                  </span>
                  <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-white/95 text-emerald-700 flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {eq.availability}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{eq.name}</p>
                <h3 className="font-display font-black text-slate-800 text-base leading-tight mt-0.5">{eq.model}</h3>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="font-black text-lg" style={{ color: BRAND }}>{inr(eq.rates.hour)}</span>
                    <span className="text-[11px] text-slate-400 font-bold">/hr</span>
                    <p className="text-[10px] text-slate-400 font-bold">{inr(eq.rates.shift)}/shift · {inr(eq.rates.week)}/wk</p>
                    {eq.needsOperator && (
                      <p className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Operator available
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => openBooking(eq)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white text-xs font-black active:scale-95 transition shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${AMBER} 0%, #f97316 100%)` }}
                  >
                    <CalendarDays className="w-3.5 h-3.5" strokeWidth={2.6} /> Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking modal */}
      <AnimatePresence>
        {booking && (
          <motion.div
            key="rental-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40" onClick={() => setBooking(null)}
          />
        )}
        {booking && (
          <motion.div
            key="rental-sheet"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-50 bg-white rounded-t-[32px] overflow-hidden"
          >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />
              <div className="px-5 pt-3 pb-2 flex items-center justify-between">
                <h3 className="font-display font-black text-lg" style={{ color: BRAND }}>Book Machine</h3>
                <button onClick={() => setBooking(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 pb-7 pt-2">
                {/* Selected machine */}
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-[18px]">
                  <img src={booking.image} alt={booking.model} className="w-16 h-16 rounded-[14px] object-cover" />
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-sm leading-tight">{booking.model}</p>
                    <p className="text-[11px] text-slate-500">{booking.name}</p>
                    <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {booking.availability}
                    </p>
                  </div>
                </div>

                {/* Pricing toggle */}
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 mb-2">Choose Rate</p>
                <div className="grid grid-cols-3 gap-2">
                  {RATE_META.map((r) => {
                    const on = rateType === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setRateType(r.id)}
                        className="rounded-2xl py-2.5 px-1 text-center transition-all border-2"
                        style={{
                          borderColor: on ? AMBER : "#e2e8f0",
                          background: on ? `${AMBER}12` : "#fff",
                        }}
                      >
                        <p className="text-[11px] font-black" style={{ color: on ? "#b45309" : "#475569" }}>{r.label}</p>
                        <p className="text-[8px] font-bold text-slate-400">{r.sub}</p>
                        <p className="text-sm font-black mt-0.5" style={{ color: BRAND }}>{inr(booking.rates[r.id])}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Operator toggle */}
                {booking.needsOperator && (
                  <button
                    onClick={() => setWithOperator((v) => !v)}
                    className="w-full mt-3 flex items-center justify-between p-3 rounded-2xl border-2 transition-all"
                    style={{ borderColor: withOperator ? `${NEON}66` : "#e2e8f0", background: withOperator ? `${NEON}10` : "#fff" }}
                  >
                    <span className="flex items-center gap-2 text-left">
                      <UserCheck className="w-4 h-4" style={{ color: withOperator ? "#3f6212" : "#94a3b8" }} />
                      <span>
                        <span className="block text-[12px] font-black text-slate-700">Certified Operator / Driver</span>
                        <span className="block text-[10px] font-bold text-slate-400">+{inr(OPERATOR_ADD.shift)}/shift · trained &amp; insured</span>
                      </span>
                    </span>
                    <span
                      className="w-11 h-6 rounded-full p-0.5 flex items-center transition-all shrink-0"
                      style={{ background: withOperator ? NEON : "#cbd5e1", justifyContent: withOperator ? "flex-end" : "flex-start" }}
                    >
                      <span className="w-5 h-5 rounded-full bg-white shadow" />
                    </span>
                  </button>
                )}

                {/* Total */}
                <div className="flex items-center justify-between mt-4 p-3 rounded-2xl bg-slate-50">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total · {rateLabel}</p>
                    <span className="font-black text-2xl" style={{ color: BRAND }}>{inr(total)}</span>
                    {operatorAdd > 0 && (
                      <p className="text-[10px] font-bold text-slate-500">{inr(baseRate)} machine + {inr(operatorAdd)} operator</p>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 text-right">
                    <MapPin className="w-4 h-4" style={{ color: AMBER }} /> Delivered to site
                  </span>
                </div>

                <button
                  onClick={confirmBooking}
                  disabled={addToCart.isPending}
                  className="w-full mt-3 py-3.5 rounded-2xl text-white font-black flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${AMBER} 0%, #f97316 100%)` }}
                >
                  <ShoppingCart className="w-4 h-4" /> {addToCart.isPending ? "Booking…" : `Book Machine · ${inr(total)}`}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" style={{ color: NEON }} /> Free site inspection before dispatch
                </p>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function Trust({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
      <span className="text-amber-300">{icon}</span>
      <span className="text-[10px] font-bold text-white">{label}</span>
    </div>
  );
}

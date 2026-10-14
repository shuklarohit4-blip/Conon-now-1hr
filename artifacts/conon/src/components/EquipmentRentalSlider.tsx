import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Zap, ChevronRight, ShieldCheck, Clock } from "lucide-react";
import { CononImage } from "./CononImage";

/* ── Heavy equipment fleet (home slider) ──────────────────────────────
   Industrial dark-theme rental fleet shown directly below the category
   grid. Distinct from the standard white product cards. Images are served
   LOCALLY from /public/rentals/ so they can never 404 or hang. */
type Rental = {
  id: string;
  name: string;
  category: string;
  /** Human-readable rate, shown verbatim, e.g. "₹1,200 / Hour". */
  rate: string;
  minBooking: string;
  specs: string;
  image: string;
};

/** Local machine photo (bulletproof — no remote dependency). */
const RENTAL_IMG = (slug: string) => `${import.meta.env.BASE_URL}rentals/${slug}.png`;

const rentalEquipment: Rental[] = [
  {
    id: "r1", name: "JCB Backhoe Loader 3DX", category: "Earthmoving",
    rate: "₹1,200 / Hour", minBooking: "Min. 4 Hours",
    specs: "Includes operator. Ideal for excavation & loading.",
    image: RENTAL_IMG("jcb-backhoe"),
  },
  {
    id: "r2", name: "Hydraulic Excavator (Poclain)", category: "Earthmoving",
    rate: "₹1,800 / Hour", minBooking: "Min. 8 Hours",
    specs: "Chain-mounted, for heavy deep excavation.",
    image: RENTAL_IMG("excavator"),
  },
  {
    id: "r3", name: "Concrete Mixer (1-Bag)", category: "Concrete",
    rate: "₹800 / Day", minBooking: "Min. 1 Day",
    specs: "Diesel engine, heavy-duty mixing drum.",
    image: RENTAL_IMG("concrete-mixer"),
  },
  {
    id: "r4", name: "Concrete Needle Vibrator", category: "Concrete",
    rate: "₹350 / Day", minBooking: "Min. 1 Day",
    specs: "High-frequency compaction with 2m nozzle.",
    image: RENTAL_IMG("needle-vibrator"),
  },
  {
    id: "r5", name: "Earth Rammer / Compactor", category: "Compaction",
    rate: "₹900 / Day", minBooking: "Min. 1 Day",
    specs: "Petrol-driven, perfect for plinth/soil compaction.",
    image: RENTAL_IMG("earth-rammer"),
  },
  {
    id: "r6", name: "Hydra Crane (14 Ton)", category: "Material Handling",
    rate: "₹1,200 / Hour", minBooking: "Min. 4 Hours",
    specs: "Mobile crane for TMT and heavy material shifting.",
    image: RENTAL_IMG("hydra-crane"),
  },
  {
    id: "r7", name: "Air Compressor (50L)", category: "Support Equipment",
    rate: "₹800 / Day", minBooking: "Min. 1 Day",
    specs: "8 Bar pressure, for painting & pneumatic tools.",
    image: RENTAL_IMG("air-compressor"),
  },
  {
    id: "r8", name: "DG Set (62.5 kVA)", category: "Support Equipment",
    rate: "₹2,000 / Day", minBooking: "Min. 1 Day",
    specs: "Silent Diesel Generator for site power backup.",
    image: RENTAL_IMG("dg-set"),
  },
];

/** Parse "₹1,200 / Hour" -> { amount: 1200, unit: "Hour" } for the cart. */
function parseRate(rate: string): { amount: number; unit: string } {
  const amount = Number(rate.replace(/[^0-9]/g, "")) || 0;
  const unit = rate.split("/")[1]?.trim() || "Day";
  return { amount, unit };
}

export function EquipmentRentalSlider() {
  const qc = useQueryClient();
  const addToCart = useAddToCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });
  const [pendingId, setPendingId] = useState<string | null>(null);

  const requestBooking = (eq: Rental) => {
    const { amount, unit } = parseRate(eq.rate);
    setPendingId(eq.id);
    addToCart.mutate(
      {
        data: {
          materialId: `rent-${eq.id}-${unit.toLowerCase()}`,
          quantity: 1,
          name: `${eq.name} · Rental`,
          price: Math.min(amount, 10_000_000),
          unit: `per ${unit}`,
          vendor: "Conon Heavy Rentals",
          category: "rental",
        },
      },
      {
        onSuccess: () => {
          toast.success(`${eq.name} requested`, {
            description: `${eq.rate} · ${eq.minBooking} · delivered to your site in 60 minutes.`,
          });
          setPendingId(null);
        },
        onError: () => {
          toast.error("Couldn't request this machine. Please try again.");
          setPendingId(null);
        },
      },
    );
  };

  return (
    <section className="mt-5 mx-4 rounded-[28px] bg-slate-950 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-[19px] leading-tight text-white">
            Heavy Machines on Rent <span className="not-italic">🚜</span>
          </h2>
          <Link
            href="/rentals"
            className="flex items-center gap-0.5 text-[11px] font-black text-amber-300 active:scale-95 transition"
          >
            Full fleet <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-[12px] text-slate-400 leading-snug mt-1">
          Well-maintained equipment delivered to your site in 60 minutes.
        </p>
        <div className="flex gap-3 mt-3">
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Insured fleet
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
            <Clock className="w-3 h-3 text-amber-300" /> 60-min dispatch
          </span>
        </div>
      </div>

      {/* Horizontal fleet slider */}
      <div
        className="flex gap-3 overflow-x-auto px-5 pb-5 pt-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {rentalEquipment.map((eq, i) => {
          const busy = addToCart.isPending && pendingId === eq.id;
          return (
            <motion.div
              key={eq.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="snap-start shrink-0 w-[262px] rounded-2xl bg-slate-900 text-white border border-slate-700/60 overflow-hidden"
            >
              {/* Image (aspect-video, cinematic) */}
              <div className="relative w-full aspect-video bg-slate-800">
                <CononImage src={eq.image} alt={eq.name} dark className="absolute inset-0" />
                <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-black text-slate-900 bg-yellow-400 px-2 py-1 rounded-full shadow">
                  <Zap className="w-2.5 h-2.5" fill="currentColor" strokeWidth={0} /> Ready to Dispatch
                </span>
              </div>

              {/* Body */}
              <div className="p-3.5">
                <h3 className="font-display font-black text-[14px] text-white leading-tight">{eq.name}</h3>
                <p className="text-[10.5px] text-slate-400 leading-snug mt-1 min-h-[28px]">{eq.specs}</p>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded">{eq.category}</span>
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-1 rounded">{eq.minBooking}</span>
                </div>

                {/* Rate (glowing neon) */}
                <div className="mt-2.5">
                  <span className="text-green-400 font-bold text-lg drop-shadow-[0_0_8px_rgba(74,222,128,0.45)]">{eq.rate}</span>
                </div>

                {/* Action */}
                <button
                  onClick={() => requestBooking(eq)}
                  disabled={addToCart.isPending}
                  className="mt-3 w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-[12.5px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition disabled:opacity-60"
                >
                  {busy ? "Requesting…" : "📅 Request Booking"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

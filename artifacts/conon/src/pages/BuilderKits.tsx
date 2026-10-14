import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import {
  Boxes, Building2, Paintbrush, Pickaxe, Layers,
  Shield, Star, Zap, Check, ChevronDown, Sparkles, Truck,
  ShoppingCart, Landmark,
} from "lucide-react";

const BRAND = "#1b4366";
const AMBER = "#f59e0b";
const NEON = "#84cc16";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

type Stage = {
  id: string;
  stage: string;
  name: string;
  icon: React.ReactNode;
  total: number;
  save: number;
  tag: string;
  covers: string;
  status: "done" | "active" | "upcoming";
  contents: { item: string; qty: string }[];
};

const STAGES: Stage[] = [
  {
    id: "foundation",
    stage: "Stage 1",
    name: "Foundation & Plinth",
    icon: <Pickaxe className="w-6 h-6" />,
    total: 215000, save: 18500, tag: "Most Popular",
    covers: "1000 sq ft footprint",
    status: "active",
    contents: [
      { item: "Premium Cement (OPC 53)", qty: "150 Bags" },
      { item: "12mm TMT Steel (Fe550D)", qty: "3 Tons" },
      { item: "Coarse Sand", qty: "400 Cu.Ft." },
      { item: "20mm Stone Aggregate", qty: "350 Cu.Ft." },
      { item: "Anti-termite Chemical", qty: "20 Litres" },
      { item: "DPC Waterproofing", qty: "1 Set" },
    ],
  },
  {
    id: "superstructure",
    stage: "Stage 2",
    name: "Superstructure (Brickwork)",
    icon: <Boxes className="w-6 h-6" />,
    total: 340000, save: 26000, tag: "Walls",
    covers: "External + internal walls",
    status: "upcoming",
    contents: [
      { item: "Red Clay Bricks", qty: "6,000 Nos" },
      { item: "AAC Blocks 600×200×100", qty: "1,800 Nos" },
      { item: "PPC Cement", qty: "120 Bags" },
      { item: "M-Sand", qty: "600 Cu.Ft." },
      { item: "Block Jointing Mortar", qty: "30 Bags" },
      { item: "Lintel Steel 8mm", qty: "0.8 Tons" },
    ],
  },
  {
    id: "slab",
    stage: "Stage 3",
    name: "Slab Casting & Roofing",
    icon: <Layers className="w-6 h-6" />,
    total: 285000, save: 24000, tag: "RCC",
    covers: "Roof slab + beams",
    status: "upcoming",
    contents: [
      { item: "Cement (OPC 53)", qty: "200 Bags" },
      { item: "12/16mm TMT Steel", qty: "4.5 Tons" },
      { item: "20mm Aggregate", qty: "700 Cu.Ft." },
      { item: "Shuttering Ply + Props", qty: "Rental Set" },
      { item: "Binding Wire + Cover Blocks", qty: "1 Set" },
      { item: "Integral Waterproofing", qty: "40 Kg" },
    ],
  },
  {
    id: "finishing",
    stage: "Stage 4",
    name: "Plaster & Finishing",
    icon: <Paintbrush className="w-6 h-6" />,
    total: 195000, save: 17500, tag: "Turnkey",
    covers: "Plaster, tiles & paint",
    status: "upcoming",
    contents: [
      { item: "PPC Cement", qty: "130 Bags" },
      { item: "Plaster M-Sand", qty: "500 Cu.Ft." },
      { item: "Wall Putty", qty: "25 Bags" },
      { item: "Primer + Emulsion Paint", qty: "180 Litres" },
      { item: "Vitrified Tiles", qty: "1,200 sq ft" },
      { item: "Tile Adhesive + Grout", qty: "1 Set" },
    ],
  },
];

export function BuilderKits() {
  const [open, setOpen] = useState<string | null>("foundation");

  const qc = useQueryClient();
  const addToCart = useAddToCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });

  const addKit = (kit: Stage) => {
    addToCart.mutate(
      {
        data: {
          materialId: `kit-${kit.id}`,
          quantity: 1,
          name: `${kit.name} Kit · 1000 sq ft`,
          price: kit.total,
          unit: "Full Kit",
          vendor: "Conon Smart Kits",
          category: "kit",
        },
      },
      {
        onSuccess: () =>
          toast.success(`${kit.name} Kit added successfully!`, {
            description: `${kit.contents.length} bundled materials · ${inr(kit.total)} added to your cart.`,
          }),
        onError: () => toast.error("Couldn't add this kit. Please try again."),
      },
    );
  };

  const financeKit = (kit: Stage) => {
    const emi = Math.round(kit.total / 6);
    toast("Conon Khata · Finance Activated", {
      description: `${kit.name} Kit on 6-month Khata — approx ${inr(emi)}/month at 0% interest.`,
      icon: <Landmark className="w-4 h-4" style={{ color: BRAND }} />,
    });
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-full pb-6">
        {/* Hero */}
        <div className="px-5 pt-7 pb-7 rounded-b-[36px] shadow-lg" style={{ background: BRAND }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Boxes className="w-5 h-5 text-amber-300" strokeWidth={2.4} />
            </span>
            <div>
              <h2 className="font-display font-black italic text-2xl text-white leading-none">Smart Builder Kits</h2>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em] mt-1">1000 Sq Ft Home · Stage by Stage</p>
            </div>
          </div>
          <p className="text-sm text-blue-100/90 leading-snug mt-3">
            Every material for your build, bundled by construction stage. Order an entire
            stage in one tap, lock bulk pricing, and pay with Conon Khata.
          </p>
          <div className="flex gap-2 mt-4">
            <Trust icon={<Shield className="w-3 h-3" />} label="ISI Materials" />
            <Trust icon={<Zap className="w-3 h-3" />} label="Bulk Savings" />
            <Trust icon={<Star className="w-3 h-3" />} label="Site Delivery" />
          </div>
        </div>

        {/* Timeline of stages */}
        <div className="px-4 mt-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: AMBER }} />
            <h3 className="font-display font-black text-slate-800 text-sm">Your Build Timeline</h3>
          </div>

          <div className="relative pl-7">
            {/* vertical line */}
            <div className="absolute left-[10px] top-2 bottom-2 w-[2px] bg-slate-200" />
            {STAGES.map((kit, i) => {
              const isOpen = open === kit.id;
              return (
                <motion.div
                  key={kit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative mb-3"
                >
                  {/* timeline dot */}
                  <span
                    className="absolute -left-[26px] top-4 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white z-10"
                    style={{ background: kit.status === "done" ? NEON : kit.status === "active" ? AMBER : "#cbd5e1" }}
                  >
                    {kit.status === "done" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </span>

                  <div
                    className="bg-white rounded-[22px] border shadow-sm overflow-hidden"
                    style={{ borderColor: isOpen ? `${AMBER}66` : "#f1f5f9" }}
                  >
                    {/* Header (accordion toggle) */}
                    <button onClick={() => setOpen(isOpen ? null : kit.id)} className="w-full text-left p-4 active:bg-slate-50 transition">
                      <div className="flex gap-3">
                        <div
                          className="w-14 h-14 shrink-0 rounded-[16px] flex items-center justify-center text-white"
                          style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #2d5f87 100%)` }}
                        >
                          {kit.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{kit.stage}</span>
                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full" style={{ background: `${AMBER}1a`, color: "#b45309" }}>{kit.tag}</span>
                          </div>
                          <h4 className="font-display font-black text-slate-800 text-sm leading-tight mt-0.5">{kit.name}</h4>
                          <p className="text-[11px] text-slate-500 leading-snug">{kit.covers}</p>
                        </div>
                        <ChevronDown
                          className="w-5 h-5 text-slate-400 shrink-0 transition-transform"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Kit Value</span>
                          <p className="font-black text-lg leading-none mt-0.5" style={{ color: BRAND }}>{inr(kit.total)}</p>
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: `${NEON}1f`, color: "#3f6212" }}>
                          Save {inr(kit.save)} vs loose
                        </span>
                      </div>
                    </button>

                    {/* Expandable "What's Inside" */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">What's Inside</p>
                            <div className="grid grid-cols-2 gap-2">
                              {kit.contents.map((c) => (
                                <div key={c.item} className="rounded-2xl bg-slate-50 p-2.5 border border-slate-100">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: `${NEON}22` }}>
                                      <Check className="w-2.5 h-2.5" style={{ color: "#3f6212" }} strokeWidth={3} />
                                    </span>
                                    <span className="text-[11px] font-black text-slate-800">{c.qty}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-semibold leading-tight">{c.item}</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-3">
                              <Truck className="w-4 h-4" style={{ color: AMBER }} /> Free delivery to your registered site
                            </div>

                            <button
                              onClick={() => addKit(kit)}
                              disabled={addToCart.isPending}
                              className="w-full mt-3 py-3.5 rounded-2xl text-white font-black flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
                              style={{ background: `linear-gradient(135deg, ${AMBER} 0%, #f97316 100%)` }}
                            >
                              <ShoppingCart className="w-4 h-4" /> Add Entire Kit to Cart
                            </button>
                            <button
                              onClick={() => financeKit(kit)}
                              className="w-full mt-2 py-3 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-[0.98] transition border-2"
                              style={{ borderColor: BRAND, color: BRAND }}
                            >
                              <Landmark className="w-4 h-4" /> Finance via Conon Khata
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
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

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Camera, CheckCircle, Clock, Share2,
  MapPin, Package, Truck, ChevronDown, ChevronUp,
  Download, User, Star, Plus, X,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { onImgError } from "@/lib/imgFallback";

const BRAND = "#1b4366";
const AMBER  = "#f59e0b";
const GREEN  = "#15803d";

type Stage = "foundation" | "structure" | "roof" | "finishing" | "handover";

const STAGES: { key: Stage; label: string; emoji: string; done: boolean }[] = [
  { key: "foundation", label: "Foundation",  emoji: "⛏️",  done: true  },
  { key: "structure",  label: "Structure",   emoji: "🏗️",  done: true  },
  { key: "roof",       label: "Roof",        emoji: "🏠",  done: false },
  { key: "finishing",  label: "Finishing",   emoji: "🎨",  done: false },
  { key: "handover",   label: "Handover",    emoji: "🔑",  done: false },
];

const DELIVERIES = [
  {
    id: "D-081",
    date: "22 Mar 2026, 10:30 AM",
    stage: "structure" as Stage,
    item: "TMT Steel — 2 Tonne",
    vendor: "Sharma Hardware",
    driver: "Ramesh Verma",
    qty: "2,000 kg",
    verified: true,
    photo: "https://images.unsplash.com/photo-1590059132718-2665b70f8ee0?w=400&q=80",
    note: "Unloaded at north corner. Grade Fe500. Supervisor Mukesh verified count.",
    rating: 5,
  },
  {
    id: "D-074",
    date: "20 Mar 2026, 2:15 PM",
    stage: "structure" as Stage,
    item: "OPC Cement — 100 bags",
    vendor: "Lakshmi Stores",
    driver: "Suresh Yadav",
    qty: "100 bags × 50 kg",
    verified: true,
    photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80",
    note: "Stack stored under tarpaulin. Acc. delivery note signed.",
    rating: 4,
  },
  {
    id: "D-069",
    date: "18 Mar 2026, 9:00 AM",
    stage: "foundation" as Stage,
    item: "River Sand — 50 cft",
    vendor: "Sharma Hardware",
    driver: "Dinesh Kumar",
    qty: "50 cft",
    verified: true,
    photo: null,
    note: "",
    rating: 5,
  },
  {
    id: "D-062",
    date: "15 Mar 2026, 11:45 AM",
    stage: "foundation" as Stage,
    item: "Bricks — 10,000 pcs",
    vendor: "Raju Bricks & Co",
    driver: "Arjun Singh",
    qty: "10,000 pieces",
    verified: true,
    photo: "https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=400&q=80",
    note: "First-class bricks, red variety. No breakage reported.",
    rating: 5,
  },
];

export function ProjectTimeline() {
  const [, setLocation]           = useLocation();
  const [activeStage, setActiveStage] = useState<Stage | "all">("all");
  const [expanded, setExpanded]   = useState<string | null>("D-081");
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  const filtered = activeStage === "all"
    ? DELIVERIES
    : DELIVERIES.filter(d => d.stage === activeStage);

  const doneCount = STAGES.filter(s => s.done).length;
  const progress  = Math.round((doneCount / STAGES.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl flex flex-col relative">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="px-5 pt-10 pb-6 rounded-b-[44px] shadow-xl" style={{ background: BRAND }}>
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setLocation("/home")} className="p-2 bg-white/10 rounded-full">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex-1">
              <h2 className="font-display font-black italic text-xl text-white">My Project</h2>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-blue-200" />
                <p className="text-[10px] font-bold text-blue-200">Plot 47, Sector 18, Noida — 201301</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  toast.success("Share link copied! 🎉");
                } catch {
                  toast.error("Couldn't copy link", { description: "Please copy it from the address bar." });
                }
              }}
              className="p-2 bg-white/10 rounded-full"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Build Progress</span>
              <span className="text-[9px] font-black text-amber-300">{progress}% Complete</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: AMBER }}
              />
            </div>
          </div>

          {/* Stage pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {[{ key: "all" as const, label: "All", emoji: "📋" }, ...STAGES].map(s => {
              const isActive = activeStage === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveStage(s.key)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap transition-all"
                  style={{
                    background: isActive ? AMBER : "rgba(255,255,255,0.12)",
                    color:      isActive ? "#000" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {s.emoji} {s.label}
                  {"done" in s && s.done && <CheckCircle className="w-2.5 h-2.5 text-green-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Delivery Timeline ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-28 scrollbar-hide">
          <div className="flex justify-between items-center mb-4 px-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
              {filtered.length} Deliveries · Photo Proof
            </p>
            <button
              onClick={() => toast("Full timeline PDF download — coming soon!")}
              className="flex items-center gap-1 text-[9px] font-black px-3 py-1.5 rounded-xl"
              style={{ background: "#f1f5f9", color: BRAND }}
            >
              <Download className="w-3 h-3" /> Export
            </button>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-4 bottom-0 w-0.5 bg-slate-100" />

            <div className="space-y-4">
              {filtered.map((d, i) => {
                const isOpen = expanded === d.id;
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-4"
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 mt-4 shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow"
                        style={{ background: d.verified ? GREEN : "#e2e8f0" }}
                      >
                        {d.verified
                          ? <CheckCircle className="w-5 h-5 text-white" />
                          : <Clock className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm mb-1">
                      {/* Card header — always visible */}
                      <button
                        className="w-full p-4 text-left flex items-start gap-3"
                        onClick={() => setExpanded(isOpen ? null : d.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[8px] font-black text-slate-400 uppercase">{d.id}</span>
                            {d.photo && (
                              <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Camera className="w-2 h-2" /> Photo
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-black text-slate-800 leading-tight">{d.item}</p>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{d.date}</p>
                        </div>
                        {isOpen
                          ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                          : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />}
                      </button>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid #f1f5f9" }}>
                              {/* Photo */}
                              {d.photo ? (
                                <button
                                  onClick={() => setPhotoModal(d.photo!)}
                                  className="w-full mt-3 rounded-2xl overflow-hidden relative"
                                >
                                  <img
                                    src={d.photo}
                                    alt="Delivery proof"
                                    className="w-full h-36 object-cover"
                                    onError={onImgError}
                                  />
                                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                    <span className="text-white font-black text-xs">Tap to expand</span>
                                  </div>
                                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Camera className="w-2.5 h-2.5" /> Proof of Delivery
                                  </div>
                                </button>
                              ) : (
                                <div className="mt-3 border-2 border-dashed border-slate-200 rounded-2xl h-24 flex flex-col items-center justify-center gap-1">
                                  <Camera className="w-6 h-6 text-slate-300" />
                                  <p className="text-[9px] font-black text-slate-400 uppercase">No Photo Yet</p>
                                  <button
                                    onClick={() => toast("Driver photo upload — available in driver app")}
                                    className="text-[8px] font-black px-3 py-1 rounded-full mt-1"
                                    style={{ background: "#f1f5f9", color: BRAND }}
                                  >
                                    Request Driver Photo
                                  </button>
                                </div>
                              )}

                              {/* Meta rows */}
                              <div className="grid grid-cols-2 gap-2 text-[9px]">
                                <div className="bg-slate-50 rounded-xl p-2">
                                  <p className="font-black text-slate-400 uppercase mb-0.5">Qty Delivered</p>
                                  <p className="font-black text-slate-800">{d.qty}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-2">
                                  <p className="font-black text-slate-400 uppercase mb-0.5">Vendor</p>
                                  <p className="font-black text-slate-800 truncate">{d.vendor}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-2">
                                  <p className="font-black text-slate-400 uppercase mb-0.5">Driver</p>
                                  <p className="font-black text-slate-800 flex items-center gap-1"><User className="w-2.5 h-2.5" />{d.driver}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-2">
                                  <p className="font-black text-slate-400 uppercase mb-0.5">Rating</p>
                                  <p className="font-black text-amber-500">
                                    {"⭐".repeat(d.rating)}
                                  </p>
                                </div>
                              </div>

                              {d.note && (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5">
                                  <p className="text-[9px] font-semibold text-amber-800">{d.note}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}

              {/* Next delivery placeholder */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0 mt-4">
                  <Plus className="w-4 h-4 text-slate-300" />
                </div>
                <button
                  onClick={() => setLocation("/home")}
                  className="flex-1 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-2 hover:border-amber-300 hover:text-amber-600 transition-all mt-4"
                >
                  <Truck className="w-4 h-4" /> Order Next Delivery
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Photo Fullscreen Modal ────────────────────────────────── */}
        <AnimatePresence>
          {photoModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setPhotoModal(null)}
                className="absolute top-8 right-5 p-2 bg-white/10 rounded-full z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <img
                src={photoModal}
                alt="Delivery proof"
                className="w-full max-w-[420px] rounded-2xl object-cover"
                style={{ maxHeight: "70vh" }}
                onError={onImgError}
              />
              <div className="mt-4 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Camera className="w-4 h-4 text-green-400" />
                <p className="text-white text-xs font-black">Verified Proof of Delivery</p>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <button
                onClick={() => { toast("Photo saved to gallery!"); setPhotoModal(null); }}
                className="mt-3 flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-black"
                style={{ background: AMBER, color: "#000" }}
              >
                <Download className="w-3.5 h-3.5" /> Save Photo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

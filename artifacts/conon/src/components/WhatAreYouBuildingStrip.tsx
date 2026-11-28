import React, { useState } from "react";
import { useLocation } from "wouter";
import { Building2, Wrench, Tractor, ArrowRight, Sparkles } from "lucide-react";

type IntentKey = "new-home" | "slab-pour" | "bath-kitchen" | "interior";

const INTENTS: Record<
  IntentKey,
  {
    label: string;
    cards: { title: string; sub: string; pillar: string; href: string; icon: typeof Building2; tone: string }[];
  }
> = {
  "new-home": {
    label: "Naya Ghar / Plot Construction",
    cards: [
      {
        title: "Foundation & Structure Builder Kit",
        sub: "Cement + TMT + Morang + Bricks (Save 12%)",
        pillar: "Builder Kit",
        href: "/kits?stage=foundation",
        icon: Building2,
        tone: "bg-slate-900 text-amber-300",
      },
      {
        title: "JCB 3DX Excavation Rental",
        sub: "₹6,800 / 8-hr shift • Digital HMR Lock",
        pillar: "Machines on Rent",
        href: "/rentals?machine=jcb-3dx",
        icon: Tractor,
        tone: "bg-amber-400 text-slate-950",
      },
      {
        title: "Raj Mistri & Helper Squad",
        sub: "Verified masonry crew • GPS Selfie Haziri",
        pillar: "Skilled Services",
        href: "/services?trade=raj-mistri",
        icon: Wrench,
        tone: "bg-emerald-700 text-white",
      },
    ],
  },
  "slab-pour": {
    label: "Chhat Dhalai (Slab Pour)",
    cards: [
      {
        title: "RMC M25 Plant Direct Convoy",
        sub: "90-min freshness • 6-Cube Lab Tracker",
        pillar: "RMC Plant Direct",
        href: "/rmc",
        icon: Building2,
        tone: "bg-blue-700 text-white",
      },
      {
        title: "Ajax Mixer & Needle Vibrator",
        sub: "Hourly / Shift • Breakdown Pause Shield",
        pillar: "Machines on Rent",
        href: "/rentals?machine=ajax-fiori",
        icon: Tractor,
        tone: "bg-amber-400 text-slate-950",
      },
      {
        title: "Bar Bender & Shuttering Crew",
        sub: "Slab steel tying + shuttering inspection",
        pillar: "Skilled Services",
        href: "/services?trade=bar-bender",
        icon: Wrench,
        tone: "bg-emerald-700 text-white",
      },
    ],
  },
  "bath-kitchen": {
    label: "Bathroom / Kitchen Makeover",
    cards: [
      {
        title: "Plumber + CPVC & Sanitary Pack",
        sub: "₹249 quick visit • Pressure test checked",
        pillar: "Skilled Services",
        href: "/services?trade=plumber",
        icon: Wrench,
        tone: "bg-emerald-700 text-white",
      },
      {
        title: "Tile Mason (₹24/sqft) + Adhesives",
        sub: "Kajaria / Somany + Tile Cutter rental",
        pillar: "Skilled Services",
        href: "/services?trade=tile-mason",
        icon: Wrench,
        tone: "bg-emerald-700 text-white",
      },
      {
        title: "Modular Carpenter & Finishing Kit",
        sub: "Hinges, channels, HDHMR & BWP ply",
        pillar: "Builder Kit",
        href: "/kits?stage=finishing",
        icon: Building2,
        tone: "bg-slate-900 text-amber-300",
      },
    ],
  },
  interior: {
    label: "Interior & Renovation",
    cards: [
      {
        title: "PVC Wall Panel & POP Ceiling Crew",
        sub: "False ceiling + fluted wall panels",
        pillar: "Skilled Services",
        href: "/services?trade=pvc-panel",
        icon: Wrench,
        tone: "bg-emerald-700 text-white",
      },
      {
        title: "Licensed Electrician & LED Studio",
        sub: "₹249 quick visit • MCB load check",
        pillar: "Skilled Services",
        href: "/services?trade=electrician",
        icon: Wrench,
        tone: "bg-emerald-700 text-white",
      },
      {
        title: "Painter & Putty Turnkey Squad",
        sub: "Birla Putty + Asian Paints + Scaffolding",
        pillar: "Skilled Services",
        href: "/services?trade=painter",
        icon: Building2,
        tone: "bg-slate-900 text-amber-300",
      },
    ],
  },
};

export function WhatAreYouBuildingStrip() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<IntentKey>("new-home");
  const active = INTENTS[selected];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              What Are You Building Today?
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Pick your work stage for instant Builder Kit + Karigar + Machine combo
          </span>
        </div>

        {/* 1-Row Visual Intent Selector */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
          {(Object.keys(INTENTS) as IntentKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black border whitespace-nowrap transition cursor-pointer shrink-0 ${
                selected === key
                  ? "bg-slate-900 text-amber-300 border-slate-900 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
              }`}
            >
              {INTENTS[key].label}
            </button>
          ))}
        </div>

        {/* 3-Card Quick-Action Bundle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {active.cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => setLocation(card.href)}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 text-left flex items-center justify-between gap-3 transition shadow-2xs hover:shadow-sm cursor-pointer group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.tone}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {card.pillar}
                    </span>
                    <div className="text-xs font-black text-slate-900 truncate">{card.title}</div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">{card.sub}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 shrink-0 transition" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

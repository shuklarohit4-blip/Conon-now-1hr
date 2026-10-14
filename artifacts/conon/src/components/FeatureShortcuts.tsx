import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  HardHat, Tractor, Boxes, Calculator, PencilRuler, Compass,
  Palette, Package, Gift, MapPin, ClipboardList, Wrench,
  type LucideIcon,
} from "lucide-react";

const BRAND_DARK = "#1b4366";

type Feature = {
  href: string;
  icon: LucideIcon;
  label: string;
  tint: string;
  badge?: "NEW" | "HOT";
};

/* Quick-access shortcuts to every major Conon feature — surfaced at the top
   of Home so users don't have to scroll to the bottom nav or open the menu. */
const FEATURES: Feature[] = [
  { href: "/build",       icon: HardHat,       label: "Builder",      tint: "#1b4366" },
  { href: "/rentals",     icon: Tractor,       label: "Machine Rent", tint: "#b45309", badge: "HOT" },
  { href: "/smart-build", icon: Boxes,         label: "Smart-Build",  tint: "#7c3aed", badge: "NEW" },
  { href: "/estimator",   icon: Calculator,    label: "AI Estimator", tint: "#0e7490" },
  { href: "/smart-draft", icon: PencilRuler,   label: "Smart-Draft",  tint: "#be123c" },
  { href: "/arch-genius", icon: Compass,       label: "Arch-Genius",  tint: "#0f766e" },
  { href: "/designers",   icon: Palette,       label: "Designers",    tint: "#9333ea" },
  { href: "/kits",        icon: Package,       label: "Builder Kits", tint: "#ca8a04" },
  { href: "/rewards",     icon: Gift,          label: "Rewards",      tint: "#16a34a" },
  { href: "/track",       icon: MapPin,        label: "Track Order",  tint: "#2563eb" },
  { href: "/project",     icon: ClipboardList, label: "My Project",   tint: "#475569" },
  { href: "/services",    icon: Wrench,        label: "Services",     tint: "#ea580c" },
];

export function FeatureShortcuts() {
  return (
    <section className="pt-1">
      <div className="flex items-center justify-between px-5 mb-3">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
          Explore Conon
        </p>
        <span className="text-[9px] font-bold text-slate-300">Swipe →</span>
      </div>

      <div
        className="flex gap-3.5 overflow-x-auto px-5 pb-1 snap-x"
        style={{ scrollbarWidth: "none" }}
      >
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="snap-start shrink-0"
            >
              <Link
                href={f.href}
                aria-label={`Open ${f.label}`}
                className="flex flex-col items-center gap-1.5 w-[64px] active:scale-90 transition-transform"
              >
                <span className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ background: `${f.tint}14`, border: `1px solid ${f.tint}22` }}
                >
                  <Icon className="w-6 h-6" strokeWidth={2.2} style={{ color: f.tint }} />
                  {f.badge && (
                    <span
                      className="absolute -top-1.5 -right-1.5 text-[7px] font-black text-white px-1.5 py-0.5 rounded-full shadow"
                      style={{ background: f.badge === "HOT" ? "#dc2626" : "#7c3aed" }}
                    >
                      {f.badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-bold text-center leading-tight" style={{ color: BRAND_DARK }}>
                  {f.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

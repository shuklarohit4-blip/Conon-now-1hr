import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Flame,
  Tag,
  Gift,
  ChevronRight,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { rememberPromo } from "@/lib/promoCodes";
import { Confetti } from "./Confetti";
import {
  utWaterplus,
  imgAsianpaintsBucket,
  imgKajariaTile,
  imgAstralPipe,
  PROD,
} from "@/lib/productImages";

interface FestivalHeroBannerProps {
  onSelectCategory?: (category: string) => void;
  className?: string;
}

interface FestivalOffer {
  id: string;
  badge: string;
  title: string;
  hindiTitle: string;
  highlight: string;
  discountText: string;
  code: string;
  minOrder: string;
  gradient: string;
  accentColor: string;
  glowColor: string;
  products: { name: string; img: string; tag: string }[];
  usps: string[];
  ctaCategory: string;
}

const FESTIVAL_OFFERS: FestivalOffer[] = [
  {
    id: "shubh-nirman",
    badge: "🪔 SHUBH NIRMAN MAHOTSAV 2026",
    title: "Ghar Banao, Khushiyan Manao",
    hindiTitle: "शुभ निर्माण महापर्व · साइट पर भारी बचत",
    highlight: "Flat ₹5,000 OFF",
    discountText: "on Orders above ₹50,000 across Cement & Steel",
    code: "UTSAV5000",
    minOrder: "Min. ₹50,000",
    gradient: "linear-gradient(135deg, #0d2757 0%, #1848a0 55%, #1e3a8a 100%)",
    accentColor: "#fbbf24",
    glowColor: "rgba(251, 191, 36, 0.28)",
    products: [
      { name: "UltraTech Weather Plus", img: utWaterplus, tag: "OPC 53" },
      { name: "Tata Tiscon 550SD", img: PROD("tmt-bars"), tag: "Fe 550D" },
      { name: "First-Class Bricks", img: PROD("red-brick"), tag: "Kiln Fired" },
    ],
    usps: [
      "⚡ 60-Min Guaranteed Site Delivery",
      "🏗️ Free Crane & Labour Unloading",
      "💳 0% Interest Khata Pay Later",
    ],
    ctaCategory: "cement",
  },
  {
    id: "griha-shobha",
    badge: "✨ FESTIVE HOME MAKEOVER CARNIVAL",
    title: "Rang, Roshni Aur Chamak",
    hindiTitle: "पेंट, टाइल्स और बाथ फिटिंग्स पर महा उत्सव",
    highlight: "Flat ₹1,500 OFF",
    discountText: "on Asian Paints, Kajaria & Jaquar Orders above ₹15,000",
    code: "SHUBH2026",
    minOrder: "Min. ₹15,000",
    gradient: "linear-gradient(135deg, #1848a0 0%, #1e40af 50%, #7c2d12 100%)",
    accentColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.25)",
    products: [
      { name: "Asian Paints Apex", img: imgAsianpaintsBucket, tag: "20L Bucket" },
      { name: "Kajaria Vitrified", img: imgKajariaTile, tag: "600x600mm" },
      { name: "Astral CPVC", img: imgAstralPipe, tag: "FlowGuard" },
    ],
    usps: [
      "🎨 Free Computerized Color Tinting",
      "🛡️ 100% Genuine Factory Direct",
      "🚚 Free Same-Day Carry-Up Delivery",
    ],
    ctaCategory: "paint",
  },
];

export function FestivalHeroBanner({
  onSelectCategory,
  className = "",
}: FestivalHeroBannerProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Live countdown timer (simulating 2 days, 14 hours, 38 mins ending)
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 38,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-switch tabs every 6 seconds
  useEffect(() => {
    const autoTab = setInterval(() => {
      setActiveTab((curr) => (curr + 1) % FESTIVAL_OFFERS.length);
    }, 6500);
    return () => clearInterval(autoTab);
  }, []);

  const offer = FESTIVAL_OFFERS[activeTab];

  const handleCopyCode = async (code: string) => {
    rememberPromo(code);
    setShowConfetti(true);
    setCopied(true);
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback
    }
    toast.success(`Coupon code ${code} applied!`, {
      description: `You'll get ${offer.highlight} at checkout (${offer.minOrder}).`,
      icon: "🎉",
    });
    setTimeout(() => setCopied(false), 2400);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className={`relative px-4 mt-2 mb-4 select-none ${className}`}>
      {/* ── Main Festive Card ─────────────────────────────────────── */}
      <motion.div
        key={offer.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-[26px] shadow-xl border border-amber-300/30 text-white"
        style={{
          background: offer.gradient,
          boxShadow: `0 12px 36px -8px ${offer.glowColor}, 0 4px 14px rgba(0,0,0,0.12)`,
        }}
      >
        {/* Festive Confetti Shower on Code Copy */}
        {showConfetti && <Confetti count={45} duration={2.2} />}

        {/* Decorative Golden Toran / Marigold Garland Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 shadow-sm z-10" />

        {/* Decorative Ambient Radiance */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: offer.accentColor }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-30"
          style={{ background: "#38bdf8" }}
        />

        {/* Content Container */}
        <div className="relative z-10 p-4 sm:p-5">
          {/* Header Row: Festival Badge + Live Countdown Ticker */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm"
              style={{
                background: "rgba(255, 255, 255, 0.16)",
                border: "1px solid rgba(251, 191, 36, 0.45)",
                color: "#fef08a",
              }}
            >
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
              {offer.badge}
            </span>

            {/* Countdown Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-200"
              style={{ background: "rgba(0, 0, 0, 0.28)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>
                Ends in:{" "}
                <strong className="font-mono text-white">
                  {String(timeLeft.days).padStart(2, "0")}d :{" "}
                  {String(timeLeft.hours).padStart(2, "0")}h :{" "}
                  {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
                  {String(timeLeft.seconds).padStart(2, "0")}s
                </strong>
              </span>
            </div>
          </div>

          {/* Main Headline & Big Offer Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-8 space-y-1.5">
              <p className="text-[11px] font-bold text-amber-200/90 tracking-wide">
                {offer.hindiTitle}
              </p>
              <h2 className="text-xl sm:text-2xl font-display font-black italic tracking-tight leading-none text-white drop-shadow-sm">
                {offer.title}
              </h2>

              <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                <span
                  className="font-display font-black italic text-2xl sm:text-3xl tracking-tight"
                  style={{
                    color: offer.accentColor,
                    textShadow: "0 2px 10px rgba(251,191,36,0.4)",
                  }}
                >
                  {offer.highlight}
                </span>
                <span className="text-xs text-white/80 font-medium">
                  {offer.discountText}
                </span>
              </div>
            </div>

            {/* Product Real Image Preview Bubbles */}
            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-2 pt-2 md:pt-0 overflow-x-auto pb-1 scrollbar-hide">
              {offer.products.map((p, idx) => (
                <motion.div
                  key={p.name}
                  whileHover={{ scale: 1.06, y: -2 }}
                  className="relative group shrink-0"
                >
                  <div
                    className="w-14 h-14 rounded-2xl p-1 bg-white flex items-center justify-center shadow-lg border border-amber-300/40 relative overflow-hidden"
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                    <span
                      className="absolute bottom-0 inset-x-0 text-[7px] font-black uppercase text-center py-0.5 bg-slate-900/80 text-amber-300 truncate px-0.5"
                    >
                      {p.tag}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* USPs Bullet Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-white/10 text-[10px] font-bold text-white/85">
            {offer.usps.map((usp, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span>{usp}</span>
              </div>
            ))}
          </div>

          {/* Action Row: Coupon Code 1-Click Copy + CTA Button */}
          <div className="mt-3.5 pt-2 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5">
            {/* Promo Code Box */}
            <div className="flex items-center bg-black/30 backdrop-blur-md rounded-xl p-1 border border-amber-400/30">
              <div className="px-2.5 py-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[10px] text-white/70 font-semibold uppercase">Coupon:</span>
                <span className="font-mono font-black text-amber-300 tracking-wider text-xs">
                  {offer.code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(offer.code)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 shadow-sm active:scale-95"
                style={{
                  background: copied ? "#15803d" : "#fbbf24",
                  color: copied ? "#ffffff" : "#1e3a8a",
                }}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Apply Code
                  </>
                )}
              </button>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => onSelectCategory?.(offer.ctaCategory)}
              className="px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                color: "#0c2b66",
                boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)",
              }}
            >
              <span>Shop Festival Deals</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Bottom Slide Switcher Tabs */}
        <div className="bg-black/35 backdrop-blur-md px-4 py-1.5 flex items-center justify-between border-t border-white/10 text-[10px]">
          <div className="flex items-center gap-1.5">
            {FESTIVAL_OFFERS.map((fo, idx) => (
              <button
                key={fo.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black transition-all ${
                  idx === activeTab
                    ? "bg-amber-400 text-slate-900 shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <span>{fo.id === "shubh-nirman" ? "🪔 Cement & Steel" : "✨ Paints & Tiles"}</span>
              </button>
            ))}
          </div>

          {/* Quick category jump pills */}
          <div className="hidden xs:flex items-center gap-2">
            <span className="text-[9px] text-white/50 uppercase font-bold">Quick:</span>
            {["cement", "steel", "paint", "tiles"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory?.(cat)}
                className="text-[9px] font-bold text-amber-200/80 hover:text-amber-100 capitalize underline underline-offset-2"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

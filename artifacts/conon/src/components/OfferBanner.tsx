import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, Truck, Package, Gift, Copy, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { rememberPromo } from "@/lib/promoCodes";

type Offer = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  bg: string;
  ring: string;
  textColor: string;
  Icon: LucideIcon;
  emoji: string;
  cta?: { label: string; href: string };
  code?: string;
};

const OFFERS: Offer[] = [
  {
    id: "lucknow-special",
    badge: "Lucknow Special",
    title: "60 Min Delivery ⚡",
    subtitle: "Ghar pe mangwayein sariya aur cement turant.",
    bg: "linear-gradient(135deg, #FFD200 0%, #F7941D 100%)",
    ring: "#fde68a",
    textColor: "#1a1a1a",
    Icon: Truck,
    emoji: "🚚",
    cta: { label: "Order Now", href: "/home" },
  },
  {
    id: "bulk-2000",
    badge: "Bulk Offer",
    title: "Flat ₹2000 OFF",
    subtitle: "Minimum order 100 bags of Cement.",
    bg: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    ring: "#bfdbfe",
    textColor: "#ffffff",
    Icon: Package,
    emoji: "🧱",
    code: "CONONBULK",
  },
  {
    id: "refer-earn",
    badge: "Refer & Earn",
    title: "Dosto ko batayein 🎁",
    subtitle: "Get 2% cashback on their first order.",
    bg: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
    ring: "#bbf7d0",
    textColor: "#ffffff",
    Icon: Gift,
    emoji: "🎁",
    cta: { label: "Invite Now", href: "/bulk-rewards" },
  },
];

const ROTATE_MS = 4500;

export function OfferBanner({ className = "" }: { className?: string }) {
  const [, navigate] = useLocation();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % OFFERS.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(t);
  }, [paused]);

  const current = OFFERS[idx];
  const isDark = current.textColor === "#ffffff";

  const copyOfferCode = async (code: string) => {
    rememberPromo(code);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 1800);
    } catch {
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 1800);
    }
  };

  return (
    <section
      aria-label="Promotional offers"
      className={`relative w-full ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-3xl shadow-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative px-5 py-5 sm:px-6 sm:py-6 flex items-center gap-4 min-h-[128px]"
            style={{ background: current.bg }}
          >
            {/* Decorative blobs */}
            <div
              className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 blur-2xl"
              style={{ background: isDark ? "#ffffff" : "#1b1b1b" }}
              aria-hidden="true"
            />
            <div
              className="absolute -left-6 -bottom-12 w-28 h-28 rounded-full opacity-15"
              style={{ background: isDark ? "#ffffff" : "#1b1b1b" }}
              aria-hidden="true"
            />

            {/* Icon badge */}
            <motion.div
              initial={{ scale: 0.85, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.05 }}
              className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)",
                border: `1.5px solid ${current.ring}`,
              }}
            >
              <current.Icon
                className="w-6 h-6 sm:w-7 sm:h-7"
                style={{ color: current.textColor }}
                strokeWidth={2.2}
              />
            </motion.div>

            {/* Text */}
            <div className="relative flex-1 min-w-0">
              <span
                className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] mb-1 px-2 py-0.5 rounded"
                style={{
                  color: isDark ? "#1a1a1a" : "#ffffff",
                  background: isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.85)",
                }}
              >
                {current.badge}
              </span>
              <h3
                className="font-display font-black text-[15px] sm:text-lg leading-tight truncate"
                style={{ color: current.textColor }}
              >
                {current.title}
              </h3>
              <p
                className="text-[10px] sm:text-xs font-bold mt-0.5 line-clamp-2 sm:truncate"
                style={{ color: current.textColor, opacity: 0.92 }}
              >
                {current.subtitle}
              </p>
            </div>

            {/* CTA — button or coupon chip */}
            {current.cta && (
              <button
                type="button"
                onClick={() => navigate(current.cta!.href)}
                aria-label={`${current.cta.label} — ${current.title}`}
                className="relative shrink-0 group inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-black shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.04] active:scale-95 transition-all duration-200"
                style={{
                  background: isDark ? "#ffffff" : "#1b1b1b",
                  color: isDark ? "#1b1b1b" : "#ffffff",
                }}
              >
                <span>{current.cta.label}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            )}

            {current.code && (
              <button
                type="button"
                onClick={() => copyOfferCode(current.code!)}
                aria-label={`Copy promo code ${current.code}`}
                className="relative shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black tracking-wider transition-all duration-200 hover:scale-[1.03] active:scale-95"
                style={{
                  border: `2px dashed ${isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)"}`,
                  background: isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.35)",
                  color: current.textColor,
                }}
              >
                <span>CODE: {current.code}</span>
                {copiedCode === current.code ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                ) : (
                  <Copy className="w-3.5 h-3.5" strokeWidth={2.4} />
                )}
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {OFFERS.map((o, i) => (
            <button
              key={o.id}
              onClick={() => setIdx(i)}
              aria-label={`Show offer ${i + 1}: ${o.title}`}
              aria-current={i === idx ? "true" : undefined}
              aria-pressed={i === idx}
              className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-1 ${
                i === idx ? "w-5" : "w-1.5 hover:w-3"
              }`}
              style={{
                background:
                  i === idx
                    ? isDark
                      ? "rgba(255,255,255,0.95)"
                      : "rgba(0,0,0,0.85)"
                    : isDark
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(0,0,0,0.35)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default OfferBanner;

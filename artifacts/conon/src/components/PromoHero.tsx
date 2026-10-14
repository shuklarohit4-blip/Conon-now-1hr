import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Copy, Check, ArrowRight } from "lucide-react";
import { rememberPromo } from "@/lib/promoCodes";

type PromoHeroProps = {
  className?: string;
  couponCode?: string;
  ctaHref?: string;
};

export function PromoHero({
  className = "",
  couponCode = "CONON500",
  ctaHref = "/home",
}: PromoHeroProps) {
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    rememberPromo(couponCode);
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — code is still remembered for checkout autofill */
    }
  };

  return (
    <section
      aria-label="Fastest delivery promotion"
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(135deg, #FFD200 0%, #F7941D 100%)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
        fontFamily:
          "'Segoe UI', Tahoma, Geneva, Verdana, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Decorative blob */}
      <div
        aria-hidden="true"
        className="absolute -top-12 -right-10 w-44 h-44 rounded-full opacity-25 blur-2xl"
        style={{ background: "#ffffff" }}
      />

      <div className="relative flex flex-col xs:flex-row items-center xs:items-center justify-between gap-4 p-5 text-center xs:text-left">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Eyebrow tag */}
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-[0.1em] text-white"
            style={{ background: "#000" }}
          >
            Fastest Delivery
          </motion.span>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="font-black leading-tight mt-2.5 mb-1 text-[20px] sm:text-[22px]"
            style={{ color: "#1a1a1a" }}
          >
            Lucknow Mein Sabse Tez!{" "}
            <span aria-hidden="true">⚡</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-[14px] sm:text-[15px] font-semibold mb-3"
            style={{ color: "#333" }}
          >
            Get Construction Materials in{" "}
            <span style={{ fontWeight: 900, color: "#d32f2f" }}>
              60 Minutes
            </span>
          </motion.p>

          {/* Coupon box */}
          <motion.button
            type="button"
            onClick={copyCode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            whileTap={{ scale: 0.97 }}
            aria-label={`Copy coupon code ${couponCode}`}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors hover:bg-white/45"
            style={{
              border: "2px dashed #000",
              background: "rgba(255, 255, 255, 0.3)",
              color: "#1a1a1a",
            }}
          >
            <span>
              Use Code: <strong className="font-black">{couponCode}</strong>
            </span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-700" strokeWidth={3} />
            ) : (
              <Copy className="w-3.5 h-3.5" strokeWidth={2.4} />
            )}
          </motion.button>

          {/* Order Now button */}
          <div className="mt-4 xs:text-left text-center">
            <motion.button
              type="button"
              onClick={() => navigate(ctaHref)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-md hover:shadow-lg transition-shadow"
              style={{ background: "#000" }}
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.6} />
            </motion.button>
          </div>
        </div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
          className="shrink-0 flex items-center justify-center text-[72px] sm:text-[80px] leading-none select-none"
          style={{ filter: "drop-shadow(5px 5px 10px rgba(0,0,0,0.25))" }}
          aria-hidden="true"
        >
          🧱
        </motion.div>
      </div>
    </section>
  );
}

export default PromoHero;

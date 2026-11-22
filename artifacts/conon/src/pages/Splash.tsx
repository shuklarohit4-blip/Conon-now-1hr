import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const BRAND_DARK = "#1848a0";
const BRAND_MID  = "#5c92b1";
const AMBER      = "#f59e0b";

export function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const t = setTimeout(() => setLocation("/home"), 2600);
    return () => clearTimeout(t);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 40%, rgba(92,146,177,0.12) 0%, transparent 70%)` }}
      />

      {/* Corner accents */}
      <div className="absolute top-10 left-10 w-10 h-10 border-t-2 border-l-2" style={{ borderColor: `${BRAND_DARK}25` }} />
      <div className="absolute top-10 right-10 w-10 h-10 border-t-2 border-r-2" style={{ borderColor: `${BRAND_DARK}25` }} />
      <div className="absolute bottom-10 left-10 w-10 h-10 border-b-2 border-l-2" style={{ borderColor: `${BRAND_DARK}25` }} />
      <div className="absolute bottom-10 right-10 w-10 h-10 border-b-2 border-r-2" style={{ borderColor: `${BRAND_DARK}25` }} />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.img
          src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
          alt="CONON-NOW"
          className="w-48 h-48 object-contain mb-2 drop-shadow-sm"
          initial={{ y: 18 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
        />

        <motion.p
          className="text-[11px] font-black tracking-[0.25em] uppercase mt-2"
          style={{ color: BRAND_DARK }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Prime Infrastructure In 60 Minutes
        </motion.p>

        <motion.p
          className="text-xs mt-2 italic text-slate-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Delivering Trust, Building Dreams.
        </motion.p>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="absolute bottom-16 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: AMBER }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}

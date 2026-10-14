import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const BRAND_DARK = "#1b4366";
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
          src={`${import.meta.env.BASE_URL}images/conon-logo-real.png`}
          alt="CONON Infrabuilt Limited"
          className="w-40 h-40 object-contain mb-4"
          initial={{ y: 18 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
        />

        <motion.h1
          className="text-3xl font-display font-black italic tracking-tighter"
          style={{ color: BRAND_DARK }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          CONON
        </motion.h1>

        <motion.p
          className="text-[9px] font-black tracking-[0.3em] uppercase mt-1"
          style={{ color: BRAND_MID }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Prime Infrastructure
        </motion.p>

        <motion.p
          className="text-xs mt-3 italic text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
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

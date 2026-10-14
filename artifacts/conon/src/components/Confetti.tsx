import React, { useMemo } from "react";
import { motion } from "framer-motion";

/* A lightweight, dependency-free celebratory confetti burst.
   Renders a one-shot shower of colored pieces that fall + fade on mount.
   Drop it inside a `position: relative` container; it fills the parent and
   never intercepts taps (pointer-events-none). */

const COLORS = ["#2a7a3b", "#f59e0b", "#1b4366", "#22c55e", "#fbbf24", "#3b82f6", "#ef4444"];

interface ConfettiProps {
  count?: number;
  duration?: number;
}

export function Confetti({ count = 40, duration = 2 }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 360,
        drift: (Math.random() - 0.5) * 80,
        delay: Math.random() * 0.3,
        rotate: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 7,
        round: Math.random() > 0.5,
        dur: duration * (0.75 + Math.random() * 0.5),
      })),
    [count, duration]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -24, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: 460, x: p.x + p.drift, opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: 0,
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            borderRadius: p.round ? "9999px" : "2px",
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

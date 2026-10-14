import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────────────────────────────────────────────────────────────────────
   Dependency-free confetti burst.

   A celebratory full-bleed overlay used when a payout succeeds. Pieces are
   plain divs animated with Framer Motion (no canvas, no extra package), so it
   stays light and renders crisply inside the phone-sized vendor shell. The
   overlay is pointer-events-none so it never blocks the UI underneath, and it
   self-dismisses via onDone.
   ────────────────────────────────────────────────────────────────────────── */

const COLORS = ["#22c55e", "#16a34a", "#facc15", "#f97316", "#38bdf8", "#a855f7"];

interface ConfettiProps {
  show: boolean;
  onDone?: () => void;
  /** Number of confetti pieces. */
  count?: number;
}

export default function Confetti({ show, onDone, count = 80 }: ConfettiProps) {
  /* Self-dismiss after the slowest piece has fallen (max duration + delay). */
  useEffect(() => {
    if (!show) return;
    const tm = window.setTimeout(() => onDone?.(), 3400);
    return () => window.clearTimeout(tm);
  }, [show, onDone]);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        duration: 1.8 + Math.random() * 1.2,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 120,
        round: Math.random() > 0.5,
      })),
    [count],
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="confetti"
          className="pointer-events-none absolute inset-0 z-[70] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute top-0"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size * (p.round ? 1 : 1.6),
                backgroundColor: p.color,
                borderRadius: p.round ? "9999px" : "2px",
              }}
              initial={{ y: "-10%", x: 0, opacity: 0, rotate: p.rotate }}
              animate={{
                y: "115%",
                x: p.drift,
                opacity: [0, 1, 1, 0.9, 0],
                rotate: p.rotate + 360,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeIn",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

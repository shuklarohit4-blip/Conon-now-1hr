import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { subscribeLoading } from "@/lib/loading";

/**
 * Slim top progress bar shown whenever any axios request is in flight.
 * Driven by the global loading counter in `lib/loading.ts`.
 */
export function GlobalLoader() {
  const [active, setActive] = useState(false);

  useEffect(() => subscribeLoading(setActive), []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden pointer-events-none"
        >
          <motion.div
            className="h-full"
            style={{
              background: "linear-gradient(90deg, #15803d, #22c55e, #15803d)",
              width: "40%",
            }}
            animate={{ x: ["-40%", "260%"] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

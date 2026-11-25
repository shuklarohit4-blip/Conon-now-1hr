import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useUI } from "@/context/UIContext";
import { CartMainView } from "./cart";

export function CartSheet() {
  const [location] = useLocation();
  const { isCartOpen, setCartOpen } = useUI();

  // If already on the dedicated /cart page, do not open duplicate slide-over drawer
  if (location === "/cart") return null;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />

          {/* Slide-over Container (Mobile full screen, tablet/desktop right drawer) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#f4f5f7] z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            <CartMainView onBack={() => setCartOpen(false)} isStandalonePage={false} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

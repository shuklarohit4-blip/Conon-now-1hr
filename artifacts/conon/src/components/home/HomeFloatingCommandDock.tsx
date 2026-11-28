import React, { useEffect, useState } from "react";
import { ArrowUp, Camera, Mic, RotateCcw, ShoppingBag } from "lucide-react";

interface HomeFloatingCommandDockProps {
  onOpenAR: () => void;
  onOpenVoice: () => void;
  onReorderLast: () => void;
  onOpenCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const HomeFloatingCommandDock: React.FC<HomeFloatingCommandDockProps> = ({
  onOpenAR,
  onOpenVoice,
  onReorderLast,
  onOpenCart,
  cartCount,
  cartTotal,
}) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    const checkScroll = () => {
      const winY = window.scrollY || 0;
      const mainY = mainEl ? mainEl.scrollTop : 0;
      setShowBackToTop(Math.max(winY, mainY) > 320);
    };
    window.addEventListener("scroll", checkScroll, { passive: true });
    mainEl?.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => {
      window.removeEventListener("scroll", checkScroll);
      mainEl?.removeEventListener("scroll", checkScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-[84px] left-0 right-0 z-40 px-2.5 sm:px-4 pointer-events-none flex justify-center">
      <div className="pointer-events-auto max-w-full flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/80 shadow-xl px-2 py-1.5 overflow-x-auto scrollbar-hide">
        {/* AR Measure */}
        <button
          type="button"
          onClick={onOpenAR}
          aria-label="AR Measure Wall"
          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-50 dark:bg-[#12357A]/40 border border-blue-200 dark:border-sky-500/30 text-[#12357A] dark:text-sky-300 text-[11px] font-black hover:bg-blue-100 dark:hover:bg-[#12357A]/60 active:scale-95 transition cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">AR Measure</span>
          <span className="sm:hidden">AR</span>
        </button>

        {/* Voice Order */}
        <button
          type="button"
          onClick={onOpenVoice}
          aria-label="Voice Order"
          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#0B1B3D] text-white text-[11px] font-black hover:bg-[#12357A] active:scale-95 transition cursor-pointer"
        >
          <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Voice Order</span>
          <span className="sm:hidden">Voice</span>
        </button>

        {/* Live Cart Pill (when items > 0) */}
        {cartCount > 0 && (
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Open Cart"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shadow-md shadow-emerald-600/25 active:scale-95 transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>
              {cartCount} • ₹{Math.round(cartTotal).toLocaleString("en-IN")}
            </span>
          </button>
        )}

        {/* Reorder Last */}
        <button
          type="button"
          onClick={onReorderLast}
          aria-label="Reorder Last Order"
          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black active:scale-95 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">Reorder Last</span>
          <span className="md:hidden">Reorder</span>
        </button>

        {/* Back to Top */}
        {showBackToTop && (
          <button
            type="button"
            onClick={handleBackToTop}
            aria-label="Back to Top"
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-[11px] font-black active:scale-95 transition cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Top</span>
          </button>
        )}
      </div>
    </div>
  );
};

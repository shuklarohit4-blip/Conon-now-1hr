import React from "react";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, Truck, ArrowRight } from "lucide-react";

interface HomeHeroBannerProps {
  onSelectCategory?: (category: string) => void;
  className?: string;
}

export const HomeHeroBanner: React.FC<HomeHeroBannerProps> = ({
  onSelectCategory,
  className = "",
}) => {
  return (
    <div className={`px-3.5 sm:px-6 lg:px-8 my-2.5 sm:my-3.5 ${className}`}>
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs"
        style={{
          background: "linear-gradient(105deg, #fbfbf9 0%, #f6f5ef 46%, #f1eee4 100%)",
          minHeight: "180px",
        }}
      >
        {/* Right side: Construction site background + Tata Ace / Bolero Pickup loaded with brand materials */}
        <div className="absolute right-0 top-0 bottom-0 w-[58%] sm:w-[54%] md:w-[50%] lg:w-[48%] pointer-events-none overflow-hidden flex items-center justify-end">
          <img
            src={`${import.meta.env.BASE_URL}images/truck-hero-graphic.png`}
            alt="Construction materials delivery truck"
            className="h-full w-full object-cover object-left"
            style={{
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 12%)",
            }}
          />

          {/* Branded sideboard overlay for CONON-NOW */}
          <div
            className="absolute bottom-[23px] right-[14px] flex items-center gap-1 px-1.5 py-0.5 rounded shadow-sm"
            style={{
              background: "#253b20",
              border: "1px solid #3c5e34",
            }}
          >
            <span className="text-[#f2b705] text-[8.5px] font-black leading-none">⚡</span>
            <span className="text-[#f2b705] text-[8px] font-black tracking-wider leading-none">
              CONON-NOW
            </span>
          </div>
        </div>

        {/* Left side: Crisp vector copy and interactive value proposition badges */}
        <div className="relative z-10 py-3.5 sm:py-5 pl-3.5 sm:pl-6 pr-1 max-w-[56%] sm:max-w-[52%] md:max-w-[50%] flex flex-col justify-between">
          <div>
            {/* Top location tag */}
            <div className="inline-flex items-center gap-1 bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] px-2 py-0.5 rounded-full text-[9.5px] sm:text-[11px] font-bold tracking-tight mb-1.5 shadow-xs">
              <MapPin className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-[#15803d] shrink-0" strokeWidth={2.6} />
              <span>Serving Lucknow • 60 Mins</span>
            </div>

            {/* Headline */}
            <h2 className="text-[15.5px] sm:text-[20px] md:text-[24px] lg:text-[28px] font-black text-slate-900 leading-[1.18] tracking-tight">
              Construction materials{" "}
              <span className="text-[#16a34a] inline-block">delivered in 60 minutes.</span>
            </h2>

            {/* Subtext */}
            <p className="text-[10px] sm:text-[12.5px] md:text-[14px] font-semibold text-slate-600 mt-1 sm:mt-1.5 leading-snug">
              Everything on wholesale prices.
            </p>
          </div>

          {/* 4 Feature Pills in Responsive 2x2 / 4-Col Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 mt-2.5 sm:mt-4">
            {/* 1. Pay on Delivery */}
            <button
              type="button"
              onClick={() => onSelectCategory?.("cement")}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#fff8eb] border border-[#fde68a] px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md text-left active:scale-95 transition"
              title="Pay after you receive & verify"
            >
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-[9px] sm:text-[10px] leading-none">
                👛
              </span>
              <span className="text-[8.5px] sm:text-[10.5px] font-bold text-slate-800 leading-tight truncate">
                Pay on Delivery
              </span>
            </button>

            {/* 2. No minimum order value */}
            <button
              type="button"
              onClick={() => onSelectCategory?.("cement")}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md text-left active:scale-95 transition"
              title="No minimum cart size required"
            >
              <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600 shrink-0" strokeWidth={2.4} />
              <span className="text-[8px] sm:text-[10px] font-bold text-slate-800 leading-tight truncate">
                No min order
              </span>
            </button>

            {/* 3. Free Delivery above ₹500 */}
            <button
              type="button"
              onClick={() => onSelectCategory?.("cement")}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md text-left active:scale-95 transition"
              title="Free delivery on orders above ₹500"
            >
              <Truck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-600 shrink-0" strokeWidth={2.4} />
              <span className="text-[8px] sm:text-[10px] font-bold text-slate-800 leading-tight truncate">
                Free Delivery
              </span>
            </button>

            {/* 4. Upto 2% Cashback */}
            <button
              type="button"
              onClick={() => onSelectCategory?.("cement")}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#fefce8] border border-[#fef08a] px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md text-left active:scale-95 transition"
              title="Cashback on every order"
            >
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-amber-400 text-slate-900 font-black flex items-center justify-center shrink-0 text-[8.5px] sm:text-[9.5px] leading-none">
                %
              </span>
              <span className="text-[8px] sm:text-[10px] font-bold text-slate-800 leading-tight truncate">
                Upto 2% Cashback
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHeroBanner;

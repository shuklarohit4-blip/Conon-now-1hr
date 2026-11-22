import React from "react";
import { motion } from "framer-motion";
import { type HomeCategory } from "@/data/homeCategories";

interface HomeCategoryTileProps {
  category: HomeCategory;
  onClick: (category: HomeCategory) => void;
  index?: number;
}

export const HomeCategoryTile: React.FC<HomeCategoryTileProps> = ({
  category,
  onClick,
  index = 0,
}) => {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const imgSrc = category.image.startsWith("/")
    ? `${base}${category.image}`
    : category.image;

  return (
    <motion.button
      type="button"
      onClick={() => onClick(category)}
      variants={{
        hidden: { opacity: 0, y: 10, scale: 0.96 },
        show: { opacity: 1, y: 0, scale: 1 },
      }}
      whileTap={{ scale: 0.96 }}
      className="flex flex-col items-center group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-[20px]"
      aria-label={category.title}
    >
      {/* ── Soft Rounded Square Tile Box ── */}
      <div className="relative aspect-square w-full rounded-[18px] bg-[#F4F7FA] border border-[#EBF0F5] flex items-center justify-center p-3 sm:p-3.5 overflow-visible transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_10px_24px_-8px_rgba(15,23,42,0.12)] group-hover:border-[#D3DFEC] group-hover:bg-[#EEF4FA]">
        {/* Optional Micro Badge */}
        {category.badge && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#F2B705] text-[#1E293B] text-[8px] sm:text-[8.5px] font-extrabold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap z-10 border border-[#EAB308]/60 uppercase tracking-wider">
            {category.badge}
          </span>
        )}

        {/* ── Transparent Multi-Product Cluster Image ── */}
        <img
          src={imgSrc}
          alt={category.title}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105 select-none pointer-events-none drop-shadow-xs"
          onError={(e) => {
            // Fallback to central product category fallback
            const target = e.currentTarget;
            target.src = `${base}/images/categories/cement.webp`;
          }}
        />
      </div>

      {/* ── Centered Category Label Below Box ── */}
      <span className="mt-2.5 text-center text-[12px] sm:text-[13px] font-semibold text-[#1F2937] leading-[1.3] px-1 line-clamp-2 group-hover:text-[#2563EB] transition-colors w-full">
        {category.title}
      </span>
    </motion.button>
  );
};

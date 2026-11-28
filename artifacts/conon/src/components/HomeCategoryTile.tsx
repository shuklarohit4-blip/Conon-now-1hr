import React, { useEffect, useState } from "react";
import type { HomeCategory } from "@/data/homeCategories";
import { resolveCategoryAssetUrl } from "@/services/liveCategoriesStore";
import { CategoryIllustration } from "./CategoryIllustration";

interface HomeCategoryTileProps {
  category: HomeCategory;
  onClick?: (category: HomeCategory) => void;
  index?: number;
}

function isLightHexColor(hex?: string): boolean {
  if (!hex || !hex.startsWith("#")) return true;
  const clean = hex.slice(1);
  if (clean.length !== 6) return true;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62;
}

export const HomeCategoryTile: React.FC<HomeCategoryTileProps> = ({
  category,
  onClick,
}) => {
  const rawImage = category.imageUrl || category.image;
  const resolvedSrc = resolveCategoryAssetUrl(rawImage, category.updatedAt);
  const [imgSrc, setImgSrc] = useState(resolvedSrc);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgSrc(resolvedSrc);
    setImgFailed(false);
    setImgLoaded(false);
  }, [resolvedSrc]);

  const badgeBg = category.badgeColor || "#F2B705";
  const badgeText = isLightHexColor(badgeBg) ? "#1E293B" : "#FFFFFF";

  return (
    <button
      type="button"
      onClick={() => onClick?.(category)}
      className="group flex flex-col items-center text-center focus:outline-none w-full cursor-pointer active:scale-[0.97] transition-transform"
    >
      {/* Square Neutral Product Studio Tile (Zero Blank Grey Boxes) */}
      <div className="relative w-full aspect-square bg-[#F4F6F8] border border-slate-200/70 group-hover:border-[#CBD5E1] rounded-[18px] p-3.5 sm:p-4 lg:p-5 flex items-center justify-center transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5 overflow-visible">
        {category.badge && (
          <span
            style={{ backgroundColor: badgeBg, color: badgeText }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] sm:text-[8.5px] font-extrabold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap z-10 border border-black/10 uppercase tracking-wider"
          >
            {category.badge}
          </span>
        )}

        {/* Instant Crisp Vector Fallback while loading or if asset fails */}
        {(!imgLoaded || imgFailed || !imgSrc) && (
          <div className="w-4/5 h-4/5 flex items-center justify-center pointer-events-none">
            <CategoryIllustration slug={category.slug || category.title} />
          </div>
        )}

        {imgSrc && !imgFailed && (
          <img
            src={imgSrc}
            alt={category.title}
            loading="eager"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgFailed(true);
              setImgLoaded(false);
            }}
            className={`${
              imgLoaded ? "opacity-100" : "opacity-0 absolute inset-3.5 w-[calc(100%-1.75rem)] h-[calc(100%-1.75rem)]"
            } w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-all duration-200`}
          />
        )}
      </div>

      {/* Category Label */}
      <span className="mt-2.5 text-[12px] sm:text-[13px] font-medium text-[#1E293B] group-hover:text-[#1D4ED8] leading-snug line-clamp-2 max-w-[140px] px-0.5 transition-colors">
        {category.title}
      </span>
    </button>
  );
};

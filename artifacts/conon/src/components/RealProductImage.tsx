import React, { useState, useEffect } from "react";
import { resolveRealProductImage, type MediaResolvableProduct } from "@/utils/realMediaResolver";
import { CATEGORY_REAL_FLAGSHIP_MAP, utWaterplus } from "@/data/realMediaRegistry";

export interface RealProductImageProps {
  product?: MediaResolvableProduct | null;
  src?: string;
  alt?: string;
  title?: string;
  brand?: string;
  category?: string;
  categorySlug?: string;
  sku?: string;
  variant?: "card" | "tile" | "thumb" | "modal" | "banner";
  className?: string;
  containerClassName?: string;
  loading?: "lazy" | "eager";
  onClick?: (e?: React.MouseEvent) => void;
}

/**
 * RealProductImage — High-fidelity e-commerce studio media component.
 *
 * Modeled directly after the crisp studio presentation of the Homepage shelves:
 * - Bright clean backdrop (bg-[#F7F8FA] / bg-white)
 * - Proportional object-contain with balanced padding
 * - Smooth hover zoom
 * - Zero-Broken-Image Shield: onError falls back to verified real category photos.
 * - ZERO SVG bags, ZERO cartoon vectors, ZERO procedural placeholders.
 */
export function RealProductImage({
  product,
  src,
  alt = "Product Photo",
  title,
  brand,
  category,
  categorySlug,
  sku = "",
  variant = "card",
  className,
  containerClassName,
  loading = "lazy",
  onClick,
}: RealProductImageProps) {
  // Resolve the initial verified real studio photograph
  const initialResolved = resolveRealProductImage(
    product || {
      image: src,
      imageUrl: src,
      title: title || alt,
      brand,
      categorySlug: categorySlug || category,
      category,
      slug: sku,
    },
    title || alt,
    brand,
    categorySlug || category
  );

  const [currentSrc, setCurrentSrc] = useState<string>(initialResolved);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const resolved = resolveRealProductImage(
      product || {
        image: src,
        imageUrl: src,
        title: title || alt,
        brand,
        categorySlug: categorySlug || category,
        category,
        slug: sku,
      },
      title || alt,
      brand,
      categorySlug || category
    );
    setCurrentSrc(resolved);
    setHasError(false);
  }, [src, product, title, brand, category, categorySlug, sku]);

  const handleImgError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback Tier: Find category real photo fallback
      const catKey = (categorySlug || category || (product && (product.categorySlug || product.category)) || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      const fallback =
        CATEGORY_REAL_FLAGSHIP_MAP[catKey] ||
        CATEGORY_REAL_FLAGSHIP_MAP["cement"] ||
        utWaterplus;

      setCurrentSrc(fallback);
    }
  };

  // Variant default styling matching homepage studio shelves
  let defaultContainer = "relative w-full h-full flex items-center justify-center overflow-hidden bg-[#F7F8FA]";
  let defaultImg = "w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105";

  if (variant === "thumb") {
    defaultContainer = "relative w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden bg-[#F7F8FA] shrink-0 border border-slate-100";
    defaultImg = "w-full h-full object-contain p-1";
  } else if (variant === "modal") {
    defaultContainer = "relative w-full h-72 sm:h-96 flex items-center justify-center overflow-hidden bg-[#F7F8FA] rounded-2xl";
    defaultImg = "max-h-full max-w-full object-contain p-4";
  } else if (variant === "tile") {
    defaultContainer = "relative w-full aspect-square flex items-center justify-center overflow-hidden bg-[#F7F8FA] rounded-2xl";
    defaultImg = "w-full h-full object-contain p-2";
  }

  return (
    <div
      className={containerClassName || defaultContainer}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <img
        src={currentSrc}
        alt={title || alt || "Real Product Studio Photo"}
        loading={loading}
        decoding="async"
        onError={handleImgError}
        className={className || defaultImg}
      />
    </div>
  );
}

export default RealProductImage;

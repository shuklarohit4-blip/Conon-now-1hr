import React from "react";
import { CononProductMedia } from "./CononProductMedia";
import type { MediaResolvableProduct } from "@/utils/realMediaResolver";

/**
 * CononImage — Backward-compatible wrapper delegating 100% to CononProductMedia.
 */
export interface CononImageProps {
  src?: string | null;
  alt: string;
  brand?: string;
  category?: string;
  categorySlug?: string;
  product?: MediaResolvableProduct | null;
  mediaType?: "product" | "service" | "rental";
  variant?: "card" | "cover" | "tile" | "thumb" | "modal" | "detail" | "banner";
  className?: string;
  imgClassName?: string;
  dark?: boolean;
  isDark?: boolean;
  loading?: "lazy" | "eager";
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

export function CononImage({
  src,
  alt,
  brand,
  category,
  categorySlug,
  product,
  mediaType = "product",
  variant = "card",
  className = "",
  imgClassName = "",
  dark = false,
  isDark,
  loading = "lazy",
  onClick,
}: CononImageProps) {
  return (
    <CononProductMedia
      product={product}
      src={src ?? undefined}
      alt={alt}
      title={alt}
      brand={brand}
      category={category}
      categorySlug={categorySlug}
      mediaType={mediaType}
      variant={variant}
      isDark={isDark ?? dark}
      loading={loading}
      containerClassName={className}
      className={imgClassName || "w-full h-full object-contain"}
      onClick={onClick}
    />
  );
}

export default CononImage;

import React from "react";
import { CononProductMedia, type CononProductMediaProps } from "./CononProductMedia";
import type { MediaResolvableProduct } from "@/utils/realMediaResolver";

export interface RealProductImageProps {
  product?: MediaResolvableProduct | null;
  sku?: string;
  src?: string | null;
  alt?: string;
  title?: string;
  brand?: string;
  category?: string;
  categorySlug?: string;
  itemId?: string;
  slug?: string;
  unit?: string;
  spec?: string;
  grade?: string;
  variant?: CononProductMediaProps["variant"];
  showGalleryBadge?: boolean;
  isDark?: boolean;
  dark?: boolean;
  className?: string;
  containerClassName?: string;
  fallbackClassName?: string;
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * RealProductImage — Backward-compatible wrapper delegating 100% to CononProductMedia.
 * Single Source of Truth: public/real-products + Admin Media Vault.
 */
export function RealProductImage({
  product,
  sku,
  src,
  alt,
  title,
  brand,
  category,
  categorySlug,
  itemId,
  slug,
  unit,
  spec,
  grade,
  variant = "card",
  showGalleryBadge = true,
  isDark,
  dark,
  className,
  containerClassName,
  fallbackClassName,
  loading = "lazy",
  onClick,
}: RealProductImageProps) {
  return (
    <CononProductMedia
      product={product}
      src={src ?? undefined}
      alt={alt}
      title={title}
      brand={brand}
      category={category}
      categorySlug={categorySlug}
      itemId={itemId || sku}
      slug={slug}
      unit={unit}
      spec={spec}
      grade={grade}
      mediaType="product"
      variant={variant}
      showGalleryBadge={showGalleryBadge}
      isDark={isDark ?? dark}
      className={className}
      containerClassName={containerClassName || fallbackClassName}
      loading={loading}
      onClick={onClick}
    />
  );
}

export default RealProductImage;

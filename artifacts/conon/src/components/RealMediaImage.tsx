import React from "react";
import { CononProductMedia, type CononProductMediaProps } from "./CononProductMedia";
import type { MediaResolvableProduct } from "@/utils/realMediaResolver";

export interface RealMediaImageProps {
  mediaType?: "product" | "service" | "rental";
  itemId?: string;
  slug?: string;
  src?: string;
  alt?: string;
  title?: string;
  brand?: string;
  category?: string;
  categorySlug?: string;
  product?: MediaResolvableProduct | null;
  variant?: CononProductMediaProps["variant"];
  isDark?: boolean;
  className?: string;
  containerClassName?: string;
  loading?: "lazy" | "eager";
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * RealMediaImage — Unified zero-legacy photography component for Products,
 * Services, and Heavy Machine Rentals delegating directly to CononProductMedia.
 */
export function RealMediaImage({
  mediaType = "product",
  itemId,
  slug,
  src,
  alt,
  title,
  brand,
  category,
  categorySlug,
  product,
  variant = "card",
  isDark = false,
  className,
  containerClassName,
  loading = "lazy",
  onClick,
}: RealMediaImageProps) {
  return (
    <CononProductMedia
      mediaType={mediaType}
      itemId={itemId}
      slug={slug}
      src={src}
      alt={alt}
      title={title}
      brand={brand}
      category={category}
      categorySlug={categorySlug}
      product={product}
      variant={variant}
      isDark={isDark}
      className={className}
      containerClassName={containerClassName}
      loading={loading}
      onClick={onClick}
    />
  );
}

export default RealMediaImage;

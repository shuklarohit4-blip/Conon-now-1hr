import React from "react";
import { RealProductImage, type RealProductImageProps } from "./RealProductImage";

export interface ProductImageProps extends RealProductImageProps {
  src?: string;
  alt?: string;
  sku?: string;
  className?: string;
  containerClassName?: string;
  loading?: "lazy" | "eager";
  onClick?: (e?: React.MouseEvent) => void;
}

/**
 * Unified ProductImage component for Conon-Now.
 * Backed by the Universal Real-Photo Media Resolver:
 * - 100% genuine studio product photography on clean light backgrounds.
 * - ZERO SVG bags, ZERO cartoon vectors, ZERO procedural placeholder boxes.
 * - Automatic semantic fallback if a link is ever missing or broken.
 */
export function ProductImage(props: ProductImageProps) {
  return <RealProductImage {...props} />;
}

export { RealProductImage };
export default ProductImage;

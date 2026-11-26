import React from "react";
import { RealProductImage, type RealProductImageProps } from "./RealProductImage";

export interface ProductImageProps extends RealProductImageProps {}

/**
 * Unified ProductImage component for Conon-Now.
 * Delegates cleanly to CononProductMedia via RealProductImage.
 */
export function ProductImage(props: ProductImageProps) {
  return <RealProductImage {...props} />;
}

export { RealProductImage };
export default ProductImage;

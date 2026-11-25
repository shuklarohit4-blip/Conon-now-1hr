import React from "react";
import { ProductDetailSheet, type ProductDetailSheetProps } from "./ProductDetailSheet";

export type ProductDetailModalProps = ProductDetailSheetProps & {
  isAdding?: boolean;
};

/**
 * ProductDetailModal — Upgraded to Blinkit/Zepto quick-commerce standard ProductDetailSheet.
 * Provides backwards-compatible entry point for all storefronts and pages.
 */
export function ProductDetailModal(props: ProductDetailModalProps) {
  return <ProductDetailSheet {...props} />;
}

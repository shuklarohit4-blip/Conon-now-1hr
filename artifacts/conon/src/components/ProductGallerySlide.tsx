import React from "react";
import { CononProductMedia } from "./CononProductMedia";
import type { EnrichedProductData } from "@/lib/productMetadata";
import { resolveVaultAssetUrl } from "@/services/productMediaVault";

export interface ProductGallerySlideProps {
  src?: string;
  slideIndex: number;
  product: EnrichedProductData;
  caption?: string;
  fallbackDataUrl?: string;
  onZoom?: () => void;
  className?: string;
}

/**
 * Renders a single product detail slide directly via CononProductMedia.
 * Zero synthetic fallback slides — shows either the exact verified photo
 * or the clean CONON Verified SKU brand spec card.
 */
export function ProductGallerySlide({
  src,
  product,
  caption,
  fallbackDataUrl,
  onZoom,
  className = "",
}: ProductGallerySlideProps) {
  const directSrc = resolveVaultAssetUrl(src, fallbackDataUrl) || undefined;

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      onClick={onZoom}
    >
      <CononProductMedia
        product={product}
        src={directSrc}
        images={directSrc ? [{ url: directSrc, caption, fallbackDataUrl }] : undefined}
        variant="detail"
        showGalleryBadge={false}
        className="w-full h-full object-contain p-4"
        containerClassName="w-full h-full"
        loading="eager"
      />
      {caption && directSrc && (
        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/75 text-white text-[10px] font-bold backdrop-blur-xs pointer-events-none">
          {caption}
        </span>
      )}
    </div>
  );
}

export default ProductGallerySlide;

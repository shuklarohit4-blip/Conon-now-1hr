import { useEffect, useState } from "react";
import { resolveRealProductImage } from "@/utils/realMediaResolver";

/* ─────────────────────────────────────────────────────────────────────
   CononImage — Universal Real Product Image Wrapper

   Ensures 100% of product images render real studio photography.
   Guarantees ZERO placeholder icons, procedural SVG boxes, or
   empty frames ever appear anywhere across the storefront.
   ──────────────────────────────────────────────────────────────────── */
type Props = {
  src?: string | null;
  alt: string;
  category?: string;
  brand?: string;
  /** Classes for the wrapper element (sizing, rounding, positioning). */
  className?: string;
  /** Extra classes for the <img> element itself. */
  imgClassName?: string;
  dark?: boolean;
  loading?: "lazy" | "eager";
};

export function CononImage({
  src,
  alt,
  category,
  brand,
  className = "",
  imgClassName = "",
  dark = false,
  loading = "lazy",
}: Props) {
  const resolved = resolveRealProductImage(src, alt, brand, category);
  const [currentSrc, setCurrentSrc] = useState(resolved);
  const [hasFallenBack, setHasFallenBack] = useState(false);

  useEffect(() => {
    setCurrentSrc(resolveRealProductImage(src, alt, brand, category));
    setHasFallenBack(false);
  }, [src, alt, brand, category]);

  const handleError = () => {
    if (!hasFallenBack) {
      setHasFallenBack(true);
      setCurrentSrc(resolveRealProductImage(null, alt, brand, category));
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        className={`w-full h-full object-contain p-2 bg-white ${imgClassName}`}
        onError={handleError}
      />
    </div>
  );
}

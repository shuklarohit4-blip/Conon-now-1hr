import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────
   CononImage — a single bulletproof image wrapper for the whole app.

   On load failure (or an empty src) it renders a clean, BRANDED placeholder
   built from a local lucide icon + the alt label. The fallback is fully
   local (no third-party request such as placehold.co) so the "never show a
   broken box" guarantee holds even offline or when a remote host hangs
   without ever firing onError.

   `dark` switches the placeholder to the industrial dark-navy theme used by
   the heavy-equipment rental cards.
   ──────────────────────────────────────────────────────────────────── */
type Props = {
  src?: string | null;
  alt: string;
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
  className = "",
  imgClassName = "",
  dark = false,
  loading = "lazy",
}: Props) {
  const [failed, setFailed] = useState(false);
  // Reset on src change so a reused/virtualised node re-attempts a new url.
  useEffect(() => setFailed(false), [src]);

  const show = Boolean(src) && !failed;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {show ? (
        <img
          src={src as string}
          alt={alt}
          loading={loading}
          className={`w-full h-full object-cover ${imgClassName}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center gap-1 p-3 ${
            dark ? "bg-slate-800" : "bg-slate-100"
          }`}
        >
          <PackageSearch
            className={dark ? "text-slate-500" : "text-slate-400"}
            size={30}
            strokeWidth={1.8}
          />
          <span
            className={`text-[10px] font-bold text-center leading-tight line-clamp-2 ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {alt}
          </span>
        </div>
      )}
    </div>
  );
}

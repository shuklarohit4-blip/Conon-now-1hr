import React from "react";
import { CloudRain, Megaphone, PauseCircle, Clock } from "lucide-react";
import { useGlobalControls } from "@/hooks/useCononLiveData";

const TONE_MAP = {
  emerald: "bg-emerald-600 text-white border-emerald-500",
  amber: "bg-amber-500 text-slate-950 border-amber-400",
  crimson: "bg-rose-600 text-white border-rose-500",
};

export function LiveStorefrontBroadcastBar() {
  const { rainMode, storefrontBanner, deliverySlaMins, emergencyPause } = useGlobalControls();

  const hasBanner = Boolean(storefrontBanner?.enabled && storefrontBanner?.text?.trim());
  if (!hasBanner && !rainMode && !emergencyPause && deliverySlaMins === 60) {
    return null;
  }

  return (
    <div className="w-full space-y-1.5 px-3 sm:px-6 pt-2 max-w-[1160px] mx-auto">
      {emergencyPause && (
        <div className="w-full rounded-xl bg-rose-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black">
            <PauseCircle className="w-4 h-4 shrink-0" />
            <span>Storefront Dispatch Temporarily Paused by Operations Command</span>
          </div>
          <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full shrink-0">
            Maintenance
          </span>
        </div>
      )}

      {hasBanner && (
        <div
          className={`w-full rounded-xl border px-4 py-2.5 flex items-center justify-between gap-3 shadow-sm ${
            TONE_MAP[storefrontBanner.tone || "emerald"]
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Megaphone className="w-4 h-4 shrink-0" />
            {storefrontBanner.badge && (
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-black uppercase tracking-wider shrink-0">
                {storefrontBanner.badge}
              </span>
            )}
            <p className="text-xs font-bold truncate">{storefrontBanner.text}</p>
          </div>
          {deliverySlaMins !== 60 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black bg-black/15 px-2 py-0.5 rounded-full shrink-0">
              <Clock className="w-3 h-3" /> {deliverySlaMins}m SLA
            </span>
          )}
        </div>
      )}

      {rainMode && (
        <div className="w-full rounded-xl bg-sky-900 text-sky-50 border border-sky-700 px-4 py-2 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CloudRain className="w-4 h-4 text-sky-300 shrink-0" />
            <span>
              Monsoon Shield Active — All Cement, Putty &amp; Steel orders ship under verified waterproof Tirpal cover.
            </span>
          </div>
          <span className="text-[10px] font-black uppercase bg-sky-400/20 text-sky-200 px-2 py-0.5 rounded-full shrink-0">
            Rain Lock
          </span>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { ChevronRight, ShieldCheck, Star, Clock, MapPin } from "lucide-react";

export interface LucknowAuthorizedHub {
  id: string;
  name: string;
  zone: string;
  rating: string;
  slaLabel: string;
  isLiveExpress: boolean;
  specialty: string;
  accentHex: string;
  targetCategory: string;
  targetLabel: string;
  iconKind: "cement" | "steel" | "paint" | "electrical" | "masonry";
}

export const LUCKNOW_AUTHORIZED_HUBS: LucknowAuthorizedHub[] = [
  {
    id: "hub-ultratech-chinhat",
    name: "UltraTech Cement Hub",
    zone: "Chinhat & Transport Nagar",
    rating: "4.6",
    slaLabel: "60 Mins Express",
    isLiveExpress: true,
    specialty: "OPC 43/53 & Weather Plus",
    accentHex: "#D97706",
    targetCategory: "cement",
    targetLabel: "UltraTech Cement Hub",
    iconKind: "cement",
  },
  {
    id: "hub-tata-tiscon-nadarganj",
    name: "Tata Tiscon Steel Depot",
    zone: "Kanpur Rd & Nadarganj",
    rating: "4.7",
    slaLabel: "Same-Day Crane",
    isLiveExpress: false,
    specialty: "Fe550D TMT & Binding Wire",
    accentHex: "#1D4ED8",
    targetCategory: "steel",
    targetLabel: "Tata Tiscon Steel Depot",
    iconKind: "steel",
  },
  {
    id: "hub-asian-paints-gomtinagar",
    name: "Asian Paints Colour Hub",
    zone: "Gomti Nagar & Aliganj",
    rating: "4.5",
    slaLabel: "60 Mins Express",
    isLiveExpress: true,
    specialty: "Live Shade Tinting",
    accentHex: "#B45309",
    targetCategory: "paint",
    targetLabel: "Asian Paints Colour Hub",
    iconKind: "paint",
  },
  {
    id: "hub-polycab-philips-latouche",
    name: "Polycab & Philips Hub",
    zone: "Latouche Road & Naka",
    rating: "4.8",
    slaLabel: "60 Mins Express",
    isLiveExpress: true,
    specialty: "QR-Sealed Genuine",
    accentHex: "#047857",
    targetCategory: "electrical",
    targetLabel: "Polycab & Philips Hub",
    iconKind: "electrical",
  },
  {
    id: "hub-kajaria-conon-faizabad",
    name: "Kajaria & Conon Masonry Hub",
    zone: "Faizabad Rd & Barabanki",
    rating: "4.5",
    slaLabel: "2-Hr Site Slot",
    isLiveExpress: false,
    specialty: "Tiles, AAC Blocks & Bricks",
    accentHex: "#9A3412",
    targetCategory: "tiles",
    targetLabel: "Kajaria & Conon Masonry Hub",
    iconKind: "masonry",
  },
];

function HubVectorBadge({ kind, accentHex }: { kind: LucknowAuthorizedHub["iconKind"]; accentHex: string }) {
  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${accentHex}1A 0%, ${accentHex}0D 100%)`,
        borderColor: `${accentHex}33`,
      }}
    >
      {kind === "cement" && (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <rect x="7" y="7" width="22" height="22" rx="4" fill={accentHex} opacity="0.2" stroke={accentHex} strokeWidth="2" />
          <path d="M11 13h14M11 18h14M13 23h10" stroke={accentHex} strokeWidth="2" strokeLinecap="round" />
          <circle cx="25" cy="10" r="2.2" fill={accentHex} />
        </svg>
      )}
      {kind === "steel" && (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <path d="M7 26L26 7" stroke={accentHex} strokeWidth="3" strokeLinecap="round" />
          <path d="M11 29L29 11" stroke={accentHex} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          <path d="M14 14l2 2M19 19l2 2M15 23l2 2M21 15l2 2" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {kind === "paint" && (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <path d="M9 12h18v16a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V12z" fill={accentHex} opacity="0.2" stroke={accentHex} strokeWidth="2" />
          <path d="M12 12V9a6 6 0 0 1 12 0v3" stroke={accentHex} strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="20" r="4" fill={accentHex} />
        </svg>
      )}
      {kind === "electrical" && (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <circle cx="18" cy="18" r="11" stroke={accentHex} strokeWidth="2" fill={accentHex} fillOpacity="0.14" />
          <path d="M19.5 9L13 19h5l-1.5 8L23 17h-5l1.5-8z" fill={accentHex} />
        </svg>
      )}
      {kind === "masonry" && (
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
          <rect x="6" y="8" width="11" height="8" rx="1.5" fill={accentHex} opacity="0.25" stroke={accentHex} strokeWidth="1.8" />
          <rect x="19" y="8" width="11" height="8" rx="1.5" fill={accentHex} opacity="0.15" stroke={accentHex} strokeWidth="1.8" />
          <rect x="12" y="19" width="12" height="9" rx="1.5" fill={accentHex} opacity="0.35" stroke={accentHex} strokeWidth="1.8" />
        </svg>
      )}
    </div>
  );
}

interface LucknowAuthorizedHubsProps {
  onSelectHub: (categoryDb: string, label: string) => void;
  onSeeAll: () => void;
}

export const LucknowAuthorizedHubs: React.FC<LucknowAuthorizedHubsProps> = ({
  onSelectHub,
  onSeeAll,
}) => {
  return (
    <section aria-labelledby="lucknow-hubs-heading" className="mt-7 px-4">
      <div className="flex items-end justify-between gap-3 mb-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2
              id="lucknow-hubs-heading"
              className="font-display font-black text-base sm:text-lg text-[#0B1B3D] dark:text-white tracking-tight"
            >
              Lucknow Live Authorized Hubs
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3" /> Live Stock
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            Direct distributor rates • QR-verified stock
          </p>
        </div>

        <button
          type="button"
          onClick={onSeeAll}
          className="shrink-0 text-xs font-black text-[#12357A] dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          See all hubs <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal snap on mobile -> crisp 5-column responsive grid on desktop */}
      <div className="flex lg:grid lg:grid-cols-5 gap-3 overflow-x-auto lg:overflow-visible scrollbar-hide pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        {LUCKNOW_AUTHORIZED_HUBS.map((hub) => (
          <button
            key={hub.id}
            type="button"
            onClick={() => onSelectHub(hub.targetCategory, hub.targetLabel)}
            className="group relative shrink-0 w-[240px] sm:w-[250px] lg:w-auto text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.985] transition-all overflow-hidden flex flex-col justify-between cursor-pointer"
          >
            {/* Subtle brand accent top bar */}
            <div className="h-1.5 w-full" style={{ background: hub.accentHex }} />

            <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2.5">
                <HubVectorBadge kind={hub.iconKind} accentHex={hub.accentHex} />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[11px] font-black shadow-xs shrink-0">
                  <Star className="w-2.5 h-2.5" fill="currentColor" strokeWidth={0} />
                  {hub.rating}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-[13.5px] font-black text-[#0B1B3D] dark:text-white leading-snug group-hover:text-[#12357A] dark:group-hover:text-amber-300 transition-colors">
                  {hub.name}
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 leading-snug">
                  <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                  <span>{hub.zone}</span>
                </p>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-snug pt-0.5">
                  {hub.specialty}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-[10.5px] font-extrabold ${
                    hub.isLiveExpress
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-[#12357A] dark:text-sky-300"
                  }`}
                >
                  {hub.isLiveExpress ? (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  ) : (
                    <Clock className="w-3 h-3 shrink-0" />
                  )}
                  <span>{hub.slaLabel}</span>
                </span>

                <span className="text-[10px] font-black text-slate-400 group-hover:text-[#12357A] dark:group-hover:text-amber-300 transition-colors flex items-center">
                  Open <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

import React from "react";
import { Zap, Receipt, ShieldCheck, MapPin } from "lucide-react";

const TRUST_ITEMS = [
  {
    id: "express",
    icon: Zap,
    title: "⚡ 60-Min Lucknow Express",
    sub: "Live fleet dispatch from 5 hubs",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  {
    id: "gst",
    icon: Receipt,
    title: "🧾 100% GST Input Credit Ready",
    sub: "Instant B2B tax invoice on checkout",
    iconColor: "text-[#12357A] dark:text-sky-400",
    bgColor: "bg-[#12357A]/10 dark:bg-sky-500/10 border-[#12357A]/20 dark:border-sky-500/20",
  },
  {
    id: "qr",
    icon: ShieldCheck,
    title: "🛡️ QR-Verified Sealed Brands",
    sub: "Zero duplicate / adulterated stock",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "zones",
    icon: MapPin,
    title: "📍 Serving Gomti Nagar, Golf City, Aliganj, Vrindavan Yojna & Barabanki",
    sub: "60m bike • 90m e-loader • same-day tempo",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10 border-indigo-500/20",
  },
];

export const CononTrustFooter: React.FC = () => {
  return (
    <section aria-label="Conon Now Service Guarantees" className="mt-5 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4">
        {TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 shadow-2xs"
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.bgColor}`}>
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-[#0B1B3D] dark:text-white leading-snug">
                  {item.title}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

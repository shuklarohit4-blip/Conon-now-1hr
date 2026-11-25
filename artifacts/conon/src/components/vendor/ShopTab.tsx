import { useState } from "react";
import { motion } from "framer-motion";
import {
  Store,
  CheckCircle,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  Star,
  Zap,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Headphones,
  LogOut,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { useUser } from "@/context/UserContext";
import { GREEN, GREEN_DARK } from "./theme";

export function ShopTab() {
  const [, setLocation] = useLocation();
  const { logout } = useUser();
  const { t, lang, setLang } = useVendorLanguage();
  const {
    vendor,
    hubs,
    isOnline,
    toggleStoreStatus,
    switchDemoShop,
  } = useVendor();

  const [switching, setSwitching] = useState<string | null>(null);

  const handleSwitch = async (code: string, name: string) => {
    setSwitching(code);
    try {
      await switchDemoShop(code);
      toast.success(`Switched store to ${name}!`);
    } catch {
      toast.error("Failed to switch store");
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-4">
      {/* ── STORE PROFILE HERO CARD ── */}
      <div
        className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
                {vendor?.shopCode || "CN-LKO-101"}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white">
                <CheckCircle className="w-3 h-3 text-emerald-300" /> Verified Partner
              </span>
            </div>

            <h2 className="font-display font-black italic text-xl text-white mt-1.5 leading-tight">
              {vendor?.shopName || "Katawala Hardware & Locks"}
            </h2>

            <p className="text-[10px] text-green-200 font-semibold mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{vendor?.hubAddress || "Latouche Road, Aminabad, Lucknow"}</span>
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
            <Store className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Operating Hours & Status */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-100 text-[10px] font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>{vendor?.operatingHours || "08:00 AM - 08:30 PM"}</span>
          </div>

          <button
            onClick={async () => {
              try {
                await toggleStoreStatus();
                toast(isOnline ? "Store marked Closed" : "Store is now LIVE!", {
                  icon: isOnline ? "🔴" : "🟢",
                });
              } catch {
                toast.error("Failed to toggle store status");
              }
            }}
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition ${
              isOnline ? "bg-white text-emerald-900 shadow" : "bg-black/30 text-white/70"
            }`}
          >
            {isOnline ? "🟢 Dukaan Open" : "🔴 Dukaan Closed"}
          </button>
        </div>
      </div>

      {/* ── 4 LUCKNOW HUBS DEMO SELECTOR ── */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div>
          <h3 className="font-display font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            1-Click Switch Demo Dukaan (4 Lucknow Hubs)
          </h3>
          <p className="text-[10px] text-slate-500 font-medium">
            Test catalog, orders, and payouts across different Lucknow supply hubs
          </p>
        </div>

        <div className="space-y-2">
          {hubs.map((hub) => {
            const isCurrent = hub.shopCode === vendor?.shopCode || hub.id === vendor?.id;
            const isBusy = switching === hub.shopCode;

            return (
              <button
                key={hub.id}
                disabled={isCurrent || isBusy}
                onClick={() => handleSwitch(hub.shopCode, hub.shopName)}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                  isCurrent
                    ? "bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400 shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      {hub.shopCode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold truncate">
                      {hub.hubZone.split("(")[0].trim()}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-xs mt-1 truncate">
                    {hub.shopName}
                  </p>

                  <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                    {hub.categories.slice(0, 2).join(" • ")}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {isCurrent ? (
                    <span className="px-2.5 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-white text-slate-700 hover:bg-slate-200 text-[9px] font-black uppercase tracking-wider rounded-xl border border-slate-200 flex items-center gap-1">
                      {isBusy ? "Switching..." : "Switch"} <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PARTNER METRICS & GSTIN ── */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
        <h3 className="font-display font-black text-xs text-slate-900 uppercase tracking-wider">
          Partner Verification & Details
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Owner Name</p>
            <p className="font-bold text-slate-900 mt-0.5">{vendor?.ownerName || "Manoj Katawala"}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Mobile Phone</p>
            <p className="font-bold text-slate-900 mt-0.5">+91 {vendor?.phone || "9839011223"}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Registered GSTIN</p>
            <p className="font-mono font-bold text-slate-900 text-[11px] mt-0.5">{vendor?.gstin || "09AABCK1204N1Z4"}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">SLA Dispatch Rate</p>
            <p className="font-bold text-emerald-700 mt-0.5">{vendor?.slaScore || 98.4}% On-Time</p>
          </div>
        </div>
      </div>

      {/* ── SETTLEMENT BANK ACCOUNT ── */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <h3 className="font-display font-black text-xs text-slate-900 uppercase tracking-wider">
            Settlement Bank Account
          </h3>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900 text-xs">{vendor?.bankAccountMasked || "HDFC Bank ••••••4912"}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">UPI: {vendor?.upiId || "katawalahardware@hdfcbank"}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase">
            Auto-Linked
          </span>
        </div>
      </div>

      {/* ── SUPPORT & LOGOUT ── */}
      <div className="space-y-2">
        <a
          href="tel:1800CONONNOW"
          className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <Headphones className="w-4 h-4 text-emerald-600" />
          Conon Dukandar Support Hotline (1800-CONON-NOW)
        </a>

        <button
          onClick={() => {
            toast("Logged out of partner session", { icon: "👋" });
            logout();
            setLocation("/home");
          }}
          className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-4 h-4 text-rose-600" /> Sign Out from This Device
        </button>
      </div>
    </div>
  );
}

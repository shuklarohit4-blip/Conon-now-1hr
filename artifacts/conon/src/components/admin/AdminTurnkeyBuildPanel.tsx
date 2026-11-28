import React from "react";
import { Crown, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useCononMasterSync } from "@/context/CononMasterSyncContext";
import { DEFAULT_TURNKEY_TIERS, type TurnkeyConsultationLead } from "@/data/lucknowTurnkeyPackages";
import { adminFetch } from "@/lib/apiBase";

const STATUS_OPTS: TurnkeyConsultationLead["status"][] = [
  "NEW",
  "SITE_VISITED",
  "BOQ_SENT",
  "SIGNED",
];

export function AdminTurnkeyBuildPanel({ isDark }: { isDark: boolean }) {
  const masterSync = useCononMasterSync();
  const cfg = masterSync.state.globalControls.turnkeyBuild || {
    rates: { grey: 1190, silver: 1650, gold: 2100, platinum: 2750, luxury: 3600 },
    promoBanner: "Free 2D Vastu + LDA/Ansal Map Support on Gold & Platinum Turnkey",
    offerActive: true,
  };
  const leads = masterSync.state.operations.turnkeyConsultations || [];

  const updateRate = (tierId: string, val: number) => {
    void masterSync.patchMasterState(
      {
        globalControls: {
          turnkeyBuild: {
            ...cfg,
            rates: { ...cfg.rates, [tierId]: Math.max(500, val) },
          },
        },
      },
      "globalControls"
    );
  };

  const updateLeadStatus = (id: string, status: TurnkeyConsultationLead["status"]) => {
    const next = leads.map((l) => (l.id === id ? { ...l, status } : l));
    void masterSync.patchMasterState(
      { operations: { turnkeyConsultations: next } },
      "turnkeyBuild"
    );
    adminFetch(`/api/admin/build/consultations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    toast.success(`Lead ${id} updated to ${status}`);
  };

  const cardCls = isDark
    ? "bg-[#0F172A] border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-sm";

  return (
    <div className={`p-5 rounded-2xl border space-y-4 ${cardCls}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              Build &amp; Turnkey Studio Controls (`/build`)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500">
              Live &lt; 500ms Sync
            </span>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Live-edit per sq.ft Lucknow Turnkey rates, promotional offer &amp; real Site Visit leads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void masterSync.patchMasterState(
              {
                globalControls: {
                  turnkeyBuild: { ...cfg, offerActive: !cfg.offerActive },
                },
              },
              "globalControls"
            );
            toast.success(`Turnkey Promo Offer ${!cfg.offerActive ? "Enabled" : "Paused"}`);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer ${
            cfg.offerActive
              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/40"
              : "bg-slate-700/40 text-slate-400 border-slate-700"
          }`}
        >
          Offer Banner: {cfg.offerActive ? "ON" : "OFF"}
        </button>
      </div>

      {/* 5 Package Rate Editors */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        {DEFAULT_TURNKEY_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`p-2.5 rounded-xl border ${
              isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <label className="text-[10px] font-bold text-slate-400 block mb-1">
              {tier.name} (₹/sqft)
            </label>
            <input
              type="number"
              min={500}
              step={10}
              value={cfg.rates?.[tier.id] ?? tier.ratePerSqFt}
              onChange={(e) => updateRate(tier.id, Number(e.target.value || tier.ratePerSqFt))}
              className="w-full px-2 py-1 rounded-lg border border-slate-700/40 bg-transparent font-mono font-black text-amber-400"
            />
          </div>
        ))}
      </div>

      {/* Real Turnkey Site Visit Leads (Zero-Dummy) */}
      <div className="pt-2 border-t border-slate-800/30 space-y-2">
        <div className="flex items-center justify-between text-xs font-black">
          <span>Lucknow Turnkey Site Visit Leads (Zero-Dummy)</span>
          <span className="font-mono text-slate-400">{leads.length} lead(s)</span>
        </div>

        {leads.length === 0 ? (
          <p className="text-[11px] text-slate-500">
            Clean slate — no consultation leads yet. Real site visit bookings from `/build` appear here instantly.
          </p>
        ) : (
          <div className="space-y-2">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                  isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-black">
                    {lead.name} · <span className="font-mono text-amber-400">{lead.phone}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {lead.locationPincode}
                    </span>
                    <span>• {lead.plotSqFt} sq.ft • {lead.packageName}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {lead.preferredSlot}
                    </span>
                  </div>
                </div>
                <select
                  value={lead.status}
                  onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-black ${
                    isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  {STATUS_OPTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

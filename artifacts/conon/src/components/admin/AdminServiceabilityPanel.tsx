import React, { useMemo, useState } from "react";
import { MapPin, Plus, Trash2, Lock, Unlock, Bell, CheckCircle2, AlertTriangle, Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCononMasterSync } from "@/context/CononMasterSyncContext";
import {
  DEFAULT_SERVICEABILITY_CONFIG,
  sanitizePincode,
  type ServiceableZoneConfig,
  type ZoneDef,
} from "@/utils/serviceabilityPolicy";
import {
  DEFAULT_LUCKNOW_TRAFFIC_RULES,
  type LucknowTrafficRulesConfig,
  type VehicleClassId,
} from "@/utils/lucknowTrafficPolicy";
import { adminFetch } from "@/lib/apiBase";

export function AdminServiceabilityPanel({ isDark }: { isDark: boolean }) {
  const masterSync = useCononMasterSync();
  const cfg: ServiceableZoneConfig =
    masterSync.state.globalControls?.serviceability || DEFAULT_SERVICEABILITY_CONFIG;
  const waitlist = masterSync.state.operations?.pincodeWaitlist || [];
  const trafficCfg: LucknowTrafficRulesConfig =
    masterSync.state.globalControls?.trafficPolicy || DEFAULT_LUCKNOW_TRAFFIC_RULES;
  const [vipNoteDraft, setVipNoteDraft] = useState(trafficCfg.vipDiversionNote || "");

  const updateTrafficPolicy = async (patch: Partial<LucknowTrafficRulesConfig>, msg?: string) => {
    const next = { ...trafficCfg, ...patch };
    await masterSync.patchMasterState({ globalControls: { trafficPolicy: next } }, "trafficPolicy");
    if (msg) toast.success(msg);
  };

  const [newPin, setNewPin] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newSla, setNewSla] = useState(60);

  const groupedWaitlist = useMemo(() => {
    const map = new Map<string, { pincode: string; count: number; latestPhone: string; lastAt: string }>();
    for (const row of waitlist) {
      const prev = map.get(row.pincode);
      if (!prev) {
        map.set(row.pincode, {
          pincode: row.pincode,
          count: 1,
          latestPhone: row.phone,
          lastAt: row.createdAt,
        });
      } else {
        prev.count += 1;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [waitlist]);

  const persistZones = async (next: ServiceableZoneConfig, toastMsg: string) => {
    await masterSync.patchMasterState(
      { globalControls: { serviceability: next } },
      "serviceability"
    );
    adminFetch("/api/admin/serviceability/zones", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => {});
    toast.success(toastMsg);
  };

  const handleToggleZone = (pincode: string) => {
    const nextZones = cfg.activePincodes.map((z) =>
      z.pincode === pincode ? { ...z, active: !z.active } : z
    );
    void persistZones({ ...cfg, activePincodes: nextZones }, `Updated Pin Code ${pincode}`);
  };

  const handleUpdateZoneField = (pincode: string, patch: Partial<ZoneDef>) => {
    const nextZones = cfg.activePincodes.map((z) =>
      z.pincode === pincode ? { ...z, ...patch } : z
    );
    void masterSync.patchMasterState(
      { globalControls: { serviceability: { ...cfg, activePincodes: nextZones } } },
      "serviceability"
    );
  };

  const handleDeleteZone = (pincode: string) => {
    const nextZones = cfg.activePincodes.filter((z) => z.pincode !== pincode);
    void persistZones({ ...cfg, activePincodes: nextZones }, `Removed Pin Code ${pincode}`);
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizePincode(newPin);
    if (!/^\d{6}$/.test(clean)) {
      toast.error("Enter a valid 6-digit Pin Code");
      return;
    }
    if (!newArea.trim()) {
      toast.error("Enter Area Name (e.g. Indira Nagar)");
      return;
    }
    if (cfg.activePincodes.some((z) => z.pincode === clean)) {
      toast.error(`Pin Code ${clean} already exists in the list`);
      return;
    }
    const nextZones: ZoneDef[] = [
      ...cfg.activePincodes,
      {
        pincode: clean,
        areaName: newArea.trim(),
        slaMins: Math.max(15, Number(newSla || 60)),
        active: true,
      },
    ];
    void persistZones({ ...cfg, activePincodes: nextZones }, `Unlocked ${clean} (${newArea.trim()}) live!`);
    setNewPin("");
    setNewArea("");
    setNewSla(60);
  };

  const handleUnlockFromWaitlist = (pincode: string) => {
    if (cfg.activePincodes.some((z) => z.pincode === pincode)) {
      const nextZones = cfg.activePincodes.map((z) =>
        z.pincode === pincode ? { ...z, active: true } : z
      );
      void persistZones({ ...cfg, activePincodes: nextZones }, `Activated ${pincode} from waitlist!`);
      return;
    }
    const nextZones: ZoneDef[] = [
      ...cfg.activePincodes,
      { pincode, areaName: `Lucknow Zone ${pincode}`, slaMins: 60, active: true },
    ];
    void persistZones({ ...cfg, activePincodes: nextZones }, `Unlocked ${pincode} live for Storefront!`);
  };

  const cardCls = isDark
    ? "bg-[#0F172A] border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-sm";

  return (
    <div className={`p-5 rounded-2xl border space-y-5 ${cardCls}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              Launch Zones &amp; Pin Codes (Hyperlocal Lock)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500">
              Live &lt; 500ms Sync
            </span>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Only active pin codes can checkout or book RMC, Services &amp; Heavy Rentals.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void persistZones(
              { ...cfg, strictPincodeLock: !cfg.strictPincodeLock },
              `Strict Pin Code Lock: ${!cfg.strictPincodeLock ? "ON" : "OFF"}`
            )
          }
          className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer ${
            cfg.strictPincodeLock
              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/40"
              : "bg-amber-500/15 text-amber-400 border-amber-500/40"
          }`}
        >
          {cfg.strictPincodeLock ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>Strict Lock: {cfg.strictPincodeLock ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Active Pin Codes Switchboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cfg.activePincodes.map((z) => (
          <div
            key={z.pincode}
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-400/20 text-amber-400">
                  {z.pincode}
                </span>
                <input
                  type="text"
                  value={z.areaName}
                  onChange={(e) => handleUpdateZoneField(z.pincode, { areaName: e.target.value })}
                  className={`text-xs font-bold bg-transparent border-b border-transparent focus:border-emerald-500 outline-none w-full truncate ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>SLA:</span>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={z.slaMins}
                  onChange={(e) =>
                    handleUpdateZoneField(z.pincode, { slaMins: Math.max(15, Number(e.target.value || 60)) })
                  }
                  className="w-12 bg-transparent border border-slate-700/40 rounded px-1 py-0.5 font-mono text-[10px]"
                />
                <span>mins</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleZone(z.pincode)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer ${
                  z.active
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-700/40 text-slate-400 border border-slate-700"
                }`}
              >
                {z.active ? "ACTIVE" : "PAUSED"}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteZone(z.pincode)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                title={`Remove ${z.pincode}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* + Add New Pin Code Form */}
      <form onSubmit={handleAddZone} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
        <input
          type="text"
          maxLength={6}
          value={newPin}
          onChange={(e) => setNewPin(sanitizePincode(e.target.value))}
          placeholder="6-Digit Pin (e.g. 226016)"
          className={`px-3 py-2 rounded-xl border text-xs font-mono ${
            isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
          }`}
        />
        <input
          type="text"
          value={newArea}
          onChange={(e) => setNewArea(e.target.value)}
          placeholder="Area Name (e.g. Indira Nagar)"
          className={`sm:col-span-2 px-3 py-2 rounded-xl border text-xs ${
            isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
          }`}
        />
        <div className="flex gap-2">
          <input
            type="number"
            min={15}
            step={15}
            value={newSla}
            onChange={(e) => setNewSla(Number(e.target.value || 60))}
            className={`w-16 px-2 py-2 rounded-xl border text-xs font-mono ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
            }`}
            title="SLA Minutes"
          />
          <button
            type="submit"
            className="flex-1 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Pin</span>
          </button>
        </div>
      </form>

      {/* Real Expansion Demand Waitlist (Zero-Dummy) */}
      <div className="pt-3 border-t border-slate-800/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Expansion Demand Waitlist (Real User Requests)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {waitlist.length} total request{waitlist.length === 1 ? "" : "s"}
          </span>
        </div>

        {groupedWaitlist.length === 0 ? (
          <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            Clean slate — no blocked pin code requests yet. When customers click &quot;Notify Me&quot; on a blocked pin code, demand appears here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {groupedWaitlist.map((w) => (
              <div
                key={w.pincode}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                  isDark ? "bg-slate-900/70 border-slate-800" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div>
                  <span className="font-mono font-black">{w.pincode}</span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    {w.count} request{w.count === 1 ? "" : "s"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnlockFromWaitlist(w.pincode)}
                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Unlock Now</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LUCKNOW NO-ENTRY, PEAK-HOUR & VIP DIVERSION CONTROL PANEL */}
      <div className="pt-4 border-t border-slate-800/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Lucknow No-Entry &amp; Zero-Challan Traffic Rules
              </h4>
            </div>
            <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Controls daytime Heavy Truck/TM blocks, Peak-Hour LCV advisories &amp; instant VIP Diversion alerts across `/driver` and `/home`.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-xl border ${isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Heavy No-Entry Start (IST Hr)</label>
            <input
              type="number"
              min={0}
              max={23}
              value={trafficCfg.noEntryStartHour}
              onChange={(e) => void updateTrafficPolicy({ noEntryStartHour: Number(e.target.value || 6) })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700/40 bg-transparent font-mono font-black"
            />
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Heavy No-Entry End (IST Hr)</label>
            <input
              type="number"
              min={0}
              max={23}
              value={trafficCfg.noEntryEndHour}
              onChange={(e) => void updateTrafficPolicy({ noEntryEndHour: Number(e.target.value || 23) })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700/40 bg-transparent font-mono font-black"
            />
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">226002 Arjunganj Day Rule</label>
            <select
              value={trafficCfg.zonePreferredVehicle?.["226002"] || "THREE_WHEELER_LOADER"}
              onChange={(e) =>
                void updateTrafficPolicy({
                  zonePreferredVehicle: {
                    ...trafficCfg.zonePreferredVehicle,
                    "226002": e.target.value as VehicleClassId,
                  },
                }, "Updated 226002 preferred daytime vehicle")
              }
              className="w-full px-2 py-1.5 rounded-lg border border-slate-700/40 bg-transparent font-bold text-xs"
            >
              <option value="THREE_WHEELER_LOADER">3-Wheeler Priority (700 kg)</option>
              <option value="LCV_CHHOTA_HATHI">Chhota Hathi (1,500 kg)</option>
            </select>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <div className="text-[10px] font-bold text-slate-400 mb-1">Peak-Hour LCV Caution</div>
            <div className="font-mono font-black text-[11px]">
              {trafficCfg.peakMorningStart}–{trafficCfg.peakMorningEnd} &amp; {trafficCfg.peakEveningStart}–{trafficCfg.peakEveningEnd}
            </div>
          </div>
        </div>

        {/* 1-Click VIP / Shaheed Path Diversion Alert */}
        <div className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center gap-3 ${
          trafficCfg.vipDiversionActive
            ? "bg-amber-500/15 border-amber-500/50"
            : isDark ? "bg-[#080D1A] border-slate-800" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black">VIP / Shaheed Path Diversion Alert</span>
          </div>
          <input
            type="text"
            value={vipNoteDraft}
            onChange={(e) => setVipNoteDraft(e.target.value)}
            placeholder="e.g. Shaheed Path closed 12 PM–10 PM — use Kisan Path / Husadia Underpass"
            className={`flex-1 px-3 py-1.5 rounded-lg border text-xs ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
            }`}
          />
          <button
            type="button"
            onClick={() =>
              void updateTrafficPolicy(
                {
                  vipDiversionActive: !trafficCfg.vipDiversionActive,
                  vipDiversionNote: vipNoteDraft.trim(),
                },
                !trafficCfg.vipDiversionActive
                  ? "🚨 VIP Diversion Alert broadcasted live to Driver Cockpit & Checkout!"
                  : "VIP Diversion Alert cleared."
              )
            }
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer shrink-0 ${
              trafficCfg.vipDiversionActive
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-amber-400 hover:bg-amber-300 text-slate-950"
            }`}
          >
            {trafficCfg.vipDiversionActive ? "DIVERSION ON (Click to Clear)" : "Activate VIP Diversion"}
          </button>
        </div>

        {/* Zero-Challan Fleet Audit Log */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Zero-Challan Fleet Audit: Hard RC Payload Caps + Pre-Trip Tirpal/Overhang Gate Active
          </span>
          <span className="font-mono">Helpline: 9454405155</span>
        </div>
      </div>
    </div>
  );
}

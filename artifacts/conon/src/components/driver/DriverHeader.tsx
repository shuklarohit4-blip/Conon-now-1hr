import { useState, useEffect } from "react";
import { Truck, ChevronDown, Check } from "lucide-react";
import { useDriverLanguage } from "@/context/DriverLanguageContext";
import { useDriver } from "@/context/DriverContext";
import { LanguageToggle } from "./LanguageToggle";
import { GREEN, RED } from "./theme";
import { resolveApiUrl } from "@/lib/apiBase";
import { SocketStatusPill } from "@/services/socket";

export function DriverHeader() {
  const { t } = useDriverLanguage();
  const { isOnline, driverProfile, switchDriver } = useDriver();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roster, setRoster] = useState<any[]>([]);

  useEffect(() => {
    fetch(resolveApiUrl("/api/driver/roster"))
      .then((r) => r.json())
      .then((data) => {
        if (data?.drivers) setRoster(data.drivers);
      })
      .catch(() => {});
  }, []);

  const activeDriverName = driverProfile?.name || "Rajesh Kumar";
  const activeVehicle = driverProfile?.vehicleLabel || "2-Wheeler (Express)";

  return (
    <div className="shrink-0 bg-white border-b border-slate-100 px-4 pt-4 pb-3 relative z-30">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2.5 min-w-0 text-left active:scale-[0.98] transition"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: GREEN }}
          >
            <Truck className="w-5 h-5 text-white" strokeWidth={2.6} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-[14px] font-black text-slate-900 leading-none truncate">
                {activeDriverName}
              </p>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: isOnline ? GREEN : RED }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-wide leading-none"
                style={{ color: isOnline ? GREEN : RED }}
              >
                {activeVehicle} · {isOnline ? t("youAreOnline").split(" (")[0] : t("youAreOffline").split(" (")[0]}
              </span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <SocketStatusPill />
          {/* English | हिंदी toggle */}
          <LanguageToggle />
        </div>
      </div>

      {/* Roster Switcher Dropdown */}
      {dropdownOpen && (
        <div className="absolute left-4 right-4 top-16 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1.5">
            Switch Lucknow Driver Partner
          </p>
          <div className="space-y-1">
            {roster.map((d) => {
              const selected = (driverProfile?.id || "DRV-LKO-201") === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    void switchDriver(d.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition ${
                    selected ? "bg-emerald-50 text-emerald-950 font-bold" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-black">{d.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                        {d.vehiclePlate}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {d.vehicleLabel} · {d.currentZone}
                    </p>
                  </div>
                  {selected && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

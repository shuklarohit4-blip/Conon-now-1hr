import { Truck } from "lucide-react";
import { useDriverLanguage } from "@/context/DriverLanguageContext";
import { useDriver } from "@/context/DriverContext";
import { LanguageToggle } from "./LanguageToggle";
import { GREEN, RED } from "./theme";

/* App bar: brand mark, live duty pill, and the permanent English | हिंदी toggle.
   The toggle is always visible (top-right) so a driver can switch languages at
   any point in the flow without hunting through menus. */
export function DriverHeader() {
  const { t } = useDriverLanguage();
  const { isOnline } = useDriver();

  return (
    <div className="shrink-0 bg-white border-b border-slate-100 px-4 pt-4 pb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: GREEN }}
        >
          <Truck className="w-5 h-5 text-white" strokeWidth={2.6} />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-black text-slate-900 leading-none truncate">{t("appName")}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: isOnline ? GREEN : RED }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-wide leading-none"
              style={{ color: isOnline ? GREEN : RED }}
            >
              {isOnline ? t("youAreOnline").split(" (")[0] : t("youAreOffline").split(" (")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* English | हिंदी toggle */}
      <LanguageToggle />
    </div>
  );
}

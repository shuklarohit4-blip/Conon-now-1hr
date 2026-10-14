import { motion } from "framer-motion";
import { Power, Wallet } from "lucide-react";
import { useDriverLanguage } from "@/context/DriverLanguageContext";
import { GREEN, type DriverTab } from "./theme";

const ITEMS: { id: DriverTab; icon: typeof Power; key: "duty" | "kamai" }[] = [
  { id: "duty", icon: Power, key: "duty" },
  { id: "kamai", icon: Wallet, key: "kamai" },
];

/* Two huge tabs — Duty and My Kamai — sized for gloved, sunlit taps. */
export function DriverNav({ active, onChange }: { active: DriverTab; onChange: (tab: DriverTab) => void }) {
  const { t } = useDriverLanguage();
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-3 pt-2 pb-3 z-30">
      <div className="grid grid-cols-2 gap-2">
        {ITEMS.map(({ id, icon: Icon, key }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="relative flex flex-col items-center gap-1 py-2 rounded-2xl"
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className="w-7 h-7 transition-colors"
                style={{ color: isActive ? GREEN : "#94a3b8" }}
                strokeWidth={isActive ? 2.8 : 2.2}
              />
              <span
                className="text-[12px] font-black tracking-tight leading-none"
                style={{ color: isActive ? GREEN : "#94a3b8" }}
              >
                {t(key).split(" (")[0]}
              </span>
              {isActive && (
                <motion.div
                  layoutId="driverNavDot"
                  className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: GREEN }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

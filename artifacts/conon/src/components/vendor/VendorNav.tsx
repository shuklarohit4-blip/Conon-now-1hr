import { motion } from "framer-motion";
import { LayoutDashboard, ClipboardList, Package, Wallet, Store } from "lucide-react";
import { useVendorLanguage, type TKey } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { GREEN, type VendorTab } from "./theme";

const ITEMS: { id: VendorTab; icon: typeof LayoutDashboard; key: TKey; label: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, key: "dashboard", label: "Dashboard" },
  { id: "orders", icon: ClipboardList, key: "liveOrders", label: "Orders" },
  { id: "products", icon: Package, key: "products", label: "Products" },
  { id: "payouts", icon: Wallet, key: "payouts", label: "Payouts" },
  { id: "shop", icon: Store, key: "shop", label: "My Dukaan" },
];

export function VendorNav({
  active,
  onChange,
}: {
  active: VendorTab;
  onChange: (tab: VendorTab) => void;
}) {
  const { t } = useVendorLanguage();
  const { newOrdersCount } = useVendor();

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 pt-2 pb-3 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-5">
        {ITEMS.map(({ id, icon: Icon, key, label }) => {
          const isActive = active === id;
          const showBadge = id === "orders" && newOrdersCount > 0;
          const translated = t(key) ? t(key).split(" (")[0] : label;

          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="relative flex flex-col items-center gap-1 py-1.5 transition-transform active:scale-95"
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className="w-[22px] h-[22px] transition-colors"
                  style={{ color: isActive ? GREEN : "#94a3b8" }}
                  strokeWidth={isActive ? 2.6 : 2}
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none animate-pulse">
                    {newOrdersCount}
                  </span>
                )}
              </div>
              <span
                className="text-[9px] font-black uppercase tracking-tight leading-none truncate max-w-[64px]"
                style={{ color: isActive ? GREEN : "#94a3b8" }}
              >
                {translated}
              </span>
              {isActive && (
                <motion.div
                  layoutId="vendorNavDot"
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

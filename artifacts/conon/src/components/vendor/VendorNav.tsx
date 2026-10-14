import { motion } from "framer-motion";
import { LayoutDashboard, ClipboardList, Package, Wallet, PlusSquare } from "lucide-react";
import { useVendorLanguage, type TKey } from "@/context/VendorLanguageContext";
import { useVendor } from "@/context/VendorContext";
import { GREEN, type VendorTab } from "./theme";

const ITEMS: { id: VendorTab; icon: typeof LayoutDashboard; key: TKey }[] = [
  { id: "dashboard", icon: LayoutDashboard, key: "dashboard" },
  { id: "orders", icon: ClipboardList, key: "liveOrders" },
  { id: "products", icon: PlusSquare, key: "products" },
  { id: "inventory", icon: Package, key: "inventory" },
  { id: "khata", icon: Wallet, key: "khataPayments" },
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
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 pt-2 pb-3 z-30">
      <div className="grid grid-cols-5">
        {ITEMS.map(({ id, icon: Icon, key }) => {
          const isActive = active === id;
          const showBadge = id === "orders" && newOrdersCount > 0;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="relative flex flex-col items-center gap-1 py-1.5"
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className="w-[22px] h-[22px] transition-colors"
                  style={{ color: isActive ? GREEN : "#94a3b8" }}
                  strokeWidth={isActive ? 2.6 : 2}
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                    {newOrdersCount}
                  </span>
                )}
              </div>
              <span
                className="text-[8px] font-black uppercase tracking-tight leading-none truncate max-w-[64px]"
                style={{ color: isActive ? GREEN : "#94a3b8" }}
              >
                {t(key).split(" (")[0]}
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

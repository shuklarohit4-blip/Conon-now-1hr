import React from "react";
import { useLocation } from "wouter";
import { Package, Building2, Wrench, Tractor, Boxes, Crown } from "lucide-react";

export function CononQuickSwitchBar() {
  const [location, setLocation] = useLocation();

  const isMaterials =
    location === "/home" ||
    location.startsWith("/categories") ||
    location.startsWith("/category/");
  const isBuilderKit = location.startsWith("/kits") || location.startsWith("/builder-kit");
  const isTurnkeyBuild = location.startsWith("/build");
  const isServices = location.startsWith("/services");
  const isRentals = location.startsWith("/rentals");
  const isRmc = location.startsWith("/rmc") || location === "/category/rmc-ready-mix-concrete";

  const pills = [
    {
      id: "materials",
      label: "Materials (20+)",
      href: "/categories",
      icon: Package,
      active: isMaterials && !isRmc,
      tone: "slate",
    },
    {
      id: "build",
      label: "Build Ghar (Turnkey)",
      href: "/build",
      icon: Crown,
      active: isTurnkeyBuild,
      tone: "crown",
    },
    {
      id: "builder",
      label: "Builder Kit ★",
      href: "/kits",
      icon: Building2,
      active: isBuilderKit,
      tone: "gold",
    },
    {
      id: "services",
      label: "Skilled Services (18)",
      href: "/services",
      icon: Wrench,
      active: isServices,
      tone: "emerald",
      dot: "bg-emerald-500",
    },
    {
      id: "rentals",
      label: "Machines on Rent (20)",
      href: "/rentals",
      icon: Tractor,
      active: isRentals,
      tone: "amber",
      dot: "bg-amber-500",
    },
    {
      id: "rmc",
      label: "RMC Plant Direct",
      href: "/rmc",
      icon: Boxes,
      active: isRmc,
      tone: "slate",
    },
  ];

  return (
    <div className="w-full bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-3 sm:px-6 py-2 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
        {pills.map((p) => {
          const Icon = p.icon;
          const activeCls = p.active
            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
            : p.tone === "crown"
            ? "bg-blue-950 text-amber-300 border-blue-900 hover:bg-blue-900"
            : p.tone === "gold"
            ? "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100"
            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setLocation(p.href)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-black transition cursor-pointer shrink-0 ${activeCls}`}
            >
              {p.dot && !p.active && <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />}
              <Icon className="w-3.5 h-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

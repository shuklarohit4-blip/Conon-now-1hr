import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ArrowRight,
  X,
  Layers,
  Zap,
  Droplets,
  Wrench,
  ShieldCheck,
  Package,
  Sparkles,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HOME_DEPARTMENTS,
  type DepartmentNav,
  type HomeCategory,
} from "@/data/homeCategories";
import { useLiveCategories } from "@/hooks/useCononLiveData";
import type { HomeThemeMasthead } from "@/services/liveMerchandisingStore";

interface HomeDepartmentNavProps {
  activeDepartmentId?: string;
  onSelectDepartment?: (dept: DepartmentNav) => void;
  onSelectCategory?: (category: HomeCategory, subSlug?: string) => void;
  campaignTheme?: HomeThemeMasthead;
}

function getCategoryIcon(slug: string): { Icon: LucideIcon; cls: string } {
  if (slug.includes("rmc") || slug.includes("cement") || slug.includes("steel")) {
    return { Icon: Building2, cls: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  if (slug.includes("electr") || slug.includes("light") || slug.includes("appli")) {
    return { Icon: Zap, cls: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (slug.includes("plumb") || slug.includes("sanit") || slug.includes("kitchen")) {
    return { Icon: Droplets, cls: "bg-cyan-50 text-cyan-700 border-cyan-200" };
  }
  if (slug.includes("safety")) {
    return { Icon: ShieldCheck, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  if (slug.includes("tool") || slug.includes("hardware")) {
    return { Icon: Wrench, cls: "bg-slate-100 text-slate-700 border-slate-300" };
  }
  if (slug.includes("tile") || slug.includes("paint") || slug.includes("plywood")) {
    return { Icon: Layers, cls: "bg-indigo-50 text-indigo-700 border-indigo-200" };
  }
  return { Icon: Package, cls: "bg-slate-100 text-slate-700 border-slate-200" };
}

export const HomeDepartmentNav: React.FC<HomeDepartmentNavProps> = ({
  activeDepartmentId = "home",
  onSelectDepartment,
  onSelectCategory,
  campaignTheme,
}) => {
  const liveCategories = useLiveCategories();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(activeDepartmentId);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedDeptId(activeDepartmentId);
  }, [activeDepartmentId]);

  // Close dropdown on click outside or Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdownId(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeptClick = (dept: DepartmentNav) => {
    setSelectedDeptId(dept.id);
    if (!dept.hasDropdown) {
      setOpenDropdownId(null);
      onSelectDepartment?.(dept);
      return;
    }
    const cats = liveCategories.filter((c) => dept.categorySlugs.includes(c.slug));
    if (cats.length <= 1 && cats[0]) {
      setOpenDropdownId(null);
      onSelectCategory?.(cats[0]);
      return;
    }
    setOpenDropdownId((prev) => (prev === dept.id ? null : dept.id));
  };

  const activeDropdownDept = HOME_DEPARTMENTS.find((d) => d.id === openDropdownId);
  const matchingCategories = activeDropdownDept
    ? liveCategories.filter((c) => activeDropdownDept.categorySlugs.includes(c.slug))
    : [];
  const totalSubCount = matchingCategories.reduce((s, c) => s + (c.subcategories?.length || 0), 0);

  const isThemed = Boolean(campaignTheme?.isEnabled);

  return (
    <div
      ref={containerRef}
      className={`relative z-30 border-b ${
        isThemed
          ? "border-white/15 shadow-none"
          : "bg-white border-[#EAECEF] shadow-xs"
      }`}
      style={
        isThemed
          ? {
              background: campaignTheme?.bgGradientStart || "#0B292E",
            }
          : undefined
      }
    >
      {/* ── Inner Bar Container (100% Click-Only) ── */}
      <div className="max-w-[1240px] mx-auto px-4 lg:px-6">
        <nav
          className="flex items-center justify-start gap-1 sm:gap-2 py-2 overflow-x-auto no-scrollbar scroll-smooth"
          aria-label="Department Navigation"
        >
          {HOME_DEPARTMENTS.map((dept) => {
            const isSelected = selectedDeptId === dept.id;
            const isOpen = openDropdownId === dept.id;

            return (
              <div key={dept.id} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => handleDeptClick(dept)}
                  className={`flex items-center gap-1 text-[13px] sm:text-[13.5px] font-medium transition-all px-2.5 sm:px-3 py-1.5 rounded-md whitespace-nowrap select-none cursor-pointer ${
                    isThemed
                      ? isSelected || isOpen
                        ? "border border-white/30 bg-white/15 text-white font-semibold shadow-xs"
                        : "border border-transparent text-white/85 hover:text-white hover:bg-white/10"
                      : isSelected || isOpen
                        ? "border border-[#2563EB]/70 bg-[#F0F6FF] text-[#1D4ED8] font-semibold shadow-xs"
                        : "border border-transparent text-[#374151] hover:text-[#111827] hover:bg-slate-50"
                  }`}
                  aria-expanded={isOpen}
                  aria-haspopup={dept.hasDropdown}
                >
                  <span>{dept.label}</span>
                  {dept.hasDropdown && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isThemed
                          ? isOpen
                            ? "rotate-180 text-amber-300"
                            : "text-white/70"
                          : isOpen
                            ? "rotate-180 text-[#2563EB]"
                            : "text-slate-400"
                      }`}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Subtle click-away backdrop */}
      {openDropdownId && (
        <div
          onClick={() => setOpenDropdownId(null)}
          className="fixed inset-0 top-[140px] bg-slate-950/15 z-30"
          aria-hidden="true"
        />
      )}

      {/* ── Elevated Click-Only Mega-Dropdown Panel (Zero Truncation) ── */}
      <AnimatePresence>
        {openDropdownId && activeDropdownDept && matchingCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-[0_22px_45px_-12px_rgba(15,23,42,0.22)] z-40 max-h-[80vh] overflow-y-auto"
          >
            <div className="max-w-6xl mx-auto p-6 space-y-5">
              {/* Top Menu Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-base font-black text-slate-900">
                    {activeDropdownDept.label}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                    {matchingCategories.length} Categories · {totalSubCount} Sub-sections
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {matchingCategories[0] && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdownId(null);
                        onSelectCategory?.(matchingCategories[0]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1848a0] hover:bg-blue-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <span>Browse All {activeDropdownDept.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpenDropdownId(null)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close</span>
                    <kbd className="hidden sm:inline ml-1 px-1 py-0.2 rounded bg-slate-100 text-[10px] font-mono text-slate-500">
                      Esc
                    </kbd>
                  </button>
                </div>
              </div>

              {/* Generous 3-Column Layout — Zero Truncation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchingCategories.map((cat) => {
                  const { Icon, cls } = getCategoryIcon(cat.slug);
                  return (
                    <div
                      key={cat.slug}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3 hover:border-blue-200 hover:bg-white transition-all"
                    >
                      {/* Uniform Lucide Icon Badge + Full Readable Title */}
                      <div className="flex items-start justify-between gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdownId(null);
                            onSelectCategory?.(cat);
                          }}
                          className="flex items-start gap-3 text-left group/hdr cursor-pointer flex-1"
                        >
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cls}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[13.5px] font-black text-slate-900 leading-snug group-hover/hdr:text-[#1848a0] transition-colors">
                              {cat.title}
                            </p>
                            <span className="text-[11px] font-bold text-blue-700 inline-flex items-center gap-1 mt-0.5">
                              View All <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </button>
                      </div>

                      {/* Tidy Subcategory Rows — Full Readable Name */}
                      <ul className="space-y-1 pt-2 border-t border-slate-200/70">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                if (onSelectCategory) {
                                  onSelectCategory(cat, sub.slug);
                                } else {
                                  const target = cat.route || `/category/${cat.slug}`;
                                  window.location.href = `${target}?sub=${encodeURIComponent(sub.slug)}`;
                                }
                              }}
                              className="w-full text-left py-1.5 px-2.5 rounded-lg text-[12.5px] font-medium text-slate-700 hover:text-[#1848a0] hover:bg-blue-50/70 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <span className="leading-snug">{sub.name}</span>
                              {sub.itemCount ? (
                                <span className="px-1.5 py-0.5 rounded-full bg-slate-200/70 text-[10px] font-mono font-bold text-slate-600 shrink-0">
                                  {sub.itemCount}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

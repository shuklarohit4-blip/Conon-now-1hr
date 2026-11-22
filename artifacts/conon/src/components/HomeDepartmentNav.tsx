import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HOME_DEPARTMENTS,
  HOME_CATEGORIES,
  type DepartmentNav,
  type HomeCategory,
} from "@/data/homeCategories";

interface HomeDepartmentNavProps {
  activeDepartmentId?: string;
  onSelectDepartment?: (dept: DepartmentNav) => void;
  onSelectCategory?: (category: HomeCategory) => void;
}

export const HomeDepartmentNav: React.FC<HomeDepartmentNavProps> = ({
  activeDepartmentId = "home",
  onSelectDepartment,
  onSelectCategory,
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(activeDepartmentId);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleMouseEnter = (dept: DepartmentNav) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (dept.hasDropdown) {
      setOpenDropdownId(dept.id);
    } else {
      setOpenDropdownId(null);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdownId(null);
    }, 180);
  };

  const handleDeptClick = (dept: DepartmentNav) => {
    setSelectedDeptId(dept.id);
    onSelectDepartment?.(dept);
    if (dept.hasDropdown) {
      setOpenDropdownId(openDropdownId === dept.id ? null : dept.id);
    } else {
      setOpenDropdownId(null);
    }
  };

  const activeDropdownDept = HOME_DEPARTMENTS.find((d) => d.id === openDropdownId);
  const matchingCategories = activeDropdownDept
    ? HOME_CATEGORIES.filter((c) => activeDropdownDept.categorySlugs.includes(c.slug))
    : [];

  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

  return (
    <div
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
      className="relative z-30 bg-white border-b border-[#EAECEF] shadow-xs"
    >
      {/* ── Inner Bar Container ── */}
      <div className="max-w-[1240px] mx-auto px-3 sm:px-6 lg:px-8">
        <nav
          className="flex items-center justify-start md:justify-center gap-1 sm:gap-2 py-2 overflow-x-auto no-scrollbar scroll-smooth"
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
                  onMouseEnter={() => handleMouseEnter(dept)}
                  className={`flex items-center gap-1 text-[13px] sm:text-[13.5px] font-medium transition-all px-2.5 sm:px-3 py-1.5 rounded-md whitespace-nowrap select-none ${
                    isSelected
                      ? "border border-[#2563EB]/70 bg-[#F0F6FF] text-[#1D4ED8] font-semibold shadow-xs"
                      : isOpen
                      ? "border border-slate-300 bg-slate-50 text-[#111827]"
                      : "border border-transparent text-[#374151] hover:text-[#111827] hover:bg-slate-50"
                  }`}
                  aria-expanded={isOpen}
                  aria-haspopup={dept.hasDropdown}
                >
                  <span>{dept.label}</span>
                  {dept.hasDropdown && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 group-hover:text-slate-600 ${
                        isOpen ? "rotate-180 text-[#2563EB]" : ""
                      }`}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Elevated Mega-Dropdown Panel ── */}
      <AnimatePresence>
        {openDropdownId && activeDropdownDept && matchingCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className="absolute left-0 right-0 top-full bg-white border-b border-[#E2E8F0] shadow-[0_18px_36px_-12px_rgba(15,23,42,0.18)] z-40 max-h-[80vh] overflow-y-auto"
          >
            <div className="max-w-[1200px] mx-auto p-6 sm:p-8">
              {/* Header Title */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <h3 className="text-[16px] font-extrabold text-[#0F172A] tracking-tight">
                    {activeDropdownDept.label}
                  </h3>
                  <span className="text-[12px] font-medium text-slate-400">
                    ({matchingCategories.length} Categories)
                  </span>
                </div>
                <span className="text-[11.5px] text-slate-400 hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-slate-600 font-mono text-[10px]">Esc</kbd> to close
                </span>
              </div>

              {/* Categories Grid inside Mega Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {matchingCategories.map((cat) => {
                  const catImg = cat.image.startsWith("/")
                    ? `${base}${cat.image}`
                    : cat.image;

                  return (
                    <div
                      key={cat.slug}
                      className="group/card rounded-xl border border-slate-100 hover:border-blue-100 p-3.5 bg-slate-50/50 hover:bg-blue-50/30 transition-all"
                    >
                      {/* Top Thumbnail & Category Title */}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdownId(null);
                          onSelectCategory?.(cat);
                        }}
                        className="flex items-center gap-3 w-full text-left mb-3 group-hover/card:text-[#2563EB]"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover/card:scale-105 transition-transform">
                          <img
                            src={catImg}
                            alt={cat.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = `${base}/images/categories/cement.webp`;
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-slate-900 leading-snug group-hover/card:text-[#2563EB] transition-colors truncate">
                            {cat.title}
                          </p>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            Browse Collection <ArrowRight className="w-3 h-3 group-hover/card:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </button>

                      {/* Subcategories list */}
                      <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownId(null);
                                onSelectCategory?.(cat);
                              }}
                              className="text-[12px] text-slate-600 hover:text-[#2563EB] hover:font-medium transition-colors flex items-center justify-between w-full text-left py-0.5"
                            >
                              <span className="truncate">{sub.name}</span>
                              {sub.itemCount && (
                                <span className="text-[10px] text-slate-400 ml-1">
                                  {sub.itemCount}
                                </span>
                              )}
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

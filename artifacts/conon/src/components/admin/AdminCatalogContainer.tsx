import React, { useState, useEffect } from "react";
import { Package, TrendingUp, ImageIcon, Tractor, Search } from "lucide-react";
import { AdminCatalogTab } from "./AdminCatalogTab";
import { AdminMandiTab } from "./AdminMandiTab";
import { AdminRentalsTab } from "./AdminRentalsTab";
import { AdminGlobalSearch } from "./AdminGlobalSearch";
import ImageQA from "@/pages/ImageQA";

export function AdminCatalogContainer() {
  const [activeTab, setActiveTab] = useState<"catalog" | "mandi" | "images" | "rentals">("catalog");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);

  // Bind global Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectSku = (skuId: string) => {
    setSelectedSkuId(skuId);
    setActiveTab("catalog");
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation Header & Global Search Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "catalog"
                ? "bg-[#FDB813] text-slate-950 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Master Catalog (753)</span>
          </button>

          <button
            onClick={() => setActiveTab("mandi")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "mandi"
                ? "bg-[#FDB813] text-slate-950 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Lucknow Mandi Bhav</span>
          </button>

          <button
            onClick={() => setActiveTab("images")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "images"
                ? "bg-[#FDB813] text-slate-950 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Image QA & Packshots</span>
          </button>

          <button
            onClick={() => setActiveTab("rentals")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "rentals"
                ? "bg-[#FDB813] text-slate-950 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Tractor className="w-4 h-4" />
            <span>Equipment Rentals</span>
          </button>
        </div>

        {/* Global Search Shortcut Pill */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search catalog...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "catalog" && <AdminCatalogTab initialSelectedSkuId={selectedSkuId} />}
      {activeTab === "mandi" && <AdminMandiTab />}
      {activeTab === "images" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
          <ImageQA />
        </div>
      )}
      {activeTab === "rentals" && <AdminRentalsTab />}

      {/* Global Cmd+K Search Palette */}
      <AdminGlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSku={handleSelectSku}
      />
    </div>
  );
}

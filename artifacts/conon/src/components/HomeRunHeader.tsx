import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Menu, Search, X, Mic, MapPin, ChevronDown,
  Wallet, User, ShoppingBag, ShieldCheck, Truck, Percent
} from "lucide-react";
import { formatINR } from "@/lib/wallet";

interface HomeRunHeaderProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onVoiceClick: () => void;
  pincode: string;
  onOpenLocationSheet: () => void;
  walletBalance: number;
  cartCount: number;
  loggedIn: boolean;
  onOpenMenu: () => void;
  onOpenCart: () => void;
  onSelectCategory?: (category: string) => void;
}

const SEARCH_PLACEHOLDERS = [
  'Search for "Plywood & MDF"',
  'Search for "UltraTech Cement"',
  'Search for "Tata Tiscon TMT Steel"',
  'Search for "Asian Paints Royale"',
  'Search for "Dr. Fixit Waterproofing"',
  'Search for "Fevicol SH Adhesive"',
  'Search for "Polycab Wires"',
  'Search for "Kajaria Vitrified Tiles"',
];

export const HomeRunHeader: React.FC<HomeRunHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onVoiceClick,
  pincode,
  onOpenLocationSheet,
  walletBalance,
  cartCount,
  loggedIn,
  onOpenMenu,
  onOpenCart,
  onSelectCategory,
}) => {
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setPlaceholderIdx((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
        setIsFading(false);
      }, 250);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white select-none">
      {/* ── 1. Top Announcement Bar (Yellow HomeRun benchmark) ── */}
      <div className="bg-[#f2b705] text-slate-900 text-[11.5px] sm:text-xs font-bold py-1.5 px-4 text-center tracking-tight shadow-xs">
        Open 8 am to 8 pm all days
      </div>

      {/* ── 2. Main White Navigation Header ── */}
      <header className="px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 bg-white border-b border-slate-100 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        {/* Left Side: Brand Logo (Top Left Corner) + Hamburger Menu + 60 Mins Badge + Deliver To Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {/* Top Left Corner: CONON-NOW Brand Logo */}
          <Link href="/home" className="flex items-center gap-1.5 shrink-0 group active:scale-95 transition -ml-0.5" aria-label="CONON-NOW Home">
            <img
              src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
              alt="CONON-NOW Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[15px] sm:text-[17px] font-black text-[#1848a0] tracking-tighter">
                  CONON
                </span>
                <span className="bg-[#f2b705] text-slate-900 text-[8.5px] sm:text-[9.5px] font-black px-1.5 py-0.2 rounded-xs uppercase tracking-wider shadow-2xs">
                  NOW
                </span>
              </div>
              <span className="text-[7.5px] sm:text-[8px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                Infrabuilt
              </span>
            </div>
          </Link>

          {/* Thin Vertical Divider */}
          <div className="h-6 w-px bg-slate-200 hidden xs:block shrink-0" />

          {/* Hamburger Menu Toggle */}
          <button
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            className="p-1 text-slate-700 hover:text-slate-900 active:scale-90 transition rounded-md shrink-0"
          >
            <Menu className="w-5 sm:w-6 h-5 sm:h-6" strokeWidth={2.4} />
          </button>

          {/* Green 60 Mins Pill */}
          <div className="bg-[#15803d] text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded leading-[1.1] flex flex-col items-center justify-center shrink-0 shadow-xs">
            <span>60</span>
            <span>Mins</span>
          </div>

          {/* Deliver To dropdown */}
          <button
            onClick={onOpenLocationSheet}
            className="flex flex-col text-left active:opacity-80 transition group min-w-0"
            aria-label="Select delivery location"
          >
            <span className="text-[9px] sm:text-[9.5px] text-slate-400 font-semibold leading-none">Deliver To</span>
            <div className="flex items-center gap-0.5 text-[11px] sm:text-xs font-black text-slate-900 leading-tight mt-0.5">
              <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-700 shrink-0" strokeWidth={2.4} />
              <span className="truncate max-w-[75px] sm:max-w-[120px]">{pincode || "226010"}</span>
              <ChevronDown className="w-3 h-3 text-slate-500 shrink-0 group-hover:translate-y-0.5 transition-transform" strokeWidth={2.4} />
            </div>
          </button>

          {/* Desktop Navigation Links (Widescreen 16:9) */}
          <nav className="hidden xl:flex items-center gap-5 ml-4 border-l border-slate-200 pl-4">
            <Link href="/home" className="text-xs font-black text-[#1848a0] hover:underline">Home</Link>
            <Link href="/categories" className="text-xs font-bold text-slate-700 hover:text-blue-600">Categories</Link>
            <Link href="/kits" className="text-xs font-bold text-slate-700 hover:text-blue-600">Builder Kits</Link>
            <Link href="/rentals" className="text-xs font-bold text-slate-700 hover:text-blue-600">Heavy Rentals</Link>
            <Link href="/services" className="text-xs font-bold text-slate-700 hover:text-blue-600">Services</Link>
          </nav>
        </div>

        {/* Right: Wallet + User Profile + Shopping Bag Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Wallet Balance Chip */}
          <Link
            href="/rewards?tab=wallet"
            aria-label="Gold Wallet"
            title="Gold Wallet balance"
            className="flex items-center gap-1 sm:gap-1.5 h-7 sm:h-8 px-2 sm:px-3 rounded-full bg-amber-50 border border-amber-200/80 active:scale-95 transition"
          >
            <Wallet className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-600" strokeWidth={2.5} />
            <span className="text-[11px] sm:text-xs font-black text-amber-900">
              ₹{formatINR(walletBalance)}
            </span>
          </Link>

          {/* User Profile */}
          <button
            onClick={onOpenMenu}
            aria-label="User profile & account"
            className="p-1 sm:p-1.5 text-slate-700 hover:text-slate-900 active:scale-90 transition relative rounded-md"
          >
            <User className="w-[22px] sm:w-6 h-[22px] sm:h-6" strokeWidth={2.2} />
            {loggedIn && (
              <span className="absolute bottom-0.5 right-0.5 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>

          {/* Shopping Bag Cart */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping bag"
            className="p-1 sm:p-1.5 text-slate-700 hover:text-slate-900 active:scale-90 transition relative rounded-md"
          >
            <ShoppingBag className="w-[22px] sm:w-6 h-[22px] sm:h-6" strokeWidth={2.2} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[17px] sm:min-w-[19px] h-[17px] sm:h-[19px] px-1 text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center shadow-xs"
                style={{ background: "#1848a0", color: "#fff" }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── 3. Search Bar Row ── */}
      <div className="px-3.5 sm:px-6 lg:px-8 pt-2.5 pb-2 bg-white flex items-center justify-center border-b border-slate-100">
        <div className="w-full max-w-4xl flex items-center gap-2">
          <div className="relative flex-1 min-w-0 bg-[#F4F6F8] hover:bg-[#EDF1F5] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 rounded-xl h-10 sm:h-12 flex items-center px-3.5 border border-slate-200 transition-all">
            <Search className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400 shrink-0 mr-2.5" strokeWidth={2.4} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={SEARCH_PLACEHOLDERS[placeholderIdx]}
              className={`w-full min-w-0 bg-transparent text-[13px] sm:text-[14px] font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-opacity duration-200 ${
                isFading ? "placeholder:opacity-30" : "placeholder:opacity-100"
              }`}
            />
            {searchTerm ? (
              <button
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="p-1 text-slate-400 hover:text-slate-600 transition shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={2.4} />
              </button>
            ) : null}
          </div>

          {/* Companion Voice / Quick Estimate button */}
          <button
            onClick={onVoiceClick}
            aria-label="Voice estimate & search"
            className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-[#EDF5F6] hover:bg-[#E3EFF1] active:scale-95 transition-all flex items-center justify-center text-[#1848a0] border border-slate-200 shrink-0 shadow-2xs"
            title="Voice search & AI estimator"
          >
            <div className="flex items-center gap-0.5">
              <span className="w-[2.5px] h-2.5 sm:h-3 bg-[#1848a0] rounded-full animate-pulse" />
              <span className="w-[2.5px] h-4 sm:h-5 bg-[#1848a0] rounded-full" />
              <span className="w-[2.5px] h-3 sm:h-3.5 bg-[#1848a0] rounded-full animate-pulse" />
              <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#1848a0] ml-0.5" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      </div>

      {/* ── 4. Deep Maroon Trust & Value Strip (HomeRun Exact Match) ── */}
      <div className="bg-[#851616] text-white py-2 sm:py-2.5 px-3 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-white/20 text-center">
          {/* Column 1: Pay on Delivery */}
          <div className="px-1.5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-[9px] sm:text-[10px]">
                👛
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm font-black text-white tracking-tight">
                Pay on Delivery
              </span>
            </div>
            <p className="text-[8px] sm:text-[9.5px] font-medium text-amber-200/90 mt-0.5 leading-none truncate">
              Pay after you receive & verify
            </p>
          </div>

          {/* Column 2: 1% Cashback */}
          <div className="px-1.5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-white/15 flex items-center justify-center shrink-0 text-[9px] sm:text-[10px] font-black">
                %
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm font-black text-white tracking-tight">
                1% Cashback
              </span>
            </div>
            <p className="text-[8px] sm:text-[9.5px] font-medium text-amber-200/90 mt-0.5 leading-none truncate">
              Assured 1% cashback on orders
            </p>
          </div>

          {/* Column 3: Free Delivery */}
          <div className="px-1.5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
              <span className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Truck className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-white" strokeWidth={2.6} />
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm font-black text-white tracking-tight">
                Free Delivery
              </span>
            </div>
            <p className="text-[8px] sm:text-[9.5px] font-medium text-amber-200/90 mt-0.5 leading-none truncate">
              On all orders above ₹500
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeRunHeader;

import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Menu, Search, X, Mic, MapPin, ChevronDown,
  Wallet, User, ShoppingBag, ShieldCheck, Truck, Percent,
  Package, FileText, Layers, LogOut, Radio, Sparkles
} from "lucide-react";
import { formatINR } from "@/lib/wallet";
import { useUI } from "@/context/UIContext";
import { useUser } from "@/context/UserContext";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { IS_LOCAL_ADMIN } from "@/config/adminGuard";
import { CustomerDeliveryFeedbackModal } from "@/components/feedback/CustomerDeliveryFeedbackModal";
import { SmartSearchBar } from "@/components/SmartSearchBar";
import type { HomeThemeMasthead } from "@/services/liveMerchandisingStore";

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
  campaignTheme?: HomeThemeMasthead;
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
  campaignTheme,
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

  const { setLoginModalOpen } = useUI();
  const { user, userProfile, logout } = useUser();
  const { user: authUser, isAuthenticated: isAuthed, isAdmin, openAuthModal, logout: authLogout } = useAuthContext();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const logoClicksRef = useRef<number[]>([]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (!IS_LOCAL_ADMIN) return;
    const now = Date.now();
    logoClicksRef.current = [...logoClicksRef.current.filter((t) => now - t < 2000), now];
    if (logoClicksRef.current.length >= 5) {
      e.preventDefault();
      logoClicksRef.current = [];
      openAuthModal("admin");
      toast.info("🔒 Founder Admin Gate Unlocked (5x tap)");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isUserLoggedIn = loggedIn || isAuthed || !!authUser;
  const resolvedName = authUser?.name || user.name || userProfile.name || "";
  const resolvedRole = authUser?.displayRole || userProfile.role || "Builder / Owner";
  const resolvedPhone = authUser?.phone || user.phone || "";
  const userFirstName = resolvedName.trim().split(" ")[0] || (resolvedPhone ? `+91 ${resolvedPhone.slice(-4)}` : "Profile");

  const isThemed = Boolean(campaignTheme?.isEnabled);

  return (
    <div
      className={`w-full select-none ${isThemed ? "text-white" : "bg-white"}`}
      style={
        isThemed
          ? {
              background: `linear-gradient(180deg, ${campaignTheme?.bgGradientStart || "#0B292E"} 0%, ${
                campaignTheme?.bgGradientStart || "#0B292E"
              } 100%)`,
            }
          : undefined
      }
    >
      {/* ── 1. Top Announcement Bar ── */}
      <div
        className={`text-[11.5px] sm:text-xs font-bold py-1.5 px-4 text-center tracking-tight shadow-xs ${
          isThemed ? "bg-black/25 text-white/95" : "bg-[#4280e3] text-slate-900"
        }`}
      >
        Open 8 am to 8 pm all days
      </div>

      {/* ── 2. Main Navigation Header ── */}
      <header
        className={`px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between ${
          isThemed
            ? "bg-transparent border-b border-white/10"
            : "bg-white border-b border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
        }`}
      >
        {/* Left Side: Brand Logo (Top Left Corner) + Hamburger Menu + 60 Mins Badge + Deliver To Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {/* Top Left Corner: CONON-NOW Brand Logo */}
          <Link
            href="/home"
            onClick={handleLogoClick}
            className="flex items-center gap-1.5 shrink-0 group active:scale-95 transition -ml-0.5 cursor-pointer"
            aria-label="CONON-NOW Home"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
              alt="CONON-NOW Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1 leading-none">
                <span
                  className={`text-[15px] sm:text-[17px] font-black tracking-tighter ${
                    isThemed ? "text-white" : "text-[#1848a0]"
                  }`}
                >
                  CONON
                </span>
                <span
                  className="text-slate-950 text-[8.5px] sm:text-[9.5px] font-black px-1.5 py-0.2 rounded-xs uppercase tracking-wider shadow-2xs"
                  style={{ backgroundColor: isThemed ? campaignTheme?.accentColor || "#FACC15" : "#2198ed" }}
                >
                  NOW
                </span>
              </div>
              <span
                className={`text-[7.5px] sm:text-[8px] font-bold tracking-wider uppercase mt-0.5 ${
                  isThemed ? "text-white/70" : "text-slate-400"
                }`}
              >
                Infrabuilt
              </span>
            </div>
          </Link>

          {/* Thin Vertical Divider */}
          <div className={`h-6 w-px hidden xs:block shrink-0 ${isThemed ? "bg-white/20" : "bg-slate-200"}`} />

          {/* Hamburger Menu Toggle */}
          <button
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            className={`p-1 active:scale-90 transition rounded-md shrink-0 ${
              isThemed ? "text-white hover:text-amber-300" : "text-slate-700 hover:text-slate-900"
            }`}
          >
            <Menu className="w-5 sm:w-6 h-5 sm:h-6" strokeWidth={2.4} />
          </button>

          {/* ── Delivery Badge ── */}
          <button
            onClick={onOpenLocationSheet}
            className={`active:scale-95 transition-all rounded-md px-2.5 py-1 text-left flex flex-col justify-center cursor-pointer group shadow-2xs leading-tight ml-0.5 border ${
              isThemed
                ? "border-white/25 bg-white/10 hover:bg-white/15 text-white"
                : "border-slate-300 hover:border-slate-400 bg-white"
            }`}
            aria-label="Check delivery time and pincode"
          >
            <div
              className={`flex items-center gap-0.5 text-[12px] sm:text-[13px] font-bold leading-none ${
                isThemed ? "text-white" : "text-slate-900"
              }`}
            >
              <span>60 mins</span>
              <ChevronDown
                className={`w-3 h-3 group-hover:translate-y-0.5 transition-transform ${
                  isThemed ? "text-white/80" : "text-slate-600"
                }`}
                strokeWidth={2.5}
              />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] font-normal leading-none mt-1 tracking-tight ${
                isThemed ? "text-white/75" : "text-slate-500"
              }`}
            >
              {pincode || "226030"}
            </span>
          </button>

          {/* Desktop Search Bar (Blinkit + Flipkart Hybrid) */}
          <div className="hidden md:flex flex-1 min-w-[230px] lg:min-w-[300px] max-w-md mx-3">
            <SmartSearchBar
              value={searchTerm}
              onChange={onSearchChange}
              onFocusNavigateToSearch
              enableGlobalShortcut
              compact
            />
          </div>
        </div>

        {/* Right: Guarantee Pill + Wallet + User Profile (Login with OTP) + Shopping Bag Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Green Brand Guarantee Pill (Exact Match to Reference Screenshot) */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#247c23] text-white text-xs font-bold shadow-xs select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
            <span>CONON-NOW</span>
          </div>

          {/* Wallet Balance Chip + Login / Profile Side-by-Side */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Wallet Balance Chip */}
            <Link
              href="/rewards?tab=wallet"
              aria-label="Gold Wallet"
              title="Gold Wallet balance"
              className="flex items-center gap-1 sm:gap-1.5 h-8 px-2.5 sm:px-3 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/80 active:scale-95 transition shadow-2xs"
            >
              <Wallet className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-600" strokeWidth={2.5} />
              <span className="text-[11px] sm:text-xs font-black text-amber-900">
                ₹{formatINR(walletBalance)}
              </span>
            </Link>

            {/* 1-Tap Rate Last Delivery / Feedback Quick Trigger */}
            <button
              type="button"
              onClick={() => setFeedbackModalOpen(true)}
              title="Rate Last Delivery & Visual Material X-Ray"
              className="flex items-center gap-1 sm:gap-1.5 h-8 px-2.5 sm:px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1848a0] border border-blue-200/80 active:scale-95 transition shadow-2xs font-bold text-[11px] sm:text-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden xs:inline">Rate Delivery</span>
              <span className="xs:hidden">Rate</span>
            </button>

            {/* Glowing Indigo Admin Command OS Pill (Visible only when Local Admin) */}
            {IS_LOCAL_ADMIN && isAdmin && (
              <Link
                href="/admin"
                aria-label="Admin Command OS"
                title="Launch CONON COMMAND OS Operations Control"
                className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-full bg-[#0F172A] hover:bg-[#1E293B] border border-indigo-500/60 text-indigo-300 font-black text-[11px] sm:text-xs shadow-md shadow-indigo-950/50 active:scale-95 transition animate-pulse"
              >
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Admin Command OS</span>
                <span className="sm:hidden">Admin OS</span>
              </Link>
            )}

            {/* ── Login / Profile Button with Text ── */}
            {!isUserLoggedIn ? (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                aria-label="Login / Sign Up"
                className="flex items-center gap-1.5 h-8 px-3 sm:px-3.5 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-95 transition text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.2} />
                <span>Login / Sign Up</span>
              </button>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="User profile & menu"
                  className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white shrink-0" />
                  <span className="max-w-[75px] sm:max-w-[100px] truncate text-[11px] sm:text-xs">
                    {userFirstName}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 shrink-0 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
                      <p className="font-bold text-slate-900 truncate text-[13px]">
                        {resolvedName || "CONON Builder"}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {resolvedPhone ? `+91 ${resolvedPhone}` : "Verified Account"}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[9.5px] uppercase tracking-wider">
                        {resolvedRole}
                      </span>
                    </div>

                    <div className="py-1">
                      {IS_LOCAL_ADMIN && isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/80 font-black transition rounded-lg mx-1.5 mb-1"
                        >
                          <Radio className="w-4 h-4 text-indigo-600 shrink-0 animate-pulse" />
                          <span>Admin Command OS</span>
                        </Link>
                      )}
                      <Link
                        href="/live-track"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition"
                      >
                        <Package className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>My Orders (Live Track)</span>
                      </Link>
                      <Link
                        href="/khata"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition"
                      >
                        <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>CONON-NOW Khata</span>
                      </Link>
                      <Link
                        href="/kits"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition"
                      >
                        <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>My Builder Kit BOQs</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onOpenLocationSheet();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium transition cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Saved Lucknow Sites</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setProfileMenuOpen(false);
                          logout();
                          await authLogout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shopping Bag Cart */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping bag"
            className={`p-1 sm:p-1.5 active:scale-90 transition relative rounded-md cursor-pointer ${
              isThemed ? "text-white hover:text-amber-300" : "text-slate-700 hover:text-slate-900"
            }`}
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

      {/* ── 3. Search Bar Row (Mobile only, desktop uses integrated header search) ── */}
      <div
        className={`md:hidden px-3.5 sm:px-6 lg:px-8 pt-2.5 pb-2 flex items-center justify-center border-b ${
          isThemed ? "bg-transparent border-white/10" : "bg-white border-slate-100"
        }`}
      >
        <div className="w-full max-w-4xl flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <SmartSearchBar
              value={searchTerm}
              onChange={onSearchChange}
              onFocusNavigateToSearch
            />
          </div>

          {/* Companion Voice AI Estimator button */}
          <button
            onClick={onVoiceClick}
            aria-label="Voice estimate & order"
            className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-[#EDF5F6] hover:bg-[#E3EFF1] active:scale-95 transition-all flex items-center justify-center text-[#1848a0] border border-slate-200 shrink-0 shadow-2xs"
            title="Voice AI Estimator"
          >
            <Sparkles className="w-4 h-4 text-[#1848a0]" strokeWidth={2.3} />
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
              Material orders under ₹10,000
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

      {/* Customer Delivery & Material X-Ray Feedback Studio Modal */}
      <CustomerDeliveryFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        vaultBalance={walletBalance}
      />
    </div>
  );
};

export default HomeRunHeader;

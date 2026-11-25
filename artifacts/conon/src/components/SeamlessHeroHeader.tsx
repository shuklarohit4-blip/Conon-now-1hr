import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Search, X, Mic, MapPin, ChevronDown, ChevronRight,
  Wallet, User, ShoppingBag, Menu, Sparkles,
  Palette, Layers, Shield, Box, Wrench, Zap, Droplets, Grid3x3, Tag,
  Package, FileText, LogOut, Radio
} from "lucide-react";
import {
  getActiveCampaign,
  HeroCampaignConfig,
  SpotlightDeal,
  BentoCard,
  CategoryStripItem,
} from "@/config/heroCampaignConfig";
import { formatINR } from "@/lib/wallet";
import { useUI } from "@/context/UIContext";
import { useUser } from "@/context/UserContext";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { IS_LOCAL_ADMIN } from "@/config/adminGuard";

interface SeamlessHeroHeaderProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onVoiceClick: () => void;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  pincode: string;
  onOpenLocationSheet: () => void;
  walletBalance: number;
  cartCount: number;
  loggedIn: boolean;
  onOpenMenu: () => void;
  onOpenCart: () => void;
  campaignOverride?: HeroCampaignConfig;
}

export const SeamlessHeroHeader: React.FC<SeamlessHeroHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onVoiceClick,
  selectedCategory,
  onSelectCategory,
  pincode,
  onOpenLocationSheet,
  walletBalance,
  cartCount,
  loggedIn,
  onOpenMenu,
  onOpenCart,
  campaignOverride,
}) => {
  const config = campaignOverride || getActiveCampaign();

  // Search placeholder rotator
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setPlaceholderIdx((prev) => (prev + 1) % config.searchPlaceholders.length);
        setIsFading(false);
      }, 250);
    }, 2800);
    return () => clearInterval(timer);
  }, [config.searchPlaceholders]);

  const { setLoginModalOpen } = useUI();
  const { user, userProfile, logout } = useUser();
  const { user: authUser, isAuthenticated: isAuthed, isAdmin, openAuthModal, logout: authLogout } = useAuthContext();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const heroProfileRef = useRef<HTMLDivElement>(null);
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
      if (heroProfileRef.current && !heroProfileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isUserLoggedIn = loggedIn || isAuthed || !!authUser;
  const resolvedName = authUser?.name || user.name || userProfile.name || "";
  const resolvedRole = authUser?.displayRole || userProfile.role || "Builder / Homeowner";
  const resolvedPhone = authUser?.phone || user.phone || "";
  const userFirstName = resolvedName.trim().split(" ")[0] || (resolvedPhone ? `+91 ${resolvedPhone.slice(-4)}` : "Profile");

  // Left Tall Bento Card - Spotlight Carousel
  const [dealIdx, setDealIdx] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (isCarouselHovered) return;
    const interval = setInterval(() => {
      setDealIdx((prev) => (prev + 1) % config.spotlightDeals.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isCarouselHovered, config.spotlightDeals.length]);

  const currentDeal = config.spotlightDeals[dealIdx] || config.spotlightDeals[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swipe left -> next
        setDealIdx((prev) => (prev + 1) % config.spotlightDeals.length);
      } else {
        // Swipe right -> prev
        setDealIdx((prev) => (prev - 1 + config.spotlightDeals.length) % config.spotlightDeals.length);
      }
    }
    touchStartXRef.current = null;
  };

  // Category Strip Icons Resolver
  const renderCategoryIcon = (iconName: CategoryStripItem["iconName"]) => {
    const props = { className: "w-5 h-5 text-white/95", strokeWidth: 2.2 };
    switch (iconName) {
      case "all":
        return <ShoppingBag {...props} />;
      case "sale":
        return <Sparkles {...props} className="w-5 h-5 text-amber-300" />;
      case "cement":
        return <Layers {...props} />;
      case "steel":
        return <Shield {...props} />;
      case "paints":
        return <Palette {...props} />;
      case "plywood":
        return <Box {...props} />;
      case "hardware":
        return <Wrench {...props} />;
      case "electrical":
        return <Zap {...props} />;
      case "plumbing":
        return <Droplets {...props} />;
      case "tiling":
        return <Grid3x3 {...props} />;
      default:
        return <Tag {...props} />;
    }
  };

  return (
    <div
      className="relative text-white overflow-hidden select-none"
      style={{
        background: `linear-gradient(180deg, ${config.colors.gradientTop} 0%, ${config.colors.gradientMid} 28%, ${config.colors.gradientHero} 62%, ${config.colors.gradientDeep} 100%)`,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* ────────────────────────────────────────────────────────────
          LAYER 1: TOP APP BAR + SEARCH ROW + CATEGORY STRIP
          ──────────────────────────────────────────────────────────── */}
      <div className="px-3 sm:px-3.5 pt-3 pb-1 w-full max-w-full min-w-0">
        {/* Top App Bar Row */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full min-w-0">
          {/* Left: Top Left Brand Logo + Hamburger + Delivery In 60 Mins + Location Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {/* Top Left Corner: CONON-NOW Brand Logo */}
            <Link
              href="/home"
              onClick={handleLogoClick}
              className="flex items-center gap-1 shrink-0 group active:scale-95 transition -ml-0.5 cursor-pointer"
              aria-label="CONON-NOW Home"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
                alt="CONON-NOW Logo"
                className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-xs"
              />
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-[14px] sm:text-[15.5px] font-black text-white tracking-tighter drop-shadow-xs">
                    CONON
                  </span>
                  <span className="bg-[#f2b705] text-slate-900 text-[8px] sm:text-[8.5px] font-black px-1 py-0.2 rounded-xs uppercase tracking-wider shadow-2xs">
                    NOW
                  </span>
                </div>
              </div>
            </Link>

            <button
              onClick={onOpenMenu}
              aria-label="Open side navigation"
              className="p-1 text-white/95 hover:text-white active:scale-90 transition rounded-lg shrink-0"
            >
              <Menu className="w-5 sm:w-6 h-5 sm:h-6" strokeWidth={2.4} />
            </button>

            {/* Delivery Promise & Interactive Location Pill */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1 leading-none">
                <span className="text-[9.5px] sm:text-[10px] font-semibold text-white/80 uppercase tracking-wider">
                  Delivery in
                </span>
                <span className="text-[15px] sm:text-[17px] font-black text-white tracking-tight leading-none drop-shadow-xs">
                  60 minutes
                </span>
              </div>

              {/* Interactive Location Pill */}
              <button
                onClick={onOpenLocationSheet}
                className="inline-flex items-center gap-1 mt-1 bg-white/20 hover:bg-white/25 active:scale-95 transition-all backdrop-blur-md px-2 py-0.5 rounded-full border border-white/25 text-left group shadow-2xs max-w-[140px]"
                aria-label="Change delivery location"
              >
                <MapPin className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-white/90 shrink-0" strokeWidth={2.4} />
                <span className="text-[10.5px] sm:text-[11px] font-extrabold text-white leading-tight truncate">
                  HOME - {pincode || "226010"}
                </span>
                <ChevronDown className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-white/80 shrink-0 group-hover:translate-y-0.5 transition-transform" strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Right: Frosted Wallet Chip + Login / Profile + Cart Bag */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dark Frosted Wallet Chip */}
            <Link
              href="/rewards?tab=wallet"
              className="flex items-center gap-1 sm:gap-1.5 bg-black/35 hover:bg-black/50 active:scale-95 transition backdrop-blur-md px-2.5 sm:px-3 py-1.5 rounded-full border border-white/25 text-white shadow-xs"
              title="Gold Wallet Balance"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-300" strokeWidth={2.5} />
              <span className="text-[11px] sm:text-xs font-black tracking-tight text-white">
                ₹{formatINR(walletBalance)}
              </span>
            </Link>

            {/* Glowing Indigo Admin Command OS Pill (Visible only when Local Admin) */}
            {IS_LOCAL_ADMIN && isAdmin && (
              <Link
                href="/admin"
                aria-label="Admin Command OS"
                title="Launch CONON COMMAND OS Operations Control"
                className="flex items-center gap-1.5 h-7 sm:h-8 px-2.5 sm:px-3 rounded-full bg-[#0F172A] hover:bg-[#1E293B] border border-indigo-500/60 text-indigo-300 font-black text-[11px] sm:text-xs shadow-md shadow-indigo-950/50 active:scale-95 transition animate-pulse"
              >
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Admin Command OS</span>
                <span className="sm:hidden">Admin OS</span>
              </Link>
            )}

            {/* Login Button or Profile Pill */}
            {!isUserLoggedIn ? (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                aria-label="Login / Sign Up"
                className="flex items-center gap-1.5 h-7 sm:h-8 px-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-[11px] sm:text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-900" strokeWidth={2.4} />
                <span>Login / Sign Up</span>
              </button>
            ) : (
              <div className="relative" ref={heroProfileRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-label="User profile & menu"
                  className="flex items-center gap-1.5 h-7 sm:h-8 px-2.5 sm:px-3 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md border border-white/30 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white shrink-0" />
                  <span className="max-w-[70px] sm:max-w-[90px] truncate text-[11px] sm:text-xs">
                    {userFirstName}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-white/80 shrink-0 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 text-slate-800">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
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

            {/* Circular Cart Bag Button */}
            <button
              onClick={onOpenCart}
              aria-label="Shopping Cart"
              className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition backdrop-blur-md border border-white/30 flex items-center justify-center text-white relative shadow-2xs shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={2.4} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] sm:min-w-[17px] h-4 sm:h-[17px] px-1 text-[8.5px] sm:text-[9px] font-black rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shadow-xs border border-white/60">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Row: Frosted Pill Search + Voice Waveform Button */}
        <div className="mt-2.5 flex items-center gap-2 w-full min-w-0">
          {/* Soft Frosted Sky-White Pill Search Input */}
          <div className="relative flex-1 min-w-0 bg-white/95 hover:bg-white focus-within:bg-white backdrop-blur-md rounded-2xl h-10 sm:h-11 flex items-center px-3 sm:px-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.10),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/60 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2 sm:mr-2.5" strokeWidth={2.4} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={config.searchPlaceholders[placeholderIdx]}
              className={`w-full min-w-0 bg-transparent text-[13px] sm:text-[13.5px] font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-opacity duration-200 ${
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

          {/* Right Companion Frosted Circular Voice Button */}
          <button
            onClick={onVoiceClick}
            aria-label="Voice estimate & search"
            className="w-10 sm:w-11 h-10 sm:h-11 rounded-2xl bg-[#E8F3FD] hover:bg-white active:scale-95 transition-all backdrop-blur-md flex items-center justify-center text-[#094596] shadow-[0_4px_16px_rgba(0,0,0,0.10)] border border-white/80 shrink-0"
            title="Speak or voice search"
          >
            {/* Waveform / Mic combination icon */}
            <div className="flex items-center gap-0.5">
              <span className="w-[2.5px] sm:w-[3px] h-2.5 sm:h-3 bg-[#094596] rounded-full animate-pulse" />
              <span className="w-[2.5px] sm:w-[3px] h-4 sm:h-5 bg-[#094596] rounded-full" />
              <span className="w-[2.5px] sm:w-[3px] h-3 sm:h-3.5 bg-[#094596] rounded-full animate-pulse" />
              <Mic className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#094596] ml-0.5" strokeWidth={2.5} />
            </div>
          </button>
        </div>

        {/* Horizontal Scrollable Category Icon Strip */}
        <div className="mt-3 flex items-center gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth px-1 pb-1 w-full max-w-full min-w-0">
          {config.categoryStrip.map((item) => {
            const isActive =
              item.slug === ""
                ? selectedCategory === null
                : selectedCategory === item.slug;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.slug === "") {
                    onSelectCategory(null);
                  } else {
                    onSelectCategory(item.slug);
                  }
                }}
                className="flex flex-col items-center shrink-0 group active:scale-95 transition-all relative pt-1"
              >
                {/* Micro "New" or "Sale" badge */}
                {item.isNew && (
                  <span className="absolute -top-1.5 -right-2 bg-[#EF4444] text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs border border-white/60 animate-bounce">
                    New
                  </span>
                )}

                {/* Icon Container */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-white/25 shadow-xs border border-white/35"
                      : "bg-white/10 group-hover:bg-white/15"
                  }`}
                >
                  {renderCategoryIcon(item.iconName)}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${
                    isActive ? "text-white drop-shadow-xs" : "text-white/80 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active White Bottom Pill Indicator */}
                {isActive && (
                  <span className="w-6 h-[3px] bg-white rounded-full mt-1 shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          LAYER 2: WAVY STITCHED DIVIDER & HERO CAMPAIGN HEADLINE
          ──────────────────────────────────────────────────────────── */}
      <div className="relative mt-2">
        {/* Custom SVG Wavy Hill Divider with Stitched Line */}
        <div className="w-full overflow-hidden leading-none relative">
          <svg
            viewBox="0 0 500 70"
            preserveAspectRatio="none"
            className="w-full h-16 sm:h-20"
          >
            <defs>
              <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={config.colors.hillFill} />
                <stop offset="100%" stopColor={config.colors.gradientDeep} />
              </linearGradient>
            </defs>

            {/* Hill shape */}
            <path
              d="M0,35 C150,5 350,65 500,28 L500,70 L0,70 Z"
              fill="url(#hillGrad)"
            />

            {/* Stitched dashed curve following wave contour */}
            <path
              d="M0,33 C150,3 350,63 500,26"
              fill="none"
              stroke={config.colors.stitchedDash}
              strokeWidth="1.8"
              strokeDasharray="5 5"
            />
          </svg>

          {/* Decorative Sparkles & Stars floating on hill slopes */}
          <span className="absolute left-6 top-3 text-amber-200/80 text-sm font-black animate-pulse">✦</span>
          <span className="absolute left-14 top-7 text-white/50 text-xs font-bold">✧</span>
          <span className="absolute right-8 top-2 text-amber-200/80 text-sm font-black animate-pulse">✦</span>
          <span className="absolute right-16 top-6 text-white/50 text-xs font-bold">✧</span>
        </div>

        {/* Campaign Headline Centered Over Hill with 3D Accents */}
        <div className="relative -mt-10 sm:-mt-12 flex flex-col items-center justify-center text-center z-10 px-4">
          {/* Playful graphic accents perched on lettering (Golden Mittens / Stars) */}
          <div className="flex items-center gap-12 -mb-2">
            {/* Left Mitten SVG */}
            <svg className="w-7 h-7 text-amber-400 drop-shadow-sm -rotate-12" viewBox="0 0 32 32" fill="currentColor">
              <path d="M12 2C8 2 6 5 6 9v7c0 4 3 7 7 7h6c4 0 7-3 7-7V9c0-4-2-7-6-7h-8zm-2 9c-2 0-4 2-4 4s2 4 4 4h1v-8h-1z" />
              <rect x="5" y="22" width="22" height="4" rx="2" fill="#FEF08A" />
            </svg>

            {/* Right Mitten SVG */}
            <svg className="w-7 h-7 text-amber-400 drop-shadow-sm rotate-12" viewBox="0 0 32 32" fill="currentColor">
              <path d="M20 2c4 0 6 3 6 7v7c0 4-3 7-7 7h-6c-4 0-7-3-7-7V9c0-4 2-7 6-7h8zm2 9c2 0 4 2 4 4s-2 4-4 4h-1v-8h1z" />
              <rect x="5" y="22" width="22" height="4" rx="2" fill="#FEF08A" />
            </svg>
          </div>

          {/* Bold Expressive Script / Display Headline */}
          <h1
            className="text-[26px] sm:text-[30px] font-black tracking-normal text-[#FFF6E5] capitalize"
            style={{
              fontFamily: "'Fredoka', 'Quicksand', 'Comfortaa', -apple-system, sans-serif",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.35)",
              letterSpacing: "-0.01em",
            }}
          >
            {config.headline}
          </h1>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          LAYER 3: SIGNATURE ASYMMETRIC 5-CARD BENTO DEAL GRID
          ──────────────────────────────────────────────────────────── */}
      <div className="px-3.5 pt-3 pb-2 max-w-[480px] mx-auto">
        <div className="grid grid-cols-3 gap-2.5">
          {/* ── Left Column (col-span-1) — Tall Spotlight Deals Carousel Card ── */}
          <div
            className="col-span-1 rounded-2xl p-2.5 flex flex-col justify-between relative overflow-hidden backdrop-blur-md shadow-[0_8px_20px_rgba(0,0,0,0.18)] border border-white/20 group cursor-pointer active:scale-98 transition"
            style={{
              background: `linear-gradient(180deg, ${config.colors.cardBgFrom} 0%, ${config.colors.cardBgTo} 100%)`,
              minHeight: "246px",
            }}
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => onSelectCategory(currentDeal.category)}
          >
            {/* Top: Card Title */}
            <div className="text-center">
              <span className="text-[12px] font-black text-white tracking-tight drop-shadow-xs">
                {currentDeal.badge}
              </span>

              {/* Stacked Price Badge (Exact Reference Style: Navy Strikethrough + Yellow Pill) */}
              <div className="mt-1.5 flex flex-col items-center">
                {/* Top navy pill: MRP Strikethrough */}
                <div className="bg-[#0B2545] text-white/80 line-through text-[10px] font-bold px-2 py-0.5 rounded-t-md text-center border-t border-x border-white/25 w-[78px] shadow-2xs">
                  ₹{currentDeal.mrp.toLocaleString("en-IN")}
                </div>
                {/* Touching bottom bright yellow pill: Offer Price */}
                <div className="bg-[#FACC15] text-[#0A1A2F] text-[13px] font-black px-2 py-0.5 rounded-b-md text-center w-[78px] shadow-xs -mt-[1px] tracking-tight">
                  ₹{currentDeal.price.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Product Title */}
              <p className="text-[10px] font-bold text-white text-center leading-tight line-clamp-1 mt-1.5 drop-shadow-xs">
                {currentDeal.title}
              </p>
            </div>

            {/* Spotlight Product Packshot Cutout Centered */}
            <div className="relative my-auto flex items-center justify-center h-28 overflow-visible">
              <img
                src={currentDeal.image}
                alt={currentDeal.title}
                fetchPriority="high"
                className="max-h-28 max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Carousel Dot Indicators */}
            <div className="flex items-center justify-center gap-1 mt-1">
              {config.spotlightDeals.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDealIdx(i);
                  }}
                  className={`h-1 rounded-full transition-all ${
                    dealIdx === i ? "w-3 bg-white" : "w-1 bg-white/40"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── Right Column (col-span-2) — 2x2 Sub-Grid Category Offer Cards ── */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            {config.bentoCards.map((card) => (
              <div
                key={card.id}
                onClick={() => onSelectCategory(card.categorySlug)}
                className="rounded-2xl p-2 flex flex-col justify-between relative overflow-hidden backdrop-blur-md shadow-[0_6px_16px_rgba(0,0,0,0.14)] border border-white/20 group cursor-pointer active:scale-98 transition"
                style={{
                  background: `linear-gradient(180deg, ${config.colors.cardBgFrom} 0%, ${config.colors.cardBgTo} 100%)`,
                  height: "119px",
                }}
              >
                {/* Top Split Two-Tone Discount Pill */}
                <div className="flex items-center self-start shadow-xs">
                  {/* Left half: Navy "Up to" */}
                  <span className="bg-[#0B2545] text-white/90 text-[8px] font-bold px-1.5 py-0.5 rounded-l-full border-y border-l border-white/25 leading-none">
                    {card.discountPrefix}
                  </span>
                  {/* Right half: Bright Yellow "XX% OFF" */}
                  <span className="bg-[#FACC15] text-[#0A1A2F] text-[8.5px] font-black px-1.5 py-0.5 rounded-r-full leading-none">
                    {card.discountText}
                  </span>
                </div>

                {/* 2-Line Category Title */}
                <div className="mt-0.5 z-10">
                  <span className="text-[10.5px] font-extrabold text-white leading-[1.1] block drop-shadow-xs">
                    {card.titleLine1}
                  </span>
                  <span className="text-[10.5px] font-extrabold text-white leading-[1.1] block drop-shadow-xs">
                    {card.titleLine2}
                  </span>
                </div>

                {/* Bottom Overlapping Brand Packshots Cluster (Clean transparent cutouts) */}
                <div className="relative h-14 w-full flex items-end justify-end overflow-visible pointer-events-none mt-auto">
                  {card.images.map((imgSrc, imgIdx) => (
                    <img
                      key={imgIdx}
                      src={imgSrc}
                      alt={card.category}
                      loading="eager"
                      className="absolute bottom-0 object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.30)] transition-transform duration-200 group-hover:scale-105"
                      style={{
                        height: imgIdx === 0 ? "54px" : imgIdx === 1 ? "42px" : "34px",
                        right: imgIdx === 0 ? "1px" : imgIdx === 1 ? "24px" : "48px",
                        zIndex: 10 - imgIdx,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          LAYER 4: FULL-WIDTH POP-OUT BOTTOM PROMO STRIP
          ──────────────────────────────────────────────────────────── */}
      <div className="px-3.5 pt-1 pb-2 max-w-[480px] mx-auto">
        <div
          onClick={() => onSelectCategory(config.promoStrip.categorySlug)}
          className="relative h-14 rounded-2xl flex items-center justify-between px-3 shadow-[0_6px_20px_rgba(0,0,0,0.20)] border border-white/90 cursor-pointer active:scale-[0.99] transition group overflow-visible"
          style={{
            background: `linear-gradient(90deg, ${config.colors.promoBgFrom} 0%, #FFFFFF 50%, ${config.colors.promoBgTo} 100%)`,
          }}
        >
          {/* Left: Dark-blue circular accent backing with 3D product cutout popping over top edge */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Circular disc */}
            <div className="w-11 h-11 rounded-full bg-[#073A82] border-2 border-white shadow-xs flex items-center justify-center overflow-visible">
              {/* Product cutout popping above top edge (-mt-3) */}
              <img
                src={config.promoStrip.image}
                alt="Promo product cutout"
                className="h-12 w-auto object-contain -mt-3.5 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.30)] group-hover:scale-110 transition-transform duration-200"
              />
            </div>
          </div>

          {/* Center Copy */}
          <div className="flex flex-col justify-center pl-3 flex-1 min-w-0">
            <div className="flex items-baseline gap-1 text-[12.5px] font-black tracking-tight leading-snug">
              <span className="text-[#094596]">{config.promoStrip.highlightText}</span>
              <span className="text-slate-800">{config.promoStrip.normalText}</span>
            </div>
            <span className="text-[9.5px] font-semibold text-slate-500 leading-none mt-0.5 truncate">
              {config.promoStrip.subText}
            </span>
          </div>

          {/* Right: Chevron Arrow in circle */}
          <div className="w-6 h-6 rounded-full bg-white/90 shadow-2xs flex items-center justify-center text-[#073A82] group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.8} />
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          LAYER 5: SCALLOPED / TASSEL DECORATIVE BOTTOM EDGE TRANSITION
          ──────────────────────────────────────────────────────────── */}
      <div className="w-full overflow-hidden leading-none relative mt-1">
        <svg
          viewBox="0 0 480 20"
          preserveAspectRatio="none"
          className="w-full h-5"
          fill="#FFFFFF"
        >
          {/* Repeated fringed tassels / scallops matching Blinkit reference */}
          <path
            d="
              M0,0 
              Q10,12 20,0 
              Q30,12 40,0 
              Q50,12 60,0 
              Q70,12 80,0 
              Q90,12 100,0 
              Q110,12 120,0 
              Q130,12 140,0 
              Q150,12 160,0 
              Q170,12 180,0 
              Q190,12 200,0 
              Q210,12 220,0 
              Q230,12 240,0 
              Q250,12 260,0 
              Q270,12 280,0 
              Q290,12 300,0 
              Q310,12 320,0 
              Q330,12 340,0 
              Q350,12 360,0 
              Q370,12 380,0 
              Q390,12 400,0 
              Q410,12 420,0 
              Q430,12 440,0 
              Q450,12 460,0 
              Q470,12 480,0 
              L480,20 L0,20 Z
            "
          />
        </svg>
      </div>
    </div>
  );
};

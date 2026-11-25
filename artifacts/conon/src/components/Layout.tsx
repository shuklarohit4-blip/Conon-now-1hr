import React, { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu, Search, User, ShoppingBag,
  MapPin, ChevronDown, Truck, X,
  Home, Package, BookOpen, Palette, Gift,
  Phone, HelpCircle, FileText, Settings, LogOut, LogIn,
  ChevronRight, Shield, ShieldCheck, Star, Clock,
  Wrench, Boxes, MessageCircle, Wallet, Grid3x3, Zap, RotateCcw,
  ClipboardList, HardHat, PencilRuler, Tractor, Handshake, Compass, Radio
} from "lucide-react";
import { toast } from "sonner";
import { MandiTicker } from "./MandiTicker";
import { useUI } from "@/context/UIContext";
import { useGetCart } from "@workspace/api-client-react";
import { useAuthContext } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { CartSheet } from "./CartSheet";
import { Footer } from "./Footer";
import { HomeDepartmentNav } from "./HomeDepartmentNav";
import { useDeliveryLocation } from "@/context/LocationContext";
import { formatINR } from "@/lib/wallet";
import { useWallet } from "@/context/WalletContext";
import { IS_LOCAL_ADMIN } from "@/config/adminGuard";

const ROLE_LABEL: Record<string, string> = {
  customer: "Builder / Owner",
  vendor: "Supplier / Vendor",
  admin: "Admin",
};

const BRAND_DARK = "#1848a0";
const AMBER      = "#f59e0b";
const LOGO_BLUE  = "#1848a0";
const LIGHT_BLUE = "#bae6fd";


export function Layout({
  children,
  hideHeader = false,
}: {
  children: React.ReactNode;
  hideHeader?: boolean;
}) {
  const [location, setLocationPath] = useLocation();
  const { isCartOpen, setCartOpen, isMenuOpen, setMenuOpen, setLoginModalOpen, screenRatio, setScreenRatio } = useUI();
  const { data: cart } = useGetCart();
  const { balance: walletBalance } = useWallet();

  const { role, name, logout } = useUser();
  const { user: authUser, isAuthenticated, isAdmin, openAuthModal, logout: authLogout } = useAuthContext();
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

  const loggedIn = !!role || isAuthenticated || !!authUser;
  const displayName =
    authUser?.name ||
    name ||
    (role ? ROLE_LABEL[role] : "");
  const roleLabel = authUser?.displayRole || (role ? ROLE_LABEL[role] : "Secure account");

  const handleLogout = async () => {
    setMenuOpen(false);
    logout();
    await authLogout();
  };

  const { location: deliveryLoc, openLocationSheet } = useDeliveryLocation();
  const pincode = deliveryLoc.pincode;
  const pinArea = deliveryLoc.fullLabel;

  const navItems: { href: string; icon: typeof Home; label: string; center?: boolean }[] = [
    { href: "/build",    icon: HardHat,   label: "Builder"          },
    { href: "/rentals",  icon: Tractor,   label: "Machine on Rent"  },
    { href: "/home",     icon: Home,      label: "Home", center: true },
    { href: "/categories", icon: Grid3x3, label: "Categories"       },
    { href: "/services", icon: Handshake, label: "Services"         },
    { href: "/kits",     icon: Boxes,     label: "Builder Kits"     },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start w-full transition-all">
      {/* ── Screen Ratio Controller Bar (16:9 Widescreen Desktop / 16:9 Frame / 9:16 Mobile) ── */}
      <div className="w-full bg-slate-900 text-white text-[11px] py-1 px-4 flex items-center justify-between border-b border-slate-800 z-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#f2b705] tracking-wider uppercase text-[10px]">
            ⚡ CONON-NOW
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-300 hidden sm:inline text-[10.5px]">
            {screenRatio === "16:9"
              ? "16:9 Widescreen Desktop Mode Active"
              : screenRatio === "frame16:9"
              ? "16:9 Aspect Frame Active"
              : "9:16 Mobile Simulator Active"}
          </span>
        </div>

        {/* Ratio Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-full border border-slate-700">
          <button
            type="button"
            onClick={() => setScreenRatio("16:9")}
            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold transition active:scale-95 flex items-center gap-1 ${
              screenRatio === "16:9"
                ? "bg-[#1848a0] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="16:9 Widescreen Desktop Mode (Full desktop layout)"
          >
            <span>🖥️</span>
            <span>16:9 Widescreen</span>
          </button>

          <button
            type="button"
            onClick={() => setScreenRatio("frame16:9")}
            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold transition active:scale-95 flex items-center gap-1 ${
              screenRatio === "frame16:9"
                ? "bg-[#1848a0] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="16:9 Framed Aspect Box (1280x720 aspect-video)"
          >
            <span>📺</span>
            <span>16:9 Frame</span>
          </button>

          <button
            type="button"
            onClick={() => setScreenRatio("mobile")}
            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold transition active:scale-95 flex items-center gap-1 ${
              screenRatio === "mobile"
                ? "bg-[#1848a0] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="9:16 Mobile Phone Simulator"
          >
            <span>📱</span>
            <span>9:16 Mobile</span>
          </button>
        </div>
      </div>

      <div
        className={
          screenRatio === "16:9"
            ? "w-full max-w-7xl min-w-0 bg-white min-h-[calc(100vh-32px)] relative shadow-2xl flex flex-col overflow-x-hidden border-x border-slate-200 transition-all duration-300"
            : screenRatio === "frame16:9"
            ? "w-full max-w-[1280px] aspect-[16/9] min-w-0 bg-white my-4 relative shadow-2xl rounded-2xl flex flex-col overflow-x-hidden overflow-y-auto border-2 border-slate-300 transition-all duration-300"
            : "w-full sm:max-w-[480px] min-w-0 bg-white min-h-[calc(100vh-32px)] relative sm:shadow-2xl flex flex-col overflow-x-hidden sm:border-x sm:border-slate-200 transition-all duration-300"
        }
      >
        {/* Pinned top region — live ticker + green delivery header.
            Sticky at top-0 with iOS/Android safe-area padding so the header
            never drifts down and nothing bleeds above it on notches.
            z-30 keeps it pinned above the scrolling feed but BELOW every
            modal/sheet (cart, drawer, location gate, AR — all z-40+) so those
            overlays correctly cover the header instead of it punching through. */}
        {!hideHeader && (
          <div
            className="sticky top-0 z-30 bg-white"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            {/* Top Yellow Notice Bar - exact reference match */}
            <div className="bg-[#0f1cd1] text-slate-900 text-xs font-bold py-1.5 px-4 text-center tracking-tight shadow-xs">
              Open 7 am to 8 pm all days
            </div>

            {/* Live ticker */}
            <MandiTicker />

            {/* Main Navigation Header - Brand Logo on top-left corner */}
            <header className="px-3.5 sm:px-6 lg:px-8 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              {/* Left: Brand Logo (Top Left Corner) + Hamburger Menu + 60 Mins Badge + Deliver To */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Brand Logo - Top Left Corner */}
                <Link
                  href="/home"
                  onClick={handleLogoClick}
                  className="flex items-center gap-1.5 shrink-0 group active:scale-95 transition -ml-0.5 cursor-pointer"
                  aria-label="CONON-NOW Home"
                >
                  <img
                    src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
                    alt="CONON-NOW"
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

                <div className="h-6 w-px bg-slate-200 hidden xs:block shrink-0" />

                <button
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open navigation menu"
                  className="p-1 text-slate-800 hover:text-slate-600 active:scale-90 transition rounded-md"
                >
                  <Menu className="w-5 sm:w-6 h-5 sm:h-6" strokeWidth={2.4} />
                </button>

                {/* ── Delivery Box (Exact Match to Reference Screenshot) ── */}
                <button
                  onClick={openLocationSheet}
                  className="border border-slate-300 hover:border-slate-400 active:scale-95 transition-all rounded-md px-2.5 py-1 text-left flex flex-col justify-center bg-white cursor-pointer group shadow-2xs leading-tight ml-0.5 shrink-0"
                  aria-label="Check delivery time and pincode"
                  title="Click to check delivery time & pincode"
                >
                  <div className="flex items-center gap-0.5 text-[12px] sm:text-[13px] font-bold text-slate-900 leading-none">
                    <span>60 mins</span>
                    <ChevronDown className="w-3 h-3 text-slate-600 group-hover:translate-y-0.5 transition-transform" strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-normal leading-none mt-1 tracking-tight">
                    {pincode || "226010"}
                  </span>
                </button>
              </div>

              {/* Center: Search Bar (Exact Match to Reference Screenshot) */}
              <div className="hidden md:flex flex-1 max-w-xl mx-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const val = (e.currentTarget.elements.namedItem("search") as HTMLInputElement)?.value;
                    if (val?.trim()) {
                      setLocationPath(`/categories?q=${encodeURIComponent(val.trim())}`);
                    }
                  }}
                  className="w-full relative flex items-center bg-[#F4F6F8] hover:bg-[#EDF1F5] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 rounded-lg h-9 sm:h-10 px-3 border border-slate-200 transition-all"
                >
                  <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" strokeWidth={2.2} />
                  <input
                    name="search"
                    type="text"
                    placeholder="Search for Fevicol, Cement, Tiles..."
                    className="w-full bg-transparent text-xs sm:text-[13px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </form>
              </div>

              {/* Right: Guarantee Pill + Wallet + User Profile (Login with OTP) + Cart Bag */}
              <div className="flex items-center gap-2">
                {/* Green Brand Guarantee Pill */}
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#247c23] text-white text-[11px] font-bold shadow-2xs select-none">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" strokeWidth={2.4} />
                  <span>CONON-NOW</span>
                </div>

                <Link
                  href="/rewards?tab=wallet"
                  aria-label="Gold Wallet"
                  title="Gold Wallet balance"
                  className="hidden sm:flex items-center gap-1 h-7 px-2 rounded-full bg-amber-50 border border-amber-200/80 active:scale-95 transition"
                >
                  <Wallet className="w-3.5 h-3.5 text-amber-600" strokeWidth={2.5} />
                  <span className="text-[11px] font-black text-amber-900">
                    ₹{formatINR(walletBalance)}
                  </span>
                </Link>

                {/* Glowing Indigo Admin Command OS Pill (Visible only when Local Admin) */}
                {IS_LOCAL_ADMIN && isAdmin && (
                  <Link
                    href="/admin"
                    aria-label="Admin Command OS"
                    title="Launch CONON COMMAND OS Operations Control"
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] border border-indigo-500/60 text-indigo-300 font-black text-[11px] shadow-md shadow-indigo-950/50 active:scale-95 transition animate-pulse"
                  >
                    <Radio className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Admin Command OS</span>
                    <span className="sm:hidden">Admin OS</span>
                  </Link>
                )}

                {/* ── Login / Profile Button with Text (Exact Match to Reference Screenshot) ── */}
                {!loggedIn ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal("login")}
                    aria-label="Login / Sign Up"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.2} />
                    <span>Login / Sign Up</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    aria-label="User profile & menu"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-50 active:scale-90 transition rounded-md cursor-pointer"
                  >
                    <User className="w-[19px] sm:w-[21px] h-[19px] sm:h-[21px] text-slate-700" strokeWidth={2.2} />
                    <span className="text-xs sm:text-[13px] font-bold text-slate-800">
                      {displayName.split(" ")[0] || "Account"}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </button>
                )}
                <button
                  onClick={() => setCartOpen(true)}
                  aria-label="Shopping bag"
                  className="p-1 text-slate-700 hover:text-slate-900 active:scale-90 transition relative rounded-md"
                >
                  <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={2} />
                  {cart && cart.totalItems > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[9px] font-black rounded-full flex items-center justify-center shadow-xs"
                      style={{ background: "#1848a0", color: "#fff" }}
                    >
                      {cart.totalItems}
                    </span>
                  )}
                </button>
              </div>
            </header>

            {/* ── Subnavigation Department Bar (Exact Match to Reference Screenshot) ── */}
            <div className="hidden sm:block">
              <HomeDepartmentNav
                onSelectCategory={(category) => {
                  setLocationPath(category.route || `/categories?dept=${category.slug}`);
                }}
              />
            </div>
          </div>
        )}

        {/* Side Menu Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex" onClick={() => setMenuOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="relative w-[300px] max-w-[80vw] bg-white h-full flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
              style={{ animation: "slideInLeft 0.25s ease-out" }}
            >
              <div
                className="px-5 pt-8 pb-5"
                style={{ background: `linear-gradient(135deg, ${BRAND_DARK} 0%, #2563eb 100%)` }}
              >
                <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4">
                  <X className="w-5 h-5 text-white/70" />
                </button>
                {loggedIn ? (
                  <Link href="/profile" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-3 mb-3 cursor-pointer">
                      {authUser?.profileImageUrl ? (
                        <img
                          src={authUser.profileImageUrl}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-black text-sm">{displayName || "My Account"}</p>
                        <p className="text-blue-200 text-[10px] font-bold">{roleLabel}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setLoginModalOpen(true);
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3 mb-3 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <LogIn className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-black text-sm">Login / Sign up</p>
                        <p className="text-blue-200 text-[10px] font-bold">Login for the best experience</p>
                      </div>
                    </div>
                  </button>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-blue-200">
                  <MapPin className="w-3 h-3" />
                  <span className="font-bold">{pincode} — {pinArea}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-2">
                {IS_LOCAL_ADMIN && isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors bg-indigo-50/80 hover:bg-indigo-100 border-b border-indigo-100/60 mb-1">
                      <Radio className="w-5 h-5 text-indigo-600 animate-pulse" />
                      <span className="text-sm font-black text-indigo-900">
                        CONON COMMAND OS
                      </span>
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase">
                        Admin
                      </span>
                    </div>
                  </Link>
                )}
                {[
                  { icon: Home,          label: "Home",            href: "/home"      },
                  { icon: HardHat,       label: "CONON-NOW Build",     href: "/build"     },
                  { icon: PencilRuler,   label: "Smart-Draft AI",  href: "/smart-draft" },
                  { icon: Compass,       label: "Arch-Genius Engine", href: "/arch-genius" },
                  { icon: Boxes,         label: "Smart-Build 3D",  href: "/smart-build" },
                  { icon: Wrench,        label: "Services",        href: "/services"  },
                  { icon: Boxes,         label: "Inventory",       href: "/orders"    },
                  { icon: MessageCircle, label: "Contact Us",      href: "/contact"   },
                  { icon: Palette,       label: "Designers Hub",   href: "/designers" },
                  { icon: Gift,          label: "Bulk & Rewards",  href: "/rewards"   },
                  { icon: BookOpen,      label: "Digital Parcha",  href: "/parcha"    },
                  { icon: ClipboardList, label: "Khata Manager",   href: "/khata"     },
                  { icon: Package,       label: "Track Delivery",  href: "/track"     },
                  { icon: User,          label: "My Profile",      href: "/profile"   },
                ].map(item => (
                  <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
                    <div className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors ${location === item.href ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                      <item.icon className="w-5 h-5" style={{ color: location === item.href ? BRAND_DARK : "#64748b" }} />
                      <span className="text-sm font-bold" style={{ color: location === item.href ? BRAND_DARK : "#334155" }}>
                        {item.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                    </div>
                  </Link>
                ))}

                <div className="h-px bg-slate-100 mx-5 my-2" />

                <p className="px-5 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</p>
                {[
                  { icon: Clock, label: "60-Min JIT Delivery", sub: "Track live orders", href: "/live-track" },
                  { icon: Star, label: "Rate & Review", sub: "Your feedback matters",
                    action: () => toast.success("Thanks! Rate & Review is opening soon.") },
                  { icon: Shield, label: "Quality Promise", sub: "ISI certified materials",
                    action: () => toast.info("Every CONON-NOW material is ISI-certified ✓") },
                ].map(item => {
                  const inner = (
                    <div className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50">
                      <item.icon className="w-4.5 h-4.5 text-slate-400" />
                      <div>
                        <span className="text-[13px] font-bold text-slate-700 block">{item.label}</span>
                        <span className="text-[10px] text-slate-400">{item.sub}</span>
                      </div>
                    </div>
                  );
                  return item.href ? (
                    <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{inner}</Link>
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      className="w-full text-left"
                      onClick={() => { item.action?.(); setMenuOpen(false); }}
                    >
                      {inner}
                    </button>
                  );
                })}

                <div className="h-px bg-slate-100 mx-5 my-2" />

                <p className="px-5 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Support & Legal</p>
                <div className="space-y-0.5">
                  <a href="tel:05224721924" className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-slate-50">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-[13px] font-semibold text-slate-600">Call Us: 0522-4721924</span>
                  </a>
                  <Link href="/terms" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-slate-50">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-[13px] font-semibold text-slate-600">Terms & Conditions</span>
                    </div>
                  </Link>
                  <Link href="/privacy-policy" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-slate-50">
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span className="text-[13px] font-semibold text-slate-600">Privacy Policy</span>
                    </div>
                  </Link>
                  <Link href="/refund-policy" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-slate-50">
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                      <span className="text-[13px] font-semibold text-slate-600">Cancellation & Refund</span>
                    </div>
                  </Link>
                  <Link href="/shipping-policy" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-slate-50">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <span className="text-[13px] font-semibold text-slate-600">Shipping & Delivery</span>
                    </div>
                  </Link>
                  <Link href="/delete-account" onClick={() => setMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-slate-50 text-red-500">
                      <Settings className="w-4 h-4 text-red-400" />
                      <span className="text-[13px] font-semibold text-red-500">Delete Account</span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="border-t border-slate-100 px-5 py-4">
                {loggedIn ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLogout();
                    }}
                    className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-[13px] font-bold">Logout</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openAuthModal("login");
                    }}
                    className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-blue-600 transition-colors w-full text-left"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="text-[13px] font-bold">Login / Sign up</span>
                  </button>
                )}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                  <img
                    src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
                    alt="CONON-NOW"
                    className="w-5 h-5 object-contain"
                  />
                  <p className="text-[10px] text-slate-400 font-bold">CONON-NOW · v2.0</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-white flex flex-col justify-between">
          <div className="flex-1 pb-16">
            {children}
          </div>
          <Footer />
        </main>

        {/* Floating "View cart" pill — sits above the bottom dock, hidden when
            the cart is empty or already open (-style). */}
        {cart && cart.totalItems > 0 && !isCartOpen && (
          <div className="absolute left-0 right-0 z-30 px-4 pointer-events-none flex justify-center" style={{ bottom: "92px" }}>
            <div className="w-full max-w-md">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="pointer-events-auto w-full flex items-center justify-between rounded-2xl px-4 py-3 text-white shadow-xl active:scale-[0.98] transition"
                style={{ background: "#1e7e34", boxShadow: "0 10px 24px -6px rgba(30,126,52,0.45)" }}
              >
                <span className="flex items-center gap-2.5">
                  <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                    <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={2.6} />
                  </span>
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[15px] font-black">View cart</span>
                    <span className="text-[11px] font-semibold text-white/85">
                      {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"}
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[15px] font-black">
                  ₹{cart.grandTotal.toLocaleString("en-IN")}
                  <ChevronRight className="w-5 h-5" strokeWidth={2.8} />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom nav — 5-slot enterprise dock with elevated center Home */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3 pointer-events-none flex justify-center">
          <nav
            className="pointer-events-auto w-full max-w-md rounded-[26px] bg-white/90 backdrop-blur-xl border border-white/60 px-1 shadow-lg"
            style={{ boxShadow: "0 10px 30px -8px rgba(24,72,160,0.20), 0 0 0 1px rgba(96,165,250,0.18)" }}
          >
            <div className="flex items-stretch h-[64px]">
              {navItems.map((item, idx) => {
                const isActive = location === item.href;
                const Icon = item.icon;

                if (item.center) {
                  return (
                    <Link key={`center-${idx}`} href={item.href} className="flex-1 min-w-0">
                      <div className="h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer relative">
                        <div
                          className="w-12 h-12 -mt-7 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${AMBER} 0%, #f97316 100%)`,
                            boxShadow: `0 8px 20px -4px ${AMBER}bb, 0 0 0 4px #ffffff`,
                          }}
                        >
                          <Icon className="w-[22px] h-[22px] text-white" strokeWidth={2.6} />
                        </div>
                        <span className="text-[9px] font-black tracking-tight -mt-0.5" style={{ color: AMBER }}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                }

                return (
                  <Link key={`${item.href}-${idx}`} href={item.href} className="flex-1 min-w-0">
                    <div className="h-full flex flex-col items-center justify-center gap-1 cursor-pointer px-0.5">
                      <Icon
                        className="w-[20px] h-[20px] shrink-0 transition-all"
                        style={{ color: isActive ? BRAND_DARK : "#94a3b8", strokeWidth: isActive ? 2.5 : 2 }}
                      />
                      <span
                        className="text-[8px] font-black tracking-tight text-center leading-[1.1] line-clamp-2 break-words w-full transition-colors"
                        style={{ color: isActive ? BRAND_DARK : "#94a3b8" }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        <CartSheet />
      </div>
    </div>
  );
}

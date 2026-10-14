import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu, Search, User, ShoppingBag,
  MapPin, ChevronDown, Truck, X,
  Home, Package, BookOpen, Palette, Gift,
  Phone, HelpCircle, FileText, Settings, LogOut, LogIn,
  ChevronRight, Shield, Star, Clock,
  Wrench, Boxes, MessageCircle, Wallet, Grid3x3, Zap, RotateCcw,
  ClipboardList, HardHat, PencilRuler, Tractor, Handshake, Compass,
} from "lucide-react";
import { toast } from "sonner";
import { MandiTicker } from "./MandiTicker";
import { useUI } from "@/context/UIContext";
import { useGetCart } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useUser } from "@/context/UserContext";
import { CartSheet } from "./CartSheet";
import { useDeliveryLocation } from "@/context/LocationContext";
import { formatINR } from "@/lib/wallet";
import { useWallet } from "@/context/WalletContext";

const ROLE_LABEL: Record<string, string> = {
  customer: "Builder / Owner",
  vendor: "Supplier / Vendor",
  admin: "Admin",
};

const BRAND_DARK = "#1b4366";
const AMBER      = "#f59e0b";
const NEON       = "#a3e635";


export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocationPath] = useLocation();
  const { isCartOpen, setCartOpen } = useUI();
  const { data: cart } = useGetCart();
  const { balance: walletBalance } = useWallet();

  const [showMenu, setShowMenu] = useState(false);

  const { role, name, logout } = useUser();
  const { user: authUser, isAuthenticated, logout: authLogout } = useAuth();

  const loggedIn = !!role || isAuthenticated;
  const displayName =
    name ||
    (authUser
      ? [authUser.firstName, authUser.lastName].filter(Boolean).join(" ") ||
        authUser.email ||
        ""
      : "") ||
    (role ? ROLE_LABEL[role] : "");
  const roleLabel = role ? ROLE_LABEL[role] : "Secure account";

  const handleLogout = () => {
    setShowMenu(false);
    logout();
    if (isAuthenticated) {
      authLogout();
    } else {
      setLocationPath("/login");
    }
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
    <div className="min-h-screen bg-slate-100 flex justify-center w-full">
      <div
        className="w-full max-w-[480px] bg-white min-h-screen relative shadow-2xl flex flex-col"
        style={{ borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}
      >
        {/* Pinned top region — live ticker + green delivery header.
            Sticky at top-0 with iOS/Android safe-area padding so the header
            never drifts down and nothing bleeds above it on notches.
            z-30 keeps it pinned above the scrolling feed but BELOW every
            modal/sheet (cart, drawer, location gate, AR — all z-40+) so those
            overlays correctly cover the header instead of it punching through. */}
        <div
          className="sticky top-0 z-30 bg-white"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* Live ticker */}
          <MandiTicker />

          {/* Header — neon-green delivery header */}
          <header
            className="px-5 pt-3.5 pb-4"
            style={{
              background: `linear-gradient(165deg, #c7f24f 0%, ${NEON} 55%, #8fd61f 100%)`,
              boxShadow: "0 6px 18px -8px rgba(132,204,22,0.55)",
            }}
          >
          {/* Row 1: delivery time + address | wallet + profile */}
          <div className="flex justify-between items-start">
            {/* Left — delivery promise + address dropdown */}
            <button onClick={openLocationSheet} className="flex flex-col items-start text-left group">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: BRAND_DARK }}
                >
                  <Zap className="w-3 h-3 text-amber-300" strokeWidth={3} fill="currentColor" />
                </span>
                <h1
                  className="font-display font-black tracking-tight text-[17px] leading-none"
                  style={{ color: BRAND_DARK }}
                >
                  Conon in 60 minutes
                </h1>
              </div>
              <div className="flex items-center gap-1 mt-1.5 pl-0.5">
                <MapPin className="w-3.5 h-3.5" style={{ color: BRAND_DARK }} strokeWidth={2.5} />
                <span className="text-[12px] font-black" style={{ color: BRAND_DARK }}>
                  HOME
                </span>
                <span className="text-[12px] font-bold text-[#2f5d1f] truncate max-w-[150px]">
                  - {deliveryLoc.area || "Shakti Nagar"}
                </span>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: BRAND_DARK }} strokeWidth={2.5} />
              </div>
            </button>

            {/* Right — wallet + cart + profile/menu */}
            <div className="flex items-center gap-2">
              <Link
                href="/rewards?tab=wallet"
                aria-label="Gold Wallet balance"
                title="CONON Gold Wallet"
                className="flex items-center gap-1 h-8 px-2.5 rounded-full bg-white/55 backdrop-blur-sm active:scale-90 transition"
              >
                <Wallet className="w-4 h-4" style={{ color: BRAND_DARK }} strokeWidth={2.5} />
                <span className="text-[12px] font-black" style={{ color: BRAND_DARK }}>
                  ₹{formatINR(walletBalance)}
                </span>
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                aria-label="Cart"
                className="w-9 h-9 rounded-full bg-white/55 backdrop-blur-sm flex items-center justify-center relative active:scale-90 transition"
              >
                <ShoppingBag className="w-[18px] h-[18px]" style={{ color: BRAND_DARK }} strokeWidth={2.4} />
                {cart && cart.totalItems > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 text-[9px] font-black rounded-full flex items-center justify-center"
                    style={{ background: BRAND_DARK, color: "#fff" }}
                  >
                    {cart.totalItems}
                  </span>
                )}
              </button>
              {!loggedIn && (
                <Link
                  href="/login"
                  aria-label="Log in"
                  className="flex items-center gap-1 h-9 px-3 rounded-full text-white active:scale-90 transition"
                  style={{ background: BRAND_DARK }}
                >
                  <LogIn className="w-4 h-4" strokeWidth={2.6} />
                  <span className="text-[12px] font-black">Login</span>
                </Link>
              )}
              <button
                onClick={() => setShowMenu(true)}
                aria-label="Profile & menu"
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition relative"
                style={{ background: BRAND_DARK }}
              >
                <User className="w-[18px] h-[18px] text-white" strokeWidth={2.4} />
                {loggedIn && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </button>
            </div>
          </div>
          </header>
        </div>

        {/* Side Menu Drawer */}
        {showMenu && (
          <div className="fixed inset-0 z-50 flex" onClick={() => setShowMenu(false)}>
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
                <button onClick={() => setShowMenu(false)} className="absolute top-4 right-4">
                  <X className="w-5 h-5 text-white/70" />
                </button>
                {loggedIn ? (
                  <Link href="/profile" onClick={() => setShowMenu(false)}>
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
                  <Link href="/login" onClick={() => setShowMenu(false)}>
                    <div className="flex items-center gap-3 mb-3 cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <LogIn className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-black text-sm">Login / Sign up</p>
                        <p className="text-blue-200 text-[10px] font-bold">Login for the best experience</p>
                      </div>
                    </div>
                  </Link>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-blue-200">
                  <MapPin className="w-3 h-3" />
                  <span className="font-bold">{pincode} — {pinArea}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-2">
                {[
                  { icon: Home,          label: "Home",            href: "/home"      },
                  { icon: HardHat,       label: "Conon Build",     href: "/build"     },
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
                  <Link key={item.label} href={item.href} onClick={() => setShowMenu(false)}>
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
                    action: () => toast.info("Every CONON material is ISI-certified ✓") },
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
                    <Link key={item.label} href={item.href} onClick={() => setShowMenu(false)}>{inner}</Link>
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      className="w-full text-left"
                      onClick={() => { item.action?.(); setShowMenu(false); }}
                    >
                      {inner}
                    </button>
                  );
                })}

                <div className="h-px bg-slate-100 mx-5 my-2" />

                <p className="px-5 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Support</p>
                {[
                  { icon: Phone, label: "Call Us: 1800-CONON" },
                  { icon: HelpCircle, label: "Help & FAQ" },
                  { icon: FileText, label: "Terms & Conditions" },
                  { icon: Settings, label: "Settings" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50">
                    <item.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-[13px] font-semibold text-slate-600">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 px-5 py-4">
                {loggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-[13px] font-bold">Logout</span>
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setShowMenu(false)}>
                    <div className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-blue-600 transition-colors">
                      <LogIn className="w-4 h-4" />
                      <span className="text-[13px] font-bold">Login / Sign up</span>
                    </div>
                  </Link>
                )}
                <p className="text-[9px] text-slate-300 mt-2 font-bold">CONON Infrabuilt v2.0 · Made in India</p>
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
        <main className="flex-1 overflow-y-auto pb-24 bg-white">
          {children}
        </main>

        {/* Floating "View cart" pill — sits above the bottom dock, hidden when
            the cart is empty or already open (Blinkit-style). */}
        {cart && cart.totalItems > 0 && !isCartOpen && (
          <div className="absolute left-0 right-0 z-30 px-4 pointer-events-none" style={{ bottom: "92px" }}>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="pointer-events-auto w-full flex items-center justify-between rounded-2xl px-4 py-3 text-white shadow-xl active:scale-[0.98] transition"
              style={{ background: "#0c831f", boxShadow: "0 10px 24px -6px rgba(12,131,31,0.6)" }}
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
        )}

        {/* Bottom nav — 5-slot enterprise dock with elevated center Home */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3 pointer-events-none">
          <nav
            className="pointer-events-auto rounded-[26px] bg-white/85 backdrop-blur-xl border border-white/60 px-1"
            style={{ boxShadow: "0 10px 30px -8px rgba(91,146,177,0.45), 0 0 0 1px rgba(132,204,22,0.10)" }}
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

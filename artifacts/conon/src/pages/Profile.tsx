import React from "react";
import { Layout } from "@/components/Layout";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@workspace/replit-auth-web";
import { useLocation, Link } from "wouter";
import {
  User, Settings, Bell, Shield, ChevronRight,
  Camera, Cpu, Store, Sparkles, Clock,
  LogIn, Truck, LogOut, ShieldCheck, ToggleLeft, ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

const BRAND_DARK = "#1b4366";
const GREEN      = "#15803d";
const ADMIN_DARK = "#1e1b4b";

const ROLE_META = {
  customer: { label: "Builder / Owner",    color: BRAND_DARK, bg: "#eff6ff", dash: "/home"   },
  vendor:   { label: "Supplier / Vendor",  color: GREEN,      bg: "#f0fdf4", dash: "/vendor" },
  admin:    { label: "Admin — Control Room",color: ADMIN_DARK, bg: "#eef2ff", dash: "/admin"  },
};

export function Profile() {
  const { role, phone, logout } = useUser();
  const { user: authUser, isAuthenticated, login, logout: authLogout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    if (isAuthenticated) {
      authLogout();
    } else {
      setLocation("/login");
    }
  };

  const authName = authUser
    ? [authUser.firstName, authUser.lastName].filter(Boolean).join(" ") || authUser.email || "Account"
    : "";

  const menuItems = [
    { key: "account", icon: Settings, label: "Account Settings"  },
    { key: "notif",   icon: Bell,     label: "Notifications"     },
    { key: "privacy", icon: Shield,   label: "Privacy & Security"},
  ];

  const liveTools = [
    { icon: Cpu,    label: "AI Estimator",      desc: "Auto-calculate bricks, cement, sand, paint & tiles for any room.", color: "text-cyan-600",   bg: "bg-cyan-50",   border: "border-cyan-100",   href: "/estimator" },
    { icon: Camera, label: "AR Material Drop",  desc: "Point your camera at a wall, enter dimensions, get a real estimate.", color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100", href: "/home"      },
  ];

  const meta = role ? ROLE_META[role] : null;

  const [openKey, setOpenKey] = React.useState<string | null>(null);
  const readPref = (k: string, d: boolean) => { const v = localStorage.getItem(k); return v === null ? d : v === "true"; };
  const [prefs, setPrefs] = React.useState({
    orderUpdates: readPref("conon_pref_orderUpdates", true),
    promotions:   readPref("conon_pref_promotions", false),
    priceAlerts:  readPref("conon_pref_priceAlerts", true),
    appLock:      readPref("conon_pref_appLock", false),
    shareUsage:   readPref("conon_pref_shareUsage", true),
  });
  const togglePref = (k: keyof typeof prefs, label: string) =>
    setPrefs(p => {
      const n = { ...p, [k]: !p[k] };
      localStorage.setItem(`conon_pref_${k}`, String(n[k]));
      toast.success(`${label} ${n[k] ? "on" : "off"}`);
      return n;
    });
  const renderToggle = (k: keyof typeof prefs, label: string) => (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-[13px] font-semibold text-slate-600">{label}</span>
      <button onClick={() => togglePref(k, label)} aria-label={`Toggle ${label}`} className="active:scale-90 transition">
        {prefs[k] ? <ToggleRight className="w-8 h-8 text-green-600" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="p-6 space-y-6 pb-10">

        {/* ── Profile header ──────────────────────────────────────── */}
        <header className="flex items-center gap-4 pt-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shrink-0"
            style={{ background: meta?.color ?? "#94a3b8" }}
          >
            {role === "admin" ? "🛡️" : role === "vendor" ? "🏪" : "👷"}
          </div>
          <div>
            <h2 className="text-xl font-display font-black" style={{ color: BRAND_DARK }}>
              {role ? meta?.label : "Guest User"}
            </h2>
            <p className="text-slate-400 text-sm font-semibold">
              {phone ? `+91 ${phone}` : "Not logged in"}
            </p>
          </div>
        </header>

        {/* ── Secure account card ──────────────────────────────────── */}
        {isAuthenticated ? (
          <div className="rounded-[28px] p-4 border-2 border-slate-100 flex items-center gap-3 bg-white shadow-sm">
            {authUser?.profileImageUrl ? (
              <img src={authUser.profileImageUrl} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-slate-800 truncate">{authName}</p>
              {authUser?.email && <p className="text-[10px] font-semibold text-slate-400 truncate">{authUser.email}</p>}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" /> Out
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="w-full rounded-[28px] p-4 border-2 border-slate-900 bg-slate-900 text-white flex items-center gap-3 shadow-lg shadow-slate-900/10"
          >
            <LogIn className="w-7 h-7 shrink-0" />
            <div className="flex-1 text-left">
              <p className="font-black text-sm">Log in securely</p>
              <p className="text-[10px] font-semibold text-white/60">Sync your account across devices</p>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* ── Role portal card ─────────────────────────────────────── */}
        {role ? (
          <div className="rounded-[28px] p-4 border-2 flex items-center gap-3"
            style={{ background: meta?.bg, borderColor: `${meta?.color}22` }}
          >
            {role === "admin"  && <ShieldCheck className="w-8 h-8 shrink-0" style={{ color: meta?.color }} />}
            {role === "vendor" && <Store        className="w-8 h-8 shrink-0" style={{ color: meta?.color }} />}
            {role === "customer" && <Truck      className="w-8 h-8 shrink-0" style={{ color: meta?.color }} />}
            <div className="flex-1">
              <p className="font-black text-sm" style={{ color: meta?.color }}>Logged in as {meta?.label}</p>
              <p className="text-[10px] font-semibold text-slate-400">Tap to open your dashboard</p>
            </div>
            <Link href={meta?.dash ?? "/home"}>
              <ChevronRight className="w-5 h-5" style={{ color: meta?.color }} />
            </Link>
          </div>
        ) : (
          <Link href="/login">
            <div className="rounded-[28px] p-4 border-2 border-slate-100 flex items-center gap-3 bg-slate-50 cursor-pointer">
              <LogIn className="w-8 h-8 text-slate-400 shrink-0" />
              <div className="flex-1">
                <p className="font-black text-slate-700">Sign in to your account</p>
                <p className="text-[10px] font-semibold text-slate-400">Customer · Vendor · Admin</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          </Link>
        )}

        {/* ── Stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
            <p className="text-2xl font-display font-black" style={{ color: BRAND_DARK }}>12</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Total Orders</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
            <p className="text-2xl font-display font-black" style={{ color: "#15803d" }}>₹2.4L</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Saved</p>
          </div>
        </div>

        {/* ── Menu ────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
          {menuItems.map((item, idx) => {
            const open = openKey === item.key;
            return (
              <div key={item.key} className={idx !== 0 ? "border-t border-slate-50" : ""}>
                <button
                  onClick={() => setOpenKey(open ? null : item.key)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:scale-[0.98] transition"
                >
                  <div className="flex items-center gap-3 text-slate-700">
                    <item.icon className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${open ? "rotate-90" : ""}`} />
                </button>
                {open && item.key === "account" && (
                  <div className="bg-slate-50/60 px-4 py-3 space-y-2 text-[13px]">
                    <div className="flex justify-between"><span className="text-slate-400 font-semibold">Phone</span><span className="font-bold text-slate-700">{phone ? `+91 ${phone}` : "Not set"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400 font-semibold">Role</span><span className="font-bold text-slate-700">{role ? meta?.label : "Guest"}</span></div>
                    {authUser?.email && <div className="flex justify-between gap-4"><span className="text-slate-400 font-semibold shrink-0">Email</span><span className="font-bold text-slate-700 truncate">{authUser.email}</span></div>}
                  </div>
                )}
                {open && item.key === "notif" && (
                  <div className="bg-slate-50/60 divide-y divide-slate-100">
                    {renderToggle("orderUpdates", "Order updates")}
                    {renderToggle("promotions", "Promotions & offers")}
                    {renderToggle("priceAlerts", "Price drop alerts")}
                  </div>
                )}
                {open && item.key === "privacy" && (
                  <div className="bg-slate-50/60 divide-y divide-slate-100">
                    {renderToggle("appLock", "App lock (biometric)")}
                    {renderToggle("shareUsage", "Share anonymous usage data")}
                  </div>
                )}
              </div>
            );
          })}
          {role && (
            <button onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition border-t border-slate-50"
            >
              <div className="flex items-center gap-3 text-red-500">
                <LogOut className="w-4 h-4" />
                <span className="font-bold text-sm">Sign Out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-300" />
            </button>
          )}
        </div>

        {/* ── Smart Tools (Live) ───────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" style={{ color: BRAND_DARK }} />
            <h3 className="text-base font-display font-black" style={{ color: BRAND_DARK }}>Smart Tools</h3>
            <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Live</span>
          </div>
          <div className="space-y-3">
            {liveTools.map(f => (
              <Link key={f.label} href={f.href}>
                <div className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer hover:scale-[1.01] transition ${f.bg} ${f.border}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white border ${f.border}`}>
                    <f.icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className={`font-black text-sm ${f.color}`}>{f.label}</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 mt-1 ${f.color}`} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="pt-6 border-t border-slate-100 flex flex-col items-center text-center gap-3">
          <img src={`${import.meta.env.BASE_URL}images/conon-logo-real.png`} alt="CONON" className="w-16 h-16 object-contain" />
          <div>
            <p className="text-sm font-black" style={{ color: BRAND_DARK }}>CONON Infrabuilt Limited</p>
            <p className="text-xs text-slate-400 italic mt-0.5">"Delivering Trust, Building Dreams."</p>
            <p className="text-[10px] text-slate-300 mt-2">v0.1.0 · JIT Logistics Platform</p>
          </div>
        </div>

      </div>
    </Layout>
  );
}

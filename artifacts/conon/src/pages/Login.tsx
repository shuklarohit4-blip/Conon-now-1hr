import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardHat, Store, ShieldCheck, X, Eye, EyeOff,
  ScanLine, BadgeCheck, Loader2, FileText, ArrowRight, ChevronDown,
} from "lucide-react";
import { useLocation } from "wouter";
import { useUser, UserRole } from "@/context/UserContext";
import { toast } from "sonner";
import { adminLogin as adminLoginApi, JWT_STORAGE_KEY, verifyFirebaseIdToken } from "@/lib/authApi";
import { auth } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";

/* ── Extend Window for reCAPTCHA verifier ──────────────────────────────── */
declare global {
  interface Window { loginRecaptchaVerifier?: RecaptchaVerifier; }
}

type VendorState = "form" | "otp" | "kyc" | null;
type Screen = "home" | "customer-phone" | "customer-otp" | "vendor-form" | "vendor-otp" | "vendor-kyc" | "admin";

/* Dummy KYC details auto-filled by the 1-Scan simulation. */
const KYC_GST     = "07ABCDE1234F1Z5";
const KYC_AADHAAR = "XXXX XXXX 1234";

/* ── Construction product grid items ─────────────────────────────────── */
const PRODUCTS = [
  { emoji: "🧱", label: "Bricks",    bg: "#EEF2FF" },
  { emoji: "🪣", label: "Paint",     bg: "#FFF7ED" },
  { emoji: "🔩", label: "Fasteners", bg: "#F0FDF4" },
  { emoji: "🪵", label: "Wood",      bg: "#FEF9C3" },
  { emoji: "🔧", label: "Tools",     bg: "#FEF2F2" },
  { emoji: "💡", label: "Electric",  bg: "#FFFBEB" },
  { emoji: "🚿", label: "Plumbing",  bg: "#EFF6FF" },
  { emoji: "📐", label: "Hardware",  bg: "#F0FDF4" },
  { emoji: "🪟", label: "Windows",   bg: "#FDF4FF" },
  { emoji: "🚪", label: "Doors",     bg: "#FFF7ED" },
  { emoji: "🧰", label: "Kits",      bg: "#F0FDFA" },
  { emoji: "⛏️",  label: "Mining",   bg: "#FEF2F2" },
];

/* ── Auto-scrolling product grid row ──────────────────────────────────── */
function ProductRow({ items, reverse = false }: { items: typeof PRODUCTS; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const pos = useRef(0);
  const speed = reverse ? -0.4 : 0.4;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const step = () => {
      pos.current += speed;
      const maxScroll = el.scrollWidth / 2;
      if (pos.current >= maxScroll) pos.current = 0;
      if (pos.current < 0) pos.current = maxScroll;
      el.scrollLeft = pos.current;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [speed]);

  const doubled = [...items, ...items];

  return (
    <div ref={ref} className="flex gap-3 overflow-hidden select-none" style={{ scrollBehavior: "auto" }}>
      {doubled.map((p, i) => (
        <div
          key={i}
          className="flex-none w-[88px] h-[88px] rounded-2xl flex items-center justify-center text-4xl shadow-sm"
          style={{ background: p.bg }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

export function Login() {
  const [, setLocation] = useLocation();
  const { setRole, loginUser } = useUser();

  const [screen, setScreen] = useState<Screen>("home");

  /* ── Customer OTP state ───────────────────────────────────────────── */
  const [phone, setPhone]                           = useState("");
  const [customerOtp, setCustomerOtp]               = useState("");
  const [customerConfirm, setCustomerConfirm]       = useState<ConfirmationResult | null>(null);

  /* ── Vendor form + OTP state ──────────────────────────────────────── */
  const [shopName, setShopName]   = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [vendorPhone, setVendorPhone]               = useState("");
  const [vendorOtp, setVendorOtp]                   = useState("");
  const [vendorConfirm, setVendorConfirm]           = useState<ConfirmationResult | null>(null);

  /* ── KYC (1-Scan simulation) ──────────────────────────────────────── */
  const [kycScanning, setKycScanning] = useState(false);
  const [kycDone, setKycDone]         = useState(false);
  const kycTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Admin ────────────────────────────────────────────────────────── */
  const [email, setEmail]       = useState("");
  const [pass, setPass]         = useState("");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ── Firebase reCAPTCHA ───────────────────────────────────────────── */
  useEffect(() => {
    return () => { clearRecaptcha(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setupRecaptcha(containerId: string) {
    if (window.loginRecaptchaVerifier && !document.getElementById(containerId)) {
      clearRecaptcha();
    }
    if (!window.loginRecaptchaVerifier) {
      const el = document.getElementById(containerId);
      if (!el) throw new Error("reCAPTCHA container not found in DOM.");
      window.loginRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
    }
  }

  function clearRecaptcha() {
    try { window.loginRecaptchaVerifier?.clear(); } catch { /* already cleared */ }
    window.loginRecaptchaVerifier = undefined;
  }

  /* ── Customer: send OTP ───────────────────────────────────────────── */
  const handleCustomerSendOtp = async () => {
    const num = phone.replace(/\D/g, "");
    if (num.length < 10) { toast.error("Enter a valid 10-digit number"); return; }
    setLoading(true);
    try {
      setupRecaptcha("login-recaptcha-container");
      const fullPhone = num.startsWith("91") ? `+${num}` : `+91${num}`;
      const result = await signInWithPhoneNumber(auth, fullPhone, window.loginRecaptchaVerifier!);
      setCustomerConfirm(result);
      setScreen("customer-otp");
      toast.success("OTP sent to your number!");
    } catch (e) {
      clearRecaptcha();
      toast.error(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── Customer: verify OTP → backend ──────────────────────────────── */
  const handleCustomerVerifyOtp = async () => {
    if (customerOtp.length < 6) { toast.error("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      await customerConfirm!.confirm(customerOtp);
      const idToken = await auth.currentUser?.getIdToken();
      if (idToken) {
        const res = await verifyFirebaseIdToken(idToken, { role: undefined });
        if (res.ok && res.token) {
          localStorage.setItem(JWT_STORAGE_KEY, res.token);
          loginUser({
            role:        "customer",
            name:        res.user?.name  || "CONON User",
            phone:       res.user?.phone || phone,
            displayRole: "Builder / Owner",
          });
          toast.success("Logged in successfully!");
          setLocation("/home");
          return;
        }
        if (res.error) toast.error(res.error);
      }
      /* Fallback if backend not yet configured */
      loginUser({ role: "customer", name: "CONON User", phone, displayRole: "Builder / Owner" });
      setLocation("/home");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── Vendor: send OTP ─────────────────────────────────────────────── */
  const handleVendorSendOtp = async () => {
    if (!shopName.trim() || !ownerName.trim() || vendorPhone.length < 10) {
      toast.error("Fill all fields correctly"); return;
    }
    setLoading(true);
    try {
      setupRecaptcha("login-recaptcha-container");
      const fullPhone = vendorPhone.startsWith("91") ? `+${vendorPhone}` : `+91${vendorPhone}`;
      const result = await signInWithPhoneNumber(auth, fullPhone, window.loginRecaptchaVerifier!);
      setVendorConfirm(result);
      setScreen("vendor-otp");
      toast.success("OTP sent to your number!");
    } catch (e) {
      clearRecaptcha();
      toast.error(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── Vendor: verify OTP → backend ────────────────────────────────── */
  const handleVendorVerifyOtp = async () => {
    if (vendorOtp.length < 6) { toast.error("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      await vendorConfirm!.confirm(vendorOtp);
      const idToken = await auth.currentUser?.getIdToken();
      if (idToken) {
        const res = await verifyFirebaseIdToken(idToken, {
          role:      "vendor",
          storeName: shopName.trim(),
          name:      ownerName.trim(),
        });
        if (res.ok && res.token) {
          localStorage.setItem(JWT_STORAGE_KEY, res.token);
          loginUser({
            role:        "vendor",
            name:        res.user?.name       || ownerName.trim(),
            phone:       res.user?.phone      || vendorPhone,
            displayRole: "Supplier / Vendor",
            vendorStore: res.user?.vendorStore || shopName.trim(),
          });
          toast.success("Phone verified!");
          setScreen("vendor-kyc");
          return;
        }
        if (res.error) { toast.error(res.error); return; }
      }
      /* Fallback */
      loginUser({ role: "vendor", name: ownerName.trim(), phone: vendorPhone, displayRole: "Supplier / Vendor", vendorStore: shopName.trim() });
      setScreen("vendor-kyc");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ── Admin ────────────────────────────────────────────────────────── */
  const submitAdmin = async () => {
    if (!email || !pass) { toast.error("Enter your admin email and password."); return; }
    setLoading(true);
    const res = await adminLoginApi(email, pass);
    if (!res.ok || !res.token) {
      setLoading(false);
      toast.error(res.error ?? "Wrong credentials — Demo: admin@conon.in / admin123");
      return;
    }
    localStorage.setItem(JWT_STORAGE_KEY, res.token);
    setRole("admin");
    setLoading(false);
    setLocation("/admin");
  };

  /* ── KYC simulation ───────────────────────────────────────────────── */
  const runKycScan = () => {
    if (kycScanning || kycDone) return;
    if (kycTimer.current) clearTimeout(kycTimer.current);
    setKycScanning(true);
    kycTimer.current = setTimeout(() => {
      setKycScanning(false);
      setKycDone(true);
      toast.success("KYC Verified!");
    }, 2200);
  };

  const finishKyc = () => {
    toast.success("Welcome to your store!");
    setLocation("/vendor");
  };

  useEffect(() => () => { if (kycTimer.current) clearTimeout(kycTimer.current); }, []);

  const goHome = () => {
    setScreen("home");
    setPhone(""); setCustomerOtp(""); setCustomerConfirm(null);
    setShopName(""); setOwnerName(""); setVendorPhone(""); setVendorOtp(""); setVendorConfirm(null);
    if (kycTimer.current) { clearTimeout(kycTimer.current); kycTimer.current = null; }
    setKycScanning(false); setKycDone(false);
    clearRecaptcha();
  };

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-white flex justify-center overflow-hidden">
      {/* Hidden reCAPTCHA container — required by Firebase */}
      <div id="login-recaptcha-container" />

      <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-white">

        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════════════════════════
              HOME — Blinkit-style: product grid + phone input
              ════════════════════════════════════════════════════════ */}
          {screen === "home" && (
            <motion.div key="home"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col min-h-screen"
            >
              {/* Product grid — top 42% */}
              <div className="relative overflow-hidden bg-[#F8F9FA]" style={{ height: "42vh", minHeight: 260 }}>
                <div className="flex flex-col gap-3 py-4 px-0 h-full justify-center">
                  <ProductRow items={PRODUCTS.slice(0, 6)} />
                  <ProductRow items={PRODUCTS.slice(4, 10)} reverse />
                  <ProductRow items={PRODUCTS.slice(2, 8)} />
                </div>
                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                  style={{ background: "linear-gradient(to bottom, transparent, #F8F9FA)" }} />
              </div>

              {/* Bottom sheet */}
              <div className="flex-1 bg-white px-6 pt-6 pb-8 flex flex-col">

                {/* Logo + tagline */}
                <div className="flex flex-col items-center mb-7">
                  <div className="w-14 h-14 rounded-2xl bg-[#F6C543] flex items-center justify-center shadow-lg mb-3">
                    <HardHat className="w-8 h-8 text-[#1A1A1A]" />
                  </div>
                  <h1 className="text-[22px] font-black text-[#1A1A1A] tracking-tight text-center leading-tight">
                    India's fastest infra app
                  </h1>
                  <p className="text-[14px] text-[#6B7280] mt-1 font-medium">Log in or sign up</p>
                </div>

                {/* Phone input */}
                <div className="flex gap-2 mb-3">
                  <button className="flex items-center gap-1.5 bg-[#F3F4F6] px-3 py-3.5 rounded-xl font-semibold text-sm text-[#1A1A1A] border border-[#E5E7EB]">
                    <span className="text-lg">🇮🇳</span>
                    <span>+91</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  </button>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={e => e.key === "Enter" && handleCustomerSendOtp()}
                    className="flex-1 bg-[#F3F4F6] border border-[#E5E7EB] px-4 py-3.5 rounded-xl text-[15px] font-medium text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F6C543] focus:border-[#F6C543]"
                  />
                </div>

                {/* Continue button */}
                <button
                  onClick={handleCustomerSendOtp}
                  disabled={loading || phone.length < 10}
                  className="w-full py-4 rounded-xl font-bold text-[15px] text-white mb-4 flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: phone.length >= 10 ? "#F6C543" : "#D1D5DB",
                    color: phone.length >= 10 ? "#1A1A1A" : "#9CA3AF",
                  }}
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Continue"}
                </button>

                {/* OR divider */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                  <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-widest">OR</span>
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                </div>

                {/* Vendor + Admin tiles */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={() => setScreen("vendor-form")}
                    className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border border-[#E5E7EB] bg-white hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Store className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-[12px] font-bold text-[#374151]">Supplier / Vendor</span>
                    <span className="text-[10px] text-[#9CA3AF] text-center leading-tight">Manage store &amp; inventory</span>
                  </button>
                  <button
                    onClick={() => setScreen("admin")}
                    className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border border-[#E5E7EB] bg-white hover:border-slate-400 hover:bg-slate-50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-slate-700" />
                    </div>
                    <span className="text-[12px] font-bold text-[#374151]">Admin Portal</span>
                    <span className="text-[10px] text-[#9CA3AF] text-center leading-tight">System monitor &amp; control</span>
                  </button>
                </div>

                {/* Legal */}
                <p className="text-center text-[11px] text-[#9CA3AF] leading-relaxed mt-auto">
                  By continuing, you agree to our{" "}
                  <span className="text-[#374151] underline underline-offset-2 cursor-pointer">Terms of Service</span>
                  {" "}&amp;{" "}
                  <span className="text-[#374151] underline underline-offset-2 cursor-pointer">Privacy Policy</span>
                </p>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              CUSTOMER OTP — verify step
              ════════════════════════════════════════════════════════ */}
          {screen === "customer-otp" && (
            <motion.div key="customer-otp"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-screen px-6 pt-14 pb-10"
            >
              <button onClick={goHome} className="mb-8 self-start text-[#6B7280] hover:text-[#1A1A1A]">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-black text-[#1A1A1A] mb-1">Enter OTP</h2>
              <p className="text-[13px] text-[#6B7280] mb-8">Sent to +91 {phone}</p>
              <input
                type="number" inputMode="numeric"
                placeholder="6-digit OTP"
                value={customerOtp}
                onChange={e => setCustomerOtp(e.target.value.slice(0, 6))}
                onKeyDown={e => e.key === "Enter" && handleCustomerVerifyOtp()}
                className="w-full bg-[#F3F4F6] border-2 border-[#F6C543] px-4 py-4 rounded-xl text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 ring-[#F6C543]/50 mb-6"
              />
              <button onClick={handleCustomerVerifyOtp} disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-[15px] bg-[#F6C543] text-[#1A1A1A] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : <>Verify &amp; Continue <ArrowRight className="w-4 h-4" /></>}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9CA3AF] mt-6">
                <ShieldCheck className="w-3.5 h-3.5" /> Secured by Firebase
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              VENDOR FORM
              ════════════════════════════════════════════════════════ */}
          {screen === "vendor-form" && (
            <motion.div key="vendor-form"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-screen px-6 pt-14 pb-10"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={goHome} className="text-[#6B7280]"><X className="w-5 h-5" /></button>
                <div className="flex gap-1.5">
                  <div className="w-7 h-1 rounded-full bg-emerald-500" />
                  <div className="w-7 h-1 rounded-full bg-[#E5E7EB]" />
                  <div className="w-7 h-1 rounded-full bg-[#E5E7EB]" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-[#1A1A1A] mb-1">Register Shop</h2>
              <p className="text-[13px] text-[#6B7280] mb-8">Basic business information</p>
              <div className="space-y-4 flex-1">
                <input type="text" placeholder="Shop Name (e.g. Sharma Hardware)"
                  value={shopName} onChange={e => setShopName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] font-medium text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 ring-emerald-400/50 focus:border-emerald-400"
                />
                <input type="text" placeholder="Owner Name"
                  value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] font-medium text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 ring-emerald-400/50"
                />
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 bg-[#F3F4F6] border border-[#E5E7EB] px-3 rounded-xl text-sm font-semibold text-[#374151]">
                    🇮🇳 +91
                  </div>
                  <input type="tel" maxLength={10} placeholder="Mobile number"
                    value={vendorPhone} onChange={e => setVendorPhone(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] font-medium text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 ring-emerald-400/50"
                  />
                </div>
              </div>
              <button onClick={handleVendorSendOtp} disabled={loading}
                className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-[15px] mt-6 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Get OTP →"}
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              VENDOR OTP verify
              ════════════════════════════════════════════════════════ */}
          {screen === "vendor-otp" && (
            <motion.div key="vendor-otp"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-screen px-6 pt-14 pb-10"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => { setScreen("vendor-form"); setVendorOtp(""); clearRecaptcha(); }}
                  className="text-[#6B7280]"><X className="w-5 h-5" /></button>
                <div className="flex gap-1.5">
                  <div className="w-7 h-1 rounded-full bg-emerald-500" />
                  <div className="w-7 h-1 rounded-full bg-emerald-500" />
                  <div className="w-7 h-1 rounded-full bg-[#E5E7EB]" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-[#1A1A1A] mb-1">Verify OTP</h2>
              <p className="text-[13px] text-[#6B7280] mb-8">Sent to +91 {vendorPhone}</p>
              <input
                type="number" inputMode="numeric"
                placeholder="6-digit OTP"
                value={vendorOtp}
                onChange={e => setVendorOtp(e.target.value.slice(0, 6))}
                onKeyDown={e => e.key === "Enter" && handleVendorVerifyOtp()}
                className="w-full bg-[#F3F4F6] border-2 border-emerald-400 px-4 py-4 rounded-xl text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 ring-emerald-400/50 mb-6"
              />
              <button onClick={handleVendorVerifyOtp} disabled={loading}
                className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-[15px] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : "Verify Phone →"}
              </button>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              VENDOR KYC
              ════════════════════════════════════════════════════════ */}
          {screen === "vendor-kyc" && (
            <motion.div key="vendor-kyc"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-screen px-6 pt-14 pb-10"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">Step 3 of 3</span>
                <div className="flex gap-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-7 h-1 rounded-full bg-emerald-500" />
                  ))}
                </div>
              </div>
              <h2 className="text-2xl font-black text-[#1A1A1A] mb-1">Verify your business</h2>
              <p className="text-[13px] text-[#6B7280] mb-8">One scan to verify GST &amp; Aadhaar</p>
              <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#1A1A1A] text-white p-2.5 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1A1A1A]">Business Documents</p>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">GST · Aadhaar</p>
                  </div>
                  {kycDone && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="ml-auto flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
                    </motion.div>
                  )}
                </div>
                <div className="space-y-2">
                  {[{ label: "GSTIN", value: KYC_GST }, { label: "Aadhaar", value: KYC_AADHAAR }].map(row => (
                    <div key={row.label} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#E5E7EB]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">{row.label}</span>
                      <span className="font-bold text-[13px] tracking-wide" style={{ color: kycDone ? "#065f46" : "#D1D5DB" }}>
                        {kycDone ? row.value : "•••• •••• ••••"}
                      </span>
                    </div>
                  ))}
                </div>
                <AnimatePresence>
                  {kycScanning && (
                    <motion.div
                      className="pointer-events-none absolute left-0 right-0 h-14"
                      style={{ background: "linear-gradient(180deg, rgba(16,185,129,0) 0%, rgba(16,185,129,0.3) 100%)", borderBottom: "2px solid #10b981" }}
                      initial={{ top: "0%", opacity: 0 }}
                      animate={{ top: ["0%", "85%", "0%"], opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </AnimatePresence>
              </div>
              {!kycDone ? (
                <button onClick={runKycScan} disabled={kycScanning}
                  className="w-full py-4 rounded-xl font-bold text-[15px] text-white bg-emerald-500 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {kycScanning
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning documents…</>
                    : <><ScanLine className="w-4 h-4" /> 1-Scan KYC</>}
                </button>
              ) : (
                <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  onClick={finishKyc}
                  className="w-full py-4 rounded-xl font-bold text-[15px] text-white bg-[#1A1A1A] flex items-center justify-center gap-2"
                >
                  Enter Dashboard →
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              ADMIN
              ════════════════════════════════════════════════════════ */}
          {screen === "admin" && (
            <motion.div key="admin"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col min-h-screen px-6 pt-14 pb-10"
            >
              <button onClick={goHome} className="mb-8 self-start text-[#6B7280]"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-black text-[#1A1A1A] mb-1">Admin Access</h2>
              <p className="text-[13px] text-[#6B7280] mb-8">Restricted · Full system visibility</p>
              <div className="space-y-3 flex-1">
                <input type="email" placeholder="admin@conon.in"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] font-medium text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 ring-slate-400/50"
                />
                <div className="relative">
                  <input type={showPass ? "text" : "password"} placeholder="Password"
                    value={pass} onChange={e => setPass(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submitAdmin()}
                    className="w-full p-4 pr-12 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] font-medium text-[15px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none"
                  />
                  <button onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#9CA3AF] font-medium text-center">Demo: admin@conon.in / admin123</p>
              </div>
              <button onClick={submitAdmin} disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-[15px] text-white bg-[#1A1A1A] disabled:opacity-50 mt-6"
              >
                {loading ? "Verifying…" : "Access Control Room →"}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

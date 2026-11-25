import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import {
  X,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Home,
  HardHat,
  Compass,
  ClipboardCheck,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
  Radio,
} from "lucide-react";
import { useAuthContext, AuthModalTab } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import { auth } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { IS_LOCAL_ADMIN } from "@/config/adminGuard";

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  defaultTab?: AuthModalTab;
}

export function AuthModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSuccess,
  defaultTab,
}: AuthModalProps) {
  const [, navigate] = useLocation();
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    openAuthModal,
    loginWithOtp,
    createAccount,
    loginAsAdmin,
  } = useAuthContext();
  const { isLoginModalOpen, setLoginModalOpen } = useUI();
  const { loginUser } = useUser();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAuthModalOpen || isLoginModalOpen;
  const currentTab = defaultTab || authModalTab;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      closeAuthModal();
      setLoginModalOpen(false);
    }
  };

  // Login form state
  const [loginStep, setLoginStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);

  // Sign up form state
  const [signUpName, setSignUpName] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpPin, setSignUpPin] = useState("226030");
  const [signUpRole, setSignUpRole] = useState("Home Owner");

  // Admin form state
  const [adminId, setAdminId] = useState("admin");
  const [adminPin, setAdminPin] = useState("2026");
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [adminRole, setAdminRole] = useState<"SUPER_ADMIN" | "DISPATCH_MANAGER" | "ACCOUNTS_CONTROL">("SUPER_ADMIN");

  const digitRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoginStep("phone");
      setPhone("");
      setOtpDigits(["", "", "", ""]);
      setLoading(false);
      setConfirmResult(null);
      setSignUpName("");
      setSignUpPhone("");
      setSignUpPin("226030");
      setSignUpRole("Home Owner");
      setAdminId("admin");
      setAdminPin("2026");
    }
  }, [isOpen]);

  // Focus first OTP box on step change
  useEffect(() => {
    if (loginStep === "otp" && currentTab === "login") {
      setTimeout(() => {
        digitRefs[0]?.current?.focus();
      }, 150);
    }
  }, [loginStep, currentTab]);

  function setupRecaptcha() {
    if (typeof window === "undefined") return;
    if (!window.recaptchaVerifier) {
      const container = document.getElementById("auth-modal-recaptcha-root");
      if (container) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "auth-modal-recaptcha-root", {
          size: "invisible",
        });
      }
    }
  }

  function clearRecaptcha() {
    try {
      window.recaptchaVerifier?.clear();
    } catch (_) {}
    window.recaptchaVerifier = undefined;
  }

  /* ── 1. Send OTP ── */
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNum = phone.replace(/\D/g, "");
    if (cleanNum.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      setupRecaptcha();
      const formatted = cleanNum.startsWith("91") ? `+${cleanNum}` : `+91${cleanNum}`;
      if (window.recaptchaVerifier) {
        const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
        setConfirmResult(result);
      }
      setLoginStep("otp");
      setResendTimer(30);
      toast.success("OTP sent to your phone!");
    } catch (err) {
      clearRecaptcha();
      setConfirmResult(null);
      setLoginStep("otp");
      setResendTimer(30);
      toast.info("Verification code ready: Enter 1234 to log in.");
    } finally {
      setLoading(false);
    }
  };

  /* ── 2. Verify OTP & Login ── */
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length < 4) {
      toast.error("Please enter the 4-digit OTP (e.g. 1234)");
      return;
    }

    setLoading(true);
    try {
      if (confirmResult && enteredOtp.length >= 6) {
        await confirmResult.confirm(enteredOtp);
      }

      await loginWithOtp({
        phone: phone.replace(/\D/g, ""),
        otp: enteredOtp,
        role: "Builder / Owner",
      });

      loginUser({
        role: "customer",
        name: "CONON Builder",
        phone: phone.replace(/\D/g, ""),
        displayRole: "Builder / Owner",
      });

      handleClose();
      onSuccess?.();
    } catch (err) {
      if (enteredOtp === "1234" || enteredOtp === "123456") {
        await loginWithOtp({
          phone: phone.replace(/\D/g, "") || "9876543210",
          otp: enteredOtp,
          name: "CONON Builder",
          role: "Builder / Owner",
        });
        loginUser({
          role: "customer",
          name: "CONON Builder",
          phone: phone.replace(/\D/g, "") || "9876543210",
          displayRole: "Builder / Owner",
        });
        handleClose();
        onSuccess?.();
        return;
      }
      toast.error("Invalid OTP. Try demo code 1234.");
    } finally {
      setLoading(false);
    }
  };

  /* ── 3. Quick Fill Demo OTP ── */
  const handleFillDemoOtp = () => {
    setOtpDigits(["1", "2", "3", "4"]);
    toast.success("Demo OTP 1234 applied!");
  };

  /* ── 4. Create Account ── */
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = signUpPhone.replace(/\D/g, "");
    if (!signUpName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      await createAccount({
        name: signUpName.trim(),
        phone: cleanPhone,
        pinCode: signUpPin.trim() || "226030",
        role: signUpRole,
      });

      loginUser({
        role: "customer",
        name: signUpName.trim(),
        phone: cleanPhone,
        displayRole: signUpRole,
      });

      handleClose();
      onSuccess?.();
    } catch (err) {
      toast.error("Account creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── 5. Admin Console Login ── */
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginAsAdmin({
        adminId: adminId.trim() || "admin",
        pin: adminPin.trim() || "2026",
        permissionRole: adminRole,
      });

      loginUser({
        role: "admin",
        name: adminId === "admin" ? "Founder & CEO" : adminId,
        phone: "9876543210",
        displayRole:
          adminRole === "SUPER_ADMIN"
            ? "Super Admin (Founder)"
            : adminRole === "DISPATCH_MANAGER"
            ? "Dispatch Manager"
            : "Accounts & Rate Control",
      });

      handleClose();
      navigate("/admin");
    } catch (err: any) {
      toast.error(err?.message || "Admin authorization failed. Use testing PIN: 2026.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Digit input keyboard handler ── */
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, 4).split("");
      const next = [...otpDigits];
      chars.forEach((c, i) => {
        if (index + i < 4) next[index + i] = c;
      });
      setOtpDigits(next);
      const targetIdx = Math.min(index + chars.length, 3);
      digitRefs[targetIdx]?.current?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    if (index < 3) {
      digitRefs[index + 1]?.current?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      digitRefs[index - 1]?.current?.focus();
    }
  };

  if (typeof document === "undefined" || !isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
      onClick={handleClose}
    >
      <div id="auth-modal-recaptcha-root" />

      {/* ────────────────────────────────────────────────────────────
          ADMIN COMMAND LOGIN (OBSIDIAN & INDIGO MISSION CONTROL GATE)
          Gated strictly behind IS_LOCAL_ADMIN
          ──────────────────────────────────────────────────────────── */}
      {IS_LOCAL_ADMIN && currentTab === "admin" ? (
        <div
          className="relative bg-[#0B1120] text-slate-100 rounded-3xl p-6 sm:p-7 max-w-[430px] w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border border-indigo-900/40 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Ambient Glowing CAD Grid Accent */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top-Right Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2.2} />
          </button>

          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-indigo-950 border border-indigo-600/40 flex flex-col items-center justify-center shadow-lg shadow-indigo-900/30 text-white shrink-0">
              <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-black text-white tracking-tight leading-tight">
                  CONON COMMAND OS
                </h2>
                <span className="px-1.5 py-0.5 rounded-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-black uppercase tracking-wider">
                  Admin Gate
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Founder &amp; Mission Control Operations · Lucknow
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 relative z-10 text-left">
            <div>
              <label className="block text-[11.5px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Identifier
              </label>
              <div className="relative flex items-center w-full border border-slate-700 focus-within:border-indigo-500 rounded-xl transition bg-slate-900/80 h-11 overflow-hidden">
                <span className="pl-3 pr-2 text-slate-400 text-xs">@</span>
                <input
                  type="text"
                  required
                  placeholder="admin or founder@conon.in"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full h-full px-2 text-xs sm:text-[13px] font-semibold text-white placeholder:text-slate-500 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11.5px] font-bold text-slate-300 uppercase tracking-wider">
                  4-Digit Security PIN
                </label>
                <button
                  type="button"
                  onClick={() => setAdminPin("2026")}
                  className="text-[10.5px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  ⚡ Fill Dev PIN: 2026
                </button>
              </div>

              <div className="relative flex items-center w-full border border-slate-700 focus-within:border-indigo-500 rounded-xl transition bg-slate-900/80 h-11 overflow-hidden px-3">
                <KeyRound className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                <input
                  type={showAdminPin ? "text" : "password"}
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full h-full text-base font-black tracking-widest text-white placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-normal focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPin((prev) => !prev)}
                  className="p-1 text-slate-400 hover:text-slate-200 transition"
                  aria-label="Toggle pin visibility"
                >
                  {showAdminPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11.5px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Command Role Level
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  {
                    key: "SUPER_ADMIN",
                    label: "Super Admin (Founder)",
                    desc: "Full God-Eye, Mandi rates, Escrow payouts & SOS limit control",
                  },
                  {
                    key: "DISPATCH_MANAGER",
                    label: "Dispatch Manager",
                    desc: "60-Min Dhalai Radar, driver rerouting & hub dispatch matrix",
                  },
                  {
                    key: "ACCOUNTS_CONTROL",
                    label: "Accounts & Rate Control",
                    desc: "Khata credit, BOQ quotes & Leftover buyback settlements",
                  },
                ].map((item) => {
                  const isSelected = adminRole === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setAdminRole(item.key as any)}
                      className={`flex flex-col text-left p-2.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-950/70 border-indigo-500 text-white shadow-sm"
                          : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isSelected ? "text-indigo-300" : "text-slate-300"}`}>
                          {item.label}
                        </span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unlock Button */}
            <button
              type="submit"
              disabled={loading || adminPin.length < 4}
              className="w-full mt-2 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Decrypting Session…</span>
                </>
              ) : (
                <span>Unlock CONON COMMAND OS →</span>
              )}
            </button>
          </form>

          {/* Footer Back link */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Customer Login</span>
            </button>
            <span className="text-[10px] text-slate-500 font-mono">ENCRYPTED • 256-BIT</span>
          </div>
        </div>
      ) : (
        /* ────────────────────────────────────────────────────────────
            CUSTOMER STOREFRONT MODAL (WHITE BENCHMARK WITH ADMIN LINK)
            ──────────────────────────────────────────────────────────── */
        <div
          className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-[420px] w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top-Right Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2.2} />
          </button>

          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-[#1848a0] flex flex-col items-center justify-center shadow-md shadow-blue-900/20 text-white shrink-0">
              <span className="text-[11px] font-black tracking-tight leading-none">CONON</span>
              <span className="bg-[#f2b705] text-slate-900 text-[7.5px] font-black px-1 py-0.2 rounded-xs uppercase tracking-wider leading-none mt-0.5">
                NOW
              </span>
            </div>
            <div>
              <h2 className="text-[17px] font-black text-slate-900 tracking-tight leading-tight">
                CONON-NOW Lucknow
              </h2>
              <p className="text-[11.5px] text-slate-500 font-medium">
                60-Min Construction Material Delivery
              </p>
            </div>
          </div>

          {/* ── Tabs (Login vs Create Account) ── */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                currentTab === "login"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Login with OTP
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("signup")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                currentTab === "signup"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ── TAB 1: LOGIN FLOW ── */}
          {currentTab === "login" && (
            <div>
              {loginStep === "phone" ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-[12.5px] font-bold text-slate-700 mb-1.5">
                      10-Digit Mobile Number
                    </label>
                    <div className="relative flex items-center w-full border border-slate-300 rounded-2xl focus-within:border-[#1848a0] focus-within:ring-2 focus-within:ring-[#1848a0]/20 transition bg-white h-12 overflow-hidden shadow-2xs">
                      <div className="flex items-center gap-1 pl-3 pr-2 select-none shrink-0 bg-slate-50 h-full border-r border-slate-200">
                        <span className="text-base leading-none">🇮🇳</span>
                        <span className="text-xs font-bold text-slate-700">+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        autoFocus
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-full px-3 text-[15px] font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full h-12 rounded-2xl bg-[#1848a0] hover:bg-[#153e8a] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm transition-all shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Sending OTP…</span>
                      </>
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[12px] font-bold text-slate-700">
                        Enter 4-Digit OTP
                      </label>
                      <span className="text-[11px] font-medium text-slate-500">
                        Sent to +91 {phone}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={digitRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                          className="w-full h-12 border-2 border-slate-300 focus:border-[#1848a0] focus:ring-2 focus:ring-[#1848a0]/20 rounded-2xl text-center text-xl font-black text-slate-900 focus:outline-none transition bg-slate-50 focus:bg-white"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Demo OTP: 1234</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillDemoOtp}
                      className="text-amber-800 underline font-black hover:text-amber-950 cursor-pointer"
                    >
                      Auto Fill
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length < 4}
                    className="w-full h-12 rounded-2xl bg-[#1848a0] hover:bg-[#153e8a] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm transition-all shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Verifying…</span>
                      </>
                    ) : (
                      <span>Verify &amp; Login</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-500 font-medium">
                    <button
                      type="button"
                      onClick={() => setLoginStep("phone")}
                      className="text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change phone</span>
                    </button>

                    {resendTimer > 0 ? (
                      <span className="text-slate-400">Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestOtp()}
                        className="text-[#1848a0] font-bold hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── TAB 2: CREATE ACCOUNT FLOW ── */}
          {currentTab === "signup" && (
            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-left">
              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs sm:text-[13px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1848a0] focus:ring-1 focus:ring-[#1848a0]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative flex items-center w-full border border-slate-300 rounded-xl focus-within:border-[#1848a0] focus-within:ring-1 focus-within:ring-[#1848a0] transition bg-white h-11 overflow-hidden">
                  <div className="flex items-center gap-1 pl-2.5 pr-2 select-none shrink-0 bg-slate-50 h-full border-r border-slate-200">
                    <span className="text-sm">🇮🇳</span>
                    <span className="text-[11.5px] font-bold text-slate-700">+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    placeholder="98765 43210"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-full px-2.5 text-xs sm:text-[13px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1">
                  Lucknow Delivery PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={signUpPin}
                  onChange={(e) => setSignUpPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="226030"
                  className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs sm:text-[13px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1848a0] focus:ring-1 focus:ring-[#1848a0]"
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-slate-700 mb-1.5">
                  I am ordering as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: "Home Owner", icon: Home },
                    { role: "Builder / Contractor", icon: HardHat },
                    { role: "Civil Engineer / Architect", icon: Compass },
                    { role: "Site Supervisor", icon: ClipboardCheck },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = signUpRole === item.role;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setSignUpRole(item.role)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? "border-[#1848a0] bg-blue-50/70 text-[#1848a0] font-black shadow-2xs"
                            : "border-slate-200 bg-slate-50 text-slate-600 font-semibold hover:bg-slate-100"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#1848a0]" : "text-slate-400"}`} />
                        <span className="text-[11px] leading-tight truncate">{item.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || signUpPhone.length < 10 || !signUpName.trim()}
                className="w-full mt-2 h-12 rounded-2xl bg-[#1848a0] hover:bg-[#153e8a] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm transition-all shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Creating Account…</span>
                  </>
                ) : (
                  <span>Create Account &amp; Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* ── Subtitle Trust Badges + Subtle Stealth Admin Link ── */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col items-center gap-2 text-[11px] text-slate-500">
            <div className="flex items-center justify-center gap-3">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ISI Certified</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>60-Min JIT Dispatch</span>
              </span>
            </div>

            {/* PART 1.1: Subtle Stealth Admin Command Portal Lock Link (Local Admin only) */}
            {IS_LOCAL_ADMIN && (
              <button
                type="button"
                onClick={() => openAuthModal("admin")}
                className="mt-1 text-[11px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer py-0.5"
              >
                <Lock className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                <span>🔒 Founder / Admin Command Portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default AuthModal;

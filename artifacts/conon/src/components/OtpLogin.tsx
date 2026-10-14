import React, { useState } from "react";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { Phone, ArrowRight, ChevronLeft, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { verifyFirebaseIdToken, JWT_STORAGE_KEY } from "@/lib/authApi";

declare global {
  interface Window { recaptchaVerifier?: RecaptchaVerifier; }
}

interface OtpLoginProps {
  onLoginSuccess?: () => void;
}

const BRAND = "#1b4366";
const GREEN = "#2a7a3b";

export default function OtpLogin({ onLoginSuccess }: OtpLoginProps) {
  const { loginUser } = useUser();

  const [phone, setPhone]                 = useState("");
  const [otp, setOtp]                     = useState("");
  const [step, setStep]                   = useState<"phone" | "otp" | "done">("phone");
  const [status, setStatus]               = useState("");
  const [error, setError]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);

  function setupRecaptcha() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth, "recaptcha-container", { size: "invisible" },
      );
    }
  }

  async function handleSendOtp() {
    setError(""); setStatus("");
    const cleaned = phone.trim();
    if (!cleaned || cleaned.length < 10) {
      setError("Enter a valid phone number with country code (e.g. +91XXXXXXXXXX).");
      return;
    }
    try {
      setLoading(true);
      setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, cleaned, window.recaptchaVerifier!);
      setConfirmResult(result);
      setStep("otp");
      setStatus("OTP sent! Check your phone.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP.";
      setError(msg);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError(""); setStatus("");
    if (!otp.trim() || otp.trim().length < 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      await confirmResult!.confirm(otp.trim());

      /* ── Get Firebase ID token and exchange for platform JWT ── */
      const idToken = await auth.currentUser?.getIdToken();
      if (idToken) {
        const res = await verifyFirebaseIdToken(idToken);
        if (res.ok && res.token) {
          localStorage.setItem(JWT_STORAGE_KEY, res.token);
          loginUser({
            role:  "customer",
            name:  res.user?.name  || "CONON User",
            phone: res.user?.phone || phone,
            displayRole: "Builder / Owner",
          });
        }
        /* If backend isn't configured yet (503), we still let the gate open
           so the user can at least see the app while setting up Firebase. */
      }

      setStep("done");
      onLoginSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid OTP.";
      setError(msg.includes("invalid-verification-code") ? "Invalid OTP. Please try again." : msg);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("phone"); setPhone(""); setOtp(""); setStatus(""); setError("");
  }

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: BRAND }}>
      {/* Hidden recaptcha — required by Firebase */}
      <div id="recaptcha-container" />

      {/* ── Top branded section ───────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center gap-5 px-6 pt-14 pb-8 relative overflow-hidden"
        style={{ minHeight: "42vh" }}
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-10" style={{ background: "#fff" }} />
        <div className="absolute top-8 -left-20 w-44 h-44 rounded-full opacity-[0.06]" style={{ background: "#fff" }} />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <img
            src="/images/conon-logo-real.png"
            alt="CONON Infrabuilt"
            className="h-14 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="text-center">
            <p className="text-white/90 font-black text-xl tracking-wide">CONON</p>
            <p className="text-white/55 text-[11px] font-semibold tracking-widest uppercase mt-0.5">Infrabuilt</p>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 text-center">
          <p className="text-white font-black text-2xl leading-[1.2]">
            India's #1 Construction
            <br />
            <span style={{ color: "#4ade80" }}>Material Marketplace</span>
          </p>
          <p className="text-white/50 text-[12px] mt-2 font-medium">Cement · Steel · Sand · Bricks · More</p>
        </div>

        {/* Trust pills */}
        <div className="relative z-10 flex gap-2 flex-wrap justify-center">
          {["120+ Brands", "60-Min Delivery", "GST Invoice"].map(t => (
            <span key={t} className="text-[10px] font-black px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}>
              ✓ {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Bottom form sheet ─────────────────────────────────────────── */}
      <div className="w-full rounded-t-[32px] px-6 pt-7 pb-10"
        style={{ background: "#fff", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}>

        {/* Step label */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: BRAND }}>
              {step === "phone" ? "Step 1 of 2" : step === "otp" ? "Step 2 of 2" : "Done!"}
            </p>
            <h2 className="text-[22px] font-black text-slate-900 leading-tight">
              {step === "phone" && "Enter Mobile Number"}
              {step === "otp"   && "Verify OTP"}
              {step === "done"  && "You're In! 🎉"}
            </h2>
            <p className="text-[12px] text-slate-400 font-medium mt-0.5">
              {step === "phone" && "We'll send a one-time password to your number."}
              {step === "otp"   && `OTP sent to ${phone}. Check your SMS.`}
              {step === "done"  && "Welcome to CONON Infrabuilt."}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0 mt-1">
            <div className="w-6 h-1.5 rounded-full" style={{ background: BRAND }} />
            <div className="w-6 h-1.5 rounded-full"
              style={{ background: step === "otp" || step === "done" ? GREEN : "#e2e8f0" }} />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl flex items-start gap-2.5"
            style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>
            <span className="text-red-500 mt-0.5 text-base leading-none">⚠</span>
            <p className="text-red-700 text-[12px] font-semibold leading-snug">{error}</p>
          </div>
        )}

        {/* Success banner */}
        {status && (
          <div className="mb-4 px-4 py-3 rounded-2xl flex items-center gap-2.5"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-green-800 text-[12px] font-semibold">{status}</p>
          </div>
        )}

        {/* Step 1 — Phone */}
        {step === "phone" && (
          <div className="space-y-4">
            <div className="flex items-center rounded-2xl overflow-hidden"
              style={{ border: `2px solid ${BRAND}`, background: "#f8fafc" }}>
              <div className="flex items-center gap-2 px-4 py-4 shrink-0 border-r"
                style={{ borderColor: `${BRAND}33`, background: "#eef4f8" }}>
                <span className="text-lg leading-none">🇮🇳</span>
                <span className="text-[13px] font-black text-slate-700">+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                placeholder="98765 43210"
                className="flex-1 px-4 py-4 bg-transparent text-slate-900 font-bold text-[16px] focus:outline-none placeholder:text-slate-300"
              />
              <Phone className="w-4 h-4 mr-4 shrink-0" style={{ color: `${BRAND}80` }} />
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-1 pl-1">
              Include full number with country code, e.g. +91XXXXXXXXXX
            </p>
            <button onClick={handleSendOtp} disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-[16px] text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading ? "#64748b" : `linear-gradient(135deg, ${BRAND} 0%, ${GREEN} 100%)`,
                boxShadow: loading ? "none" : `0 6px 20px ${BRAND}55`,
              }}
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending…</>
                : <>Get OTP <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        )}

        {/* Step 2 — OTP */}
        {step === "otp" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center rounded-2xl overflow-hidden"
              style={{ border: `2px solid ${GREEN}`, background: "#f0fdf4" }}>
              <input
                type="number"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                placeholder="• • • • • •"
                className="w-full px-5 py-4 bg-transparent text-center text-slate-900 font-black text-[28px] tracking-[0.35em] focus:outline-none placeholder:text-slate-300 placeholder:text-[20px] placeholder:tracking-[0.3em]"
              />
            </div>
            <button onClick={handleVerifyOtp} disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-[16px] text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading ? "#64748b" : `linear-gradient(135deg, ${GREEN} 0%, #1a5c28 100%)`,
                boxShadow: loading ? "none" : `0 6px 20px ${GREEN}55`,
              }}
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying…</>
                : <>Verify & Continue <ArrowRight className="w-5 h-5" /></>}
            </button>
            <button onClick={() => { setStep("phone"); setStatus(""); setError(""); }}
              className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 font-bold text-[13px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition">
              <ChevronLeft className="w-4 h-4" /> Change Number
            </button>
          </div>
        )}

        {/* Step 3 — Success */}
        {step === "done" && (
          <div className="text-center space-y-5 py-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ background: "#f0fdf4", border: `3px solid ${GREEN}` }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: GREEN }} />
            </div>
            <div>
              <p className="font-black text-slate-900 text-xl">Verified Successfully!</p>
              <p className="text-[12px] text-slate-400 mt-1">Loading your CONON experience…</p>
            </div>
            <button onClick={reset} className="text-[12px] text-slate-400 underline underline-offset-2">
              Use a different number
            </button>
          </div>
        )}

        {/* Security note */}
        {step !== "done" && (
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <Shield className="w-3 h-3 text-slate-300" />
            <p className="text-[10px] text-slate-300 font-semibold">
              Secured by Firebase · Your data is private
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

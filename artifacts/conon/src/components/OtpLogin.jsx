import React, { useState } from "react";
import { auth } from "../firebase.js";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function OtpLogin() {
  const [phone, setPhone]           = useState("");
  const [otp, setOtp]               = useState("");
  const [step, setStep]             = useState("phone"); // "phone" | "otp"
  const [status, setStatus]         = useState("");      // feedback message
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);

  function setupRecaptcha() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  }

  async function handleSendOtp() {
    setError("");
    setStatus("");
    const cleaned = phone.trim();
    if (!cleaned || cleaned.length < 10) {
      setError("Enter a valid phone number with country code (e.g. +91XXXXXXXXXX).");
      return;
    }
    try {
      setLoading(true);
      setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, cleaned, window.recaptchaVerifier);
      setConfirmResult(result);
      setStep("otp");
      setStatus("OTP sent! Check your phone.");
    } catch (err) {
      setError(err?.message ?? "Failed to send OTP. Check the phone number & Firebase config.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    setStatus("");
    if (!otp.trim() || otp.trim().length < 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      await confirmResult.confirm(otp.trim());
      setStatus("✓ Phone verified! You are logged in.");
      setStep("done");
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Phone Verification</h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === "phone" && "Enter your number to receive an OTP."}
            {step === "otp"   && "Enter the 6-digit code sent to your phone."}
            {step === "done"  && "Your phone is verified!"}
          </p>
        </div>

        {/* Hidden recaptcha container — required by Firebase */}
        <div id="recaptcha-container" />

        {/* Status / error banners */}
        {status && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-semibold text-center">
            {status}
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold text-center">
            {error}
          </div>
        )}

        {/* Step 1 — Phone input */}
        {step === "phone" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                Include country code, e.g. +91 for India.
              </p>
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-black text-[15px] shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </div>
        )}

        {/* Step 2 — OTP input */}
        {step === "otp" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                One-Time Password
              </label>
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold text-[15px] tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-black text-[15px] shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
            <button
              onClick={() => { setStep("phone"); setStatus(""); setError(""); }}
              className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-500 font-bold text-sm active:scale-[0.98] transition"
            >
              ← Change Number
            </button>
          </div>
        )}

        {/* Step 3 — Success */}
        {step === "done" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <p className="font-black text-slate-900 text-lg">Verified!</p>
            <p className="text-sm text-slate-500">
              Firebase phone authentication successful.
            </p>
            <button
              onClick={() => { setStep("phone"); setPhone(""); setOtp(""); setStatus(""); setError(""); }}
              className="w-full py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm active:scale-[0.98] transition"
            >
              Start Over
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

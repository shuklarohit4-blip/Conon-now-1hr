import React, { useState } from "react";
import {
  Store,
  Truck,
  ShieldCheck,
  Phone,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import { resolveApiUrl } from "@/lib/apiBase";
import { useKyc, type PartnerKycApplication } from "@/context/KycContext";
import { VendorRegisterWizard } from "@/components/kyc/VendorRegisterWizard";
import { DriverRegisterWizard } from "@/components/kyc/DriverRegisterWizard";
import { useVendorTheme, VendorThemeToggle } from "@/context/VendorThemeContext";
import { useVendorLang, VendorLanguageToggle } from "@/context/VendorLanguageContext";

export interface PartnerSession {
  partnerId: string;
  phone: string;
  firmOrName: string;
  role: "vendor" | "driver";
  status: "APPROVED" | "PENDING_APPROVAL" | "REUPLOAD_REQUIRED";
  isDemo?: boolean;
}

interface PartnerAccessGateProps {
  role: "vendor" | "driver";
  onAuthenticated: (session: PartnerSession) => void;
  onPending: (application: PartnerKycApplication) => void;
}

export function PartnerAccessGate({ role, onAuthenticated, onPending }: PartnerAccessGateProps) {
  const { applications, setActiveApplicantId } = useKyc();
  const { isDark } = useVendorTheme();
  const { t, lang } = useVendorLang();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const isVendor = role === "vendor";

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cleanPhone.length !== 10) {
      toast.error(lang === "hi" ? "कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें" : "Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSubmitting(true);
    setNotFoundError(false);

    try {
      const res = await fetch(resolveApiUrl("/api/auth/partner-login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          role,
          action: "send_otp",
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.success) {
        setOtpSent(true);
        if (resData.devOtp) {
          toast.info(resData.message || `Dev OTP ready: ${resData.devOtp}`, { icon: "📱" });
        } else {
          toast.success(
            resData.message ||
              (lang === "hi"
                ? `+91 ${cleanPhone} पर SMS OTP भेजा गया`
                : `OTP sent via SMS to +91 ${cleanPhone}`),
            { icon: "📱" }
          );
        }
      } else {
        toast.error(resData.error || "Could not send OTP. Check mobile number and try again.");
      }
    } catch {
      toast.error(
        lang === "hi"
          ? "नेटवर्क त्रुटि — कृपया पुनः प्रयास करें"
          : "Network error — could not send OTP."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Status Check
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error(lang === "hi" ? "कृपया 4 अंकों का OTP दर्ज करें" : "Please enter 4-digit OTP");
      return;
    }

    setIsSubmitting(true);
    setNotFoundError(false);

    try {
      const res = await fetch(resolveApiUrl("/api/auth/partner-login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          otp,
          role,
          action: "verify_otp",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "NOT_FOUND") {
          setNotFoundError(true);
          toast.error(
            lang === "hi"
              ? "यह नंबर पंजीकृत नहीं है — कृपया 2 मिनट का पेपर सत्यापन पूरा करें।"
              : "Number not registered yet — Complete 2-Minute Paper Verification to join."
          );
          setIsSubmitting(false);
          return;
        }

        if (data.status === "APPROVED") {
          const session: PartnerSession = {
            partnerId: data.partnerId || (isVendor ? "CN-VND-LKO-108" : "CN-DRV-LKO-204"),
            phone: cleanPhone,
            firmOrName: data.firmOrName || data.application?.firmOrName || "Verified Partner",
            role,
            status: "APPROVED",
            isDemo: Boolean(data.isDemo),
          };

          const storageKey = isVendor ? "conon_vendor_session" : "conon_driver_session";
          localStorage.setItem(storageKey, JSON.stringify(session));
          toast.success(
            lang === "hi"
              ? `लॉगिन सफल! पार्टनर आईडी: ${session.partnerId}`
              : `Access Granted! Partner ID: ${session.partnerId}`,
            { icon: "🎉" }
          );
          onAuthenticated(session);
          return;
        }

        // Pending or Reupload Required
        if (data.application) {
          setActiveApplicantId(data.application.id);
          onPending(data.application);
          return;
        }
      }
    } catch {
      // Local fallback lookup
    }

    // Local KycContext Fallback Lookup
    const applicantType = isVendor ? "VENDOR" : "DRIVER";
    const localApp = applications.find(
      (a) =>
        a.applicantType === applicantType &&
        a.phone.replace(/\D/g, "").slice(-10) === cleanPhone
    );

    if (!localApp) {
      setNotFoundError(true);
      toast.error(
        lang === "hi"
          ? "यह नंबर पंजीकृत नहीं है — कृपया 2 मिनट का पेपर सत्यापन पूरा करें।"
          : "Number not registered yet — Complete 2-Minute Paper Verification to join."
      );
      setIsSubmitting(false);
      return;
    }

    if (localApp.status === "APPROVED") {
      const session: PartnerSession = {
        partnerId: localApp.partnerId || (isVendor ? "CN-VND-LKO-108" : "CN-DRV-LKO-204"),
        phone: cleanPhone,
        firmOrName: localApp.firmOrName,
        role,
        status: "APPROVED",
      };
      const storageKey = isVendor ? "conon_vendor_session" : "conon_driver_session";
      localStorage.setItem(storageKey, JSON.stringify(session));
      toast.success(
        lang === "hi"
          ? `लॉगिन सफल! पार्टनर आईडी: ${session.partnerId}`
          : `Access Granted! Partner ID: ${session.partnerId}`,
        { icon: "🎉" }
      );
      onAuthenticated(session);
      return;
    }

    // Still pending review or requires re-upload
    setActiveApplicantId(localApp.id);
    onPending(localApp);
    setIsSubmitting(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark ? "bg-[#070B14] text-slate-100" : "bg-[#F6F7F9] text-slate-900"
      }`}
    >
      {/* Top Header Bar */}
      <header
        className={`sticky top-0 z-40 px-4 sm:px-6 py-3 border-b backdrop-blur-md transition-colors ${
          isDark ? "bg-[#0B1120]/90 border-slate-800" : "bg-white/90 border-slate-200 shadow-xs"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <img
                src={`${import.meta.env.BASE_URL}images/conon-logo-transparent.png`}
                alt="CONON-NOW"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </a>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-700/60">
              <span
                className={`text-[10px] font-black uppercase tracking-wider ${
                  isVendor ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {isVendor ? "PARTNER DUKAAN OS" : "LOADER & RIDER COCKPIT"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                • LUCKNOW SUPPLY NETWORK
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <VendorLanguageToggle />
            <VendorThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl mx-auto space-y-6">
          {/* Brand Card Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
              {isVendor ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
              <span>
                {isVendor
                  ? lang === "hi"
                    ? "दुकानदार पार्टनर एक्सेस गेट"
                    : "Vendor Partner Access Gate"
                  : lang === "hi"
                  ? "ड्राइवर व लोडर एक्सेस गेट"
                  : "Driver & Loader Access Gate"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isVendor ? "CONON PARTNER DUKAAN OS" : "CONON LOADER & RIDER COCKPIT"}
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {lang === "hi"
                ? "सुरक्षित प्रवेश द्वार • केवल एडमिन द्वारा सत्यापित और अनुमत हार्डवेयर दुकानदारों और ड्राइवरों के लिए।"
                : "Strict Access Gate • Verified Hardware Shops & Commercial Loaders across Lucknow."}
            </p>
          </div>

          {/* Tab Switcher: Login vs Registration */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-1.5 flex items-center shadow-lg">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setNotFoundError(false);
              }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "login"
                  ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {lang === "hi" ? "मौजूदा पार्टनर लॉगिन" : "Existing Partner Login"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "register"
                  ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>
                {lang === "hi" ? "नया पार्टनर पंजीकरण (KYC)" : "New Registration (KYC)"}
              </span>
            </button>
          </div>

          {/* TAB 1: LOGIN FORM */}
          {activeTab === "login" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Not Registered Alert Box */}
              {notFoundError && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {lang === "hi"
                        ? "यह नंबर अभी तक पंजीकृत नहीं है"
                        : "Number not registered yet"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {lang === "hi"
                      ? "लखनऊ हार्डवेयर नेटवर्क में शामिल होने के लिए कृपया 2 मिनट का पेपर सत्यापन पूरा करें।"
                      : "Complete 2-minute paper verification to register your hardware counter or commercial vehicle."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNotFoundError(false);
                      setActiveTab("register");
                    }}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{lang === "hi" ? "2-मिनट सत्यापन शुरू करें" : "Start 2-Minute Paper Verification"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                {/* Mobile Number Input */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {lang === "hi" ? "पंजीकृत 10-अंकों का मोबाइल नंबर" : "Registered 10-Digit Mobile Number"}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <span>🇮🇳</span>
                      <span>+91</span>
                      <span className="text-slate-600">|</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      disabled={otpSent}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ""));
                        setNotFoundError(false);
                      }}
                      placeholder="98765 43210"
                      className="w-full pl-20 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 disabled:opacity-75"
                    />
                  </div>
                </div>

                {/* OTP Box (Reveals when otpSent is true) */}
                {otpSent && (
                  <div className="space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">
                        {lang === "hi" ? "4-अंकों का OTP कोड" : "4-Digit Verification OTP"}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
                      >
                        {lang === "hi" ? "OTP पुनः भेजें" : "Resend OTP"}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        maxLength={4}
                        required
                        autoFocus
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="1234"
                        className="w-full text-center tracking-widest text-lg font-mono font-bold py-3 bg-slate-950 border border-amber-400/50 rounded-2xl text-amber-300 placeholder-slate-700 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{lang === "hi" ? "परीक्षण कोड:" : "Test Sandbox Code:"} <strong className="text-amber-400 font-mono">1234</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                        className="text-slate-500 hover:text-slate-300 underline"
                      >
                        {lang === "hi" ? "नंबर बदलें" : "Change Number"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || cleanPhone.length !== 10}
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>{lang === "hi" ? "सत्यापित किया जा रहा है..." : "Verifying Access..."}</span>
                  ) : otpSent ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{lang === "hi" ? "सत्यापित करें और कंसोल खोलें" : "Verify & Access Console"}</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      <span>{lang === "hi" ? "OTP प्राप्त करें" : "Send Login OTP"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: REGISTRATION WIZARD */}
          {activeTab === "register" && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
              {isVendor ? (
                <VendorRegisterWizard onSuccess={(app) => { if (app) onPending(app); }} />
              ) : (
                <DriverRegisterWizard onSuccess={(app) => { if (app) onPending(app); }} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

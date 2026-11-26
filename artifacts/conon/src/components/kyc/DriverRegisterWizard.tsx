import React, { useState } from "react";
import {
  Truck,
  Bike,
  ShieldCheck,
  CreditCard,
  Scan,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Check,
  Camera,
  CloudRain,
  RotateCcw,
} from "lucide-react";
import { useKyc, type PartnerKycApplication } from "@/context/KycContext";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useDriverTheme } from "@/context/DriverThemeContext";
import { useDriverLang } from "@/context/DriverLanguageContext";

interface DriverRegisterWizardProps {
  onSuccess?: (app?: PartnerKycApplication) => void;
  onCancel?: () => void;
}

const LUCKNOW_ZONES = [
  "Alambagh / Transport Nagar",
  "Sushant Golf City / Shaheed Path",
  "Latouche Road / Charbagh",
  "Gomti Nagar / Vibhuti Khand",
  "Faizabad Road / Kamta Chauraha",
  "Sitapur Road / Engineering College",
];

export function DriverRegisterWizard({ onSuccess, onCancel }: DriverRegisterWizardProps) {
  const [, setLocation] = useLocation();
  const { submitDriverKyc, verifyPennyDrop, isSubmitting } = useKyc();
  const { isDark } = useDriverTheme();
  const { t, lang } = useDriverLang();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Driver Profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [zone, setZone] = useState("Alambagh / Transport Nagar");
  const [iceContact, setIceContact] = useState("");
  const [vehicleMode, setVehicleMode] = useState<"BIKE_EXPRESS" | "CHHOTA_HATHI">("CHHOTA_HATHI");
  const [vehiclePlate, setVehiclePlate] = useState("");

  // Step 2: Papers + Expiry + Selfie Liveness
  const [dlNumber, setDlNumber] = useState("");
  const [dlExpiry, setDlExpiry] = useState("");
  const [dlVerified, setDlVerified] = useState(false);
  const [dlScanning, setDlScanning] = useState(false);

  const [rcNumber, setRcNumber] = useState("");
  const [rcVerified, setRcVerified] = useState(false);
  const [rcScanning, setRcScanning] = useState(false);

  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [pucExpiry, setPucExpiry] = useState("");
  const [insVerified, setInsVerified] = useState(false);
  const [insScanning, setInsScanning] = useState(false);

  const [selfieVerified, setSelfieVerified] = useState(false);
  const [selfieScanning, setSelfieScanning] = useState(false);

  const [tarpaulinVerified, setTarpaulinVerified] = useState(false);
  const [tarpaulinScanning, setTarpaulinScanning] = useState(false);

  // Step 3: Bank & ₹1 Penny Drop
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [pennyDropPending, setPennyDropPending] = useState(false);
  const [pennyDropVerified, setPennyDropVerified] = useState(false);
  const [pennyDropRef, setPennyDropRef] = useState("");

  // Step 4: Pledge
  const [agreeOverload, setAgreeOverload] = useState(false);
  const [agreeRainCover, setAgreeRainCover] = useState(false);
  const [agreeOtpProof, setAgreeOtpProof] = useState(false);

  const handleSendOtp = () => {
    setOtpSent(true);
    toast.info(lang === "hi" ? "डेमो ओटीपी: 1234" : "Demo OTP: 1234");
    setTimeout(() => {
      setOtpVerified(true);
      toast.success(lang === "hi" ? "ओटीपी सफलतापूर्वक सत्यापित!" : "Phone verified via OTP!");
    }, 600);
  };

  const handlePennyDrop = async () => {
    setPennyDropPending(true);
    const res = await verifyPennyDrop({
      accountNumber,
      ifsc,
      upiId,
      holderName: name,
    });
    setPennyDropPending(false);
    if (res.success) {
      setPennyDropVerified(true);
      setPennyDropRef(res.refId);
      toast.success(res.message);
    }
  };

  const runOcr = (field: "DL" | "RC" | "INS" | "SELFIE" | "TIRPAL") => {
    if (field === "DL") {
      setDlScanning(true);
      setTimeout(() => {
        setDlScanning(false);
        setDlVerified(true);
        toast.success(
          lang === "hi"
            ? "सारथी पोर्टल: ड्राइविंग लाइसेंस सत्यापित (UP32 20180049120 • वैध अगस्त 2031)"
            : "AI OCR: DL Verified (UP32 20180049120 • Valid until Aug 2031)"
        );
      }, 1000);
    } else if (field === "RC") {
      setRcScanning(true);
      setTimeout(() => {
        setRcScanning(false);
        setRcVerified(true);
        toast.success(
          lang === "hi"
            ? "वाहन पोर्टल: कमर्शियल आरसी सत्यापित (Tata Ace Gold • UP 32 EL 7710)"
            : "AI OCR: Commercial RC Verified (Tata Motors Ace Gold • UP 32 EL 7710)"
        );
      }, 1000);
    } else if (field === "INS") {
      setInsScanning(true);
      setTimeout(() => {
        setInsScanning(false);
        setInsVerified(true);
        toast.success(
          lang === "hi"
            ? "गुड्स कैरियर इन्शुरन्स 20 Nov 2026 तक वैध (NIC-COMM-9918231)"
            : "AI OCR: Goods Insurance Valid until 20 Nov 2026 (NIC-COMM-9918231)"
        );
      }, 1000);
    } else if (field === "SELFIE") {
      setSelfieScanning(true);
      setTimeout(() => {
        setSelfieScanning(false);
        setSelfieVerified(true);
        toast.success(
          lang === "hi"
            ? "लाइव सेल्फी मिलान: ड्राइविंग लाइसेंस फोटो से 99% मेल खाता है"
            : "AI Liveness Check: 99% Match with Driving License Photo"
        );
      }, 1000);
    } else if (field === "TIRPAL") {
      setTarpaulinScanning(true);
      setTimeout(() => {
        setTarpaulinScanning(false);
        setTarpaulinVerified(true);
        toast.success(
          lang === "hi"
            ? "वाटरप्रूफ तिरपाल प्रमाणित: मानसून और बारिश के लिए पूरी तरह तैयार"
            : "AI Vision: Heavy Waterproof Tirpal Inspected • Monsoon Ready"
        );
      }, 1000);
    }
  };

  const handleFinalSubmit = async () => {
    if (!agreeOverload || !agreeRainCover || !agreeOtpProof) {
      toast.error(
        lang === "hi"
          ? "कृपया फ्लीट आचार संहिता के सभी नियमों को स्वीकार करें।"
          : "Please agree to all fleet code pledges."
      );
      return;
    }

    const payload = {
      name,
      phone,
      zone,
      vehicleMode,
      vehiclePlate,
      bankAccount: accountNumber,
      bankIfsc: ifsc,
      bankUpi: upiId,
      insuranceExpiry,
      dlExpiry,
      pucExpiry,
      documents: [
        {
          docType: "DRIVING_LICENCE" as const,
          docName: `Commercial Driving License (${dlNumber})`,
          docUrl: "/images/kyc/sample-dl.webp",
          extractedNumber: dlNumber,
          extractedName: name.toUpperCase(),
          extractedExpiry: dlExpiry,
        },
        {
          docType: "VEHICLE_RC" as const,
          docName: `Commercial Vehicle RC (${vehiclePlate})`,
          docUrl: "/images/kyc/sample-rc.webp",
          extractedNumber: vehiclePlate,
          extractedName: name.toUpperCase(),
        },
        {
          docType: "INSURANCE_PUC" as const,
          docName: `Goods Carrier Insurance Policy (${insuranceNumber})`,
          docUrl: "/images/kyc/sample-insurance.webp",
          extractedNumber: insuranceNumber,
          extractedExpiry: insuranceExpiry,
        },
        {
          docType: "SELFIE_LIVENESS" as const,
          docName: "Driver Live Selfie with Vehicle",
          docUrl: "/images/kyc/sample-selfie.webp",
        },
        {
          docType: "TIRPAL_WATERPROOF" as const,
          docName: "Heavy Heavy-Duty Tarpaulin Proof",
          docUrl: "/images/kyc/sample-tarpaulin.webp",
        },
      ],
    };

    const created = await submitDriverKyc(payload);
    if (onSuccess) {
      onSuccess(created);
    } else {
      setLocation("/driver");
    }
  };

  return (
    <div
      className={`w-full max-w-4xl mx-auto rounded-3xl p-4 sm:p-8 border transition-colors duration-200 ${
        isDark
          ? "bg-[#0F172A] border-slate-800 text-slate-100 shadow-2xl"
          : "bg-white border-slate-200 text-slate-900 shadow-xl"
      }`}
    >
      {/* HEADER */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 pb-6 border-b ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              className={`text-xl sm:text-2xl font-black tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {t("kycWizardTitle", "CONON Driver & Loader Fleet Onboarding")}
            </h1>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {t(
                "kycWizardSubtitle",
                "Register Tata Ace / Bike Express • Live AI Paper Verification • Instant Per-Trip UPI Payout"
              )}
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            {t("cancelBtn", "Cancel")}
          </button>
        )}
      </div>

      {/* 4-STEP PROGRESS */}
      <div className={`py-6 border-b ${isDark ? "border-slate-800/80" : "border-slate-200"}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[
            { n: 1, title: t("step1Title", "1. Profile & Vehicle"), icon: Truck },
            { n: 2, title: t("step2Title", "2. RTO Papers & Selfie"), icon: Scan },
            { n: 3, title: t("step3Title", "3. ₹1 Penny-Drop"), icon: CreditCard },
            { n: 4, title: t("step4Title", "4. Fleet Pledge"), icon: ShieldCheck },
          ].map((s) => {
            const isDone = step > s.n;
            const isCurrent = step === s.n;
            return (
              <button
                key={s.n}
                type="button"
                onClick={() => setStep(s.n as any)}
                className={`flex items-center gap-2 p-2.5 rounded-2xl text-left transition cursor-pointer border ${
                  isCurrent
                    ? isDark
                      ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm"
                      : "bg-emerald-50 border-emerald-500/50 text-emerald-800 shadow-xs"
                    : isDone
                    ? isDark
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-emerald-50/60 border-emerald-200 text-emerald-700"
                    : isDark
                    ? "bg-slate-900/50 border-slate-800/60 text-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    isCurrent
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : isDark
                      ? "bg-slate-800 text-slate-400"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.n}
                </div>
                <div className="truncate">
                  <p className="text-xs font-black truncate">{s.title}</p>
                  <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {isDone
                      ? lang === "hi"
                        ? "सत्यापित"
                        : "Verified"
                      : isCurrent
                      ? lang === "hi"
                        ? "वर्तमान कदम"
                        : "Active Step"
                      : lang === "hi"
                      ? "लंबित"
                      : "Pending"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT */}
      <div className="py-6">
        {/* STEP 1: DRIVER PROFILE & VEHICLE LOCK */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("driverNameLabel", "Driver Partner Full Name (As per DL)")} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder="Mohd. Rizwan Khan"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("mobileOtpLabel", "Mobile Number (OTP Verified)")} *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                    }`}
                    placeholder="+91 98390 12398"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      otpVerified
                        ? isDark
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-sm"
                    }`}
                  >
                    {otpVerified
                      ? lang === "hi"
                        ? "✓ सत्यापित"
                        : "✓ Verified"
                      : lang === "hi"
                      ? "1-टैप ओटीपी (1234)"
                      : "1-Tap OTP (1234)"}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("operatingZoneLabel", "Primary Lucknow Base Corridor")} *
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  {LUCKNOW_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("emergencyContactLabel", "Emergency ICE Contact (Family Member)")} *
                </label>
                <input
                  type="text"
                  value={iceContact}
                  onChange={(e) => setIceContact(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder="Brother: Irfan Khan (+91 98390 99812)"
                />
              </div>
            </div>

            {/* Vehicle Type Selector */}
            <div>
              <label
                className={`block text-xs font-bold mb-2 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {t("vehicleClassLabel", "Choose Vehicle Category & Payload")} *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVehicleMode("CHHOTA_HATHI")}
                  className={`p-4 rounded-2xl text-left border transition flex items-start gap-3 cursor-pointer ${
                    vehicleMode === "CHHOTA_HATHI"
                      ? isDark
                        ? "bg-emerald-500/15 border-emerald-500/50 text-white ring-1 ring-emerald-500/30"
                        : "bg-emerald-50 border-emerald-500 text-slate-900 ring-1 ring-emerald-500/30 shadow-xs"
                      : isDark
                      ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                      {lang === "hi"
                        ? "4-पहिया छोटा हाथी / टाटा ऐस पिकअप"
                        : "4W Chhota Hathi / Tata Ace Pickup"}
                    </p>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {lang === "hi"
                        ? "1.5 टन तक लोड • सीमेंट, सरिया, मोरंग, ईंटें • अधिक ट्रिप भाड़ा"
                        : "Up to 1.5 Ton Payload • Cement, TMT Steel, Sand, Bricks • Higher Per-Trip Kamai"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleMode("BIKE_EXPRESS")}
                  className={`p-4 rounded-2xl text-left border transition flex items-start gap-3 cursor-pointer ${
                    vehicleMode === "BIKE_EXPRESS"
                      ? isDark
                        ? "bg-amber-400/15 border-amber-400/50 text-white ring-1 ring-amber-400/30"
                        : "bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-500/30 shadow-xs"
                      : isDark
                      ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                      {lang === "hi"
                        ? "2-पहिया बाइक एक्सप्रेस (क्विक रन)"
                        : "2W Bike Express (Quick Runs)"}
                    </p>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {lang === "hi"
                        ? "30 किग्रा तक लोड • फिटिंग्स, एडहेसिव, टूल्स, लॉक • तेज ट्रैफिक नेविगेशन"
                        : "Under 30kg Payload • Fittings, Adhesives, Tools, Locks • Fast Traffic Navigation"}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1.5 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {t("vehiclePlateLabel", "Vehicle Registration Plate Number")} *
              </label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                className={`w-full max-w-sm px-4 py-2.5 rounded-xl border text-sm font-mono uppercase transition focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-emerald-300"
                    : "bg-slate-50 border-slate-300 text-emerald-700 font-bold"
                }`}
                placeholder="UP 32 EL 7710"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition"
              >
                <span>
                  {lang === "hi"
                    ? "कागजात और सेल्फी सत्यापन पर जाएं"
                    : "Continue to RTO Papers & Selfie"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RTO PAPERS + SELFIE LIVENESS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* DL Card */}
              <div
                className={`border rounded-2xl p-4 flex flex-col justify-between transition ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-black flex items-center gap-1.5 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      {t("dlNumberLabel", "1. Commercial Driving License (DL)")} *
                    </span>
                    {dlVerified && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {lang === "hi" ? "✓ वैध (अगस्त 2031)" : "✓ Valid (Aug 2031)"}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={dlNumber}
                    onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase mb-2 ${
                      isDark
                        ? "bg-slate-950 border-slate-700 text-emerald-300"
                        : "bg-white border-slate-300 text-emerald-700 font-bold"
                    }`}
                  />
                  <div
                    className={`flex items-center gap-2 text-[11px] ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    <span>{lang === "hi" ? "समाप्ति तिथि:" : "Expiry Date:"}</span>
                    <input
                      type="date"
                      value={dlExpiry}
                      onChange={(e) => setDlExpiry(e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-mono border ${
                        isDark
                          ? "bg-slate-950 border-slate-700 text-white"
                          : "bg-white border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => runOcr("DL")}
                    disabled={dlScanning}
                    className={`w-full py-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs"
                    }`}
                  >
                    <Scan className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      {dlScanning
                        ? lang === "hi"
                          ? "सारथी डीएल पोर्टल से जांच जारी…"
                          : "Scanning Sarathi DL Portal…"
                        : lang === "hi"
                        ? "1-टैप एआई ओसीआर स्कैन / सैंपल डीएल"
                        : "1-Tap OCR Scan / Sample DL"}
                    </span>
                  </button>
                </div>
              </div>

              {/* RC Card */}
              <div
                className={`border rounded-2xl p-4 flex flex-col justify-between transition ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-black flex items-center gap-1.5 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Truck className="w-4 h-4 text-indigo-500" />
                      {t("rcNumberLabel", "2. Commercial Vehicle RC")} *
                    </span>
                    {rcVerified && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {lang === "hi" ? "✓ 98% मिलान" : "✓ 98% Match"}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={rcNumber}
                    onChange={(e) => setRcNumber(e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono uppercase mb-2 ${
                      isDark
                        ? "bg-slate-950 border-slate-700 text-indigo-300"
                        : "bg-white border-slate-300 text-indigo-700 font-bold"
                    }`}
                  />
                  <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {lang === "hi"
                      ? "चेसिस व इंजन नंबर सत्यापित • वाहन डेटाबेस से मिलान"
                      : "Chassis & Engine Verified • Vahan Database Matched"}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => runOcr("RC")}
                    disabled={rcScanning}
                    className={`w-full py-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs"
                    }`}
                  >
                    <Scan className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      {rcScanning
                        ? lang === "hi"
                          ? "वाहन पोर्टल से आरसी जांच जारी…"
                          : "Checking Vahan Portal…"
                        : lang === "hi"
                        ? "1-टैप आरसी स्कैन / सैंपल आरसी"
                        : "1-Tap OCR Scan / Sample RC"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Insurance & PUC */}
              <div
                className={`border rounded-2xl p-4 flex flex-col justify-between transition ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-black flex items-center gap-1.5 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      {t("insuranceNumberLabel", "3. Commercial Goods Insurance & PUC")} *
                    </span>
                    {insVerified && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {lang === "hi" ? "✓ वैध (214 दिन शेष)" : "✓ Valid (214d left)"}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={insuranceNumber}
                    onChange={(e) => setInsuranceNumber(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono mb-2 ${
                      isDark
                        ? "bg-slate-950 border-slate-700 text-amber-300"
                        : "bg-white border-slate-300 text-amber-700 font-bold"
                    }`}
                  />
                  <div
                    className={`grid grid-cols-2 gap-2 text-[10px] ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    <div>
                      <span>{lang === "hi" ? "बीमा समाप्ति:" : "Insurance Expiry:"}</span>
                      <input
                        type="date"
                        value={insuranceExpiry}
                        onChange={(e) => setInsuranceExpiry(e.target.value)}
                        className={`w-full border px-2 py-1 rounded text-xs font-mono mt-0.5 ${
                          isDark
                            ? "bg-slate-950 border-slate-700 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                    <div>
                      <span>{lang === "hi" ? "पीयूसी समाप्ति:" : "PUC Expiry:"}</span>
                      <input
                        type="date"
                        value={pucExpiry}
                        onChange={(e) => setPucExpiry(e.target.value)}
                        className={`w-full border px-2 py-1 rounded text-xs font-mono mt-0.5 ${
                          isDark
                            ? "bg-slate-950 border-slate-700 text-white"
                            : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => runOcr("INS")}
                    disabled={insScanning}
                    className={`w-full py-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs"
                    }`}
                  >
                    <Scan className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {insScanning
                        ? lang === "hi"
                          ? "बीमा पॉलिसी सत्यापित हो रही है…"
                          : "Validating Insurance Policy…"
                        : lang === "hi"
                        ? "1-टैप बीमा स्कैन व अपलोड"
                        : "1-Tap Scan / Upload Insurance"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Selfie Liveness & Tarpaulin Proof */}
              <div
                className={`border rounded-2xl p-4 flex flex-col justify-between transition ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-black flex items-center gap-1.5 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      <Camera className="w-4 h-4 text-emerald-500" />
                      {t("driverSelfieLabel", "4. Live Selfie & Waterproof Tirpal")} *
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {lang === "hi" ? "✓ 99% चेहरा मिलान" : "✓ 99% Face Match"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 h-20">
                    <div
                      className={`rounded-xl overflow-hidden relative border ${
                        isDark ? "bg-slate-950 border-slate-800" : "bg-slate-200 border-slate-300"
                      }`}
                    >
                      <img
                        src="/images/kyc/sample-selfie.webp"
                        alt="Selfie"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 text-[8px] bg-slate-950/80 px-1 text-emerald-300 rounded font-mono">
                        Liveness 99%
                      </span>
                    </div>
                    <div
                      className={`rounded-xl overflow-hidden relative border ${
                        isDark ? "bg-slate-950 border-slate-800" : "bg-slate-200 border-slate-300"
                      }`}
                    >
                      <img
                        src="/images/kyc/sample-tarpaulin.webp"
                        alt="Tarpaulin"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 text-[8px] bg-slate-950/80 px-1 text-cyan-300 rounded font-mono">
                        Tirpal Ready
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => runOcr("SELFIE")}
                    disabled={selfieScanning}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs"
                    }`}
                  >
                    <Camera className="w-3 h-3 text-emerald-500" />
                    <span>{lang === "hi" ? "सेल्फी जांच" : "Selfie Liveness"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => runOcr("TIRPAL")}
                    disabled={tarpaulinScanning}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs"
                    }`}
                  >
                    <CloudRain className="w-3 h-3 text-cyan-500" />
                    <span>{lang === "hi" ? "तिरपाल प्रमाण" : "Tirpal Proof"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === "hi" ? "विवरण पर वापस" : "Back to Profile"}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition"
              >
                <span>
                  {lang === "hi" ? "पेनी-ड्रॉप बैंक सेटअप पर जाएं" : "Continue to ₹1 Penny-Drop"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BANK & ₹1 PENNY DROP */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div
              className={`border rounded-2xl p-4 transition ${
                isDark
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                  : "bg-emerald-50 border-emerald-300 text-emerald-900"
              }`}
            >
              <h3 className="text-sm font-black flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                {lang === "hi"
                  ? "ड्राइवर त्वरित प्रति-ट्रिप भुगतान खाता (यूपीआई / बैंक)"
                  : "Driver Instant Per-Trip Payout Account (UPI / Bank)"}
              </h3>
              <p className={`text-xs mt-1 ${isDark ? "text-emerald-200/80" : "text-emerald-800"}`}>
                {lang === "hi"
                  ? "ग्राहक द्वारा साइट पर डिलीवरी ओटीपी साझा करते ही आपकी ट्रिप कमाई + पल्लेदारी सीधे इस खाते में भेजी जाएगी।"
                  : "Your delivery fee + palledari unloading bonus is transferred straight to this account the moment the customer shares the delivery OTP at the site."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("bankAccountLabel", "Savings Bank Account Number")} *
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900 font-semibold"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("ifscLabel", "Bank IFSC Code (Auto Branch Check)")} *
                </label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono uppercase transition focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-emerald-300"
                      : "bg-slate-50 border-slate-300 text-emerald-700 font-bold"
                  }`}
                />
                <p className={`text-[10px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  State Bank of India • Alambagh Branch
                </p>
              </div>

              <div className="col-span-full">
                <label
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t("upiVpaLabel", "Instant UPI VPA (Google Pay / PhonePe)")} *
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-amber-300"
                      : "bg-slate-50 border-slate-300 text-amber-700 font-bold"
                  }`}
                />
              </div>
            </div>

            <div
              className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                    {lang === "hi"
                      ? "एनपीसीआई ₹1 पेनी-ड्रॉप बैंक सत्यापन"
                      : "NPCI ₹1 Penny-Drop Verification"}
                  </span>
                  {pennyDropVerified && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ {lang === "hi" ? "नाम मिलान सफल:" : "Name Matched:"} {name.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  IMPS Ref: {pennyDropRef} •{" "}
                  {lang === "hi" ? "बैंक खाता शत-प्रतिशत सक्रिय" : "Bank Account 100% Active"}
                </p>
              </div>

              <button
                type="button"
                onClick={handlePennyDrop}
                disabled={pennyDropPending}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition shadow-md shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {pennyDropPending ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("pennyDropPending", "Verifying NPCI…")}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {lang === "hi"
                        ? "1-टैप बैंक खाता पुनः सत्यापित करें"
                        : "1-Tap Re-Verify Penny Drop"}
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === "hi" ? "कागजात पर वापस" : "Back to Papers"}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition"
              >
                <span>{lang === "hi" ? "सुरक्षा शपथ पर जाएं" : "Continue to Fleet Pledge"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FLEET PLEDGE & GO LIVE */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div
              className={`border rounded-2xl p-5 space-y-4 transition ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <h3
                className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                {t("slaPledgeTitle", "CONON Lucknow Driver Partner Code of Conduct")}
              </h3>

              <div className="space-y-3 text-xs">
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    isDark
                      ? "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreeOverload}
                    onChange={(e) => setAgreeOverload(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {lang === "hi"
                        ? "जीरो ओवरलोडिंग व सड़क सुरक्षा गारंटी"
                        : "Zero Overloading & Road Safety Guarantee"}
                    </span>
                    <p className={`mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("slaPledge1")}
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    isDark
                      ? "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreeRainCover}
                    onChange={(e) => setAgreeRainCover(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {lang === "hi"
                        ? "बारिश सुरक्षा व वाटरप्रूफ तिरपाल नियम"
                        : "Monsoon & Rain-Shield Tirpal Compliance"}
                    </span>
                    <p className={`mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("slaPledge2")}
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    isDark
                      ? "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreeOtpProof}
                    onChange={(e) => setAgreeOtpProof(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {lang === "hi"
                        ? "ग्राहक डिलीवरी ओटीपी व अनलोडिंग फोटो प्रमाण"
                        : "Delivery OTP & Unloading Photo Proof"}
                    </span>
                    <p className={`mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("slaPledge3")}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === "hi" ? "बैंक सेटअप पर वापस" : "Back to Bank Setup"}</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? t("submittingKyc", "Submitting Application…")
                    : t("submitKycBtn", "Complete Registration & Go Live 🚀")}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

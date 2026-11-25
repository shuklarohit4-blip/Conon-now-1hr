import React, { useState } from "react";
import {
  Store,
  MapPin,
  CheckCircle2,
  FileCheck2,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Phone,
  Scan,
  CreditCard,
  QrCode,
  Check,
  AlertCircle,
  Clock,
  Truck,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useKyc, KycDocument } from "@/context/KycContext";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useVendorTheme } from "@/context/VendorThemeContext";
import { useVendorLang } from "@/context/VendorLanguageContext";

interface VendorRegisterWizardProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LUCKNOW_ZONES = [
  "Sushant Golf City / Shaheed Path",
  "Latouche Road Hardware Mandi",
  "Aminabad Building Market",
  "Alambagh / Transport Nagar",
  "Gomti Nagar Extension",
  "Faizabad Road / Chinhat",
  "Sitapur Road / Madiaon",
  "Vrindavan Yojna / Raebareli Rd",
];

const CATEGORIES_LIST = [
  { id: "CEMENT", label: "Cement (OPC 53 / PPC)", icon: "🏗️" },
  { id: "STEEL", label: "TMT Steel (Fe 550D / Binding Wire)", icon: "🔩" },
  { id: "PIPES", label: "CPVC & UPVC Plumbing Pipes", icon: "🚰" },
  { id: "BRICKS", label: "Red Bricks & Sand / Morang", icon: "🧱" },
  { id: "PAINTS", label: "Paints, Putty & Waterproofing", icon: "🎨" },
  { id: "HARDWARE", label: "Heavy Hardware & Door Locks", icon: "🔒" },
];

export function VendorRegisterWizard({ onSuccess, onCancel }: VendorRegisterWizardProps) {
  const [, setLocation] = useLocation();
  const { isDark } = useVendorTheme();
  const { t, lang } = useVendorLang();
  const { submitVendorKyc, verifyPennyDrop, isSubmitting } = useKyc();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Dukaan Identity
  const [firmName, setFirmName] = useState("Awadh Building Solutions & Pipe Depot");
  const [ownerName, setOwnerName] = useState("Anurag Mishra");
  const [phone, setPhone] = useState("+91 94150 88219");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [zone, setZone] = useState("Sushant Golf City / Shaheed Path");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "CEMENT",
    "STEEL",
    "PIPES",
    "BRICKS",
  ]);
  const [loadingBayAccess, setLoadingBayAccess] = useState<"NARROW_LANE" | "LOADER_FRIENDLY">("LOADER_FRIENDLY");
  const [gpsCaptured, setGpsCaptured] = useState(true);
  const [shopCoords, setShopCoords] = useState<{ lat: number; lng: number }>({
    lat: 26.7812,
    lng: 80.9981,
  });

  // Step 2: Papers with AI OCR
  const [gstin, setGstin] = useState("09AAECB1289R1Z4");
  const [gstScanning, setGstScanning] = useState(false);
  const [gstVerified, setGstVerified] = useState(true);

  const [pan, setPan] = useState("AAECB1289R");
  const [panScanning, setPanScanning] = useState(false);
  const [panVerified, setPanVerified] = useState(true);

  const [signPhoto, setSignPhoto] = useState("/images/kyc/sample-shop-sign.webp");
  const [signScanning, setSignScanning] = useState(false);
  const [signVerified, setSignVerified] = useState(true);

  const [brandProof, setBrandProof] = useState("/images/kyc/sample-dealership.webp");
  const [brandScanning, setBrandScanning] = useState(false);
  const [brandVerified, setBrandVerified] = useState(true);

  // Step 3: Bank & ₹1 Penny-Drop
  const [accountNumber, setAccountNumber] = useState("910283746182");
  const [confirmAccount, setConfirmAccount] = useState("910283746182");
  const [ifsc, setIfsc] = useState("HDFC0001824");
  const [bankBranch, setBankBranch] = useState("HDFC Bank, Hazratganj Branch, Lucknow");
  const [upiId, setUpiId] = useState("awadhpipe@okaxis");
  const [pennyDropPending, setPennyDropPending] = useState(false);
  const [pennyDropVerified, setPennyDropVerified] = useState(true);
  const [pennyDropRef, setPennyDropRef] = useState("NPCI-IMPS-9982410");

  // Step 4: Digital SLA & E-Sign
  const [agreeSla, setAgreeSla] = useState(true);
  const [agreeIsi, setAgreeIsi] = useState(true);
  const [agreeHandshake, setAgreeHandshake] = useState(true);

  // OTP Simulation
  const handleSendOtp = () => {
    setOtpSent(true);
    toast.info("Demo OTP: 1234", {
      description: lang === "hi" ? "परीक्षण हेतु स्वतः भरा जा रहा है।" : "Auto-filling for test convenience.",
    });
    setOtpCode("1234");
    setTimeout(() => {
      setOtpVerified(true);
      toast.success(lang === "hi" ? "ओटीपी से मोबाइल सत्यापित!" : "Phone verified via OTP!");
    }, 800);
  };

  // GPS Simulation
  const handleCaptureGps = () => {
    toast.loading(lang === "hi" ? "लखनऊ मोबाइल टावर से जीपीएस स्थिति खोजी जा रही है..." : "Triangulating GPS coordinates from Lucknow towers…");
    setTimeout(() => {
      toast.dismiss();
      setShopCoords({ lat: 26.7812, lng: 80.9981 });
      setGpsCaptured(true);
      toast.success(lang === "hi" ? "✓ जीपीएस लोकेशन लॉक: 26.7812° N, 80.9981° E" : "✓ GPS Pin Locked: 26.7812° N, 80.9981° E (Accuracy: 4 meters)");
    }, 900);
  };

  // Toggle Category
  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  // Run AI OCR Scanner Simulation
  const runOcrScan = (docType: "GST" | "PAN" | "SIGN" | "BRAND") => {
    if (docType === "GST") {
      setGstScanning(true);
      setTimeout(() => {
        setGstScanning(false);
        setGstVerified(true);
        toast.success(lang === "hi" ? "एआई ओसीआर: जीएसटीआईएन 09AAECB1289R1Z4 सत्यापित (98% प्रामाणिकता)" : "AI OCR: GSTIN 09AAECB1289R1Z4 Verified (98% Authenticity Score)");
      }, 1200);
    } else if (docType === "PAN") {
      setPanScanning(true);
      setTimeout(() => {
        setPanScanning(false);
        setPanVerified(true);
        toast.success(lang === "hi" ? "एआई ओसीआर: पैन AAECB1289R अनुराग मिश्रा के नाम से मैच!" : "AI OCR: Proprietor PAN AAECB1289R Matched with Anurag Mishra");
      }, 1200);
    } else if (docType === "SIGN") {
      setSignScanning(true);
      setTimeout(() => {
        setSignScanning(false);
        setSignVerified(true);
        toast.success(lang === "hi" ? "एआई विज़न: दुकान का साइनबोर्ड और जीपीएस लोकेशन सत्यापित" : "AI Vision: Physical Signboard Verified with GPS Location Match");
      }, 1200);
    } else if (docType === "BRAND") {
      setBrandScanning(true);
      setTimeout(() => {
        setBrandScanning(false);
        setBrandVerified(true);
        toast.success(lang === "hi" ? "एआई ओसीआर: अल्ट्राटेक व एस्ट्रेल डीलरशिप प्रमाण पत्र सत्यापित" : "AI OCR: UltraTech & Astral Dealership Letter Authenticated");
      }, 1200);
    }
  };

  // Run Penny-Drop
  const handlePennyDrop = async () => {
    if (!accountNumber || !ifsc) {
      toast.error(lang === "hi" ? "कृपया खाता संख्या और आईएफएससी कोड दर्ज करें" : "Please enter Account Number & IFSC code.");
      return;
    }
    setPennyDropPending(true);
    const res = await verifyPennyDrop({
      accountNumber,
      ifsc,
      upiId,
      holderName: ownerName,
    });
    setPennyDropPending(false);
    if (res.success) {
      setPennyDropVerified(true);
      setPennyDropRef(res.refId);
      toast.success(res.message);
    } else {
      toast.error(lang === "hi" ? "पेनी-ड्रॉप विफल रहा। बैंक विवरण जांचें।" : "Penny drop failed. Please check bank details.");
    }
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    if (!agreeSla || !agreeIsi || !agreeHandshake) {
      toast.error(lang === "hi" ? "कृपया सभी सेवा गुणवत्ता शर्तों पर सहमति दें" : "Please agree to all platform SLA pledges.");
      return;
    }

    const payload = {
      firmName,
      ownerName,
      phone,
      zone,
      loadingBayAccess,
      categories: selectedCategories,
      shopLat: shopCoords.lat,
      shopLng: shopCoords.lng,
      bankAccount: accountNumber,
      bankIfsc: ifsc,
      bankUpi: upiId,
      documents: [
        {
          docType: "GSTIN_CERTIFICATE" as const,
          docName: `GSTIN Registration Certificate (${gstin})`,
          docUrl: "/images/kyc/sample-gst-cert.webp",
          extractedNumber: gstin,
          extractedName: firmName.toUpperCase(),
        },
        {
          docType: "PAN_CARD" as const,
          docName: `Proprietor PAN Card (${pan})`,
          docUrl: "/images/kyc/sample-pan-card.webp",
          extractedNumber: pan,
          extractedName: ownerName.toUpperCase(),
        },
        {
          docType: "SIGNBOARD_PHOTO" as const,
          docName: "Physical Shop Front & Signboard Photo",
          docUrl: signPhoto,
        },
        {
          docType: "BRAND_DEALERSHIP" as const,
          docName: "UltraTech / Astral Authorized Dealership Letter",
          docUrl: brandProof,
          extractedNumber: "DL-UT-2025-881",
        },
      ],
    };

    await submitVendorKyc(payload);
    if (onSuccess) {
      onSuccess();
    } else {
      setLocation("/vendor");
    }
  };

  const themeCardClass = isDark
    ? "bg-[#0F172A] border-slate-800 text-slate-100 shadow-2xl"
    : "bg-white border-slate-200 text-slate-900 shadow-xl";

  const themeInnerClass = isDark
    ? "bg-slate-900/80 border-slate-800 text-slate-100"
    : "bg-slate-50 border-slate-200 text-slate-900";

  const themeInputClass = isDark
    ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500"
    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400";

  const themeSubtextClass = isDark ? "text-slate-400" : "text-slate-500";
  const themeTitleClass = isDark ? "text-white" : "text-slate-900";

  return (
    <div className={`w-full max-w-4xl mx-auto border rounded-3xl p-4 sm:p-8 transition-colors ${themeCardClass}`}>
      {/* HEADER */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 pb-6 border-b ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-400/20 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${themeTitleClass}`}>
              {t("kycWizardTitle", "Hardware Partner Dukaan Onboarding")}
            </h1>
            <p className={`text-xs ${themeSubtextClass}`}>
              {t("kycWizardSubtitle", "Join Lucknow's verified express building materials supply network in 4 simple steps")}
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            {lang === "hi" ? "रद्द करें" : "Cancel"}
          </button>
        )}
      </div>

      {/* 4-STEP PROGRESS BAR */}
      <div className={`py-6 border-b ${isDark ? "border-slate-800/80" : "border-slate-200"}`}>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {[
            { n: 1, title: lang === "hi" ? "1. दुकान व पिन" : "1. Dukaan & Pin", icon: Building2 },
            { n: 2, title: lang === "hi" ? "2. एआई पेपर जांच" : "2. AI Paper OCR", icon: Scan },
            { n: 3, title: lang === "hi" ? "3. ₹1 पेनी-ड्रॉप" : "3. ₹1 Penny-Drop", icon: CreditCard },
            { n: 4, title: lang === "hi" ? "4. शपथ व गो-लाइव" : "4. SLA & Go Live", icon: ShieldCheck },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = step > s.n;
            const isCurrent = step === s.n;
            return (
              <button
                key={s.n}
                type="button"
                onClick={() => setStep(s.n as any)}
                className={`flex items-center gap-2 p-2.5 rounded-2xl text-left transition cursor-pointer ${
                  isCurrent
                    ? isDark
                      ? "bg-amber-400/10 border border-amber-400/40 text-amber-300 shadow-sm"
                      : "bg-amber-50 border border-amber-400 text-amber-900 shadow-xs"
                    : isDone
                    ? isDark
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-emerald-50 border border-emerald-300 text-emerald-800"
                    : isDark
                    ? "bg-slate-900/50 border border-slate-800/60 text-slate-500"
                    : "bg-slate-100/60 border border-slate-200 text-slate-400"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    isCurrent
                      ? "bg-amber-400 text-slate-950"
                      : isDone
                      ? "bg-emerald-500 text-slate-950"
                      : isDark
                      ? "bg-slate-800 text-slate-400"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.n}
                </div>
                <div className="hidden sm:block truncate">
                  <p className="text-xs font-black truncate">{s.title}</p>
                  <p className={`text-[10px] ${themeSubtextClass}`}>
                    {isDone ? (lang === "hi" ? "सत्यापित" : "Completed") : isCurrent ? (lang === "hi" ? "सक्रिय चरण" : "Active Step") : (lang === "hi" ? "शेष" : "Pending")}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT */}
      <div className="py-6">
        {/* ══════════════════════════════════════════════════════════════════
            STEP 1: DUKAAN IDENTITY & GEO-PIN
        ══════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeTitleClass}`}>
                  {t("firmNameLabel", "Registered Firm / Dukaan Name")} *
                </label>
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-400 border ${themeInputClass}`}
                  placeholder="e.g. Awadh Building Solutions & Pipe Depot"
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeTitleClass}`}>
                  {t("ownerNameLabel", "Proprietor / Owner Full Name")} *
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-400 border ${themeInputClass}`}
                  placeholder="e.g. Anurag Mishra"
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeTitleClass}`}>
                  {t("phoneLabel", "Mobile Number (WhatsApp Enabled)")} *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-400 border ${themeInputClass}`}
                    placeholder="+91 94150 88219"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                      otpVerified
                        ? isDark
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-xs"
                    }`}
                  >
                    {otpVerified ? (lang === "hi" ? "✓ सत्यापित" : "✓ Verified") : t("sendOtpBtn", "Send OTP")}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeTitleClass}`}>
                  {t("zoneSelectLabel", "Operating Lucknow Hub Zone")} *
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-400 border ${themeInputClass}`}
                >
                  {LUCKNOW_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Supply Categories Multi-Select */}
            <div>
              <label className={`block text-xs font-bold mb-2 ${themeTitleClass}`}>
                {t("categoriesSelectLabel", "Product Categories Handled")} (Select all that apply) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES_LIST.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-3 rounded-2xl text-left text-xs font-bold transition flex items-center justify-between border cursor-pointer ${
                        isChecked
                          ? isDark
                            ? "bg-amber-400/15 border-amber-400/50 text-white"
                            : "bg-amber-50 border-amber-400 text-amber-950 shadow-xs"
                          : isDark
                          ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 ${
                          isChecked ? "bg-amber-400 text-slate-950 font-black" : "border border-slate-400"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GPS Geo-Pin & Loading Bay Access */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-2xl border ${themeInnerClass}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${themeTitleClass}`}>
                    <MapPin className="w-4 h-4 text-amber-500" />
                    {t("gpsLocationLabel", "GPS Pinpoint Location")}
                  </span>
                  {gpsCaptured && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {t("gpsCapturedBadge", "GPS Locked (4m)")}
                    </span>
                  )}
                </div>
                <p className={`text-xs font-mono mb-3 ${themeSubtextClass}`}>
                  {shopCoords.lat}° N, {shopCoords.lng}° E
                </p>
                <button
                  type="button"
                  onClick={handleCaptureGps}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                      : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === "hi" ? "दुकान का जीपीएस पिन दोबारा लें" : "Re-Capture Shop GPS"}</span>
                </button>
              </div>

              <div className={`p-4 rounded-2xl border ${themeInnerClass}`}>
                <label className={`block text-xs font-bold mb-2 flex items-center gap-1.5 ${themeTitleClass}`}>
                  <Truck className="w-4 h-4 text-indigo-500" />
                  {t("loadingBayLabel", "Loading Bay & Lane Width")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoadingBayAccess("NARROW_LANE")}
                    className={`p-2.5 rounded-xl text-left text-xs font-bold border transition cursor-pointer ${
                      loadingBayAccess === "NARROW_LANE"
                        ? isDark
                          ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                          : "bg-indigo-50 border-indigo-300 text-indigo-900"
                        : isDark
                        ? "bg-slate-900 border-slate-800 text-slate-400"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    <p className={`font-black ${themeTitleClass}`}>
                      {t("loadingBayNarrow", "Narrow Gali / 2-Wheeler (Under 20kg)")}
                    </p>
                    <p className={`text-[10px] ${themeSubtextClass}`}>Narrow Gali</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoadingBayAccess("LOADER_FRIENDLY")}
                    className={`p-2.5 rounded-xl text-left text-xs font-bold border transition cursor-pointer ${
                      loadingBayAccess === "LOADER_FRIENDLY"
                        ? isDark
                          ? "bg-amber-400/20 border-amber-400/50 text-amber-300"
                          : "bg-amber-50 border-amber-400 text-amber-900"
                        : isDark
                        ? "bg-slate-900 border-slate-800 text-slate-400"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    <p className={`font-black ${themeTitleClass}`}>
                      {t("loadingBayLoader", "Wide Road / 1.5-Ton Loader Friendly")}
                    </p>
                    <p className={`text-[10px] ${themeSubtextClass}`}>Chhota Hathi Ready</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
              >
                <span>{t("nextBtn", "Continue")} ➔</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 2: PAPER VERIFICATION WITH AI OCR X-RAY SCANNER
        ══════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs ${
                isDark
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-200"
                  : "bg-amber-50 border-amber-200 text-amber-950"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className={`font-bold ${themeTitleClass}`}>
                  {lang === "hi" ? "कोनोन एआई ओसीआर एक्स-रे पेपर सत्यापन" : "CONON AI OCR X-Ray Verification"}
                </p>
                <p className={`mt-0.5 ${themeSubtextClass}`}>
                  {t("kycStep2Desc", "Instant automated document scanning for GSTIN, PAN, signboard photo & brand dealership")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doc 1: GSTIN Certificate */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${themeInnerClass}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black flex items-center gap-1.5 ${themeTitleClass}`}>
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      1. {t("gstinLabel", "GSTIN Registration Number")} *
                    </span>
                    {gstVerified ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {t("aiOcrVerified", "✓ AI OCR Verified")} (98%)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-500">Required</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono uppercase mb-2 border ${
                      isDark
                        ? "bg-slate-950 border-slate-700 text-emerald-300"
                        : "bg-white border-slate-300 text-emerald-700"
                    }`}
                    placeholder="09AAECB1289R1Z4"
                  />
                  <p className={`text-[10px] ${themeSubtextClass}`}>
                    Matches: AWADH BUILDING SOLUTIONS • State Code 09 (Uttar Pradesh)
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => runOcrScan("GST")}
                    disabled={gstScanning}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs"
                    }`}
                  >
                    <Scan className="w-3 h-3 text-amber-500" />
                    <span>{gstScanning ? t("aiOcrScanning", "Scanning Document via OCR…") : (lang === "hi" ? "1-टैप स्कैन / सैंपल अपलोड" : "1-Tap Scan / Upload Sample")}</span>
                  </button>
                </div>
              </div>

              {/* Doc 2: Proprietor PAN Card */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${themeInnerClass}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black flex items-center gap-1.5 ${themeTitleClass}`}>
                      <CreditCard className="w-4 h-4 text-indigo-500" />
                      2. {t("panLabel", "Proprietor PAN Number")} *
                    </span>
                    {panVerified ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {t("aiOcrVerified", "✓ AI OCR Verified")} (96%)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-500">Required</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono uppercase mb-2 border ${
                      isDark
                        ? "bg-slate-950 border-slate-700 text-indigo-300"
                        : "bg-white border-slate-300 text-indigo-700"
                    }`}
                    placeholder="AAECB1289R"
                  />
                  <p className={`text-[10px] ${themeSubtextClass}`}>
                    Owner Name: ANURAG MISHRA • Tax ID verified
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => runOcrScan("PAN")}
                    disabled={panScanning}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs"
                    }`}
                  >
                    <Scan className="w-3 h-3 text-amber-500" />
                    <span>{panScanning ? t("aiOcrScanning", "Scanning Document via OCR…") : (lang === "hi" ? "1-टैप स्कैन / सैंपल अपलोड" : "1-Tap Scan / Upload Sample")}</span>
                  </button>
                </div>
              </div>

              {/* Doc 3: Physical Signboard Photo */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${themeInnerClass}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black flex items-center gap-1.5 ${themeTitleClass}`}>
                      <Store className="w-4 h-4 text-amber-500" />
                      3. {t("shopPhotoLabel", "Shopfront Photo with Signboard")} *
                    </span>
                    {signVerified && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ Geo-Tagged
                      </span>
                    )}
                  </div>
                  <div className={`h-20 rounded-xl border flex items-center justify-center text-xs overflow-hidden relative ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-300"
                  }`}>
                    <img
                      src={signPhoto}
                      alt="Shop Signboard"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <span className="absolute bottom-1 right-2 text-[9px] font-mono text-amber-500 bg-slate-950/80 px-1 rounded">
                      GPS: 26.7812° N, 80.9981° E
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => runOcrScan("SIGN")}
                    disabled={signScanning}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs"
                    }`}
                  >
                    <Upload className="w-3 h-3 text-amber-500" />
                    <span>{signScanning ? "Validating Geo-Tag…" : (lang === "hi" ? "साइनबोर्ड फोटो अपलोड करें" : "Upload Signboard Photo")}</span>
                  </button>
                </div>
              </div>

              {/* Doc 4: Authorized Dealership Letter */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${themeInnerClass}`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black flex items-center gap-1.5 ${themeTitleClass}`}>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      4. {t("dealershipProofLabel", "Authorized Brand Dealership Certificate")} *
                    </span>
                    {brandVerified && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ✓ 99% Verified
                      </span>
                    )}
                  </div>
                  <div className={`h-20 rounded-xl border flex items-center justify-center text-xs overflow-hidden relative ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-300"
                  }`}>
                    <img
                      src={brandProof}
                      alt="Dealership Proof"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <span className="absolute bottom-1 right-2 text-[9px] font-mono text-emerald-500 bg-slate-950/80 px-1 rounded">
                      UltraTech & Astral Dealer: DL-UT-2025-881
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => runOcrScan("BRAND")}
                    disabled={brandScanning}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs"
                    }`}
                  >
                    <Upload className="w-3 h-3 text-amber-500" />
                    <span>{brandScanning ? "Authenticating Letter…" : (lang === "hi" ? "डीलरशिप पत्र अपलोड करें" : "Upload Dealership Letter")}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("backBtn", "Back")}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
              >
                <span>{t("nextBtn", "Continue")} ➔</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 3: BANK SETTLEMENT & ₹1 PENNY-DROP
        ══════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div
              className={`p-4 rounded-2xl border ${
                isDark
                  ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-200"
                  : "bg-indigo-50 border-indigo-200 text-indigo-950"
              }`}
            >
              <h3 className={`text-sm font-black flex items-center gap-2 ${themeTitleClass}`}>
                <CreditCard className="w-4 h-4 text-amber-500" />
                {lang === "hi" ? "रियल-टाइम एस्क्रो भुगतान बैंक खाता व यूपीआई सेटअप" : "Real-Time Escrow Payout Bank Account & UPI Setup"}
              </h3>
              <p className={`text-xs mt-1 ${themeSubtextClass}`}>
                {t("instantVerificationNote", "We deposit ₹1 to immediately verify bank account matches GST registration name.")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeTitleClass}`}>
                  {t("accountNumberLabel", "Current / Savings Bank Account Number")} *
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-400 border ${themeInputClass}`}
                  placeholder="910283746182"
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeTitleClass}`}>
                  {t("confirmAccountLabel", "Re-Enter Bank Account Number")} *
                </label>
                <input
                  type="text"
                  value={confirmAccount}
                  onChange={(e) => setConfirmAccount(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-400 border ${themeInputClass}`}
                  placeholder="910283746182"
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeTitleClass}`}>
                  {t("ifscLabel", "Bank IFSC Code")} *
                </label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-amber-400 border ${themeInputClass}`}
                  placeholder="HDFC0001824"
                />
                <p className={`text-[10px] mt-1 ${themeSubtextClass}`}>{bankBranch}</p>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${themeTitleClass}`}>
                  {t("upiIdLabel", "Instant Payout UPI VPA")} *
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-400 border ${themeInputClass}`}
                  placeholder="awadhpipe@okaxis"
                />
                <p className={`text-[10px] mt-1 ${themeSubtextClass}`}>
                  Supports Google Pay, PhonePe, Paytm, BHIM UPI
                </p>
              </div>
            </div>

            {/* Penny-Drop Verification Card */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${themeInnerClass}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-500">
                    NPCI ₹1 Penny-Drop Bank Name Match
                  </span>
                  {pennyDropVerified && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ Holder Name Matched
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${themeSubtextClass}`}>
                  {lang === "hi"
                    ? "हम आईएमपीएस के माध्यम से ₹1 जमा करते हैं। बैंक से आधिकारिक पंजीकृत खाता धारक नाम तुरंत सत्यापित होता है।"
                    : "We deposit ₹1 into your account via IMPS. Bank returns official registered account holder name."}
                </p>
                {pennyDropVerified && (
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    ✓ NPCI Ref: {pennyDropRef} • Beneficiary: {ownerName.toUpperCase()}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handlePennyDrop}
                disabled={pennyDropPending}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
              >
                {pennyDropPending ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t("pennyDropPending", "Pinging NPCI Gateway…")}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t("pennyDropBtn", "⚡ Verify via ₹1 Penny-Drop")}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("backBtn", "Back")}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
              >
                <span>{t("nextBtn", "Continue")} ➔</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            STEP 4: DIGITAL SLA PLEDGE & SUBMISSION
        ══════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className={`p-5 rounded-2xl border space-y-4 ${themeInnerClass}`}>
              <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${themeTitleClass}`}>
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                {t("slaPledgeTitle", "CONON Lucknow Partner Dukaan Quality SLA Pledge")}
              </h3>

              <div className="space-y-3 text-xs">
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    isDark ? "bg-slate-950/60 border-slate-800/80" : "bg-white border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreeSla}
                    onChange={(e) => setAgreeSla(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <span className={`font-bold ${themeTitleClass}`}>
                      {lang === "hi" ? "180-सेकंड डिस्पैच लोडिंग गारंटी" : "180-Second Dispatch Packing SLA"}
                    </span>
                    <p className={`mt-0.5 ${themeSubtextClass}`}>
                      {t("slaPledge1", "I guarantee my shop counter will pack and stage incoming orders for loading within 180 seconds of acceptance.")}
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    isDark ? "bg-slate-950/60 border-slate-800/80" : "bg-white border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreeIsi}
                    onChange={(e) => setAgreeIsi(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <span className={`font-bold ${themeTitleClass}`}>
                      {lang === "hi" ? "100% असली व आईएसआई प्रमाणित सामग्री" : "100% Genuine BIS / ISI Certified Materials Only"}
                    </span>
                    <p className={`mt-0.5 ${themeSubtextClass}`}>
                      {t("slaPledge2", "Zero tolerance for sub-standard, duplicate, or counterfeit materials. Fresh manufacturing batch date warranty.")}
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    isDark ? "bg-slate-950/60 border-slate-800/80" : "bg-white border-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreeHandshake}
                    onChange={(e) => setAgreeHandshake(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <span className={`font-bold ${themeTitleClass}`}>
                      {lang === "hi" ? "राइडर हैंडशेक लोडिंग ओटीपी सत्यापन" : "Rider Handshake Loading OTP Verification"}
                    </span>
                    <p className={`mt-0.5 ${themeSubtextClass}`}>
                      {t("slaPledge3", "Materials will only be handed over after rider confirms the Loading Bay Handshake OTP.")}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Summary preview */}
            <div
              className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                isDark
                  ? "bg-indigo-950/30 border-indigo-800/30"
                  : "bg-indigo-50 border-indigo-200"
              }`}
            >
              <div>
                <p className="font-bold text-indigo-600 dark:text-indigo-300">
                  {lang === "hi" ? "आवेदन जमा करने हेतु तैयार" : "Application Ready for Submission"}
                </p>
                <p className={`mt-0.5 ${themeSubtextClass}`}>
                  {firmName} • {ownerName} • {zone} • Bank: {bankBranch}
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                AI Score: 97% • Penny-Drop Matched
              </span>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("backBtn", "Back")}</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? t("submittingKyc", "Submitting Application…")
                    : t("submitKycBtn", "Complete Registration & Start Taking Orders")}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorRegisterWizard;

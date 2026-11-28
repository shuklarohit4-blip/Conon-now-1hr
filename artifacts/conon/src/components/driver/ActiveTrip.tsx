import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Navigation,
  QrCode,
  CheckCircle2,
  Camera,
  ShieldCheck,
  MapPin,
  PackageCheck,
  Loader2,
  X,
} from "lucide-react";
import { useDriverLanguage } from "@/context/DriverLanguageContext";
import { useDriver } from "@/context/DriverContext";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import { generateUtr } from "@/services/treasuryEngine";
import { evaluateDispatchCompliance } from "@/utils/lucknowTrafficPolicy";
import { PoliceCheckingFolderModal } from "./PoliceCheckingFolderModal";
import { playOrderChime } from "@/lib/sound";
import { GREEN, GREEN_DARK, YELLOW, inr } from "./theme";

/* Module 3 — the 3-step Active Trip flow:
   1) Pickup  → Navigate to Pickup → Scan QR to Load → (advance)
   2) Transit → Navigate to Site   → Arrived at Location → (advance)
   3) Drop    → Upload PoD photo + verify Customer OTP → Complete Trip
   Each step gates the next, so the journey can only move forward when the real
   action is done. No reloads — everything is driven by DriverContext state. */
export function ActiveTrip({ onComplete }: { onComplete: (earned: number) => void }) {
  const { t } = useDriverLanguage();
  const { activeTrip, tripStep, completeTrip } = useDriver();

  if (!activeTrip) return null;

  const stepIndex = tripStep === "pickup" ? 1 : tripStep === "transit" ? 2 : 3;

  return (
    <div className="flex flex-col h-full">
      {/* Progress header */}
      <div className="shrink-0 px-5 pt-4 pb-3 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-black uppercase tracking-wider text-slate-400">
            {t("step")} {stepIndex} / 3
          </p>
          <div className="flex items-center gap-2 text-slate-900">
            <PackageCheck className="w-4 h-4" style={{ color: GREEN }} />
            <span className="text-[14px] font-black">{activeTrip.qty}</span>
            <span className="text-[13px] font-bold text-slate-400">· {inr(activeTrip.earn)}</span>
          </div>
        </div>
        <div className="flex gap-1.5 mt-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-2 flex-1 rounded-full transition-colors"
              style={{ background: n <= stepIndex ? GREEN : "#e2e8f0" }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={tripStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="p-5"
          >
            {tripStep === "pickup" && <PickupStep />}
            {tripStep === "transit" && <TransitStep />}
            {tripStep === "drop" && (
              <DropStep
                onComplete={() => {
                  const earned = completeTrip();
                  if (earned > 0) {
                    playOrderChime();
                    onComplete(earned);
                  }
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Shared bits ────────────────────────────────────────────────────────── */

function FauxMap({ label, sub, tone }: { label: string; sub: string; tone: "green" | "amber" }) {
  const pin = tone === "green" ? GREEN : "#d97706";
  return (
    <div className="relative rounded-[28px] overflow-hidden border border-slate-200 h-44">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#e8f0e9",
          backgroundImage:
            "linear-gradient(#cde3d2 1px, transparent 1px), linear-gradient(90deg, #cde3d2 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="absolute left-6 top-8 right-10 h-1.5 rounded-full bg-white/70" style={{ transform: "rotate(8deg)" }} />
      <div className="absolute left-10 bottom-10 right-6 h-1.5 rounded-full bg-white/70" style={{ transform: "rotate(-6deg)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="relative flex">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
            style={{ background: pin }}
          />
          <MapPin className="relative w-9 h-9" style={{ color: pin }} strokeWidth={2.6} fill={pin} />
        </span>
      </div>
      <div className="absolute left-3 right-3 bottom-3 bg-white rounded-2xl px-4 py-2.5 shadow">
        <p className="text-[15px] font-black text-slate-900 leading-tight truncate">{label}</p>
        <p className="text-[12px] font-semibold text-slate-400 leading-tight truncate">{sub}</p>
      </div>
    </div>
  );
}

function BigButton({
  onClick,
  children,
  color = GREEN,
  icon: Icon,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
  icon?: typeof Navigation;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2.5 rounded-3xl text-white py-5 text-[22px] font-black disabled:opacity-50"
      style={{ background: color, boxShadow: disabled ? "none" : `0 14px 30px -10px ${color}` }}
    >
      {Icon && <Icon className="w-6 h-6" strokeWidth={2.6} />}
      {children}
    </motion.button>
  );
}

/* ── Step 1: Pickup + Mandatory 10-Second Zero-Challan Pre-Trip Gate ────── */
function PickupStep() {
  const { t, lang } = useDriverLanguage();
  const { activeTrip, driverProfile, markLoaded } = useDriver();
  const masterSync = useSafeCononMasterSync();
  const [navigated, setNavigated] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [safetyChecked, setSafetyChecked] = useState(false);
  const [routeAckChecked, setRouteAckChecked] = useState(false);
  const [overhangChecked, setOverhangChecked] = useState(false);
  const [tirpalChecked, setTirpalChecked] = useState(false);
  const scanTimer = useRef<number | null>(null);

  const trafficCompliance = evaluateDispatchCompliance({
    items: activeTrip ? [{ name: activeTrip.material, quantity: 1, weightKg: 420 }] : [],
    totalWeightKg: 420,
    pincode: "226030",
    domain: "MATERIAL",
    rules: masterSync?.state.globalControls?.trafficPolicy,
  });

  useEffect(() => {
    if (trafficCompliance.vipDiversionActive && typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const msg =
          lang === "hi"
            ? "चेतावनी: लखनऊ में VIP डायवर्जन चालू है। शहीद पथ के ऊपर न चढ़ें, सर्विस लेन या किसान पथ का उपयोग करें।"
            : "Alert: Lucknow VIP Diversion is active. Use Service Lane or Kisan Path crossings only.";
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
      } catch {
        // ignore speech errors
      }
    }
  }, [trafficCompliance.vipDiversionActive, lang]);

  useEffect(() => {
    return () => {
      if (scanTimer.current !== null) window.clearTimeout(scanTimer.current);
    };
  }, []);

  if (!activeTrip) return null;

  const isHeavyVehicle = (driverProfile?.vehicleLabel || "").toLowerCase().includes("truck") ||
    (driverProfile?.vehicleLabel || "").toLowerCase().includes("tipper");
  const maxRcKg = isHeavyVehicle ? 18000 : (driverProfile?.vehicleLabel || "").toLowerCase().includes("3") ? 700 : 1500;
  const orderLoadKg = trafficCompliance.totalWeightKg;
  const isOverloaded = orderLoadKg > maxRcKg;

  const preTripReady =
    !isOverloaded &&
    safetyChecked &&
    routeAckChecked &&
    (!trafficCompliance.requiresLongLoadFolding || overhangChecked) &&
    (!trafficCompliance.requiresTarpaulinCover || tirpalChecked);

  const startScan = () => {
    if (scanning || !preTripReady) return;
    setScanning(true);
    scanTimer.current = window.setTimeout(() => {
      setScanning(false);
      toast.success(`✅ ${t("materialLoaded")}`);
      markLoaded();
    }, 1600);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-black uppercase tracking-wider" style={{ color: GREEN }}>
            {t("warehouse")}
          </p>
          <h2 className="text-[22px] font-black text-slate-900 leading-tight mt-0.5">{t("pickupStep")}</h2>
        </div>
        <button
          type="button"
          onClick={() => setDocsOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>Police Docs</span>
        </button>
      </div>

      {/* Zero-Challan Pre-Trip Gate */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-black text-amber-950 uppercase tracking-wide text-[11px]">
            {lang === "hi" ? "🛡️ जीरो-चालान प्री-ट्रिप चेक" : "🛡️ Zero-Challan Pre-Trip Gate"}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isOverloaded ? "bg-rose-600 text-white" : "bg-emerald-100 text-emerald-800"}`}>
            {isOverloaded ? "OVERLOAD BLOCKED" : `${orderLoadKg} / ${maxRcKg} kg OK ✓`}
          </span>
        </div>

        <p className="text-[11px] font-bold text-amber-900 leading-snug">
          {lang === "hi" ? trafficCompliance.routeWarningHi : trafficCompliance.routeWarningEn}
        </p>

        <div className="space-y-1.5 pt-1">
          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-900 cursor-pointer">
            <input type="checkbox" checked={routeAckChecked} onChange={(e) => setRouteAckChecked(e.target.checked)} className="rounded" />
            <span>
              {lang === "hi"
                ? "शहीद पथ के ऊपर नहीं जाऊंगा — केवल सर्विस लेन / अंडरपास उपयोग करूंगा ✓"
                : "No-Entry Route Shield: Service Lane / Underpass only (Saves ₹20,000 fine) ✓"}
            </span>
          </label>
          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-900 cursor-pointer">
            <input type="checkbox" checked={safetyChecked} onChange={(e) => setSafetyChecked(e.target.checked)} className="rounded" />
            <span>{lang === "hi" ? "हेलमेट / सीटबेल्ट पहन लिया है ✓" : "Helmet / Seatbelt Worn ✓"}</span>
          </label>
          {trafficCompliance.requiresLongLoadFolding && (
            <label className="flex items-center gap-2 text-[11px] font-bold text-amber-950 cursor-pointer">
              <input type="checkbox" checked={overhangChecked} onChange={(e) => setOverhangChecked(e.target.checked)} className="rounded" />
              <span>12m Sariya/Pipes folded &amp; Red Warning Cloth tied (Saves ₹20,000) ✓</span>
            </label>
          )}
          {trafficCompliance.requiresTarpaulinCover && (
            <label className="flex items-center gap-2 text-[11px] font-bold text-blue-950 cursor-pointer">
              <input type="checkbox" checked={tirpalChecked} onChange={(e) => setTirpalChecked(e.target.checked)} className="rounded" />
              <span>Tirpal / Tarpaulin Dust Cover Tied ✓</span>
            </label>
          )}
        </div>
      </div>

      <FauxMap label={activeTrip.pickup} sub={activeTrip.pickupArea} tone="green" />

      <BigButton onClick={() => setNavigated(true)} icon={Navigation} color={navigated ? "#475569" : GREEN}>
        {navigated ? t("arrived") : t("navigateToPickup")}
      </BigButton>

      <AnimatePresence>
        {navigated && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <BigButton onClick={startScan} icon={scanning ? undefined : QrCode} color={GREEN_DARK} disabled={scanning || !preTripReady}>
              {scanning ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" /> {t("scanning")}
                </span>
              ) : !preTripReady ? (
                lang === "hi" ? "पहले ऊपर दिए चेकबॉक्स कन्फर्म करें" : "Complete Zero-Challan Gate Above"
              ) : (
                t("scanToLoad")
              )}
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>

      <PoliceCheckingFolderModal open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}

/* ── Step 2: Transit ────────────────────────────────────────────────────── */
function TransitStep() {
  const { t } = useDriverLanguage();
  const { activeTrip, markArrived } = useDriver();
  const [navigated, setNavigated] = useState(false);

  if (!activeTrip) return null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-black uppercase tracking-wider" style={{ color: "#d97706" }}>
          {t("customerSite")}
        </p>
        <h2 className="text-[24px] font-black text-slate-900 leading-tight mt-1">{t("transitStep")}</h2>
      </div>

      <FauxMap label={activeTrip.drop} sub={activeTrip.dropArea} tone="amber" />

      <BigButton onClick={() => setNavigated(true)} icon={Navigation} color={navigated ? "#475569" : YELLOW}>
        {navigated ? t("arrived") : t("navigateToSite")}
      </BigButton>

      <AnimatePresence>
        {navigated && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <BigButton
              onClick={() => {
                toast.success(`📍 ${t("arrivedAtLocation").split(" (")[0]}`);
                markArrived();
              }}
              icon={MapPin}
              color={GREEN}
            >
              {t("arrivedAtLocation")}
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Step 3: Drop & Proof of Delivery ───────────────────────────────────── */
function DropStep({ onComplete }: { onComplete: () => void }) {
  const { t, lang } = useDriverLanguage();
  const { activeTrip, pod, podComplete } = useDriver();
  const masterSync = useSafeCononMasterSync();
  const [showCamera, setShowCamera] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [podCollectMethod, setPodCollectMethod] = useState<"POD_SITE_UPI" | "POD_CASH" | null>(null);
  const [podConfirmed, setPodConfirmed] = useState(false);

  const isPodOrder =
    activeTrip?.paymentStatus === "PAY_ON_DELIVERY" ||
    activeTrip?.paymentMode === "PAY_ON_DELIVERY" ||
    activeTrip?.paymentMode === "COD";

  const collectAmount = Number(activeTrip?.collectAmount || activeTrip?.earn || 0);
  const canComplete = podComplete && (!isPodOrder || podConfirmed);

  const handleCompleteWithPodSync = () => {
    if (isPodOrder && podConfirmed && masterSync && activeTrip) {
      masterSync
        .recordTreasuryEntry({
          id: `tr_pod_${activeTrip.id}_${Date.now()}`,
          orderId: activeTrip.shortId || activeTrip.id,
          entryType: "CUSTOMER_INFLOW",
          direction: "CREDIT",
          fromAccountLabel: `Site POD (${podCollectMethod || "POD_CASH"})`,
          fromAccountRef: activeTrip.dropArea,
          toAccountLabel: "CONON Driver Site Collection",
          toAccountRef: "POD_SITE_COLLECTED",
          toIfsc: "",
          beneficiaryName: "CONON INFRABUILT PVT LTD",
          paymentMode: podCollectMethod || "POD_CASH",
          utrNumber: podCollectMethod === "POD_SITE_UPI" ? generateUtr("5") : `POD-CASH-${Date.now().toString().slice(-6)}`,
          grossAmount: collectAmount,
          platformMargin: Math.round(collectAmount * 0.08),
          taxAmount: Math.round(collectAmount * 0.14),
          netAmount: collectAmount,
          status: "SETTLED",
          createdAt: new Date().toISOString(),
          customerName: activeTrip.drop,
        })
        .catch(() => {});
    }
    onComplete();
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[13px] font-black uppercase tracking-wider" style={{ color: GREEN }}>
          {t("proofOfDelivery")}
        </p>
        <h2 className="text-[24px] font-black text-slate-900 leading-tight mt-1">{t("dropStep")}</h2>
      </div>

      {/* Payment Status Gate Banner (Bilingual EN/HI) */}
      {isPodOrder ? (
        <div className="p-4 rounded-3xl border-2 border-amber-400 bg-amber-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-900">
              {lang === "hi"
                ? `साइट पर ${inr(collectAmount)} वसूलें (POD)`
                : `Collect ${inr(collectAmount)} at Site (POD)`}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950">
              POD &lt; ₹10K
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPodCollectMethod("POD_SITE_UPI")}
              className={`py-2 px-3 rounded-xl border-2 text-xs font-black cursor-pointer ${
                podCollectMethod === "POD_SITE_UPI"
                  ? "border-emerald-700 bg-emerald-600 text-white"
                  : "border-amber-300 bg-white text-slate-800"
              }`}
            >
              {lang === "hi" ? "साइट UPI QR" : "Site UPI QR"}
            </button>
            <button
              type="button"
              onClick={() => setPodCollectMethod("POD_CASH")}
              className={`py-2 px-3 rounded-xl border-2 text-xs font-black cursor-pointer ${
                podCollectMethod === "POD_CASH"
                  ? "border-emerald-700 bg-emerald-600 text-white"
                  : "border-amber-300 bg-white text-slate-800"
              }`}
            >
              {lang === "hi" ? "नकद लिया (Cash)" : "Cash Collected"}
            </button>
          </div>
          <button
            type="button"
            disabled={!podCollectMethod}
            onClick={() => {
              setPodConfirmed(true);
              toast.success("POD payment logged to Khata & Bank Passbook!");
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-black disabled:opacity-40 cursor-pointer"
          >
            {podConfirmed
              ? lang === "hi"
                ? "✓ पेमेंट प्राप्त कन्फर्म"
                : "✓ Site Payment Confirmed"
              : lang === "hi"
              ? "पेमेंट कन्फर्म करें"
              : "Confirm Site Payment Received"}
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-2.5 text-emerald-950">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="text-xs font-black">
            {lang === "hi"
              ? "PREPAID ✓ — साइट पर नकद बिल्कुल न लें"
              : "PREPAID ✓ — Do NOT collect cash at site"}
          </span>
        </div>
      )}

      {/* PoD checklist */}
      <PodRow
        done={pod.photo}
        icon={Camera}
        label={pod.photo ? t("photoUploaded") : t("uploadPhoto")}
        onClick={() => !pod.photo && setShowCamera(true)}
      />
      <PodRow
        done={pod.otp}
        icon={ShieldCheck}
        label={pod.otp ? t("otpVerified") : t("enterCustomerOtp")}
        onClick={() => !pod.otp && setShowOtp(true)}
      />

      <BigButton onClick={handleCompleteWithPodSync} icon={CheckCircle2} disabled={!canComplete} color={GREEN}>
        {t("completeTrip")}
      </BigButton>
      {!canComplete && (
        <p className="text-center text-[13px] font-bold text-amber-600">
          {isPodOrder && !podConfirmed
            ? lang === "hi"
              ? "पहले साइट पेमेंट कन्फर्म करें"
              : "Confirm POD site collection before completing trip"
            : t("finishPodFirst")}
        </p>
      )}

      <CameraModal open={showCamera} onClose={() => setShowCamera(false)} />
      <OtpModal open={showOtp} onClose={() => setShowOtp(false)} />
    </div>
  );
}

function PodRow({
  done,
  icon: Icon,
  label,
  onClick,
}: {
  done: boolean;
  icon: typeof Camera;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={done}
      className="w-full flex items-center gap-3 rounded-3xl p-4 border-2 text-left transition-colors"
      style={{
        borderColor: done ? GREEN : "#e2e8f0",
        background: done ? "#f0fdf4" : "#ffffff",
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: done ? GREEN : "#f1f5f9" }}
      >
        <Icon className="w-6 h-6" style={{ color: done ? "#fff" : "#64748b" }} strokeWidth={2.4} />
      </div>
      <span className="flex-1 text-[17px] font-black text-slate-900 leading-tight">{label}</span>
      {done && <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: GREEN }} />}
    </button>
  );
}

/* Simulated camera — a viewfinder that "captures" after a beat, then marks the
   photo done in context. */
function CameraModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useDriverLanguage();
  const { capturePhoto } = useDriver();
  const [shooting, setShooting] = useState(false);
  const shootTimer = useRef<number | null>(null);

  // Cancel any pending capture when the modal closes (manual dismiss) or unmounts.
  useEffect(() => {
    if (!open && shootTimer.current !== null) {
      window.clearTimeout(shootTimer.current);
      shootTimer.current = null;
      setShooting(false);
    }
    return () => {
      if (shootTimer.current !== null) window.clearTimeout(shootTimer.current);
    };
  }, [open]);

  const shoot = () => {
    if (shooting) return;
    setShooting(true);
    shootTimer.current = window.setTimeout(() => {
      capturePhoto();
      setShooting(false);
      toast.success(`📸 ${t("photoUploaded").split(" (")[0]}`);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[85] bg-black flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex justify-end p-4">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-8">
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-800">
              {/* viewfinder corners */}
              {["tl", "tr", "bl", "br"].map((c) => (
                <span
                  key={c}
                  className="absolute w-10 h-10 border-white"
                  style={{
                    top: c[0] === "t" ? 12 : undefined,
                    bottom: c[0] === "b" ? 12 : undefined,
                    left: c[1] === "l" ? 12 : undefined,
                    right: c[1] === "r" ? 12 : undefined,
                    borderTopWidth: c[0] === "t" ? 4 : 0,
                    borderBottomWidth: c[0] === "b" ? 4 : 0,
                    borderLeftWidth: c[1] === "l" ? 4 : 0,
                    borderRightWidth: c[1] === "r" ? 4 : 0,
                    borderRadius: 8,
                  }}
                />
              ))}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80">
                <PackageCheck className="w-16 h-16" strokeWidth={1.6} />
                <p className="text-[14px] font-bold px-8 text-center">
                  {shooting ? t("holdSteady") : t("uploadPhoto").split(" (")[0]}
                </p>
              </div>
              {shooting && (
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0] }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-center pb-12 pt-6">
            <button
              onClick={shoot}
              disabled={shooting}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white/30 disabled:opacity-70"
              aria-label={t("capturing")}
            >
              {shooting ? (
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
              ) : (
                <Camera className="w-9 h-9 text-slate-900" strokeWidth={2.4} />
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* OTP entry — 4 big boxes. The expected code is shown as a hint (this is a
   simulation), and only the correct code verifies. */
function OtpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useDriverLanguage();
  const { activeTrip, verifyOtp } = useDriver();
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => {
    if (open) {
      setDigits(["", "", "", ""]);
      later(() => inputs.current[0]?.focus(), 100);
    } else {
      clearTimers();
    }
    return clearTimers;
  }, [open]);

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      const code = next.join("");
      if (clean && i < 3) inputs.current[i + 1]?.focus();
      if (code.length === 4) {
        if (verifyOtp(code)) {
          toast.success(`🔓 ${t("otpVerified").split(" (")[0]}`);
          later(onClose, 250);
        } else {
          toast.error(t("wrongOtp"));
          later(() => {
            setDigits(["", "", "", ""]);
            inputs.current[0]?.focus();
          }, 600);
        }
      }
      return next;
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[85] bg-black/60 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full bg-white rounded-t-[34px] p-6 pb-10"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-7 h-7" style={{ color: GREEN }} />
              <h3 className="text-[22px] font-black text-slate-900">{t("enterCustomerOtp")}</h3>
            </div>
            <p className="text-[14px] font-semibold text-slate-400 mb-5">{t("askCustomerOtp")}</p>

            <div className="flex justify-between gap-3 mb-5">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  inputMode="numeric"
                  maxLength={1}
                  className="w-16 h-20 rounded-3xl border-2 border-slate-200 text-center text-[34px] font-black text-slate-900 focus:border-green-500 focus:outline-none"
                />
              ))}
            </div>

            {activeTrip && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-center">
                <span className="text-[13px] font-bold text-amber-700">
                  Delivery OTP: <span className="text-[18px] font-black tracking-[0.3em]">{activeTrip.customerOtp}</span>
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

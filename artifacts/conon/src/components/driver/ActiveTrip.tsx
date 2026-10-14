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

/* ── Step 1: Pickup ─────────────────────────────────────────────────────── */
function PickupStep() {
  const { t } = useDriverLanguage();
  const { activeTrip, markLoaded } = useDriver();
  const [navigated, setNavigated] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scanTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimer.current !== null) window.clearTimeout(scanTimer.current);
    };
  }, []);

  if (!activeTrip) return null;

  const startScan = () => {
    if (scanning) return;
    setScanning(true);
    scanTimer.current = window.setTimeout(() => {
      setScanning(false);
      toast.success(`✅ ${t("materialLoaded")}`);
      markLoaded();
    }, 1600);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[13px] font-black uppercase tracking-wider" style={{ color: GREEN }}>
          {t("warehouse")}
        </p>
        <h2 className="text-[24px] font-black text-slate-900 leading-tight mt-1">{t("pickupStep")}</h2>
      </div>

      <FauxMap label={activeTrip.pickup} sub={activeTrip.pickupArea} tone="green" />

      <BigButton onClick={() => setNavigated(true)} icon={Navigation} color={navigated ? "#475569" : GREEN}>
        {navigated ? t("arrived") : t("navigateToPickup")}
      </BigButton>

      <AnimatePresence>
        {navigated && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <BigButton onClick={startScan} icon={scanning ? undefined : QrCode} color={GREEN_DARK} disabled={scanning}>
              {scanning ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" /> {t("scanning")}
                </span>
              ) : (
                t("scanToLoad")
              )}
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>
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
  const { t } = useDriverLanguage();
  const { pod, podComplete } = useDriver();
  const [showCamera, setShowCamera] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[13px] font-black uppercase tracking-wider" style={{ color: GREEN }}>
          {t("proofOfDelivery")}
        </p>
        <h2 className="text-[24px] font-black text-slate-900 leading-tight mt-1">{t("dropStep")}</h2>
      </div>

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

      <BigButton onClick={onComplete} icon={CheckCircle2} disabled={!podComplete} color={GREEN}>
        {t("completeTrip")}
      </BigButton>
      {!podComplete && (
        <p className="text-center text-[13px] font-bold text-amber-600">{t("finishPodFirst")}</p>
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
                  Demo OTP: <span className="text-[18px] font-black tracking-[0.3em]">{activeTrip.customerOtp}</span>
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { Package, MapPin, ChevronsRight, X, IndianRupee } from "lucide-react";
import { useDriverLanguage } from "@/context/DriverLanguageContext";
import { type Trip } from "@/context/DriverContext";
import { GREEN, GREEN_DARK, RED, inr } from "./theme";

/* Module 2 — the Uber-style full-screen dispatch alert.
   Loud red flashing header, the load + payout in huge type, and a
   swipe-to-accept slider (with a hard ACCEPT fallback so it's never a dead
   button). Declining dismisses the request. */
export function DispatchOverlay({
  trip,
  onAccept,
  onDecline,
}: {
  trip: Trip | null;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t } = useDriverLanguage();
  return (
    <AnimatePresence>
      {trip && (
        <motion.div
          key="dispatch"
          className="absolute inset-0 z-[80] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Flashing alert backdrop */}
          <motion.div
            className="absolute inset-0"
            animate={{ backgroundColor: ["#7f1d1d", "#dc2626", "#7f1d1d"] }}
            transition={{ duration: 1, repeat: Infinity }}
          />

          <div className="relative z-10 flex-1 flex flex-col p-5 text-white">
            <div className="flex items-center justify-between">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
                className="text-[15px] font-black uppercase tracking-wider bg-white/15 rounded-full px-4 py-2"
              >
                🚨 {t("newDeliveryRequest")}
              </motion.div>
              <button
                onClick={onDecline}
                className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"
                aria-label="Decline"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <DispatchBody trip={trip} />

            <SwipeToAccept onAccept={onAccept} onDecline={onDecline} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DispatchBody({ trip }: { trip: Trip }) {
  const { t } = useDriverLanguage();
  return (
    <div className="flex-1 flex flex-col justify-center gap-5 py-6">
      <div className="bg-white rounded-[30px] p-6 text-slate-900 shadow-2xl">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "#fee2e2" }}
          >
            <Package className="w-7 h-7" style={{ color: RED }} strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <p className="text-[24px] font-black leading-tight">{trip.qty}</p>
            <p className="text-[16px] font-bold text-slate-500 leading-tight truncate">{trip.material}</p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl p-5 text-center text-white" style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}>
          <p className="text-[13px] font-bold uppercase tracking-widest text-white/85">{t("earn")}</p>
          <div className="flex items-center justify-center mt-1">
            <IndianRupee className="w-8 h-8" strokeWidth={3} />
            <span className="text-[48px] font-black leading-none">{trip.earn}</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <Leg icon="up" title={trip.pickup} sub={trip.pickupArea} />
          <Leg icon="down" title={trip.drop} sub={trip.dropArea} />
          <div className="flex items-center justify-center gap-1.5 text-slate-400 pt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[12px] font-bold">{t("distance")}: {trip.distanceKm} km</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Leg({ icon, title, sub }: { icon: "up" | "down"; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ background: icon === "up" ? "#dcfce7" : "#fef3c7" }}
      >
        <MapPin className="w-4 h-4" style={{ color: icon === "up" ? GREEN : "#d97706" }} strokeWidth={2.6} />
      </div>
      <div className="min-w-0">
        <p className="text-[16px] font-black text-slate-900 leading-tight truncate">{title}</p>
        <p className="text-[12px] font-semibold text-slate-400 leading-tight truncate">{sub}</p>
      </div>
    </div>
  );
}

/* Drag the knob to the right edge to accept. Falls back to a tap-anywhere
   ACCEPT — releasing past 75% of the track also accepts. */
function SwipeToAccept({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  const { t } = useDriverLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [accepted, setAccepted] = useState(false);
  const acceptTimer = useRef<number | null>(null);
  const KNOB = 60;

  useEffect(() => {
    return () => {
      if (acceptTimer.current !== null) window.clearTimeout(acceptTimer.current);
    };
  }, []);

  const maxX = () => (trackRef.current?.offsetWidth ?? 300) - KNOB - 8;

  const finish = () => {
    if (accepted) return;
    setAccepted(true);
    animate(x, maxX(), { type: "spring", stiffness: 400, damping: 32 });
    acceptTimer.current = window.setTimeout(onAccept, 180);
  };

  return (
    <div className="pb-2">
      <div
        ref={trackRef}
        className="relative h-[72px] rounded-full bg-white/20 backdrop-blur-sm overflow-hidden select-none"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[18px] font-black text-white/90">{t("swipeToAccept")}</span>
        </div>
        <motion.button
          drag="x"
          dragConstraints={{ left: 0, right: maxX() }}
          dragElastic={0}
          dragMomentum={false}
          onClick={finish}
          onDragEnd={() => {
            if (x.get() >= maxX() * 0.75) finish();
            else animate(x, 0, { type: "spring", stiffness: 500, damping: 36 });
          }}
          className="absolute top-1.5 left-1.5 z-10 flex items-center justify-center rounded-full shadow-xl"
          style={{ x, width: KNOB, height: KNOB, background: GREEN }}
          aria-label={t("accept")}
        >
          <ChevronsRight className="w-7 h-7 text-white" strokeWidth={3} />
        </motion.button>
      </div>

      {/* Explicit huge ACCEPT + decline — guarantees the action always works. */}
      <div className="flex gap-3 mt-3">
        <button
          onClick={onDecline}
          className="px-5 py-4 rounded-2xl bg-white/15 text-white text-[16px] font-black"
        >
          {t("decline")}
        </button>
        <button
          onClick={finish}
          className="flex-1 py-4 rounded-2xl text-white text-[20px] font-black"
          style={{ background: GREEN_DARK }}
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}

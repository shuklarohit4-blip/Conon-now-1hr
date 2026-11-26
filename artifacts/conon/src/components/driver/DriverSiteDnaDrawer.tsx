import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Dna,
  Truck,
  Bike,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { feedbackSync } from "@/services/feedbackSync";
import { useDriverTheme } from "@/context/DriverThemeContext";
import { useDriverLang } from "@/context/DriverLanguageContext";

export interface DriverSiteDnaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  driverId?: string;
  siteName?: string;
  siteAddress?: string;
  onSuccess?: () => void;
}

export const DriverSiteDnaDrawer: React.FC<DriverSiteDnaDrawerProps> = ({
  isOpen,
  onClose,
  orderId = "ord_live_drop",
  driverId = "DRV-LKO-201",
  siteName = "Sushant Golf City Slab Pour",
  siteAddress = "Plot 42, Amar Shaheed Path, Lucknow",
  onSuccess,
}) => {
  const { isDark } = useDriverTheme();
  const { lang } = useDriverLang();

  // Road access options
  const ROAD_OPTIONS = [
    {
      en: "Wide Road (Easy Loader)",
      hi: "चौड़ी सड़क (लोडर आसान)",
      icon: "🚛",
    },
    {
      en: "Narrow Lane (Bike Only)",
      hi: "पतली गली (सिर्फ बाइक)",
      icon: "🛵",
    },
    {
      en: "Mud / Blocked Entry",
      hi: "कीचड़ / रास्ता बंद",
      icon: "🚧",
    },
  ];

  // Unloading speed options
  const UNLOADING_OPTIONS = [
    {
      en: "Labour Ready ✓",
      hi: "मज़दूर तैयार ✓",
      icon: "👷",
    },
    {
      en: "Long Wait / Gate Closed",
      hi: "लंबा इंतज़ार / गेट बंद",
      icon: "⏳",
    },
    {
      en: "Safe Unloading Spot",
      hi: "सुरक्षित अनलोडिंग जगह",
      icon: "📍",
    },
  ];

  // Customer / Mistri behaviour options
  const BEHAVIOUR_OPTIONS = [
    {
      en: "Respectful & Helpful",
      hi: "सम्मानजनक व मददगार",
      icon: "🤝",
    },
    {
      en: "Smooth OTP Handover",
      hi: "आसान OTP हैंडओवर",
      icon: "📱",
    },
    {
      en: "Dispute / Difficult",
      hi: "विवाद / मुश्किल",
      icon: "⚠️",
    },
  ];

  // Quick note pills
  const QUICK_NOTES = lang === "hi"
    ? ["गेट के सामने चौड़ा रैम्प है", "पानी की टंकी के पास अनलोड करें", "50m पहले लोडर खड़ा करना पड़ता है", "साइट सुपरवाइज़र तुरंत ओटीपी देता है"]
    : ["Wide ramp in front of gate", "Unload near water tank", "Park loader 50m early", "Supervisor gives OTP instantly"];

  const [selectedRoad, setSelectedRoad] = useState<string>("Wide Road (Easy Loader)");
  const [selectedUnloading, setSelectedUnloading] = useState<string>("Labour Ready ✓");
  const [selectedBehaviour, setSelectedBehaviour] = useState<string>("Respectful & Helpful");
  const [noteText, setNoteText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await feedbackSync.submitDriverSiteFeedback({
        orderId,
        driverId,
        siteAddressKey: siteAddress,
        address: siteAddress,
        roadAccessTag: selectedRoad,
        unloadingTag: selectedUnloading,
        behaviourTag: selectedBehaviour,
        notes: noteText,
      });

      toast.success(
        lang === "hi"
          ? "🧬 साइट डीएनए सुरक्षित! अन्य सभी ड्राइवरों को रोड अपडेट भेजा गया।"
          : "🧬 Site DNA Saved! Road intel broadcast to all fleet drivers."
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("Failed to submit Site DNA: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden my-4 ${
          isDark
            ? "bg-[#111827] border-purple-500/40 text-slate-100"
            : "bg-white border-purple-200 text-slate-900"
        }`}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center text-purple-200 shadow-inner">
              <Dna className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider uppercase text-purple-200">
                  {lang === "hi" ? "साइट डीएनए व रोड इंटेलिजेंस" : "Site DNA & Road Intelligence"}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/20 text-white">
                  5-Sec Feedback
                </span>
              </div>
              <p className="text-xs text-purple-100 font-semibold truncate max-w-[260px] sm:max-w-sm">
                {siteName} • {siteAddress}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Road & Vehicle Access */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-purple-400 block">
              {lang === "hi" ? "1. सड़क व वाहन पहुंच (Road Access):" : "1. Road & Vehicle Access Tags:"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ROAD_OPTIONS.map((opt) => {
                const active = selectedRoad === opt.en;
                return (
                  <button
                    key={opt.en}
                    type="button"
                    onClick={() => setSelectedRoad(opt.en)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[72px] active:scale-95 ${
                      active
                        ? "bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/30"
                        : isDark
                        ? "bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-xs font-bold leading-tight mt-1">
                      {lang === "hi" ? opt.hi : opt.en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Site Unloading Speed */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-purple-400 block">
              {lang === "hi" ? "2. साइट अनलोडिंग गति (Unloading Speed):" : "2. Site Unloading Readiness:"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {UNLOADING_OPTIONS.map((opt) => {
                const active = selectedUnloading === opt.en;
                return (
                  <button
                    key={opt.en}
                    type="button"
                    onClick={() => setSelectedUnloading(opt.en)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[72px] active:scale-95 ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-400/30"
                        : isDark
                        ? "bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-xs font-bold leading-tight mt-1">
                      {lang === "hi" ? opt.hi : opt.en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Customer / Mistri Behaviour */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-purple-400 block">
              {lang === "hi" ? "3. ग्राहक / मिस्त्री व्यवहार (Mistri Behaviour):" : "3. Customer & Mistri Behaviour:"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {BEHAVIOUR_OPTIONS.map((opt) => {
                const active = selectedBehaviour === opt.en;
                return (
                  <button
                    key={opt.en}
                    type="button"
                    onClick={() => setSelectedBehaviour(opt.en)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[72px] active:scale-95 ${
                      active
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/30"
                        : isDark
                        ? "bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-xs font-bold leading-tight mt-1">
                      {lang === "hi" ? opt.hi : opt.en}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Note Pills */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {lang === "hi" ? "1-टैप तुरंत नोट (वैकल्पिक):" : "1-Tap Quick Note (Optional):"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setNoteText(q)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer border ${
                    noteText === q
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : isDark
                      ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  + {q}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Dna className="w-4 h-4 text-purple-200" />
              <span>
                {isSubmitting
                  ? (lang === "hi" ? "साइट डीएनए सेव हो रहा है..." : "Saving Site DNA...")
                  : (lang === "hi" ? "साइट डीएनए सेव करें (प्रसारित करें)" : "Submit Site DNA Intel (Broadcast Live)")}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  FileText,
  PhoneCall,
  CheckCircle2,
  Truck,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import { useDriver } from "@/context/DriverContext";
import { useDriverLanguage } from "@/context/DriverLanguageContext";

interface PoliceCheckingFolderModalProps {
  open: boolean;
  onClose: () => void;
}

export function PoliceCheckingFolderModal({ open, onClose }: PoliceCheckingFolderModalProps) {
  const { driverProfile, activeTrip } = useDriver();
  const { lang } = useDriverLanguage();

  const plate = driverProfile?.vehiclePlate || "UP 32 CN 2030";
  const driverName = driverProfile?.name || "Rajesh Kumar";
  const orderValue = Number(activeTrip?.collectAmount || activeTrip?.earn || 18500);
  const needsEwayBill = orderValue >= 50000;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3"
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{lang === "hi" ? "डिजिलॉकर / UP MV वैध दस्तावेज़" : "Police Checking Folder (Offline Ready)"}</span>
                </div>
                <h3 className="text-base font-black">
                  {driverName} · <span className="font-mono">{plate}</span>
                </h3>
                <p className="text-[11px] text-emerald-100 mt-0.5">
                  Legally Valid Digital Docs under UP MV Rules / DigiLocker
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Docs Body */}
            <div className="p-4 space-y-3 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { title: "Vehicle RC", code: plate, valid: "Valid • Fitness OK" },
                  { title: "Commercial DL", code: "UP32-2019004821", valid: "Transport LMV/HMV" },
                  { title: "Active Insurance", code: "ICICI-9940218", valid: "Valid till Dec 2027" },
                  { title: "Valid PUC", code: "UP-PUC-884120", valid: "Emission Passed ✓" },
                ].map((doc) => (
                  <div key={doc.title} className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{doc.title}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <div className="font-mono text-[11px] font-bold text-emerald-900">{doc.code}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">{doc.valid}</div>
                  </div>
                ))}
              </div>

              {/* GST Tax Invoice & UP E-Way Bill */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-slate-900">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <span>Active Order GST Tax Invoice</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                    {activeTrip?.shortId || "CN-LKO-LIVE"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Material: <strong>{activeTrip?.material || "Construction Material"}</strong></span>
                  <span className="font-mono font-bold">{activeTrip?.qty || "Standard Load"}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-emerald-700" />
                    <span className="font-black text-slate-900">UP E-Way Bill No.</span>
                  </div>
                  <span className="font-mono text-[11px] font-black text-emerald-800">
                    {needsEwayBill ? "EWB-1928-4402-8812" : "Exempt (< ₹50,000)"}
                  </span>
                </div>
              </div>

              {/* 1-Tap Emergency Helplines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href="tel:9454405155"
                  className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center justify-center gap-2 shadow-sm"
                >
                  <PhoneCall className="w-4 h-4" />
                  <div className="text-left leading-tight">
                    <div className="text-[11px]">Lucknow Traffic Helpline</div>
                    <div className="text-[10px] font-mono text-rose-100">9454405155</div>
                  </div>
                </a>
                <a
                  href="tel:18001202026"
                  className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center gap-2 shadow-sm"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <div className="text-left leading-tight">
                    <div className="text-[11px]">CONON Dispatch SOS</div>
                    <div className="text-[10px] font-mono text-slate-300">24×7 Fleet Control</div>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

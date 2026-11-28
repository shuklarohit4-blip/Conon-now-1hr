import React, { useState } from "react";
import { MapPin, Lock, CheckCircle2, Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  checkPincodeServiceability,
  sanitizePincode,
  type ServiceabilityCheckResult,
} from "@/utils/serviceabilityPolicy";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import { useDeliveryLocation } from "@/context/LocationContext";
import { apiUrl } from "@/lib/apiBase";

interface ServiceabilityLockBannerProps {
  pincode: string;
  onChangePincode: (newPin: string) => void;
  compact?: boolean;
  label?: string;
}

export function ServiceabilityLockBanner({
  pincode,
  onChangePincode,
  compact = false,
  label = "Delivery / Site Pin Code *",
}: ServiceabilityLockBannerProps) {
  const masterSync = useSafeCononMasterSync();
  const { confirmLocation } = useDeliveryLocation();
  const config = masterSync?.state.globalControls?.serviceability;
  const check: ServiceabilityCheckResult = checkPincodeServiceability(pincode, config);

  const [waitlistPhone, setWaitlistPhone] = useState("");
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSaved, setWaitlistSaved] = useState(false);

  const handleSelectActiveZone = (pin: string, areaName: string) => {
    onChangePincode(pin);
    confirmLocation({
      pincode: pin,
      area: areaName,
      city: "Lucknow",
      fullLabel: `Lucknow — ${areaName}`,
    });
    setWaitlistSaved(false);
    setWaitlistOpen(false);
    toast.success(`Site pin code switched to ${pin} (${areaName})`);
  };

  const handleRequestWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = waitlistPhone.replace(/\D/g, "").slice(-10);
    if (digits.length < 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setWaitlistSubmitting(true);
    try {
      const entry = {
        id: `wl_${Date.now()}`,
        pincode: check.pincode || pincode,
        phone: `+91 ${digits}`,
        areaHint: "Checkout Request",
        createdAt: new Date().toISOString(),
      };
      await fetch(apiUrl("/api/serviceability/waitlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }).catch(() => {});

      if (masterSync) {
        const existing = masterSync.state.operations?.pincodeWaitlist || [];
        await masterSync
          .patchMasterState(
            {
              operations: {
                pincodeWaitlist: [entry, ...existing].slice(0, 200),
              },
            },
            "serviceability",
          )
          .catch(() => {});
      }
      setWaitlistSaved(true);
      setWaitlistOpen(false);
      toast.success(`Noted! We will notify +91 ${digits} when CONON launches in ${check.pincode}.`);
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-3 space-y-2.5 ${
        check.serviceable
          ? "bg-emerald-50/70 border-emerald-200"
          : "bg-rose-50 border-rose-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
          <MapPin className={`w-3.5 h-3.5 ${check.serviceable ? "text-emerald-700" : "text-rose-600"}`} />
          <span>{label}</span>
        </label>
        {check.serviceable ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            {check.matchedZone?.areaName || check.pincode}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
            <Lock className="w-3 h-3" />
            Not Serviceable
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            onChangePincode(sanitizePincode(e.target.value));
            setWaitlistSaved(false);
          }}
          placeholder="6-digit Pin Code (e.g. 226030)"
          className={`w-36 px-3 py-1.5 rounded-xl border text-xs font-mono font-black bg-white ${
            check.serviceable ? "border-emerald-300 text-slate-900" : "border-rose-400 text-rose-900"
          }`}
        />
        <div className="flex-1 flex flex-wrap gap-1">
          {check.activeZones.map((z) => (
            <button
              key={z.pincode}
              type="button"
              onClick={() => handleSelectActiveZone(z.pincode, z.areaName)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-black border transition cursor-pointer ${
                check.pincode === z.pincode
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500"
              }`}
              title={z.areaName}
            >
              {z.pincode}
            </button>
          ))}
        </div>
      </div>

      {!check.serviceable && (
        <div className="text-[11px] text-rose-900 space-y-2 pt-0.5">
          <p className="font-bold leading-snug">
            {check.messageEn}
          </p>
          {!compact && (
            <div className="flex flex-wrap items-center gap-2">
              {!waitlistOpen && !waitlistSaved && (
                <button
                  type="button"
                  onClick={() => setWaitlistOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-black cursor-pointer hover:bg-slate-800"
                >
                  <Bell className="w-3 h-3 text-amber-300" />
                  <span>Request Launch in My Area ({check.pincode || "Pin"})</span>
                </button>
              )}
              {waitlistSaved && (
                <span className="text-[10px] font-black text-emerald-700">
                  ✓ Added to CONON Lucknow Expansion Waitlist!
                </span>
              )}
            </div>
          )}
          {waitlistOpen && (
            <form onSubmit={handleRequestWaitlist} className="flex items-center gap-2">
              <input
                type="tel"
                value={waitlistPhone}
                onChange={(e) => setWaitlistPhone(e.target.value)}
                placeholder="+91 Mobile Number"
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white text-xs font-mono text-slate-900"
              />
              <button
                type="submit"
                disabled={waitlistSubmitting}
                className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-black cursor-pointer flex items-center gap-1"
              >
                {waitlistSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Notify Me</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

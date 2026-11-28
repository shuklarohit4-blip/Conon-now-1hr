import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { X, Loader2, CheckCircle2, Navigation, Lock, Bell, MapPin } from "lucide-react";
import { useDeliveryLocation, SERVICEABLE_PINS } from "@/context/LocationContext";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import {
  checkPincodeServiceability,
  DEFAULT_SERVICEABLE_ZONES,
  sanitizePincode,
} from "@/utils/serviceabilityPolicy";
import { apiUrl } from "@/lib/apiBase";
import { toast } from "sonner";

export function LocationConfirmSheet() {
  const {
    showLocationSheet,
    closeLocationSheet,
    confirmLocation,
    reverseGeocode,
    location,
  } = useDeliveryLocation();
  const masterSync = useSafeCononMasterSync();
  const [route] = useLocation();

  const serviceabilityCfg = masterSync?.state.globalControls?.serviceability;
  const activeZones = useMemo(() => {
    const zones = serviceabilityCfg?.activePincodes;
    return Array.isArray(zones) && zones.length > 0
      ? zones.filter((z) => z.active)
      : DEFAULT_SERVICEABLE_ZONES;
  }, [serviceabilityCfg]);

  const [pincodeInput, setPincodeInput] = useState(location?.pincode || "226030");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ pincode: string; area: string } | null>(null);
  const [blockedCheck, setBlockedCheck] = useState<{ pincode: string; message: string } | null>(null);
  const [waitlistPhone, setWaitlistPhone] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSavedPin, setWaitlistSavedPin] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showLocationSheet) {
      setPincodeInput(location?.pincode || "226030");
      setError("");
      setSuccessInfo(null);
      setBlockedCheck(null);
      setWaitlistSavedPin(null);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [showLocationSheet, location]);

  const selectLocality = (pin: string, areaName: string) => {
    confirmLocation({
      pincode: pin,
      area: areaName,
      city: "Lucknow",
      fullLabel: `Lucknow — ${areaName}`,
    });
    setSuccessInfo({ pincode: pin, area: areaName });
    setBlockedCheck(null);
    toast.success(`Delivery set to ${areaName} (${pin}) — 60 mins guaranteed!`);
    setTimeout(() => closeLocationSheet(), 350);
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = sanitizePincode(pincodeInput);

    if (cleanPin.length !== 6) {
      setError("Please enter a valid 6-digit Pin Code.");
      setSuccessInfo(null);
      setBlockedCheck(null);
      return;
    }

    setLoading(true);
    setError("");

    const check = checkPincodeServiceability(cleanPin, serviceabilityCfg);
    if (check.serviceable && check.matchedZone) {
      confirmLocation({
        pincode: cleanPin,
        area: check.matchedZone.areaName,
        city: "Lucknow",
        fullLabel: `Lucknow — ${check.matchedZone.areaName}`,
      });
      setSuccessInfo({ pincode: cleanPin, area: check.matchedZone.areaName });
      setBlockedCheck(null);
      toast.success(`Delivery verified: ${check.matchedZone.areaName} (${cleanPin})!`);
      setTimeout(() => {
        closeLocationSheet();
        setLoading(false);
      }, 350);
    } else {
      setLoading(false);
      setSuccessInfo(null);
      setBlockedCheck({
        pincode: cleanPin,
        message: check.messageEn,
      });
    }
  };

  const handleBrowseBlocked = () => {
    if (!blockedCheck) return;
    confirmLocation({
      pincode: blockedCheck.pincode,
      area: `Browsing (${blockedCheck.pincode})`,
      city: "Lucknow",
      fullLabel: `Browsing — ${blockedCheck.pincode}`,
    });
    toast.info(`Browsing Mode (${blockedCheck.pincode}) — Checkout restricted to active launch zones.`);
    closeLocationSheet();
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockedCheck) return;
    const digits = waitlistPhone.replace(/\D/g, "").slice(-10);
    if (digits.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setWaitlistSubmitting(true);
    try {
      const entry = {
        id: `wl_${Date.now()}`,
        pincode: blockedCheck.pincode,
        phone: `+91 ${digits}`,
        areaHint: "Header Pin Code Checker",
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
      setWaitlistSavedPin(blockedCheck.pincode);
      setWaitlistPhone("");
      toast.success(`Notified! You are on the launch waitlist for ${blockedCheck.pincode}.`);
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  const handleGPS = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (res?.pincode) {
            setPincodeInput(res.pincode);
            const check = checkPincodeServiceability(res.pincode, serviceabilityCfg);
            if (check.serviceable && check.matchedZone) {
              confirmLocation({
                pincode: res.pincode,
                area: check.matchedZone.areaName,
                city: res.city || "Lucknow",
                fullLabel: `Lucknow — ${check.matchedZone.areaName}`,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
              setSuccessInfo({ pincode: res.pincode, area: check.matchedZone.areaName });
              setBlockedCheck(null);
              toast.success(`GPS Location set: ${check.matchedZone.areaName} (${res.pincode})`);
              setTimeout(() => closeLocationSheet(), 450);
            } else {
              setBlockedCheck({ pincode: res.pincode, message: check.messageEn });
            }
          } else {
            setError("Could not extract pincode from GPS. Please enter manually.");
          }
        } catch {
          setError("Failed to fetch GPS address. Please enter pincode.");
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsLoading(false);
        setError("Location permission denied. Please enter pincode manually.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [confirmLocation, closeLocationSheet, reverseGeocode, serviceabilityCfg]);

  const onSplash = route === "/" || route === "";
  const onNonCustomerRoute = /^\/(vendor|admin|login|driver|otp-login)(\/|$)/.test(route);
  if (!showLocationSheet || onSplash || onNonCustomerRoute) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
      onClick={closeLocationSheet}
    >
      <div
        className="relative bg-white rounded-2xl p-6 sm:p-7 max-w-[490px] w-full shadow-2xl border border-slate-100 text-left animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeLocationSheet}
          aria-label="Close dialog"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" strokeWidth={2.2} />
        </button>

        <div className="flex items-center gap-2 text-[#247c23] text-[11px] font-black uppercase tracking-wider mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>Hyperlocal Launch Zone Lock</span>
        </div>
        <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-snug">
          Check Delivery Pin Code
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-1 mb-5">
          Enter your 6-digit Lucknow Pin Code to verify 60-min express serviceability
        </p>

        <form onSubmit={handleApply} className="w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 w-full">
            <input
              ref={inputRef}
              type="tel"
              maxLength={6}
              placeholder="Enter 6-digit Pin Code"
              value={pincodeInput}
              onChange={(e) => {
                setPincodeInput(sanitizePincode(e.target.value));
                setError("");
                setSuccessInfo(null);
                setBlockedCheck(null);
              }}
              className="flex-1 h-11 sm:h-12 px-3.5 border border-slate-300 rounded-lg text-sm sm:text-[15px] font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#247c23] focus:ring-1 focus:ring-[#247c23] transition bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-11 sm:h-12 px-6 sm:px-7 rounded-lg bg-[#247c23] hover:bg-[#1d6b1c] active:scale-[0.98] text-white font-semibold text-sm sm:text-[15px] transition shadow-sm flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
            </button>
          </div>
        </form>

        {error && (
          <p className="text-xs text-red-600 font-medium mt-2 animate-in fade-in">{error}</p>
        )}

        {successInfo && (
          <div className="mt-3.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs sm:text-[13px] font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Deliver to <strong>{successInfo.area}</strong> ({successInfo.pincode}) — 60 Mins Express Live!
            </span>
          </div>
        )}

        {/* Blocked Pin Code Notice + "Notify Me" Waitlist */}
        {blockedCheck && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5 text-amber-950">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-black text-amber-900">
                  Delivery Not Yet Active in {blockedCheck.pincode}
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-snug font-medium">
                  {blockedCheck.message}
                </p>
              </div>
            </div>

            {waitlistSavedPin === blockedCheck.pincode ? (
              <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Added! We will WhatsApp/SMS you when CONON launches in {blockedCheck.pincode}.</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-2">
                <label className="block text-[11px] font-black text-slate-800">
                  Notify Me When CONON Launches in {blockedCheck.pincode}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={waitlistPhone}
                    onChange={(e) => setWaitlistPhone(e.target.value)}
                    placeholder="+91 Mobile Number"
                    className="flex-1 h-9 px-3 rounded-lg border border-amber-300 bg-white text-xs font-mono text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={waitlistSubmitting}
                    className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    {waitlistSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Bell className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>Notify Me</span>
                  </button>
                </div>
              </form>
            )}

            <button
              type="button"
              onClick={handleBrowseBlocked}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Continue browsing catalog for {blockedCheck.pincode} (Checkout locked)
            </button>
          </div>
        )}

        {/* 1-Tap Quick-Select Chips for Active Launch Zones */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Active Lucknow Launch Zones (60-Min Express)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeZones.map((zone) => (
              <button
                key={zone.pincode}
                type="button"
                onClick={() => selectLocality(zone.pincode, zone.areaName)}
                className={`px-3 py-2 rounded-xl text-left text-xs font-semibold border transition cursor-pointer flex items-center justify-between gap-2 ${
                  location?.pincode === zone.pincode
                    ? "bg-emerald-50 text-emerald-900 border-emerald-400"
                    : "bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border-slate-200 text-slate-700"
                }`}
              >
                <span className="truncate font-bold">{zone.areaName}</span>
                <span className="font-mono text-[11px] font-black px-1.5 py-0.5 rounded bg-white border border-slate-200 shrink-0">
                  {zone.pincode}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* GPS Live Detection Helper */}
        <div className="mt-3.5 text-center">
          <button
            type="button"
            onClick={handleGPS}
            disabled={gpsLoading}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 mx-auto transition cursor-pointer"
          >
            {gpsLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#247c23]" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{gpsLoading ? "Detecting GPS location…" : "Use my current location (GPS)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationConfirmSheet;

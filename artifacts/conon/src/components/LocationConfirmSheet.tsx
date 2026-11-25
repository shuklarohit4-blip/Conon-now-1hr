import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { X, Loader2, CheckCircle2, Navigation } from "lucide-react";
import { useDeliveryLocation, SERVICEABLE_PINS } from "@/context/LocationContext";
import { toast } from "sonner";

export function LocationConfirmSheet() {
  const {
    showLocationSheet,
    closeLocationSheet,
    confirmLocation,
    isServiceable,
    reverseGeocode,
    location,
  } = useDeliveryLocation();
  const [route] = useLocation();

  const [pincodeInput, setPincodeInput] = useState(location?.pincode || "226010");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ pincode: string; area: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when sheet opens
  useEffect(() => {
    if (showLocationSheet) {
      setPincodeInput(location?.pincode || "");
      setError("");
      setSuccessInfo(null);
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
    toast.success(`Delivery set to ${areaName} (${pin}) — 60 mins guaranteed!`);
    setTimeout(() => closeLocationSheet(), 400);
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pincodeInput.trim().replace(/\D/g, "");

    if (cleanPin.length !== 6) {
      setError("Please enter a valid 6-digit Pincode.");
      setSuccessInfo(null);
      return;
    }

    setLoading(true);
    setError("");

    const isMatch = isServiceable(cleanPin);
    const matchedArea = SERVICEABLE_PINS[cleanPin];

    if (isMatch && matchedArea) {
      confirmLocation({
        pincode: cleanPin,
        area: matchedArea,
        city: "Lucknow",
        fullLabel: `Lucknow — ${matchedArea}`,
      });
      setSuccessInfo({ pincode: cleanPin, area: matchedArea });
      toast.success(`Delivery location verified: ${matchedArea} (${cleanPin})!`);
      setTimeout(() => {
        closeLocationSheet();
        setLoading(false);
      }, 400);
    } else if (cleanPin.startsWith("226")) {
      // Lucknow pincode fallback
      const fallbackArea = "Lucknow City";
      confirmLocation({
        pincode: cleanPin,
        area: fallbackArea,
        city: "Lucknow",
        fullLabel: `Lucknow — ${fallbackArea}`,
      });
      setSuccessInfo({ pincode: cleanPin, area: fallbackArea });
      toast.success(`Delivery confirmed for Lucknow (${cleanPin})!`);
      setTimeout(() => {
        closeLocationSheet();
        setLoading(false);
      }, 400);
    } else {
      setLoading(false);
      setError("Express 60-min delivery is currently live across Lucknow (226xxx).");
      setSuccessInfo(null);
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
            const area = SERVICEABLE_PINS[res.pincode] || res.area || "Lucknow";
            confirmLocation({
              pincode: res.pincode,
              area,
              city: res.city || "Lucknow",
              fullLabel: `Lucknow — ${area}`,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setSuccessInfo({ pincode: res.pincode, area });
            toast.success(`GPS Location set: ${area} (${res.pincode})`);
            setTimeout(() => closeLocationSheet(), 500);
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
  }, [confirmLocation, closeLocationSheet, reverseGeocode]);

  // Suppress on driver/admin/vendor/login routes
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
      {/* ── Centered Delivery Time Modal (Exact Match to User Reference) ── */}
      <div
        className="relative bg-white rounded-2xl p-6 sm:p-7 max-w-[480px] w-full shadow-2xl border border-slate-100 text-left animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          onClick={closeLocationSheet}
          aria-label="Close dialog"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" strokeWidth={2.2} />
        </button>

        {/* Modal Title & Subtitle */}
        <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-snug">
          Delivery Time
        </h2>
        <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-1 mb-5">
          Please enter Pincode to check delivery time &amp; serviceability
        </p>

        {/* Input Row with Green "Apply" Button */}
        <form onSubmit={handleApply} className="w-full">
          <div className="flex items-center gap-2.5 sm:gap-3 w-full">
            <input
              ref={inputRef}
              type="tel"
              maxLength={6}
              placeholder="Enter Pincode"
              value={pincodeInput}
              onChange={(e) => {
                setPincodeInput(e.target.value.replace(/\D/g, ""));
                setError("");
                setSuccessInfo(null);
              }}
              className="flex-1 h-11 sm:h-12 px-3.5 border border-slate-300 rounded-lg text-sm sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#247c23] focus:ring-1 focus:ring-[#247c23] transition bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-11 sm:h-12 px-6 sm:px-7 rounded-lg bg-[#247c23] hover:bg-[#1d6b1c] active:scale-[0.98] text-white font-semibold text-sm sm:text-[15px] transition shadow-sm flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </button>
          </div>
        </form>

        {/* Validation Error Message */}
        {error && (
          <p className="text-xs text-red-600 font-medium mt-2 animate-in fade-in">
            {error}
          </p>
        )}

        {/* Verification Success Confirmation */}
        {successInfo && (
          <div className="mt-3.5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs sm:text-[13px] font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Deliver to <strong>{successInfo.area}</strong> ({successInfo.pincode}) — 60 Mins Delivery Guaranteed!
            </span>
          </div>
        )}

        {/* Popular Lucknow Localities Quick Picks */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Popular Lucknow Localities (60-Min Express)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { pin: "226010", name: "Gomti Nagar" },
              { pin: "226001", name: "Hazratganj" },
              { pin: "226016", name: "Indira Nagar" },
              { pin: "226005", name: "Alambagh" },
              { pin: "226024", name: "Aliganj" },
              { pin: "226028", name: "Gomti Nagar Ext" },
              { pin: "226030", name: "Sushant Golf City" },
            ].map((loc) => (
              <button
                key={loc.pin}
                type="button"
                onClick={() => selectLocality(loc.pin, loc.name)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700 transition cursor-pointer"
              >
                {loc.name} ({loc.pin})
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

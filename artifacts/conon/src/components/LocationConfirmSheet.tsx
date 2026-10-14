import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Navigation, Search, ChevronRight, X,
  Loader2, CheckCircle2, AlertCircle, Truck, Clock,
  ArrowLeft,
} from "lucide-react";
import { useDeliveryLocation, SERVICEABLE_PINS } from "@/context/LocationContext";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { Confetti } from "./Confetti";
import type { PlaceDetails } from "@/lib/mapsApi";

const BRAND = "#1b4366";
const GREEN = "#2a7a3b";
const AMBER = "#f59e0b";

type Stage =
  | "landing"       // initial — two buttons
  | "gps_loading"   // fetching GPS
  | "gps_check"     // checking serviceability
  | "gps_success"   // GPS location found & serviceable
  | "gps_outside"   // GPS found, outside service area
  | "gps_denied"    // permission denied
  | "manual"        // manual search flow
  | "manual_result";// manual pincode confirmed

const ALL_AREAS = Object.entries(SERVICEABLE_PINS);
/* Explicit order — JS sorts numeric-string keys ascending, so we curate the
   most-requested residential localities to surface first as quick picks. */
const POPULAR_PINS = ["226010", "226028", "226016", "226030", "226001", "226024", "226006", "226022"];
const POPULAR_AREAS: [string, string][] = POPULAR_PINS
  .filter((p) => SERVICEABLE_PINS[p])
  .map((p) => [p, SERVICEABLE_PINS[p]]);

/* Pulsing map pin animation */
function PinPulse() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-2">
      <motion.div
        className="absolute w-20 h-20 rounded-full"
        style={{ background: `${GREEN}18` }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-14 h-14 rounded-full"
        style={{ background: `${GREEN}28` }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: GREEN }}>
        <MapPin className="w-6 h-6 text-white" strokeWidth={2.5} />
      </div>
    </div>
  );
}

/* Truck delivery illustration strip */
function DeliveryStrip() {
  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: AMBER }}>
        <Truck className="w-4.5 h-4.5 text-white" />
      </div>
      <div>
        <p className="text-xs font-black text-amber-900">1-Hour Delivery — Lucknow Only</p>
        <p className="text-[10px] text-amber-600 font-semibold">We're live in 19 Lucknow localities 🏗️</p>
      </div>
      <div className="ml-auto flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 border border-green-100 rounded-lg px-2 py-1 shrink-0">
        <Clock className="w-3 h-3" /> 60 min
      </div>
    </div>
  );
}

export function LocationConfirmSheet() {
  const {
    showLocationSheet, closeLocationSheet, confirmLocation,
    isServiceable, reverseGeocode, location,
  } = useDeliveryLocation();
  const [route] = useLocation();

  const [stage, setStage]           = useState<Stage>("landing");
  const [gpsResult, setGpsResult]   = useState<{ pincode: string; area: string; city: string } | null>(null);
  const [gpsError, setGpsError]     = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [manualPin, setManualPin]   = useState("");
  const [manualArea, setManualArea] = useState("");
  const [pinError, setPinError]     = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Focus search when manual stage opens
  useEffect(() => {
    if (stage === "manual" && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 150);
    }
  }, [stage]);

  // Reset when sheet reopens
  useEffect(() => {
    if (showLocationSheet) {
      setStage("landing");
      setGpsResult(null);
      setGpsError("");
      setSearchQuery("");
      setManualPin("");
      setPinError("");
    }
  }, [showLocationSheet]);

  const handleGPS = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setGpsError("Your browser doesn't support location detection.");
      setStage("gps_denied");
      return;
    }
    setStage("gps_loading");
    setGpsError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStage("gps_check");
        try {
          const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (!result || !result.pincode) {
            setGpsError("Couldn't read a pincode from your GPS location.");
            setStage("gps_denied");
            return;
          }
          setGpsResult(result);
          if (isServiceable(result.pincode)) {
            setStage("gps_success");
          } else {
            setStage("gps_outside");
          }
        } catch {
          setGpsError("Couldn't look up your location. Check your connection.");
          setStage("gps_denied");
        }
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "Location permission denied. Please allow access in browser settings and try again.",
          2: "Your location is currently unavailable.",
          3: "Location request timed out. Try again.",
        };
        setGpsError(msgs[err.code] ?? "Couldn't get your live location.");
        setStage("gps_denied");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, [reverseGeocode, isServiceable]);

  const confirmGPS = () => {
    if (!gpsResult) return;
    const area = SERVICEABLE_PINS[gpsResult.pincode] ?? gpsResult.area;
    confirmLocation({
      pincode: gpsResult.pincode,
      area,
      city: gpsResult.city || "Lucknow",
      fullLabel: `${gpsResult.city || "Lucknow"} — ${area}`,
      lat: undefined,
      lng: undefined,
    });
  };

  const handlePinSubmit = () => {
    const pin = manualPin.trim();
    if (!/^\d{6}$/.test(pin)) { setPinError("Enter a valid 6-digit pincode"); return; }
    const area = SERVICEABLE_PINS[pin];
    if (!area) { setPinError("We don't deliver to this pincode yet."); return; }
    setManualArea(area);
    setPinError("");
    setStage("manual_result");
  };

  const confirmManual = () => {
    const area = SERVICEABLE_PINS[manualPin] ?? manualArea;
    confirmLocation({ pincode: manualPin, area, city: "Lucknow", fullLabel: `Lucknow — ${area}` });
  };

  // Google Places selection → extract pincode → run through serviceability.
  const handlePlaceSelect = (place: PlaceDetails) => {
    setPinError("");
    const pin = (place.pincode || "").replace(/\s+/g, "");
    if (!/^\d{6}$/.test(pin)) {
      setGpsResult({ pincode: pin || "—", area: place.area, city: place.city || "Lucknow" });
      setStage("gps_outside");
      return;
    }
    if (isServiceable(pin)) {
      const area = SERVICEABLE_PINS[pin];
      confirmLocation({
        pincode: pin,
        area,
        city: place.city || "Lucknow",
        fullLabel: `${place.city || "Lucknow"} — ${area}`,
        lat: place.lat,
        lng: place.lng,
      });
    } else {
      setGpsResult({ pincode: pin, area: place.area, city: place.city || "Lucknow" });
      setStage("gps_outside");
    }
  };

  const selectArea = (pin: string, area: string) => {
    confirmLocation({ pincode: pin, area, city: "Lucknow", fullLabel: `Lucknow — ${area}` });
  };

  const filteredAreas = searchQuery.trim()
    ? ALL_AREAS.filter(([p, a]) =>
        a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.includes(searchQuery))
    : POPULAR_AREAS;

  const canDismiss = location.confirmed;

  // Never overlay the splash screen, nor the vendor / admin / login / driver panels —
  // the delivery-location prompt is a customer-only onboarding flow. Use a
  // prefix match so trailing slashes and nested sub-routes stay suppressed too.
  const onSplash = route === "/" || route === "";
  const onNonCustomerRoute = /^\/(vendor|admin|login|driver|otp-login)(\/|$)/.test(route);
  const suppressed = onSplash || onNonCustomerRoute;

  return (
    <AnimatePresence>
      {showLocationSheet && !suppressed && (
        <>
          {/* Backdrop */}
          <motion.div
            key="loc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px]"
            onClick={canDismiss ? closeLocationSheet : undefined}
          />

          {/* Sheet */}
          <motion.div
            key="loc-sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-[61] bg-white flex justify-center"
            style={{ maxHeight: "92dvh" }}
          >
            <div className="w-full max-w-[480px] rounded-t-3xl overflow-hidden flex flex-col"
              style={{ maxHeight: "92dvh" }}>

              {/* Drag pill */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              {/* Close (only if already confirmed) */}
              {canDismiss && (
                <button onClick={closeLocationSheet}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-5 pb-8">

                {/* ── Landing ──────────────────────────── */}
                <AnimatePresence mode="wait">
                  {stage === "landing" && (
                    <motion.div key="landing"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} className="pt-2">

                      <PinPulse />

                      <h2 className="text-xl font-black text-center mb-1" style={{ color: BRAND }}>
                        Where should we deliver?
                      </h2>
                      <p className="text-[12px] text-slate-400 text-center font-semibold mb-5">
                        Set your location to see availability &amp; delivery time
                      </p>

                      <DeliveryStrip />

                      {/* GPS button */}
                      <button onClick={handleGPS}
                        className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2.5 mb-3 shadow-lg active:scale-[0.98] transition-transform"
                        style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #1e6b30 100%)`, boxShadow: `0 6px 20px ${GREEN}50` }}>
                        <Navigation className="w-4.5 h-4.5" />
                        Use My Current Location
                      </button>

                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">or search manually</span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>

                      {/* Manual search */}
                      <button onClick={() => setStage("manual")}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm active:scale-[0.98] transition-transform hover:border-slate-300">
                        <Search className="w-4.5 h-4.5 text-slate-400" />
                        <span className="flex-1 text-left text-slate-500">Search area or pincode…</span>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </button>

                      {/* Quick area picks */}
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-5 mb-3">
                        Popular in Lucknow
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_AREAS.slice(0, 8).map(([pin, area]) => (
                          <button key={pin} onClick={() => selectArea(pin, area)}
                            className="px-3 py-2 rounded-xl text-[11px] font-bold border border-slate-200 text-slate-600 bg-slate-50 hover:border-green-400 hover:text-green-800 hover:bg-green-50 transition-all active:scale-95">
                            📍 {area}
                          </button>
                        ))}
                      </div>

                      {/* Serviceability note */}
                      <div className="mt-5 flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-700 font-semibold leading-relaxed">
                          Currently serving <strong>Lucknow, UP</strong>. Enter your location to check if 1-hour delivery is available at your address.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* ── GPS Loading ───────────────────────── */}
                  {stage === "gps_loading" && (
                    <motion.div key="gps_loading"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-green-500 mb-5"
                      />
                      <p className="font-black text-lg" style={{ color: BRAND }}>Fetching your location…</p>
                      <p className="text-[12px] text-slate-400 mt-1">Please allow location access if prompted</p>
                    </motion.div>
                  )}

                  {/* ── GPS Checking serviceability ──────── */}
                  {stage === "gps_check" && (
                    <motion.div key="gps_check"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="relative w-20 h-20 mb-5">
                        <motion.div className="absolute inset-0 rounded-full border-4 border-green-100 border-t-green-500"
                          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
                        <div className="absolute inset-2 rounded-full bg-green-50 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <p className="font-black text-lg" style={{ color: BRAND }}>Checking serviceability…</p>
                      <p className="text-[12px] text-slate-400 mt-1">Almost there!</p>
                    </motion.div>
                  )}

                  {/* ── GPS Success ──────────────────────── */}
                  {stage === "gps_success" && gpsResult && (
                    <motion.div key="gps_success"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }} className="relative pt-4">

                      {/* magical celebratory confetti burst */}
                      <Confetti />

                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: `${GREEN}18` }}>
                        <CheckCircle2 className="w-10 h-10" style={{ color: GREEN }} />
                      </motion.div>

                      <h2 className="text-xl font-black text-center mb-1" style={{ color: BRAND }}>
                        Woohoo! We deliver here 🎉
                      </h2>
                      <p className="text-[12px] text-slate-400 text-center mb-5">
                        60-minute delivery is available at your location
                      </p>

                      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-black text-green-900 text-sm">
                              {SERVICEABLE_PINS[gpsResult.pincode] ?? gpsResult.area}
                            </p>
                            <p className="text-[11px] text-green-600 font-semibold">
                              {gpsResult.city} · Pincode {gpsResult.pincode}
                            </p>
                          </div>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                            className="ml-auto flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-100 rounded-lg px-2 py-1 shrink-0">
                            <Clock className="w-3 h-3" /> 60 min
                          </motion.div>
                        </div>
                      </div>

                      <button onClick={confirmGPS}
                        className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 mb-3 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${GREEN}, #1e6b30)`, boxShadow: `0 6px 20px ${GREEN}40` }}>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm This Location →
                      </button>

                      <button onClick={() => setStage("landing")}
                        className="w-full py-2.5 rounded-xl text-slate-500 font-bold text-sm">
                        ← Choose a different location
                      </button>
                    </motion.div>
                  )}

                  {/* ── GPS Outside zone ─────────────────── */}
                  {stage === "gps_outside" && gpsResult && (
                    <motion.div key="gps_outside"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }} className="pt-4 text-center">

                      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-50">
                        <AlertCircle className="w-10 h-10 text-amber-500" />
                      </div>

                      <h2 className="text-lg font-black mb-1" style={{ color: BRAND }}>
                        Not in our zone yet
                      </h2>
                      <p className="text-[12px] text-slate-500 mb-5 font-semibold leading-relaxed px-4">
                        Your pincode <strong>{gpsResult.pincode}</strong> isn't serviceable yet.<br />
                        We're expanding fast — choose a Lucknow area to continue.
                      </p>

                      <button onClick={() => setStage("manual")}
                        className="w-full py-4 rounded-2xl font-black text-sm mb-3 text-white"
                        style={{ background: BRAND }}>
                        Select a Lucknow Area →
                      </button>
                      <button onClick={() => setStage("landing")}
                        className="w-full py-2.5 rounded-xl text-slate-500 font-bold text-sm">
                        ← Try Again
                      </button>
                    </motion.div>
                  )}

                  {/* ── GPS Denied / Error ───────────────── */}
                  {stage === "gps_denied" && (
                    <motion.div key="gps_denied"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }} className="pt-4 text-center">

                      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50">
                        <AlertCircle className="w-10 h-10 text-red-400" />
                      </div>

                      <h2 className="text-lg font-black mb-1" style={{ color: BRAND }}>
                        Couldn't detect location
                      </h2>
                      <p className="text-[12px] text-slate-500 mb-5 leading-relaxed px-2 font-semibold">
                        {gpsError}
                      </p>

                      <button onClick={() => setStage("manual")}
                        className="w-full py-4 rounded-2xl font-black text-sm mb-3 text-white"
                        style={{ background: BRAND }}>
                        Enter Address Manually →
                      </button>
                      <button onClick={handleGPS}
                        className="w-full py-3 rounded-2xl text-green-700 font-bold text-sm border-2 border-green-200 mb-2">
                        Retry GPS
                      </button>
                      <button onClick={() => setStage("landing")}
                        className="w-full py-2 rounded-xl text-slate-400 font-bold text-sm">
                        ← Back
                      </button>
                    </motion.div>
                  )}

                  {/* ── Manual search ────────────────────── */}
                  {stage === "manual" && (
                    <motion.div key="manual"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }} className="pt-2">

                      <button onClick={() => setStage("landing")}
                        className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-4 hover:text-slate-600">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>

                      <h2 className="text-lg font-black mb-1" style={{ color: BRAND }}>
                        Search Your Area
                      </h2>
                      <p className="text-[12px] text-slate-400 font-semibold mb-4">
                        Search any address, or pick a Lucknow area / pincode
                      </p>

                      {/* Google Places address autocomplete */}
                      <AddressAutocomplete
                        placeholder="Search building, street or address…"
                        onSelect={handlePlaceSelect}
                        autoFocus
                      />

                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">or pick area / pincode</span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>

                      {/* Search input */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          ref={searchRef}
                          type="text"
                          placeholder="e.g. Gomti Nagar or 226017"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                      </div>

                      {/* Pincode entry */}
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1 relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text" inputMode="numeric" maxLength={6}
                            placeholder="6-digit pincode"
                            value={manualPin}
                            onChange={e => { setManualPin(e.target.value.replace(/\D/g, "")); setPinError(""); }}
                            onKeyDown={e => e.key === "Enter" && handlePinSubmit()}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-bold focus:outline-none focus:border-green-400 transition"
                          />
                        </div>
                        <button onClick={handlePinSubmit}
                          className="px-5 py-3 rounded-xl text-white text-sm font-black"
                          style={{ background: BRAND }}>
                          Check
                        </button>
                      </div>

                      {pinError && (
                        <p className="text-red-500 text-xs font-bold mb-3 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> {pinError}
                        </p>
                      )}

                      {/* Area list */}
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                        {searchQuery ? `${filteredAreas.length} result${filteredAreas.length !== 1 ? "s" : ""}` : "All Serviceable Areas"}
                      </p>

                      <div className="space-y-2 pb-4">
                        {filteredAreas.length === 0 ? (
                          <div className="text-center py-6 text-slate-400">
                            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm font-bold">No areas found</p>
                            <p className="text-[11px]">Try a different name or pincode</p>
                          </div>
                        ) : (
                          filteredAreas.map(([pin, area]) => (
                            <button key={pin} onClick={() => selectArea(pin, area)}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-green-300 hover:bg-green-50 transition-all active:scale-[0.98] text-left">
                              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                <MapPin className="w-3.5 h-3.5 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800">{area}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">Lucknow · {pin}</p>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-100 rounded-lg px-2 py-1 shrink-0">
                                <Clock className="w-3 h-3" /> 60 min
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ── Manual result confirmed ──────────── */}
                  {stage === "manual_result" && (
                    <motion.div key="manual_result"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }} className="pt-4">

                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: `${GREEN}18` }}>
                        <CheckCircle2 className="w-10 h-10" style={{ color: GREEN }} />
                      </motion.div>

                      <h2 className="text-xl font-black text-center mb-1" style={{ color: BRAND }}>
                        Great choice! 🏗️
                      </h2>
                      <p className="text-[12px] text-slate-400 text-center mb-5">
                        60-minute delivery is available here
                      </p>

                      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-black text-green-900 text-sm">{manualArea}</p>
                            <p className="text-[11px] text-green-600 font-semibold">Lucknow · {manualPin}</p>
                          </div>
                          <div className="ml-auto flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-100 rounded-lg px-2 py-1 shrink-0">
                            <Clock className="w-3 h-3" /> 60 min
                          </div>
                        </div>
                      </div>

                      <button onClick={confirmManual}
                        className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 mb-3 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${GREEN}, #1e6b30)`, boxShadow: `0 6px 20px ${GREEN}40` }}>
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm This Location →
                      </button>

                      <button onClick={() => { setManualPin(""); setStage("manual"); }}
                        className="w-full py-2.5 rounded-xl text-slate-500 font-bold text-sm">
                        ← Choose a different area
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

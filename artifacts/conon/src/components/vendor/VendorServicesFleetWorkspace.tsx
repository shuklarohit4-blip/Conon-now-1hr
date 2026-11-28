import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Tractor,
  HardHat,
  Plus,
  ToggleLeft,
  ToggleRight,
  Camera,
  CheckCircle2,
  Clock,
  KeyRound,
  Gauge,
  PauseCircle,
  PlayCircle,
  Radio,
  ShieldCheck,
  Upload,
  X,
  Phone,
  IndianRupee,
  Zap,
} from "lucide-react";
import { CononProductMedia } from "@/components/CononProductMedia";
import { compressImageToWebP } from "@/services/adminMasterCatalog";
import { useVendorTheme } from "@/context/VendorThemeContext";
import { useVendorLanguage } from "@/context/VendorLanguageContext";
import { playOrderChime } from "@/lib/sound";
import {
  servicesRentalsSync,
  type ServiceCatalogItem,
  type MachineRentalCatalogItem,
  type VendorFleetListing,
  type ServiceBookingRecord,
  type MachineRentalBookingRecord,
} from "@/services/servicesRentalsSync";

interface Props {
  vendorHubId: string;
  vendorName: string;
  vendorZone?: string;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function VendorServicesFleetWorkspace({
  vendorHubId,
  vendorName,
  vendorZone = "Lucknow Core",
}: Props) {
  const { isDark } = useVendorTheme();
  const { lang } = useVendorLanguage();

  const [serviceCatalog, setServiceCatalog] = useState<ServiceCatalogItem[]>([]);
  const [rentalCatalog, setRentalCatalog] = useState<MachineRentalCatalogItem[]>([]);
  const [listings, setListings] = useState<VendorFleetListing[]>([]);
  const [serviceBookings, setServiceBookings] = useState<ServiceBookingRecord[]>([]);
  const [rentalBookings, setRentalBookings] = useState<MachineRentalBookingRecord[]>([]);

  // Listing Creation Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [listingType, setListingType] = useState<"RENTAL" | "SERVICE">("RENTAL");
  const [masterItemId, setMasterItemId] = useState("rent-jcb-3dx");
  const [customTitle, setCustomTitle] = useState("");
  const [hourlyWetRate, setHourlyWetRate] = useState("950");
  const [shiftWetRate, setShiftWetRate] = useState("6500");
  const [weeklyWetRate, setWeeklyWetRate] = useState("36000");
  const [hourlyDryRate, setHourlyDryRate] = useState("750");
  const [shiftDryRate, setShiftDryRate] = useState("5200");
  const [weeklyDryRate, setWeeklyDryRate] = useState("29000");
  const [rcExpiry, setRcExpiry] = useState("2027-06-30");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Operational Action Dialogs (HMR Optical / Selfie Haziri OTPs)
  const [activeActionModal, setActiveActionModal] = useState<
    | { kind: "SERVICE_HAZIRI"; booking: ServiceBookingRecord }
    | { kind: "SERVICE_COMPLETE"; booking: ServiceBookingRecord }
    | { kind: "RENTAL_START_HMR"; booking: MachineRentalBookingRecord }
    | { kind: "RENTAL_END_HMR"; booking: MachineRentalBookingRecord }
    | null
  >(null);
  const [otpInput, setOtpInput] = useState("");
  const [hmrInput, setHmrInput] = useState("4120.5");
  const [photoInput, setPhotoInput] = useState("");
  const actionPhotoRef = useRef<HTMLInputElement>(null);

  const loadAll = async () => {
    const [sc, rc, fl, sb, rb] = await Promise.all([
      servicesRentalsSync.fetchServiceCatalog(),
      servicesRentalsSync.fetchRentalCatalog(),
      servicesRentalsSync.fetchFleetListings(vendorHubId),
      servicesRentalsSync.fetchServiceBookings(),
      servicesRentalsSync.fetchRentalBookings(),
    ]);
    setServiceCatalog(sc);
    setRentalCatalog(rc);
    setListings(fl);
    setServiceBookings(sb);
    setRentalBookings(rb);
  };

  useEffect(() => {
    void loadAll();
    const unsub = servicesRentalsSync.subscribe((ev) => {
      if (ev === "service:new_booking" || ev === "rental:new_booking") {
        playOrderChime();
        toast.info(
          lang === "hi"
            ? "नया सर्विस/मशीन बुकिंग बज़र!"
            : "🔔 New Customer Service/Rental Booking Incoming!"
        );
      }
      void loadAll();
    });
    return () => unsub();
  }, [vendorHubId, lang]);

  // Auto-populate rates when selecting master template
  const handleSelectMasterTemplate = (id: string, kind: "RENTAL" | "SERVICE") => {
    setMasterItemId(id);
    if (kind === "RENTAL") {
      const m = rentalCatalog.find((r) => r.id === id);
      if (m) {
        setCustomTitle(m.modelName);
        setHourlyWetRate(String(m.wetRates.hour));
        setShiftWetRate(String(m.wetRates.shift));
        setWeeklyWetRate(String(m.wetRates.week));
        setHourlyDryRate(String(m.dryRates.hour));
        setShiftDryRate(String(m.dryRates.shift));
        setWeeklyDryRate(String(m.dryRates.week));
        setCustomPhotoUrl(m.imageUrl);
      }
    } else {
      const s = serviceCatalog.find((sv) => sv.id === id);
      if (s) {
        setCustomTitle(s.tradeName);
        setShiftWetRate(String(s.shiftRate));
        setHourlyWetRate(String(Math.round(s.shiftRate / 8)));
        setWeeklyWetRate(String(s.shiftRate * 6));
        setCustomPhotoUrl(s.imageUrl);
      }
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>, target: "LISTING" | "ACTION") => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const webp = await compressImageToWebP(file, 700, 0.84);
      if (target === "LISTING") setCustomPhotoUrl(webp);
      else setPhotoInput(webp);
      toast.success(lang === "hi" ? "फ़ोटो अपलोड हो गई" : "Photo attached & compressed");
    } catch {
      toast.error("Could not process photo");
    }
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await servicesRentalsSync.saveFleetListing({
        vendorHubId,
        vendorName,
        zone: vendorZone,
        itemType: listingType,
        masterItemId,
        customTitle: customTitle.trim() || undefined,
        hourlyWetRate: Number(hourlyWetRate || 0),
        shiftWetRate: Number(shiftWetRate || 0),
        weeklyWetRate: Number(weeklyWetRate || 0),
        hourlyDryRate: Number(hourlyDryRate || 0),
        shiftDryRate: Number(shiftDryRate || 0),
        weeklyDryRate: Number(weeklyDryRate || 0),
        rcOrFitnessExpiry: rcExpiry || undefined,
        customPhotoUrl: customPhotoUrl || undefined,
        isAvailable: true,
      });
      setAddModalOpen(false);
      toast.success(
        lang === "hi"
          ? "मशीन/टीम लाइव स्टोरफ्रंट पर जुड़ गई!"
          : "Added & Synced Live to Customer Storefront!"
      );
      void loadAll();
    } catch {
      toast.error("Failed to save listing");
    }
  };

  const handleToggleListing = async (id: string) => {
    const res = await servicesRentalsSync.toggleFleetAvailability(id);
    if (res) {
      toast.success(
        res.isAvailable
          ? lang === "hi" ? "उपलब्ध (Available) सेट किया गया" : "Marked Available for Booking"
          : lang === "hi" ? "व्यस्त (Busy on Site) सेट किया गया" : "Marked Busy on Site"
      );
      void loadAll();
    }
  };

  const handleAcceptService = async (b: ServiceBookingRecord) => {
    await servicesRentalsSync.acceptServiceBooking(b.id, {
      vendorHubId,
      vendorName,
      crewLeadName: vendorName,
      crewPhone: "+91 94150 00000",
    });
    toast.success(`Shift #${b.shortId} Accepted!`);
    void loadAll();
  };

  const handleAcceptRental = async (b: MachineRentalBookingRecord) => {
    await servicesRentalsSync.acceptRentalBooking(b.id, {
      vendorHubId,
      vendorName,
      operatorId: `OP-${vendorHubId}`,
      operatorName: `${vendorName} Operator`,
      machinePlate: "UP 32 EQ 4401",
    });
    toast.success(`Rental #${b.shortId} Accepted & Sent to Operator Cockpit!`);
    void loadAll();
  };

  const handleSubmitModalAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionModal) return;
    try {
      if (activeActionModal.kind === "SERVICE_HAZIRI") {
        await servicesRentalsSync.haziriCheckinService(activeActionModal.booking.id, {
          startOtp: otpInput,
          selfieHaziriUrl: photoInput || undefined,
        });
        toast.success(lang === "hi" ? "सेल्फी हाज़िरी वेरिफाइड! काम शुरू।" : "GPS Selfie Haziri Verified & Shift Started!");
      } else if (activeActionModal.kind === "SERVICE_COMPLETE") {
        await servicesRentalsSync.completeServiceShift(activeActionModal.booking.id, {
          endOtp: otpInput,
          workDonePhotoUrl: photoInput || undefined,
        });
        toast.success(lang === "hi" ? "शिफ्ट पूरी! पेआउट एडमिन एस्क्रो कतार में।" : "Shift Completed! Queued for Admin Escrow Release.");
      } else if (activeActionModal.kind === "RENTAL_START_HMR") {
        await servicesRentalsSync.startRentalHmr(activeActionModal.booking.id, {
          startOtp: otpInput,
          startHmr: Number(hmrInput || 4120.5),
          startHmrPhoto: photoInput || undefined,
        });
        toast.success(lang === "hi" ? "Start HMR लॉक हो गया!" : "Start Optical HMR Locked! Meter Running.");
      } else if (activeActionModal.kind === "RENTAL_END_HMR") {
        await servicesRentalsSync.completeRentalHmr(activeActionModal.booking.id, {
          endOtp: otpInput,
          endHmr: Number(hmrInput || 4125.5),
          endHmrPhoto: photoInput || undefined,
        });
        toast.success(lang === "hi" ? "End HMR लॉक व बिल तैयार!" : "End HMR Locked! Final Optical Bill Queued for Escrow Release.");
      }
      setActiveActionModal(null);
      setOtpInput("");
      setPhotoInput("");
      void loadAll();
    } catch (err: any) {
      toast.error(err.message || "Action failed — check OTP");
    }
  };

  const cardClass = isDark
    ? "bg-[#111827] border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-xs";
  const innerClass = isDark
    ? "bg-[#090D18] border-slate-800"
    : "bg-slate-50 border-slate-200";
  const subTextClass = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="space-y-6">
      {/* WORKSPACE HEADER */}
      <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${cardClass}`}>
        <div>
          <div className="flex items-center gap-2">
            <Tractor className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black">
              {lang === "hi"
                ? "सेवाएं व मशीन फ्लीट प्रबंधन (Services & Fleet)"
                : "Partner Services & Heavy Fleet Operations"}
            </h2>
          </div>
          <p className={`text-xs mt-1 ${subTextClass}`}>
            {lang === "hi"
              ? "अपनी जेसीबी/मिक्सर मशीनें व मिस्त्री टीम जोड़ें, 1-टैप उपलब्ध/व्यस्त चुनें और लाइव बुकिंग स्वीकार करें।"
              : "Manage rental machinery, skilled labour squads, Wet/Dry rates & live GPS Haziri / Optical HMR bookings."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            handleSelectMasterTemplate("rent-jcb-3dx", "RENTAL");
            setListingType("RENTAL");
            setAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === "hi" ? "+ नई मशीन या टीम जोड़ें" : "+ Add Machine / Crew Listing"}</span>
        </button>
      </div>

      {/* SECTION 1: LIVE SERVICE & RENTAL BUZZER QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Machine Rentals Queue */}
        <div className={`p-5 rounded-3xl border space-y-4 ${cardClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-500" />
              <span>
                {lang === "hi"
                  ? `लाइव मशीन बुकिंग कतार (${rentalBookings.length})`
                  : `Live Machine Rental Buzzer Queue (${rentalBookings.length})`}
              </span>
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-500 border border-amber-400/30">
              SAC 9973
            </span>
          </div>

          {rentalBookings.length === 0 ? (
            <div className={`p-6 rounded-2xl border text-center ${innerClass}`}>
              <Radio className="w-8 h-8 text-amber-500/60 mx-auto mb-2 animate-pulse" />
              <p className="text-xs font-bold">
                {lang === "hi"
                  ? "कोई सक्रिय मशीन बुकिंग नहीं — ग्राहक बुकिंग आते ही बज़र बजेगा"
                  : "Clean Slate Standby — Machine Bookings Will Buzz Live Here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rentalBookings.map((rb) => (
                <div key={rb.id} className={`p-4 rounded-2xl border space-y-3 ${innerClass}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-amber-500">#{rb.shortId}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                          PREPAID ESCROW ✓
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">
                          {rb.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <h4 className="text-sm font-black mt-1">{rb.modelName} ({rb.fuelMode} Rate)</h4>
                      <p className={`text-[11px] ${subTextClass}`}>
                        {rb.customerName} • {rb.siteAddress} ({rb.lucknowZone})
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-sm font-black text-emerald-500">{inr(rb.partnerPayout)}</span>
                      <span className={`block text-[10px] ${subTextClass}`}>Net Partner Pay</span>
                    </div>
                  </div>

                  {/* Operational Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/20">
                    {rb.status === "BOOKED" && (
                      <button
                        type="button"
                        onClick={() => handleAcceptRental(rb)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                      >
                        ✓ {lang === "hi" ? "1-टैप स्वीकार करें व ऑपरेटर भेजें" : "1-Tap Accept & Assign Operator"}
                      </button>
                    )}

                    {rb.status === "PARTNER_ACCEPTED" && (
                      <button
                        type="button"
                        onClick={() => {
                          setHmrInput("4120.5");
                          setOtpInput(rb.startOtp);
                          setActiveActionModal({ kind: "RENTAL_START_HMR", booking: rb });
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs cursor-pointer"
                      >
                        📸 {lang === "hi" ? "Start HMR फ़ोटो + Start OTP दर्ज करें" : "Lock Start HMR Photo + Start OTP"}
                      </button>
                    )}

                    {(rb.status === "RUNNING_HMR" || rb.status === "PAUSED_BREAKDOWN") && (
                      <button
                        type="button"
                        onClick={() => {
                          setHmrInput(String((rb.startHmr || 4120.5) + rb.quantityUnits));
                          setOtpInput(rb.endOtp);
                          setActiveActionModal({ kind: "RENTAL_END_HMR", booking: rb });
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer"
                      >
                        🏁 {lang === "hi" ? "End HMR फ़ोटो + End OTP (बिल बनाएं)" : "Submit End HMR + End OTP"}
                      </button>
                    )}

                    {rb.escrowStatus === "AWAITING_RELEASE" && (
                      <span className="text-xs font-bold text-amber-500">
                        ⏳ {lang === "hi" ? "एडमिन एस्क्रो रिलीज़ का इंतज़ार" : "Awaiting Admin Escrow Release"}
                      </span>
                    )}

                    {rb.escrowStatus === "SETTLED" && (
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> UPI Settled • {rb.settledUtr}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Skilled Services Queue */}
        <div className={`p-5 rounded-3xl border space-y-4 ${cardClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black flex items-center gap-2">
              <HardHat className="w-4 h-4 text-emerald-500" />
              <span>
                {lang === "hi"
                  ? `लाइव स्किल्ड सर्विस कतार (${serviceBookings.length})`
                  : `Live Skilled Service Squad Queue (${serviceBookings.length})`}
              </span>
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              SAC 9954
            </span>
          </div>

          {serviceBookings.length === 0 ? (
            <div className={`p-6 rounded-2xl border text-center ${innerClass}`}>
              <HardHat className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
              <p className="text-xs font-bold">
                {lang === "hi"
                  ? "कोई सक्रिय मिस्त्री शिफ्ट बुकिंग नहीं"
                  : "Clean Slate Standby — Site Squad Bookings Will Buzz Here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {serviceBookings.map((sb) => (
                <div key={sb.id} className={`p-4 rounded-2xl border space-y-3 ${innerClass}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-emerald-500">#{sb.shortId}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                          PREPAID ESCROW ✓
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/15 text-amber-500">
                          {sb.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <h4 className="text-xs font-black mt-1">
                        {sb.squadItems.map((i) => `${i.qty}× ${i.tradeName}`).join(", ")}
                      </h4>
                      <p className={`text-[11px] ${subTextClass}`}>
                        {sb.customerName} • {sb.siteAddress} ({sb.bookingDate})
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-sm font-black text-emerald-500">{inr(sb.partnerPayout)}</span>
                      <span className={`block text-[10px] ${subTextClass}`}>Net Payout</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/20">
                    {sb.status === "BOOKED" && (
                      <button
                        type="button"
                        onClick={() => handleAcceptService(sb)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                      >
                        ✓ {lang === "hi" ? "1-टैप शिफ्ट स्वीकार करें" : "1-Tap Accept Shift"}
                      </button>
                    )}

                    {sb.status === "PARTNER_ACCEPTED" && (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpInput(sb.startOtp);
                          setActiveActionModal({ kind: "SERVICE_HAZIRI", booking: sb });
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs cursor-pointer"
                      >
                        📸 {lang === "hi" ? "GPS ग्रुप सेल्फी हाज़िरी + Start OTP" : "GPS Selfie Haziri + Start OTP"}
                      </button>
                    )}

                    {sb.status === "HAZIRI_VERIFIED_IN_PROGRESS" && (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpInput(sb.endOtp);
                          setActiveActionModal({ kind: "SERVICE_COMPLETE", booking: sb });
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer"
                      >
                        ✅ {lang === "hi" ? "काम पूरा फ़ोटो + End OTP सबमिट करें" : "Work-Done Photo + End OTP"}
                      </button>
                    )}

                    {sb.escrowStatus === "AWAITING_RELEASE" && (
                      <span className="text-xs font-bold text-amber-500">
                        ⏳ {lang === "hi" ? "एडमिन एस्क्रो रिलीज़ कतार में" : "Awaiting Admin Payout Release"}
                      </span>
                    )}

                    {sb.escrowStatus === "SETTLED" && (
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> UPI Settled • {sb.settledUtr}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: MY FLEET & CREW LISTINGS WITH 1-TAP AVAILABLE / BUSY TOGGLE */}
      <div className={`p-5 rounded-3xl border space-y-4 ${cardClass}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black">
              {lang === "hi"
                ? `मेरी लिस्ट की गई मशीनें व मिस्त्री टीमें (${listings.length})`
                : `My Listed Machines & Trade Crews (${listings.length})`}
            </h3>
            <p className={`text-xs ${subTextClass}`}>
              {lang === "hi"
                ? "1-टैप से 'Available / Busy' बदलें — सीधे ग्राहक ऐप पर लाइव सिंक होगा।"
                : "Flip the 1-Tap Available / Busy switch to update Customer Storefront availability instantly."}
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className={`p-8 rounded-2xl border text-center ${innerClass}`}>
            <Tractor className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h4 className="text-sm font-black">
              {lang === "hi" ? "अभी कोई मशीन या मिस्त्री टीम लिस्ट नहीं है" : "No Machines or Crews Listed Yet"}
            </h4>
            <p className={`text-xs max-w-md mx-auto mt-1 mb-4 ${subTextClass}`}>
              {lang === "hi"
                ? "अपनी जेसीबी, मिक्सर, वाइब्रेटर या मिस्त्री टीम को Wet/Dry रेट्स के साथ यहाँ जोड़ें।"
                : "Add your JCB, Concrete Mixer, Vibrator, or Mason Crew with Wet/Dry rates and RC expiry to start receiving direct site bookings."}
            </p>
            <button
              type="button"
              onClick={() => {
                handleSelectMasterTemplate("rent-jcb-3dx", "RENTAL");
                setAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs cursor-pointer"
            >
              + Add Your First Machine / Crew
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((item) => (
              <div key={item.id} className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${innerClass}`}>
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700/40 bg-white">
                    <CononProductMedia
                      mediaType={item.itemType === "RENTAL" ? "rental" : "service"}
                      itemId={item.masterItemId}
                      title={item.customTitle || item.masterItemId}
                      src={item.customPhotoUrl}
                      variant="thumb"
                      showGalleryBadge={false}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase text-amber-500">{item.itemType}</span>
                    <h4 className="text-xs font-black truncate">{item.customTitle || item.masterItemId}</h4>
                    <p className={`text-[11px] font-mono ${subTextClass}`}>
                      Wet: {inr(item.shiftWetRate)}/shift • {inr(item.hourlyWetRate)}/hr
                    </p>
                    {item.rcOrFitnessExpiry && (
                      <p className={`text-[10px] ${subTextClass}`}>RC/Fit Exp: {item.rcOrFitnessExpiry}</p>
                    )}
                  </div>
                </div>

                {/* 1-Tap Available / Busy Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleListing(item.id)}
                  className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-between transition cursor-pointer border ${
                    item.isAvailable
                      ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/40"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/40"
                  }`}
                >
                  <span>
                    {item.isAvailable
                      ? lang === "hi" ? "● उपलब्ध (Available Now)" : "● Available Now"
                      : lang === "hi" ? "● साइट पर व्यस्त (Busy)" : "● Busy on Site"}
                  </span>
                  {item.isAvailable ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD MACHINE / CREW LISTING MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveListing}
            className={`w-full max-w-lg rounded-3xl border p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl ${cardClass}`}
          >
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
              <h3 className="text-base font-black">
                {lang === "hi" ? "नई मशीन या कारीगर टीम जोड़ें" : "Add Machine or Skilled Crew Listing"}
              </h3>
              <button type="button" onClick={() => setAddModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setListingType("RENTAL");
                  if (rentalCatalog[0]) handleSelectMasterTemplate(rentalCatalog[0].id, "RENTAL");
                }}
                className={`py-2 rounded-xl text-xs font-black border cursor-pointer ${
                  listingType === "RENTAL" ? "bg-amber-400 text-slate-950 border-amber-400" : innerClass
                }`}
              >
                🚜 Heavy Machine (SAC 9973)
              </button>
              <button
                type="button"
                onClick={() => {
                  setListingType("SERVICE");
                  if (serviceCatalog[0]) handleSelectMasterTemplate(serviceCatalog[0].id, "SERVICE");
                }}
                className={`py-2 rounded-xl text-xs font-black border cursor-pointer ${
                  listingType === "SERVICE" ? "bg-emerald-500 text-slate-950 border-emerald-500" : innerClass
                }`}
              >
                👷 Skilled Crew (SAC 9954)
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="font-bold block mb-1">Master Equipment / Trade Class</label>
                <select
                  value={masterItemId}
                  onChange={(e) => handleSelectMasterTemplate(e.target.value, listingType)}
                  className={`w-full px-3 py-2 rounded-xl border font-bold ${innerClass}`}
                >
                  {(listingType === "RENTAL" ? rentalCatalog : serviceCatalog).map((it: any) => (
                    <option key={it.id} value={it.id}>
                      {it.modelName || it.tradeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Custom Machine Model / Crew Name</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${innerClass}`}
                  placeholder="e.g. JCB 3DX Super (UP 32 EQ 4401)"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold block mb-1">Wet Hourly (₹)</label>
                  <input type="number" value={hourlyWetRate} onChange={(e) => setHourlyWetRate(e.target.value)} className={`w-full px-2.5 py-2 rounded-xl border font-mono ${innerClass}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold block mb-1">Wet Shift (₹)</label>
                  <input type="number" value={shiftWetRate} onChange={(e) => setShiftWetRate(e.target.value)} className={`w-full px-2.5 py-2 rounded-xl border font-mono ${innerClass}`} />
                </div>
                <div>
                  <label className="text-[10px] font-bold block mb-1">Wet Weekly (₹)</label>
                  <input type="number" value={weeklyWetRate} onChange={(e) => setWeeklyWetRate(e.target.value)} className={`w-full px-2.5 py-2 rounded-xl border font-mono ${innerClass}`} />
                </div>
              </div>

              {listingType === "RENTAL" && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold block mb-1">Dry Hourly (₹)</label>
                    <input type="number" value={hourlyDryRate} onChange={(e) => setHourlyDryRate(e.target.value)} className={`w-full px-2.5 py-2 rounded-xl border font-mono ${innerClass}`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold block mb-1">Dry Shift (₹)</label>
                    <input type="number" value={shiftDryRate} onChange={(e) => setShiftDryRate(e.target.value)} className={`w-full px-2.5 py-2 rounded-xl border font-mono ${innerClass}`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold block mb-1">RC/Fit Expiry</label>
                    <input type="date" value={rcExpiry} onChange={(e) => setRcExpiry(e.target.value)} className={`w-full px-2 py-2 rounded-xl border font-mono ${innerClass}`} />
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold block mb-1">Real Equipment / Crew Photo (Optional Upload)</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadPhoto(e, "LISTING")} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={`w-full py-2.5 px-3 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${innerClass}`}
                >
                  <Upload className="w-4 h-4 text-amber-500" />
                  <span>{customPhotoUrl ? "✓ Custom Photo Ready (Click to Replace)" : "Upload Equipment / Crew Photo"}</span>
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer">
              Save &amp; Sync Live to Storefront
            </button>
          </form>
        </div>
      )}

      {/* OPTICAL HMR / GPS SELFIE HAZIRI SUBMISSION MODAL */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitModalAction}
            className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${cardClass}`}
          >
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
              <h3 className="text-sm font-black">
                {activeActionModal.kind === "SERVICE_HAZIRI" && "GPS Group Selfie Haziri Check-In"}
                {activeActionModal.kind === "SERVICE_COMPLETE" && "Complete Shift & Verify End OTP"}
                {activeActionModal.kind === "RENTAL_START_HMR" && "Start HMR Optical Lock"}
                {activeActionModal.kind === "RENTAL_END_HMR" && "End HMR Optical Lock & Compute Bill"}
              </h3>
              <button type="button" onClick={() => setActiveActionModal(null)} className="p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {(activeActionModal.kind === "RENTAL_START_HMR" || activeActionModal.kind === "RENTAL_END_HMR") && (
              <div className="text-xs">
                <label className="font-bold block mb-1">
                  {activeActionModal.kind === "RENTAL_START_HMR" ? "Starting Dashboard HMR Reading (Hours)" : "Ending Dashboard HMR Reading (Hours)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={hmrInput}
                  onChange={(e) => setHmrInput(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border font-mono font-black text-base ${innerClass}`}
                />
              </div>
            )}

            <div className="text-xs">
              <label className="font-bold block mb-1">Customer 4-Digit Verification OTP</label>
              <input
                type="text"
                maxLength={4}
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border font-mono font-black text-center text-lg ${innerClass}`}
              />
            </div>

            <div className="text-xs">
              <label className="font-bold block mb-1">Optical Proof Photo (Dashboard HMR / Group Selfie)</label>
              <input ref={actionPhotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadPhoto(e, "ACTION")} />
              <button
                type="button"
                onClick={() => actionPhotoRef.current?.click()}
                className={`w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 font-bold cursor-pointer ${innerClass}`}
              >
                <Camera className="w-4 h-4 text-amber-500" />
                <span>{photoInput ? "✓ Optical Photo Captured" : "Snap / Attach Proof Photo (Optional in Sandbox)"}</span>
              </button>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer">
              Submit &amp; Sync Real-Time Status
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
export default VendorServicesFleetWorkspace;

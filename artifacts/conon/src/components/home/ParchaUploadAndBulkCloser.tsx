import React, { useMemo, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  FileText,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  Truck,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useGetCart } from "@workspace/api-client-react";
import { resolveApiUrl } from "@/lib/apiBase";
import { calculateBulkOrderTier } from "@workspace/shared";

const LUCKNOW_LOCALITIES = [
  "Gomti Nagar / Ext",
  "Sushant Golf City",
  "Aliganj / Jankipuram",
  "Vrindavan Yojna",
  "Indira Nagar",
  "Barabanki",
];

const SLAB_1_FREE_DELIVERY = 15000;
const SLAB_2_BULK_DISCOUNT = 50000;
const SUPPORT_WHATSAPP_E164 = "915224721924";

interface SavedParchaLead {
  referenceId: string;
  phone: string;
  locality: string;
  notes: string;
  fileName: string;
  fileType: string;
  submittedAt: string;
}

export const ParchaUploadAndBulkCloser: React.FC = () => {
  const { data: cart } = useGetCart();
  const cartTotal = Math.max(0, Math.round(Number(cart?.grandTotal ?? 0)));

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [locality, setLocality] = useState(LUCKNOW_LOCALITIES[0]);
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedLead, setConfirmedLead] = useState<SavedParchaLead | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slabProgress = useMemo(() => {
    const tier = calculateBulkOrderTier(cartTotal);
    return {
      pct: tier.progressPctTo50k,
      toSlab1: tier.remainingForFreeDelivery,
      toSlab2: tier.remainingForMegaDiscount,
      tierLabel: tier.tierLabel,
      unlockedSlab1: tier.hasFreeExpressDelivery,
      unlockedSlab2: tier.hasMegaBulkDiscount,
    };
  }, [cartTotal]);

  const handleFileChosen = (file: File | null | undefined) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"];
    const ext = file.name.toLowerCase();
    const isAllowed =
      validTypes.includes(file.type) ||
      ext.endsWith(".jpg") ||
      ext.endsWith(".jpeg") ||
      ext.endsWith(".png") ||
      ext.endsWith(".pdf");
    if (!isAllowed) {
      toast.error("Please upload a JPG, PNG, or PDF file.");
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreviewDataUrl(String(reader.result || ""));
      reader.readAsDataURL(file);
    } else {
      setPreviewDataUrl("");
    }
  };

  const resetModalForm = () => {
    setSelectedFile(null);
    setPreviewDataUrl("");
    setNotes("");
    setConfirmedLead(null);
  };

  const handleOpenModal = () => {
    setConfirmedLead(null);
    setModalOpen(true);
  };

  const handleSubmitParcha = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error("Enter a valid 10-digit WhatsApp mobile number");
      return;
    }

    setSubmitting(true);
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `CON-BOQ-${randomCode}`;
    const leadRecord: SavedParchaLead = {
      referenceId,
      phone: cleanPhone,
      locality,
      notes: notes.trim(),
      fileName: selectedFile?.name || "Handwritten / Verbal BOQ Note",
      fileType: selectedFile?.type || "text/plain",
      submittedAt: new Date().toISOString(),
    };

    try {
      await fetch(resolveApiUrl("/api/builder-kit/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Parcha Upload (${cleanPhone})`,
          phone: cleanPhone,
          lucknowZone: locality,
          builtUpSqFt: 1000,
          qualityTier: "STANDARD",
          wallType: "RED_BRICK",
          floors: 1,
          grandTotal: Math.max(15000, cartTotal || 15000),
          notes: `Ref: ${referenceId} | File: ${leadRecord.fileName}${notes.trim() ? ` | ${notes.trim()}` : ""}`,
          boqSummary: {
            source: "PARCHA_UPLOAD",
            referenceId,
            fileName: leadRecord.fileName,
            locality,
          },
        }),
      }).catch(() => undefined);

      try {
        const existingRaw = localStorage.getItem("conon_parcha_leads");
        const existing: SavedParchaLead[] = existingRaw ? JSON.parse(existingRaw) : [];
        localStorage.setItem(
          "conon_parcha_leads",
          JSON.stringify([leadRecord, ...(Array.isArray(existing) ? existing : [])].slice(0, 25))
        );
      } catch {
        // Ignore storage quota errors
      }

      setConfirmedLead(leadRecord);
      toast.success("Parcha / BOQ sent to Lucknow Hub!", {
        description: `Reference ${referenceId} • Rate sheet in ~15 mins`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const directWhatsappHref = `https://wa.me/${SUPPORT_WHATSAPP_E164}?text=${encodeURIComponent(
    "Namaste Conon Now! Main apna Mistri Parcha / BOQ list bhej raha hoon. Kripya Lucknow rate & 60-min dispatch quote dein."
  )}`;

  const confirmWhatsappHref = confirmedLead
    ? `https://wa.me/${SUPPORT_WHATSAPP_E164}?text=${encodeURIComponent(
        `Namaste Conon Now! Parcha Ref: ${confirmedLead.referenceId}\nSite Locality: ${confirmedLead.locality}\nWhatsApp: +91 ${confirmedLead.phone}\nFile: ${confirmedLead.fileName}${
          confirmedLead.notes ? `\nNotes: ${confirmedLead.notes}` : ""
        }`
      )}`
    : directWhatsappHref;

  return (
    <section aria-label="Parcha Quote and Bulk Order Savings" className="mt-8 px-4">
      {/* Dark Navy Split Command Card */}
      <div
        className="rounded-3xl overflow-hidden border border-slate-700/60 shadow-xl text-white p-5 sm:p-7"
        style={{
          background: "linear-gradient(135deg, #0B1B3D 0%, #10244E 58%, #12357A 100%)",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT COLUMN — Mistri Parcha / BOQ 15-Min Quote */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10.5px] font-black uppercase tracking-wider">
                ⚡ LUCKNOW SITE DESK
              </span>

              <h2 className="font-display font-black text-lg sm:text-2xl text-white leading-tight">
                Mistri ka Parcha ya BOQ hai? 15 Min mein Lucknow Rate Paayein
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Upload a photo of your handwritten list, PDF estimate, or Excel BOQ — our Lucknow hub team builds your exact cart automatically.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleOpenModal}
                className="px-4 sm:px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-[13px] shadow-lg shadow-amber-500/20 active:scale-[0.98] transition flex items-center gap-2 cursor-pointer"
              >
                <span>📸 Upload Parcha / BOQ</span>
              </button>

              <a
                href={directWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 sm:px-5 py-3 rounded-2xl bg-[#12357A]/80 hover:bg-[#12357A] border border-sky-300/35 text-white font-black text-xs sm:text-[13px] active:scale-[0.98] transition flex items-center gap-2"
              >
                <span>💬 Send List on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN — Live Bulk Order Tier Meter */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-950/55 border border-white/10 p-4 sm:p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Live Bulk Savings Meter
                </p>
                <p className="text-base sm:text-lg font-black text-white mt-0.5">
                  ₹{cartTotal.toLocaleString("en-IN")}
                  <span className="text-xs font-semibold text-slate-400 ml-1.5">Cart Subtotal</span>
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                  slabProgress.unlockedSlab2
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                    : slabProgress.unlockedSlab1
                    ? "bg-sky-500/20 text-sky-300 border border-sky-400/40"
                    : "bg-white/10 text-slate-300 border border-white/15"
                }`}
              >
                {slabProgress.unlockedSlab2
                  ? "₹5,000 OFF Unlocked"
                  : slabProgress.unlockedSlab1
                  ? "Free Delivery Active"
                  : "Save up to ₹5,000"}
              </span>
            </div>

            {/* Progress Bar with Slab Markers */}
            <div className="space-y-2.5">
              <div className="relative h-3 rounded-full bg-slate-800/90 overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${slabProgress.pct}%`,
                    background: slabProgress.unlockedSlab2
                      ? "linear-gradient(90deg, #10B981, #F59E0B)"
                      : "linear-gradient(90deg, #3B82F6, #F59E0B)",
                    boxShadow: "0 0 14px rgba(245, 158, 11, 0.55)",
                  }}
                />
                {/* ₹15,000 slab tick at 30% */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                  style={{ left: "30%" }}
                  title="Slab 1: ₹15,000"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div
                  className={`p-2 rounded-xl border ${
                    slabProgress.unlockedSlab1
                      ? "bg-emerald-500/15 border-emerald-400/35 text-emerald-200"
                      : "bg-white/5 border-white/10 text-slate-300"
                  }`}
                >
                  <p className="font-black flex items-center gap-1">
                    <Truck className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>Slab 1 • ₹15,000</span>
                  </p>
                  <p className="text-[10px] opacity-85 mt-0.5 leading-snug">
                    Free Express Site Delivery + Unloading
                  </p>
                </div>

                <div
                  className={`p-2 rounded-xl border ${
                    slabProgress.unlockedSlab2
                      ? "bg-emerald-500/15 border-emerald-400/35 text-emerald-200"
                      : "bg-white/5 border-white/10 text-slate-300"
                  }`}
                >
                  <p className="font-black flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                    <span>Slab 2 • ₹50,000</span>
                  </p>
                  <p className="text-[10px] opacity-85 mt-0.5 leading-snug">
                    Flat ₹5,000 Extra OFF + Dedicated Tempo
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Helper Copy */}
            <div className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-[11.5px] font-bold text-slate-100 leading-snug">
              {slabProgress.unlockedSlab2 ? (
                <>🎉 Flat ₹5,000 Bulk Discount + Dedicated Tempo Unlocked!</>
              ) : slabProgress.unlockedSlab1 ? (
                <>
                  ✅ Free Delivery Unlocked! Add{" "}
                  <span className="text-amber-300">
                    ₹{slabProgress.toSlab2.toLocaleString("en-IN")}
                  </span>{" "}
                  more for Flat ₹5,000 OFF
                </>
              ) : (
                <>
                  Current Cart: ₹{cartTotal.toLocaleString("en-IN")} • Add{" "}
                  <span className="text-amber-300">
                    ₹{slabProgress.toSlab1.toLocaleString("en-IN")}
                  </span>{" "}
                  for Free Delivery, or{" "}
                  <span className="text-amber-300">
                    ₹{slabProgress.toSlab2.toLocaleString("en-IN")}
                  </span>{" "}
                  for ₹5,000 OFF
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ParchaUploadModal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark Navy Header */}
            <div className="bg-gradient-to-r from-[#0B1B3D] to-[#10244E] px-5 py-4 text-white flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  15-Min Lucknow Quote Desk
                </span>
                <h3 className="text-base font-black mt-1.5">
                  Upload Mistri Parcha or BOQ
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Supports JPG, PNG photos or PDF estimates
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close Parcha upload modal"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {confirmedLead ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Submitted Successfully
                  </p>
                  <h4 className="text-lg font-black text-[#0B1B3D] dark:text-white mt-1">
                    Ref ID: {confirmedLead.referenceId}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Lucknow hub desk will send your itemized rate sheet &amp; 1-click cart link on{" "}
                    <strong className="text-[#0B1B3D] dark:text-white">
                      +91 {confirmedLead.phone}
                    </strong>{" "}
                    within 15 minutes for <strong>{confirmedLead.locality}</strong>.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-left text-xs space-y-1">
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    Attachment: <span className="font-black">{confirmedLead.fileName}</span>
                  </p>
                  {confirmedLead.notes && (
                    <p className="text-slate-500 dark:text-slate-400">
                      Notes: {confirmedLead.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <a
                    href={confirmWhatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" /> Share Ref on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={resetModalForm}
                    className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitParcha} className="p-5 space-y-4 overflow-y-auto">
                {/* Drag & Drop / File Input */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChosen(e.target.files?.[0])}
                  />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFileChosen(e.dataTransfer.files?.[0]);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition ${
                      isDragging
                        ? "border-amber-400 bg-amber-50/60 dark:bg-amber-500/10"
                        : "border-slate-300 dark:border-slate-700 hover:border-[#12357A] bg-slate-50 dark:bg-slate-950/60"
                    }`}
                  >
                    {selectedFile ? (
                      <div className="flex items-center gap-3 text-left">
                        {previewDataUrl ? (
                          <img
                            src={previewDataUrl}
                            alt="Uploaded Parcha preview"
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-[#12357A]/10 text-[#12357A] dark:text-amber-300 flex items-center justify-center shrink-0">
                            <FileText className="w-7 h-7" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-[#0B1B3D] dark:text-white truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            Ready • {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                          <span className="text-[10.5px] font-bold text-[#12357A] dark:text-amber-300 underline">
                            Tap to replace file
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-2">
                        <div className="w-11 h-11 rounded-2xl bg-[#12357A]/10 text-[#12357A] dark:text-amber-300 flex items-center justify-center mx-auto">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-black text-[#0B1B3D] dark:text-white">
                          Tap or drag handwritten Parcha photo / PDF BOQ
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                          <Camera className="w-3 h-3" /> JPG, PNG, PDF supported
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 10-digit WhatsApp Number */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                    10-Digit WhatsApp Number *
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-hidden focus-within:border-[#12357A]">
                    <span className="px-3 py-2.5 text-xs font-black text-slate-500 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9876543210"
                      className="flex-1 px-3 py-2.5 text-sm font-bold text-[#0B1B3D] dark:text-white bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Lucknow Locality Chips */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1 mb-1.5">
                    <MapPin className="w-3 h-3" /> Lucknow Site Locality
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {LUCKNOW_LOCALITIES.map((loc) => {
                      const active = locality === loc;
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocality(loc)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                            active
                              ? "bg-[#12357A] text-white border-[#12357A]"
                              : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Notes */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                    Optional Notes (Urgency / Brand Preference)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. UltraTech OPC 53 bags chahiye aaj sham 5 baje tak..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-medium text-[#0B1B3D] dark:text-white outline-none focus:border-[#12357A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? "Sending to Lucknow Desk…" : "Get 15-Min Lucknow Rate Quote →"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

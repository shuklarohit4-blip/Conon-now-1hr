import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Star,
  Mic,
  MicOff,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Wallet,
  IndianRupee,
  X,
  Upload,
  ArrowRight,
  Clock,
  Truck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { feedbackSync, type DisputeTicket } from "@/services/feedbackSync";

export interface CustomerFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  driverName?: string;
  driverId?: string;
  driverAvatar?: string;
  hubId?: string;
  orderSummary?: string;
  vaultBalance?: number;
  onSuccess?: () => void;
}

const MATERIAL_POSITIVE_CHIPS = [
  "Fresh & Sealed ISI ✓",
  "Exact Quantity ✓",
  "Genuine Brand ✓",
];

const MATERIAL_ISSUE_CHIPS = [
  "Torn / Wet Bag",
  "Short Quantity",
  "Wrong Brand / Duplicate",
];

const DRIVER_PRAISE_BADGES = [
  { id: "hero", label: "On-Time 60m Hero", icon: "⚡" },
  { id: "tirpal", label: "Rain Tirpal Protected", icon: "🌧️" },
  { id: "clean", label: "Clean Unloading", icon: "📦" },
  { id: "polite", label: "Polite & Helpful", icon: "🤝" },
];

const TIP_OPTIONS = [0, 20, 50, 100];

const SAMPLE_VOICE_TRANSCRIPTS = [
  "Maal ekdum fresh tha, driver ne safe unload kiya aur barish me tirpal laga rakha tha.",
  "UltraTech ki saari boriyan fresh seal pack aayi hain, bilkul time pe delivery mili.",
  "Driver bhai ne 2nd floor tak unloading me madad ki, shandar service!",
];

export const CustomerDeliveryFeedbackModal: React.FC<CustomerFeedbackModalProps> = ({
  isOpen,
  onClose,
  orderId = "ord_dhalai_01",
  driverName = "Rajesh Kumar (Pilot DRV-LKO-201)",
  driverId = "DRV-LKO-201",
  driverAvatar = "/images/drivers/rajesh.webp",
  hubId = "hub-naka",
  orderSummary = "50 Bags UltraTech Super OPC Cement + TMT Steel",
  vaultBalance = 14500,
  onSuccess,
}) => {
  // Star rating
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Block A: Material chips
  const [selectedMaterialChips, setSelectedMaterialChips] = useState<string[]>([
    "Fresh & Sealed ISI ✓",
    "Exact Quantity ✓",
  ]);

  // Block B: Driver badges
  const [selectedDriverBadges, setSelectedDriverBadges] = useState<string[]>([
    "On-Time 60m Hero",
    "Clean Unloading",
  ]);

  // Block C: Tip & Voice Note
  const [selectedTip, setSelectedTip] = useState<number>(50);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const [voiceWaveActive, setVoiceWaveActive] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);

  // Auto-Escrow Shield / Damage Drawer
  const [isProtectionDrawerOpen, setIsProtectionDrawerOpen] = useState<boolean>(false);
  const [damagedQty, setDamagedQty] = useState<number>(2);
  const [claimType, setClaimType] = useState<"INSTANT_VAULT_REFUND" | "FREE_REPLACEMENT">("INSTANT_VAULT_REFUND");
  const [damagePhoto, setDamagePhoto] = useState<string | null>(null);
  const [isSamplePhotoUsed, setIsSamplePhotoUsed] = useState<boolean>(false);

  // Active Protection Ticket (if claim created)
  const [submittedTicket, setSubmittedTicket] = useState<DisputeTicket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Check if speech recognition is available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = "hi-IN"; // Hindi / Indian English

          recognition.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript;
            if (transcript) {
              setVoiceTranscript(transcript);
              toast.success("🎙️ Voice note transcribed!");
            }
            setIsRecording(false);
            setVoiceWaveActive(false);
          };

          recognition.onerror = () => {
            setIsRecording(false);
            setVoiceWaveActive(false);
          };

          recognition.onend = () => {
            setIsRecording(false);
            setVoiceWaveActive(false);
          };

          recognitionRef.current = recognition;
        } catch {
          setSpeechSupported(false);
        }
      }
    }
  }, []);

  // Listen for dispute resolution live
  useEffect(() => {
    const unsub = feedbackSync.subscribe((event) => {
      if (event.type === "DISPUTE_RESOLVED" && submittedTicket) {
        if (
          event.payload?.orderId === submittedTicket.orderId ||
          event.payload?.ticketId === submittedTicket.ticketId
        ) {
          setSubmittedTicket((prev) =>
            prev
              ? {
                  ...prev,
                  status:
                    event.payload.resolution === "DISPATCH_REPLACEMENT"
                      ? "APPROVED_REPLACEMENT"
                      : "APPROVED_REFUND",
                  resolvedAt: new Date().toISOString(),
                }
              : null
          );
          toast.success("⚡ Protection Ticket RESOLVED by Operations!", {
            description:
              event.payload.resolution === "DISPATCH_REPLACEMENT"
                ? "Replacement vehicle has been dispatched for 45-min arrival."
                : `₹${submittedTicket.claimAmount} refunded to your Living Material Vault!`,
          });
        }
      }
    });
    return () => unsub();
  }, [submittedTicket]);

  // Check if any damage chip is selected to open protection drawer
  const hasDamageIssue = selectedMaterialChips.some((chip) =>
    MATERIAL_ISSUE_CHIPS.includes(chip)
  );

  useEffect(() => {
    if (hasDamageIssue) {
      setIsProtectionDrawerOpen(true);
    }
  }, [hasDamageIssue]);

  const toggleMaterialChip = (chip: string) => {
    setSelectedMaterialChips((prev) => {
      if (prev.includes(chip)) {
        return prev.filter((c) => c !== chip);
      } else {
        // If an issue chip is clicked, keep it and trigger drawer
        return [...prev, chip];
      }
    });
  };

  const toggleDriverBadge = (badgeLabel: string) => {
    setSelectedDriverBadges((prev) =>
      prev.includes(badgeLabel)
        ? prev.filter((b) => b !== badgeLabel)
        : [...prev, badgeLabel]
    );
  };

  // Toggle or Simulate Voice Note Recording
  const handleToggleVoice = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      setVoiceWaveActive(false);
      return;
    }

    setIsRecording(true);
    setVoiceWaveActive(true);

    if (speechSupported && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        return;
      } catch {
        // fall through to simulation
      }
    }

    // High fidelity simulation fallback with Hindi/Hinglish speech
    setTimeout(() => {
      const randomText =
        SAMPLE_VOICE_TRANSCRIPTS[
          Math.floor(Math.random() * SAMPLE_VOICE_TRANSCRIPTS.length)
        ];
      setVoiceTranscript(randomText);
      setIsRecording(false);
      setVoiceWaveActive(false);
      toast.success("🎙️ Voice note recorded & transcribed (10-Sec Waveform)");
    }, 2000);
  };

  // 1-Tap Sample Damaged Bag Proof Button
  const handleUseSampleDamageProof = () => {
    setDamagePhoto("");
    setIsSamplePhotoUsed(true);
    toast.info("📸 Sample Damage Report tag attached (upload real photo for instant claim)");
  };

  // Calculate instant claim amount (e.g. ₹390 / bag)
  const calculatedClaimAmount = damagedQty * 390;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await feedbackSync.submitCustomerFeedback({
        orderId,
        customerId: "cust-current-builder",
        driverId,
        hubId,
        rating,
        materialTags: selectedMaterialChips,
        driverBadges: selectedDriverBadges,
        tipAmount: selectedTip,
        voiceTranscript,
        sentiment: hasDamageIssue ? "Needs Action" : "Positive",
        damageClaim: hasDamageIssue
          ? {
              hasIssue: true,
              claimType,
              claimAmount: calculatedClaimAmount,
              affectedQty: damagedQty,
              photoUrl: damagePhoto || "/images/sample-damaged-bag.jpg",
              issueTag: selectedMaterialChips.find((c) => MATERIAL_ISSUE_CHIPS.includes(c)) || "Torn / Wet Bag",
            }
          : undefined,
      });

      if (hasDamageIssue && result.ticketId) {
        const ticket: DisputeTicket = {
          orderId,
          ticketId: result.ticketId,
          hubId,
          claimAmount: calculatedClaimAmount,
          claimType,
          affectedQty: damagedQty,
          damagePhotoUrl: damagePhoto || undefined,
          issueTag: selectedMaterialChips.find((c) => MATERIAL_ISSUE_CHIPS.includes(c)) || "Torn / Wet Bag",
          status: "ESCROW_DISPUTE_HOLD",
          createdAt: new Date().toISOString(),
        };
        setSubmittedTicket(ticket);
        toast.error("🚨 Escrow Dispute Hold Activated!", {
          description: `Vendor payout frozen for Order #${orderId.slice(-4)}. Ticket ${result.ticketId} escalated to Admin.`,
        });
      } else {
        toast.success("🎉 Shabaashi Dispatched!", {
          description: selectedTip > 0
            ? `+₹${selectedTip} Chai-Pani Tip sent straight to ${driverName}'s UPI wallet!`
            : "Thank you for rating your delivery!",
        });
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (e: any) {
      toast.error("Failed to submit feedback: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#1848a0] via-[#2198ed] to-[#1848a0] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider uppercase text-amber-300">
                  Material & Delivery X-Ray
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/20 text-white">
                  60-Min Verification
                </span>
              </div>
              <p className="text-xs text-white/90 font-semibold truncate max-w-[280px] sm:max-w-md">
                Order {orderId} • {orderSummary}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Protection Ticket Submitted, show Live Status Tracker */}
        {submittedTicket ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Auto-Escrow Shield Active: {submittedTicket.status}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Ticket #{submittedTicket.ticketId}
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Vendor payout for this order is <strong>FROZEN</strong> in Lucknow Escrow.
                Our operations desk is verifying your claim of <strong>₹{submittedTicket.claimAmount}</strong> ({submittedTicket.affectedQty} damaged items).
              </p>
            </div>

            {/* Live Progress Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Resolution Mode:</span>
                <span className="font-black text-[#1848a0]">
                  {submittedTicket.claimType === "INSTANT_VAULT_REFUND"
                    ? "Instant Living Vault Refund"
                    : "45-Min Free Site Replacement"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Claim Amount:</span>
                <span className="font-mono font-black text-emerald-600">
                  ₹{submittedTicket.claimAmount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Admin Live Status:</span>
                <span className={`font-black ${
                  submittedTicket.status === "APPROVED_REFUND" || submittedTicket.status === "APPROVED_REPLACEMENT"
                    ? "text-emerald-600"
                    : "text-amber-600 animate-pulse"
                }`}>
                  {submittedTicket.status === "APPROVED_REFUND"
                    ? "✓ Refund Credited to Living Vault"
                    : submittedTicket.status === "APPROVED_REPLACEMENT"
                    ? "✓ Replacement Driver Dispatched"
                    : "⏳ Awaiting 1-Click Operations Approval (Escrow Locked)"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* ───────────────────────────────────────────────────────────
                BLOCK A: MATERIAL QUALITY & BRAND CHECK
            ──────────────────────────────────────────────────────────── */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Block A: Material Quality & Brand Check
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Zero-Typing 1-Tap Chips
                </span>
              </div>

              {/* Positive Material Chips */}
              <div className="flex flex-wrap gap-2">
                {MATERIAL_POSITIVE_CHIPS.map((chip) => {
                  const active = selectedMaterialChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleMaterialChip(chip)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                        active
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5" />}
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>

              {/* Issue Trigger Chips (Red/Amber warning pills) */}
              <div className="flex flex-wrap gap-2 pt-1">
                {MATERIAL_ISSUE_CHIPS.map((chip) => {
                  const active = selectedMaterialChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleMaterialChip(chip)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                        active
                          ? "bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400/30"
                          : "bg-rose-50/60 text-rose-700 border-rose-200 hover:bg-rose-100/70"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────
                WORLD-FIRST: INLINE INSTANT PROTECTION DRAWER
            ──────────────────────────────────────────────────────────── */}
            <AnimatePresence>
              {isProtectionDrawerOpen && hasDamageIssue && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border-2 border-rose-400 bg-rose-50/80 p-4 space-y-3 shadow-md overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                    <span className="text-xs font-black text-rose-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Instant Damage = Auto-Escrow Shield
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white">
                      VENDOR PAYMENT FREEZE
                    </span>
                  </div>

                  <p className="text-xs text-rose-800">
                    Selecting a damaged or short item automatically freezes Lucknow Vendor escrow release until resolved.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Affected Qty Counter */}
                    <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        Affected Quantity (Bags / Units):
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDamagedQty((q) => Math.max(1, q - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-800 flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-sm text-slate-900 px-2">
                          {damagedQty} Bags
                        </span>
                        <button
                          type="button"
                          onClick={() => setDamagedQty((q) => q + 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-slate-800 flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Calculated Claim Value */}
                    <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        Instant Claim Value:
                      </label>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-rose-600 font-mono">
                          ₹{calculatedClaimAmount}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          (@ ₹390 / bag)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload / 1-Tap Sample Proof */}
                  <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-rose-500" />
                        Attach Unloading Damage Photo:
                      </span>
                      {damagePhoto && (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleUseSampleDamageProof}
                        className="flex-1 py-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Use Sample Damaged Bag Proof</span>
                      </button>
                    </div>
                  </div>

                  {/* Choice: Instant Vault Refund vs 45-Min Replacement */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-black uppercase text-slate-600 block">
                      Choose Your Preferred Resolution:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setClaimType("INSTANT_VAULT_REFUND")}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          claimType === "INSTANT_VAULT_REFUND"
                            ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                            : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-xs font-black block flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5" /> Instant Vault Refund
                        </span>
                        <span className={`text-[10px] block mt-0.5 ${
                          claimType === "INSTANT_VAULT_REFUND" ? "text-emerald-100" : "text-slate-500"
                        }`}>
                          Credit ₹{calculatedClaimAmount} to Conon Vault
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setClaimType("FREE_REPLACEMENT")}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          claimType === "FREE_REPLACEMENT"
                            ? "bg-[#1848a0] text-white border-blue-900 shadow-sm"
                            : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-xs font-black block flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 45-Min Replacement
                        </span>
                        <span className={`text-[10px] block mt-0.5 ${
                          claimType === "FREE_REPLACEMENT" ? "text-blue-100" : "text-slate-500"
                        }`}>
                          Dispatch fresh stock immediately
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ───────────────────────────────────────────────────────────
                BLOCK B: DRIVER & UNLOADING SHABAASHI
            ──────────────────────────────────────────────────────────── */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Block B: Driver & Unloading Shabaashi
                </span>
                <span className="text-xs font-bold text-slate-600 truncate max-w-[180px]">
                  {driverName}
                </span>
              </div>

              {/* Star Rating Interactive Pulse */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled
                            ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Praise Badges */}
              <div className="flex flex-wrap justify-center gap-2">
                {DRIVER_PRAISE_BADGES.map((badge) => {
                  const active = selectedDriverBadges.includes(badge.label);
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => toggleDriverBadge(badge.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                        active
                          ? "bg-amber-100 text-amber-900 border-amber-300 shadow-xs ring-1 ring-amber-400/40"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────────
                BLOCK C: 1-TAP CHAI-PANI TIP + 10-SEC VOICE FEEDBACK
            ──────────────────────────────────────────────────────────── */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  Block C: 1-Tap Chai-Pani / Palledari Tip
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  100% to Driver UPI
                </span>
              </div>

              {/* Tip Pills */}
              <div className="grid grid-cols-4 gap-2">
                {TIP_OPTIONS.map((tip) => {
                  const active = selectedTip === tip;
                  return (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => setSelectedTip(tip)}
                      className={`py-2 px-1 rounded-xl text-xs font-black text-center transition cursor-pointer border ${
                        active
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/30"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {tip === 0 ? "No Tip" : `+₹${tip}`}
                    </button>
                  );
                })}
              </div>

              {/* Deduction Preview */}
              {selectedTip > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                  <span className="text-amber-800 font-medium">
                    Vault deduction preview:
                  </span>
                  <span className="font-mono font-bold text-amber-900">
                    ₹{vaultBalance.toLocaleString("en-IN")} ➔ ₹{(vaultBalance - selectedTip).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Working 1-Tap Voice Note Recorder */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      className={`p-2.5 rounded-xl text-white font-black transition cursor-pointer shadow flex items-center justify-center ${
                        isRecording
                          ? "bg-rose-600 animate-pulse ring-2 ring-rose-400"
                          : "bg-[#1848a0] hover:bg-blue-700"
                      }`}
                      title="Tap to speak or record voice note"
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {isRecording ? "Listening to site notes..." : "1-Tap Voice Feedback"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isRecording ? "Transcribing speech..." : "Tap mic to speak contractor note in Hindi/English"}
                      </span>
                    </div>
                  </div>

                  {/* Animated Waveform Bars */}
                  <div className="flex items-center gap-1 h-5 px-2">
                    {[40, 80, 100, 60, 90, 45, 80, 50].map((h, i) => (
                      <span
                        key={i}
                        className={`w-0.5 rounded-full transition-all duration-150 ${
                          voiceWaveActive ? "bg-amber-500" : "bg-slate-300"
                        }`}
                        style={{
                          height: voiceWaveActive
                            ? `${Math.max(4, Math.round(h * Math.random()))}px`
                            : "4px",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Transcribed Text Display */}
                {voiceTranscript && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 italic">
                    "{voiceTranscript}"
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-98 ${
                  hasDamageIssue
                    ? "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-600/25"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/20"
                }`}
              >
                {isSubmitting ? (
                  <span>Dispatching Feedback...</span>
                ) : hasDamageIssue ? (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>File Damage Claim & Freeze Escrow (₹{calculatedClaimAmount})</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Submit Visual X-Ray & Dispatch {selectedTip > 0 ? `+₹${selectedTip} Tip` : "Shabaashi"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

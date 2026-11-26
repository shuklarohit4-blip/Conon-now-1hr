import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Shield, ShieldCheck, Zap, Sparkles, TrendingUp,
  ArrowUpRight, ArrowDownLeft, RefreshCw, Copy, Check, QrCode,
  Truck, HardHat, FileText, CheckCircle2, AlertTriangle, Layers,
  ChevronRight, X, Lock, Flame, Info, ChevronDown, PackageCheck,
  Award, Clock, Building2, UploadCloud, Sliders, ExternalLink,
  Mic, MicOff, Volume2, RotateCcw, ScanLine
} from "lucide-react";
import { toast } from "sonner";
import { useWallet, WalletTxn } from "@/context/WalletContext";
import { CustomerDeliveryFeedbackModal } from "@/components/feedback/CustomerDeliveryFeedbackModal";
import { useSafeCononMasterSync } from "@/context/CononMasterSyncContext";
import { generateUtr } from "@/services/treasuryEngine";

/* ── Formatter Helpers ─────────────────────────────────────────────────── */
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const inrPrecise = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`;

/* ── Live Lucknow Mandi Material Benchmarks ────────────────────────────── */
const LIVE_MATERIALS = [
  {
    id: "cement" as const,
    name: "OPC 53 Cement",
    brand: "UltraTech / ACC (50kg)",
    unitPrice: 385,
    unitName: "bag",
    unitPlural: "Bags",
    change: "+0.8%",
    trend: "up" as const,
    changeText: "Up +₹3 this week",
    hsn: "2523",
    color: "#f59e0b",
    gradient: "from-amber-500 to-amber-700",
    spec: "Grade 53 High Early Strength IS 12269",
    icon: "🏗️",
  },
  {
    id: "bricks" as const,
    name: "Avval Red Bricks",
    brand: "Banda 9×4×3 in Class 100",
    unitPrice: 7.8,
    unitName: "pc",
    unitPlural: "Pcs",
    change: "+2.0%",
    trend: "up" as const,
    changeText: "Up +₹0.20 yesterday",
    hsn: "6901",
    color: "#ef4444",
    gradient: "from-rose-500 to-amber-600",
    spec: "Kiln-burnt clamp red clay, IS 1077",
    icon: "🧱",
  },
  {
    id: "aac" as const,
    name: "AAC Blocks (Magicrete)",
    brand: "600 × 200 × 150 mm",
    unitPrice: 3450,
    unitName: "cbm",
    unitPlural: "cbm",
    change: "+1.2%",
    trend: "up" as const,
    changeText: "Up +₹40 this week",
    hsn: "6810",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-700",
    spec: "Autoclaved Aerated Concrete IS 2185-3",
    icon: "📦",
  },
];

/* ── Leftover Buyback Catalog (85% Instant Wallet Credit) ───────────────── */
const BUYBACK_ITEMS = [
  {
    id: "cement",
    name: "OPC 53 Cement — Sealed Bags (UltraTech/ACC)",
    unit: "Bags",
    retailPrice: 385,
    buybackRate: 0.85,
    category: "CEMENT",
    icon: "🏗️",
  },
  {
    id: "cpvc",
    name: "Astral 1-in CPVC Pipe (10ft Lengths)",
    unit: "Pcs",
    retailPrice: 280,
    buybackRate: 0.85,
    category: "PLUMBING",
    icon: "🚰",
  },
  {
    id: "putty",
    name: "JK White Wall Putty (40kg Sealed Buckets)",
    unit: "Buckets",
    retailPrice: 850,
    buybackRate: 0.85,
    category: "FINISHES",
    icon: "🪣",
  },
  {
    id: "tmt",
    name: "Fe550D TMT 12mm Rebar Clean Cut-offs",
    unit: "Bundles",
    retailPrice: 1200,
    buybackRate: 0.85,
    category: "STEEL",
    icon: "🔩",
  },
  {
    id: "bricks",
    name: "Banda A-Grade Red Bricks (Stack of 100)",
    unit: "Stacks",
    retailPrice: 780,
    buybackRate: 0.85,
    category: "MASONRY",
    icon: "🧱",
  },
];

/* ── Quick Top-up Chips ────────────────────────────────────────────────── */
const ADD_FUNDS_PRESETS = [2000, 10000, 25000];
const PAY_METHODS = [
  { id: "UPI", name: "Instant UPI (GPay, PhonePe, Paytm)", badge: "⚡ Fastest • 0% Fee" },
  { id: "HDFC_NET", name: "HDFC / ICICI NetBanking", badge: "NetBanking" },
  { id: "RUPAY", name: "RuPay / Visa Corporate Card", badge: "Credit / Debit" },
];

/* ── Web Audio Chime Helper ────────────────────────────────────────────── */
function playTone(freq = 587.33, type: OscillatorType = "sine", duration = 0.18) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // audio not allowed or unsupported
  }
}

export function LivingMaterialVault() {
  const {
    balance: cashBalance,
    transactions,
    materialUnits,
    sosCredit,
    claimedRewards,
    addMoney,
    convertCashToMaterial,
    deliverMaterialUnits,
    activateSosCredit,
    markRewardClaimed,
  } = useWallet();
  const masterSync = useSafeCononMasterSync();

  /* ── 3D Magnetic Flip Card State ── */
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 50, py: 50 });
  const [isHovering, setIsHovering] = useState(false);

  /* ── Modals & Drawers State ── */
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [addAmount, setAddAmount] = useState<number>(2000);
  const [selectedPayMethod, setSelectedPayMethod] = useState("UPI");

  const [showSosModal, setShowSosModal] = useState(false);
  const [sosStep, setSosStep] = useState<"scanning" | "unlocked">("scanning");

  const [activeConvertMat, setActiveConvertMat] = useState<typeof LIVE_MATERIALS[0] | null>(null);
  const [convertSliderVal, setConvertSliderVal] = useState<number>(770);

  const [activeDispatchMat, setActiveDispatchMat] = useState<typeof LIVE_MATERIALS[0] | null>(null);
  const [dispatchQty, setDispatchQty] = useState<number>(1);

  /* ── Bill X-Ray Scanner State ── */
  const [isScanningBill, setIsScanningBill] = useState(false);
  const [billScanned, setBillScanned] = useState(false);

  /* ── Sponsor Pay State ── */
  const [sponsorItem, setSponsorItem] = useState("₹3,200 — Urgent CPVC Pipes & Fevicol");
  const [sponsorAmount, setSponsorAmount] = useState(3200);
  const [sponsorGenerated, setSponsorGenerated] = useState(false);
  const [sponsorApproved, setSponsorApproved] = useState(false);

  /* ── Lucky Crane Drop State ── */
  const [isCraneCracking, setIsCraneCracking] = useState(false);
  const isCraneOpened = Boolean(claimedRewards["crane_drop"]);

  /* ── Ledger Filter & Detail Modal ── */
  const [activeFilter, setActiveFilter] = useState<"all" | "credit" | "material_lock" | "redeem">("all");
  const [selectedTxn, setSelectedTxn] = useState<WalletTxn | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  /* ── Module 1: Floating "Voice-to-Vault" Hinglish Command Bar State ── */
  const [voiceQuery, setVoiceQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [pendingVoiceAction, setPendingVoiceAction] = useState<{
    type: "LOCK_CEMENT" | "MISTRI_PASS";
    title: string;
    description: string;
    summary: string;
    amount?: number;
    qty?: number;
  } | null>(null);

  /* ── Module 2: Leftover Buyback State ── */
  const [selectedBuybackItem, setSelectedBuybackItem] = useState(BUYBACK_ITEMS[0]);
  const [buybackQty, setBuybackQty] = useState(4);
  const [buybackScheduled, setBuybackScheduled] = useState(false);
  const [buybackVerified, setBuybackVerified] = useState(false);

  /* ── Module 3: Geo-Escrow Protection Toggle State ── */
  const [geoEscrowActive, setGeoEscrowActive] = useState(true);

  const totalBuybackRetail = selectedBuybackItem.retailPrice * buybackQty;
  const buybackCredit = Math.round(totalBuybackRetail * selectedBuybackItem.buybackRate);

  /* ── Calculate Material Valuations ── */
  const materialHoldingsVal = useMemo(() => {
    const cementVal = materialUnits.cementBags * 385;
    const brickVal = materialUnits.brickPieces * 7.8;
    const aacVal = materialUnits.aacCbm * 3450;
    return Math.round(cementVal + brickVal + aacVal);
  }, [materialUnits]);

  // Total vault liquidity: Cash + Material Value + (SOS Credit if active)
  const totalVaultLiquidity = cashBalance + materialHoldingsVal + (sosCredit.active ? sosCredit.amount : 0);

  // Material appreciation metric (benchmark live +2.4% / +₹340 gain)
  const materialAppreciation = Math.round(materialHoldingsVal * 0.024) || 340;

  /* ── Material DNA Bar Percentages ── */
  const dnaCashPct = Math.max(15, Math.round((cashBalance / Math.max(1, totalVaultLiquidity)) * 100));
  const dnaMatPct = Math.max(15, Math.round((materialHoldingsVal / Math.max(1, totalVaultLiquidity)) * 100));
  const dnaSosPct = sosCredit.active
    ? Math.max(10, 100 - dnaCashPct - dnaMatPct)
    : 10;

  /* ── Mouse Pointer Tracking for 3D Magnetic Tilt ── */
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = Math.min(100, Math.max(0, (x / rect.width) * 100));
    const py = Math.min(100, Math.max(0, (y / rect.height) * 100));

    // Clamp tilt angles to subtle luxury range (-10 to +10 deg)
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -9;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 11;
    setTilt({ rx, ry, px, py });
  };

  const handlePointerLeave = () => {
    setIsHovering(false);
    setTilt({ rx: 0, ry: 0, px: 50, py: 50 });
  };

  /* ── Add Funds Submit ── */
  const handleConfirmAddFunds = () => {
    const amt = Math.round(addAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amt > 200000) {
      toast.error("Maximum ₹2,00,000 per transaction");
      return;
    }
    addMoney(amt, selectedPayMethod, `Vault Top-up (${selectedPayMethod})`);
    if (masterSync) {
      const accounts = masterSync.state.treasury?.companyAccounts || [];
      const collectionAcct =
        accounts.find((a) => (a.role === "COLLECTION" || a.role === "ESCROW_NODAL") && a.isPrimary) ||
        accounts.find((a) => a.role === "COLLECTION" || a.role === "ESCROW_NODAL") ||
        accounts[0];
      masterSync
        .recordTreasuryEntry({
          id: `tr_vault_${Date.now()}`,
          orderId: `VAULT-${Date.now().toString().slice(-6)}`,
          entryType: "VAULT_TOPUP",
          direction: "CREDIT",
          fromAccountLabel: `Customer Vault (${selectedPayMethod})`,
          fromAccountRef: selectedPayMethod,
          toAccountLabel: collectionAcct?.label || "CONON Collection A/c",
          toAccountRef: collectionAcct
            ? `${collectionAcct.bankName} ${collectionAcct.accountNumberMasked}`
            : "CONON-COLLECTION",
          toIfsc: collectionAcct?.ifscCode || "",
          beneficiaryName: "CONON LIVING VAULT",
          paymentMode: selectedPayMethod.toUpperCase(),
          utrNumber: generateUtr("6"),
          grossAmount: amt,
          platformMargin: 0,
          taxAmount: 0,
          netAmount: amt,
          status: "SETTLED",
          createdAt: new Date().toISOString(),
        })
        .catch(() => {});
    }
    setShowAddFunds(false);
    playTone(659.25, "triangle", 0.25);
    toast.success(`${inr(amt)} added to your Living Vault!`, {
      description: `Instant inflation-shield active via ${selectedPayMethod}`,
    });
  };

  /* ── SOS Rescue Credit Trigger ── */
  const handleOpenSos = () => {
    if (sosCredit.active) {
      toast.info("SOS Credit is already active in your Living Vault (47h 59m remaining).");
      return;
    }
    setShowSosModal(true);
    setSosStep("scanning");
    playTone(440, "sine", 0.15);

    setTimeout(() => {
      setSosStep("unlocked");
      playTone(880, "triangle", 0.3);
    }, 1500);
  };

  const handleConfirmSos = () => {
    activateSosCredit();
    setShowSosModal(false);
    playTone(784, "triangle", 0.35);
    toast.success("⚡ ₹10,000 Site Rescue Shield Activated!", {
      description: "0% interest for 48 hours. Ready to use at checkout or emergency dispatch.",
    });
  };

  /* ── Convert Cash -> Material Units ── */
  const handleOpenConvert = (mat: typeof LIVE_MATERIALS[0]) => {
    setActiveConvertMat(mat);
    const defaultVal = mat.unitPrice <= cashBalance ? mat.unitPrice * 2 : Math.min(cashBalance, 1000);
    setConvertSliderVal(Math.max(mat.unitPrice, defaultVal));
  };

  const handleConfirmConvert = () => {
    if (!activeConvertMat) return;
    const cashAmt = Math.round(convertSliderVal);
    if (cashAmt > cashBalance) {
      toast.error("Insufficient liquid cash. Top up funds first.");
      return;
    }
    const units = Number((cashAmt / activeConvertMat.unitPrice).toFixed(2));
    const ok = convertCashToMaterial(activeConvertMat.id, cashAmt, units);
    if (ok) {
      playTone(740, "triangle", 0.25);
      toast.success(`🎉 Locked ${units} ${activeConvertMat.unitPlural} into Living Vault!`, {
        description: `Value protected at ₹${activeConvertMat.unitPrice}/${activeConvertMat.unitName}. Beats future price hikes.`,
      });
      setActiveConvertMat(null);
    }
  };

  /* ── Deliver in 60 Mins ── */
  const handleOpenDispatch = (mat: typeof LIVE_MATERIALS[0]) => {
    const owned =
      mat.id === "cement"
        ? materialUnits.cementBags
        : mat.id === "bricks"
        ? materialUnits.brickPieces
        : materialUnits.aacCbm;

    if (owned <= 0) {
      // Prompt user to convert first or quick order
      toast.info(`You currently have 0 ${mat.unitPlural} in your vault. Convert liquid cash first or top up!`);
      handleOpenConvert(mat);
      return;
    }
    setActiveDispatchMat(mat);
    setDispatchQty(Math.min(owned, mat.id === "bricks" ? 50 : 2));
  };

  const handleConfirmDispatch = () => {
    if (!activeDispatchMat) return;
    const ok = deliverMaterialUnits(activeDispatchMat.id, dispatchQty);
    if (ok) {
      playTone(523.25, "sine", 0.3);
      toast.success(`⚡ 60-Min Express Dispatch Initiated!`, {
        description: `${dispatchQty} ${activeDispatchMat.unitPlural} dispatched to Site PIN 226030. Driver DRV-LKO-201 assigned.`,
      });
      setActiveDispatchMat(null);
    }
  };

  /* ── Bill X-Ray Scanner Trigger ── */
  const handleScanBill = () => {
    if (isScanningBill) return;
    setIsScanningBill(true);
    setBillScanned(false);
    playTone(493.88, "sawtooth", 0.2);

    setTimeout(() => {
      setIsScanningBill(false);
      setBillScanned(true);
      playTone(880, "triangle", 0.35);

      // Add reward only once per session or allow continuous demo
      addMoney(75, "Intel Reward", "Bill X-Ray Intel Reward (Alambagh Hardware Parchi)");
      toast.success("✨ Bill Analyzed: Overpaid by ₹250! +₹75 Intel Gold Credited!", {
        description: "Local shop price intelligence benchmarked against live Lucknow Mandi rates.",
      });
    }, 2000);
  };

  /* ── Sponsor Pay Simulation ── */
  const handleGenerateSponsor = () => {
    setSponsorGenerated(true);
    setSponsorApproved(false);
    playTone(587.33, "triangle", 0.2);
    toast.success("📱 WhatsApp Owner Approval Card Generated!", {
      description: "Ready to share with plot owner for 1-tap remote authorization.",
    });
  };

  const handleSimulateOwnerApprove = () => {
    setSponsorApproved(true);
    playTone(880, "triangle", 0.35);
    addMoney(100, "Sponsor Bonus", "Owner Coordination Bonus — Site Plot 42");
    toast.success("✔ Owner Authorized Payment (HDFC UPI)! Order Dispatched in 60 Mins!", {
      description: "+₹100 Contractor Coordination Bonus added to your Living Vault.",
    });
  };

  /* ── Lucky Crane Drop Trigger ── */
  const handleCrackCrane = () => {
    if (isCraneOpened || isCraneCracking) return;
    setIsCraneCracking(true);
    playTone(440, "square", 0.15);

    setTimeout(() => {
      playTone(659.25, "sine", 0.15);
    }, 300);

    setTimeout(() => {
      setIsCraneCracking(false);
      markRewardClaimed("crane_drop");
      addMoney(150, "Lucky Crane Drop", "Lucky Crane Drop Surprise Reward (Gomti Hub)");
      playTone(987.77, "triangle", 0.4);
      toast.success("🎉 Lucky Crane Unlocked: Free Express Unloading + ₹150 Gold!", {
        description: "₹150 credited immediately. Free driver unloading coupon active on your next order.",
      });
    }, 1200);
  };

  /* ── Copy Referral Code ── */
  const handleCopyCode = () => {
    navigator.clipboard.writeText("CONON-SITE-LKO");
    setCopiedCode(true);
    playTone(784, "sine", 0.15);
    toast.success("Referral Code Copied: CONON-SITE-LKO");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  /* ── Voice-to-Vault Handlers ── */
  const handleTriggerVoice = (phrase: string) => {
    setIsListening(true);
    setVoiceQuery("");
    setPendingVoiceAction(null);
    playTone(523.25, "sine", 0.15);

    setTimeout(() => {
      setIsListening(false);
      setVoiceQuery(phrase);
      playTone(784, "triangle", 0.25);

      if (phrase.toLowerCase().includes("cement") || phrase.toLowerCase().includes("bag")) {
        setPendingVoiceAction({
          type: "LOCK_CEMENT",
          title: "Lock 20 Bags OPC 53 Cement",
          description: "Hedge at current Lucknow Mandi rate (₹385/bag). Rate guaranteed for 30 days.",
          summary: "20 Bags • Total ₹7,700 • Inflation Protected",
          qty: 20,
          amount: 7700,
        });
      } else {
        setPendingVoiceAction({
          type: "MISTRI_PASS",
          title: "Issue ₹2,000 Zero-Leakage Mistri Pass",
          description: "Contractor Ramesh (Gomti Nagar Plot 42) authorized for ₹2,000 today.",
          summary: "Daily Limit: ₹2,000 • Security PIN: 8421 • Categories: Plumbing & Adhesives",
          amount: 2000,
        });
      }
    }, 1500);
  };

  const handleParseCustomQuery = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    setVoiceQuery(query);
    playTone(659.25, "sine", 0.2);

    if (q.includes("cement") || q.includes("bag")) {
      setPendingVoiceAction({
        type: "LOCK_CEMENT",
        title: "Lock 20 Bags OPC 53 Cement",
        description: "Hedge at current Lucknow Mandi rate (₹385/bag). Valid for 30 days.",
        summary: "20 Bags • Total ₹7,700 • Inflation Protected",
        qty: 20,
        amount: 7700,
      });
    } else {
      setPendingVoiceAction({
        type: "MISTRI_PASS",
        title: "Issue ₹2,000 Zero-Leakage Mistri Pass",
        description: `Contractor authorization generated for "${query}".`,
        summary: "Daily Limit: ₹2,000 • Security PIN: 8421 • Zero Leakage",
        amount: 2000,
      });
    }
  };

  const handleExecuteVoiceAction = () => {
    if (!pendingVoiceAction) return;

    if (pendingVoiceAction.type === "LOCK_CEMENT") {
      const qty = pendingVoiceAction.qty || 20;
      const amt = pendingVoiceAction.amount || 7700;
      convertCashToMaterial("cement", Math.min(cashBalance, amt), qty);
      playTone(880, "triangle", 0.35);
      toast.success(`🎉 Locked ${qty} Bags OPC 53 Cement into Living Vault!`, {
        description: `Value hedged at ₹385/bag against future Lucknow Mandi price hikes.`,
      });
    } else if (pendingVoiceAction.type === "MISTRI_PASS") {
      const amt = pendingVoiceAction.amount || 2000;
      addMoney(0, "Mistri Pass", "Mistri Pass Authorized — Ramesh (Plot 42)");
      playTone(784, "sine", 0.3);
      toast.success(`👷 ₹${amt.toLocaleString("en-IN")} Mistri Pass Issued to Ramesh!`, {
        description: `Counter PIN: 8421 • 60-min express checkout active for Plumbing & Adhesives.`,
      });
    }
    setPendingVoiceAction(null);
  };

  /* ── Buyback Handlers ── */
  const handleScheduleBuyback = () => {
    setBuybackScheduled(true);
    setBuybackVerified(false);
    playTone(587.33, "triangle", 0.2);
    toast.success("🚚 Return Pickup Scheduled for Site PIN 226030!", {
      description: `Partner Rider Ramesh assigned with E-Loader UP32-EL-4910. Arriving in 42 mins.`,
    });
  };

  const handleSimulateBuybackVerified = () => {
    setBuybackVerified(true);
    addMoney(
      buybackCredit,
      "Buyback Credit",
      `Buyback Credit — ${buybackQty} ${selectedBuybackItem.unit} ${selectedBuybackItem.name}`
    );
    playTone(880, "triangle", 0.35);
    toast.success(`✔ Pickup Verified & Credited: +${inr(buybackCredit)}!`, {
      description: `85% return value credited directly to your Living Vault cash balance.`,
    });
  };

  /* ── Filtered Transactions ── */
  const filteredTxns = useMemo(() => {
    if (activeFilter === "all") return transactions;
    return transactions.filter((t) => {
      if (activeFilter === "credit") return t.amt.startsWith("+") && t.category !== "material_lock";
      if (activeFilter === "material_lock") return t.category === "material_lock";
      if (activeFilter === "redeem") return t.amt.startsWith("−") || t.category === "redeem";
      return true;
    });
  }, [transactions, activeFilter]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ══════════════════════════════════════════════════════════════════════
          FEATURE 1: FLOATING "VOICE-TO-VAULT" HINGLISH COMMAND BAR
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-2xl p-2.5 sm:p-3 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-xl space-y-2">
        <div className="flex items-center gap-2.5">
          {/* Animated Pulsing Amber Microphone Button */}
          <button
            type="button"
            onClick={() => handleTriggerVoice("20 bag cement lock karo")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              isListening
                ? "bg-amber-400 text-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.7)] animate-pulse"
                : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40"
            }`}
            title="Bol kar karein (Tap to Speak)"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Search/Command Input Field */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={voiceQuery}
              onChange={(e) => setVoiceQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && voiceQuery.trim()) {
                  handleParseCustomQuery(voiceQuery);
                }
              }}
              placeholder='Bol kar karein: "20 bag cement lock karo" ya "Ramesh ko ₹2,000 Mistri Pass do"'
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {voiceQuery && (
              <button
                type="button"
                onClick={() => setVoiceQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Execute/Parse button */}
          <button
            type="button"
            onClick={() => handleParseCustomQuery(voiceQuery || "20 bag cement lock karo")}
            className="hidden sm:flex py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wide items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Execute</span>
          </button>
        </div>

        {/* Audio Waveform Animation when listening */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-300"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-bold">Listening to Lucknow Site Audio...</span>
            </div>
            {/* Visual Equalizer Soundwave Bars */}
            <div className="flex items-center gap-1 h-4">
              {[8, 16, 12, 22, 10, 24, 14, 20, 9, 18, 11, 15].map((h, idx) => (
                <motion.div
                  key={idx}
                  animate={{ height: [4, h, 6, h * 0.8, 4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: idx * 0.06 }}
                  className="w-1 bg-amber-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* 2 Quick Demo Voice Chips */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="text-slate-500 font-bold">Try site voice commands:</span>
          <button
            type="button"
            onClick={() => handleTriggerVoice("20 bag cement lock karo")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 font-medium transition flex items-center gap-1"
          >
            <span>🎙️ "20 bag cement lock karo"</span>
          </button>
          <button
            type="button"
            onClick={() => handleTriggerVoice("Ramesh ko ₹2,000 Mistri Pass do")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-400/30 font-medium transition flex items-center gap-1"
          >
            <span>🎙️ "Ramesh ko ₹2,000 Mistri Pass do"</span>
          </button>
        </div>

        {/* 1-Tap Confirm Action Card when voice command is recognized */}
        <AnimatePresence>
          {pendingVoiceAction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -4 }}
              className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-900 border-2 border-amber-400 shadow-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 text-white"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs px-2 py-0.2 rounded bg-amber-400 text-slate-950 font-black uppercase">
                    Voice Action Ready
                  </span>
                  <h5 className="font-display font-black text-sm text-white">
                    {pendingVoiceAction.title}
                  </h5>
                </div>
                <p className="text-[10px] text-slate-300">{pendingVoiceAction.description}</p>
                <p className="text-[9px] text-amber-300 font-mono font-bold">
                  {pendingVoiceAction.summary}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPendingVoiceAction(null)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteVoiceAction}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>1-Tap Confirm</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODULE 1: INTERACTIVE 3D MAGNETIC FLIP VAULT CARD (HERO CENTERPIECE)
         ══════════════════════════════════════════════════════════════════════ */}
      <div
        className="relative w-full select-none"
        style={{ perspective: 1200 }}
        onPointerEnter={() => setIsHovering(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <motion.div
          ref={cardRef}
          animate={{
            rotateX: isFlipped ? 0 : tilt.rx,
            rotateY: isFlipped ? 180 : tilt.ry,
            scale: isHovering && !isFlipped ? 1.015 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: isHovering ? 320 : 180,
            damping: 24,
            mass: 0.6,
          }}
          style={{
            transformStyle: "preserve-3d",
          }}
          className="relative w-full rounded-[32px] cursor-pointer shadow-2xl overflow-hidden transition-shadow duration-300"
        >
          {/* FRONT SIDE OF THE CARD */}
          <div
            onClick={(e) => {
              // Prevent flip if clicking buttons
              if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) return;
              setIsFlipped(true);
            }}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: "linear-gradient(135deg, #090e17 0%, #0f172a 45%, #1e293b 100%)",
            }}
            className="relative p-6 sm:p-8 text-white rounded-[32px] border border-amber-500/30 overflow-hidden"
          >
            {/* Dynamic Spotlight Sheen following cursor */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                opacity: isHovering ? 0.9 : 0.4,
                background: `radial-gradient(circle 380px at ${tilt.px}% ${tilt.py}%, rgba(251, 191, 36, 0.22) 0%, rgba(245, 158, 11, 0.05) 40%, transparent 70%)`,
              }}
            />

            {/* Glowing Architectural CAD Grid Blueprint Background */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern id="cad-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#f59e0b" strokeWidth="0.7" />
                  <circle cx="28" cy="28" r="1" fill="#f59e0b" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cad-grid)" />
            </svg>

            {/* Top Bar: Vault Branding + Status Pills */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
                  <Wallet className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black tracking-[0.18em] uppercase text-xs sm:text-sm bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 bg-clip-text text-transparent">
                      CONON LIVING VAULT
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-extrabold flex items-center gap-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      INFLATION-SHIELD ACTIVE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Lucknow Mandi Linked • Backed by Real Physical Stock
                  </p>
                </div>
              </div>

              {/* Status Badges: Geo-Escrow + SOS Active */}
              <div className="flex items-center gap-2">
                {geoEscrowActive && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-black">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>GEO-ESCROW LOCKED</span>
                  </div>
                )}
                {sosCredit.active && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black animate-pulse">
                    <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span>SOS Credit Active (47h 59m left)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Balance Row */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mb-6">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Liquid Cash Balance
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="font-display font-black text-4xl sm:text-5xl tracking-tight text-white tabular-nums drop-shadow-md">
                    {inr(cashBalance)}
                  </span>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[10px] font-black tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Material Value: +{inr(materialAppreciation)} (+2.4%)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Total Vault Liquidity:{" "}
                  <strong className="text-amber-200 tabular-nums">{inr(totalVaultLiquidity)}</strong>{" "}
                  <span className="text-slate-500">(Cash + Material Units {sosCredit.active ? "+ SOS Credit" : ""})</span>
                </p>
              </div>

              {/* Right Side: Material DNA Breakdown preview */}
              <div className="sm:text-right bg-slate-900/60 backdrop-blur-md rounded-2xl p-3 border border-slate-700/60">
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                  Vault Asset Split
                </p>
                <div className="flex sm:justify-end gap-3 text-[11px] font-bold">
                  <span className="text-emerald-400">Cash: {inr(cashBalance)}</span>
                  <span className="text-amber-400">Materials: {inr(materialHoldingsVal)}</span>
                  {sosCredit.active && <span className="text-rose-400">SOS: ₹10,000</span>}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  {materialUnits.cementBags} Bags Cement • {materialUnits.brickPieces} Bricks • {materialUnits.aacCbm} cbm AAC
                </p>
              </div>
            </div>

            {/* Material DNA Bar (Segmented Progress Bar) */}
            <div className="relative z-10 mb-6">
              <div className="flex justify-between text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1.5">
                <span>Material DNA Composition</span>
                <span>Protected against LKO Mandi Inflation</span>
              </div>
              <div className="h-3 w-full bg-slate-800/80 rounded-full p-0.5 flex gap-1 overflow-hidden border border-slate-700/60 shadow-inner">
                {/* Liquid Cash Segment */}
                <div
                  style={{ width: `${dnaCashPct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm transition-all duration-500"
                  title={`Liquid Cash: ${inr(cashBalance)}`}
                />
                {/* Digital Material Units Segment */}
                <div
                  style={{ width: `${dnaMatPct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 shadow-sm transition-all duration-500"
                  title={`Material Units: ${inr(materialHoldingsVal)}`}
                />
                {/* SOS Credit Segment */}
                <div
                  style={{ width: `${dnaSosPct}%` }}
                  className={`h-full rounded-full ${
                    sosCredit.active
                      ? "bg-gradient-to-r from-rose-500 to-amber-600 animate-pulse"
                      : "bg-slate-700/80 border border-dashed border-rose-400/40"
                  } transition-all duration-500`}
                  title={sosCredit.active ? "SOS Credit: ₹10,000 Active" : "SOS Credit: ₹10,000 Available"}
                />
              </div>

              {/* DNA Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[10px] text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Liquid Cash ({inr(cashBalance)})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Digital Units ({inr(materialHoldingsVal)})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${sosCredit.active ? "bg-rose-400" : "bg-slate-500"}`} />
                  <span>
                    SOS Credit:{" "}
                    {sosCredit.active ? (
                      <strong className="text-rose-400 font-black">₹10,000 (Active)</strong>
                    ) : (
                      <span className="text-slate-400">₹10,000 (Standby)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Geo-Escrow Protection Toggle Strip */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 mb-4 p-3 rounded-2xl bg-slate-900/85 border border-slate-700/80 flex items-center justify-between gap-3 shadow-inner"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    geoEscrowActive
                      ? "bg-cyan-500/25 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">
                      Geo-Photo Escrow Lock (Pay Vendor Only After Site Photo)
                    </span>
                    {geoEscrowActive && (
                      <span className="text-[9px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-500/40">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {geoEscrowActive
                      ? "Active: Delivery partner must upload GPS-matched site unloading photo before funds release."
                      : "Pay Vendor Only After Site Photo (Toggle on to hold funds until photo is verified)."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextState = !geoEscrowActive;
                  setGeoEscrowActive(nextState);
                  playTone(nextState ? 880 : 440, "sine", 0.15);
                  if (nextState) {
                    toast.success("🛡️ Geo-Photo Escrow Lock Activated!", {
                      description: "Funds will remain securely held in escrow until driver uploads GPS-matched site unloading photo.",
                    });
                  } else {
                    toast.info("Geo-Photo Escrow Lock deactivated.");
                  }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  geoEscrowActive ? "bg-cyan-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    geoEscrowActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Action Buttons Row */}
            <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-2 border-t border-slate-800/80">
              {/* + Add Funds Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddFunds(true);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>+ Add Funds</span>
              </button>

              {/* Use at Checkout Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTone(659.25, "sine", 0.15);
                  toast.success("Wallet ready at checkout!", {
                    description: `Your ${inr(cashBalance)} cash + material units will automatically deduct on your next order.`,
                  });
                }}
                className="py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-black text-xs uppercase tracking-wider border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Use at Checkout</span>
              </button>

              {/* SOS Rescue Credit Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSos();
                }}
                className={`py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                  sosCredit.active
                    ? "bg-rose-500/20 border-rose-500/60 text-rose-300 cursor-default"
                    : "bg-gradient-to-r from-rose-600/30 to-amber-600/30 hover:from-rose-600/50 hover:to-amber-600/50 border-rose-500/50 text-rose-200 animate-pulse shadow-md shadow-rose-900/30 active:scale-95"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>{sosCredit.active ? "SOS Active" : "SOS Rescue Credit"}</span>
              </button>

              {/* Rate Last Delivery / Material X-Ray Feedback Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFeedbackModalOpen(true);
                }}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-200 border border-blue-500/40 font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Rate Last Delivery</span>
              </button>
            </div>

            {/* Flip Hint */}
            <div className="relative z-10 flex items-center justify-end mt-4 text-[10px] text-slate-400 font-bold">
              <span className="flex items-center gap-1 hover:text-amber-300 transition-colors">
                Tap card to flip for VIP Delivery QR <RefreshCw className="w-3 h-3 text-amber-400 animate-spin-slow" />
              </span>
            </div>
          </div>

          {/* BACK SIDE OF THE CARD (VIP SITE PASS) */}
          <div
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("button")) return;
              setIsFlipped(false);
            }}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #050811 0%, #0b1120 50%, #151e32 100%)",
            }}
            className="absolute inset-0 p-6 sm:p-8 text-white rounded-[32px] border-2 border-amber-400/50 overflow-hidden flex flex-col justify-between"
          >
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Back Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-md">
                  ★
                </div>
                <div>
                  <h3 className="font-display font-black text-sm tracking-wider uppercase text-amber-300">
                    CONON BLACK VIP SITE PASS
                  </h3>
                  <p className="text-[9px] text-slate-400">Contactless 60-Min Driver Site Verification</p>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                ● SITE SCAN ACTIVE
              </div>
            </div>

            {/* Center: QR Code & Site Trust Score */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-auto py-2">
              {/* Generated SVG QR Code */}
              <div className="flex flex-col items-center sm:items-start">
                <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-amber-400/30">
                  <svg width="120" height="120" viewBox="0 0 100 100" className="w-28 h-28">
                    {/* Outer finder patterns */}
                    <rect x="5" y="5" width="26" height="26" fill="#0f172a" rx="4" />
                    <rect x="10" y="10" width="16" height="16" fill="#ffffff" rx="2" />
                    <rect x="14" y="14" width="8" height="8" fill="#f59e0b" />

                    <rect x="69" y="5" width="26" height="26" fill="#0f172a" rx="4" />
                    <rect x="74" y="10" width="16" height="16" fill="#ffffff" rx="2" />
                    <rect x="78" y="14" width="8" height="8" fill="#f59e0b" />

                    <rect x="5" y="69" width="26" height="26" fill="#0f172a" rx="4" />
                    <rect x="10" y="74" width="16" height="16" fill="#ffffff" rx="2" />
                    <rect x="14" y="78" width="8" height="8" fill="#f59e0b" />

                    {/* QR Matrix Dots */}
                    <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="46" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="56" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="36" y="18" width="6" height="6" fill="#f59e0b" />
                    <rect x="56" y="18" width="6" height="6" fill="#0f172a" />

                    <rect x="8" y="36" width="6" height="6" fill="#0f172a" />
                    <rect x="18" y="36" width="6" height="6" fill="#f59e0b" />
                    <rect x="8" y="46" width="6" height="6" fill="#0f172a" />
                    <rect x="18" y="56" width="6" height="6" fill="#0f172a" />

                    <rect x="36" y="36" width="28" height="28" fill="#0f172a" rx="6" />
                    <text x="50" y="55" fill="#f59e0b" fontSize="16" fontWeight="bold" textAnchor="middle">
                      C
                    </text>

                    <rect x="68" y="36" width="6" height="6" fill="#0f172a" />
                    <rect x="84" y="36" width="6" height="6" fill="#f59e0b" />
                    <rect x="68" y="46" width="6" height="6" fill="#f59e0b" />
                    <rect x="78" y="56" width="6" height="6" fill="#0f172a" />

                    <rect x="36" y="68" width="6" height="6" fill="#0f172a" />
                    <rect x="46" y="78" width="6" height="6" fill="#f59e0b" />
                    <rect x="56" y="68" width="6" height="6" fill="#0f172a" />
                    <rect x="68" y="78" width="6" height="6" fill="#0f172a" />
                    <rect x="84" y="78" width="6" height="6" fill="#f59e0b" />
                  </svg>
                </div>
                <p className="text-[9px] text-amber-300 font-bold mt-1.5">
                  Show Driver at Site Gate for Zero-Touch Drop
                </p>
              </div>

              {/* Trust Score & Details */}
              <div className="space-y-3">
                <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 font-bold">Site Trust Score</span>
                    <span className="text-emerald-400 text-xs font-black">94 / 100 (Prime)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full w-[94%]" />
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1">
                    Eligible for Instant ₹10,000 Zero-Interest SOS Bridge Credit
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-slate-400 text-[8px] uppercase">Registered PIN</p>
                    <p className="font-black text-amber-300">226030 (Lucknow)</p>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-slate-400 text-[8px] uppercase">Express SLA</p>
                    <p className="font-black text-emerald-400">60-Min Priority</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Footer */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[9px] text-slate-400">
                Privileges: Free Assisted Unloading • Priority Fleet Dispatch
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider hover:bg-amber-300 transition-colors flex items-center gap-1"
              >
                <span>↻ Return to Vault</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODULE 2: "MATERIAL-BACKED LIQUID CURRENCY" MORPH WIDGET
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-[28px] p-5 sm:p-6 bg-slate-900/95 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                CONVERT ₹ TO LIVE MATERIAL UNITS (BEAT PRICE HIKES)
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Lock your funds into physical cement, bricks, and AAC at current Mandi rates. If prices surge next week, your vault appreciates with it.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            LKO MANDI SYNCED
          </span>
        </div>

        {/* 3 Material Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {LIVE_MATERIALS.map((mat) => {
            const ownedQty =
              mat.id === "cement"
                ? materialUnits.cementBags
                : mat.id === "bricks"
                ? materialUnits.brickPieces
                : materialUnits.aacCbm;

            const ownedVal = Math.round(ownedQty * mat.unitPrice);

            return (
              <div
                key={mat.id}
                className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1.5 rounded-xl bg-slate-900/80 border border-slate-700">
                        {mat.icon}
                      </span>
                      <div>
                        <h4 className="font-display font-black text-xs text-white leading-tight">
                          {mat.name}
                        </h4>
                        <p className="text-[9px] text-slate-400">{mat.brand}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {mat.change}
                    </span>
                  </div>

                  {/* Pricing info */}
                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Live Mandi Rate</p>
                      <p className="font-display font-black text-lg text-amber-300 tabular-nums">
                        {inrPrecise(mat.unitPrice)}
                        <span className="text-[10px] text-slate-400 font-normal"> / {mat.unitName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">In Your Vault</p>
                      <p className="text-xs font-black text-white tabular-nums">
                        {ownedQty} {mat.unitPlural}
                      </p>
                      <p className="text-[9px] text-emerald-400 font-bold tabular-nums">
                        ({inr(ownedVal)})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-700/60">
                  <button
                    onClick={() => handleOpenConvert(mat)}
                    className="py-2 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-wide transition-all active:scale-95 flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Convert ₹ → Units</span>
                  </button>
                  <button
                    onClick={() => handleOpenDispatch(mat)}
                    className="py-2 px-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-[10px] uppercase tracking-wide transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <Truck className="w-3 h-3 text-emerald-400" />
                    <span>Deliver 60m</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inline Conversion Drawer when a material is selected */}
        <AnimatePresence>
          {activeConvertMat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-700/80 bg-slate-950/60 p-4 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activeConvertMat.icon}</span>
                  <div>
                    <h4 className="font-display font-black text-sm text-amber-300">
                      Convert Cash → {activeConvertMat.name} Units
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Benchmark: {inrPrecise(activeConvertMat.unitPrice)} / {activeConvertMat.unitName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveConvertMat(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Slider for Cash Amount */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-300">Amount to Convert:</span>
                  <span className="text-amber-400 font-display font-black text-base tabular-nums">
                    {inr(convertSliderVal)}
                  </span>
                </div>

                <input
                  type="range"
                  min={activeConvertMat.unitPrice}
                  max={Math.max(activeConvertMat.unitPrice * 5, cashBalance)}
                  step={activeConvertMat.id === "bricks" ? 50 : activeConvertMat.unitPrice}
                  value={convertSliderVal}
                  onChange={(e) => setConvertSliderVal(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {[
                    Math.round(activeConvertMat.unitPrice),
                    Math.round(activeConvertMat.unitPrice * 2),
                    Math.round(activeConvertMat.unitPrice * 5),
                    Math.min(cashBalance, Math.round(activeConvertMat.unitPrice * 10)),
                  ].map((val, idx) => (
                    <button
                      key={idx}
                      onClick={() => setConvertSliderVal(val)}
                      className={`px-3 py-1 rounded-full font-bold border transition-colors ${
                        convertSliderVal === val
                          ? "bg-amber-400 text-slate-950 border-amber-400"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {inr(val)}
                    </button>
                  ))}
                </div>

                {/* Conversion math preview */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">You will hold:</p>
                    <p className="font-display font-black text-emerald-400 text-sm">
                      {(convertSliderVal / activeConvertMat.unitPrice).toFixed(2)} {activeConvertMat.unitPlural}
                    </p>
                  </div>
                  <button
                    onClick={handleConfirmConvert}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black uppercase text-xs tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Confirm Lock into Vault</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODULE 4: TWO-COLUMN MAGIC UTILITY DECK ("BILL X-RAY" + "SPONSOR PAY")
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT: Bill X-Ray Scanner */}
        <div className="rounded-[28px] p-5 sm:p-6 bg-slate-900/90 text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
                    BILL X-RAY (SCAN LOCAL PARCHI → EARN GOLD)
                  </h4>
                  <p className="text-[9px] text-slate-400">
                    Scan any local hardware receipt to reveal hidden markups & earn +₹75 Intel Gold
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black">
                +₹75 DROP
              </span>
            </div>

            {/* Interactive Mock Parchi Card with laser scanner */}
            <div className="relative my-4 p-4 rounded-2xl bg-amber-50 text-slate-900 font-mono text-[10px] shadow-inner border border-amber-200 overflow-hidden">
              {/* Laser Scanning Line Animation */}
              {isScanningBill && (
                <motion.div
                  initial={{ top: "-10%" }}
                  animate={{ top: "110%" }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 shadow-[0_0_12px_#10b981] z-20"
                />
              )}

              <div className="flex justify-between items-start border-b border-dashed border-amber-300 pb-2 mb-2">
                <div>
                  <p className="font-bold text-[11px]">SHREE BALAJI HARDWARE & CEMENT</p>
                  <p className="text-[8px] text-slate-600">Alambagh Mandi, Lucknow • Cash Memo #4920</p>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-200 font-bold">PARCHI</span>
              </div>

              {/* Items in Mock Receipt */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>UltraTech Cement (10 Bags)</span>
                  <div className="text-right">
                    <span className="font-bold">₹4,100</span>
                    <span className="text-[8px] text-slate-500 block">(@ ₹410/bag)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Astral 1-in CPVC Pipe (4 Pcs)</span>
                  <div className="text-right">
                    <span className="font-bold">₹1,280</span>
                    <span className="text-[8px] text-slate-500 block">(@ ₹320/pc)</span>
                  </div>
                </div>
              </div>

              {/* Highlight Findings if bill is scanned */}
              {billScanned && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 pt-2 border-t border-dashed border-emerald-500 bg-emerald-100/90 -mx-4 -mb-4 p-3 rounded-b-2xl text-emerald-950 font-sans"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 mb-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>X-Ray Intel: You Overpaid ₹250!</span>
                  </div>
                  <p className="text-[9px] text-emerald-800 leading-tight">
                    • Dealer billed ₹410/bag vs Conon Live Mandi ₹385/bag (Diff: ₹25/bag).<br />
                    • ₹75 Intel Reward credited into your Living Vault!
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Trigger Button */}
          <div className="relative z-10 pt-2 flex gap-2">
            <button
              onClick={handleScanBill}
              disabled={isScanningBill}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${
                isScanningBill
                  ? "bg-emerald-600 text-white animate-pulse"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 active:scale-95"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>{isScanningBill ? "Scanning Bill with Laser..." : "Try Demo Local Hardware Bill Scan"}</span>
            </button>
          </div>
        </div>

        {/* RIGHT: Magic Sponsor Handshake */}
        <div className="rounded-[28px] p-5 sm:p-6 bg-slate-900/90 text-white border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  <HardHat className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
                    MAGIC SPONSOR HANDSHAKE (MISTRI ORDERS, OWNER PAYS)
                  </h4>
                  <p className="text-[9px] text-slate-400">
                    Generate a 1-tap WhatsApp payment card for plot owner. Dispatches in 60 mins.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black">
                REMOTE APPROVAL
              </span>
            </div>

            {/* Selector chips */}
            <div className="my-3 space-y-2">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                Quick Urgent Site Requests
              </p>
              <div className="space-y-1.5">
                {[
                  { text: "₹3,200 — Urgent CPVC Pipes & Fevicol", amt: 3200 },
                  { text: "₹1,850 — Binding Wire & Cover Blocks", amt: 1850 },
                  { text: "₹4,500 — Waterproofing Chemical & Brushes", amt: 4500 },
                ].map((chip) => (
                  <button
                    key={chip.amt}
                    onClick={() => {
                      setSponsorItem(chip.text);
                      setSponsorAmount(chip.amt);
                      setSponsorGenerated(false);
                      setSponsorApproved(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-[10px] font-bold border transition-colors flex items-center justify-between ${
                      sponsorAmount === chip.amt
                        ? "bg-amber-400/15 border-amber-400 text-amber-300"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    <span>{chip.text}</span>
                    <span className="text-amber-400 font-mono">{inr(chip.amt)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated WhatsApp Card Preview */}
            {sponsorGenerated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 text-[10px] mb-3"
              >
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-1.5 mb-2">
                  <span className="font-bold text-emerald-300 flex items-center gap-1">
                    📱 WhatsApp Preview: Plot Owner Approval
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono">PIN 226030</span>
                </div>
                <p className="text-[10px] text-slate-300 mb-2">
                  "Namaste Sir, Mistri Ram Sevak requested <strong>{sponsorItem}</strong> for casting. Please authorize 60-min delivery."
                </p>

                {sponsorApproved ? (
                  <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Funded & Dispatched in 60 Mins! (+₹100 Coordination Bonus credited)</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSimulateOwnerApprove}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black uppercase text-[10px] tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simulate Owner 1-Tap Approve (HDFC UPI)</span>
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Generator Button */}
          <div className="relative z-10 pt-2">
            {!sponsorGenerated && (
              <button
                onClick={handleGenerateSponsor}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Generate Owner Approval Card</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURE 2: "LEFTOVER BUYBACK" INSTANT GOLD CARD (REVERSE LOGISTICS)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-[28px] p-5 sm:p-6 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 text-white border border-emerald-500/40 shadow-xl relative overflow-hidden">
        {/* Glow Ambient */}
        <div className="absolute top-0 right-0 w-80 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-white">
                  SITE PAR MAAL BACH GAYA? (60-MIN BUYBACK → INSTANT GOLD)
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                  85% VALUE BACK
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Surplus sealed bags or cut-offs? Conon pickup rider inspects on-site & credits instant liquid Gold into your vault.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-800">
            LKO CIRCULAR SITE NETWORK
          </span>
        </div>

        {/* Buyback Item Picker & Stepper */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-950/70 p-4 rounded-2xl border border-slate-800 mb-4">
          {/* Item Dropdown */}
          <div className="md:col-span-6 space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
              Select Unused Sealed Item
            </label>
            <div className="relative">
              <select
                value={selectedBuybackItem.id}
                onChange={(e) => {
                  const it = BUYBACK_ITEMS.find((b) => b.id === e.target.value) || BUYBACK_ITEMS[0];
                  setSelectedBuybackItem(it);
                  setBuybackScheduled(false);
                  setBuybackVerified(false);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 appearance-none cursor-pointer"
              >
                {BUYBACK_ITEMS.map((item) => (
                  <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                    {item.icon} {item.name} (Retail: {inr(item.retailPrice)}/{item.unit})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
              Quantity ({selectedBuybackItem.unit})
            </label>
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setBuybackQty(Math.max(1, buybackQty - 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center transition"
              >
                −
              </button>
              <span className="flex-1 text-center font-display font-black text-sm text-white tabular-nums">
                {buybackQty}
              </span>
              <button
                type="button"
                onClick={() => setBuybackQty(buybackQty + 1)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center transition"
              >
                +
              </button>
            </div>
          </div>

          {/* 85% Instant Wallet Buyback Offer */}
          <div className="md:col-span-3 bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/30 text-right">
            <p className="text-[9px] uppercase font-bold text-emerald-300">85% Instant Buyback Offer</p>
            <p className="font-display font-black text-xl text-emerald-400 tabular-nums">
              +{inr(buybackCredit)}
            </p>
            <p className="text-[8px] text-slate-400">
              Retail: {inr(totalBuybackRetail)} ({buybackQty} {selectedBuybackItem.unit})
            </p>
          </div>
        </div>

        {/* Schedule & Live Rider Simulation Row */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          {!buybackScheduled ? (
            <button
              onClick={handleScheduleBuyback}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-slate-950" />
              <span>Schedule Free Return Pickup (Get {inr(buybackCredit)})</span>
            </button>
          ) : !buybackVerified ? (
            <div className="w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-emerald-500/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-300">
                      Partner Rider Ramesh arriving in 42 mins
                    </span>
                    <span className="text-[9px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      UP32-EL-4910 (E-Loader)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Inspecting {buybackQty} {selectedBuybackItem.unit} at Gomti Nagar Plot 42 • PIN 226030
                  </p>
                </div>
              </div>
              <button
                onClick={handleSimulateBuybackVerified}
                className="py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md shrink-0 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simulate Pickup Verified (+{inr(buybackCredit)})</span>
              </button>
            </div>
          ) : (
            <div className="w-full p-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                <span>
                  Pickup Verified & Credited: +{inr(buybackCredit)} added directly to your Living Vault!
                </span>
              </div>
              <button
                onClick={() => {
                  setBuybackScheduled(false);
                  setBuybackVerified(false);
                }}
                className="text-[10px] uppercase font-bold underline text-slate-900 hover:text-white transition-colors"
              >
                Return Another Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODULE 5: GAMIFIED "WAYS TO EARN" + SMART FILTERABLE LEDGER
         ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          Ways to Earn Gold & Site Upgrades
        </p>

        {/* 3 Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {/* Card 1: Refer a Site (+₹2,000) */}
          <div className="bg-slate-900/90 rounded-[22px] p-4 border border-slate-800 text-white shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-xl bg-emerald-500/20 text-emerald-400">🤝</span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  +₹2,000 / Site
                </span>
              </div>
              <h4 className="font-display font-black text-sm text-white">Refer a Neighbor Site</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Share your site code. Earn ₹2,000 Gold when they receive their first 60-min delivery.
              </p>
              <div className="mt-3 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="font-mono text-amber-300 text-xs font-bold">CONON-SITE-LKO</span>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black transition-colors flex items-center gap-1"
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-medium">3 Sites active • ₹6,000 total earned</p>
          </div>

          {/* Card 2: Bulk Bonus (Up to ₹500) */}
          <div className="bg-slate-900/90 rounded-[22px] p-4 border border-slate-800 text-white shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-xl bg-amber-500/20 text-amber-400">📦</span>
                <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Up to ₹500
                </span>
              </div>
              <h4 className="font-display font-black text-sm text-white">Monthly Bulk Bag Bonus</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Hit 200 bags of cement or sand this month to unlock ₹500 direct wallet credit.
              </p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-300">Progress: 140 / 200 Bags</span>
                  <span className="text-amber-400">70%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full w-[70%]" />
                </div>
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-medium">60 bags left to unlock ₹500 milestone</p>
          </div>

          {/* Card 3: Lucky Crane Drop (Tap to Crack Open!) */}
          <div
            onClick={handleCrackCrane}
            className={`rounded-[22px] p-4 text-white shadow-md flex flex-col justify-between border cursor-pointer transition-all ${
              isCraneOpened
                ? "bg-slate-900/80 border-slate-800 opacity-90"
                : "bg-gradient-to-br from-amber-900/40 via-slate-900 to-amber-950/60 border-amber-500/50 hover:border-amber-400 shadow-amber-500/10"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-xl bg-amber-400/20 text-amber-300 animate-bounce">
                  🏗️
                </span>
                <span className="text-xs font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                  {isCraneOpened ? "CLAIMED" : "TAP TO CRACK!"}
                </span>
              </div>
              <h4 className="font-display font-black text-sm text-white">Lucky Crane Drop</h4>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Crack open our heavy-duty site crate for surprise Gold credits & free express unloading.
              </p>

              {/* Crane Box visual state */}
              <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                {isCraneCracking ? (
                  <p className="text-amber-300 text-xs font-black animate-pulse">
                    💥 Unbolting Industrial Crate...
                  </p>
                ) : isCraneOpened ? (
                  <p className="text-emerald-400 text-xs font-black">
                    🎉 Claimed: Free Unloading + ₹150 Gold!
                  </p>
                ) : (
                  <p className="text-amber-400 text-xs font-black flex items-center justify-center gap-1">
                    <span>📦 Tap to Crack Open (+₹150)</span>
                  </p>
                )}
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-medium">
              {isCraneOpened ? "Drops again in 24 hours" : "Sponsored by Conon Fleet Network"}
            </p>
          </div>
        </div>

        {/* ── Filterable Recent Transactions Ledger ── */}
        <div className="rounded-[28px] p-5 sm:p-6 bg-white border border-slate-200/80 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-900">
                RECENT VAULT ACTIVITY
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Live passbook for cash top-ups, material locks, intel rewards, and dispatches
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { key: "all" as const, label: "All" },
                { key: "credit" as const, label: "Credits" },
                { key: "material_lock" as const, label: "Material Locks" },
                { key: "redeem" as const, label: "Redeemed" },
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setActiveFilter(pill.key)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    activeFilter === pill.key
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            {filteredTxns.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No transactions found in this view.</p>
            ) : (
              filteredTxns.map((txn, i) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedTxn(txn)}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/60 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm"
                      style={{ background: txn.color }}
                    >
                      {txn.amt.startsWith("+") ? "↓" : "↑"}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                        {txn.label}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 font-medium">
                        <span>{txn.date}</span>
                        {txn.details && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs">{txn.details}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className="text-xs font-black italic tracking-wide font-mono"
                      style={{ color: txn.color }}
                    >
                      {txn.amt}
                    </span>
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">Verified</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: ADD FUNDS TOP-UP MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddFunds && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 text-white rounded-[32px] p-6 max-w-md w-full border border-amber-500/40 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center">
                    +
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase text-amber-300">
                      Top Up Living Material Vault
                    </h3>
                    <p className="text-[10px] text-slate-400">Funds remain inflation-shielded at Lucknow Mandi rates</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddFunds(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-3 mb-4">
                <p className="text-[10px] uppercase font-bold text-slate-400">Enter Top-up Amount</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-display font-black text-xl">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xl font-display font-black text-white focus:outline-none focus:border-amber-400 tabular-nums"
                  />
                </div>

                {/* Quick Chips */}
                <div className="flex gap-2">
                  {ADD_FUNDS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAddAmount(preset)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        addAmount === preset
                          ? "bg-amber-400 text-slate-950 border-amber-400"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {inr(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 mb-6">
                <p className="text-[10px] uppercase font-bold text-slate-400">Payment Gateway</p>
                <div className="space-y-1.5">
                  {PAY_METHODS.map((pm) => (
                    <label
                      key={pm.id}
                      onClick={() => setSelectedPayMethod(pm.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedPayMethod === pm.id
                          ? "bg-amber-400/15 border-amber-400 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payMethod"
                          checked={selectedPayMethod === pm.id}
                          onChange={() => setSelectedPayMethod(pm.id)}
                          className="accent-amber-400"
                        />
                        <span className="text-xs font-bold">{pm.name}</span>
                      </div>
                      <span className="text-[9px] text-amber-300 font-mono">{pm.badge}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAddFunds}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
                >
                  Pay {inr(addAmount)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: EMERGENCY "SITE RESCUE SOS" MODAL (48-HR ZERO-INTEREST CREDIT)
         ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 text-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full border-2 border-rose-500/50 shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              {sosStep === "scanning" ? (
                /* Step 1: Trust Score Scanning Animation */
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto animate-pulse">
                    <Zap className="w-8 h-8 fill-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-base text-white">
                      Scanning Conon Site Trust Score...
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Checking contractor integrity, site pincode 226030, and past delivery settlements
                    </p>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: "10%" }}
                      animate={{ width: "95%" }}
                      transition={{ duration: 1.4, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono space-y-1">
                    <p>✔ GST KYC Record: Verified</p>
                    <p>✔ Lucknow Site Delivery History: 100% Cleared</p>
                    <p>✔ Site Trust Score: 94 / 100 (Prime Tier)</p>
                  </div>
                </div>
              ) : (
                /* Step 2: Unlocked Screen */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
                        <Zap className="w-5 h-5 fill-slate-950" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-sm uppercase text-rose-300">
                          ₹10,000 Zero-Interest Site Rescue Credit
                        </h3>
                        <p className="text-[10px] text-slate-400">Never halt concrete casting or masonry shift</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSosModal(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <p className="text-[9px] uppercase font-bold text-slate-400">Unlocked Credit Line</p>
                    <p className="font-display font-black text-4xl text-rose-400 my-1">₹10,000</p>
                    <p className="text-[10px] text-emerald-400 font-bold">
                      0% Interest for 48 Hours • Instant Checkout Ready
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Use instantly across all 16 Lucknow construction categories.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Repay anytime within 48 hours with zero processing fees.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Keeps site labor and transit mixers running on schedule.</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowSosModal(false)}
                      className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs uppercase"
                    >
                      Maybe Later
                    </button>
                    <button
                      onClick={handleConfirmSos}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-900/30 active:scale-95 transition-all"
                    >
                      Activate ₹10,000 Shield
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: DISPATCH FROM VAULT (60-MIN EXPRESS DELIVERY)
         ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeDispatchMat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 text-white rounded-[32px] p-6 max-w-md w-full border border-emerald-500/40 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase text-emerald-300">
                      60-Minute Site Dispatch
                    </h3>
                    <p className="text-[10px] text-slate-400">Prepaid from your Living Material Vault</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDispatchMat(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Material:</span>
                  <span className="font-bold text-white">{activeDispatchMat.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Delivery Destination:</span>
                  <span className="font-bold text-amber-300">Site Plot #42, PIN 226030 (Lucknow)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Guaranteed SLA:</span>
                  <span className="font-bold text-emerald-400">Within 60 Minutes</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Quantity to Dispatch:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={
                        activeDispatchMat.id === "cement"
                          ? materialUnits.cementBags
                          : activeDispatchMat.id === "bricks"
                          ? materialUnits.brickPieces
                          : materialUnits.aacCbm
                      }
                      value={dispatchQty}
                      onChange={(e) => setDispatchQty(Math.max(1, Number(e.target.value)))}
                      className="w-16 p-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-bold"
                    />
                    <span className="text-xs text-slate-400">{activeDispatchMat.unitPlural}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Payment Due:</span>
                  <span className="font-black text-emerald-400 text-sm">₹0 (Prepaid in Vault)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveDispatchMat(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDispatch}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  Confirm Dispatch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 4: TRANSACTION DETAIL RECEIPT MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-slate-900 rounded-[32px] p-6 max-w-sm w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black"
                    style={{ background: selectedTxn.color }}
                  >
                    ₹
                  </div>
                  <h4 className="font-display font-black text-sm uppercase text-slate-900">
                    Transaction Receipt
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 mb-4 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">Activity:</span>
                  <span className="font-black text-slate-900">{selectedTxn.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-mono font-black text-base" style={{ color: selectedTxn.color }}>
                    {selectedTxn.amt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span className="text-slate-700">{selectedTxn.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono text-[10px] text-slate-600">{selectedTxn.id}</span>
                </div>
                {selectedTxn.details && (
                  <div className="border-t border-slate-200 pt-2">
                    <span className="text-slate-400 text-[10px] block mb-0.5">Details:</span>
                    <span className="text-slate-700 text-[11px]">{selectedTxn.details}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedTxn(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs uppercase"
              >
                Close Receipt
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Delivery & Material X-Ray Feedback Studio Modal */}
      <CustomerDeliveryFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        vaultBalance={cashBalance}
      />
    </div>
  );
}

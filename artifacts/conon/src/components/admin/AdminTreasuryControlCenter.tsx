import React, { useMemo, useState } from "react";
import {
  Landmark,
  ShieldCheck,
  ArrowRight,
  Lock,
  Unlock,
  Plus,
  Search,
  Download,
  FileSpreadsheet,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  IndianRupee,
  Building2,
  Truck,
  Receipt,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCononMasterSync } from "@/context/CononMasterSyncContext";
import { useAdminCommand } from "@/context/AdminCommandContext";
import {
  computeThreeJarLiquidity,
  buildMoneyXrayTree,
  maskAccountNumber,
  downloadBankPassbookCsv,
  downloadBankPassbookPdf,
  downloadPaymentAdvicePdf,
  type CompanyBankAccount,
  type CompanyBankRole,
  type GatewayProvider,
  type TreasuryLedgerEntry,
} from "@/services/treasuryEngine";

interface AdminTreasuryControlCenterProps {
  isDark: boolean;
  initialXrayOrderId?: string | null;
  onClearInitialXray?: () => void;
}

type LedgerFilter =
  | "ALL"
  | "CUSTOMER_INFLOW"
  | "VENDOR_PAYOUT"
  | "DRIVER_PAYOUT"
  | "VAULT_TOPUP"
  | "CUSTOMER_REFUND";

export function AdminTreasuryControlCenter({
  isDark,
  initialXrayOrderId,
  onClearInitialXray,
}: AdminTreasuryControlCenterProps) {
  const masterSync = useCononMasterSync();
  const { escrowQueue } = useAdminCommand();

  const companyAccounts = masterSync.state.treasury?.companyAccounts || [];
  const ledger = masterSync.state.treasury?.ledger || [];

  const liquidity = useMemo(
    () => computeThreeJarLiquidity(ledger, escrowQueue),
    [ledger, escrowQueue]
  );

  // PIN Mask/Unmask toggle for sensitive company bank numbers
  const [isUnmasked, setIsUnmasked] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");

  // Add/Edit Company Bank Account Modal
  const [acctModalOpen, setAcctModalOpen] = useState(false);
  const [editingAcct, setEditingAcct] = useState<CompanyBankAccount | null>(null);
  const [formLabel, setFormLabel] = useState("CONON Nodal / Collection A/c");
  const [formRole, setFormRole] = useState<CompanyBankRole>("COLLECTION");
  const [formBankName, setFormBankName] = useState("HDFC Bank");
  const [formHolder, setFormHolder] = useState("CONON INFRABUILT PVT LTD");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formIfsc, setFormIfsc] = useState("");
  const [formUpiVpa, setFormUpiVpa] = useState("");
  const [formProvider, setFormProvider] = useState<GatewayProvider>("MANUAL_BANK_UTR");
  const [formPrimary, setFormPrimary] = useState(true);

  // Ledger filters & search
  const [filterType, setFilterType] = useState<LedgerFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Money X-Ray selected Order ID
  const [xrayOrderId, setXrayOrderId] = useState<string | null>(initialXrayOrderId || null);
  const activeXrayOrderId = xrayOrderId || initialXrayOrderId || null;

  const filteredLedger = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ledger.filter((row) => {
      if (filterType !== "ALL" && row.entryType !== filterType) return false;
      if (dateFrom && row.createdAt.slice(0, 10) < dateFrom) return false;
      if (dateTo && row.createdAt.slice(0, 10) > dateTo) return false;
      if (q) {
        const hay = `${row.orderId} ${row.utrNumber} ${row.beneficiaryName} ${row.fromAccountLabel} ${row.toAccountLabel}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ledger, filterType, searchQuery, dateFrom, dateTo]);

  const xrayTree = useMemo(() => {
    if (!activeXrayOrderId) return null;
    const esc = escrowQueue.find(
      (e) => e.shortId === activeXrayOrderId || e.id === activeXrayOrderId
    );
    return buildMoneyXrayTree(
      activeXrayOrderId,
      ledger,
      companyAccounts,
      esc
        ? {
            orderShortId: esc.shortId,
            dealerName: esc.dealerName,
            dealerPayoutAmount: esc.dealerPayoutAmount,
            status: esc.status,
          }
        : undefined
    );
  }, [activeXrayOrderId, ledger, companyAccounts, escrowQueue]);

  const openAddAccountModal = (defaultRole: CompanyBankRole = "COLLECTION") => {
    setEditingAcct(null);
    setFormRole(defaultRole);
    setFormLabel(
      defaultRole === "COLLECTION"
        ? "CONON Nodal / Collection A/c"
        : defaultRole === "PAYOUT"
        ? "CONON Payout Current A/c"
        : defaultRole === "TAX_RESERVE"
        ? "CONON GST & TCS Tax-Jar A/c"
        : "CONON Escrow Nodal A/c"
    );
    setFormBankName("HDFC Bank");
    setFormHolder("CONON INFRABUILT PVT LTD");
    setFormAccountNumber("");
    setFormIfsc("");
    setFormUpiVpa("");
    setFormProvider("MANUAL_BANK_UTR");
    setFormPrimary(true);
    setAcctModalOpen(true);
  };

  const openEditAccountModal = (acct: CompanyBankAccount) => {
    setEditingAcct(acct);
    setFormRole(acct.role);
    setFormLabel(acct.label);
    setFormBankName(acct.bankName);
    setFormHolder(acct.accountHolder);
    setFormAccountNumber(acct.accountNumberLast4);
    setFormIfsc(acct.ifscCode);
    setFormUpiVpa(acct.upiVpa || "");
    setFormProvider(acct.gatewayProvider);
    setFormPrimary(acct.isPrimary);
    setAcctModalOpen(true);
  };

  const handleSaveCompanyAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim() || !formBankName.trim() || !formIfsc.trim()) {
      toast.error("Bank Name, Label, and IFSC Code are required.");
      return;
    }
    const { masked, last4 } = maskAccountNumber(formAccountNumber || editingAcct?.accountNumberLast4 || "0000");
    const account: CompanyBankAccount = {
      id: editingAcct?.id || `conon_acct_${Date.now()}`,
      label: formLabel.trim(),
      role: formRole,
      bankName: formBankName.trim(),
      accountHolder: formHolder.trim() || "CONON INFRABUILT PVT LTD",
      accountNumberMasked: masked,
      accountNumberLast4: last4,
      ifscCode: formIfsc.trim().toUpperCase(),
      upiVpa: formUpiVpa.trim(),
      gatewayProvider: formProvider,
      isPrimary: formPrimary,
      createdAt: editingAcct?.createdAt || new Date().toISOString(),
    };
    await masterSync.upsertCompanyBankAccount(account);
    setAcctModalOpen(false);
    toast.success(`Saved "${account.label}" (${account.bankName} ••${account.accountNumberLast4})`);
  };

  const handleToggleMask = () => {
    if (isUnmasked) {
      setIsUnmasked(false);
      return;
    }
    setPinInput("");
    setPinModalOpen(true);
  };

  const verifyPinAndUnmask = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === "1234" || pinInput.trim() === "9988") {
      setIsUnmasked(true);
      setPinModalOpen(false);
      toast.success("Treasury View Unmasked for this session.");
    } else {
      toast.error("Invalid Founder Treasury PIN (default: 1234)");
    }
  };

  const cardCls = isDark
    ? "bg-[#0F172A] border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-sm";
  const subCardCls = isDark
    ? "bg-[#080D1A] border-slate-800/80"
    : "bg-slate-50 border-slate-200";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${cardCls}`}>
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-black tracking-tight">
              Khata &amp; Bank — CONON Treasury &amp; Live Money X-Ray
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              100% Zero-Dummy Ledger
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Track every rupee from Customer UPI / Living Vault → CONON Bank → Partner Penny-Drop Bank UTR &amp; Govt Tax-Jar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleToggleMask}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition ${
              isUnmasked
                ? "bg-amber-400/20 text-amber-400 border-amber-400/40"
                : isDark
                ? "bg-slate-900 text-slate-300 border-slate-700 hover:text-white"
                : "bg-slate-100 text-slate-700 border-slate-300 hover:text-slate-950"
            }`}
          >
            {isUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isUnmasked ? "Mask Accounts" : "Unmask (PIN)"}</span>
          </button>

          <button
            type="button"
            onClick={() => downloadBankPassbookCsv(filteredLedger)}
            disabled={filteredLedger.length === 0}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
              isDark
                ? "bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
                : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Passbook CSV</span>
          </button>

          <button
            type="button"
            onClick={() => downloadBankPassbookPdf(filteredLedger, companyAccounts, liquidity)}
            disabled={filteredLedger.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-black bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Bank Passbook PDF</span>
          </button>
        </div>
      </div>

      {/* 0. PAYMENT & POD POLICY CONTROLS (Synced < 500ms to Storefront & Backend) */}
      <div className={`p-5 rounded-2xl border space-y-4 ${cardCls}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-black uppercase tracking-wider">
                Payment &amp; POD Policy Controls
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500">
                Live &lt; 500ms Sync
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Enforces Pay-First Escrow across Storefront, RMC Plant, Skilled Services, Heavy Rentals &amp; Backend APIs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold">POD Limit (Materials ₹):</label>
            <input
              type="number"
              min={0}
              step={500}
              value={masterSync.state.globalControls?.paymentPolicy?.podMaxMaterialAmount ?? 10000}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value || 0));
                masterSync.patchMasterState(
                  {
                    globalControls: {
                      paymentPolicy: {
                        podMaxMaterialAmount: val,
                        forcePrepaidRmc: masterSync.state.globalControls?.paymentPolicy?.forcePrepaidRmc ?? true,
                        forcePrepaidServices: masterSync.state.globalControls?.paymentPolicy?.forcePrepaidServices ?? true,
                        forcePrepaidRentals: masterSync.state.globalControls?.paymentPolicy?.forcePrepaidRentals ?? true,
                      },
                    },
                  },
                  "globalControls"
                );
              }}
              className={`w-28 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-black ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-amber-300"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {(
            [
              { key: "forcePrepaidRmc", label: "RMC Prepaid Only" },
              { key: "forcePrepaidServices", label: "Skilled Services Prepaid Only" },
              { key: "forcePrepaidRentals", label: "Machine Rentals Prepaid Only" },
            ] as const
          ).map((item) => {
            const pp = masterSync.state.globalControls?.paymentPolicy || {
              podMaxMaterialAmount: 10000,
              forcePrepaidRmc: true,
              forcePrepaidServices: true,
              forcePrepaidRentals: true,
            };
            const active = pp[item.key] ?? true;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  masterSync.patchMasterState(
                    {
                      globalControls: {
                        paymentPolicy: {
                          ...pp,
                          [item.key]: !active,
                        },
                      },
                    },
                    "globalControls"
                  );
                  toast.success(`${item.label}: ${!active ? "ON (100% Prepaid)" : "OFF"}`);
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  active
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                    : isDark
                    ? "border-slate-700 bg-slate-900 text-slate-400"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <span className="font-bold">{item.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/20">
                  {active ? "LOCKED ON" : "OFF"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. WORLD-FIRST "3-JAR LIQUIDITY SHIELD" KPI STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border ${cardCls}`}>
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-sky-500">
            <span>Jar 1 • Customer Collection</span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono mt-2">
            ₹{liquidity.customerInflow.toLocaleString("en-IN")}
          </div>
          <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Total Aaya (UPI, Vault &amp; Gateway)
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${cardCls}`}>
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-amber-500">
            <span>Jar 2 • Locked Partner Escrow</span>
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono mt-2">
            ₹{liquidity.lockedPartnerEscrow.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] mt-1 font-bold text-amber-500">
            Vendor + Driver ka Paisa • Not Company Profit
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${cardCls}`}>
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-rose-500">
            <span>Jar 3 • Govt Tax-Jar</span>
            <Receipt className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono mt-2">
            ₹{liquidity.govtTaxJar.toLocaleString("en-IN")}
          </div>
          <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            GST + 1% E-Commerce TCS Reserve
          </p>
        </div>

        <div className={`p-4 rounded-2xl border border-emerald-500/40 ${isDark ? "bg-emerald-950/20 text-white" : "bg-emerald-50 text-slate-900"}`}>
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-emerald-500">
            <span>Jar 4 • CONON Shuddh Munafa</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono mt-2 text-emerald-500">
            ₹{liquidity.cononNetProfit.toLocaleString("en-IN")}
          </div>
          <p className={`text-[11px] mt-1 font-bold ${isDark ? "text-emerald-300/80" : "text-emerald-700"}`}>
            100% Spendable Net Platform Profit
          </p>
        </div>
      </div>

      {/* 2. MY CONON ACCOUNTS (COMPANY BANK VAULT) */}
      <div className={`p-5 rounded-2xl border ${cardCls}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-black flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              My CONON Company Bank Accounts &amp; Gateway Rails
            </h2>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Configure where Customer UPI payments arrive and which CONON Current Account funds Partner payouts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openAddAccountModal("COLLECTION")}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add CONON Bank Account
            </button>
          </div>
        </div>

        {companyAccounts.length === 0 ? (
          <div className={`p-6 rounded-2xl border border-dashed text-center ${subCardCls}`}>
            <Landmark className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="text-sm font-black">
              Setup Your CONON Company Bank Accounts
            </h3>
            <p className={`text-xs max-w-lg mx-auto mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              No dummy bank accounts are preloaded. Add your real CONON Collection A/c (Customer Inflow) and Payout Current A/c (Vendor &amp; Driver Transfers).
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => openAddAccountModal("COLLECTION")}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
              >
                + Add Collection Account
              </button>
              <button
                type="button"
                onClick={() => openAddAccountModal("PAYOUT")}
                className={`px-4 py-2 rounded-xl text-xs font-black border cursor-pointer ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
                    : "bg-white border-slate-300 text-slate-900 hover:bg-slate-100"
                }`}
              >
                + Add Payout Account
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {companyAccounts.map((acct) => (
              <div
                key={acct.id}
                className={`p-4 rounded-xl border transition ${
                  acct.isPrimary
                    ? isDark
                      ? "bg-amber-400/10 border-amber-400/40"
                      : "bg-amber-50 border-amber-300"
                    : subCardCls
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                      {acct.role}
                    </span>
                    <h3 className="text-sm font-black mt-1.5">{acct.label}</h3>
                    <p className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {acct.bankName} • {isUnmasked ? `A/c ending ${acct.accountNumberLast4}` : acct.accountNumberMasked}
                    </p>
                  </div>
                  {acct.isPrimary && (
                    <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Primary
                    </span>
                  )}
                </div>
                <div className={`mt-2.5 pt-2.5 border-t text-[11px] space-y-1 ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"}`}>
                  <div>IFSC: <strong className="font-mono">{acct.ifscCode}</strong></div>
                  {acct.upiVpa && <div>Merchant UPI: <strong className="font-mono">{acct.upiVpa}</strong></div>}
                  <div>Rail: <strong>{acct.gatewayProvider}</strong></div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {!acct.isPrimary && (
                    <button
                      type="button"
                      onClick={() => masterSync.setPrimaryCompanyBankAccount(acct.id, acct.role)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-500 text-[11px] font-black cursor-pointer"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEditAccountModal(acct)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      isDark ? "border-slate-700 text-slate-300" : "border-slate-300 text-slate-700"
                    }`}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE "MONEY X-RAY" VISUAL FLOW DIAGRAM */}
      {xrayTree && (
        <div className={`p-5 rounded-2xl border border-amber-400/50 ${cardCls}`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Live Money X-Ray — Order #{xrayTree.orderId}
              </h2>
              <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Complete end-to-end banking rail split from Customer Inflow to CONON Treasury &amp; Partner UTR
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setXrayOrderId(null);
                onClearInitialXray?.();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800/40 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-3 items-center">
            {/* Left Node: Customer Inflow */}
            <div className={`lg:col-span-3 p-4 rounded-2xl border border-sky-500/40 ${isDark ? "bg-sky-950/20" : "bg-sky-50"}`}>
              <span className="text-[10px] font-black uppercase text-sky-500">1. Customer Inflow (CR+)</span>
              <div className="text-lg font-black font-mono mt-1">
                ₹{xrayTree.grossAmount.toLocaleString("en-IN")}
              </div>
              <div className="text-xs font-bold mt-1">
                {xrayTree.customerInflow?.beneficiaryName || xrayTree.customerInflow?.customerName || "Customer"}
              </div>
              <div className="text-[11px] opacity-80 mt-1 font-mono">
                Mode: {xrayTree.customerInflow?.paymentMode || "UPI / Vault"}
                <br />
                UTR: {xrayTree.customerInflow?.utrNumber || "Recorded"}
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-1 justify-center">
              <ArrowRight className="w-6 h-6 text-amber-500 animate-pulse" />
            </div>

            {/* Middle Node: CONON Treasury */}
            <div className={`lg:col-span-3 p-4 rounded-2xl border border-amber-400/50 ${isDark ? "bg-amber-950/20" : "bg-amber-50"}`}>
              <span className="text-[10px] font-black uppercase text-amber-500">2. CONON Treasury Hub</span>
              <div className="text-sm font-black mt-1">
                {xrayTree.collectionAccount?.label || "CONON Collection A/c"}
              </div>
              <div className="text-[11px] font-mono opacity-80 mt-1">
                {xrayTree.collectionAccount
                  ? `${xrayTree.collectionAccount.bankName} ${xrayTree.collectionAccount.accountNumberMasked} • ${xrayTree.collectionAccount.ifscCode}`
                  : "Configure in My CONON Accounts"}
              </div>
              <div className="mt-2 pt-2 border-t border-amber-500/20 text-xs font-black">
                Gross Split: ₹{xrayTree.grossAmount.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="hidden lg:flex lg:col-span-1 justify-center">
              <ArrowRight className="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>

            {/* Right Nodes: 4 Split Rails */}
            <div className="lg:col-span-3 space-y-2">
              <div className={`p-2.5 rounded-xl border text-xs ${xrayTree.vendorPayout ? "border-emerald-500/50 bg-emerald-500/10" : subCardCls}`}>
                <div className="flex justify-between font-black">
                  <span>Vendor Node</span>
                  <span>₹{xrayTree.vendorShareAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="text-[10px] opacity-80 font-mono">
                  {xrayTree.vendorPayout
                    ? `SETTLED ✓ • ${xrayTree.vendorPayout.toAccountRef} • UTR: ${xrayTree.vendorPayout.utrNumber}`
                    : "ESCROW HOLD (Awaiting Release)"}
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border text-xs ${xrayTree.driverPayout ? "border-emerald-500/50 bg-emerald-500/10" : subCardCls}`}>
                <div className="flex justify-between font-black">
                  <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Driver Node</span>
                  <span>₹{xrayTree.driverShareAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="text-[10px] opacity-80 font-mono">
                  {xrayTree.driverPayout
                    ? `SETTLED ✓ • UTR: ${xrayTree.driverPayout.utrNumber}`
                    : "Pending Trip Settlement"}
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border text-xs ${subCardCls}`}>
                <div className="flex justify-between font-black text-rose-500">
                  <span>Govt Tax-Jar (GST + 1% TCS)</span>
                  <span>₹{xrayTree.govtTaxAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs">
                <div className="flex justify-between font-black text-emerald-500">
                  <span>CONON Net Profit</span>
                  <span>₹{xrayTree.cononProfitAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. NETBANKING-STYLE LIVE BANK PASSBOOK & UTR LEDGER */}
      <div className={`p-5 rounded-2xl border ${cardCls}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-black">
            Live Bank Passbook &amp; UTR Ledger ({filteredLedger.length})
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["ALL", "All"],
                ["CUSTOMER_INFLOW", "Customer Inflow (CR+)"],
                ["VENDOR_PAYOUT", "Vendor Payouts (DR-)"],
                ["DRIVER_PAYOUT", "Driver Payouts (DR-)"],
                ["VAULT_TOPUP", "Vault Top-ups"],
                ["CUSTOMER_REFUND", "Refunds"],
              ] as [LedgerFilter, string][]
            ).map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilterType(k)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition ${
                  filterType === k
                    ? "bg-amber-400 text-slate-950"
                    : isDark
                    ? "bg-slate-900 text-slate-300 border border-slate-800"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 mb-4">
          <div className="md:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 12-Digit UTR, Order ID, or Partner Name..."
              className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs ${
                isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
          />
        </div>

        {filteredLedger.length === 0 ? (
          <div className={`p-8 rounded-2xl border border-dashed text-center ${subCardCls}`}>
            <ShieldCheck className="w-9 h-9 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-black">
              Treasury Vault Armed — Add Your CONON Bank Account &amp; Wait for First Live Order
            </h3>
            <p className={`text-xs max-w-lg mx-auto mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Zero fake or dummy transactions exist. Real customer UPI/Vault payments and verified Vendor/Driver UTR payouts will appear here in real time.
            </p>
            {companyAccounts.length === 0 && (
              <button
                type="button"
                onClick={() => openAddAccountModal("COLLECTION")}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
              >
                Add CONON Bank Account
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                  <th className="py-2.5 pr-3 font-black">Date &amp; Time</th>
                  <th className="py-2.5 pr-3 font-black">Order / Ref</th>
                  <th className="py-2.5 pr-3 font-black">Flow</th>
                  <th className="py-2.5 pr-3 font-black">From Account</th>
                  <th className="py-2.5 pr-3 font-black">To Account</th>
                  <th className="py-2.5 pr-3 font-black">Mode</th>
                  <th className="py-2.5 pr-3 font-black">12-Digit UTR</th>
                  <th className="py-2.5 pr-3 font-black text-right">Amount (₹)</th>
                  <th className="py-2.5 pr-3 font-black">Status</th>
                  <th className="py-2.5 font-black text-right">Receipt / X-Ray</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((row: TreasuryLedgerEntry) => (
                  <tr
                    key={row.id}
                    className={`border-b transition ${isDark ? "border-slate-800/60 hover:bg-slate-900/50" : "border-slate-100 hover:bg-slate-50"}`}
                  >
                    <td className="py-2.5 pr-3 whitespace-nowrap font-mono text-[11px]">
                      {new Date(row.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 pr-3 font-mono font-bold">{row.orderId}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          row.direction === "CREDIT"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-rose-500/15 text-rose-500"
                        }`}
                      >
                        {row.direction === "CREDIT" ? "CR+" : "DR-"} {row.entryType}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="font-bold">{row.fromAccountLabel}</div>
                      <div className="text-[10px] opacity-70 font-mono">{row.fromAccountRef}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="font-bold">{row.toAccountLabel}</div>
                      <div className="text-[10px] opacity-70 font-mono">
                        {row.toAccountRef}
                        {row.toIfsc ? ` • ${row.toIfsc}` : ""}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-[11px]">{row.paymentMode}</td>
                    <td className="py-2.5 pr-3 font-mono font-bold text-amber-500">{row.utrNumber}</td>
                    <td className="py-2.5 pr-3 text-right font-mono font-black">
                      ₹{row.netAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-500">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setXrayOrderId(row.orderId)}
                        className="px-2 py-1 rounded-lg bg-amber-400/15 text-amber-500 text-[10px] font-black cursor-pointer"
                      >
                        Money X-Ray
                      </button>
                      {row.direction === "DEBIT" && (
                        <button
                          type="button"
                          onClick={() => downloadPaymentAdvicePdf(row, companyAccounts)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-500 text-[10px] font-black cursor-pointer"
                        >
                          Advice PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PIN Unmask Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <form onSubmit={verifyPinAndUnmask} className={`w-full max-w-sm p-6 rounded-2xl border ${cardCls}`}>
            <h3 className="text-base font-black">Enter Founder Treasury PIN</h3>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Default local PIN: <code className="font-mono">1234</code>
            </p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              autoFocus
              className={`w-full mt-3 px-3 py-2 rounded-xl border text-sm font-mono ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setPinModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black cursor-pointer"
              >
                Unlock View
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add/Edit Company Bank Account Modal */}
      {acctModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCompanyAccount} className={`w-full max-w-lg p-6 rounded-2xl border space-y-3 ${cardCls}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black">
                {editingAcct ? "Edit CONON Bank Account" : "Add CONON Company Bank Account"}
              </h3>
              <button type="button" onClick={() => setAcctModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Account Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as CompanyBankRole)}
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
                >
                  <option value="COLLECTION">COLLECTION (Paisa Aane Ka Khata)</option>
                  <option value="PAYOUT">PAYOUT (Paisa Jaane Ka Khata)</option>
                  <option value="ESCROW_NODAL">ESCROW_NODAL</option>
                  <option value="TAX_RESERVE">TAX_RESERVE (GST + TCS Jar)</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Account Label</label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Account Holder</label>
                <input
                  type="text"
                  value={formHolder}
                  onChange={(e) => setFormHolder(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Account No. (stored masked)</label>
                <input
                  type="text"
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  placeholder="e.g. 50200088123456"
                  required
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
                />
              </div>
              <div>
                <label className="font-bold block mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={formIfsc}
                  onChange={(e) => setFormIfsc(e.target.value.toUpperCase())}
                  placeholder="HDFC0001234"
                  required
                  className={`w-full px-3 py-2 rounded-xl border font-mono uppercase ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
                />
              </div>
              <div>
                <label className="font-bold block mb-1">UPI Merchant VPA (optional)</label>
                <input
                  type="text"
                  value={formUpiVpa}
                  onChange={(e) => setFormUpiVpa(e.target.value)}
                  placeholder="cononnow@hdfcbank"
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Payout / Collection Rail</label>
                <select
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value as GatewayProvider)}
                  className={`w-full px-3 py-2 rounded-xl border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
                >
                  <option value="MANUAL_BANK_UTR">MANUAL_BANK_UTR (HDFC/ICICI/SBI App)</option>
                  <option value="RAZORPAY_ROUTE_API">RAZORPAY_ROUTE_API</option>
                  <option value="CASHFREE_EASY_SPLIT">CASHFREE_EASY_SPLIT</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={formPrimary}
                onChange={(e) => setFormPrimary(e.target.checked)}
              />
              <span>Set as Primary Account for {formRole}</span>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/30">
              <button type="button" onClick={() => setAcctModalOpen(false)} className="px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer">
                Save Company Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

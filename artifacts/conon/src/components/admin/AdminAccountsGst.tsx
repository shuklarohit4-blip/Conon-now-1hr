import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Download,
  Calendar,
  Building2,
  TrendingUp,
  CreditCard,
  Percent,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Edit2,
  X,
  IndianRupee,
  Receipt,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  type CompanyGstSettings,
  type GstReportData,
  type GstHsnSummaryRow,
  type GstInvoiceRow,
  fetchGstReport,
  generateGstReportPdf,
  downloadGstCsv,
  getCompanyGstSettings,
  saveCompanyGstSettings,
} from "@/services/adminAccountsGstService";

interface AdminAccountsGstProps {
  onRefreshParent?: () => void;
}

export function AdminAccountsGst({ onRefreshParent }: AdminAccountsGstProps) {
  const [period, setPeriod] = useState<"today" | "yesterday" | "week" | "month" | "custom">("today");
  const [reportData, setReportData] = useState<GstReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Invoice Register Filter
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<"all" | "b2b" | "b2c">("all");
  const [invoiceSearch, setInvoiceSearch] = useState("");

  // Company Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<CompanyGstSettings>(getCompanyGstSettings());

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGstReport(period);
      setReportData(data);
    } catch {
      toast.error("Failed to load GST & Accounting data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, [period]);

  // Handle PDF Generation
  const handleDownloadPdf = async () => {
    if (!reportData) return;
    try {
      setIsGeneratingPdf(true);
      toast.info("Generating official CA-Ready GST PDF with Lucknow letterhead...", {
        icon: "📄",
      });
      await generateGstReportPdf(reportData);
      toast.success("Downloaded: CONON-NOW_Daily_Accounts_GST.pdf", {
        icon: "✅",
      });
    } catch (err: any) {
      toast.error(`PDF generation failed: ${err.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle CSV Download
  const handleDownloadCsv = () => {
    if (!reportData) return;
    try {
      downloadGstCsv(reportData);
      toast.success("Exported CA CSV (Tally / GSTR-1 Offline Tool format)", {
        icon: "📊",
      });
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyGstSettings(settingsForm);
    toast.success("Saved company GST & Letterhead settings!");
    setIsSettingsOpen(false);
    void loadReport();
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    if (!reportData?.invoices) return [];
    return reportData.invoices.filter((inv) => {
      const matchesType =
        invoiceTypeFilter === "all" ||
        (invoiceTypeFilter === "b2b" && inv.isB2B) ||
        (invoiceTypeFilter === "b2c" && !inv.isB2B);

      const term = invoiceSearch.toLowerCase().trim();
      const matchesSearch =
        !term ||
        inv.invoiceNo.toLowerCase().includes(term) ||
        inv.customerName.toLowerCase().includes(term) ||
        inv.customerPhone.includes(term) ||
        inv.customerGstin.toLowerCase().includes(term);

      return matchesType && matchesSearch;
    });
  }, [reportData?.invoices, invoiceTypeFilter, invoiceSearch]);

  const kpis = reportData?.kpis;
  const company = reportData?.company || getCompanyGstSettings();

  return (
    <div className="space-y-6">
      {/* Top Banner / Corporate Letterhead Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  ACCOUNTS &amp; GST ENGINE
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  Roz Ka Hisaab
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {company.companyName} • GSTIN: <strong className="text-amber-300 font-mono">{company.gstin}</strong> • State: {company.stateCode} ({company.state})
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSettingsForm(company);
              setIsSettingsOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>GST &amp; Letterhead</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CA CSV</span>
          </button>

          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleDownloadPdf}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? "Building PDF..." : "1-Click CA GST PDF"}</span>
          </button>

          <button
            type="button"
            onClick={() => void loadReport()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Date Period Selector Pills */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Accounting Period:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPeriod("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === "today"
                ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Today (Aaj Ka Hisaab)
          </button>
          <button
            type="button"
            onClick={() => setPeriod("yesterday")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === "yesterday"
                ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Yesterday
          </button>
          <button
            type="button"
            onClick={() => setPeriod("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === "week"
                ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => setPeriod("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === "month"
                ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Current Month (GSTR-1)
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">GROSS SALES / GMV</span>
              <Receipt className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">
              ₹{(kpis?.grossTurnover || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Customer Invoiced Value</span>
            <span className="text-emerald-400 font-bold font-mono">100% Inflow</span>
          </div>
        </div>

        {/* Card 2: Taxable Value */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">TAXABLE VALUE (EX-GST)</span>
              <Building2 className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-300 mt-2">
              ₹{(kpis?.taxableValue || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Base Construction Goods</span>
            <span className="text-slate-300 font-mono">GSTR-1 Col 6</span>
          </div>
        </div>

        {/* Card 3: Total GST Collected */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">TOTAL GST COLLECTED</span>
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2">
              ₹{(kpis?.totalGst || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>CGST 9%: ₹{kpis?.cgstAmount || 0}</span>
            <span>SGST 9%: ₹{kpis?.sgstAmount || 0}</span>
          </div>
        </div>

        {/* Card 4: Conon Margin & Commission GST */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">CONON PLATFORM MARGIN</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300 mt-2">
              ₹{(kpis?.netPlatformMargin || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Platform Commission</span>
            <span className="text-purple-400 font-bold font-mono">18% GST: ₹{kpis?.commissionGst || 0}</span>
          </div>
        </div>
      </div>

      {/* Cashflow Reconciliation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
          <span>DAILY CASHFLOW &amp; ESCROW SETTLEMENT RECONCILIATION</span>
          <span className="text-[10px] text-slate-500 font-mono">Real-time Bank IMPS / Escrow Sync</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">1. Customer Inflows</div>
            <div className="text-sm font-black text-white mt-0.5">
              ₹{(kpis?.cashflow?.customerInflows || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Vault &amp; UPI received</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">2. Less: Vendor Escrow</div>
            <div className="text-sm font-black text-amber-300 mt-0.5">
              - ₹{(kpis?.cashflow?.vendorPayouts || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Goods landing payouts</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">3. Less: Driver Payouts</div>
            <div className="text-sm font-black text-amber-300 mt-0.5">
              - ₹{(kpis?.cashflow?.driverPayouts || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Trip &amp; labour fees</div>
          </div>

          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-bold">4. Net Conon Retention</div>
            <div className="text-sm font-black text-emerald-400 mt-0.5">
              = ₹{(kpis?.cashflow?.netRetention || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-emerald-300/80 font-medium">Retained platform cash</div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          SECTION 1: GSTR-1 TABLE 12 HSN SUMMARY TABLE
      ──────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-400" />
              <span>GSTR-1 TABLE 12: HSN-WISE SUMMARY OF OUTWARD SUPPLIES</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mandatory 8-digit HSN breakdown with authentic CGST 9% and SGST 9% split for Lucknow supply corridor.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">HSN Code</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">UQC</th>
                <th className="py-2.5 px-3 text-right">Total Qty</th>
                <th className="py-2.5 px-3 text-right">Total Value (₹)</th>
                <th className="py-2.5 px-3 text-right">Taxable Value (₹)</th>
                <th className="py-2.5 px-3 text-center">GST Rate</th>
                <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                <th className="py-2.5 px-3 text-right font-black text-amber-300">Total Tax (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(reportData?.hsnSummary || []).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2 px-3 font-bold text-amber-400">{row.hsnCode}</td>
                  <td className="py-2 px-3 font-sans text-slate-200">{row.description}</td>
                  <td className="py-2 px-3 text-center text-slate-400">{row.uqc}</td>
                  <td className="py-2 px-3 text-right text-slate-200">{row.totalQuantity}</td>
                  <td className="py-2 px-3 text-right text-slate-200">
                    {row.totalValue.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 px-3 text-right text-sky-300">
                    {row.taxableValue.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-300 font-sans">{row.gstRate}%</td>
                  <td className="py-2 px-3 text-right text-slate-300">
                    {row.cgstAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-300">
                    {row.sgstAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">
                    {row.totalTax.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          SECTION 2: B2B VS B2C TAX INVOICE REGISTER
      ──────────────────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>TAX INVOICE &amp; PAYMENT RECONCILIATION REGISTER</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live settlement status, GSTIN attribution, and customer payment modes.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Search invoice, customer, GSTIN..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setInvoiceTypeFilter("all")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  invoiceTypeFilter === "all"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All ({reportData?.invoices?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setInvoiceTypeFilter("b2b")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  invoiceTypeFilter === "b2b"
                    ? "bg-amber-400/20 text-amber-300 font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                B2B (GSTIN)
              </button>
              <button
                type="button"
                onClick={() => setInvoiceTypeFilter("b2c")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  invoiceTypeFilter === "b2c"
                    ? "bg-sky-400/20 text-sky-300 font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                B2C Retail
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Invoice No</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer &amp; Contact</th>
                <th className="py-2.5 px-3">GSTIN / Type</th>
                <th className="py-2.5 px-3">Payment Mode</th>
                <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                <th className="py-2.5 px-3 text-right">GST (₹)</th>
                <th className="py-2.5 px-3 text-right font-black text-amber-300">Total (₹)</th>
                <th className="py-2.5 px-3 text-center">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-white">
                        GSTR-1 NIL Statement Ready (Clean Slate)
                      </h4>
                      <p className="text-xs text-slate-400">
                        ₹0 taxable sales recorded in current filter. All ledger balances are clean. You can generate CA-compliant GSTR-1 NIL Return PDF and CSV statements directly.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleDownloadPdf}
                          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download NIL Return (PDF)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadCsv}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export NIL CSV</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{inv.invoiceNo}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{inv.date}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-200">{inv.customerName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{inv.customerPhone}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {inv.isB2B ? (
                        <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {inv.customerGstin}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">URP (Retail)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{inv.paymentMode}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-sky-300">
                      ₹{inv.taxableValue.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                      ₹{inv.gstAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      ₹{inv.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        SETTLED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────────
          MODAL: COMPANY GST & LETTERHEAD SETTINGS
      ──────────────────────────────────────────────────────────────────────────── */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Company GST &amp; Letterhead Settings</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Company Registered Name</label>
                <input
                  type="text"
                  required
                  value={settingsForm.companyName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Trade / Brand Name</label>
                <input
                  type="text"
                  value={settingsForm.brandTradeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, brandTradeName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Registered Address (Lucknow)</label>
                <textarea
                  rows={2}
                  value={settingsForm.registeredAddress}
                  onChange={(e) => setSettingsForm({ ...settingsForm, registeredAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">City</label>
                  <input
                    type="text"
                    value={settingsForm.city}
                    onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">State Code</label>
                  <input
                    type="text"
                    value={settingsForm.stateCode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, stateCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={settingsForm.pincode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.gstin}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Company PAN</label>
                  <input
                    type="text"
                    value={settingsForm.pan}
                    onChange={(e) => setSettingsForm({ ...settingsForm, pan: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Authorized Signatory</label>
                  <input
                    type="text"
                    value={settingsForm.authorizedSignatory}
                    onChange={(e) => setSettingsForm({ ...settingsForm, authorizedSignatory: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Designation</label>
                  <input
                    type="text"
                    value={settingsForm.signatoryDesignation}
                    onChange={(e) => setSettingsForm({ ...settingsForm, signatoryDesignation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-400/20"
                >
                  Save Letterhead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export type CompanyBankRole = "COLLECTION" | "ESCROW_NODAL" | "PAYOUT" | "TAX_RESERVE";
export type GatewayProvider = "RAZORPAY_ROUTE_API" | "CASHFREE_EASY_SPLIT" | "MANUAL_BANK_UTR";

export interface CompanyBankAccount {
  id: string;
  label: string;
  role: CompanyBankRole;
  bankName: string;
  accountHolder: string;
  accountNumberMasked: string;
  accountNumberLast4: string;
  ifscCode: string;
  upiVpa?: string;
  gatewayProvider: GatewayProvider;
  isPrimary: boolean;
  createdAt: string;
}

export type TreasuryEntryType =
  | "CUSTOMER_INFLOW"
  | "VAULT_TOPUP"
  | "VENDOR_PAYOUT"
  | "DRIVER_PAYOUT"
  | "CUSTOMER_REFUND"
  | "TAX_RESERVE";

export type TreasuryDirection = "CREDIT" | "DEBIT";
export type TreasuryEntryStatus = "SETTLED" | "ESCROW_HOLD" | "DISPUTE_FROZEN" | "FAILED";

export interface TreasuryLedgerEntry {
  id: string;
  orderId: string;
  entryType: TreasuryEntryType;
  direction: TreasuryDirection;
  fromAccountLabel: string;
  fromAccountRef: string;
  toAccountLabel: string;
  toAccountRef: string;
  toIfsc?: string;
  beneficiaryName: string;
  paymentMode: string;
  utrNumber: string;
  gatewayRefId?: string;
  grossAmount: number;
  platformMargin: number;
  taxAmount: number;
  netAmount: number;
  status: TreasuryEntryStatus;
  createdAt: string;
  customerName?: string;
  vendorName?: string;
  driverName?: string;
  pennyDropVerified?: boolean;
}

export interface TreasuryState {
  companyAccounts: CompanyBankAccount[];
  ledger: TreasuryLedgerEntry[];
}

export interface ThreeJarLiquidity {
  customerInflow: number;
  lockedPartnerEscrow: number;
  govtTaxJar: number;
  cononNetProfit: number;
  totalDisbursed: number;
  vaultTopups: number;
}

export function maskAccountNumber(raw: string): { masked: string; last4: string } {
  const clean = raw.replace(/\s+/g, "");
  const last4 = clean.slice(-4) || "0000";
  return {
    masked: `•••• •••• ${last4}`,
    last4,
  };
}

export function generateUtr(prefix = "4"): string {
  const rand = Math.floor(10000000000 + Math.random() * 89999999999);
  return `${prefix}${String(rand).slice(0, 11)}`;
}

export function computeThreeJarLiquidity(
  ledger: TreasuryLedgerEntry[],
  pendingEscrowItems: Array<{ dealerPayoutAmount?: number; status?: string }> = []
): ThreeJarLiquidity {
  let customerInflow = 0;
  let totalDisbursed = 0;
  let govtTaxJar = 0;
  let cononNetProfit = 0;
  let vaultTopups = 0;
  let refunds = 0;

  for (const row of ledger) {
    if (row.direction === "CREDIT") {
      if (row.entryType === "CUSTOMER_INFLOW") {
        customerInflow += Number(row.grossAmount || row.netAmount || 0);
        govtTaxJar += Number(row.taxAmount || 0);
        cononNetProfit += Number(row.platformMargin || 0);
      } else if (row.entryType === "VAULT_TOPUP") {
        vaultTopups += Number(row.netAmount || row.grossAmount || 0);
        customerInflow += Number(row.netAmount || row.grossAmount || 0);
      }
    } else if (row.direction === "DEBIT") {
      if (row.entryType === "VENDOR_PAYOUT" || row.entryType === "DRIVER_PAYOUT") {
        totalDisbursed += Number(row.netAmount || 0);
      } else if (row.entryType === "CUSTOMER_REFUND") {
        refunds += Number(row.netAmount || 0);
      }
    }
  }

  const explicitPendingEscrow = pendingEscrowItems
    .filter((e) => e.status === "AWAITING_RELEASE" || e.status === "DISPUTE_HELD")
    .reduce((sum, e) => sum + Number(e.dealerPayoutAmount || 0), 0);

  const computedEscrowRemainder = Math.max(
    0,
    customerInflow - vaultTopups - totalDisbursed - govtTaxJar - cononNetProfit - refunds
  );

  const lockedPartnerEscrow = Math.max(explicitPendingEscrow, computedEscrowRemainder);

  return {
    customerInflow: Math.round(customerInflow),
    lockedPartnerEscrow: Math.round(lockedPartnerEscrow),
    govtTaxJar: Math.round(govtTaxJar),
    cononNetProfit: Math.round(cononNetProfit),
    totalDisbursed: Math.round(totalDisbursed),
    vaultTopups: Math.round(vaultTopups),
  };
}

export interface MoneyXrayTree {
  orderId: string;
  customerInflow?: TreasuryLedgerEntry;
  collectionAccount?: CompanyBankAccount;
  payoutAccount?: CompanyBankAccount;
  vendorPayout?: TreasuryLedgerEntry;
  driverPayout?: TreasuryLedgerEntry;
  grossAmount: number;
  govtTaxAmount: number;
  cononProfitAmount: number;
  vendorShareAmount: number;
  driverShareAmount: number;
}

export function buildMoneyXrayTree(
  orderId: string,
  ledger: TreasuryLedgerEntry[],
  companyAccounts: CompanyBankAccount[],
  fallbackEscrow?: {
    orderShortId?: string;
    dealerName?: string;
    dealerPayoutAmount?: number;
    status?: string;
  }
): MoneyXrayTree {
  const rows = ledger.filter((r) => r.orderId === orderId);
  const customerInflow = rows.find((r) => r.entryType === "CUSTOMER_INFLOW" || r.entryType === "VAULT_TOPUP");
  const vendorPayout = rows.find((r) => r.entryType === "VENDOR_PAYOUT");
  const driverPayout = rows.find((r) => r.entryType === "DRIVER_PAYOUT");

  const collectionAccount =
    companyAccounts.find((a) => (a.role === "COLLECTION" || a.role === "ESCROW_NODAL") && a.isPrimary) ||
    companyAccounts.find((a) => a.role === "COLLECTION" || a.role === "ESCROW_NODAL") ||
    companyAccounts[0];
  const payoutAccount =
    companyAccounts.find((a) => a.role === "PAYOUT" && a.isPrimary) ||
    companyAccounts.find((a) => a.role === "PAYOUT") ||
    collectionAccount;

  const grossAmount = customerInflow?.grossAmount || fallbackEscrow?.dealerPayoutAmount || 0;
  const govtTaxAmount =
    customerInflow?.taxAmount || Math.round(grossAmount * 0.14);
  const cononProfitAmount =
    customerInflow?.platformMargin || Math.round(grossAmount * 0.08);
  const vendorShareAmount =
    vendorPayout?.netAmount ||
    fallbackEscrow?.dealerPayoutAmount ||
    Math.max(0, grossAmount - govtTaxAmount - cononProfitAmount);
  const driverShareAmount = driverPayout?.netAmount || 0;

  return {
    orderId,
    customerInflow,
    collectionAccount,
    payoutAccount,
    vendorPayout,
    driverPayout,
    grossAmount,
    govtTaxAmount,
    cononProfitAmount,
    vendorShareAmount,
    driverShareAmount,
  };
}

export async function downloadPaymentAdvicePdf(
  entry: TreasuryLedgerEntry,
  companyAccounts: CompanyBankAccount[] = []
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const payoutAcct =
    companyAccounts.find((a) => a.role === "PAYOUT" && a.isPrimary) || companyAccounts[0];

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CONON-NOW TREASURY PAYMENT ADVICE", 14, 15);
  doc.setTextColor(226, 232, 240);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("CONON INFRABUILT PVT. LTD. • Lucknow Escrow & Partner Settlement Advice", 14, 23);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`UTR / Bank Reference: ${entry.utrNumber}`, 14, 46);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const lines = [
    ["Order / Reference ID", entry.orderId],
    ["Settlement Type", entry.entryType],
    ["Date & Time", new Date(entry.createdAt).toLocaleString("en-IN")],
    ["From Account (CONON)", `${entry.fromAccountLabel} (${entry.fromAccountRef})`],
    ["CONON IFSC", payoutAcct?.ifscCode || "Configured in Treasury"],
    ["To Beneficiary", entry.beneficiaryName],
    ["To Bank / UPI", `${entry.toAccountLabel} (${entry.toAccountRef})`],
    ["Beneficiary IFSC", entry.toIfsc || "Verified UPI / IMPS"],
    ["Payment Mode", entry.paymentMode],
    ["Gross Order Value", `Rs. ${entry.grossAmount.toLocaleString("en-IN")}`],
    ["Platform Margin", `Rs. ${entry.platformMargin.toLocaleString("en-IN")}`],
    ["GST / TCS Tax-Jar", `Rs. ${entry.taxAmount.toLocaleString("en-IN")}`],
    ["Net Settled Amount", `Rs. ${entry.netAmount.toLocaleString("en-IN")}`],
    ["Status", entry.status],
  ];

  let y = 58;
  for (const [label, val] of lines) {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(val), 74, y);
    y += 9;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(14, y + 4, 196, y + 4);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "This is a system-generated CONON-NOW Treasury settlement advice for GST & Income Tax audit reconciliation.",
    14,
    y + 12
  );

  doc.save(`CONON_Payment_Advice_${entry.utrNumber}.pdf`);
}

export async function downloadBankPassbookPdf(
  ledger: TreasuryLedgerEntry[],
  companyAccounts: CompanyBankAccount[],
  liquidity: ThreeJarLiquidity
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const autoTableMod = await import("jspdf-autotable");
  const autoTable = autoTableMod.default;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 26, "F");
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("CONON INFRABUILT PVT. LTD. — BANK PASSBOOK & UTR RECONCILIATION", 14, 12);
  doc.setTextColor(226, 232, 240);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated: ${new Date().toLocaleString("en-IN")} | Inflow: Rs.${liquidity.customerInflow.toLocaleString("en-IN")} | Locked Escrow: Rs.${liquidity.lockedPartnerEscrow.toLocaleString("en-IN")} | Govt Tax-Jar: Rs.${liquidity.govtTaxJar.toLocaleString("en-IN")} | Net Profit: Rs.${liquidity.cononNetProfit.toLocaleString("en-IN")}`,
    14,
    20
  );

  autoTable(doc, {
    startY: 32,
    head: [["Date/Time", "Order/Ref", "Type", "Dir", "From A/c", "To A/c (IFSC)", "Mode", "12-Digit UTR", "Net (Rs.)", "Status"]],
    body: ledger.map((r) => [
      new Date(r.createdAt).toLocaleString("en-IN"),
      r.orderId,
      r.entryType,
      r.direction,
      `${r.fromAccountLabel} (${r.fromAccountRef})`,
      `${r.toAccountLabel} (${r.toAccountRef}${r.toIfsc ? ` • ${r.toIfsc}` : ""})`,
      r.paymentMode,
      r.utrNumber,
      r.netAmount.toLocaleString("en-IN"),
      r.status,
    ]),
    styles: { fontSize: 7.5 },
    headStyles: { fillColor: [15, 23, 42], textColor: [251, 191, 36] },
  });

  if (companyAccounts.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 8 : 160;
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Configured Accounts: ${companyAccounts
        .map((a) => `${a.label} (${a.bankName} ${a.accountNumberMasked} • ${a.ifscCode})`)
        .join(" | ")}`,
      14,
      Math.min(finalY, 198)
    );
  }

  doc.save(`CONON_Bank_Passbook_UTR_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function downloadBankPassbookCsv(ledger: TreasuryLedgerEntry[]): void {
  const headers = [
    "Date",
    "Order ID",
    "Entry Type",
    "Direction",
    "From Account",
    "From Ref",
    "To Account",
    "To Ref",
    "To IFSC",
    "Beneficiary",
    "Payment Mode",
    "UTR Number",
    "Gross Amount",
    "Platform Margin",
    "Tax Amount",
    "Net Amount",
    "Status",
  ];
  const rows = ledger.map((r) =>
    [
      new Date(r.createdAt).toISOString(),
      r.orderId,
      r.entryType,
      r.direction,
      r.fromAccountLabel,
      r.fromAccountRef,
      r.toAccountLabel,
      r.toAccountRef,
      r.toIfsc || "",
      r.beneficiaryName,
      r.paymentMode,
      r.utrNumber,
      r.grossAmount,
      r.platformMargin,
      r.taxAmount,
      r.netAmount,
      r.status,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CONON_Bank_Passbook_UTR_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

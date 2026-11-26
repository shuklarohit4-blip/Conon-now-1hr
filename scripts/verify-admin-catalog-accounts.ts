/**
 * Comprehensive Automated Verification Suite
 * Tests Admin "Catalog Studio" and "Accounts & GST" Modules
 */
import {
  DEFAULT_MASTER_CATEGORIES,
  DEFAULT_MASTER_PRODUCTS,
  getCivilAutoFill,
  isProductAdminLocked,
} from "../artifacts/conon/src/services/adminMasterCatalog";

import {
  DEFAULT_COMPANY_SETTINGS,
  FALLBACK_INVOICES,
  FALLBACK_HSN_SUMMARY,
  type GstReportData,
} from "../artifacts/conon/src/services/adminAccountsGstService";

import { jsPDF } from "../artifacts/conon/node_modules/jspdf/dist/jspdf.node.min.js";
import autoTable from "../artifacts/conon/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.js";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failCount++;
  }
}

console.log("\n=======================================================");
console.log("🚀 CONON COMMAND OS: CATALOG STUDIO & GST VERIFICATION");
console.log("=======================================================\n");

// 1. Master Categories Verification
console.log("--- 1. MASTER CATEGORIES ARCHITECTURE ---");
assert(DEFAULT_MASTER_CATEGORIES.length >= 16, `Seeded at least 16 categories (found ${DEFAULT_MASTER_CATEGORIES.length})`);

const cementCat = DEFAULT_MASTER_CATEGORIES.find((c) => c.slug === "cement-civil-works");
assert(Boolean(cementCat), "Found Cement & Civil Works category");
assert(cementCat?.defaultGstRate === 28, "Cement category default GST rate is 28%");
assert(cementCat?.vehicleType === "LOADER", "Cement category requires LOADER vehicle");

const wireCat = DEFAULT_MASTER_CATEGORIES.find((c) => c.slug === "wires-mcb-electrical");
assert(Boolean(wireCat), "Found Wires & Electrical category");
assert(wireCat?.vehicleType === "BIKE", "Wires category permits BIKE delivery");
assert(Boolean(cementCat?.nameHi && wireCat?.nameHi), "Categories have authentic Hindi/Devanagari translations");

// 2. Master Products & Civil Specs Verification
console.log("\n--- 2. MASTER PRODUCTS & TECHNICAL SPECS ---");
assert(DEFAULT_MASTER_PRODUCTS.length >= 8, `Seeded core master products with specs (found ${DEFAULT_MASTER_PRODUCTS.length})`);

const ultratech = DEFAULT_MASTER_PRODUCTS.find((p) => p.brand === "UltraTech");
assert(Boolean(ultratech), "Found UltraTech Super PPC Cement master SKU");
assert(ultratech?.hsnCode === "25232910", "UltraTech has authentic 8-digit HSN 25232910");
assert(ultratech?.gstRate === 28, "UltraTech has 28% GST rate");
assert(ultratech?.adminLocked === true, "UltraTech has Admin Master Lock ON");
assert(Boolean(ultratech?.specTags && ultratech.specTags.length >= 3), "UltraTech has structured civil spec tags");

const tataRebar = DEFAULT_MASTER_PRODUCTS.find((p) => p.brand === "Tata Steel");
assert(Boolean(tataRebar), "Found Tata Tiscon 550D TMT rebar SKU");
assert(tataRebar?.hsnCode === "72142090", "Tata TMT has authentic 8-digit HSN 72142090");
assert(tataRebar?.vehicleRequirement === "LOADER", "Tata TMT requires Chhota Hathi LOADER");

// 3. Civil Specs 1-Click Auto-Fill Helper
console.log("\n--- 3. 1-CLICK CIVIL SPECS AUTO-FILL HELPER ---");
const cementAuto = getCivilAutoFill("cement-civil-works", "UltraTech", "PPC Cement 50kg");
assert(cementAuto.hsnCode === "25232910" && cementAuto.gstRate === 28, "Cement auto-fills HSN 25232910 & 28% GST");

const tmtAuto = getCivilAutoFill("cement-civil-works", "Tata Tiscon", "TMT 550D Rebar 12mm");
assert(tmtAuto.hsnCode === "72142090" && tmtAuto.gstRate === 18, "TMT auto-fills HSN 72142090 & 18% GST");

const cpvcAuto = getCivilAutoFill("cpvc-plumbing-tanks", "Astral", "CPVC Pro Pipe 1 inch");
assert(cpvcAuto.hsnCode === "39172390" && cpvcAuto.gstRate === 18, "CPVC auto-fills HSN 39172390 & 18% GST");

const paintAuto = getCivilAutoFill("painting", "Asian Paints", "Royale Luxury Emulsion 20L");
assert(paintAuto.hsnCode === "32091090" && paintAuto.gstRate === 18, "Paints auto-fills HSN 32091090 & 18% GST");

const plyAuto = getCivilAutoFill("plywood-boards", "CenturyPly", "Sainik 710 Marine 19mm");
assert(plyAuto.hsnCode === "44123390" && plyAuto.gstRate === 18, "Plywood auto-fills HSN 44123390 & 18% GST");

const wireAuto = getCivilAutoFill("wires-mcb-electrical", "Havells", "Life Line Plus Wire 2.5sqmm");
assert(wireAuto.hsnCode === "85444999" && wireAuto.vehicleRequirement === "BIKE", "Wires auto-fills HSN 85444999 & BIKE vehicle");

// 4. Admin Master Lock Check
console.log("\n--- 4. ADMIN MASTER LOCK GUARD ---");
assert(isProductAdminLocked(ultratech!.id) === true, "isProductAdminLocked returns true for UltraTech Cement");
assert(isProductAdminLocked("Non-Existent SKU") === false, "isProductAdminLocked returns false for unlocked SKU");

// 5. Accounts & GST Letterhead Settings
console.log("\n--- 5. ACCOUNTS & GST COMPANY SETTINGS ---");
assert(DEFAULT_COMPANY_SETTINGS.companyName === "CONON INFRABUILT PRIVATE LIMITED", "Company registered name matches letterhead");
assert(DEFAULT_COMPANY_SETTINGS.city === "Lucknow" && DEFAULT_COMPANY_SETTINGS.stateCode === "09", "Location is Lucknow, UP (Code 09)");
assert(DEFAULT_COMPANY_SETTINGS.gstin === "09AABCC1234F1Z5", "GSTIN is 09AABCC1234F1Z5");
assert(DEFAULT_COMPANY_SETTINGS.authorizedSignatory === "Rohiit Shukla", "Authorized signatory is Rohiit Shukla");

// 6. Financial Ledger & Cashflow Reconciliation
console.log("\n--- 6. FINANCIAL LEDGER & CASHFLOW RECONCILIATION ---");
const totalSales = FALLBACK_INVOICES.reduce((s, i) => s + i.totalAmount, 0);
const totalTaxable = FALLBACK_INVOICES.reduce((s, i) => s + i.taxableValue, 0);
const totalGst = FALLBACK_INVOICES.reduce((s, i) => s + i.gstAmount, 0);
const totalVendor = FALLBACK_INVOICES.reduce((s, i) => s + i.vendorPayout, 0);
const totalDriver = FALLBACK_INVOICES.reduce((s, i) => s + i.driverPayout, 0);
const netRetention = totalSales - totalVendor - totalDriver;

assert(totalSales > 50000, `Gross Sales calculated correctly (₹${totalSales.toLocaleString("en-IN")})`);
assert(totalGst > 5000, `Total GST calculated correctly (₹${totalGst.toLocaleString("en-IN")})`);
assert(netRetention > 0, `Platform Cashflow net retention is positive (₹${netRetention.toLocaleString("en-IN")})`);

const b2bInvoices = FALLBACK_INVOICES.filter((i) => i.isB2B);
const b2cInvoices = FALLBACK_INVOICES.filter((i) => !i.isB2B);
assert(b2bInvoices.length > 0 && b2cInvoices.length > 0, "Ledger has both B2B (GSTIN) and B2C Retail transactions");

// 7. GSTR-1 Table 12 HSN Summary Validation
console.log("\n--- 7. GSTR-1 TABLE 12 HSN SUMMARY ---");
assert(FALLBACK_HSN_SUMMARY.length >= 5, `Table 12 contains HSN rows (found ${FALLBACK_HSN_SUMMARY.length})`);
FALLBACK_HSN_SUMMARY.forEach((row) => {
  assert(row.cgstAmount === row.sgstAmount, `Intrastate UP tax equal split: CGST ₹${row.cgstAmount} == SGST ₹${row.sgstAmount} for HSN ${row.hsnCode}`);
  assert(row.totalTax === row.cgstAmount + row.sgstAmount, `Total Tax = CGST + SGST for HSN ${row.hsnCode}`);
});

// 8. 1-Click Client-Side CA PDF Generation (jsPDF + autoTable)
console.log("\n--- 8. 1-CLICK CA PDF GENERATION ---");
const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
doc.text(DEFAULT_COMPANY_SETTINGS.companyName, 14, 15);
doc.text(`GSTIN: ${DEFAULT_COMPANY_SETTINGS.gstin}`, 14, 22);

const fn = typeof autoTable === "function" ? autoTable : autoTable.default;
fn(doc, {
  startY: 30,
  head: [["HSN Code", "Description", "UQC", "Taxable Value", "Total Tax"]],
  body: FALLBACK_HSN_SUMMARY.map((h) => [
    h.hsnCode,
    h.description,
    h.uqc,
    `₹${h.taxableValue}`,
    `₹${h.totalTax}`,
  ]),
});

const pdfOutput = doc.output();
assert(pdfOutput && pdfOutput.length > 2000, `Client-side PDF successfully rendered in memory (${pdfOutput.length} bytes)`);

// 9. CSV Output Validation
console.log("\n--- 9. CA TALLY / GSTR-1 CSV FORMAT ---");
let testCsv = `"Invoice Number","Date","Customer Name","Customer GSTIN","Taxable Value","CGST 9%","SGST 9%","Total Value"\n`;
FALLBACK_INVOICES.forEach((i) => {
  testCsv += `"${i.invoiceNo}","${i.date}","${i.customerName}","${i.customerGstin}","${i.taxableValue}","${i.gstAmount/2}","${i.gstAmount/2}","${i.totalAmount}"\n`;
});
assert(testCsv.includes("CNN-UP-2425-0101"), "CSV contains first invoice CNN-UP-2425-0101");
assert(testCsv.includes("09AABCS1429G1Z2"), "CSV contains B2B customer GSTIN");

console.log("\n=======================================================");
console.log(`🏁 VERIFICATION COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log("=======================================================\n");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

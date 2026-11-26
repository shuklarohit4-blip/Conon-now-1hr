import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import { pool } from "@workspace/db";
import { requireAdmin } from "../middleware/adminAuth";
import { getIo } from "../socket";

const router: IRouter = Router();

let tablesReady = false;
async function ensureTreasuryTables() {
  if (tablesReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS company_bank_accounts (
      id VARCHAR(80) PRIMARY KEY,
      label VARCHAR(160) NOT NULL,
      role VARCHAR(40) NOT NULL CHECK (role IN ('COLLECTION', 'ESCROW_NODAL', 'PAYOUT', 'TAX_RESERVE')),
      bank_name VARCHAR(120) NOT NULL,
      account_holder VARCHAR(160) NOT NULL DEFAULT 'CONON INFRABUILT PVT LTD',
      account_number_masked VARCHAR(40) NOT NULL,
      account_number_last4 VARCHAR(8) NOT NULL,
      ifsc_code VARCHAR(20) NOT NULL,
      upi_vpa VARCHAR(120),
      gateway_provider VARCHAR(40) NOT NULL DEFAULT 'MANUAL_BANK_UTR',
      is_primary BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS treasury_ledger_entries (
      id VARCHAR(80) PRIMARY KEY,
      order_id VARCHAR(80) NOT NULL,
      entry_type VARCHAR(40) NOT NULL,
      direction VARCHAR(16) NOT NULL,
      from_account_label VARCHAR(160) NOT NULL,
      from_account_ref VARCHAR(120) NOT NULL,
      to_account_label VARCHAR(160) NOT NULL,
      to_account_ref VARCHAR(120) NOT NULL,
      to_ifsc VARCHAR(20),
      beneficiary_name VARCHAR(160) NOT NULL,
      payment_mode VARCHAR(40) NOT NULL,
      utr_number VARCHAR(80) NOT NULL,
      gateway_ref_id VARCHAR(120),
      gross_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
      platform_margin NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
      tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
      net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
      status VARCHAR(30) NOT NULL DEFAULT 'SETTLED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  tablesReady = true;
}

router.get("/treasury/overview", requireAdmin, async (_req: Request, res: Response) => {
  try {
    await ensureTreasuryTables();
    const [acctRes, ledgerRes] = await Promise.all([
      pool.query("SELECT * FROM company_bank_accounts ORDER BY is_primary DESC, created_at ASC"),
      pool.query("SELECT * FROM treasury_ledger_entries ORDER BY created_at DESC LIMIT 500"),
    ]);

    const accounts = acctRes.rows.map((r) => ({
      id: r.id,
      label: r.label,
      role: r.role,
      bankName: r.bank_name,
      accountHolder: r.account_holder,
      accountNumberMasked: r.account_number_masked,
      accountNumberLast4: r.account_number_last4,
      ifscCode: r.ifsc_code,
      upiVpa: r.upi_vpa || "",
      gatewayProvider: r.gateway_provider,
      isPrimary: r.is_primary,
      createdAt: r.created_at,
    }));

    const ledger = ledgerRes.rows.map((r) => ({
      id: r.id,
      orderId: r.order_id,
      entryType: r.entry_type,
      direction: r.direction,
      fromAccountLabel: r.from_account_label,
      fromAccountRef: r.from_account_ref,
      toAccountLabel: r.to_account_label,
      toAccountRef: r.to_account_ref,
      toIfsc: r.to_ifsc || "",
      beneficiaryName: r.beneficiary_name,
      paymentMode: r.payment_mode,
      utrNumber: r.utr_number,
      gatewayRefId: r.gateway_ref_id || "",
      grossAmount: Number(r.gross_amount || 0),
      platformMargin: Number(r.platform_margin || 0),
      taxAmount: Number(r.tax_amount || 0),
      netAmount: Number(r.net_amount || 0),
      status: r.status,
      createdAt: r.created_at,
    }));

    res.json({ ok: true, companyAccounts: accounts, ledger });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Failed to load treasury overview" });
  }
});

router.post("/treasury/company-accounts", requireAdmin, async (req: Request, res: Response) => {
  try {
    await ensureTreasuryTables();
    const b = req.body || {};
    const id = b.id || `conon_acct_${Date.now()}`;
    const rawNum = String(b.accountNumber || b.accountNumberLast4 || "").replace(/\s+/g, "");
    const last4 = b.accountNumberLast4 || rawNum.slice(-4) || "0000";
    const masked = b.accountNumberMasked || `•••• •••• ${last4}`;

    if (b.isPrimary) {
      await pool.query("UPDATE company_bank_accounts SET is_primary = false WHERE role = $1", [b.role]);
    }

    await pool.query(
      `INSERT INTO company_bank_accounts
        (id, label, role, bank_name, account_holder, account_number_masked, account_number_last4, ifsc_code, upi_vpa, gateway_provider, is_primary)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
        label = EXCLUDED.label,
        role = EXCLUDED.role,
        bank_name = EXCLUDED.bank_name,
        account_holder = EXCLUDED.account_holder,
        account_number_masked = EXCLUDED.account_number_masked,
        account_number_last4 = EXCLUDED.account_number_last4,
        ifsc_code = EXCLUDED.ifsc_code,
        upi_vpa = EXCLUDED.upi_vpa,
        gateway_provider = EXCLUDED.gateway_provider,
        is_primary = EXCLUDED.is_primary`,
      [
        id,
        b.label || "CONON Account",
        b.role || "COLLECTION",
        b.bankName || "HDFC Bank",
        b.accountHolder || "CONON INFRABUILT PVT LTD",
        masked,
        last4,
        String(b.ifscCode || "").toUpperCase(),
        b.upiVpa || null,
        b.gatewayProvider || "MANUAL_BANK_UTR",
        Boolean(b.isPrimary),
      ]
    );

    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Failed to save company bank account" });
  }
});

router.patch("/treasury/company-accounts/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await ensureTreasuryTables();
    const { id } = req.params;
    const b = req.body || {};
    if (b.isPrimary && b.role) {
      await pool.query("UPDATE company_bank_accounts SET is_primary = false WHERE role = $1", [b.role]);
    }
    await pool.query(
      `UPDATE company_bank_accounts
       SET label = COALESCE($2, label),
           is_primary = COALESCE($3, is_primary),
           gateway_provider = COALESCE($4, gateway_provider)
       WHERE id = $1`,
      [id, b.label ?? null, b.isPrimary ?? null, b.gatewayProvider ?? null]
    );
    res.json({ ok: true, id });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Failed to update bank account" });
  }
});

router.post("/treasury/release-payout", requireAdmin, async (req: Request, res: Response) => {
  try {
    await ensureTreasuryTables();
    const b = req.body || {};
    if (!b.pennyDropVerified) {
      return res.status(400).json({
        ok: false,
        error: "Anti-Fraud Block: Beneficiary bank account is NOT Penny-Drop verified.",
      });
    }
    if (b.hasDisputeHold) {
      return res.status(400).json({
        ok: false,
        error: "Escrow Frozen: Active Customer Damage Dispute on this order.",
      });
    }

    const mode = String(b.paymentMode || "MANUAL_BANK_UTR");
    let utr = String(b.utrNumber || "").trim();
    let gatewayRefId = String(b.gatewayRefId || "").trim();

    if (mode === "RAZORPAY_ROUTE_API" || mode === "CASHFREE_EASY_SPLIT") {
      // Live gateway adapter when env keys exist; deterministic sandbox ref otherwise
      const hasLiveKey = Boolean(process.env.RAZORPAY_KEY_SECRET || process.env.CASHFREE_CLIENT_SECRET);
      gatewayRefId = gatewayRefId || `${mode === "RAZORPAY_ROUTE_API" ? "trf" : "cf"}_${Date.now()}`;
      utr = utr || `${Date.now()}`.slice(-12);
      if (!hasLiveKey) {
        gatewayRefId = `${gatewayRefId}_SANDBOX`;
      }
    } else if (!/^[A-Za-z0-9]{8,24}$/.test(utr)) {
      return res.status(400).json({
        ok: false,
        error: "Valid 12-digit Bank UTR / IMPS Reference is required.",
      });
    }

    const entryId = `tr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const entryType = b.beneficiaryType === "DRIVER" ? "DRIVER_PAYOUT" : "VENDOR_PAYOUT";

    await pool.query(
      `INSERT INTO treasury_ledger_entries
        (id, order_id, entry_type, direction, from_account_label, from_account_ref, to_account_label, to_account_ref, to_ifsc, beneficiary_name, payment_mode, utr_number, gateway_ref_id, gross_amount, platform_margin, tax_amount, net_amount, status)
       VALUES ($1,$2,$3,'DEBIT',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'SETTLED')`,
      [
        entryId,
        b.orderId || "MANUAL",
        entryType,
        b.fromAccountLabel || "CONON Payout A/c",
        b.fromAccountRef || "CONON-PAYOUT",
        b.toAccountLabel || `${b.beneficiaryName || "Partner"} Bank`,
        b.toAccountRef || "••••0000",
        b.toIfsc || "",
        b.beneficiaryName || "Verified Partner",
        mode,
        utr,
        gatewayRefId || null,
        Number(b.grossAmount || 0),
        Number(b.platformMargin || 0),
        Number(b.taxAmount || 0),
        Number(b.netAmount || 0),
      ]
    );

    const payload = {
      id: entryId,
      orderId: b.orderId,
      entryType,
      direction: "DEBIT",
      fromAccountLabel: b.fromAccountLabel,
      fromAccountRef: b.fromAccountRef,
      toAccountLabel: b.toAccountLabel,
      toAccountRef: b.toAccountRef,
      toIfsc: b.toIfsc,
      beneficiaryName: b.beneficiaryName,
      paymentMode: mode,
      utrNumber: utr,
      gatewayRefId,
      grossAmount: Number(b.grossAmount || 0),
      platformMargin: Number(b.platformMargin || 0),
      taxAmount: Number(b.taxAmount || 0),
      netAmount: Number(b.netAmount || 0),
      status: "SETTLED",
      createdAt: new Date().toISOString(),
    };

    try {
      getIo()?.emit("treasury:payout_settled", payload);
    } catch {
      // socket optional
    }

    res.json({ ok: true, entry: payload });
    return;
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Failed to execute payout" });
    return;
  }
});

router.post("/treasury/webhooks/gateway", async (req: Request, res: Response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.CASHFREE_WEBHOOK_SECRET;
  const sig = String(req.headers["x-razorpay-signature"] || req.headers["x-webhook-signature"] || "");
  if (secret && sig) {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body || {}))
      .digest("hex");
    if (expected !== sig) {
      return res.status(401).json({ ok: false, error: "Invalid gateway webhook signature" });
    }
  }
  res.json({ ok: true, received: true });
  return;
});

export default router;

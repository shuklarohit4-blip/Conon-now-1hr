import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "../middleware/adminAuth";
import { getIo } from "../socket";

const router: IRouter = Router();

let complianceTablesReady = false;
async function ensureComplianceTables() {
  if (complianceTablesReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS partner_compliance_records (
      partner_id VARCHAR(80) PRIMARY KEY,
      compliance_status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
      suspension_reason TEXT,
      physically_inspected BOOLEAN NOT NULL DEFAULT false,
      inspection_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      expiry_dates JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS partner_blacklist (
      id VARCHAR(80) PRIMARY KEY,
      phone VARCHAR(30),
      pan VARCHAR(30),
      gstin VARCHAR(30),
      vehicle_no VARCHAR(40),
      reason TEXT NOT NULL,
      blacklisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS compliance_audit_log (
      id VARCHAR(80) PRIMARY KEY,
      partner_id VARCHAR(80) NOT NULL,
      partner_type VARCHAR(40) NOT NULL,
      action VARCHAR(40) NOT NULL,
      reason TEXT NOT NULL,
      actor VARCHAR(120) NOT NULL DEFAULT 'CONON HQ',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  complianceTablesReady = true;
}

async function logComplianceAudit(
  partnerId: string,
  partnerType: string,
  action: string,
  reason: string,
  actor = "CONON HQ"
) {
  await pool.query(
    `INSERT INTO compliance_audit_log (id, partner_id, partner_type, action, reason, actor)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [`aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, partnerId, partnerType, action, reason, actor]
  );
}

export async function isBlacklistedInDb(candidate: {
  phone?: string;
  pan?: string;
  gstin?: string;
  vehicleNo?: string;
}): Promise<{ blocked: boolean; reason?: string }> {
  try {
    await ensureComplianceTables();
    const cleanPhone = (candidate.phone || "").replace(/\D/g, "").slice(-10);
    const cleanPan = (candidate.pan || "").trim().toUpperCase();
    const cleanGstin = (candidate.gstin || "").trim().toUpperCase();
    const cleanVeh = (candidate.vehicleNo || "").replace(/\s+/g, "").toUpperCase();

    const res = await pool.query(
      `SELECT reason FROM partner_blacklist
       WHERE ($1 <> '' AND RIGHT(REGEXP_REPLACE(COALESCE(phone,''), '\\D', '', 'g'), 10) = $1)
          OR ($2 <> '' AND UPPER(COALESCE(pan,'')) = $2)
          OR ($3 <> '' AND UPPER(COALESCE(gstin,'')) = $3)
          OR ($4 <> '' AND UPPER(REPLACE(COALESCE(vehicle_no,''), ' ', '')) = $4)
       LIMIT 1`,
      [cleanPhone, cleanPan, cleanGstin, cleanVeh]
    );
    if (res.rows.length > 0) {
      return { blocked: true, reason: res.rows[0].reason };
    }
    return { blocked: false };
  } catch {
    return { blocked: false };
  }
}

router.post("/admin/compliance/:partnerId/suspend", requireAdmin, async (req: Request, res: Response) => {
  try {
    await ensureComplianceTables();
    const partnerId = String(req.params.partnerId);
    const { reason, partnerType = "VENDOR" } = req.body || {};
    await pool.query(
      `INSERT INTO partner_compliance_records (partner_id, compliance_status, suspension_reason, updated_at)
       VALUES ($1, 'SUSPENDED', $2, NOW())
       ON CONFLICT (partner_id) DO UPDATE SET
         compliance_status = 'SUSPENDED',
         suspension_reason = EXCLUDED.suspension_reason,
         updated_at = NOW()`,
      [partnerId, reason || "Temporarily suspended by CONON HQ"]
    );
    await logComplianceAudit(partnerId, partnerType, "SUSPENDED", reason || "Suspended by Admin");
    getIo()?.emit("compliance:updated", { partnerId, status: "SUSPENDED", reason });
    res.json({ ok: true, partnerId, status: "SUSPENDED" });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Suspend failed" });
  }
});

router.post("/admin/compliance/:partnerId/blacklist", requireAdmin, async (req: Request, res: Response) => {
  try {
    await ensureComplianceTables();
    const partnerId = String(req.params.partnerId);
    const { phone, pan, gstin, vehicleNo, reason, partnerType = "VENDOR" } = req.body || {};
    await pool.query(
      `INSERT INTO partner_compliance_records (partner_id, compliance_status, suspension_reason, updated_at)
       VALUES ($1, 'BLACKLISTED', $2, NOW())
       ON CONFLICT (partner_id) DO UPDATE SET
         compliance_status = 'BLACKLISTED',
         suspension_reason = EXCLUDED.suspension_reason,
         updated_at = NOW()`,
      [partnerId, reason || "Permanently blacklisted under CONON Safety Policy"]
    );
    await pool.query(
      `INSERT INTO partner_blacklist (id, phone, pan, gstin, vehicle_no, reason)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        `blk_${Date.now()}`,
        phone || null,
        pan || null,
        gstin || null,
        vehicleNo || null,
        reason || "Permanently restricted under CONON Safety Policy",
      ]
    );
    await logComplianceAudit(partnerId, partnerType, "BLACKLISTED", reason || "Blacklisted");
    getIo()?.emit("compliance:updated", { partnerId, status: "BLACKLISTED", reason });
    res.json({ ok: true, partnerId, status: "BLACKLISTED" });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Blacklist failed" });
  }
});

router.post("/admin/compliance/:partnerId/reinstate", requireAdmin, async (req: Request, res: Response) => {
  try {
    await ensureComplianceTables();
    const partnerId = String(req.params.partnerId);
    const { partnerType = "VENDOR", reason = "Reinstated by CONON HQ" } = req.body || {};
    await pool.query(
      `INSERT INTO partner_compliance_records (partner_id, compliance_status, suspension_reason, updated_at)
       VALUES ($1, 'APPROVED', NULL, NOW())
       ON CONFLICT (partner_id) DO UPDATE SET
         compliance_status = 'APPROVED',
         suspension_reason = NULL,
         updated_at = NOW()`,
      [partnerId]
    );
    await logComplianceAudit(partnerId, partnerType, "REINSTATED", reason);
    getIo()?.emit("compliance:updated", { partnerId, status: "APPROVED" });
    res.json({ ok: true, partnerId, status: "APPROVED" });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Reinstate failed" });
  }
});

router.post("/admin/compliance/:partnerId/physical-inspection", requireAdmin, async (req: Request, res: Response) => {
  try {
    await ensureComplianceTables();
    const partnerId = String(req.params.partnerId);
    const { inspectorName, inspectedAt, notes, checklist, photoUrl, partnerType = "VENDOR" } = req.body || {};
    const meta = {
      inspectorName: inspectorName || "Rohiit Shukla / CONON Field Audit",
      inspectedAt: inspectedAt || new Date().toISOString().slice(0, 10),
      notes: notes || "",
      checklist: checklist || {},
      photoUrl: photoUrl || "",
    };
    await pool.query(
      `INSERT INTO partner_compliance_records (partner_id, physically_inspected, inspection_meta, updated_at)
       VALUES ($1, true, $2, NOW())
       ON CONFLICT (partner_id) DO UPDATE SET
         physically_inspected = true,
         inspection_meta = EXCLUDED.inspection_meta,
         updated_at = NOW()`,
      [partnerId, JSON.stringify(meta)]
    );
    await logComplianceAudit(partnerId, partnerType, "FIELD_INSPECTED", `Physically inspected by ${meta.inspectorName}`);
    getIo()?.emit("compliance:updated", { partnerId, physicallyInspected: true });
    res.json({ ok: true, partnerId, physicallyInspected: true, inspectionMeta: meta });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Inspection stamp failed" });
  }
});

router.post("/kyc/partner/upload-renewal", async (req: Request, res: Response) => {
  try {
    await ensureComplianceTables();
    const { partnerId, docType, newExpiryDate, partnerType = "DRIVER" } = req.body || {};
    if (!partnerId || !docType || !newExpiryDate) {
      res.status(400).json({ ok: false, error: "partnerId, docType, and newExpiryDate are required" });
      return;
    }
    await pool.query(
      `INSERT INTO partner_compliance_records (partner_id, expiry_dates, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (partner_id) DO UPDATE SET
         expiry_dates = COALESCE(partner_compliance_records.expiry_dates, '{}'::jsonb) || $2::jsonb,
         updated_at = NOW()`,
      [partnerId, JSON.stringify({ [docType]: newExpiryDate })]
    );
    await logComplianceAudit(partnerId, partnerType, "RENEWAL_APPROVED", `Submitted renewed ${docType} (${newExpiryDate})`);
    res.json({ ok: true, partnerId, docType, newExpiryDate });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Renewal upload failed" });
  }
});

export default router;

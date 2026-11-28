import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "../middleware/adminAuth";
import { getIo } from "../socket";

const router: IRouter = Router();

interface TurnkeyConsultation {
  id: string;
  name: string;
  phone: string;
  locationPincode: string;
  plotSqFt: number;
  packageName: string;
  visitType: "ON_SITE_ENGINEER" | "HQ_OFFICE_MEET";
  preferredSlot: string;
  status: "NEW" | "SITE_VISITED" | "BOQ_SENT" | "SIGNED";
  createdAt: string;
}

const memoryConsultations: TurnkeyConsultation[] = [];
let tableReady = false;

async function ensureConsultationTable() {
  if (tableReady) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS turnkey_consultations (
        id VARCHAR(80) PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        location_pincode VARCHAR(80) NOT NULL,
        plot_sqft INT NOT NULL DEFAULT 1000,
        package_name VARCHAR(80) NOT NULL,
        visit_type VARCHAR(40) NOT NULL DEFAULT 'ON_SITE_ENGINEER',
        preferred_slot VARCHAR(80),
        status VARCHAR(30) NOT NULL DEFAULT 'NEW',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    tableReady = true;
  } catch {
    // Graceful fallback
  }
}

router.post("/build/consultations", async (req: Request, res: Response) => {
  await ensureConsultationTable();
  const b = req.body || {};
  const name = String(b.name || "").trim();
  const phone = String(b.phone || "").trim();
  if (!name || phone.replace(/\D/g, "").length < 10) {
    res.status(400).json({ ok: false, error: "Valid name and 10-digit phone are required." });
    return;
  }

  const entry: TurnkeyConsultation = {
    id: String(b.id || `TRN-${Date.now().toString(36).toUpperCase()}`),
    name,
    phone,
    locationPincode: String(b.locationPincode || "226030"),
    plotSqFt: Math.max(200, Number(b.plotSqFt || 1000)),
    packageName: String(b.packageName || "Gold"),
    visitType: b.visitType === "HQ_OFFICE_MEET" ? "HQ_OFFICE_MEET" : "ON_SITE_ENGINEER",
    preferredSlot: String(b.preferredSlot || "Tomorrow 11:00 AM"),
    status: "NEW",
    createdAt: new Date().toISOString(),
  };

  memoryConsultations.unshift(entry);
  try {
    await pool.query(
      `INSERT INTO turnkey_consultations
        (id, name, phone, location_pincode, plot_sqft, package_name, visit_type, preferred_slot, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      [
        entry.id,
        entry.name,
        entry.phone,
        entry.locationPincode,
        entry.plotSqFt,
        entry.packageName,
        entry.visitType,
        entry.preferredSlot,
        entry.status,
      ]
    );
  } catch {
    // non-fatal if DB offline
  }

  try {
    getIo()?.emit("build:new_consultation", entry);
  } catch {
    // optional
  }

  res.status(201).json({ ok: true, consultation: entry });
});

router.get("/admin/build/consultations", requireAdmin, async (_req: Request, res: Response) => {
  await ensureConsultationTable();
  try {
    const result = await pool.query(
      "SELECT id, name, phone, location_pincode, plot_sqft, package_name, visit_type, preferred_slot, status, created_at FROM turnkey_consultations ORDER BY created_at DESC LIMIT 100"
    );
    res.json({
      ok: true,
      consultations: result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        locationPincode: r.location_pincode,
        plotSqFt: Number(r.plot_sqft),
        packageName: r.package_name,
        visitType: r.visit_type,
        preferredSlot: r.preferred_slot,
        status: r.status,
        createdAt: r.created_at,
      })),
    });
    return;
  } catch {
    res.json({ ok: true, consultations: memoryConsultations });
  }
});

router.patch("/admin/build/consultations/:id", requireAdmin, async (req: Request, res: Response) => {
  await ensureConsultationTable();
  const status = String(req.body?.status || "SITE_VISITED");
  const idx = memoryConsultations.findIndex((c) => c.id === req.params.id);
  if (idx >= 0) memoryConsultations[idx].status = status as any;
  try {
    await pool.query("UPDATE turnkey_consultations SET status = $2 WHERE id = $1", [req.params.id, status]);
  } catch {
    // non-fatal
  }
  res.json({ ok: true, id: req.params.id, status });
});

export default router;

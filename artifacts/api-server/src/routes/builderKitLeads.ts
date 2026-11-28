import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { catalogEngine } from "../services/catalogEngine";
import { catalogSyncService } from "../services/catalogSyncService";
import { requireAdmin } from "../middleware/adminAuth";

export interface BuilderKitLead {
  id: string;
  name: string;
  phone: string;
  lucknowZone: string;
  builtUpSqFt: number;
  qualityTier: "STANDARD" | "PREMIUM" | "LUXURY";
  wallType: "RED_BRICK" | "AAC_BLOCK";
  floors: number;
  grandTotal: number;
  notes?: string;
  startDate?: string;
  status: "NEW" | "CONTACTED" | "QUOTE_SENT" | "CONVERTED";
  assignedEngineer: string;
  createdAt: string;
  updatedAt: string;
  boqSummary?: {
    grandTotal: number;
    costPerSqFt: number;
    stages: Array<{
      stageId: number;
      stageName: string;
      subtotal: number;
      itemCount: number;
    }>;
  };
}

const LEADS_FILE_PATH = path.resolve(process.cwd(), "artifacts/api-server/data/builder-kit-leads.json");

const SEED_LEADS: BuilderKitLead[] = [
  {
    id: "LEAD-LKO-9812",
    name: "Er. Ankit Srivastava",
    phone: "9839012345",
    lucknowZone: "Sushant Golf City",
    builtUpSqFt: 2400,
    qualityTier: "PREMIUM",
    wallType: "RED_BRICK",
    floors: 2,
    grandTotal: 2980000,
    notes: "Requires single batch dye-lot delivery for floor tiles, 43 Grade cement for plastering.",
    startDate: "Within 15 Days",
    status: "NEW",
    assignedEngineer: "Er. Rahul Verma (Central Lucknow)",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    boqSummary: {
      grandTotal: 2980000,
      costPerSqFt: 1242,
      stages: [
        { stageId: 1, stageName: "Foundation, RCC & Masonry", subtotal: 1050000, itemCount: 6 },
        { stageId: 2, stageName: "Concealed Plumbing & Electrical", subtotal: 420000, itemCount: 8 },
        { stageId: 3, stageName: "Plaster, Waterproofing & Flooring", subtotal: 510000, itemCount: 5 },
        { stageId: 4, stageName: "Doors, Woodwork & Modular Kitchen", subtotal: 440000, itemCount: 7 },
        { stageId: 5, stageName: "Putty, Primer & Painting", subtotal: 240000, itemCount: 4 },
        { stageId: 6, stageName: "Sanitary, Sinks, Appliances & CCTV", subtotal: 320000, itemCount: 7 },
      ],
    },
  },
  {
    id: "LEAD-LKO-9755",
    name: "Col. Rajeshwar Singh (Retd.)",
    phone: "9415098765",
    lucknowZone: "Gomti Nagar / Extension",
    builtUpSqFt: 3600,
    qualityTier: "LUXURY",
    wallType: "AAC_BLOCK",
    floors: 3,
    grandTotal: 6420000,
    notes: "Villa construction in Sector 4 Gomti Nagar Ext. Needs Astral Silencio and Kohler sanitary.",
    startDate: "Immediate (In 24h)",
    status: "CONTACTED",
    assignedEngineer: "Er. Abhishek Mishra (Gomti Nagar Hub)",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    boqSummary: {
      grandTotal: 6420000,
      costPerSqFt: 1783,
      stages: [
        { stageId: 1, stageName: "Foundation, RCC & Masonry", subtotal: 2150000, itemCount: 6 },
        { stageId: 2, stageName: "Concealed Plumbing & Electrical", subtotal: 940000, itemCount: 8 },
        { stageId: 3, stageName: "Plaster, Waterproofing & Flooring", subtotal: 1220000, itemCount: 5 },
        { stageId: 4, stageName: "Doors, Woodwork & Modular Kitchen", subtotal: 980000, itemCount: 7 },
        { stageId: 5, stageName: "Putty, Primer & Painting", subtotal: 480000, itemCount: 4 },
        { stageId: 6, stageName: "Sanitary, Sinks, Appliances & CCTV", subtotal: 650000, itemCount: 7 },
      ],
    },
  },
  {
    id: "LEAD-LKO-9610",
    name: "Vikas Agrawal (Contractor)",
    phone: "9918077889",
    lucknowZone: "Shaheed Path",
    builtUpSqFt: 1800,
    qualityTier: "STANDARD",
    wallType: "RED_BRICK",
    floors: 2,
    grandTotal: 1620000,
    notes: "Requires wholesale contractor credit terms and 50-bag cement scheduled drops.",
    startDate: "Next Month",
    status: "QUOTE_SENT",
    assignedEngineer: "Er. Sumit Pandey (Transport Nagar)",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    boqSummary: {
      grandTotal: 1620000,
      costPerSqFt: 900,
      stages: [
        { stageId: 1, stageName: "Foundation, RCC & Masonry", subtotal: 620000, itemCount: 6 },
        { stageId: 2, stageName: "Concealed Plumbing & Electrical", subtotal: 260000, itemCount: 8 },
        { stageId: 3, stageName: "Plaster, Waterproofing & Flooring", subtotal: 310000, itemCount: 5 },
        { stageId: 4, stageName: "Doors, Woodwork & Modular Kitchen", subtotal: 210000, itemCount: 7 },
        { stageId: 5, stageName: "Putty, Primer & Painting", subtotal: 110000, itemCount: 4 },
        { stageId: 6, stageName: "Sanitary, Sinks, Appliances & CCTV", subtotal: 110000, itemCount: 7 },
      ],
    },
  },
];

class BuilderKitLeadManager {
  private leads: BuilderKitLead[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(LEADS_FILE_PATH)) {
        const raw = fs.readFileSync(LEADS_FILE_PATH, "utf-8");
        this.leads = JSON.parse(raw);
      } else {
        this.leads = [...SEED_LEADS];
        this.save();
      }
    } catch {
      this.leads = [...SEED_LEADS];
    }
  }

  private save() {
    try {
      const dir = path.dirname(LEADS_FILE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(this.leads, null, 2), "utf-8");
    } catch {
      // Ignored
    }
  }

  public getAll(): BuilderKitLead[] {
    return [...this.leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getById(id: string): BuilderKitLead | undefined {
    return this.leads.find((l) => l.id === id);
  }

  public create(data: Omit<BuilderKitLead, "id" | "status" | "assignedEngineer" | "createdAt" | "updatedAt">): BuilderKitLead {
    const id = `LEAD-LKO-${Date.now().toString().slice(-4)}`;
    const engineers = [
      "Er. Rahul Verma (Central Lucknow)",
      "Er. Abhishek Mishra (Gomti Nagar Hub)",
      "Er. Sumit Pandey (Transport Nagar)",
      "Er. Neeraj Saxena (Alambagh Zone)",
    ];
    const assignedEngineer = engineers[Math.floor(Math.random() * engineers.length)];

    const newLead: BuilderKitLead = {
      ...data,
      id,
      status: "NEW",
      assignedEngineer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.leads.unshift(newLead);
    this.save();

    // Broadcast SSE to live Admin dashboards
    catalogEngine.broadcast("lead_created", {
      leadId: newLead.id,
      customerName: newLead.name,
      grandTotal: newLead.grandTotal,
      lucknowZone: newLead.lucknowZone,
      timestamp: newLead.createdAt,
    });

    return newLead;
  }

  public updateStatus(id: string, status: BuilderKitLead["status"], notes?: string): BuilderKitLead | null {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return null;

    lead.status = status;
    if (notes) lead.notes = notes;
    lead.updatedAt = new Date().toISOString();
    this.save();

    catalogEngine.broadcast("lead_updated", {
      leadId: lead.id,
      status: lead.status,
      timestamp: lead.updatedAt,
    });

    return lead;
  }

  public delete(id: string): boolean {
    const idx = this.leads.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    this.leads.splice(idx, 1);
    this.save();
    return true;
  }
}

export const leadManager = new BuilderKitLeadManager();

// ─────────────────────────────────────────────────────────────
// Express Routes
// ─────────────────────────────────────────────────────────────
const router: Router = Router();

const CreateLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "10-digit phone required"),
  lucknowZone: z.string().default("Sushant Golf City"),
  builtUpSqFt: z.number().positive(),
  qualityTier: z.enum(["STANDARD", "PREMIUM", "LUXURY"]),
  wallType: z.enum(["RED_BRICK", "AAC_BLOCK"]),
  floors: z.number().int().min(1),
  grandTotal: z.number().positive(),
  notes: z.string().optional(),
  startDate: z.string().optional(),
  boqSummary: z.any().optional(),
});

// Customer Public Endpoint: POST /api/builder-kit/leads
router.post("/builder-kit/leads", (req: Request, res: Response) => {
  try {
    const parsed = CreateLeadSchema.parse(req.body);
    const lead = leadManager.create(parsed);
    void catalogSyncService.recordLead({
      leadRefId: lead.id,
      leadType: ((req.body as any)?.leadType === "SOLAR_MVVNL" || (req.body as any)?.leadType === "PARCHA_BOQ"
        ? (req.body as any).leadType
        : "TURNKEY_SERVICE"),
      customerName: lead.name,
      phone: lead.phone,
      locality: lead.lucknowZone,
      payload: {
        builtUpSqFt: lead.builtUpSqFt,
        qualityTier: lead.qualityTier,
        wallType: lead.wallType,
        floors: lead.floors,
        grandTotal: lead.grandTotal,
        notes: lead.notes,
        startDate: lead.startDate,
      },
    });
    res.status(201).json({
      success: true,
      lead,
      message: "Lead created and assigned to Senior Project Engineer",
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err?.message || "Invalid lead data" });
  }
});

// Admin Endpoint: GET /api/admin/leads
router.use("/admin", requireAdmin);
router.get("/admin/leads", (_req: Request, res: Response) => {
  try {
    const leads = leadManager.getAll();
    const stats = {
      total: leads.length,
      newCount: leads.filter((l) => l.status === "NEW").length,
      contactedCount: leads.filter((l) => l.status === "CONTACTED").length,
      convertedCount: leads.filter((l) => l.status === "CONVERTED").length,
      totalPipelineValue: leads.reduce((s, l) => s + l.grandTotal, 0),
    };
    res.json({ success: true, leads, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Admin Endpoint: PATCH /api/admin/leads/:id
router.patch("/admin/leads/:id", (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, notes } = req.body;
    if (!["NEW", "CONTACTED", "QUOTE_SENT", "CONVERTED"].includes(status)) {
      res.status(400).json({ success: false, error: "Invalid status value" });
      return;
    }

    const updated = leadManager.updateStatus(id, status, notes);
    if (!updated) {
      res.status(404).json({ success: false, error: "Lead not found" });
      return;
    }

    res.json({ success: true, lead: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Admin Endpoint: DELETE /api/admin/leads/:id (for cleanup & tests)
router.delete("/admin/leads/:id", (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const deleted = leadManager.delete(id);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

export default router;

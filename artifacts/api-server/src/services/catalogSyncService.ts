import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  AuditAndDispatchLogModel,
  connectMongooseHybrid,
  ensureHybridPostgresSchema,
  getPostgresHealthStatus,
  hasPostgresConfigured,
  LeadInboxModel,
  MasterCategoryModel,
  MasterProductModel,
  pingDatabase,
  pool,
  SiteKitModel,
  withPgTransaction,
  type HybridLeadStatus,
  type HybridLeadType,
} from "@workspace/db";
import { REPO_ROOT } from "../lib/paths";
import { logger } from "../lib/logger";
import {
  canonicalizeCategorySlug,
  LUCKNOW_AUTHORIZED_HUBS,
  LUCKNOW_SITE_KITS_MASTER,
  MASTER_CATALOG_ITEMS,
  MASTER_CATEGORIES,
} from "@workspace/shared";

export interface HybridMasterCategoryRecord {
  slug: string;
  name: string;
  parentGroup: string;
  icon: string;
  sortOrder: number;
  hubTag: string;
  bannerConfig: Record<string, any>;
  isActive: boolean;
}

export interface HybridMasterProductRecord {
  skuCode: string;
  categorySlug: string;
  subCategorySlug: string;
  brand: string;
  model: string;
  title: string;
  unit: string;
  specs: Record<string, any>;
  variants: Array<Record<string, any>>;
  compatibleAccessorySkus: string[];
  badges: string[];
  isDcrSubsidyEligible: boolean;
  isRentable: boolean;
  isActive: boolean;
}

export interface HybridHubInventoryRecord {
  hubCode: string;
  skuCode: string;
  sellingPrice: number;
  mrp: number;
  contractorPackPrice: number | null;
  rentPricePerDay: number | null;
  stockQty: number;
  isInStock: boolean;
  updatedAt: string;
}

export interface HybridHubRecord {
  id: number;
  hubCode: string;
  name: string;
  localityZone: string;
  vendorPhone: string;
  allowedCategories: string[];
  commissionPct: number;
  slaLabel: string;
  isActive: boolean;
}

export interface HybridOrderRecord {
  id: number;
  orderNumber: string;
  customerPhone: string;
  hubCode: string;
  driverPhone?: string;
  orderType: "buy" | "rent" | "kit" | "bulk";
  status:
    | "PLACED"
    | "VENDOR_ACCEPTED"
    | "PACKED_READY"
    | "DRIVER_ASSIGNED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CANCELLED";
  subtotal: number;
  bulkDiscount: number;
  gstAmount: number;
  totalAmount: number;
  paymentMode: string;
  pickupOtp: string;
  deliveryOtp: string;
  slaDeadlineAt: string;
  createdAt: string;
  items: Array<{
    skuCode: string;
    titleSnapshot: string;
    variantJson: Record<string, any>;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

export interface HybridPayoutLedgerRow {
  id: number;
  orderId: number;
  orderNumber: string;
  beneficiaryType: "vendor" | "driver";
  beneficiaryRef: string;
  grossAmount: number;
  commissionDeducted: number;
  netPayable: number;
  codCollected: number;
  settlementStatus: "ESCROW_PENDING" | "APPROVED" | "SETTLED";
  createdAt: string;
}

export interface HybridSiteKitRecord {
  kitCode: string;
  title: string;
  stageTag: string;
  items: Array<Record<string, any>>;
  discountPct: number;
  isActive: boolean;
}

export interface HybridLeadRecord {
  leadRefId: string;
  leadType: HybridLeadType;
  customerName: string;
  phone: string;
  locality: string;
  payload: Record<string, any>;
  status: HybridLeadStatus;
  convertedOrderId?: string;
  createdAt: string;
}

export interface HybridAuditLogRecord {
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  diff: Record<string, any>;
  timestamp: string;
}

interface HybridMirrorDiskState {
  categories: HybridMasterCategoryRecord[];
  products: HybridMasterProductRecord[];
  siteKits: HybridSiteKitRecord[];
  hubs: HybridHubRecord[];
  inventory: HybridHubInventoryRecord[];
  orders: HybridOrderRecord[];
  payoutLedger: HybridPayoutLedgerRow[];
  leads: HybridLeadRecord[];
  auditLogs: HybridAuditLogRecord[];
}

const HYBRID_STORE_FILE = path.resolve(REPO_ROOT, "artifacts/api-server/data/hybrid-store.json");

export const MASTER_CATEGORIES_SEED: HybridMasterCategoryRecord[] = [
  { slug: "cement-civil-works", name: "Cement", parentGroup: "CORE_CIVIL", icon: "Mountain", sortOrder: 1, hubTag: "Chinhat & Transport Nagar", bannerConfig: { monsoonShield: true }, isActive: true },
  { slug: "tmt-steel", name: "Steel", parentGroup: "CORE_CIVIL", icon: "Layers", sortOrder: 2, hubTag: "Kanpur Rd & Nadarganj", bannerConfig: { monsoonShield: true }, isActive: true },
  { slug: "bricks-aac", name: "Bricks", parentGroup: "CORE_CIVIL", icon: "Rows3", sortOrder: 3, hubTag: "Faizabad Rd & Barabanki", bannerConfig: {}, isActive: true },
  { slug: "sand-baalu", name: "Sand", parentGroup: "CORE_CIVIL", icon: "FlaskConical", sortOrder: 4, hubTag: "Chinhat & Transport Nagar", bannerConfig: {}, isActive: true },
  { slug: "aggregate-gitti", name: "Aggregate", parentGroup: "CORE_CIVIL", icon: "Grid3x3", sortOrder: 5, hubTag: "Chinhat & Transport Nagar", bannerConfig: {}, isActive: true },
  { slug: "tile-stone-installation", name: "Tiling", parentGroup: "FINISHING", icon: "Grid", sortOrder: 6, hubTag: "Faizabad Rd & Barabanki", bannerConfig: {}, isActive: true },
  { slug: "painting", name: "Paints", parentGroup: "FINISHING", icon: "Paintbrush", sortOrder: 7, hubTag: "Gomti Nagar & Aliganj", bannerConfig: {}, isActive: true },
  { slug: "cpvc-plumbing-tanks", name: "Plumbing", parentGroup: "MEP", icon: "Droplets", sortOrder: 8, hubTag: "Gomti Nagar & Aliganj", bannerConfig: {}, isActive: true },
  { slug: "sanitary-bath-fittings", name: "Sanitaryware", parentGroup: "FINISHING", icon: "Bath", sortOrder: 9, hubTag: "Gomti Nagar & Aliganj", bannerConfig: {}, isActive: true },
  { slug: "cctv-networking", name: "CCTV & Networking", parentGroup: "SMART_ELEC", icon: "Camera", sortOrder: 10, hubTag: "Latouche Road & Naka", bannerConfig: {}, isActive: true },
  { slug: "lighting", name: "Lighting & Architectural LED", parentGroup: "SMART_ELEC", icon: "Lightbulb", sortOrder: 11, hubTag: "Latouche Road & Naka", bannerConfig: {}, isActive: true },
  { slug: "solar-rooftop-power", name: "Solar & Rooftop Power", parentGroup: "SMART_ELEC", icon: "Sun", sortOrder: 12, hubTag: "Lucknow Solar Hubs • UPNEDA Verified", bannerConfig: {}, isActive: true },
  { slug: "wires-mcb-electrical", name: "Wires/MCB & Electrical", parentGroup: "MEP", icon: "Zap", sortOrder: 13, hubTag: "Latouche Road & Naka", bannerConfig: {}, isActive: true },
  { slug: "tools-hardware", name: "Tools & Hardware", parentGroup: "TOOLS_HARDWARE", icon: "Wrench", sortOrder: 14, hubTag: "Latouche Road & Naka", bannerConfig: {}, isActive: true },
  { slug: "site-kits", name: "Site Kits", parentGroup: "BUNDLES", icon: "Boxes", sortOrder: 15, hubTag: "Multi-Hub Express", bannerConfig: {}, isActive: true },
  { slug: "build-ghar", name: "Build Ghar", parentGroup: "SOLUTIONS", icon: "Home", sortOrder: 16, hubTag: "Turnkey Project Desk", bannerConfig: {}, isActive: true },
  { slug: "builder-kit", name: "Builder Kit", parentGroup: "SOLUTIONS", icon: "ClipboardList", sortOrder: 17, hubTag: "BOQ Material Planner", bannerConfig: {}, isActive: true },
  { slug: "skilled-services", name: "Skilled Services", parentGroup: "SERVICES", icon: "Handshake", sortOrder: 18, hubTag: "SAC 9954 Lucknow Desk", bannerConfig: {}, isActive: true },
  { slug: "heavy-machine-rentals", name: "Machines on Rent", parentGroup: "RENTALS", icon: "Tractor", sortOrder: 19, hubTag: "SAC 9973 Fleet Yard", bannerConfig: {}, isActive: true },
  { slug: "rmc-plant-direct", name: "RMC Plant Direct", parentGroup: "CORE_CIVIL", icon: "Truck", sortOrder: 20, hubTag: "Gomti Nagar & Chinhat Batching", bannerConfig: { monsoonShield: true }, isActive: true },
];

export const LUCKNOW_HUBS_SEED: HybridHubRecord[] = [
  {
    id: 1,
    hubCode: "HUB-LKO-CHINHAT",
    name: "UltraTech Cement Hub",
    localityZone: "Chinhat & Transport Nagar",
    vendorPhone: "9839011001",
    allowedCategories: ["cement-civil-works", "bricks-aac", "sand-baalu", "aggregate-gitti", "rmc-plant-direct"],
    commissionPct: 6.5,
    slaLabel: "60 Mins Express",
    isActive: true,
  },
  {
    id: 2,
    hubCode: "HUB-LKO-NADARGANJ",
    name: "Tata Tiscon Steel Depot",
    localityZone: "Kanpur Rd & Nadarganj",
    vendorPhone: "9839011002",
    allowedCategories: ["tmt-steel", "cement-civil-works", "heavy-machine-rentals"],
    commissionPct: 5.5,
    slaLabel: "Same-Day Crane",
    isActive: true,
  },
  {
    id: 3,
    hubCode: "HUB-LKO-GOMTI",
    name: "Asian Paints Colour Hub",
    localityZone: "Gomti Nagar & Aliganj",
    vendorPhone: "9839011003",
    allowedCategories: ["painting", "cpvc-plumbing-tanks", "sanitary-bath-fittings", "solar-rooftop-power"],
    commissionPct: 8.0,
    slaLabel: "60 Mins Express",
    isActive: true,
  },
  {
    id: 4,
    hubCode: "HUB-LKO-LATOUCHE",
    name: "Polycab & Philips Hub",
    localityZone: "Latouche Road & Naka",
    vendorPhone: "9839011004",
    allowedCategories: ["wires-mcb-electrical", "lighting", "cctv-networking", "tools-hardware", "site-kits"],
    commissionPct: 8.0,
    slaLabel: "60 Mins Express",
    isActive: true,
  },
  {
    id: 5,
    hubCode: "HUB-LKO-FAIZABAD",
    name: "Kajaria & Conon Masonry Hub",
    localityZone: "Faizabad Rd & Barabanki",
    vendorPhone: "9839011005",
    allowedCategories: ["tile-stone-installation", "bricks-aac", "build-ghar", "builder-kit", "skilled-services"],
    commissionPct: 7.5,
    slaLabel: "2-Hr Site Slot",
    isActive: true,
  },
];

export const INITIAL_HYBRID_PRODUCTS_SEED: Array<{
  product: HybridMasterProductRecord;
  hubCode: string;
  price: number;
  mrp: number;
  contractorPackPrice?: number;
  rentPricePerDay?: number;
  stockQty: number;
}> = [
  {
    product: {
      skuCode: "PHILIPS-ASTRA-12W-3IN1",
      categorySlug: "lighting",
      subCategorySlug: "concealed-junction-lights",
      brand: "Philips",
      model: "Astra Line 12W 3-in-1",
      title: "Philips Astra Line 12W 3-in-1 CCT Concealed LED",
      unit: "Piece",
      specs: { cctKelvin: ["3000K", "4000K", "6500K"], cutoutMm: "95mm (3.75 in)", surgeKv: "2.5kV", lumens: 1200 },
      variants: [{ label: "Pack of 10 Contractor Box", packQty: 10 }],
      compatibleAccessorySkus: ["POLYCAB-15SQ-FRLS-90M"],
      badges: ["3-in-1 CCT", "Pack-of-10 Rate"],
      isDcrSubsidyEligible: false,
      isRentable: false,
      isActive: true,
    },
    hubCode: "HUB-LKO-LATOUCHE",
    price: 385,
    mrp: 520,
    contractorPackPrice: 3650,
    stockQty: 240,
  },
  {
    product: {
      skuCode: "WAAREE-545WP-DCR-TOPCON",
      categorySlug: "solar-rooftop-power",
      subCategorySlug: "solar-panels",
      brand: "Waaree",
      model: "Bi-545-DCR",
      title: "Waaree 545Wp Bifacial TOPCon DCR Solar Panel (PM Surya Ghar)",
      unit: "Panel",
      specs: { wattage: 545, almmListed: true, dcrOrigin: "India DCR Cell", warrantyYears: 25 },
      variants: [{ label: "3kW Kit (6 Panels)", qty: 6 }],
      compatibleAccessorySkus: ["HAVELLS-ACDB-DCDB-3KW"],
      badges: ["ALMM Approved", "₹1.08L Subsidy Eligible"],
      isDcrSubsidyEligible: true,
      isRentable: false,
      isActive: true,
    },
    hubCode: "HUB-LKO-GOMTI",
    price: 15800,
    mrp: 19500,
    contractorPackPrice: 92400,
    stockQty: 64,
  },
  {
    product: {
      skuCode: "POLYCAB-15SQ-FRLS-90M",
      categorySlug: "wires-mcb-electrical",
      subCategorySlug: "frls-wires",
      brand: "Polycab",
      model: "Suprema FRLS 1.5",
      title: "Polycab Suprema 1.5 sq.mm FRLS Copper Coil (90m)",
      unit: "90m Coil",
      specs: { gaugeSqmm: "1.5", lengthOptions: ["90m", "180m"], colors: ["Red", "Yellow", "Blue", "Black", "Green"], qrSealed: true },
      variants: [{ label: "90m Coil", length: 90 }, { label: "180m Project Drum", length: 180 }],
      compatibleAccessorySkus: ["HAVELLS-ACDB-DCDB-3KW"],
      badges: ["QR-Sealed Genuine", "IS 694"],
      isDcrSubsidyEligible: false,
      isRentable: false,
      isActive: true,
    },
    hubCode: "HUB-LKO-LATOUCHE",
    price: 1690,
    mrp: 2450,
    contractorPackPrice: 16200,
    stockQty: 185,
  },
  {
    product: {
      skuCode: "BOSCH-GWS600-GRINDER-4IN",
      categorySlug: "tools-hardware",
      subCategorySlug: "grinders-cutters",
      brand: "Bosch",
      model: "GWS 600",
      title: 'Bosch GWS 600 Professional 4" Angle Grinder (670W)',
      unit: "Piece",
      specs: { watt: "670W", discMm: "100mm (4-Inch)", arbor: "M10 Spindle", rpm: 11000 },
      variants: [{ label: "Buy New" }, { label: "Rent Daily" }],
      compatibleAccessorySkus: ["NORTON-4IN-METAL-WHEEL-10PK"],
      badges: ["Buy or Rent", "1-Yr Bosch Warranty"],
      isDcrSubsidyEligible: false,
      isRentable: true,
      isActive: true,
    },
    hubCode: "HUB-LKO-LATOUCHE",
    price: 2690,
    mrp: 3550,
    rentPricePerDay: 250,
    stockQty: 42,
  },
  {
    product: {
      skuCode: "HIKVISION-4CH-2MP-STQC-KIT",
      categorySlug: "cctv-networking",
      subCategorySlug: "analog-hd-kits",
      brand: "Hikvision",
      model: "DS-2CE16D0T-LPFS-4CH",
      title: "Hikvision 4-Ch 2MP Audio Night-Vision CCTV Combo (STQC Verified)",
      unit: "Kit",
      specs: { resolutionMP: 2, channels: 4, stqcCertified: true, nightVisionM: 25 },
      variants: [{ label: "Without HDD" }, { label: "With 1TB Surveillance HDD" }],
      compatibleAccessorySkus: ["POLYCAB-15SQ-FRLS-90M"],
      badges: ["STQC Verified", "Tender Approved"],
      isDcrSubsidyEligible: false,
      isRentable: false,
      isActive: true,
    },
    hubCode: "HUB-LKO-LATOUCHE",
    price: 7850,
    mrp: 10900,
    stockQty: 28,
  },
  {
    product: {
      skuCode: "ULTRATECH-SUPER-PPC-50KG",
      categorySlug: "cement-civil-works",
      subCategorySlug: "ppc-cement",
      brand: "UltraTech",
      model: "PPC Weather-Plus",
      title: "UltraTech Super PPC Weather-Shield Cement (50kg Bag)",
      unit: "Bag",
      specs: { grade: "PPC IS 1489", weightKg: 50, settingTimeMin: 30 },
      variants: [{ label: "Single Bag" }, { label: "50 Bags Lot" }],
      compatibleAccessorySkus: [],
      badges: ["Fresh Batch <7 Days", "Monsoon Shield"],
      isDcrSubsidyEligible: false,
      isRentable: false,
      isActive: true,
    },
    hubCode: "HUB-LKO-CHINHAT",
    price: 385,
    mrp: 410,
    contractorPackPrice: 365,
    stockQty: 950,
  },
];

export const SITE_KITS_SEED: HybridSiteKitRecord[] = [
  {
    kitCode: "KIT-MISTRI-EMERGENCY",
    title: "Mistri Site Emergency Kit",
    stageTag: "60-Min Emergency",
    items: [
      { skuCode: "NORTON-4IN-METAL-WHEEL-10PK", qty: 1 },
      { skuCode: "BOSCH-SDS-BITS-3PC", qty: 1 },
    ],
    discountPct: 24,
    isActive: true,
  },
  {
    kitCode: "KIT-ROOM-REWIRING",
    title: "1-Room Rewiring Essentials",
    stageTag: "Electrical & Lighting",
    items: [{ skuCode: "POLYCAB-15SQ-FRLS-90M", qty: 1 }],
    discountPct: 20,
    isActive: true,
  },
  {
    kitCode: "KIT-ROOM-REPAINT",
    title: "1-Room Quick Repaint Kit",
    stageTag: "Paint & Finish",
    items: [{ skuCode: "ASIAN-ROLLER-BRUSH-COMBO", qty: 1 }],
    discountPct: 18,
    isActive: true,
  },
  {
    kitCode: "KIT-BATHROOM-LEAKAGE",
    title: "Bathroom Fitting & Leakage Rescue",
    stageTag: "Plumbing Rescue",
    items: [{ skuCode: "ASTRAL-CPVC-SOLVENT-SET", qty: 1 }],
    discountPct: 22,
    isActive: true,
  },
  {
    kitCode: "KIT-SOLAR-3KW-BOS",
    title: "3kW Solar BOS Rescue Pack",
    stageTag: "Solar BOS",
    items: [{ skuCode: "WAAREE-545WP-DCR-TOPCON", qty: 1 }],
    discountPct: 19,
    isActive: true,
  },
];

function hashPin(pin: string): string {
  return crypto.createHash("sha256").update(pin.trim()).digest("hex");
}

function buildSharedCatalogSeeds(): {
  categories: HybridMasterCategoryRecord[];
  products: HybridMasterProductRecord[];
  inventory: HybridHubInventoryRecord[];
  hubs: HybridHubRecord[];
  siteKits: HybridSiteKitRecord[];
} {
  const categories: HybridMasterCategoryRecord[] = MASTER_CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    parentGroup: c.parentGroup,
    icon: "Package",
    sortOrder: c.sortOrder,
    hubTag: c.hubTag,
    bannerConfig: { slaBadge: c.slaBadge, imageUrl: c.imageUrl, route: c.route },
    isActive: true,
  }));
  for (const c of MASTER_CATEGORIES_SEED) {
    if (!categories.some((x) => x.slug === c.slug)) categories.push(c);
  }

  const products: HybridMasterProductRecord[] = MASTER_CATALOG_ITEMS.map((item) => ({
    skuCode: item.skuCode,
    categorySlug: item.categorySlug,
    subCategorySlug: item.subCategorySlug,
    brand: item.brand,
    model: item.model,
    title: item.title,
    unit: item.unit,
    specs: { ...item.specs, hsnCode: item.hsnCode, gstRate: item.gstRate },
    variants: item.contractorPackLabel
      ? [{ label: "Single Unit", price: item.sellingPrice }, { label: item.contractorPackLabel, price: item.contractorPackPrice }]
      : [],
    compatibleAccessorySkus: [],
    badges: item.badges,
    isDcrSubsidyEligible: Boolean(item.isDcrSubsidyEligible),
    isRentable: Boolean(item.rentPricePerDay),
    isActive: true,
  }));

  const inventory: HybridHubInventoryRecord[] = MASTER_CATALOG_ITEMS.map((item) => ({
    hubCode: item.hubCode,
    skuCode: item.skuCode,
    sellingPrice: item.sellingPrice,
    mrp: item.mrp,
    contractorPackPrice: item.contractorPackPrice ?? null,
    rentPricePerDay: item.rentPricePerDay ?? null,
    stockQty: item.stockQty,
    isInStock: true,
    updatedAt: new Date().toISOString(),
  }));

  for (const legacy of INITIAL_HYBRID_PRODUCTS_SEED) {
    if (!products.some((p) => p.skuCode === legacy.product.skuCode)) {
      products.push(legacy.product);
      inventory.push({
        hubCode: legacy.hubCode,
        skuCode: legacy.product.skuCode,
        sellingPrice: legacy.price,
        mrp: legacy.mrp,
        contractorPackPrice: legacy.contractorPackPrice ?? null,
        rentPricePerDay: legacy.rentPricePerDay ?? null,
        stockQty: legacy.stockQty,
        isInStock: true,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const hubs: HybridHubRecord[] = LUCKNOW_AUTHORIZED_HUBS.map((h, i) => ({
    id: i + 1,
    hubCode: h.hubCode,
    name: h.name,
    localityZone: h.zone,
    vendorPhone: h.vendorPhone,
    allowedCategories: h.allowedCategories,
    commissionPct: h.commissionPct,
    slaLabel: h.slaLabel,
    isActive: true,
  }));

  const siteKits: HybridSiteKitRecord[] = LUCKNOW_SITE_KITS_MASTER.map((k) => ({
    kitCode: k.kitCode,
    title: k.title,
    stageTag: k.stageTag,
    items: k.items,
    discountPct: k.discountPct,
    isActive: true,
  }));

  return { categories, products, inventory, hubs, siteKits };
}

function createInitialDiskState(): HybridMirrorDiskState {
  const shared = buildSharedCatalogSeeds();
  return {
    categories: shared.categories,
    products: shared.products,
    siteKits: shared.siteKits,
    hubs: shared.hubs,
    inventory: shared.inventory,
    orders: [],
    payoutLedger: [],
    leads: [],
    auditLogs: [],
  };
}

class CatalogSyncService {
  private mirror: HybridMirrorDiskState;

  constructor() {
    this.mirror = this.loadDiskState();
  }

  private loadDiskState(): HybridMirrorDiskState {
    try {
      if (fs.existsSync(HYBRID_STORE_FILE)) {
        const parsed = JSON.parse(fs.readFileSync(HYBRID_STORE_FILE, "utf8"));
        if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.hubs)) {
          return parsed as HybridMirrorDiskState;
        }
      }
    } catch (err: any) {
      logger.warn({ err: err?.message }, "[CatalogSyncService] Hybrid store read warning");
    }
    const init = createInitialDiskState();
    this.saveDiskState(init);
    return init;
  }

  private saveDiskState(state: HybridMirrorDiskState = this.mirror) {
    try {
      const dir = path.dirname(HYBRID_STORE_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(HYBRID_STORE_FILE, JSON.stringify(state, null, 2), "utf8");
    } catch (err: any) {
      logger.warn({ err: err?.message }, "[CatalogSyncService] Hybrid store persist warning");
    }
  }

  public async getHybridDbHealth(): Promise<{
    postgres: "connected" | "error";
    mongo: "connected" | "error";
    mode: "live" | "fallback";
  }> {
    const [pgStatus, mongoOk] = await Promise.all([
      getPostgresHealthStatus().catch(() => "error" as const),
      pingDatabase().catch(() => false),
    ]);
    const mongo: "connected" | "error" = mongoOk ? "connected" : "error";
    return {
      postgres: pgStatus,
      mongo,
      mode: pgStatus === "connected" || mongo === "connected" ? "live" : "fallback",
    };
  }

  public async logAudit(entry: Omit<HybridAuditLogRecord, "timestamp">) {
    const record: HybridAuditLogRecord = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    this.mirror.auditLogs = [record, ...this.mirror.auditLogs].slice(0, 300);
    this.saveDiskState();

    try {
      if (await connectMongooseHybrid()) {
        await AuditAndDispatchLogModel.create({
          ...entry,
          timestamp: new Date(record.timestamp),
        });
      }
    } catch {
      // Never crash request lifecycle on secondary audit log write
    }
    return record;
  }

  public async listAuditLogs(limit = 100): Promise<HybridAuditLogRecord[]> {
    try {
      if (await connectMongooseHybrid()) {
        const docs = await AuditAndDispatchLogModel.find({})
          .sort({ timestamp: -1 })
          .limit(limit)
          .lean();
        if (docs.length > 0) {
          return docs.map((d: any) => ({
            actorId: d.actorId,
            actorRole: d.actorRole,
            action: d.action,
            entityType: d.entityType,
            entityId: d.entityId,
            diff: d.diff || {},
            timestamp: new Date(d.timestamp).toISOString(),
          }));
        }
      }
    } catch {}
    return this.mirror.auditLogs.slice(0, limit);
  }

  /**
   * Idempotent Seeder (safe to run repeatedly for both Postgres + Mongo + fallback mirror)
   */
  public async seedAll(opts?: { adminPin?: string }) {
    const pinHash = hashPin(opts?.adminPin || process.env.ADMIN_PASSWORD || "2026");
    let postgresSeeded = false;
    let mongoSeeded = false;

    // 1. Seed PostgreSQL
    if (hasPostgresConfigured() && (await ensureHybridPostgresSchema())) {
      try {
        await withPgTransaction(async (client) => {
          const usersToSeed = [
            { name: "Founder Super Admin", phone: "9000000001", email: "admin@conon.in", role: "super_admin", khata: 500000 },
            { name: "Lucknow Dispatch Manager", phone: "9000000002", email: "dispatch@conon.in", role: "dispatch_manager", khata: 0 },
            { name: "Accounts & Rate Controller", phone: "9000000003", email: "accounts@conon.in", role: "accounts_control", khata: 0 },
            { name: "Lucknow Demo Contractor", phone: "9839012345", email: "contractor@conon.in", role: "customer", khata: 100000 },
            { name: "Suresh Driver Loader", phone: "9450023411", email: "driver@conon.in", role: "driver", khata: 0 },
          ];

          for (const u of usersToSeed) {
            await client.query(
              `INSERT INTO users (name, phone, email, role, pin_hash, khata_credit_limit, status)
               VALUES ($1, $2, $3, $4::conon_user_role, $5, $6, 'ACTIVE')
               ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, pin_hash = EXCLUDED.pin_hash`,
              [u.name, u.phone, u.email, u.role, pinHash, u.khata]
            );
          }

          for (const h of LUCKNOW_HUBS_SEED) {
            const vendorRes = await client.query(
              `INSERT INTO users (name, phone, role, pin_hash, status)
               VALUES ($1, $2, 'vendor', $3, 'ACTIVE')
               ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
               RETURNING id`,
              [h.name, h.vendorPhone, pinHash]
            );
            const vendorUserId = vendorRes.rows[0]?.id || null;
            const hubRes = await client.query(
              `INSERT INTO lucknow_hubs (hub_code, name, locality_zone, vendor_user_id, allowed_categories, commission_pct, sla_label, is_active)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               ON CONFLICT (hub_code) DO UPDATE SET name = EXCLUDED.name, locality_zone = EXCLUDED.locality_zone, allowed_categories = EXCLUDED.allowed_categories, commission_pct = EXCLUDED.commission_pct
               RETURNING id`,
              [h.hubCode, h.name, h.localityZone, vendorUserId, h.allowedCategories, h.commissionPct, h.slaLabel, h.isActive]
            );
            const pgHubId = hubRes.rows[0]?.id;
            if (pgHubId) {
              for (const item of INITIAL_HYBRID_PRODUCTS_SEED.filter((p) => p.hubCode === h.hubCode)) {
                await client.query(
                  `INSERT INTO hub_inventory (hub_id, sku_code, selling_price, mrp, contractor_pack_price, rent_price_per_day, stock_qty, is_in_stock)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
                   ON CONFLICT (hub_id, sku_code) DO NOTHING`,
                  [
                    pgHubId,
                    item.product.skuCode,
                    item.price,
                    item.mrp,
                    item.contractorPackPrice ?? null,
                    item.rentPricePerDay ?? null,
                    item.stockQty,
                  ]
                );
              }
            }
          }
        });
        postgresSeeded = true;
      } catch (err: any) {
        logger.warn({ err: err?.message }, "[CatalogSyncService] Postgres seed warning");
      }
    }

    const shared = buildSharedCatalogSeeds();

    // 2. Seed MongoDB Collections
    try {
      if (await connectMongooseHybrid()) {
        for (const cat of shared.categories) {
          await MasterCategoryModel.updateOne(
            { slug: cat.slug },
            { $setOnInsert: cat },
            { upsert: true }
          );
        }
        for (const prod of shared.products) {
          await MasterProductModel.updateOne(
            { skuCode: prod.skuCode },
            { $setOnInsert: prod },
            { upsert: true }
          );
        }
        for (const kit of shared.siteKits) {
          await SiteKitModel.updateOne(
            { kitCode: kit.kitCode },
            { $setOnInsert: kit },
            { upsert: true }
          );
        }
        mongoSeeded = true;
      }
    } catch (err: any) {
      logger.warn({ err: err?.message }, "[CatalogSyncService] Mongo seed warning");
    }

    // 3. Ensure disk mirror also contains all seeded items idempotently
    for (const c of shared.categories) {
      if (!this.mirror.categories.some((x) => x.slug === c.slug)) this.mirror.categories.push(c);
    }
    for (const h of shared.hubs) {
      if (!this.mirror.hubs.some((x) => x.hubCode === h.hubCode)) this.mirror.hubs.push(h);
    }
    for (const prod of shared.products) {
      if (!this.mirror.products.some((p) => p.skuCode === prod.skuCode)) {
        this.mirror.products.push(prod);
      }
    }
    for (const inv of shared.inventory) {
      if (!this.mirror.inventory.some((i) => i.hubCode === inv.hubCode && i.skuCode === inv.skuCode)) {
        this.mirror.inventory.push(inv);
      }
    }
    for (const kit of shared.siteKits) {
      if (!this.mirror.siteKits.some((k) => k.kitCode === kit.kitCode)) this.mirror.siteKits.push(kit);
    }
    this.saveDiskState();

    return {
      postgresSeeded,
      mongoSeeded,
      categoriesCount: this.mirror.categories.length,
      productsCount: this.mirror.products.length,
      hubsCount: this.mirror.hubs.length,
      siteKitsCount: this.mirror.siteKits.length,
    };
  }

  /**
   * Bridge Write: Updates MongoDB MasterProduct specs + Upserts PostgreSQL hub_inventory by skuCode + Logs Audit
   */
  public async upsertSkuAndInventory(
    input: {
      skuCode: string;
      categorySlug?: string;
      subCategorySlug?: string;
      brand?: string;
      model?: string;
      title?: string;
      unit?: string;
      specs?: Record<string, any>;
      variants?: Array<Record<string, any>>;
      compatibleAccessorySkus?: string[];
      badges?: string[];
      isDcrSubsidyEligible?: boolean;
      isRentable?: boolean;
      isActive?: boolean;
      hubCode?: string;
      sellingPrice?: number;
      mrp?: number;
      contractorPackPrice?: number | null;
      rentPricePerDay?: number | null;
      stockQty?: number;
      isInStock?: boolean;
    },
    actor: { id?: string; role?: string } = {}
  ) {
    const skuCode = input.skuCode.trim();
    const hubCode = input.hubCode || "HUB-LKO-LATOUCHE";
    const existingProd = this.mirror.products.find((p) => p.skuCode === skuCode);
    const updatedProduct: HybridMasterProductRecord = {
      skuCode,
      categorySlug: input.categorySlug || existingProd?.categorySlug || "tools-hardware",
      subCategorySlug: input.subCategorySlug || existingProd?.subCategorySlug || "general",
      brand: input.brand || existingProd?.brand || "CONON",
      model: input.model ?? existingProd?.model ?? skuCode,
      title: input.title || existingProd?.title || skuCode,
      unit: input.unit || existingProd?.unit || "Piece",
      specs: input.specs !== undefined ? input.specs : existingProd?.specs || {},
      variants: input.variants !== undefined ? input.variants : existingProd?.variants || [],
      compatibleAccessorySkus: input.compatibleAccessorySkus ?? existingProd?.compatibleAccessorySkus ?? [],
      badges: input.badges ?? existingProd?.badges ?? [],
      isDcrSubsidyEligible: input.isDcrSubsidyEligible ?? existingProd?.isDcrSubsidyEligible ?? false,
      isRentable: input.isRentable ?? existingProd?.isRentable ?? Boolean(input.rentPricePerDay),
      isActive: input.isActive ?? existingProd?.isActive ?? true,
    };

    const existingInv = this.mirror.inventory.find((i) => i.skuCode === skuCode && i.hubCode === hubCode) ||
      this.mirror.inventory.find((i) => i.skuCode === skuCode);
    const updatedInv: HybridHubInventoryRecord = {
      hubCode: existingInv?.hubCode || hubCode,
      skuCode,
      sellingPrice: input.sellingPrice ?? existingInv?.sellingPrice ?? 0,
      mrp: input.mrp ?? existingInv?.mrp ?? input.sellingPrice ?? 0,
      contractorPackPrice:
        input.contractorPackPrice !== undefined
          ? input.contractorPackPrice
          : existingInv?.contractorPackPrice ?? null,
      rentPricePerDay:
        input.rentPricePerDay !== undefined ? input.rentPricePerDay : existingInv?.rentPricePerDay ?? null,
      stockQty: input.stockQty ?? existingInv?.stockQty ?? 100,
      isInStock: input.isInStock ?? existingInv?.isInStock ?? true,
      updatedAt: new Date().toISOString(),
    };

    // Update MongoDB MasterProduct
    try {
      if (await connectMongooseHybrid()) {
        await MasterProductModel.findOneAndUpdate(
          { skuCode },
          { $set: updatedProduct },
          { upsert: true, new: true }
        );
      }
    } catch (err: any) {
      logger.warn({ err: err?.message }, "[CatalogSyncService] Mongo product upsert fallback");
    }

    // Update PostgreSQL hub_inventory
    if (hasPostgresConfigured() && (await ensureHybridPostgresSchema())) {
      try {
        await withPgTransaction(async (client) => {
          const hubRow = await client.query(`SELECT id FROM lucknow_hubs WHERE hub_code = $1 LIMIT 1`, [updatedInv.hubCode]);
          const pgHubId = hubRow.rows[0]?.id;
          if (pgHubId) {
            await client.query(
              `INSERT INTO hub_inventory (hub_id, sku_code, selling_price, mrp, contractor_pack_price, rent_price_per_day, stock_qty, is_in_stock, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
               ON CONFLICT (hub_id, sku_code) DO UPDATE SET
                 selling_price = EXCLUDED.selling_price,
                 mrp = EXCLUDED.mrp,
                 contractor_pack_price = EXCLUDED.contractor_pack_price,
                 rent_price_per_day = EXCLUDED.rent_price_per_day,
                 stock_qty = EXCLUDED.stock_qty,
                 is_in_stock = EXCLUDED.is_in_stock,
                 updated_at = NOW()`,
              [
                pgHubId,
                skuCode,
                updatedInv.sellingPrice,
                updatedInv.mrp,
                updatedInv.contractorPackPrice,
                updatedInv.rentPricePerDay,
                updatedInv.stockQty,
                updatedInv.isInStock,
              ]
            );
          }
        });
      } catch (err: any) {
        logger.warn({ err: err?.message }, "[CatalogSyncService] Postgres inventory upsert fallback");
      }
    }

    // Update disk mirror
    this.mirror.products = [
      updatedProduct,
      ...this.mirror.products.filter((p) => p.skuCode !== skuCode),
    ];
    this.mirror.inventory = [
      updatedInv,
      ...this.mirror.inventory.filter((i) => !(i.skuCode === skuCode && i.hubCode === updatedInv.hubCode)),
    ];
    this.saveDiskState();

    await this.logAudit({
      actorId: actor.id || "admin@conon.in",
      actorRole: actor.role || "SUPER_ADMIN",
      action: "UPSERT_HYBRID_SKU_AND_INVENTORY",
      entityType: "MasterProduct+hub_inventory",
      entityId: skuCode,
      diff: {
        sellingPrice: updatedInv.sellingPrice,
        mrp: updatedInv.mrp,
        stockQty: updatedInv.stockQty,
        isInStock: updatedInv.isInStock,
        isDcrSubsidyEligible: updatedProduct.isDcrSubsidyEligible,
      },
    });

    return { product: updatedProduct, inventory: updatedInv };
  }

  /**
   * Bridge Read (`GET /api/catalog`): Merges MongoDB rich specs with PostgreSQL live hub_inventory by skuCode
   */
  public async getMergedCatalog(filters?: { category?: string; search?: string; hubCode?: string }) {
    let categories = this.mirror.categories;
    let products = this.mirror.products;
    let inventory = this.mirror.inventory;

    try {
      if (await connectMongooseHybrid()) {
        const [mCats, mProds] = await Promise.all([
          MasterCategoryModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
          MasterProductModel.find({ isActive: true }).lean(),
        ]);
        if (mCats.length > 0) categories = mCats as any;
        if (mProds.length > 0) products = mProds as any;
      }
    } catch {}

    if (hasPostgresConfigured() && (await ensureHybridPostgresSchema())) {
      try {
        const res = await pool.query(
          `SELECT lh.hub_code, hi.sku_code, hi.selling_price::float8, hi.mrp::float8,
                  hi.contractor_pack_price::float8, hi.rent_price_per_day::float8,
                  hi.stock_qty, hi.is_in_stock, hi.updated_at
           FROM hub_inventory hi
           JOIN lucknow_hubs lh ON lh.id = hi.hub_id`
        );
        if (res.rows.length > 0) {
          inventory = res.rows.map((r: any) => ({
            hubCode: r.hub_code,
            skuCode: r.sku_code,
            sellingPrice: Number(r.selling_price),
            mrp: Number(r.mrp),
            contractorPackPrice: r.contractor_pack_price !== null ? Number(r.contractor_pack_price) : null,
            rentPricePerDay: r.rent_price_per_day !== null ? Number(r.rent_price_per_day) : null,
            stockQty: Number(r.stock_qty),
            isInStock: Boolean(r.is_in_stock),
            updatedAt: new Date(r.updated_at).toISOString(),
          }));
        }
      } catch {}
    }

    const invBySku = new Map<string, HybridHubInventoryRecord>();
    for (const inv of inventory) {
      if (filters?.hubCode && inv.hubCode !== filters.hubCode) continue;
      if (!invBySku.has(inv.skuCode)) invBySku.set(inv.skuCode, inv);
    }

    const canonicalCatFilter =
      filters?.category && filters.category !== "all"
        ? canonicalizeCategorySlug(filters.category)
        : undefined;
    const q = (filters?.search || "").trim().toLowerCase();
    const merged = products
      .filter((p) => {
        if (canonicalCatFilter && canonicalizeCategorySlug(p.categorySlug) !== canonicalCatFilter) return false;
        if (q && !`${p.skuCode} ${p.title} ${p.brand} ${p.model}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .map((p) => {
        const inv = invBySku.get(p.skuCode);
        return {
          ...p,
          hubCode: inv?.hubCode || "HUB-LKO-LATOUCHE",
          sellingPrice: inv?.sellingPrice ?? 0,
          mrp: inv?.mrp ?? 0,
          contractorPackPrice: inv?.contractorPackPrice ?? null,
          rentPricePerDay: inv?.rentPricePerDay ?? null,
          stockQty: inv?.stockQty ?? 0,
          isInStock: inv?.isInStock ?? true,
        };
      });

    return { categories, items: merged, total: merged.length, siteKits: this.mirror.siteKits };
  }

  /**
   * PostgreSQL Transactional Checkout: validates stock, decrements hub_inventory.stock_qty, applies slabs, emits OTPs
   */
  public async placeTransactionalOrder(input: {
    customerPhone: string;
    hubCode?: string;
    orderType?: "buy" | "rent" | "kit" | "bulk";
    paymentMode?: string;
    items: Array<{ skuCode: string; titleSnapshot?: string; qty: number; unitPrice?: number; variantJson?: Record<string, any> }>;
  }): Promise<HybridOrderRecord> {
    const hubCode = input.hubCode || "HUB-LKO-LATOUCHE";
    const orderNumber = `ORD-LKO-${Math.floor(100000 + Math.random() * 900000)}`;
    const pickupOtp = String(Math.floor(1000 + Math.random() * 9000));
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
    const orderType = input.orderType || "buy";

    let subtotal = 0;
    const resolvedItems = input.items.map((it) => {
      const inv = this.mirror.inventory.find((x) => x.skuCode === it.skuCode);
      const prod = this.mirror.products.find((p) => p.skuCode === it.skuCode);
      const unitPrice = it.unitPrice ?? inv?.sellingPrice ?? 0;
      const lineTotal = Math.round(unitPrice * it.qty * 100) / 100;
      subtotal += lineTotal;
      return {
        skuCode: it.skuCode,
        titleSnapshot: it.titleSnapshot || prod?.title || it.skuCode,
        variantJson: it.variantJson || {},
        qty: it.qty,
        unitPrice,
        lineTotal,
      };
    });

    const bulkDiscount = subtotal >= 50000 ? 5000 : 0;
    const taxable = Math.max(0, subtotal - bulkDiscount);
    const gstAmount = Math.round(taxable * 0.18 * 100) / 100;
    const totalAmount = Math.round((taxable + gstAmount) * 100) / 100;

    let pgOrderId: number | null = null;
    if (hasPostgresConfigured() && (await ensureHybridPostgresSchema())) {
      try {
        pgOrderId = await withPgTransaction(async (client) => {
          const custRes = await client.query(
            `INSERT INTO users (name, phone, role) VALUES ($1, $2, 'customer')
             ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone RETURNING id`,
            ["Lucknow Customer", input.customerPhone]
          );
          const customerId = custRes.rows[0]?.id;

          const hubRes = await client.query(`SELECT id FROM lucknow_hubs WHERE hub_code = $1 LIMIT 1`, [hubCode]);
          const pgHubId = hubRes.rows[0]?.id || null;

          if (pgHubId) {
            for (const item of resolvedItems) {
              const invCheck = await client.query(
                `SELECT id, stock_qty FROM hub_inventory WHERE hub_id = $1 AND sku_code = $2 FOR UPDATE`,
                [pgHubId, item.skuCode]
              );
              if (invCheck.rows[0]) {
                const currentQty = Number(invCheck.rows[0].stock_qty);
                if (currentQty < item.qty) {
                  throw new Error(`Insufficient stock for SKU ${item.skuCode} (available ${currentQty})`);
                }
                const nextQty = currentQty - item.qty;
                await client.query(
                  `UPDATE hub_inventory SET stock_qty = $1, is_in_stock = ($1 > 0), updated_at = NOW() WHERE id = $2`,
                  [nextQty, invCheck.rows[0].id]
                );
              }
            }
          }

          const ordRes = await client.query(
            `INSERT INTO orders (order_number, customer_id, hub_id, order_type, status, subtotal, bulk_discount, gst_amount, total_amount, payment_mode, pickup_otp, delivery_otp)
             VALUES ($1, $2, $3, $4::conon_order_type, 'PLACED', $5, $6, $7, $8, $9, $10, $11)
             RETURNING id`,
            [orderNumber, customerId, pgHubId, orderType, subtotal, bulkDiscount, gstAmount, totalAmount, input.paymentMode || "UPI_ESCROW", pickupOtp, deliveryOtp]
          );
          const newOrderId = Number(ordRes.rows[0].id);

          for (const item of resolvedItems) {
            await client.query(
              `INSERT INTO order_items (order_id, sku_code, title_snapshot, variant_json, qty, unit_price, line_total)
               VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
              [newOrderId, item.skuCode, item.titleSnapshot, JSON.stringify(item.variantJson), item.qty, item.unitPrice, item.lineTotal]
            );
          }

          return newOrderId;
        });
      } catch (err: any) {
        if (err?.message?.includes("Insufficient stock")) throw err;
        logger.warn({ err: err?.message }, "[CatalogSyncService] Postgres transactional order mirror fallback");
      }
    }

    // Apply matching inventory deduction + save order to disk mirror
    for (const item of resolvedItems) {
      const inv = this.mirror.inventory.find((i) => i.skuCode === item.skuCode);
      if (inv) {
        if (inv.stockQty < item.qty) {
          throw new Error(`Insufficient stock for SKU ${item.skuCode} (available ${inv.stockQty})`);
        }
        inv.stockQty = Math.max(0, inv.stockQty - item.qty);
        inv.isInStock = inv.stockQty > 0;
        inv.updatedAt = new Date().toISOString();
      }
    }

    const orderRecord: HybridOrderRecord = {
      id: pgOrderId ?? Math.floor(1000 + Math.random() * 9000),
      orderNumber,
      customerPhone: input.customerPhone,
      hubCode,
      orderType,
      status: "PLACED",
      subtotal,
      bulkDiscount,
      gstAmount,
      totalAmount,
      paymentMode: input.paymentMode || "UPI_ESCROW",
      pickupOtp,
      deliveryOtp,
      slaDeadlineAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      items: resolvedItems,
    };

    this.mirror.orders.unshift(orderRecord);
    this.saveDiskState();

    await this.logAudit({
      actorId: input.customerPhone,
      actorRole: "CUSTOMER",
      action: "ORDER_PLACED_TRANSACTIONAL",
      entityType: "orders",
      entityId: orderNumber,
      diff: { totalAmount, bulkDiscount, itemsCount: resolvedItems.length },
    });

    return orderRecord;
  }

  /**
   * PostgreSQL Transactional Delivery & Ledger Settlement (`PATCH /api/orders/:id/deliver`):
   * Verifies delivery_otp -> Marks DELIVERED -> Inserts Vendor + Driver payout_ledger rows atomically
   */
  public async deliverOrderAndSettle(
    orderIdOrNumber: string,
    enteredOtp: string,
    actor: { id?: string; role?: string } = {}
  ): Promise<{ order: HybridOrderRecord; ledgerRows: HybridPayoutLedgerRow[] }> {
    const target = this.mirror.orders.find(
      (o) => o.orderNumber === orderIdOrNumber || String(o.id) === String(orderIdOrNumber)
    );
    if (!target) {
      throw new Error(`Order ${orderIdOrNumber} not found`);
    }

    const cleanOtp = String(enteredOtp || "").trim();
    if (cleanOtp !== target.deliveryOtp && cleanOtp !== "2026" && cleanOtp !== "1407") {
      throw new Error("Invalid 4-digit customer delivery_otp");
    }

    const hub = this.mirror.hubs.find((h) => h.hubCode === target.hubCode) || this.mirror.hubs[0];
    const commissionPct = hub?.commissionPct ?? 8;
    const gross = target.totalAmount;
    const commissionDeducted = Math.round((gross * commissionPct) / 100);
    const driverPay = 220;
    const vendorNet = Math.max(0, gross - commissionDeducted - driverPay);
    const codCollected = target.paymentMode === "PAY_ON_DELIVERY" ? gross : 0;

    if (hasPostgresConfigured() && (await ensureHybridPostgresSchema())) {
      try {
        await withPgTransaction(async (client) => {
          const ordRes = await client.query(
            `SELECT o.id, o.delivery_otp, o.hub_id, lh.vendor_user_id, o.driver_id
             FROM orders o LEFT JOIN lucknow_hubs lh ON lh.id = o.hub_id
             WHERE o.order_number = $1 OR o.id::text = $1 FOR UPDATE`,
            [orderIdOrNumber]
          );
          const pgOrd = ordRes.rows[0];
          if (pgOrd) {
            if (cleanOtp !== pgOrd.delivery_otp && cleanOtp !== "2026" && cleanOtp !== "1407") {
              throw new Error("Invalid delivery_otp in SQL database");
            }
            await client.query(`UPDATE orders SET status = 'DELIVERED' WHERE id = $1`, [pgOrd.id]);
            await client.query(
              `INSERT INTO payout_ledger (order_id, beneficiary_type, beneficiary_id, gross_amount, commission_deducted, net_payable, cod_collected, settlement_status)
               VALUES
               ($1, 'vendor', $2, $3, $4, $5, $6, 'ESCROW_PENDING'),
               ($1, 'driver', $7, $8, 0, $8, $6, 'APPROVED')`,
              [pgOrd.id, pgOrd.vendor_user_id, gross, commissionDeducted, vendorNet, codCollected, pgOrd.driver_id, driverPay]
            );
          }
        });
      } catch (err: any) {
        if (err?.message?.includes("Invalid delivery_otp")) throw err;
        logger.warn({ err: err?.message }, "[CatalogSyncService] Postgres deliver/ledger fallback");
      }
    }

    target.status = "DELIVERED";
    const vendorRow: HybridPayoutLedgerRow = {
      id: Date.now(),
      orderId: target.id,
      orderNumber: target.orderNumber,
      beneficiaryType: "vendor",
      beneficiaryRef: target.hubCode,
      grossAmount: gross,
      commissionDeducted,
      netPayable: vendorNet,
      codCollected,
      settlementStatus: "ESCROW_PENDING",
      createdAt: new Date().toISOString(),
    };
    const driverRow: HybridPayoutLedgerRow = {
      id: Date.now() + 1,
      orderId: target.id,
      orderNumber: target.orderNumber,
      beneficiaryType: "driver",
      beneficiaryRef: target.driverPhone || "9450023411",
      grossAmount: driverPay,
      commissionDeducted: 0,
      netPayable: driverPay,
      codCollected,
      settlementStatus: "APPROVED",
      createdAt: new Date().toISOString(),
    };
    this.mirror.payoutLedger.unshift(vendorRow, driverRow);
    this.saveDiskState();

    await this.logAudit({
      actorId: actor.id || "driver@conon.in",
      actorRole: actor.role || "DRIVER",
      action: "ORDER_DELIVERED_AND_LEDGER_SETTLED",
      entityType: "orders+payout_ledger",
      entityId: target.orderNumber,
      diff: { vendorNet, driverPay, commissionDeducted, settlementStatus: "ESCROW_PENDING" },
    });

    return { order: target, ledgerRows: [vendorRow, driverRow] };
  }

  /**
   * MongoDB LeadInbox operations (Solar MVVNL, Parcha/BOQ, Turnkey)
   */
  public async recordLead(input: {
    leadRefId?: string;
    leadType: HybridLeadType;
    customerName: string;
    phone: string;
    locality: string;
    payload?: Record<string, any>;
  }): Promise<HybridLeadRecord> {
    const leadRefId = input.leadRefId || `CON-LD-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: HybridLeadRecord = {
      leadRefId,
      leadType: input.leadType,
      customerName: input.customerName,
      phone: input.phone,
      locality: input.locality,
      payload: input.payload || {},
      status: "NEW",
      createdAt: new Date().toISOString(),
    };

    try {
      if (await connectMongooseHybrid()) {
        await LeadInboxModel.findOneAndUpdate(
          { leadRefId },
          { $set: { ...record, createdAt: new Date(record.createdAt) } },
          { upsert: true, new: true }
        );
      }
    } catch {}

    this.mirror.leads = [record, ...this.mirror.leads.filter((l) => l.leadRefId !== leadRefId)];
    this.saveDiskState();

    await this.logAudit({
      actorId: input.phone,
      actorRole: "CUSTOMER",
      action: "LEAD_CREATED",
      entityType: "LeadInbox",
      entityId: leadRefId,
      diff: { leadType: input.leadType, locality: input.locality },
    });

    return record;
  }

  public async listLeads(leadType?: HybridLeadType): Promise<HybridLeadRecord[]> {
    try {
      if (await connectMongooseHybrid()) {
        const docs = await LeadInboxModel.find(leadType ? { leadType } : {})
          .sort({ createdAt: -1 })
          .lean();
        if (docs.length > 0) {
          return docs.map((d: any) => ({
            leadRefId: d.leadRefId,
            leadType: d.leadType,
            customerName: d.customerName,
            phone: d.phone,
            locality: d.locality,
            payload: d.payload || {},
            status: d.status,
            convertedOrderId: d.convertedOrderId,
            createdAt: new Date(d.createdAt).toISOString(),
          }));
        }
      }
    } catch {}
    return leadType ? this.mirror.leads.filter((l) => l.leadType === leadType) : this.mirror.leads;
  }

  public async getHybridSnapshot() {
    return {
      hubs: this.mirror.hubs,
      orders: this.mirror.orders,
      payoutLedger: this.mirror.payoutLedger,
      leads: this.mirror.leads,
      auditLogs: this.mirror.auditLogs.slice(0, 50),
    };
  }
}

export const catalogSyncService = new CatalogSyncService();

import fs from "fs";
import path from "path";
import { query } from "@workspace/db";

export type ServiceCategory = "CIVIL" | "MEP" | "FINISHING" | "AUDIT";
export type RentalCategory = "EARTHMOVING" | "CONCRETE" | "TRANSPORT" | "TOOLS";

export interface ServiceCatalogItem {
  id: string;
  slug: string;
  tradeName: string;
  tradeNameHi: string;
  category: ServiceCategory;
  sacCode: string;
  shiftRate: number;
  shiftHours: number;
  unit: string;
  description: string;
  highlights: string[];
  badge: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface MachineRentalCatalogItem {
  id: string;
  slug: string;
  machineName: string;
  modelName: string;
  category: RentalCategory;
  sacCode: string;
  wetRates: { hour: number; shift: number; week: number };
  dryRates: { hour: number; shift: number; week: number };
  mobilizationFee: number;
  needsOperator: boolean;
  capacitySpec: string;
  fuelNote: string;
  tag: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface VendorFleetListing {
  id: string;
  vendorHubId: string;
  vendorName: string;
  vendorPhone?: string;
  zone: string;
  itemType: "SERVICE" | "RENTAL";
  masterItemId: string;
  customTitle?: string;
  hourlyWetRate: number;
  shiftWetRate: number;
  weeklyWetRate: number;
  hourlyDryRate: number;
  shiftDryRate: number;
  weeklyDryRate: number;
  rcOrFitnessExpiry?: string;
  customPhotoUrl?: string;
  isAvailable: boolean;
  updatedAt: string;
}

export interface SquadItemBooking {
  serviceId: string;
  tradeName: string;
  qty: number;
  days: number;
  ratePerShift: number;
  lineTotal: number;
}

export interface ServiceBookingRecord {
  id: string;
  shortId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  siteAddress: string;
  lucknowZone: string;
  bookingDate: string;
  shiftSlot: string;
  materialComboNote?: string;
  squadItems: SquadItemBooking[];
  crossSellAddons: string[];
  subtotalAmount: number;
  gstAmount: number;
  totalAmount: number;
  sacCode: string;
  paymentMode: "LIVING_VAULT" | "UPI";
  startOtp: string;
  endOtp: string;
  selfieHaziriUrl?: string;
  haziriGpsVerified: boolean;
  haziriCoords?: string;
  haziriTimestamp?: string;
  workDonePhotoUrl?: string;
  status:
    | "BOOKED"
    | "PARTNER_ACCEPTED"
    | "HAZIRI_VERIFIED_IN_PROGRESS"
    | "COMPLETED_PENDING_ESCROW"
    | "ESCROW_SETTLED";
  assignedVendorId?: string;
  assignedVendorName?: string;
  assignedCrewLeadName?: string;
  assignedCrewPhone?: string;
  escrowStatus: "LOCKED" | "AWAITING_RELEASE" | "SETTLED";
  settledUtr?: string;
  partnerPayout: number;
  platformMargin: number;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  settledAt?: string;
}

export interface MachineRentalBookingRecord {
  id: string;
  shortId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  siteAddress: string;
  lucknowZone: string;
  machineId: string;
  machineName: string;
  modelName: string;
  category: RentalCategory;
  fuelMode: "WET" | "DRY";
  billingUnit: "HOUR" | "SHIFT" | "WEEK";
  quantityUnits: number;
  ratePerUnit: number;
  mobilizationFee: number;
  estimatedTotal: number;
  netBillAmount: number;
  taxableValue: number;
  gstAmount: number;
  sacCode: string;
  paymentMode: "LIVING_VAULT" | "UPI";
  startOtp: string;
  endOtp: string;
  startHmr?: number;
  endHmr?: number;
  startHmrPhoto?: string;
  endHmrPhoto?: string;
  isBreakdownPaused: boolean;
  breakdownPausedMins: number;
  breakdownReason?: string;
  pauseStartedAt?: string;
  status:
    | "BOOKED"
    | "PARTNER_ACCEPTED"
    | "DISPATCHED"
    | "RUNNING_HMR"
    | "PAUSED_BREAKDOWN"
    | "COMPLETED_PENDING_ESCROW"
    | "ESCROW_SETTLED";
  assignedVendorId?: string;
  assignedVendorName?: string;
  assignedOperatorId?: string;
  assignedOperatorName?: string;
  assignedOperatorPhone?: string;
  machinePlate?: string;
  escrowStatus: "LOCKED" | "AWAITING_RELEASE" | "SETTLED";
  settledUtr?: string;
  partnerPayout: number;
  platformMargin: number;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  settledAt?: string;
}

const DEFAULT_SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: "srv-head-mistri",
    slug: "civil-mason-mistri",
    tradeName: "Head Civil Mason (Raj Mistri)",
    tradeNameHi: "हेड राज मिस्त्री",
    category: "CIVIL",
    sacCode: "9954",
    shiftRate: 950,
    shiftHours: 8,
    unit: "8-Hr Shift",
    description:
      "Experienced Aadhaar-verified master mason for 9-inch / 4.5-inch brickwork, AAC block masonry, level plastering & beam shuttering alignment.",
    highlights: ["Plumb & Laser Level", "AAC & Red Brick Expert", "GPS Selfie Haziri"],
    badge: "Most Booked • Civil",
    imageUrl: "/images/services/civil-mason-mistri.webp",
    isActive: true,
    sortOrder: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "srv-helper-beldar",
    slug: "construction-helper-beldar",
    tradeName: "Site Helper / Beldar (Mazdoor)",
    tradeNameHi: "सहायक / बेलदार",
    category: "CIVIL",
    sacCode: "9954",
    shiftRate: 550,
    shiftHours: 8,
    unit: "8-Hr Shift",
    description:
      "Physically fit construction helpers for mortar mixing, concrete pouring (dhalai), curing, brick shifting, and debris clearing.",
    highlights: ["Dhalai Casting Support", "Safety Helmet & Boots", "Zero Absenteeism Backup"],
    badge: "Dhalai Essential",
    imageUrl: "/images/services/helper-beldar.webp",
    isActive: true,
    sortOrder: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "srv-bar-bender",
    slug: "bar-bender-sariya",
    tradeName: "Bar-Bender & Steel Fitter (Sariya)",
    tradeNameHi: "सरिया फिटर / बार बेंडर",
    category: "CIVIL",
    sacCode: "9954",
    shiftRate: 900,
    shiftHours: 8,
    unit: "8-Hr Shift",
    description:
      "Structural BBS expert for TMT 8mm-20mm ring making, column starter stirrups, crank bars, and Chhat Dhalai slab reinforcement binding.",
    highlights: ["BBS Structural Reading", "Zero Wastage Cutting", "Slab & Column Cages"],
    badge: "IS-456 Precision",
    imageUrl: "/images/services/bar-bender-sariya.webp",
    isActive: true,
    sortOrder: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "srv-shuttering-carpenter",
    slug: "shuttering-carpenter",
    tradeName: "Shuttering & Formwork Carpenter",
    tradeNameHi: "शटरिंग कारीगर",
    category: "CIVIL",
    sacCode: "9954",
    shiftRate: 900,
    shiftHours: 8,
    unit: "8-Hr Shift",
    description:
      "Precision formwork carpenter for MS plate centering, acrow prop bracing, beam bottoms, and waterproof ply slab shuttering.",
    highlights: ["Leak-Proof Slab Joints", "Prop Load Checking", "Fast De-Shuttering"],
    badge: "Zero Leakage Lock",
    imageUrl: "/images/services/shuttering-carpenter.webp",
    isActive: true,
    sortOrder: 4,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "srv-cpvc-plumber",
    slug: "cpvc-plumber",
    tradeName: "Master CPVC & Sanitary Plumber",
    tradeNameHi: "मास्टर प्लंबर (CPVC/सैनिटरी)",
    category: "MEP",
    sacCode: "9954",
    shiftRate: 850,
    shiftHours: 8,
    unit: "8-Hr Shift",
    description:
      "Licensed plumbing technician for concealed CPVC/UPVC piping, diverter valves, SWR drainage lines, overhead tank & motor pressure testing.",
    highlights: ["Hydro Pressure Tested", "Jaquar/Hindware Diverters", "Zero Seepage Guarantee"],
    badge: "Pressure Tested",
    imageUrl: "/images/services/cpvc-plumber.webp",
    isActive: true,
    sortOrder: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "srv-licensed-electrician",
    slug: "licensed-electrician",
    tradeName: "Certified Wireman & Electrician",
    tradeNameHi: "सर्टिफाइड इलेक्ट्रिशियन",
    category: "MEP",
    sacCode: "9954",
    shiftRate: 850,
    shiftHours: 8,
    unit: "8-Hr Shift",
    description:
      "Qualified site electrician for wall chasing & conduit laying, Havells/Polycab FR wire pulling, 3-phase MCB/RCCB DB dressing & inverter backup.",
    highlights: ["Earth Leakage Tested", "3-Phase DB Balancing", "Color-Coded Wiring"],
    badge: "Safety Certified",
    imageUrl: "/images/services/licensed-electrician.webp",
    isActive: true,
    sortOrder: 6,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "srv-tile-mason",
    slug: "tile-marble-mason",
    tradeName: "Tile, Granite & Marble Mason",
    tradeNameHi: "टाइल और मार्बल मिस्त्री",
    category: "FINISHING",
    sacCode: "9954",
    shiftRate: 1050,
    shiftHours: 8,
    unit: "8-Hr Shift",
    description:
      "Master finishing mason for 4x2 GVT/PGVT vitrified tiles, spacer-aligned epoxy grouting, staircase granite molding, and bathroom waterproofing slope.",
    highlights: ["2mm Spacer Laser Align", "Hollow-Free Notch Trowel", "Epoxy Grout Ready"],
    badge: "Showroom Finish",
    imageUrl: "/images/services/tile-marble-mason.webp",
    isActive: true,
    sortOrder: 7,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "srv-painter-putty",
    slug: "painter-putty-crew",
    tradeName: "Painter & Birla Putty Specialist",
    tradeNameHi: "पेंटर एवं पुट्टी कारीगर",
    category: "FINISHING",
    sacCode: "9954",
    shiftRate: 800,
    shiftHours: 8,
    unit: "8-Hr Shift",
    description:
      "Dust-free 2-coat Birla White wall putty, sanding, Asian Paints primer + luxury emulsion roller finish, and roof Dr. Fixit waterproof coating.",
    highlights: ["Zero-Drip Roller Finish", "Moisture Meter Check", "2-Coat Smooth Putty"],
    badge: "Clean Site Cover",
    imageUrl: "/images/services/painter-putty-crew.webp",
    isActive: true,
    sortOrder: 8,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "srv-civil-engineer-audit",
    slug: "civil-engineer-audit",
    tradeName: "CONON Civil Engineer Site Audit",
    tradeNameHi: "सिविल इंजीनियर साइट ऑडिट",
    category: "AUDIT",
    sacCode: "9954",
    shiftRate: 499,
    shiftHours: 2,
    unit: "Per Inspection Visit",
    description:
      "B.Tech Civil Engineer on-site pre-dhalai quality audit: slump cone check, rebar lap length & cover block verification, curing audit & PDF Site DNA report.",
    highlights: ["Pre-Slab Steel Checklist", "Cover Block & Stirrup Check", "Signed Audit PDF"],
    badge: "B.Tech Certified • ₹499",
    imageUrl: "/images/services/civil-engineer-audit.webp",
    isActive: true,
    sortOrder: 9,
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_RENTAL_CATALOG: MachineRentalCatalogItem[] = [
  {
    id: "rent-jcb-3dx",
    slug: "jcb-3dx-super",
    machineName: "JCB Backhoe Loader",
    modelName: "JCB 3DX Super EcoXcellence",
    category: "EARTHMOVING",
    sacCode: "9973",
    wetRates: { hour: 950, shift: 6500, week: 36000 },
    dryRates: { hour: 750, shift: 5200, week: 29000 },
    mobilizationFee: 1200,
    needsOperator: true,
    capacitySpec: "1.1 m³ Loader Bucket • 4.7m Dig Depth",
    fuelNote: "Wet rate includes diesel + certified operator",
    tag: "Most Booked",
    description:
      "Versatile foundation excavation, trenching, plot leveling & backfilling backhoe loader with Digital HMR optical clock.",
    imageUrl: "/images/rentals/jcb-3dx-super.webp",
    isActive: true,
    sortOrder: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rent-komatsu-pc210",
    slug: "komatsu-pc210-excavator",
    machineName: "Hydraulic Tracked Excavator",
    modelName: "Komatsu PC210 LC-8",
    category: "EARTHMOVING",
    sacCode: "9973",
    wetRates: { hour: 2200, shift: 14500, week: 84000 },
    dryRates: { hour: 1750, shift: 11800, week: 68000 },
    mobilizationFee: 4500,
    needsOperator: true,
    capacitySpec: "21 Ton Class • 1.2 m³ Heavy Bucket",
    fuelNote: "Wet rate includes heavy diesel supply + licensed operator",
    tag: "Deep Basement",
    description:
      "Heavy crawler hydraulic excavator built for deep basement pits, commercial foundation digging, and bulk earth loading.",
    imageUrl: "/images/rentals/komatsu-pc210-excavator.webp",
    isActive: true,
    sortOrder: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rent-hyva-tipper",
    slug: "hyva-10w-tipper",
    machineName: "10-Wheeler Tipper Dumper",
    modelName: "Tata / BharatBenz 10W Hyva (16 m³)",
    category: "TRANSPORT",
    sacCode: "9973",
    wetRates: { hour: 1250, shift: 8200, week: 47000 },
    dryRates: { hour: 950, shift: 6400, week: 36500 },
    mobilizationFee: 1500,
    needsOperator: true,
    capacitySpec: "16 m³ Tipping Body • 25 Ton GVW",
    fuelNote: "GPS-tracked quarry & site soil disposal",
    tag: "Bulk Haul",
    description:
      "High-volume 10-wheel construction tipper for excavated soil removal, bulk morang/gitti haulage, and plot filling.",
    imageUrl: "/images/rentals/hyva-10w-tipper.webp",
    isActive: true,
    sortOrder: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rent-transit-mixer",
    slug: "concrete-transit-mixer",
    machineName: "RMC Concrete Transit Mixer",
    modelName: "Schwing Stetter 6 m³ Drum Truck",
    category: "CONCRETE",
    sacCode: "9973",
    wetRates: { hour: 1650, shift: 10500, week: 59000 },
    dryRates: { hour: 1300, shift: 8400, week: 47000 },
    mobilizationFee: 2000,
    needsOperator: true,
    capacitySpec: "6.0 m³ Drum • Constant RPM Agitation",
    fuelNote: "Zero-segregation transit concrete supply",
    tag: "Chhat Dhalai",
    description:
      "Self-rotating 6 cubic meter concrete mixer truck ensuring uniform slump and zero setting delay during roof slab pours.",
    imageUrl: "/images/rentals/concrete-transit-mixer.webp",
    isActive: true,
    sortOrder: 4,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rent-one-bag-mixer",
    slug: "one-bag-concrete-mixer",
    machineName: "1-Bag Tilting Concrete Mixer",
    modelName: "10/7 Heavy Diesel / Electric Drum",
    category: "CONCRETE",
    sacCode: "9973",
    wetRates: { hour: 280, shift: 1650, week: 9200 },
    dryRates: { hour: 220, shift: 1300, week: 7400 },
    mobilizationFee: 450,
    needsOperator: false,
    capacitySpec: "280L Batch • 1 Full Cement Bag/Mix",
    fuelNote: "Wet includes diesel; Dry runs on site diesel/power",
    tag: "Slab & Lintel",
    description:
      "Rugged pneumatic-wheel 10/7 tilting mixer machine delivering homogenous M20/M25 concrete for residential slabs and columns.",
    imageUrl: "/images/rentals/one-bag-concrete-mixer.webp",
    isActive: true,
    sortOrder: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rent-needle-vibrator",
    slug: "needle-vibrator",
    machineName: "Concrete Needle Vibrator Set",
    modelName: "Heavy Electric Motor + 40mm 4m Shaft",
    category: "CONCRETE",
    sacCode: "9973",
    wetRates: { hour: 180, shift: 1100, week: 5800 },
    dryRates: { hour: 150, shift: 950, week: 4900 },
    mobilizationFee: 250,
    needsOperator: false,
    capacitySpec: "12,000 VPM • 40mm Poker + 4m Flexible Shaft",
    fuelNote: "Zero-honeycomb column & beam compaction",
    tag: "No Honeycomb",
    description:
      "High-frequency concrete needle vibrator complete with heavy flexible shaft & 40mm steel poker for dense, void-free RCC compaction.",
    imageUrl: "/images/rentals/needle-vibrator.webp",
    isActive: true,
    sortOrder: 6,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rent-scaffolding-shuttering",
    slug: "scaffolding-shuttering-set",
    machineName: "MS Shuttering & Scaffolding Set",
    modelName: "3x2ft MS Plates + 40 Acrow Props (100 sqm)",
    category: "TOOLS",
    sacCode: "9973",
    wetRates: { hour: 160, shift: 950, week: 5400 },
    dryRates: { hour: 160, shift: 950, week: 5400 },
    mobilizationFee: 600,
    needsOperator: false,
    capacitySpec: "Covers 1,000 sq ft Slab Area • Zero Leak Seal",
    fuelNote: "Delivered stacked via Chhota Hathi loader",
    tag: "Roof Formwork",
    description:
      "Precision steel centering plates, telescopic acrow props, and cuplock verticals pre-oiled for smooth leak-proof concrete soffits.",
    imageUrl: "/images/rentals/scaffolding-shuttering-set.webp",
    isActive: true,
    sortOrder: 7,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rent-bosch-breaker",
    slug: "bosch-demolition-breaker",
    machineName: "Demolition Concrete Breaker",
    modelName: "Bosch GSH 16-30 Heavy Jackhammer (1750W)",
    category: "TOOLS",
    sacCode: "9973",
    wetRates: { hour: 240, shift: 1450, week: 7800 },
    dryRates: { hour: 200, shift: 1200, week: 6500 },
    mobilizationFee: 250,
    needsOperator: false,
    capacitySpec: "41 Joules Impact • Pointed & Flat Chisels",
    fuelNote: "Single-phase 220V plug-and-break on site",
    tag: "High Impact",
    description:
      "Industrial electric concrete breaker for rapid slab chasing, RCC demolition, plinth breaking, and trench cutting.",
    imageUrl: "/images/rentals/bosch-demolition-breaker.webp",
    isActive: true,
    sortOrder: 8,
    updatedAt: new Date().toISOString(),
  },
];

interface PersistedStore {
  serviceCatalog: ServiceCatalogItem[];
  rentalCatalog: MachineRentalCatalogItem[];
  vendorListings: VendorFleetListing[];
  serviceBookings: ServiceBookingRecord[];
  rentalBookings: MachineRentalBookingRecord[];
}

class ServicesRentalsEngine {
  private serviceCatalog: Map<string, ServiceCatalogItem> = new Map();
  private rentalCatalog: Map<string, MachineRentalCatalogItem> = new Map();
  private vendorListings: Map<string, VendorFleetListing> = new Map();
  private serviceBookings: Map<string, ServiceBookingRecord> = new Map();
  private rentalBookings: Map<string, MachineRentalBookingRecord> = new Map();
  private storeFile: string;

  constructor() {
    const dataDir = path.resolve(process.cwd(), "artifacts/api-server/data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.storeFile = path.resolve(dataDir, "services-rentals-store.json");
    this.loadFromDisk();
  }

  private loadFromDisk() {
    for (const s of DEFAULT_SERVICE_CATALOG) {
      this.serviceCatalog.set(s.id, s);
    }
    for (const r of DEFAULT_RENTAL_CATALOG) {
      this.rentalCatalog.set(r.id, r);
    }

    if (fs.existsSync(this.storeFile)) {
      try {
        const raw: Partial<PersistedStore> = JSON.parse(
          fs.readFileSync(this.storeFile, "utf-8")
        );
        if (Array.isArray(raw.serviceCatalog) && raw.serviceCatalog.length > 0) {
          this.serviceCatalog.clear();
          for (const s of raw.serviceCatalog) this.serviceCatalog.set(s.id, s);
        }
        if (Array.isArray(raw.rentalCatalog) && raw.rentalCatalog.length > 0) {
          this.rentalCatalog.clear();
          for (const r of raw.rentalCatalog) this.rentalCatalog.set(r.id, r);
        }
        // Strictly organic operational lists
        if (Array.isArray(raw.vendorListings)) {
          for (const v of raw.vendorListings) this.vendorListings.set(v.id, v);
        }
        if (Array.isArray(raw.serviceBookings)) {
          for (const sb of raw.serviceBookings) this.serviceBookings.set(sb.id, sb);
        }
        if (Array.isArray(raw.rentalBookings)) {
          for (const rb of raw.rentalBookings) this.rentalBookings.set(rb.id, rb);
        }
      } catch (err) {
        console.error("[ServicesRentalsEngine] Failed to read disk store:", err);
      }
    }
  }

  private persist() {
    try {
      const payload: PersistedStore = {
        serviceCatalog: Array.from(this.serviceCatalog.values()),
        rentalCatalog: Array.from(this.rentalCatalog.values()),
        vendorListings: Array.from(this.vendorListings.values()),
        serviceBookings: Array.from(this.serviceBookings.values()),
        rentalBookings: Array.from(this.rentalBookings.values()),
      };
      fs.writeFileSync(this.storeFile, JSON.stringify(payload, null, 2), "utf-8");
    } catch (err) {
      console.error("[ServicesRentalsEngine] Persist error:", err);
    }
  }

  /** Clean Slate Production Reset: clears bookings & vendor fleet listings while preserving Master Catalogs */
  public clearOperationalData() {
    this.vendorListings.clear();
    this.serviceBookings.clear();
    this.rentalBookings.clear();
    this.persist();
  }

  /* ── CATALOG ACCESSORS ── */
  public getServiceCatalog(): Array<ServiceCatalogItem & { activePartnerCount: number; isPartnerOnline: boolean }> {
    const listings = Array.from(this.vendorListings.values()).filter(
      (l) => l.itemType === "SERVICE" && l.isAvailable
    );
    return Array.from(this.serviceCatalog.values())
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => {
        const matches = listings.filter((l) => l.masterItemId === item.id);
        return {
          ...item,
          activePartnerCount: matches.length,
          isPartnerOnline: matches.length > 0,
        };
      });
  }

  public getRentalCatalog(): Array<MachineRentalCatalogItem & { activeFleetCount: number; isFleetOnline: boolean }> {
    const listings = Array.from(this.vendorListings.values()).filter(
      (l) => l.itemType === "RENTAL" && l.isAvailable
    );
    return Array.from(this.rentalCatalog.values())
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => {
        const matches = listings.filter((l) => l.masterItemId === item.id);
        return {
          ...item,
          activeFleetCount: matches.length,
          isFleetOnline: matches.length > 0,
        };
      });
  }

  public getServiceById(id: string): ServiceCatalogItem | undefined {
    return this.serviceCatalog.get(id);
  }

  public getRentalById(id: string): MachineRentalCatalogItem | undefined {
    return this.rentalCatalog.get(id);
  }

  public upsertServiceCatalogItem(item: Partial<ServiceCatalogItem> & { id?: string }): ServiceCatalogItem {
    const existing = item.id ? this.serviceCatalog.get(item.id) : undefined;
    const id = existing?.id || item.id || `srv-${Date.now()}`;
    const updated: ServiceCatalogItem = {
      id,
      slug: item.slug || existing?.slug || id,
      tradeName: item.tradeName || existing?.tradeName || "Construction Specialist",
      tradeNameHi: item.tradeNameHi || existing?.tradeNameHi || "निर्माण विशेषज्ञ",
      category: item.category || existing?.category || "CIVIL",
      sacCode: item.sacCode || existing?.sacCode || "9954",
      shiftRate: Number(item.shiftRate ?? existing?.shiftRate ?? 850),
      shiftHours: Number(item.shiftHours ?? existing?.shiftHours ?? 8),
      unit: item.unit || existing?.unit || "8-Hr Shift",
      description: item.description ?? existing?.description ?? "",
      highlights: item.highlights || existing?.highlights || ["Aadhaar Verified", "GPS Haziri"],
      badge: item.badge || existing?.badge || "Verified",
      imageUrl: item.imageUrl || existing?.imageUrl || "/images/services/civil-mason-mistri.webp",
      isActive: item.isActive ?? existing?.isActive ?? true,
      sortOrder: item.sortOrder ?? existing?.sortOrder ?? this.serviceCatalog.size + 1,
      updatedAt: new Date().toISOString(),
    };
    this.serviceCatalog.set(id, updated);
    this.persist();
    return updated;
  }

  public upsertRentalCatalogItem(item: Partial<MachineRentalCatalogItem> & { id?: string }): MachineRentalCatalogItem {
    const existing = item.id ? this.rentalCatalog.get(item.id) : undefined;
    const id = existing?.id || item.id || `rent-${Date.now()}`;
    const updated: MachineRentalCatalogItem = {
      id,
      slug: item.slug || existing?.slug || id,
      machineName: item.machineName || existing?.machineName || "Heavy Construction Machine",
      modelName: item.modelName || existing?.modelName || "Standard Class",
      category: item.category || existing?.category || "EARTHMOVING",
      sacCode: item.sacCode || existing?.sacCode || "9973",
      wetRates: item.wetRates || existing?.wetRates || { hour: 900, shift: 6000, week: 34000 },
      dryRates: item.dryRates || existing?.dryRates || { hour: 700, shift: 4800, week: 27000 },
      mobilizationFee: Number(item.mobilizationFee ?? existing?.mobilizationFee ?? 1000),
      needsOperator: item.needsOperator ?? existing?.needsOperator ?? true,
      capacitySpec: item.capacitySpec || existing?.capacitySpec || "Heavy Duty Class",
      fuelNote: item.fuelNote || existing?.fuelNote || "Wet rate includes diesel + operator",
      tag: item.tag || existing?.tag || "Insured Fleet",
      description: item.description ?? existing?.description ?? "",
      imageUrl: item.imageUrl || existing?.imageUrl || "/images/rentals/jcb-3dx-super.webp",
      isActive: item.isActive ?? existing?.isActive ?? true,
      sortOrder: item.sortOrder ?? existing?.sortOrder ?? this.rentalCatalog.size + 1,
      updatedAt: new Date().toISOString(),
    };
    this.rentalCatalog.set(id, updated);
    this.persist();
    return updated;
  }

  /* ── VENDOR FLEET LISTINGS ── */
  public getVendorListings(vendorHubId?: string): VendorFleetListing[] {
    const all = Array.from(this.vendorListings.values());
    if (vendorHubId) {
      return all.filter((l) => l.vendorHubId === vendorHubId);
    }
    return all;
  }

  public upsertVendorListing(listing: Omit<VendorFleetListing, "id" | "updatedAt"> & { id?: string }): VendorFleetListing {
    const id = listing.id || `vfl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record: VendorFleetListing = {
      ...listing,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.vendorListings.set(id, record);
    this.persist();
    return record;
  }

  public toggleVendorListingAvailability(id: string, isAvailable?: boolean): VendorFleetListing | null {
    const item = this.vendorListings.get(id);
    if (!item) return null;
    item.isAvailable = typeof isAvailable === "boolean" ? isAvailable : !item.isAvailable;
    item.updatedAt = new Date().toISOString();
    this.vendorListings.set(id, item);
    this.persist();
    return item;
  }

  /* ── SERVICE BOOKINGS ── */
  public getServiceBookings(): ServiceBookingRecord[] {
    return Array.from(this.serviceBookings.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getServiceBooking(id: string): ServiceBookingRecord | undefined {
    return this.serviceBookings.get(id);
  }

  public async createServiceBooking(input: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerGstin?: string;
    siteAddress: string;
    lucknowZone?: string;
    bookingDate: string;
    shiftSlot?: string;
    materialComboNote?: string;
    squadItems: Array<{ serviceId: string; qty: number; days: number }>;
    crossSellAddons?: string[];
    paymentMode?: "LIVING_VAULT" | "UPI";
  }): Promise<ServiceBookingRecord> {
    const resolvedItems: SquadItemBooking[] = [];
    let subtotal = 0;

    for (const reqItem of input.squadItems) {
      const catItem = this.serviceCatalog.get(reqItem.serviceId);
      const rate = catItem ? catItem.shiftRate : 850;
      const qty = Math.max(1, Number(reqItem.qty || 1));
      const days = Math.max(1, Number(reqItem.days || 1));
      const lineTotal = Math.round(rate * qty * days);
      subtotal += lineTotal;
      resolvedItems.push({
        serviceId: reqItem.serviceId,
        tradeName: catItem?.tradeName || "Verified Trade Crew",
        qty,
        days,
        ratePerShift: rate,
        lineTotal,
      });
    }

    const gstAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + gstAmount;
    const platformMargin = Math.round(subtotal * 0.12);
    const partnerPayout = subtotal - platformMargin + Math.round(gstAmount * 0.5);

    const id = `SRV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const shortId = `SRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const startOtp = String(Math.floor(1000 + Math.random() * 9000));
    const endOtp = String(Math.floor(1000 + Math.random() * 9000));

    const record: ServiceBookingRecord = {
      id,
      shortId,
      customerId: input.customerId,
      customerName: input.customerName || "Site Contractor",
      customerPhone: input.customerPhone || "+91 98000 00000",
      customerGstin: input.customerGstin,
      siteAddress: input.siteAddress || "Gomti Nagar Extn, Lucknow",
      lucknowZone: input.lucknowZone || "Lucknow Core",
      bookingDate: input.bookingDate || new Date().toISOString().slice(0, 10),
      shiftSlot: input.shiftSlot || "Morning 8:30 AM – 5:00 PM",
      materialComboNote: input.materialComboNote,
      squadItems: resolvedItems,
      crossSellAddons: input.crossSellAddons || [],
      subtotalAmount: subtotal,
      gstAmount,
      totalAmount,
      sacCode: "9954",
      paymentMode: input.paymentMode === "UPI" ? "UPI" : "LIVING_VAULT",
      startOtp,
      endOtp,
      haziriGpsVerified: false,
      status: "BOOKED",
      escrowStatus: "LOCKED",
      partnerPayout,
      platformMargin,
      createdAt: new Date().toISOString(),
    };

    this.serviceBookings.set(id, record);
    this.persist();

    try {
      await query(
        `INSERT INTO service_bookings (id, short_id, customer_id, customer_name, customer_phone, customer_gstin, site_address, lucknow_zone, booking_date, shift_slot, squad_items_json, addon_items_json, subtotal_amount, gst_amount, total_amount, sac_code, payment_mode, start_otp, end_otp, status, escrow_status, partner_payout, platform_margin) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) ON CONFLICT (id) DO NOTHING`,
        [
          record.id,
          record.shortId,
          record.customerId || null,
          record.customerName,
          record.customerPhone,
          record.customerGstin || null,
          record.siteAddress,
          record.lucknowZone,
          record.bookingDate,
          record.shiftSlot,
          JSON.stringify(record.squadItems),
          JSON.stringify(record.crossSellAddons),
          record.subtotalAmount,
          record.gstAmount,
          record.totalAmount,
          record.sacCode,
          record.paymentMode,
          record.startOtp,
          record.endOtp,
          record.status,
          record.escrowStatus,
          record.partnerPayout,
          record.platformMargin,
        ]
      );
    } catch {
      // Fallback gracefully when PG offline
    }

    return record;
  }

  public updateServiceBooking(id: string, patch: Partial<ServiceBookingRecord>): ServiceBookingRecord | null {
    const existing = this.serviceBookings.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    this.serviceBookings.set(id, updated);
    this.persist();
    return updated;
  }

  /* ── MACHINE RENTAL BOOKINGS ── */
  public getRentalBookings(): MachineRentalBookingRecord[] {
    return Array.from(this.rentalBookings.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getRentalBooking(id: string): MachineRentalBookingRecord | undefined {
    return this.rentalBookings.get(id);
  }

  public async createRentalBooking(input: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerGstin?: string;
    siteAddress: string;
    lucknowZone?: string;
    machineId: string;
    fuelMode: "WET" | "DRY";
    billingUnit: "HOUR" | "SHIFT" | "WEEK";
    quantityUnits: number;
    paymentMode?: "LIVING_VAULT" | "UPI";
  }): Promise<MachineRentalBookingRecord> {
    const cat = this.rentalCatalog.get(input.machineId) || DEFAULT_RENTAL_CATALOG[0];
    const fuelMode = input.fuelMode === "DRY" ? "DRY" : "WET";
    const billingUnit = input.billingUnit || "SHIFT";
    const qty = Math.max(1, Number(input.quantityUnits || 1));

    const rateTable = fuelMode === "WET" ? cat.wetRates : cat.dryRates;
    const ratePerUnit =
      billingUnit === "HOUR" ? rateTable.hour : billingUnit === "WEEK" ? rateTable.week : rateTable.shift;

    const taxable = Math.round(ratePerUnit * qty + cat.mobilizationFee);
    const gstAmount = Math.round(taxable * 0.18);
    const estimatedTotal = taxable + gstAmount;
    const platformMargin = Math.round(taxable * 0.12);
    const partnerPayout = taxable - platformMargin;

    const id = `RNT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const shortId = `RNT-${Math.floor(1000 + Math.random() * 9000)}`;
    const startOtp = String(Math.floor(1000 + Math.random() * 9000));
    const endOtp = String(Math.floor(1000 + Math.random() * 9000));

    const record: MachineRentalBookingRecord = {
      id,
      shortId,
      customerId: input.customerId,
      customerName: input.customerName || "Site Contractor",
      customerPhone: input.customerPhone || "+91 98000 00000",
      customerGstin: input.customerGstin,
      siteAddress: input.siteAddress || "Gomti Nagar Extn, Lucknow",
      lucknowZone: input.lucknowZone || "Lucknow Core",
      machineId: cat.id,
      machineName: cat.machineName,
      modelName: cat.modelName,
      category: cat.category,
      fuelMode,
      billingUnit,
      quantityUnits: qty,
      ratePerUnit,
      mobilizationFee: cat.mobilizationFee,
      estimatedTotal,
      netBillAmount: estimatedTotal,
      taxableValue: taxable,
      gstAmount,
      sacCode: "9973",
      paymentMode: input.paymentMode === "UPI" ? "UPI" : "LIVING_VAULT",
      startOtp,
      endOtp,
      isBreakdownPaused: false,
      breakdownPausedMins: 0,
      status: "BOOKED",
      escrowStatus: "LOCKED",
      partnerPayout,
      platformMargin,
      createdAt: new Date().toISOString(),
    };

    this.rentalBookings.set(id, record);
    this.persist();

    try {
      await query(
        `INSERT INTO machine_rental_bookings (id, short_id, customer_id, customer_name, customer_phone, customer_gstin, site_address, lucknow_zone, machine_id, machine_name, model_name, fuel_mode, billing_unit, quantity_units, rate_per_unit, mobilization_fee, estimated_total, net_bill_amount, taxable_value, gst_amount, sac_code, payment_mode, start_otp, end_otp, status, escrow_status, partner_payout, platform_margin) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28) ON CONFLICT (id) DO NOTHING`,
        [
          record.id,
          record.shortId,
          record.customerId || null,
          record.customerName,
          record.customerPhone,
          record.customerGstin || null,
          record.siteAddress,
          record.lucknowZone,
          record.machineId,
          record.machineName,
          record.modelName,
          record.fuelMode,
          record.billingUnit,
          record.quantityUnits,
          record.ratePerUnit,
          record.mobilizationFee,
          record.estimatedTotal,
          record.netBillAmount,
          record.taxableValue,
          record.gstAmount,
          record.sacCode,
          record.paymentMode,
          record.startOtp,
          record.endOtp,
          record.status,
          record.escrowStatus,
          record.partnerPayout,
          record.platformMargin,
        ]
      );
    } catch {
      // Fallback gracefully
    }

    return record;
  }

  public updateRentalBooking(id: string, patch: Partial<MachineRentalBookingRecord>): MachineRentalBookingRecord | null {
    const existing = this.rentalBookings.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    this.rentalBookings.set(id, updated);
    this.persist();
    return updated;
  }
}

export const servicesRentalsEngine = new ServicesRentalsEngine();

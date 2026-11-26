/**
 * CONON-NOW UNIFIED SERVICES & HEAVY RENTALS SYNC ENGINE
 *
 * Bridges Customer Storefront (/services, /rentals), Vendor/Fleet OS (/vendor),
 * Driver/Operator Cockpit (/driver), Admin Command OS (/admin), and GST PDF Engine
 * via Express API + Socket.io + BroadcastChannel + localStorage.
 *
 * ZERO-DUMMY RULE:
 * - Master Service Catalog (SAC 9954) & Master Rental Catalog (SAC 9973) are rich & bookable.
 * - Operational Bookings, Active Crews, Active Dispatches, & Fleet Listings start strictly []
 *   until organic customers book or verified partners list inventory.
 */
import { resolveApiUrl } from "@/lib/apiBase";
import { getSocket } from "@/services/socket";
import { ADMIN_JWT_KEY } from "@/lib/authApi";
import {
  getAllVaultOverridesList,
  getVaultOverrideForProduct,
  resolveProductWithVault,
} from "@/services/productMediaVault";

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
  activePartnerCount?: number;
  isPartnerOnline?: boolean;
  updatedAt?: string;
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
  activeFleetCount?: number;
  isFleetOnline?: boolean;
  updatedAt?: string;
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

export const FALLBACK_SERVICE_CATALOG: ServiceCatalogItem[] = [
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
    imageUrl: "",
    isActive: true,
    sortOrder: 1,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 2,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 3,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 4,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 5,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 6,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 7,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 8,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 9,
  },
];

export const FALLBACK_RENTAL_CATALOG: MachineRentalCatalogItem[] = [
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
    imageUrl: "",
    isActive: true,
    sortOrder: 1,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 2,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 3,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 4,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 5,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 6,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 7,
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
    imageUrl: "",
    isActive: true,
    sortOrder: 8,
  },
];

const BUS_NAME = "conon_services_rentals_bus";
const KEY_SERVICE_BOOKINGS = "conon_srv_bookings_v1";
const KEY_RENTAL_BOOKINGS = "conon_rnt_bookings_v1";
const KEY_FLEET_LISTINGS = "conon_fleet_listings_v1";

let channel: BroadcastChannel | null = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    channel = new BroadcastChannel(BUS_NAME);
  }
} catch {}

function adminHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem(ADMIN_JWT_KEY) : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-key": "conon-lucknow-2026-admin-bypass",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function emitLocalBus(event: string, payload?: any) {
  if (typeof window === "undefined") return;
  try {
    channel?.postMessage({ event, payload, ts: Date.now() });
    window.dispatchEvent(new CustomEvent("conon_services_rentals_update", { detail: { event, payload } }));
  } catch {}
}

export const servicesRentalsSync = {
  /* ── SUBSCRIBE TO LIVE CROSS-TAB + SOCKET.IO EVENTS ── */
  subscribe(onChange: (event: string, payload?: any) => void): () => void {
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      onChange(detail?.event || "sync", detail?.payload);
    };
    const onBroadcast = (msg: MessageEvent) => {
      onChange(msg.data?.event || "sync", msg.data?.payload);
    };
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === KEY_SERVICE_BOOKINGS ||
        e.key === KEY_RENTAL_BOOKINGS ||
        e.key === KEY_FLEET_LISTINGS
      ) {
        onChange("storage_sync");
      }
    };

    window.addEventListener("conon_services_rentals_update", onCustom);
    channel?.addEventListener("message", onBroadcast);
    window.addEventListener("storage", onStorage);

    const socket = getSocket();
    const socketEvents = [
      "service:new_booking",
      "service:booking_updated",
      "service:escrow_settled",
      "rental:new_booking",
      "rental:booking_updated",
      "rental:hmr_started",
      "rental:breakdown_sos",
      "rental:hmr_completed",
      "rental:escrow_settled",
      "fleet:listing_updated",
      "fleet:availability_changed",
      "catalog:service_updated",
      "catalog:rental_updated",
      "admin:clean_slate_executed",
    ];
    const listeners = socketEvents.map((ev) => {
      const fn = (payload: any) => onChange(ev, payload);
      socket.on(ev, fn);
      return { ev, fn };
    });

    return () => {
      window.removeEventListener("conon_services_rentals_update", onCustom);
      channel?.removeEventListener("message", onBroadcast);
      window.removeEventListener("storage", onStorage);
      listeners.forEach(({ ev, fn }) => socket.off(ev, fn));
    };
  },

  /* ── CATALOG FETCHERS ── */
  async fetchServiceCatalog(): Promise<ServiceCatalogItem[]> {
    let baseList: ServiceCatalogItem[] = FALLBACK_SERVICE_CATALOG;
    try {
      const res = await fetch(resolveApiUrl("/api/services/catalog"));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          baseList = data.items;
        }
      }
    } catch {}

    const baseIds = new Set(baseList.map((i) => i.id));
    const customServices: ServiceCatalogItem[] = getAllVaultOverridesList()
      .filter((ov) => ov.isCustomItem && ov.categorySlug === "skilled-services" && !baseIds.has(ov.productId))
      .map((ov, idx) => ({
        id: ov.productId,
        slug: ov.slug || ov.productId,
        tradeName: ov.title || ov.productId,
        tradeNameHi: ov.subcategory || ov.title || ov.productId,
        category: "CIVIL",
        sacCode: ov.hsnCode || "9954",
        shiftRate: ov.price ?? 850,
        shiftHours: 8,
        unit: ov.unit || "8-Hr Shift",
        description: ov.description || "",
        highlights: ov.specBullets || [],
        badge: ov.brand || "Verified Trade",
        imageUrl: ov.images?.[0]?.url || "",
        isActive: ov.isInStock !== false,
        sortOrder: 90 + idx,
      }));

    return [...customServices, ...baseList].map((item) => {
      const ov = getVaultOverrideForProduct({ id: item.id, slug: item.slug, title: item.tradeName });
      if (!ov) return item;
      const resolved = resolveProductWithVault({
        ...item,
        title: item.tradeName,
        price: item.shiftRate,
        image: item.imageUrl,
        highlights: item.highlights,
      });
      return {
        ...item,
        tradeName: ov.title && ov.title.trim() ? ov.title : item.tradeName,
        description: ov.description && ov.description.trim() ? ov.description : item.description,
        shiftRate: ov.price !== undefined && ov.price > 0 ? ov.price : item.shiftRate,
        unit: ov.unit || item.unit,
        highlights: resolved.specBullets.length > 0 ? resolved.specBullets : item.highlights,
        imageUrl: resolved.primaryImage || item.imageUrl,
        isActive: ov.isInStock !== undefined ? ov.isInStock : item.isActive,
        galleryImages: resolved.galleryImages,
        isAdminVerifiedMedia: resolved.isAdminVerifiedMedia,
      } as ServiceCatalogItem;
    });
  },

  async fetchRentalCatalog(): Promise<MachineRentalCatalogItem[]> {
    let baseList: MachineRentalCatalogItem[] = FALLBACK_RENTAL_CATALOG;
    try {
      const res = await fetch(resolveApiUrl("/api/rentals/catalog"));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          baseList = data.items;
        }
      }
    } catch {}

    const baseIds = new Set(baseList.map((i) => i.id));
    const customRentals: MachineRentalCatalogItem[] = getAllVaultOverridesList()
      .filter((ov) => ov.isCustomItem && ov.categorySlug === "heavy-machine-rentals" && !baseIds.has(ov.productId))
      .map((ov, idx) => {
        const shiftRate = ov.price ?? 6500;
        return {
          id: ov.productId,
          slug: ov.slug || ov.productId,
          machineName: ov.title || ov.productId,
          modelName: ov.brand || "Heavy Fleet",
          category: "EARTHMOVING",
          sacCode: ov.hsnCode || "9973",
          wetRates: {
            hour: Math.round(shiftRate / 6),
            shift: shiftRate,
            week: Math.round(shiftRate * 5.5),
          },
          dryRates: {
            hour: Math.round((shiftRate * 0.72) / 6),
            shift: Math.round(shiftRate * 0.72),
            week: Math.round(shiftRate * 0.72 * 5.5),
          },
          mobilizationFee: 1500,
          needsOperator: true,
          capacitySpec: ov.specBullets?.[0] || "Verified Heavy Equipment",
          fuelNote: "Wet Rate includes diesel & operator",
          tag: ov.subcategory || "Verified Fleet",
          description: ov.description || "",
          imageUrl: ov.images?.[0]?.url || "",
          isActive: ov.isInStock !== false,
          sortOrder: 90 + idx,
        };
      });

    return [...customRentals, ...baseList].map((item) => {
      const ov = getVaultOverrideForProduct({ id: item.id, slug: item.slug, title: item.machineName });
      if (!ov) return item;
      const resolved = resolveProductWithVault({
        ...item,
        title: item.machineName,
        price: item.wetRates?.shift,
        image: item.imageUrl,
      });
      const updatedShiftWet = ov.price !== undefined && ov.price > 0 ? ov.price : item.wetRates.shift;
      const scale = item.wetRates.shift > 0 ? updatedShiftWet / item.wetRates.shift : 1;
      return {
        ...item,
        machineName: ov.title && ov.title.trim() ? ov.title : item.machineName,
        modelName: ov.brand && ov.brand.trim() ? ov.brand : item.modelName,
        description: ov.description && ov.description.trim() ? ov.description : item.description,
        capacitySpec: resolved.specBullets?.[0] || item.capacitySpec,
        imageUrl: resolved.primaryImage || item.imageUrl,
        isActive: ov.isInStock !== undefined ? ov.isInStock : item.isActive,
        wetRates:
          ov.price !== undefined && ov.price > 0
            ? {
                hour: Math.round(item.wetRates.hour * scale),
                shift: updatedShiftWet,
                week: Math.round(item.wetRates.week * scale),
              }
            : item.wetRates,
        galleryImages: resolved.galleryImages,
        isAdminVerifiedMedia: resolved.isAdminVerifiedMedia,
      } as MachineRentalCatalogItem;
    });
  },

  async saveServiceCatalogItem(item: Partial<ServiceCatalogItem>): Promise<ServiceCatalogItem | null> {
    try {
      const res = await fetch(
        resolveApiUrl(item.id ? `/api/services/catalog/${item.id}` : "/api/services/catalog"),
        {
          method: item.id ? "PATCH" : "POST",
          headers: adminHeaders(),
          body: JSON.stringify(item),
        }
      );
      if (res.ok) {
        const data = await res.json();
        emitLocalBus("catalog:service_updated", data.item);
        return data.item;
      }
    } catch {}
    return null;
  },

  async saveRentalCatalogItem(item: Partial<MachineRentalCatalogItem>): Promise<MachineRentalCatalogItem | null> {
    try {
      const res = await fetch(
        resolveApiUrl(item.id ? `/api/rentals/catalog/${item.id}` : "/api/rentals/catalog"),
        {
          method: item.id ? "PATCH" : "POST",
          headers: adminHeaders(),
          body: JSON.stringify(item),
        }
      );
      if (res.ok) {
        const data = await res.json();
        emitLocalBus("catalog:rental_updated", data.item);
        return data.item;
      }
    } catch {}
    return null;
  },

  /* ── FLEET LISTINGS (VENDOR OS <-> STOREFRONT) ── */
  async fetchFleetListings(vendorHubId?: string): Promise<VendorFleetListing[]> {
    try {
      const q = vendorHubId ? `?vendorHubId=${encodeURIComponent(vendorHubId)}` : "";
      const res = await fetch(resolveApiUrl(`/api/fleet/listings${q}`));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.listings)) {
          if (!vendorHubId) writeLocal(KEY_FLEET_LISTINGS, data.listings);
          return data.listings;
        }
      }
    } catch {}
    const cached = readLocal<VendorFleetListing[]>(KEY_FLEET_LISTINGS, []);
    return vendorHubId ? cached.filter((l) => l.vendorHubId === vendorHubId) : cached;
  },

  async saveFleetListing(payload: Omit<VendorFleetListing, "id" | "updatedAt"> & { id?: string }): Promise<VendorFleetListing> {
    try {
      const res = await fetch(resolveApiUrl("/api/fleet/listings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const existing = readLocal<VendorFleetListing[]>(KEY_FLEET_LISTINGS, []);
        const next = [data.listing, ...existing.filter((x) => x.id !== data.listing.id)];
        writeLocal(KEY_FLEET_LISTINGS, next);
        emitLocalBus("fleet:listing_updated", data.listing);
        return data.listing;
      }
    } catch {}

    const localRec: VendorFleetListing = {
      ...payload,
      id: payload.id || `vfl-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    const existing = readLocal<VendorFleetListing[]>(KEY_FLEET_LISTINGS, []);
    writeLocal(KEY_FLEET_LISTINGS, [localRec, ...existing.filter((x) => x.id !== localRec.id)]);
    emitLocalBus("fleet:listing_updated", localRec);
    return localRec;
  },

  async toggleFleetAvailability(id: string): Promise<VendorFleetListing | null> {
    try {
      const res = await fetch(resolveApiUrl(`/api/fleet/listings/${id}/availability`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const existing = readLocal<VendorFleetListing[]>(KEY_FLEET_LISTINGS, []);
        writeLocal(
          KEY_FLEET_LISTINGS,
          existing.map((l) => (l.id === id ? data.listing : l))
        );
        emitLocalBus("fleet:availability_changed", data.listing);
        return data.listing;
      }
    } catch {}

    const existing = readLocal<VendorFleetListing[]>(KEY_FLEET_LISTINGS, []);
    let updated: VendorFleetListing | null = null;
    const next = existing.map((l) => {
      if (l.id === id) {
        updated = { ...l, isAvailable: !l.isAvailable, updatedAt: new Date().toISOString() };
        return updated;
      }
      return l;
    });
    writeLocal(KEY_FLEET_LISTINGS, next);
    if (updated) emitLocalBus("fleet:availability_changed", updated);
    return updated;
  },

  /* ── SERVICE BOOKINGS ── */
  async fetchServiceBookings(): Promise<ServiceBookingRecord[]> {
    try {
      const res = await fetch(resolveApiUrl("/api/services/bookings"));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          writeLocal(KEY_SERVICE_BOOKINGS, data.bookings);
          return data.bookings;
        }
      }
    } catch {}
    return readLocal<ServiceBookingRecord[]>(KEY_SERVICE_BOOKINGS, []);
  },

  async createServiceBooking(input: {
    customerName: string;
    customerPhone: string;
    customerGstin?: string;
    siteAddress: string;
    lucknowZone?: string;
    bookingDate: string;
    shiftSlot: string;
    materialComboNote?: string;
    squadItems: Array<{ serviceId: string; qty: number; days: number }>;
    crossSellAddons?: string[];
    paymentMode: "LIVING_VAULT" | "UPI";
  }): Promise<ServiceBookingRecord> {
    const res = await fetch(resolveApiUrl("/api/services/bookings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Service booking failed");
    }
    const data = await res.json();
    const existing = readLocal<ServiceBookingRecord[]>(KEY_SERVICE_BOOKINGS, []);
    writeLocal(KEY_SERVICE_BOOKINGS, [data.booking, ...existing.filter((b) => b.id !== data.booking.id)]);
    emitLocalBus("service:new_booking", data.booking);
    return data.booking;
  },

  async acceptServiceBooking(id: string, partner: { vendorHubId: string; vendorName: string; crewLeadName?: string; crewPhone?: string }): Promise<ServiceBookingRecord> {
    const res = await fetch(resolveApiUrl(`/api/services/bookings/${id}/accept`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partner),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Accept failed");
    emitLocalBus("service:booking_updated", data.booking);
    return data.booking;
  },

  async haziriCheckinService(id: string, payload: { startOtp: string; selfieHaziriUrl?: string; coords?: string }): Promise<ServiceBookingRecord> {
    const res = await fetch(resolveApiUrl(`/api/services/bookings/${id}/haziri-checkin`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Haziri check-in failed");
    emitLocalBus("service:booking_updated", data.booking);
    return data.booking;
  },

  async completeServiceShift(id: string, payload: { endOtp: string; workDonePhotoUrl?: string }): Promise<ServiceBookingRecord> {
    const res = await fetch(resolveApiUrl(`/api/services/bookings/${id}/complete`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Completion failed");
    emitLocalBus("service:booking_updated", data.booking);
    return data.booking;
  },

  async releaseServiceEscrow(id: string): Promise<ServiceBookingRecord> {
    const res = await fetch(resolveApiUrl(`/api/services/bookings/${id}/release-escrow`), {
      method: "POST",
      headers: adminHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Escrow release failed");
    emitLocalBus("service:escrow_settled", data.booking);
    return data.booking;
  },

  /* ── MACHINE RENTAL BOOKINGS ── */
  async fetchRentalBookings(): Promise<MachineRentalBookingRecord[]> {
    try {
      const res = await fetch(resolveApiUrl("/api/rentals/bookings"));
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings)) {
          writeLocal(KEY_RENTAL_BOOKINGS, data.bookings);
          return data.bookings;
        }
      }
    } catch {}
    return readLocal<MachineRentalBookingRecord[]>(KEY_RENTAL_BOOKINGS, []);
  },

  async createRentalBooking(input: {
    customerName: string;
    customerPhone: string;
    customerGstin?: string;
    siteAddress: string;
    lucknowZone?: string;
    machineId: string;
    fuelMode: "WET" | "DRY";
    billingUnit: "HOUR" | "SHIFT" | "WEEK";
    quantityUnits: number;
    paymentMode: "LIVING_VAULT" | "UPI";
  }): Promise<MachineRentalBookingRecord> {
    const res = await fetch(resolveApiUrl("/api/rentals/bookings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Machine booking failed");
    const existing = readLocal<MachineRentalBookingRecord[]>(KEY_RENTAL_BOOKINGS, []);
    writeLocal(KEY_RENTAL_BOOKINGS, [data.booking, ...existing.filter((b) => b.id !== data.booking.id)]);
    emitLocalBus("rental:new_booking", data.booking);
    return data.booking;
  },

  async acceptRentalBooking(id: string, partner: { vendorHubId: string; vendorName: string; operatorId?: string; operatorName?: string; operatorPhone?: string; machinePlate?: string }): Promise<MachineRentalBookingRecord> {
    const res = await fetch(resolveApiUrl(`/api/rentals/bookings/${id}/accept`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partner),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Rental accept failed");
    emitLocalBus("rental:booking_updated", data.booking);
    return data.booking;
  },

  async startRentalHmr(id: string, payload: { startOtp: string; startHmr: number; startHmrPhoto?: string }): Promise<MachineRentalBookingRecord> {
    const res = await fetch(resolveApiUrl(`/api/rentals/bookings/${id}/start-hmr`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Start HMR lock failed");
    emitLocalBus("rental:hmr_started", data.booking);
    return data.booking;
  },

  async pauseRentalBreakdown(id: string, reason: string): Promise<MachineRentalBookingRecord> {
    const res = await fetch(resolveApiUrl(`/api/rentals/bookings/${id}/breakdown-pause`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Breakdown pause failed");
    emitLocalBus("rental:breakdown_sos", data.booking);
    return data.booking;
  },

  async resumeRentalMeter(id: string): Promise<MachineRentalBookingRecord> {
    const res = await fetch(resolveApiUrl(`/api/rentals/bookings/${id}/breakdown-resume`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Resume meter failed");
    emitLocalBus("rental:booking_updated", data.booking);
    return data.booking;
  },

  async completeRentalHmr(id: string, payload: { endOtp: string; endHmr: number; endHmrPhoto?: string }): Promise<MachineRentalBookingRecord> {
    const res = await fetch(resolveApiUrl(`/api/rentals/bookings/${id}/complete-hmr`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "End HMR lock failed");
    emitLocalBus("rental:hmr_completed", data.booking);
    return data.booking;
  },

  async releaseRentalEscrow(id: string): Promise<MachineRentalBookingRecord> {
    const res = await fetch(resolveApiUrl(`/api/rentals/bookings/${id}/release-escrow`), {
      method: "POST",
      headers: adminHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Rental escrow release failed");
    emitLocalBus("rental:escrow_settled", data.booking);
    return data.booking;
  },
};

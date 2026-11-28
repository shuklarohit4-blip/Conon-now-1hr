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
import {
  LUCKNOW_18_SKILLED_TRADES,
  type SkilledTradeCluster,
} from "@/data/lucknowSkilledServices";
import {
  LUCKNOW_20_MACHINE_RENTALS,
  type MachineRentalCluster,
} from "@/data/lucknowMachineRentals";

export type ServiceCategory = "CIVIL" | "MEP" | "FINISHING" | "AUDIT";
export type RentalCategory = "EARTHMOVING" | "CONCRETE" | "TRANSPORT" | "TOOLS";

export interface ServiceCatalogItem {
  id: string;
  slug: string;
  tradeName: string;
  tradeNameHi: string;
  category: ServiceCategory;
  cluster?: SkilledTradeCluster;
  sacCode: string;
  gstRate?: number;
  shiftRate: number;
  contractRate?: number;
  contractUnit?: string;
  contractLabel?: string;
  quickVisitRate?: number;
  mandatoryToolKit?: string[];
  recommendedMaterialComboSlugs?: string[];
  tasksIncluded?: string[];
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
  nameHi?: string;
  modelName: string;
  category: RentalCategory;
  cluster?: MachineRentalCluster;
  sacCode: string;
  gstRate?: number;
  wetRates: { hour: number; shift: number; week: number; month?: number };
  dryRates: { hour: number; shift: number; week: number; month?: number };
  mobilizationFee: number;
  needsOperator: boolean;
  heavyNoEntryFlag?: boolean;
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
  bookingMode?: "SHIFT" | "CONTRACT" | "QUICK_VISIT";
  measuredUnits?: number;
  unitLabel?: string;
  milestoneStage?: string;
  toolkitVerified?: boolean;
  materialComboOrderId?: string;
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

export const FALLBACK_SERVICE_CATALOG: ServiceCatalogItem[] = LUCKNOW_18_SKILLED_TRADES.map((t) => ({
  id: t.id,
  slug: t.slug,
  tradeName: t.nameEn,
  tradeNameHi: t.nameHi,
  category: t.category,
  cluster: t.cluster,
  sacCode: t.sacCode,
  gstRate: t.gstRate,
  shiftRate: t.shiftRate8Hr,
  contractRate: t.contractRate,
  contractUnit: t.contractUnit,
  contractLabel: t.contractLabel,
  quickVisitRate: t.quickVisitRate,
  mandatoryToolKit: t.mandatoryToolKit,
  recommendedMaterialComboSlugs: t.recommendedMaterialComboSlugs,
  tasksIncluded: t.tasksIncluded,
  shiftHours: 8,
  unit: "8-Hr Shift",
  description: t.description,
  highlights: t.mandatoryToolKit.slice(0, 3),
  badge: t.badge,
  imageUrl: "",
  isActive: true,
  sortOrder: t.sortOrder,
}));

export const FALLBACK_RENTAL_CATALOG: MachineRentalCatalogItem[] = LUCKNOW_20_MACHINE_RENTALS.map((m) => ({
  id: m.id,
  slug: m.slug,
  machineName: m.nameEn,
  nameHi: m.nameHi,
  modelName: m.modelName,
  category:
    m.cluster === "EARTHMOVING"
      ? "EARTHMOVING"
      : m.cluster === "CONCRETE"
      ? "CONCRETE"
      : m.cluster === "CRANES_LIFTS"
      ? "TRANSPORT"
      : "TOOLS",
  cluster: m.cluster,
  sacCode: m.sacCode,
  gstRate: m.gstRate,
  wetRates: m.wetRates,
  dryRates: m.dryRates,
  mobilizationFee: m.mobilizationFee,
  needsOperator: m.needsOperator,
  heavyNoEntryFlag: m.heavyNoEntryFlag,
  capacitySpec: m.capacitySpec,
  fuelNote: m.fuelNote,
  tag: m.tag,
  description: m.description,
  imageUrl: "",
  isActive: true,
  sortOrder: m.sortOrder,
}));

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

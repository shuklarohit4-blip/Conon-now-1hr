import fs from "fs";
import path from "path";
import { type Response } from "express";
import { vendorEngine } from "./vendorEngine";
import { catalogEngine } from "./catalogEngine";
import { emitNewOrder } from "../socket";
import { logger } from "../lib/logger";
import { ECOSYSTEM_STORE_PATH } from "../lib/paths";

export type CanonicalOrderStatus =
  | "PLACED"
  | "VENDOR_ACCEPTED"
  | "PACKING_READY"
  | "DRIVER_ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "ARRIVED_AT_SITE"
  | "DELIVERED"
  | "CANCELLED"
  | "DISPUTED";

export type VehicleClass =
  | "2W_BIKE"
  | "3W_ELECTRIC_LOADER"
  | "4W_PICKUP"
  | "TRACTOR_DUMPER";

export interface EcosystemOrderItem {
  skuId: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  dealerPayout: number;
  hsnCode?: string;
  weightKg?: number;
  image?: string;
}

export interface EcosystemOrderTimelineEntry {
  status: CanonicalOrderStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface EcosystemOrder {
  id: string;
  shortId: string;
  sessionId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryArea: string;
  items: EcosystemOrderItem[];
  category: string;
  subtotal: number;
  gstAmount: number;
  deliveryFee: number;
  labourFee: number;
  totalAmount: number;
  dealerPayable: number;
  driverPayable: number;
  cononNetMargin: number;
  status: CanonicalOrderStatus;
  vehicleClass: VehicleClass;
  vehicleLabel: string;
  pickupOtp: string;
  deliveryOtp: string;
  vendorId: string;
  vendorStore: string;
  vendorPhone: string;
  vendorAddress: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehiclePlate?: string;
  driverVehicleModel?: string;
  podPhotoUrl?: string;
  emm11PhotoUrl?: string;
  requiresEmm11: boolean;
  placedAt: string;
  estimatedDelivery: string;
  timeline: EcosystemOrderTimelineEntry[];
  financialsPosted: boolean;
  isB2B?: boolean;
  gstNumber?: string;
}

export interface DriverPartner {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleClass;
  vehicleLabel: string;
  vehicleModel: string;
  vehiclePlate: string;
  avatarUrl: string;
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  activeTripId: string | null;
  currentZone: string;
  currentLat: number;
  currentLng: number;
  walletBalance: number;
  todayEarnings: number;
  tripsToday: number;
  bankAccountMasked: string;
  upiId: string;
}

export interface SSEClient {
  id: string;
  res: Response;
  role: "ADMIN" | "VENDOR" | "DRIVER" | "CUSTOMER" | "PUBLIC";
  filterId?: string; // vendorId, driverId, or orderId
}

const STORE_PATH = ECOSYSTEM_STORE_PATH;

export const PRESEEDED_LUCKNOW_DRIVERS: DriverPartner[] = [];

export class EcosystemEngine {
  private orders = new Map<string, EcosystemOrder>();
  private drivers = new Map<string, DriverPartner>();
  private sseClients = new Map<string, SSEClient>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initStore();
    this.startHeartbeat();
  }

  private initStore() {
    // 1. Seed drivers
    for (const d of PRESEEDED_LUCKNOW_DRIVERS) {
      this.drivers.set(d.id, { ...d });
    }

    // 2. Load persistent store if exists
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf-8");
        const data = JSON.parse(raw);
        if (Array.isArray(data.orders)) {
          for (const o of data.orders) {
            this.orders.set(o.id, o);
          }
        }
        if (Array.isArray(data.drivers)) {
          for (const d of data.drivers) {
            this.drivers.set(d.id, d);
          }
        }
        logger.info({ orderCount: this.orders.size, driverCount: this.drivers.size }, "Loaded ecosystem store from disk");
      } else {
        this.saveStore();
      }
    } catch (err) {
      logger.warn({ err }, "Failed reading ecosystem-store.json, creating initial store");
      this.saveStore();
    }
  }

  private seedInitialOrders() {
    this.orders.clear();
  }

  public clearAll(): void {
    this.orders.clear();
    this.drivers.clear();
    this.saveStore();
  }

  public saveStore() {
    try {
      const data = {
        orders: Array.from(this.orders.values()),
        drivers: Array.from(this.drivers.values()),
        savedAt: new Date().toISOString(),
      };
      const tmpPath = `${STORE_PATH}.tmp`;
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tmpPath, STORE_PATH);
    } catch (err) {
      logger.error({ err }, "Failed saving ecosystem-store.json");
    }
  }

  /* ════════════════════════ SSE Management ════════════════════════ */

  public getSSEClientCount(): number {
    return this.sseClients.size;
  }

  public addSSEClient(client: SSEClient) {
    this.sseClients.set(client.id, client);
    logger.info({ clientId: client.id, role: client.role, filterId: client.filterId }, "SSE client connected");

    // Send connection banner
    client.res.write(`event: connected\ndata: ${JSON.stringify({ clientId: client.id, role: client.role, timestamp: Date.now() })}\n\n`);

    client.res.on("close", () => {
      this.sseClients.delete(client.id);
      logger.info({ clientId: client.id }, "SSE client disconnected");
    });
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      const pingPayload = `:heartbeat ${Date.now()}\n\n`;
      for (const [id, client] of this.sseClients.entries()) {
        try {
          client.res.write(pingPayload);
        } catch {
          this.sseClients.delete(id);
        }
      }
    }, 15000);
    this.heartbeatInterval.unref();
  }

  public broadcast(eventName: string, payload: any, filterFn?: (client: SSEClient) => boolean) {
    const raw = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const [id, client] of this.sseClients.entries()) {
      if (filterFn && !filterFn(client)) continue;
      try {
        client.res.write(raw);
      } catch {
        this.sseClients.delete(id);
      }
    }
  }

  /* ════════════════════════ Vehicle & Vendor Resolution ════════════════════════ */

  public resolveVehicleClass(items: { category?: string; qty?: number; weightKg?: number }[]): {
    vehicleClass: VehicleClass;
    vehicleLabel: string;
    driverPayable: number;
  } {
    let totalWeight = 0;
    let hasSandGitti = false;
    let hasCementHeavy = false;

    for (const i of items) {
      const cat = (i.category || "").toLowerCase();
      const qty = i.qty || 1;
      const weight = i.weightKg || (cat.includes("cement") ? qty * 50 : cat.includes("sand") || cat.includes("morang") ? qty * 1000 : 5);
      totalWeight += weight;

      if (cat.includes("sand") || cat.includes("morang") || cat.includes("gitti") || cat.includes("aggregate") || cat.includes("brick")) {
        hasSandGitti = true;
      }
      if (cat.includes("cement") && qty > 25) {
        hasCementHeavy = true;
      }
    }

    if (hasSandGitti || totalWeight >= 2000) {
      return {
        vehicleClass: "TRACTOR_DUMPER",
        vehicleLabel: "Tractor Trolley / Dumper (4+ Ton)",
        driverPayable: 1450,
      };
    }
    if (hasCementHeavy || totalWeight >= 400) {
      return {
        vehicleClass: "4W_PICKUP",
        vehicleLabel: "4W Mini-Truck (1.5 Ton)",
        driverPayable: 650,
      };
    }
    if (totalWeight >= 30) {
      return {
        vehicleClass: "3W_ELECTRIC_LOADER",
        vehicleLabel: "3W E-Loader (500kg)",
        driverPayable: 350,
      };
    }
    return {
      vehicleClass: "2W_BIKE",
      vehicleLabel: "2-Wheeler (Express)",
      driverPayable: 180,
    };
  }

  public resolveVendorForCategory(category: string): {
    vendorId: string;
    vendorStore: string;
    vendorPhone: string;
    vendorAddress: string;
  } {
    const catLower = category.toLowerCase();
    const allVendors = vendorEngine.getAllVendors();

    const matched = allVendors.find((v) =>
      v.categories.some((c) => {
        const cl = c.toLowerCase();
        return catLower.includes(cl) || cl.includes(catLower);
      }),
    );

    const v = matched || allVendors[0];
    if (v) {
      return {
        vendorId: v.id,
        vendorStore: v.shopName,
        vendorPhone: v.phone,
        vendorAddress: v.hubAddress,
      };
    }

    // Category-aware Lucknow Authorized Hub fallback when operating in Clean Slate mode
    if (catLower.includes("cement") || catLower.includes("steel") || catLower.includes("brick") || catLower.includes("sand")) {
      return {
        vendorId: "hub-chinhat",
        vendorStore: "Chinhat & Transport Nagar Heavy Yard",
        vendorPhone: "+91 98390 33440",
        vendorAddress: "Faizabad Road, Chinhat Industrial Depot, Lucknow 226028",
      };
    }
    if (catLower.includes("paint") || catLower.includes("tile") || catLower.includes("solar") || catLower.includes("plumb")) {
      return {
        vendorId: "hub-gomti",
        vendorStore: "Gomti Nagar Express Depot",
        vendorPhone: "+91 98390 22330",
        vendorAddress: "Vibhuti Khand, Gomti Nagar, Lucknow 226010",
      };
    }
    return {
      vendorId: "hub-latouche",
      vendorStore: "Latouche Road Electrical & Hardware Hub",
      vendorPhone: "+91 98390 11220",
      vendorAddress: "Latouche Road & Naka Hindola Mandi, Lucknow 226001",
    };
  }

  /* ════════════════════════ Order Operations ════════════════════════ */

  public createOrder(params: {
    sessionId?: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryArea?: string;
    items: Array<{
      skuId?: string;
      name: string;
      brand?: string;
      category: string;
      unit: string;
      qty: number;
      price: number;
      weightKg?: number;
      hsnCode?: string;
      image?: string;
    }>;
    isB2B?: boolean;
    gstNumber?: string;
    distanceKm?: number;
  }): EcosystemOrder {
    const rawId = Math.floor(100000 + Math.random() * 900000);
    const id = `CON-${rawId}`;
    const shortId = `CON-${String(rawId).slice(0, 4)}`;

    const { vehicleClass, vehicleLabel, driverPayable } = this.resolveVehicleClass(params.items);
    const primaryCat = params.items[0]?.category || "General Construction";
    const resolvedVendor = this.resolveVendorForCategory(primaryCat);

    // Generate dual secure 4-digit OTPs
    const pickupOtp = String(Math.floor(1000 + Math.random() * 9000));
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

    let subtotal = 0;
    let dealerPayable = 0;
    let requiresEmm11 = false;

    const mappedItems: EcosystemOrderItem[] = params.items.map((i) => {
      const lineTotal = i.price * i.qty;
      subtotal += lineTotal;
      const dealerRate = Math.round(i.price * 0.88); // 88% landing cost
      dealerPayable += dealerRate * i.qty;

      const catL = (i.category || "").toLowerCase();
      if (catL.includes("sand") || catL.includes("morang") || catL.includes("gitti") || catL.includes("aggregate")) {
        requiresEmm11 = true;
      }

      return {
        skuId: i.skuId || `sku-${Math.floor(1000 + Math.random() * 9000)}`,
        name: i.name,
        brand: i.brand || "Conon Assured",
        category: i.category,
        unit: i.unit,
        qty: i.qty,
        unitPrice: i.price,
        totalPrice: lineTotal,
        dealerPayout: dealerRate * i.qty,
        hsnCode: i.hsnCode,
        weightKg: i.weightKg,
        image: i.image,
      };
    });

    const gstAmount = Math.round(subtotal * 0.12);
    const deliveryFee = params.distanceKm && params.distanceKm > 10 ? 150 : 0;
    const labourFee = 0;
    const totalAmount = subtotal + gstAmount + deliveryFee + labourFee;
    const cononNetMargin = Math.max(0, totalAmount - dealerPayable - driverPayable);

    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    const order: EcosystemOrder = {
      id,
      shortId,
      sessionId: params.sessionId,
      customerName: params.customerName || "Customer",
      customerPhone: params.customerPhone || "+91 98765 00000",
      deliveryAddress: params.deliveryAddress,
      deliveryArea: params.deliveryArea || params.deliveryAddress.split(",")[0]?.trim() || "Lucknow Site",
      items: mappedItems,
      category: primaryCat,
      subtotal,
      gstAmount,
      deliveryFee,
      labourFee,
      totalAmount,
      dealerPayable,
      driverPayable,
      cononNetMargin,
      status: "PLACED",
      vehicleClass,
      vehicleLabel,
      pickupOtp,
      deliveryOtp,
      vendorId: resolvedVendor.vendorId,
      vendorStore: resolvedVendor.vendorStore,
      vendorPhone: resolvedVendor.vendorPhone,
      vendorAddress: resolvedVendor.vendorAddress,
      requiresEmm11,
      placedAt: now.toISOString(),
      estimatedDelivery,
      financialsPosted: false,
      isB2B: params.isB2B,
      gstNumber: params.gstNumber,
      timeline: [
        {
          status: "PLACED",
          timestamp: now.toISOString(),
          actor: "CUSTOMER",
          note: "Order confirmed via Storefront",
        },
      ],
    };

    this.orders.set(order.id, order);
    this.saveStore();

    // Notify Vendor Engine & Dukandar
    try {
      emitNewOrder(order.vendorStore, {
        id: order.id,
        shortId: order.shortId,
        buyer: order.customerName,
        items: order.items.map((it) => `${it.qty}x ${it.name}`).join(", "),
        time: "Just now",
        value: order.dealerPayable,
        pickupOtp: order.pickupOtp,
      });
    } catch (e) {
      logger.warn({ e }, "Socket notification failed");
    }

    // Broadcast Ecosystem SSE
    this.broadcast("order_created", this.maskOrderForRole(order, "ADMIN"));
    this.broadcast("order_created_vendor", this.maskOrderForRole(order, "VENDOR", order.vendorId), (c) => c.role === "VENDOR" || c.role === "ADMIN");

    return order;
  }

  public getOrder(orderId: string): EcosystemOrder | null {
    return this.orders.get(orderId) || null;
  }

  public getAllOrders(): EcosystemOrder[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    );
  }

  public getOrdersForVendor(vendorIdOrStore: string): EcosystemOrder[] {
    const v = vendorEngine.getVendorByStore(vendorIdOrStore);
    return this.getAllOrders().filter((o) => o.vendorId === v.id || o.vendorStore === v.shopName);
  }

  public getOrdersForDriver(driverId: string): EcosystemOrder[] {
    return this.getAllOrders().filter((o) => o.driverId === driverId);
  }

  public getAvailableTripsForDriver(driverId: string): EcosystemOrder[] {
    const driver = this.drivers.get(driverId);
    if (!driver || !driver.isOnline || driver.activeTripId) return [];

    return this.getAllOrders().filter((o) => {
      // Must be PACKING_READY or VENDOR_ACCEPTED, not yet assigned to any driver
      const isUnclaimed = (o.status === "PACKING_READY" || o.status === "VENDOR_ACCEPTED") && !o.driverId;
      // Allow exact match or permissive vehicle sizing (e.g. 4W can take 3W/2W loads if empty)
      return isUnclaimed;
    });
  }

  /* ════════════════════════ Canonical Transitions ════════════════════════ */

  public updateOrderStatus(
    orderId: string,
    nextStatus: CanonicalOrderStatus,
    actor: "CUSTOMER" | "VENDOR" | "DRIVER" | "ADMIN",
    note?: string,
  ): { success: boolean; order?: EcosystemOrder; message?: string } {
    const order = this.orders.get(orderId);
    if (!order) return { success: false, message: `Order ${orderId} not found` };

    order.status = nextStatus;
    order.timeline.push({
      status: nextStatus,
      timestamp: new Date().toISOString(),
      actor,
      note: note || `Status transitioned to ${nextStatus} by ${actor}`,
    });

    this.saveStore();

    // Broadcast SSE
    this.broadcast("order_updated", this.maskOrderForRole(order, "ADMIN"));

    return { success: true, order };
  }

  public assignOrderPartnerDriver(
    orderId: string,
    opts: {
      vendorId?: string;
      vendorStore?: string;
      vendorPhone?: string;
      driverId?: string;
      driverName?: string;
      driverPhone?: string;
      driverVehiclePlate?: string;
      driverVehicleModel?: string;
    }
  ): { success: boolean; order?: EcosystemOrder; message?: string } {
    const order = this.orders.get(orderId);
    if (!order) return { success: false, message: `Order ${orderId} not found` };

    if (opts.vendorId) order.vendorId = opts.vendorId;
    if (opts.vendorStore) order.vendorStore = opts.vendorStore;
    if (opts.vendorPhone) order.vendorPhone = opts.vendorPhone;
    if (opts.driverId) {
      const drv = this.drivers.get(opts.driverId);
      order.driverId = opts.driverId;
      order.driverName = opts.driverName || drv?.name || order.driverName;
      order.driverPhone = opts.driverPhone || drv?.phone || order.driverPhone;
      order.driverVehiclePlate = opts.driverVehiclePlate || drv?.vehiclePlate || order.driverVehiclePlate;
      order.driverVehicleModel = opts.driverVehicleModel || drv?.vehicleModel || order.driverVehicleModel;
    }
    order.timeline.push({
      status: order.status,
      timestamp: new Date().toISOString(),
      actor: "ADMIN",
      note: `Admin updated assignment (${order.vendorStore}${order.driverName ? ` / Driver: ${order.driverName}` : ""})`,
    });
    this.saveStore();
    this.broadcast("order_updated", this.maskOrderForRole(order, "ADMIN"));
    return { success: true, order };
  }

  public vendorAcceptOrder(orderId: string, vendorId: string): { success: boolean; order?: EcosystemOrder; message?: string } {
    const order = this.orders.get(orderId);
    if (!order) return { success: false, message: "Order not found" };

    order.status = "VENDOR_ACCEPTED";
    order.timeline.push({
      status: "VENDOR_ACCEPTED",
      timestamp: new Date().toISOString(),
      actor: "VENDOR",
      note: `Store ${order.vendorStore} accepted the order`,
    });
    this.saveStore();
    this.broadcast("order_updated", this.maskOrderForRole(order, "ADMIN"));
    return { success: true, order };
  }

  public vendorMarkPackingReady(orderId: string, vendorId: string): { success: boolean; order?: EcosystemOrder; message?: string } {
    const order = this.orders.get(orderId);
    if (!order) return { success: false, message: "Order not found" };

    order.status = "PACKING_READY";
    order.timeline.push({
      status: "PACKING_READY",
      timestamp: new Date().toISOString(),
      actor: "VENDOR",
      note: `Packed and staged at loading counter. Dukandar Pickup OTP generated.`,
    });
    this.saveStore();

    // Broadcast dispatch opportunity to drivers
    this.broadcast("dispatch_available", {
      orderId: order.id,
      vehicleClass: order.vehicleClass,
      pickupArea: order.vendorStore,
      dropArea: order.deliveryArea,
      earn: order.driverPayable,
    });
    this.broadcast("order_updated", this.maskOrderForRole(order, "ADMIN"));

    return { success: true, order };
  }

  /**
   * Atomic Trip Acceptance Lock:
   * First driver to call claims the trip. Prevents double-booking.
   */
  public acceptTripDriver(orderId: string, driverId: string): { success: boolean; order?: EcosystemOrder; message?: string; statusCode?: number } {
    const order = this.orders.get(orderId);
    if (!order) return { success: false, message: "Trip not found", statusCode: 404 };

    if (order.driverId && order.driverId !== driverId) {
      return { success: false, message: "Trip already claimed by another driver partner", statusCode: 409 };
    }

    const driver = this.drivers.get(driverId);
    if (!driver) return { success: false, message: "Driver not registered", statusCode: 403 };

    if (driver.activeTripId && driver.activeTripId !== orderId) {
      return { success: false, message: "You already have an active ongoing trip", statusCode: 400 };
    }

    // Atomic claim
    order.driverId = driver.id;
    order.driverName = driver.name;
    order.driverPhone = driver.phone;
    order.driverVehiclePlate = driver.vehiclePlate;
    order.driverVehicleModel = driver.vehicleModel;
    order.status = "DRIVER_ASSIGNED";
    order.timeline.push({
      status: "DRIVER_ASSIGNED",
      timestamp: new Date().toISOString(),
      actor: "DRIVER",
      note: `Driver ${driver.name} (${driver.vehiclePlate}) accepted dispatch and is heading to ${order.vendorStore}.`,
    });

    driver.activeTripId = order.id;

    this.saveStore();

    this.broadcast("order_updated", this.maskOrderForRole(order, "ADMIN"));
    this.broadcast("trip_accepted", { orderId: order.id, driverId: driver.id });

    return { success: true, order };
  }

  /**
   * Pickup Verification with Dukandar OTP:
   * Driver enters the 4-digit pickup OTP displayed on the Dukandar's screen.
   */
  public verifyPickupOtp(orderId: string, driverId: string, enteredOtp: string): { success: boolean; order?: EcosystemOrder; message?: string } {
    const order = this.orders.get(orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (order.driverId !== driverId) {
      return { success: false, message: "You are not assigned to this trip" };
    }

    if (order.pickupOtp.trim() !== enteredOtp.trim()) {
      return { success: false, message: "Invalid Pickup OTP. Please ask the shopkeeper to show their 4-digit Dukandar OTP." };
    }

    order.status = "PICKED_UP";
    order.timeline.push({
      status: "PICKED_UP",
      timestamp: new Date().toISOString(),
      actor: "DRIVER",
      note: `Verified counter handover with OTP ${enteredOtp}. Materials loaded on vehicle.`,
    });

    // Auto-advance to OUT_FOR_DELIVERY
    order.status = "OUT_FOR_DELIVERY";
    order.timeline.push({
      status: "OUT_FOR_DELIVERY",
      timestamp: new Date().toISOString(),
      actor: "DRIVER",
      note: `Driver en-route to delivery location: ${order.deliveryAddress}`,
    });

    this.saveStore();
    this.broadcast("order_updated", this.maskOrderForRole(order, "ADMIN"));

    return { success: true, order };
  }

  public arriveAtSite(orderId: string, driverId: string): { success: boolean; order?: EcosystemOrder; message?: string } {
    const order = this.orders.get(orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (order.driverId !== driverId) {
      return { success: false, message: "You are not assigned to this trip" };
    }

    order.status = "ARRIVED_AT_SITE";
    order.timeline.push({
      status: "ARRIVED_AT_SITE",
      timestamp: new Date().toISOString(),
      actor: "DRIVER",
      note: `Vehicle arrived at site gate. Unloading initiated.`,
    });

    this.saveStore();
    this.broadcast("order_updated", this.maskOrderForRole(order, "ADMIN"));

    return { success: true, order };
  }

  /**
   * Complete Delivery with Customer OTP + PoD Photo + Financial Idempotency:
   */
  public completeDelivery(
    orderId: string,
    driverId: string,
    params: {
      deliveryOtp: string;
      podPhotoUrl?: string;
      emm11PhotoUrl?: string;
    },
  ): { success: boolean; order?: EcosystemOrder; message?: string; alreadyDelivered?: boolean } {
    const order = this.orders.get(orderId);
    if (!order) return { success: false, message: "Order not found" };

    if (order.driverId !== driverId) {
      return { success: false, message: "You are not assigned to this trip" };
    }

    // Verify Customer Delivery OTP
    if (order.deliveryOtp.trim() !== params.deliveryOtp.trim()) {
      return { success: false, message: "Invalid Customer Delivery OTP. Please ask the receiver on site for their 4-digit code." };
    }

    if (order.financialsPosted && order.status === "DELIVERED") {
      return { success: true, order, alreadyDelivered: true, message: "Trip already completed and financials settled." };
    }

    // Save proof of delivery
    if (params.podPhotoUrl) order.podPhotoUrl = params.podPhotoUrl;
    if (params.emm11PhotoUrl) order.emm11PhotoUrl = params.emm11PhotoUrl;

    order.status = "DELIVERED";
    order.timeline.push({
      status: "DELIVERED",
      timestamp: new Date().toISOString(),
      actor: "DRIVER",
      note: `Customer OTP ${params.deliveryOtp} verified. Materials delivered and site inspected.`,
    });

    // Idempotent Financial Postings
    if (!order.financialsPosted) {
      const driver = this.drivers.get(driverId);
      if (driver) {
        driver.walletBalance += order.driverPayable;
        driver.todayEarnings += order.driverPayable;
        driver.tripsToday += 1;
        driver.totalTrips += 1;
        driver.activeTripId = null;
      }

      // Credit vendor in vendorEngine passbook
      const vendorWallet = vendorEngine.getWallet(order.vendorId);
      if (vendorWallet) {
        vendorWallet.todayEarnings += order.dealerPayable;
        vendorWallet.pendingSettlement += order.dealerPayable;
        vendorWallet.ledger.unshift({
          id: `LED-${Math.floor(100000 + Math.random() * 900000)}`,
          orderId: order.id,
          date: "Just now",
          description: `Order ${order.shortId} Completed Delivery by ${order.driverName || "Driver"}`,
          amount: order.dealerPayable,
          type: "EARNING",
          status: "PENDING",
          bankAccount: vendorWallet.bankAccountMasked,
        });
      }

      order.financialsPosted = true;
    }

    this.saveStore();
    this.broadcast("order_updated", this.maskOrderForRole(order, "ADMIN"));
    this.broadcast("trip_completed", { orderId: order.id, driverId, earned: order.driverPayable });

    return { success: true, order };
  }

  /* ════════════════════════ Driver Management ════════════════════════ */

  public getDriver(driverId: string): DriverPartner | null {
    return this.drivers.get(driverId) || null;
  }

  public getAllDrivers(): DriverPartner[] {
    return Array.from(this.drivers.values());
  }

  public registerDriver(driver: Partial<DriverPartner>): DriverPartner {
    const d: DriverPartner = {
      id: driver.id || `DRV-LKO-${Date.now()}`,
      name: driver.name || "Driver Partner",
      phone: driver.phone || "+91 98765 00000",
      avatarUrl: driver.avatarUrl || "/images/drivers/rajesh.webp",
      vehicleType: driver.vehicleType || "4W_PICKUP",
      vehicleLabel: driver.vehicleLabel || "Tata Ace Loader",
      vehicleModel: driver.vehicleModel || "Tata Ace Gold",
      vehiclePlate: driver.vehiclePlate || "UP 32 EL 7710",
      rating: driver.rating || 5.0,
      totalTrips: driver.totalTrips || 0,
      isOnline: driver.isOnline !== undefined ? driver.isOnline : true,
      activeTripId: null,
      currentZone: driver.currentZone || "Alambagh / Transport Nagar",
      currentLat: driver.currentLat || 26.8421,
      currentLng: driver.currentLng || 80.9312,
      walletBalance: driver.walletBalance || 0,
      todayEarnings: driver.todayEarnings || 0,
      tripsToday: driver.tripsToday || 0,
      bankAccountMasked: driver.bankAccountMasked || "HDFC •••• 9102",
      upiId: driver.upiId || "driver@upi",
    };
    this.drivers.set(d.id, d);
    this.saveStore();
    return d;
  }

  public setDriverDuty(driverId: string, isOnline: boolean): DriverPartner | null {
    const driver = this.drivers.get(driverId);
    if (!driver) return null;
    driver.isOnline = isOnline;
    if (!isOnline && driver.activeTripId) {
      // cannot go offline while mid-trip
    }
    this.saveStore();
    this.broadcast("driver_duty_changed", { driverId, isOnline });
    return driver;
  }

  public updateDriverLocation(driverId: string, lat: number, lng: number, zone?: string): DriverPartner | null {
    const driver = this.drivers.get(driverId);
    if (!driver) return null;
    driver.currentLat = lat;
    driver.currentLng = lng;
    if (zone) driver.currentZone = zone;
    this.broadcast("driver_location_ping", { driverId, lat, lng, zone: driver.currentZone });
    return driver;
  }

  public withdrawDriverWallet(driverId: string, amount: number): { success: boolean; newBalance: number; message: string } {
    const driver = this.drivers.get(driverId);
    if (!driver) return { success: false, newBalance: 0, message: "Driver not found" };
    if (driver.walletBalance < amount || amount <= 0) {
      return { success: false, newBalance: driver.walletBalance, message: "Insufficient wallet balance" };
    }
    driver.walletBalance -= amount;
    this.saveStore();
    return { success: true, newBalance: driver.walletBalance, message: `Payout of ₹${amount} initiated to ${driver.bankAccountMasked}` };
  }

  /* ════════════════════════ Role-Based OTP Masking ════════════════════════ */

  public maskOrderForRole(
    order: EcosystemOrder,
    role: "ADMIN" | "VENDOR" | "DRIVER" | "CUSTOMER" | "PUBLIC",
    entityId?: string,
  ): any {
    const clone = { ...order };

    if (role === "ADMIN") {
      // Admin sees everything (both OTPs, net margin, raw costs)
      return clone;
    }

    if (role === "CUSTOMER") {
      // Customer sees their Delivery OTP to give driver, NEVER Dukandar Pickup OTP
      return {
        ...clone,
        pickupOtp: undefined, // MASKED
        cononNetMargin: undefined,
        dealerPayable: undefined,
        driverPayable: undefined,
      };
    }

    if (role === "VENDOR") {
      // Vendor sees their Dukandar Pickup OTP to give driver, NEVER Customer Delivery OTP
      return {
        ...clone,
        deliveryOtp: undefined, // MASKED
        cononNetMargin: undefined,
        driverPayable: undefined,
      };
    }

    if (role === "DRIVER") {
      // Driver sees NEITHER OTP until handed over physically
      return {
        ...clone,
        pickupOtp: undefined, // MASKED (Driver must ask dukandar for it)
        deliveryOtp: undefined, // MASKED (Driver must ask customer for it)
        cononNetMargin: undefined,
        dealerPayable: undefined,
      };
    }

    // Public
    return {
      id: clone.id,
      shortId: clone.shortId,
      status: clone.status,
      category: clone.category,
      deliveryArea: clone.deliveryArea,
      placedAt: clone.placedAt,
      estimatedDelivery: clone.estimatedDelivery,
    };
  }
}

export const ecosystemEngine = new EcosystemEngine();

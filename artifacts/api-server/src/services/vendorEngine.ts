import fs from "fs";
import path from "path";
import { catalogEngine, type MasterCatalogSKU } from "./catalogEngine";
import { emitNewOrder } from "../socket";

export interface VendorProfile {
  id: string;
  shopCode: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  hubZone: string;
  hubAddress: string;
  gstin: string;
  categories: string[];
  isOpen: boolean;
  rating: number;
  slaScore: number;
  bankAccountMasked: string;
  upiId: string;
  operatingHours: string;
}

export interface VendorOrderItem {
  skuId: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  qty: number;
  customerPrice: number;
  dealerPayout: number;
  image?: string;
  batchGuardrail?: string;
}

export interface VendorRiderInfo {
  name: string;
  phone: string;
  vehicleType: "2W_BIKE" | "3W_ELECTRIC_LOADER" | "4W_PICKUP" | "TRACTOR_DUMPER";
  vehicleLabel: string;
  plateNumber: string;
  etaMins: number;
  distanceKm: number;
  avatarUrl?: string;
}

export interface VendorOrder {
  id: string;
  shortId: string;
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  deliveryAddress: string;
  placedAt: string;
  minsLeft: number;
  slaMins: number;
  status: "NEW_REQUEST" | "PACKING_READY" | "HANDED_OVER" | "DELIVERED" | "FLAGGED_SHORTAGE";
  items: VendorOrderItem[];
  totalDealerPayout: number;
  pickupOtp: string;
  rider?: VendorRiderInfo;
  vendorId: string;
  vendorStore: string;
  flaggedReason?: string;
}

export interface VendorPayoutLedgerRow {
  id: string;
  orderId?: string;
  date: string;
  description: string;
  amount: number;
  type: "EARNING" | "WITHDRAWAL" | "SETTLEMENT";
  status: "SETTLED" | "PENDING";
  utrNumber?: string;
  bankAccount: string;
}

export interface VendorWalletData {
  todayEarnings: number;
  pendingSettlement: number;
  totalSettledMonth: number;
  nextSettlementDate: string;
  bankAccountMasked: string;
  ledger: VendorPayoutLedgerRow[];
}

export const PRESEEDED_LUCKNOW_VENDORS: VendorProfile[] = [];

export class VendorEngine {
  private vendors = new Map<string, VendorProfile>();
  private orders = new Map<string, VendorOrder[]>();
  private wallets = new Map<string, VendorWalletData>();
  private activeStoreSession = new Map<string, string>(); // token -> vendorId

  constructor() {
    // Zero-Dummy Clean Slate: Starts 100% empty. Vendors are populated from real partner registrations & KYC.
  }

  public clearAll(): void {
    this.vendors.clear();
    this.orders.clear();
    this.wallets.clear();
    this.activeStoreSession.clear();
  }

  public registerVendor(vendor: Partial<VendorProfile>): VendorProfile {
    const v: VendorProfile = {
      id: vendor.id || `hub-${Date.now()}`,
      shopCode: vendor.shopCode || `HUB-${Date.now().toString().slice(-4)}`,
      shopName: vendor.shopName || "Partner Shop",
      ownerName: vendor.ownerName || "Owner",
      phone: vendor.phone || "+91 98765 43210",
      email: vendor.email || "partner@conon.in",
      hubZone: vendor.hubZone || "Latouche Road",
      hubAddress: vendor.hubAddress || "Latouche Road Hardware Market, Lucknow",
      gstin: vendor.gstin || "09AAECB1289R1Z4",
      categories: vendor.categories || ["CEMENT", "STEEL", "BRICKS", "PIPES"],
      isOpen: vendor.isOpen !== undefined ? vendor.isOpen : true,
      rating: vendor.rating || 5.0,
      slaScore: vendor.slaScore || 98,
      bankAccountMasked: vendor.bankAccountMasked || "HDFC •••• 0123",
      upiId: vendor.upiId || "partner@upi",
      operatingHours: vendor.operatingHours || "08:00 AM - 08:00 PM",
    };
    this.vendors.set(v.id, v);
    this.vendors.set(v.shopName.toLowerCase().trim(), v);
    return v;
  }

  public getVendorByStore(storeOrIdOrPhone: string): VendorProfile {
    const raw = (storeOrIdOrPhone || "").trim();
    const lower = raw.toLowerCase();

    // Direct lookup
    if (this.vendors.has(raw)) return this.vendors.get(raw)!;
    if (this.vendors.has(lower)) return this.vendors.get(lower)!;

    // Search existing registered vendors
    for (const v of this.vendors.values()) {
      if (
        v.id === raw ||
        v.shopCode.toLowerCase() === lower ||
        v.shopName.toLowerCase().includes(lower) ||
        lower.includes(v.shopName.toLowerCase()) ||
        v.phone === raw
      ) {
        return v;
      }
    }

    // Organic fallback profile with 0 starting revenue
    const fallback: VendorProfile = {
      id: raw.startsWith("CN-VND-") ? raw : `CN-VND-${Date.now().toString(36).toUpperCase()}`,
      shopName: raw || "New Partner Hub",
      shopCode: "HUB-ORG",
      ownerName: "Verified Partner",
      phone: raw.match(/^\d{10}$/) ? raw : "+91 90000 00000",
      email: "partner@conon.in",
      hubZone: "Lucknow Supply Corridor",
      hubAddress: "Lucknow, Uttar Pradesh",
      gstin: "09AAECB0000A1Z1",
      categories: ["CEMENT", "STEEL", "BRICKS", "PIPES"],
      isOpen: true,
      rating: 5.0,
      slaScore: 100,
      bankAccountMasked: "Verified Bank ••••",
      upiId: "partner@upi",
      operatingHours: "08:00 AM - 08:00 PM",
    };
    this.vendors.set(fallback.id, fallback);
    this.vendors.set(fallback.shopName.toLowerCase().trim(), fallback);
    return fallback;
  }

  public getVendorById(id: string): VendorProfile | undefined {
    return this.vendors.get(id);
  }

  public getAllVendors(): VendorProfile[] {
    return Array.from(new Set(this.vendors.values()));
  }

  public setStoreOpen(vendorId: string, isOpen: boolean): VendorProfile {
    const vendor = this.getVendorByStore(vendorId);
    vendor.isOpen = isOpen;
    this.vendors.set(vendor.id, vendor);
    this.vendors.set(vendor.shopName.toLowerCase().trim(), vendor);

    // Broadcast SSE to Admin & Drivers
    catalogEngine.broadcast("vendor_status_updated", {
      vendorId: vendor.id,
      shopCode: vendor.shopCode,
      shopName: vendor.shopName,
      isOpen: vendor.isOpen,
    });

    return vendor;
  }

  public getOrders(vendorId: string): VendorOrder[] {
    const v = this.getVendorByStore(vendorId);
    return this.orders.get(v.id) || [];
  }

  public acceptOrder(vendorId: string, orderId: string): VendorOrder | null {
    const v = this.getVendorByStore(vendorId);
    const list = this.orders.get(v.id) || [];
    const target = list.find(o => o.id === orderId || o.shortId === orderId);
    if (!target) return null;

    target.status = "PACKING_READY";
    if (!target.pickupOtp) {
      target.pickupOtp = String(Math.floor(1000 + Math.random() * 9000));
    }

    // Broadcast
    emitNewOrder(v.shopName, {
      id: target.id,
      shortId: target.shortId,
      status: "PACKING_READY",
      pickupOtp: target.pickupOtp,
    });
    catalogEngine.broadcast("order_accepted_by_vendor", {
      orderId: target.id,
      vendorStore: v.shopName,
      pickupOtp: target.pickupOtp,
    });

    return target;
  }

  public markOrderReadyForPickup(vendorId: string, orderId: string): VendorOrder | null {
    const v = this.getVendorByStore(vendorId);
    const list = this.orders.get(v.id) || [];
    const target = list.find(o => o.id === orderId || o.shortId === orderId);
    if (!target) return null;

    target.status = "HANDED_OVER";

    // Credit to vendor wallet
    const wallet = this.wallets.get(v.id);
    if (wallet) {
      wallet.todayEarnings += target.totalDealerPayout;
      wallet.pendingSettlement += target.totalDealerPayout;
      wallet.ledger.unshift({
        id: `LED-${Math.floor(100000 + Math.random() * 900000)}`,
        orderId: target.id,
        date: "Just now",
        description: `Order ${target.shortId} Handed Over to Rider (${target.rider?.name || "Rider"})`,
        amount: target.totalDealerPayout,
        type: "EARNING",
        status: "PENDING",
        bankAccount: v.bankAccountMasked,
      });
    }

    catalogEngine.broadcast("order_ready_for_rider", {
      orderId: target.id,
      vendorStore: v.shopName,
      rider: target.rider,
    });

    return target;
  }

  public flagShortage(vendorId: string, orderId: string, reason: string): VendorOrder | null {
    const v = this.getVendorByStore(vendorId);
    const list = this.orders.get(v.id) || [];
    const target = list.find(o => o.id === orderId || o.shortId === orderId);
    if (!target) return null;

    target.status = "FLAGGED_SHORTAGE";
    target.flaggedReason = reason;

    catalogEngine.broadcast("order_shortage_alert", {
      orderId: target.id,
      vendorStore: v.shopName,
      reason,
    });

    return target;
  }

  public createTestOrder(vendorId: string): VendorOrder {
    const v = this.getVendorByStore(vendorId);
    const list = this.orders.get(v.id) || [];

    // Pick 1-2 real SKUs from live catalog matching this vendor's categories
    const allSkus = catalogEngine.getLiveCatalog({ limit: 100 }).items;
    const matchingSkus = allSkus.filter(s =>
      v.categories.some(c => c.toLowerCase().includes(s.category.toLowerCase()) || s.category.toLowerCase().includes(c.toLowerCase()))
    );
    const selected = matchingSkus.length > 0 ? matchingSkus[0] : allSkus[0];

    const shortId = String(Math.floor(1000 + Math.random() * 9000));
    const fullId = `ORD-${shortId}`;
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const qty = Math.floor(1 + Math.random() * 4);
    const dealerRate = selected.dealerLandingCost || Math.round(selected.sellingPrice * 0.88);

    const newOrder: VendorOrder = {
      id: fullId,
      shortId,
      customerName: "Mohd. Aslam (Lucknow Metro Site)",
      customerPhone: "+91 97210 55432",
      deliveryArea: `${v.hubZone.split("(")[0].trim()} Express Corridor`,
      deliveryAddress: `Plot ${Math.floor(10 + Math.random() * 90)}, Sector B, Near Bypass`,
      placedAt: "Just now (Ringing)",
      minsLeft: 3,
      slaMins: 60,
      status: "NEW_REQUEST",
      items: [
        {
          skuId: selected.id,
          name: selected.name,
          brand: selected.brand,
          category: selected.category,
          unit: selected.packSize || selected.unit || "Unit",
          qty,
          customerPrice: selected.sellingPrice,
          dealerPayout: dealerRate,
          image: selected.imageUrl,
          batchGuardrail: selected.fitGuardrailBadge || "Verified Quality Depot Batch",
        },
      ],
      totalDealerPayout: dealerRate * qty,
      pickupOtp: otp,
      rider: {
        name: "Ravi Kumar",
        phone: "+91 94150 12044",
        vehicleType: "2W_BIKE",
        vehicleLabel: "2-Wheeler (60-Min Express)",
        plateNumber: "UP 32 BK 4012",
        etaMins: 5,
        distanceKm: 1.1,
      },
      vendorId: v.id,
      vendorStore: v.shopName,
    };

    list.unshift(newOrder);
    this.orders.set(v.id, list);

    // Emit live order via websocket and SSE
    emitNewOrder(v.shopName, {
      id: newOrder.id,
      shortId: newOrder.shortId,
      buyer: newOrder.customerName,
      items: `${newOrder.items[0].qty}x ${newOrder.items[0].name}`,
      time: "Just now",
      value: newOrder.totalDealerPayout,
    });

    catalogEngine.broadcast("new_vendor_order_placed", {
      orderId: newOrder.id,
      vendorStore: v.shopName,
      totalDealerPayout: newOrder.totalDealerPayout,
      itemsCount: newOrder.items.length,
    });

    return newOrder;
  }

  public getProductsForVendor(vendorId: string): MasterCatalogSKU[] {
    const v = this.getVendorByStore(vendorId);
    const all = catalogEngine.getLiveCatalog({ limit: 800 }).items;

    // Filter SKUs that match vendor's supplied categories
    const filtered = all.filter(item => {
      const itemCat = item.category.toLowerCase();
      const itemCatName = (item.categoryName || "").toLowerCase();
      return v.categories.some(c => {
        const cLower = c.toLowerCase();
        return (
          itemCat.includes(cLower) ||
          cLower.includes(itemCat) ||
          itemCatName.includes(cLower) ||
          cLower.includes(itemCatName)
        );
      });
    });

    return filtered.length > 0 ? filtered : all.slice(0, 30);
  }

  public updateProductStockOrPrice(
    vendorId: string,
    skuId: string,
    patch: { inStock?: boolean; dealerLandingCost?: number; price?: number }
  ): MasterCatalogSKU | null {
    const cost = patch.dealerLandingCost ?? patch.price;
    const updatePayload: any = {};
    if (patch.inStock !== undefined) updatePayload.inStock = patch.inStock;
    if (cost !== undefined) updatePayload.dealerLandingCost = cost;

    const updated = catalogEngine.updateSku(skuId, updatePayload);
    if (updated) {
      catalogEngine.broadcast("vendor_product_updated", {
        vendorId,
        skuId,
        inStock: updated.inStock,
        dealerLandingCost: updated.dealerLandingCost,
      });
    }
    return updated;
  }

  public getWallet(vendorId: string): VendorWalletData {
    const v = this.getVendorByStore(vendorId);
    const wallet = this.wallets.get(v.id);
    if (!wallet) {
      return {
        todayEarnings: 0,
        pendingSettlement: 0,
        totalSettledMonth: 0,
        nextSettlementDate: "Tomorrow, 09:30 AM (T+1)",
        bankAccountMasked: v.bankAccountMasked,
        ledger: [],
      };
    }
    return wallet;
  }

  public requestPayout(vendorId: string, amount: number): VendorWalletData {
    const v = this.getVendorByStore(vendorId);
    const wallet = this.wallets.get(v.id);
    if (wallet) {
      wallet.ledger.unshift({
        id: `LED-${Math.floor(100000 + Math.random() * 900000)}`,
        date: "Just now",
        description: `Manual Settlement Withdrawal Request (Under Review)`,
        amount,
        type: "WITHDRAWAL",
        status: "PENDING",
        bankAccount: v.bankAccountMasked,
      });
    }
    return this.getWallet(v.id);
  }
}

export const vendorEngine = new VendorEngine();

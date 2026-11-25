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

export const PRESEEDED_LUCKNOW_VENDORS: VendorProfile[] = [
  {
    id: "vnd-latouche-hardware",
    shopCode: "CN-LKO-101",
    shopName: "Katawala Hardware & Locks",
    ownerName: "Manoj Katawala",
    phone: "9839011223",
    email: "katawala.hardware@lko.in",
    hubZone: "Latouche Road Hub (Naka / Aminabad)",
    hubAddress: "Shop 14, Latouche Rd Commercial Market, Aminabad, Lucknow",
    gstin: "09AABCK1204N1Z4",
    categories: ["Door Hardware & Locks", "Furniture Hardware", "Fevicol & Adhesives", "Power Tools & Hand Tools"],
    isOpen: true,
    rating: 4.9,
    slaScore: 98.4,
    bankAccountMasked: "HDFC Bank ••••••4912",
    upiId: "katawalahardware@hdfcbank",
    operatingHours: "08:00 AM - 08:30 PM",
  },
  {
    id: "vnd-chinhat-cement",
    shopCode: "CN-LKO-102",
    shopName: "Shree Balaji Cement & Steel",
    ownerName: "Rameshwar Balaji",
    phone: "9415088771",
    email: "balaji.cement@lko.in",
    hubZone: "Chinhat Industrial Hub (Faizabad Rd)",
    hubAddress: "Plot 8B, Industrial Area Phase II, Chinhat, Lucknow",
    gstin: "09AABCS8891P1ZK",
    categories: ["Cement & Civil Works", "TMT Steel & Iron Bars", "Red Clay Bricks & Fly Ash", "Morang, Sand & Gitti Aggregate"],
    isOpen: true,
    rating: 4.8,
    slaScore: 96.2,
    bankAccountMasked: "State Bank of India ••••••8104",
    upiId: "shreebalajilko@sbi",
    operatingHours: "07:30 AM - 08:00 PM",
  },
  {
    id: "vnd-naka-sanitary",
    shopCode: "CN-LKO-103",
    shopName: "Awasthi Sanitary & CPVC Depot",
    ownerName: "Dinesh Awasthi",
    phone: "9792033445",
    email: "awasthi.sanitary@lko.in",
    hubZone: "Naka Hindola Hub (Central Lucknow)",
    hubAddress: "22/4 Guru Gobind Singh Marg, Naka Hindola, Lucknow",
    gstin: "09AAACA9921M1ZX",
    categories: ["Sanitaryware & Bath Fittings", "CPVC & SWR Plumbing Pipes", "Kitchen Sinks & Accessories", "Home Appliances & Geysers"],
    isOpen: true,
    rating: 4.9,
    slaScore: 99.1,
    bankAccountMasked: "Punjab National Bank ••••••2291",
    upiId: "awasthisanitary@pnb",
    operatingHours: "08:30 AM - 08:30 PM",
  },
  {
    id: "vnd-gomti-tiles",
    shopCode: "CN-LKO-104",
    shopName: "Gomti Ply, Paints & Tiles Mart",
    ownerName: "Suresh Agarwal",
    phone: "9888999000",
    email: "gomti.ply@lko.in",
    hubZone: "Shaheed Path / Gomti Nagar Hub",
    hubAddress: "Showroom 3, Kisan Bazar Complex, Shaheed Path, Vibhuti Khand, Lucknow",
    gstin: "09AABCG4412Q1ZR",
    categories: ["Vitrified Tiles & Marbles", "Paints, Putty & Primers", "Plywood & Flush Doors", "Electricals & Modular Switches"],
    isOpen: true,
    rating: 4.7,
    slaScore: 95.8,
    bankAccountMasked: "ICICI Bank ••••••3941",
    upiId: "gomtiply@icici",
    operatingHours: "08:00 AM - 09:00 PM",
  },
];

export class VendorEngine {
  private vendors = new Map<string, VendorProfile>();
  private orders = new Map<string, VendorOrder[]>();
  private wallets = new Map<string, VendorWalletData>();
  private activeStoreSession = new Map<string, string>(); // token -> vendorId

  constructor() {
    this.initPreseededData();
  }

  private initPreseededData() {
    for (const v of PRESEEDED_LUCKNOW_VENDORS) {
      this.vendors.set(v.id, { ...v });
      this.vendors.set(v.shopName.toLowerCase().trim(), { ...v });
      this.vendors.set(v.phone, { ...v });

      // Seed realistic active orders
      const seededOrders = this.createInitialOrdersForVendor(v);
      this.orders.set(v.id, seededOrders);

      // Seed initial wallet / passbook
      this.wallets.set(v.id, {
        todayEarnings: 4850,
        pendingSettlement: 12450,
        totalSettledMonth: 184500,
        nextSettlementDate: "Tomorrow, 09:30 AM (T+1)",
        bankAccountMasked: v.bankAccountMasked,
        ledger: [
          {
            id: `LED-${Math.floor(100000 + Math.random() * 900000)}`,
            orderId: "ORD-9912",
            date: "Today, 14:20",
            description: "Order ORD-9912 Settlement (Rider: Ravi Kumar)",
            amount: 2450,
            type: "EARNING",
            status: "PENDING",
            bankAccount: v.bankAccountMasked,
          },
          {
            id: `LED-${Math.floor(100000 + Math.random() * 900000)}`,
            orderId: "ORD-9908",
            date: "Today, 11:15",
            description: "Order ORD-9908 Settlement (Rider: Kartik K.)",
            amount: 2400,
            type: "EARNING",
            status: "PENDING",
            bankAccount: v.bankAccountMasked,
          },
          {
            id: `LED-${Math.floor(100000 + Math.random() * 900000)}`,
            date: "Yesterday, 19:45",
            description: "Daily Bank Payout Auto-Settlement (T+1 Credit)",
            amount: 18200,
            type: "SETTLEMENT",
            status: "SETTLED",
            utrNumber: `UTR-SBIN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            bankAccount: v.bankAccountMasked,
          },
          {
            id: `LED-${Math.floor(100000 + Math.random() * 900000)}`,
            date: "23 Nov 2026",
            description: "Daily Bank Payout Auto-Settlement",
            amount: 24600,
            type: "SETTLEMENT",
            status: "SETTLED",
            utrNumber: `UTR-HDFC-${Math.floor(10000000 + Math.random() * 90000000)}`,
            bankAccount: v.bankAccountMasked,
          },
        ],
      });
    }
  }

  private createInitialOrdersForVendor(vendor: VendorProfile): VendorOrder[] {
    const isHardware = vendor.categories.some(c => c.includes("Hardware"));
    const isCement = vendor.categories.some(c => c.includes("Cement"));
    const isSanitary = vendor.categories.some(c => c.includes("Sanitary"));

    const sampleItems: VendorOrderItem[] = isCement
      ? [
          { skuId: "cement-ppc-01", name: "UltraTech Weather Plus PPC Cement (50kg Bag)", brand: "UltraTech", category: "Cement & Civil Works", unit: "50kg Bag", qty: 20, customerPrice: 395, dealerPayout: 360, batchGuardrail: "Check Fresh Batch Seal" },
          { skuId: "chemical-01", name: "Dr. Fixit Pidiproof LW+ Waterproofing (1L)", brand: "Dr. Fixit", category: "Cement & Civil Works", unit: "1L Bottle", qty: 2, customerPrice: 165, dealerPayout: 140, batchGuardrail: "Check Leak-proof Cap" },
        ]
      : isSanitary
      ? [
          { skuId: "pipe-01", name: "Astral CPVC Pro SDR 11 Pipe 1-Inch (3m Length)", brand: "Astral", category: "CPVC & SWR Plumbing Pipes", unit: "Pipe", qty: 6, customerPrice: 580, dealerPayout: 510, batchGuardrail: "Check ISI Embossing" },
          { skuId: "bath-01", name: "Jaquar Alive Single Lever Basin Mixer Tap", brand: "Jaquar", category: "Sanitaryware & Bath Fittings", unit: "Piece", qty: 1, customerPrice: 3250, dealerPayout: 2850, batchGuardrail: "Check Box Hologram" },
        ]
      : isHardware
      ? [
          { skuId: "lock-01", name: "Godrej Ultra Tribolt Deadbolt Rim Door Lock", brand: "Godrej", category: "Door Hardware & Locks", unit: "Set", qty: 2, customerPrice: 1850, dealerPayout: 1620, batchGuardrail: "Includes 4 Dimple Keys" },
          { skuId: "adhesive-01", name: "Fevicol Marine Waterproof Wood Adhesive (5kg Bucket)", brand: "Fevicol", category: "Fevicol & Adhesives", unit: "5kg Bucket", qty: 1, customerPrice: 1150, dealerPayout: 1020, batchGuardrail: "Tamper-evident Ring Intact" },
        ]
      : [
          { skuId: "tile-01", name: "Kajaria 4x2 Vitrified Glazed Floor Tiles (Box of 2)", brand: "Kajaria", category: "Vitrified Tiles & Marbles", unit: "Box", qty: 8, customerPrice: 1100, dealerPayout: 970, batchGuardrail: "Verify Single Dye Lot (Lot #K-402)" },
          { skuId: "paint-01", name: "Asian Paints Royale Luxury Emulsion White (4L Tin)", brand: "Asian Paints", category: "Paints, Putty & Primers", unit: "4L Tin", qty: 1, customerPrice: 1950, dealerPayout: 1720, batchGuardrail: "Factory Tinted Shade" },
        ];

    const totalPayout = sampleItems.reduce((acc, i) => acc + i.dealerPayout * i.qty, 0);

    return [
      {
        id: "ORD-9912",
        shortId: "9912",
        customerName: "Vikram Rathore (Site Contractor)",
        customerPhone: "+91 94150 99881",
        deliveryArea: "Gomti Nagar Ext, Sector 4",
        deliveryAddress: "Plot 42, Near CMS School, Gomti Nagar Ext",
        placedAt: "10 mins ago",
        minsLeft: 22,
        slaMins: 60,
        status: "PACKING_READY",
        items: sampleItems,
        totalDealerPayout: totalPayout,
        pickupOtp: "4829",
        rider: {
          name: "Ravi Kumar",
          phone: "+91 94150 12044",
          vehicleType: "2W_BIKE",
          vehicleLabel: "2-Wheeler (60-Min Express)",
          plateNumber: "UP 32 BK 4012",
          etaMins: 6,
          distanceKm: 1.4,
        },
        vendorId: vendor.id,
        vendorStore: vendor.shopName,
      },
      {
        id: "ORD-9915",
        shortId: "9915",
        customerName: "Alok Srivastava (House Owner)",
        customerPhone: "+91 98390 12456",
        deliveryArea: "Sushant Golf City, Pocket 2",
        deliveryAddress: "Villa 108, Palm Drive, Sushant Golf City",
        placedAt: "Just now (Ringing)",
        minsLeft: 3,
        slaMins: 60,
        status: "NEW_REQUEST",
        items: [sampleItems[0]],
        totalDealerPayout: sampleItems[0].dealerPayout * sampleItems[0].qty,
        pickupOtp: "9183",
        rider: {
          name: "Suresh S.",
          phone: "+91 98390 44219",
          vehicleType: "3W_ELECTRIC_LOADER",
          vehicleLabel: "E-Loader (Heavy Material)",
          plateNumber: "UP 32 EL 8901",
          etaMins: 9,
          distanceKm: 2.2,
        },
        vendorId: vendor.id,
        vendorStore: vendor.shopName,
      },
    ];
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
    const raw = storeOrIdOrPhone.trim();
    const lower = raw.toLowerCase();

    // Direct lookup
    if (this.vendors.has(raw)) return this.vendors.get(raw)!;
    if (this.vendors.has(lower)) return this.vendors.get(lower)!;

    // Fuzzy match store name
    for (const v of PRESEEDED_LUCKNOW_VENDORS) {
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

    // Default to flagship Katawala Hardware
    return PRESEEDED_LUCKNOW_VENDORS[0];
  }

  public getVendorById(id: string): VendorProfile | undefined {
    return this.vendors.get(id);
  }

  public getAllVendors(): VendorProfile[] {
    return PRESEEDED_LUCKNOW_VENDORS.map(v => this.vendors.get(v.id) || v);
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

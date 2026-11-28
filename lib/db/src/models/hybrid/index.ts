import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IMasterCategory extends Document {
  slug: string;
  name: string;
  parentGroup: string;
  icon?: string;
  sortOrder: number;
  hubTag?: string;
  bannerConfig?: Record<string, any>;
  isActive: boolean;
}

const MasterCategorySchema = new Schema<IMasterCategory>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    parentGroup: { type: String, required: true, default: "CORE_CIVIL" },
    icon: { type: String, default: "Package" },
    sortOrder: { type: Number, default: 1 },
    hubTag: { type: String, default: "Lucknow Express Hub" },
    bannerConfig: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "master_categories" }
);

export interface IMasterProduct {
  skuCode: string;
  categorySlug: string;
  subCategorySlug?: string;
  brand: string;
  model?: string;
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

const MasterProductSchema = new Schema<IMasterProduct>(
  {
    skuCode: { type: String, required: true, unique: true, index: true },
    categorySlug: { type: String, required: true, index: true },
    subCategorySlug: { type: String, index: true },
    brand: { type: String, required: true },
    model: { type: String, default: "" },
    title: { type: String, required: true },
    unit: { type: String, required: true, default: "Unit" },
    specs: { type: Schema.Types.Mixed, default: {} },
    variants: { type: [Schema.Types.Mixed] as any, default: [] },
    compatibleAccessorySkus: { type: [String], default: [] },
    badges: { type: [String], default: [] },
    isDcrSubsidyEligible: { type: Boolean, default: false },
    isRentable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "master_products" }
);

export interface ISiteKit extends Document {
  kitCode: string;
  title: string;
  stageTag: string;
  items: Array<Record<string, any>>;
  discountPct: number;
  isActive: boolean;
}

const SiteKitSchema = new Schema<ISiteKit>(
  {
    kitCode: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    stageTag: { type: String, required: true },
    items: { type: [Schema.Types.Mixed] as any, default: [] },
    discountPct: { type: Number, default: 20 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "site_kits" }
);

export type HybridLeadType = "SOLAR_MVVNL" | "PARCHA_BOQ" | "TURNKEY_SERVICE";
export type HybridLeadStatus = "NEW" | "CONTACTED" | "QUOTED" | "CONVERTED" | "CLOSED";

export interface ILeadInbox extends Document {
  leadRefId: string;
  leadType: HybridLeadType;
  customerName: string;
  phone: string;
  locality: string;
  payload: Record<string, any>;
  status: HybridLeadStatus;
  convertedOrderId?: string;
  createdAt: Date;
}

const LeadInboxSchema = new Schema<ILeadInbox>(
  {
    leadRefId: { type: String, required: true, unique: true, index: true },
    leadType: {
      type: String,
      enum: ["SOLAR_MVVNL", "PARCHA_BOQ", "TURNKEY_SERVICE"],
      required: true,
      index: true,
    },
    customerName: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    locality: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUOTED", "CONVERTED", "CLOSED"],
      default: "NEW",
      index: true,
    },
    convertedOrderId: { type: String },
    createdAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false, collection: "lead_inbox" }
);

export interface IAuditAndDispatchLog extends Document {
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  diff: Record<string, any>;
  timestamp: Date;
}

const AuditAndDispatchLogSchema = new Schema<IAuditAndDispatchLog>(
  {
    actorId: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    diff: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: false, collection: "audit_and_dispatch_logs" }
);

export const MasterCategoryModel: Model<IMasterCategory> =
  mongoose.models.MasterCategory || mongoose.model<IMasterCategory>("MasterCategory", MasterCategorySchema);

export const MasterProductModel: Model<IMasterProduct> =
  mongoose.models.MasterProduct || mongoose.model<IMasterProduct>("MasterProduct", MasterProductSchema);

export const SiteKitModel: Model<ISiteKit> =
  mongoose.models.SiteKit || mongoose.model<ISiteKit>("SiteKit", SiteKitSchema);

export const LeadInboxModel: Model<ILeadInbox> =
  mongoose.models.LeadInbox || mongoose.model<ILeadInbox>("LeadInbox", LeadInboxSchema);

export const AuditAndDispatchLogModel: Model<IAuditAndDispatchLog> =
  mongoose.models.AuditAndDispatchLog ||
  mongoose.model<IAuditAndDispatchLog>("AuditAndDispatchLog", AuditAndDispatchLogSchema);

let mongooseConnectPromise: Promise<typeof mongoose> | null = null;

export async function connectMongooseHybrid(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) return true;
  const rawUri = (process.env.MONGO_URI || process.env.MONGODB_URI || "").trim();
  if (!rawUri) return false;
  try {
    if (!mongooseConnectPromise) {
      mongooseConnectPromise = mongoose.connect(rawUri, {
        dbName: process.env.MONGODB_DATABASE?.trim() || "conon",
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });
    }
    await mongooseConnectPromise;
    return Number(mongoose.connection.readyState) === 1;
  } catch (err: any) {
    mongooseConnectPromise = null;
    console.warn("[HybridMongoose] Connection deferred:", err?.message || err);
    return false;
  }
}

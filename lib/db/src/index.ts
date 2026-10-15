import {
  Decimal128,
  MongoClient,
  type Collection,
  type ClientSession,
  type Document,
} from "mongodb";

export interface UserDocument extends Document {
  id: number;
  externalId: string;
  name: string;
  phone: string;
  email?: string | null;
  role: string;
  vendorStore?: string | null;
  createdAt: Date;
}

export interface AuthUserDocument extends Document {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialDocument extends Document {
  id: number;
  externalId: string;
  name: string;
  category: string;
  stage: string;
  price: Decimal128;
  unit: string;
  description?: string | null;
  inStock: boolean;
  imageUrl?: string | null;
  vendor: string;
  deliveryTime: number;
  dynamicPricingEnabled: boolean;
}

export interface CartItemDocument extends Document {
  id: number;
  externalId: string;
  materialId: string;
  name: string;
  category: string;
  price: Decimal128;
  unit: string;
  quantity: Decimal128;
  vendor: string;
}

export interface CartDocument extends Document {
  id: number;
  sessionId: string;
  createdAt: Date;
  items: CartItemDocument[];
}

export interface OrderItemDocument extends Document {
  id: string;
  materialId?: string;
  name: string;
  category?: string;
  price: Decimal128;
  unit: string;
  quantity: Decimal128;
  vendor?: string;
  total: Decimal128;
}

export interface OrderDocument extends Document {
  id: number;
  externalId: string;
  sessionId: string;
  items: OrderItemDocument[];
  category?: string | null;
  vendor?: string | null;
  subtotal: Decimal128;
  deliveryFee: Decimal128;
  labourFee: Decimal128;
  gstAmount: Decimal128;
  total: Decimal128;
  isB2B: boolean;
  gstNumber?: string | null;
  status: string;
  deliveryAddress: string;
  phoneNumber?: string | null;
  estimatedDelivery: Date;
  placedAt: Date;
}

export interface MandiPriceDocument extends Document {
  id: number;
  material: string;
  unit: string;
  currentPrice: Decimal128;
  previousPrice: Decimal128;
  change: Decimal128;
  changePercent: Decimal128;
  trend: string;
  lastUpdated: Date;
}

export interface ServiceDocument extends Document {
  id: number;
  externalId: string;
  type: string;
  name: string;
  description: string;
  ratePerDay: Decimal128;
  available: boolean;
  rating: Decimal128;
  experience: number;
}

export interface ServiceBookingDocument extends Document {
  id: number;
  externalId: string;
  serviceId: string;
  serviceName: string;
  bookingDate: string;
  days: number;
  total: Decimal128;
  status: string;
  notes?: string | null;
  createdAt: Date;
}

export interface KhataLedgerDocument extends Document {
  id: number;
  contractorId: string;
  creditLimit: Decimal128;
  outstandingBalance: Decimal128;
  updatedAt: Date;
}

export interface VendorPayoutDocument extends Document {
  id: number;
  externalId: string;
  vendorStore: string;
  amount: Decimal128;
  status: string;
  requestedAt: Date;
  approvedAt?: Date | null;
}

export interface SessionDocument extends Document {
  sid: string;
  sess: Record<string, unknown>;
  expire: Date;
}

export interface PhoneOtpDocument extends Document {
  phone: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
  createdAt: Date;
}

interface CounterDocument extends Document {
  _id: string;
  seq: number;
}

interface CollectionMap {
  users: UserDocument;
  authUsers: AuthUserDocument;
  materials: MaterialDocument;
  carts: CartDocument;
  orders: OrderDocument;
  mandiPrices: MandiPriceDocument;
  services: ServiceDocument;
  serviceBookings: ServiceBookingDocument;
  khataLedger: KhataLedgerDocument;
  vendorPayouts: VendorPayoutDocument;
  sessions: SessionDocument;
  phoneOtps: PhoneOtpDocument;
  counters: CounterDocument;
}

const COLLECTION_NAMES: Record<keyof CollectionMap, string> = {
  users: "users",
  authUsers: "authUsers",
  materials: "materials",
  carts: "carts",
  orders: "orders",
  mandiPrices: "mandiPrices",
  services: "services",
  serviceBookings: "serviceBookings",
  khataLedger: "khataLedger",
  vendorPayouts: "vendorPayouts",
  sessions: "sessions",
  phoneOtps: "phoneOtps",
  counters: "counters",
};

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

function getClient(): MongoClient {
  if (!client) {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) throw new Error("MONGODB_URI is not configured");
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  }
  return client;
}

export function getDatabaseName(): string {
  return process.env.MONGODB_DATABASE?.trim() || "conon";
}

export function collection<K extends keyof CollectionMap>(
  name: K,
): Collection<CollectionMap[K]> {
  return getClient().db(getDatabaseName()).collection<CollectionMap[K]>(COLLECTION_NAMES[name]);
}

export async function connectDatabase(): Promise<void> {
  if (!clientPromise) clientPromise = getClient().connect();
  await clientPromise;
  await ensureIndexes();
}

export async function closeDatabase(): Promise<void> {
  clientPromise = undefined;
  if (client) await client.close();
  client = undefined;
}

export async function withTransaction<T>(
  operation: (session: ClientSession) => Promise<T>,
): Promise<T> {
  if (!clientPromise) clientPromise = getClient().connect();
  const connected = await clientPromise;
  const session = connected.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

export async function pingDatabase(): Promise<boolean> {
  try {
    if (!clientPromise) clientPromise = getClient().connect();
    await clientPromise;
    await getClient().db(getDatabaseName()).command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function ensureIndexes(): Promise<void> {
  const users = collection("users");
  await Promise.all([
    users.createIndex({ id: 1 }, { unique: true, name: "users_id_unique" }),
    users.createIndex({ externalId: 1 }, { unique: true, name: "users_external_id_unique" }),
    users.createIndex({ phone: 1 }, { unique: true, name: "users_phone_unique" }),
    users.createIndex(
      { vendorStore: 1 },
      {
        unique: true,
        name: "users_vendor_store_string_unique",
        partialFilterExpression: { vendorStore: { $type: "string" } },
      },
    ),
    collection("authUsers").createIndex({ id: 1 }, { unique: true, name: "auth_users_id_unique" }),
    collection("authUsers").createIndex(
      { email: 1 },
      {
        unique: true,
        name: "auth_users_email_string_unique",
        partialFilterExpression: { email: { $type: "string" } },
      },
    ),
    collection("materials").createIndex({ id: 1 }, { unique: true, name: "materials_id_unique" }),
    collection("materials").createIndex({ externalId: 1 }, { unique: true, name: "materials_external_id_unique" }),
    collection("materials").createIndex({ stage: 1 }, { name: "materials_stage" }),
    collection("materials").createIndex({ vendor: 1, name: 1 }, { name: "materials_vendor_name" }),
    collection("carts").createIndex({ id: 1 }, { unique: true, name: "carts_id_unique" }),
    collection("carts").createIndex({ sessionId: 1 }, { unique: true, name: "carts_session_unique" }),
    collection("carts").createIndex({ "items.externalId": 1 }, { name: "cart_items_external_id" }),
    collection("orders").createIndex({ id: 1 }, { unique: true, name: "orders_id_unique" }),
    collection("orders").createIndex({ externalId: 1 }, { unique: true, name: "orders_external_id_unique" }),
    collection("orders").createIndex({ sessionId: 1, placedAt: 1 }, { name: "orders_session_placed" }),
    collection("orders").createIndex({ vendor: 1, placedAt: -1 }, { name: "orders_vendor_placed" }),
    collection("mandiPrices").createIndex({ id: 1 }, { unique: true, name: "mandi_prices_id_unique" }),
    collection("mandiPrices").createIndex({ material: 1 }, { name: "mandi_prices_material" }),
    collection("services").createIndex({ id: 1 }, { unique: true, name: "services_id_unique" }),
    collection("services").createIndex({ externalId: 1 }, { unique: true, name: "services_external_id_unique" }),
    collection("serviceBookings").createIndex({ id: 1 }, { unique: true, name: "service_bookings_id_unique" }),
    collection("serviceBookings").createIndex({ externalId: 1 }, { unique: true, name: "service_bookings_external_id_unique" }),
    collection("khataLedger").createIndex({ id: 1 }, { unique: true, name: "khata_id_unique" }),
    collection("khataLedger").createIndex({ contractorId: 1 }, { unique: true, name: "khata_contractor_unique" }),
    collection("vendorPayouts").createIndex({ id: 1 }, { unique: true, name: "payouts_id_unique" }),
    collection("vendorPayouts").createIndex({ externalId: 1 }, { unique: true, name: "payouts_external_id_unique" }),
    collection("vendorPayouts").createIndex({ vendorStore: 1, requestedAt: -1 }, { name: "payouts_vendor_requested" }),
    collection("sessions").createIndex({ sid: 1 }, { unique: true, name: "sessions_sid_unique" }),
    collection("sessions").createIndex({ expire: 1 }, { expireAfterSeconds: 0, name: "sessions_expire_ttl" }),
    collection("phoneOtps").createIndex({ phone: 1 }, { unique: true, name: "phone_otps_phone_unique" }),
    collection("phoneOtps").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "phone_otps_expire_ttl" }),
  ]);
}

export async function nextId(
  name: Exclude<keyof CollectionMap, "counters"> | "cartItems",
  session?: ClientSession,
): Promise<number> {
  const result = await collection("counters").findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after", session },
  );
  if (!result) throw new Error(`Could not allocate ${name} id`);
  return result.seq;
}

export function decimal(value: string | number | Decimal128): Decimal128 {
  if (value instanceof Decimal128) return value;
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new TypeError("Money value must be finite");
  }
  return Decimal128.fromString(typeof value === "number" ? value.toFixed(2) : value);
}

export function decimalToNumber(value: Decimal128 | string | number): number {
  const result = typeof value === "number" ? value : Number(value.toString());
  if (!Number.isFinite(result)) throw new TypeError("Invalid stored decimal value");
  return result;
}

export function moneyToCents(value: Decimal128 | string | number): bigint {
  const raw = typeof value === "number" ? value.toFixed(2) : value.toString();
  const match = /^(-?)(\d+)(?:\.(\d*))?$/.exec(raw);
  if (!match) throw new TypeError("Invalid money value");
  const fraction = (match[3] ?? "").padEnd(3, "0");
  const cents = BigInt(match[2]) * 100n + BigInt(fraction.slice(0, 2)) + (fraction[2] >= "5" ? 1n : 0n);
  return match[1] ? -cents : cents;
}

export function centsToDecimal(cents: bigint): Decimal128 {
  const negative = cents < 0n;
  const absolute = negative ? -cents : cents;
  const whole = absolute / 100n;
  const fraction = (absolute % 100n).toString().padStart(2, "0");
  return Decimal128.fromString(`${negative ? "-" : ""}${whole}.${fraction}`);
}

export function multiplyMoneyCents(
  price: Decimal128 | string | number,
  quantity: Decimal128 | string | number,
): bigint {
  const product = moneyToCents(price) * moneyToCents(quantity);
  const absolute = product < 0n ? -product : product;
  const rounded = (absolute + 50n) / 100n;
  return product < 0n ? -rounded : rounded;
}

export const repositories = {
  users: {
    findByPhone: (phone: string) => collection("users").findOne({ phone }),
    findById: (id: number) => collection("users").findOne({ id }),
    findVendorStoreOwner: (vendorStore: string) =>
      collection("users").findOne({ vendorStore }),
  },
  materials: {
    findByExternalIds: (externalIds: string[]) =>
      collection("materials").find({ externalId: { $in: externalIds } }).toArray(),
    findByExternalId: (externalId: string) =>
      collection("materials").findOne({ externalId }),
  },
  orders: {
    findByExternalId: (externalId: string) =>
      collection("orders").findOne({ externalId }),
  },
};

export type { ClientSession };

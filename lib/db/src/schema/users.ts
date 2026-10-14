import { pgTable, serial, varchar, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const USER_ROLES = ["customer", "contractor", "driver", "vendor", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    externalId: varchar("external_id", { length: 50 }).notNull().unique(),
    name: text("name").notNull(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),
    email: varchar("email", { length: 255 }),
    role: varchar("role", { length: 20 }).notNull().default("customer"),
    // For vendors: the store/shop name this account owns. Materials and orders are
    // linked to a vendor by this store name (materials.vendor / orders.vendor).
    // Used as the authorization scope for /vendor/* access, so it MUST be unique:
    // a store identity belongs to exactly one user. (NULLs are distinct in
    // Postgres, so non-vendor accounts are unaffected.)
    vendorStore: text("vendor_store"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    vendorStoreUnique: uniqueIndex("users_vendor_store_unique").on(t.vendorStore),
  }),
);

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

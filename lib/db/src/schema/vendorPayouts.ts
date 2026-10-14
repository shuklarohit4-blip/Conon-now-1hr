import { pgTable, serial, varchar, text, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Vendor payout requests. A vendor withdraws part of their available balance;
// the request lands as "pending" and an admin must approve it before it is paid.
export const PAYOUT_STATUSES = ["pending", "approved"] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export const vendorPayoutsTable = pgTable("vendor_payouts", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 50 }).notNull().unique(),
  // Store name the payout belongs to (matches users.vendor_store / orders.vendor).
  vendorStore: text("vendor_store").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
});

export const insertVendorPayoutSchema = createInsertSchema(vendorPayoutsTable).omit({
  id: true,
});
export type InsertVendorPayout = z.infer<typeof insertVendorPayoutSchema>;
export type VendorPayout = typeof vendorPayoutsTable.$inferSelect;

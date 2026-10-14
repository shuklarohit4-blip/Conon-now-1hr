import { pgTable, text, serial, boolean, decimal, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 50 }).notNull().unique(),
  sessionId: varchar("session_id", { length: 100 }).notNull().default(""),
  items: jsonb("items").notNull(),
  category: varchar("category", { length: 50 }),
  vendor: text("vendor"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  labourFee: decimal("labour_fee", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  gstAmount: decimal("gst_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  isB2B: boolean("is_b2b").notNull().default(false),
  gstNumber: varchar("gst_number", { length: 20 }),
  status: varchar("status", { length: 30 }).notNull().default("placed"),
  deliveryAddress: text("delivery_address").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  estimatedDelivery: timestamp("estimated_delivery").notNull(),
  placedAt: timestamp("placed_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

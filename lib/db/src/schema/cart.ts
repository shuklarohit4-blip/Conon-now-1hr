import { pgTable, text, serial, integer, decimal, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cartsTable = pgTable("carts", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 50 }).notNull().unique(),
  cartId: integer("cart_id").notNull(),
  materialId: varchar("material_id", { length: 50 }).notNull(),
  name: text("name").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 30 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  vendor: text("vendor").notNull(),
});

export const insertCartSchema = createInsertSchema(cartsTable).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ id: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItemsTable.$inferSelect;

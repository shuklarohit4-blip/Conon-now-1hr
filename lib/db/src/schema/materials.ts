import { pgTable, text, serial, boolean, integer, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const materialsTable = pgTable("materials", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  stage: varchar("stage", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 30 }).notNull(),
  description: text("description"),
  inStock: boolean("in_stock").notNull().default(true),
  imageUrl: text("image_url"),
  vendor: text("vendor").notNull(),
  deliveryTime: integer("delivery_time").notNull().default(60),
  dynamicPricingEnabled: boolean("dynamic_pricing_enabled")
    .notNull()
    .default(false),
});

export const insertMaterialSchema = createInsertSchema(materialsTable).omit({ id: true });
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materialsTable.$inferSelect;

import { pgTable, text, serial, decimal, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mandiPricesTable = pgTable("mandi_prices", {
  id: serial("id").primaryKey(),
  material: text("material").notNull(),
  unit: varchar("unit", { length: 30 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  previousPrice: decimal("previous_price", { precision: 10, scale: 2 }).notNull(),
  change: decimal("change", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 6, scale: 2 }).notNull(),
  trend: varchar("trend", { length: 10 }).notNull().default("stable"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertMandiPriceSchema = createInsertSchema(mandiPricesTable).omit({ id: true });
export type InsertMandiPrice = z.infer<typeof insertMandiPriceSchema>;
export type MandiPrice = typeof mandiPricesTable.$inferSelect;

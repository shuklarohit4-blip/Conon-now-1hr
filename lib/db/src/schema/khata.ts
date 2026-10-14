import { pgTable, serial, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// B2B contractor credit ledger ("Khata"): tracks how much credit a contractor
// has and how much they currently owe.
export const khataLedgerTable = pgTable("khata_ledger", {
  id: serial("id").primaryKey(),
  contractorId: varchar("contractor_id", { length: 50 }).notNull().unique(),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  outstandingBalance: decimal("outstanding_balance", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertKhataLedgerSchema = createInsertSchema(khataLedgerTable).omit({
  id: true,
});
export type InsertKhataLedger = z.infer<typeof insertKhataLedgerSchema>;
export type KhataLedger = typeof khataLedgerTable.$inferSelect;

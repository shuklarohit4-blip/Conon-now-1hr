import { pgTable, text, serial, boolean, integer, decimal, varchar, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ratePerDay: decimal("rate_per_day", { precision: 10, scale: 2 }).notNull(),
  available: boolean("available").notNull().default(true),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull().default("4.5"),
  experience: integer("experience").notNull().default(3),
});

export const serviceBookingsTable = pgTable("service_bookings", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 50 }).notNull().unique(),
  serviceId: varchar("service_id", { length: 50 }).notNull(),
  serviceName: text("service_name").notNull(),
  bookingDate: date("booking_date").notNull(),
  days: integer("days").notNull().default(1),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true });
export const insertServiceBookingSchema = createInsertSchema(serviceBookingsTable).omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
export type ServiceBooking = typeof serviceBookingsTable.$inferSelect;

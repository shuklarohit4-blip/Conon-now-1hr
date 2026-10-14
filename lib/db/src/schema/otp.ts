import { pgTable, varchar, timestamp, integer } from "drizzle-orm/pg-core";

/**
 * Short-lived SMS OTP codes for phone-number login.
 * One active row per phone number (phone is the primary key); a new request
 * overwrites the previous code. Codes are stored hashed, never in plaintext.
 */
export const phoneOtpsTable = pgTable("phone_otps", {
  phone: varchar("phone", { length: 20 }).primaryKey(),
  codeHash: varchar("code_hash", { length: 128 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  lastSentAt: timestamp("last_sent_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PhoneOtpRow = typeof phoneOtpsTable.$inferSelect;

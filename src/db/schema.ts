import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

/** Service categories supported by the MEDIVA marketplace */
export type ServiceType = "nursing" | "physio" | "lab" | "pharmacy";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  city: varchar("city", { length: 80 }).notNull(),
});

export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  serviceType: varchar("service_type", { length: 20 }).$type<ServiceType>().notNull(),
  label: varchar("label", { length: 120 }).notNull(),
  bio: text("bio").notNull().default(""),
  city: varchar("city", { length: 80 }).notNull().default("عمّان"),
  experienceYears: integer("experience_years").notNull().default(3),
  priceFrom: integer("price_from").notNull().default(15), // JOD
});

/* ------------------------------ Marketplace ------------------------------ */
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  providerId: integer("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  serviceType: varchar("service_type", { length: 20 }).$type<ServiceType>().notNull(),
  need: text("need").notNull(),
  address: varchar("address", { length: 200 }).notNull(),
  scheduledDate: varchar("scheduled_date", { length: 20 }).notNull(),
  scheduledTime: varchar("scheduled_time", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | accepted | completed | cancelled
  careNoteId: integer("care_note_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().unique().references(() => bookings.id, { onDelete: "cascade" }),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  providerId: integer("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  professionalism: integer("professionalism").notNull(),
  punctuality: integer("punctuality").notNull(),
  communication: integer("communication").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  tier: varchar("tier", { length: 20 }).notNull(), // starter | pro | elite
  adCredits: integer("ad_credits").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  active: boolean("active").notNull().default(true),
});

export const featuredSlots = pgTable("featured_slots", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  source: varchar("source", { length: 20 }).notNull(), // package | points | wheel
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
});

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 80 }).notNull(),
  body: varchar("body", { length: 160 }).notNull(),
  source: varchar("source", { length: 20 }).notNull(), // package | points | wheel
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
});

export const pointsLedger = pgTable("points_ledger", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: varchar("reason", { length: 200 }).notNull(),
  taskKey: varchar("task_key", { length: 40 }),
  dayKey: varchar("day_key", { length: 12 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Lucky wheel spins (1 free spin/day, extra spins cost points) */
export const wheelSpins = pgTable("wheel_spins", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  prizeKey: varchar("prize_key", { length: 30 }).notNull(),
  paid: boolean("paid").notNull().default(false),
  dayKey: varchar("day_key", { length: 12 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Structured, template-based care note (fields vary per service type) */
export type CareNoteData = Record<string, string | string[]>;

export const careNotes = pgTable("care_notes", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  providerId: integer("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  serviceType: varchar("service_type", { length: 20 }).$type<ServiceType>().notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  visitDate: varchar("visit_date", { length: 20 }).notNull(),
  durationMin: integer("duration_min").notNull().default(30),
  data: jsonb("data").$type<CareNoteData>().notNull(),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Immutable audit trail: every creation & amendment keeps a snapshot */
export const careNoteVersions = pgTable("care_note_versions", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull().references(() => careNotes.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  action: varchar("action", { length: 20 }).notNull(), // created | amended
  actorProviderId: integer("actor_provider_id").notNull().references(() => providers.id),
  reason: text("reason"),
  changes: jsonb("changes").$type<{ field: string; before: string; after: string }[]>().notNull().default([]),
  snapshot: jsonb("snapshot").$type<CareNoteData>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Patient consent: which provider may see which service scopes */
export const accessGrants = pgTable("access_grants", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  providerId: integer("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  scopes: jsonb("scopes").$type<ServiceType[]>().notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

/** Every access attempt to a patient's record is logged */
export const accessLog = pgTable("access_log", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  providerId: integer("provider_id").notNull().references(() => providers.id, { onDelete: "cascade" }),
  outcome: varchar("outcome", { length: 20 }).notNull(), // allowed | denied
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Patients cannot edit notes — they can report an issue */
export const issueReports = pgTable("issue_reports", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull().references(() => careNotes.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

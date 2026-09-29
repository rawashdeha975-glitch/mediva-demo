import "server-only";
import { db } from "@/db";
import {
  providers,
  patients,
  bookings,
  reviews,
  subscriptions,
  featuredSlots,
  ads,
  pointsLedger,
  wheelSpins,
  type ServiceType,
} from "@/db/schema";
import { and, desc, eq, gt, sql, isNull } from "drizzle-orm";
import { ensureSeed, DEMO_PATIENT_ID } from "@/lib/care";
import { TASKS, getPackages, type Tier } from "@/lib/catalog";

export function dayKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Amman" }).format(d);
}
const DAY = 86400000;

/* ------------------------------ subscriptions ------------------------------ */
export async function getActiveSubscription(pid: number) {
  const [s] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.providerId, pid), eq(subscriptions.active, true), gt(subscriptions.endsAt, new Date())))
    .orderBy(desc(subscriptions.startsAt))
    .limit(1);
  return s ?? null;
}

export async function getTier(pid: number): Promise<Tier> {
  const s = await getActiveSubscription(pid);
  return (s?.tier as Tier) ?? "starter";
}

/* ------------------------------ points ------------------------------ */
export async function getPointsBalance(pid: number) {
  const [r] = await db
    .select({ s: sql<number>`coalesce(sum(${pointsLedger.delta}),0)` })
    .from(pointsLedger)
    .where(eq(pointsLedger.providerId, pid));
  return Number(r.s);
}

export async function getLedger(pid: number, limit = 12) {
  return db.select().from(pointsLedger).where(eq(pointsLedger.providerId, pid)).orderBy(desc(pointsLedger.createdAt)).limit(limit);
}

/** Awards a task respecting its frequency and the package multiplier. Returns points awarded (0 if not eligible). */
export async function awardTask(pid: number, taskKey: string, detail?: string) {
  const task = TASKS.find((t) => t.key === taskKey);
  if (!task) return 0;
  const today = dayKey();
  if (task.freq !== "each") {
    const cond =
      task.freq === "daily"
        ? and(eq(pointsLedger.providerId, pid), eq(pointsLedger.taskKey, taskKey), eq(pointsLedger.dayKey, today))
        : and(eq(pointsLedger.providerId, pid), eq(pointsLedger.taskKey, taskKey));
    const [e] = await db.select({ id: pointsLedger.id }).from(pointsLedger).where(cond).limit(1);
    if (e) return 0;
  }
  const tier = await getTier(pid);
  const mult = getPackages("nursing").find((p) => p.tier === tier)?.pointsMultiplier ?? 1;
  const pts = Math.round(task.points * mult);
  await db.insert(pointsLedger).values({
    providerId: pid,
    delta: pts,
    reason: `${task.icon} ${task.title}${detail ? ` — ${detail}` : ""}${mult > 1 ? ` (×${mult})` : ""}`,
    taskKey,
    dayKey: today,
  });
  return pts;
}

export async function getTaskStatus(pid: number) {
  const today = dayKey();
  const rows = await db
    .select({ taskKey: pointsLedger.taskKey, dayKey: pointsLedger.dayKey, c: sql<number>`count(*)` })
    .from(pointsLedger)
    .where(eq(pointsLedger.providerId, pid))
    .groupBy(pointsLedger.taskKey, pointsLedger.dayKey);
  return TASKS.map((t) => {
    const mine = rows.filter((r) => r.taskKey === t.key);
    const total = mine.reduce((a, r) => a + Number(r.c), 0);
    const doneToday = mine.some((r) => r.dayKey === today);
    const locked = t.freq === "daily" ? doneToday : t.freq === "once" ? total > 0 : false;
    return { ...t, total, locked };
  });
}

/* ------------------------------ featured & ads ------------------------------ */
export async function getFeaturedUntil(pid: number) {
  const [r] = await db
    .select({ m: sql<Date | null>`max(${featuredSlots.endsAt})` })
    .from(featuredSlots)
    .where(and(eq(featuredSlots.providerId, pid), gt(featuredSlots.endsAt, new Date())));
  return r.m ? new Date(r.m) : null;
}

/** Extends featured visibility from the current end (stacking) */
export async function grantFeatured(pid: number, days: number, source: string) {
  const until = await getFeaturedUntil(pid);
  const start = until && until > new Date() ? until : new Date();
  await db.insert(featuredSlots).values({ providerId: pid, source, startsAt: start, endsAt: new Date(start.getTime() + days * DAY) });
}

export async function createAd(pid: number, title: string, body: string, days: number, source: string) {
  const [a] = await db
    .insert(ads)
    .values({ providerId: pid, title, body, source, endsAt: new Date(Date.now() + days * DAY) })
    .returning({ id: ads.id });
  await awardTask(pid, "first_ad");
  return a.id;
}

export async function getActiveAds(limit = 5) {
  await ensureSeed();
  const rows = await db
    .select({
      id: ads.id,
      title: ads.title,
      body: ads.body,
      providerId: ads.providerId,
      providerName: providers.name,
      serviceType: providers.serviceType,
    })
    .from(ads)
    .innerJoin(providers, eq(ads.providerId, providers.id))
    .where(gt(ads.endsAt, new Date()))
    .orderBy(sql`random()`)
    .limit(limit);
  return rows;
}

export async function trackImpressions(ids: number[]) {
  if (!ids.length) return;
  await db.execute(sql`UPDATE ads SET impressions = impressions + 1 WHERE id IN (${sql.join(ids.map((i) => sql`${i}`), sql`, `)})`);
}

export async function getProviderAds(pid: number) {
  return db.select().from(ads).where(eq(ads.providerId, pid)).orderBy(desc(ads.startsAt));
}

/* ------------------------------ ratings & ranking ------------------------------ */
export type RatingStats = { avg: number; count: number };

export async function getRatingMap() {
  const rows = await db
    .select({ pid: reviews.providerId, avg: sql<number>`avg(${reviews.rating})`, c: sql<number>`count(*)` })
    .from(reviews)
    .groupBy(reviews.providerId);
  const m = new Map<number, RatingStats>();
  rows.forEach((r) => m.set(r.pid, { avg: Math.round(Number(r.avg) * 10) / 10, count: Number(r.c) }));
  return m;
}

export type RankedProvider = typeof providers.$inferSelect & {
  rating: RatingStats;
  featuredUntil: Date | null;
  tier: Tier;
  score: number;
};

export async function getRankedProviders(type?: ServiceType): Promise<RankedProvider[]> {
  await ensureSeed();
  const [list, ratings, feats, subs] = await Promise.all([
    type ? db.select().from(providers).where(eq(providers.serviceType, type)) : db.select().from(providers),
    getRatingMap(),
    db
      .select({ pid: featuredSlots.providerId, m: sql<Date>`max(${featuredSlots.endsAt})` })
      .from(featuredSlots)
      .where(gt(featuredSlots.endsAt, new Date()))
      .groupBy(featuredSlots.providerId),
    db
      .select({ pid: subscriptions.providerId, tier: subscriptions.tier })
      .from(subscriptions)
      .where(and(eq(subscriptions.active, true), gt(subscriptions.endsAt, new Date()))),
  ]);
  const bonus: Record<Tier, number> = { starter: 0, pro: 6, elite: 12 };
  return list
    .map((p) => {
      const rating = ratings.get(p.id) ?? { avg: 0, count: 0 };
      const f = feats.find((x) => x.pid === p.id);
      const tier = (subs.find((s) => s.pid === p.id)?.tier as Tier) ?? "starter";
      const score = rating.avg * 20 + Math.min(rating.count, 20) * 1.5 + bonus[tier] + Math.min(p.experienceYears, 15);
      return { ...p, rating, featuredUntil: f ? new Date(f.m) : null, tier, score };
    })
    .sort((a, b) => Number(!!b.featuredUntil) - Number(!!a.featuredUntil) || b.score - a.score);
}

export async function getProviderReviews(pid: number, limit = 20) {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      professionalism: reviews.professionalism,
      punctuality: reviews.punctuality,
      communication: reviews.communication,
      tags: reviews.tags,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      patientName: patients.name,
    })
    .from(reviews)
    .innerJoin(patients, eq(reviews.patientId, patients.id))
    .where(eq(reviews.providerId, pid))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export async function getReviewBreakdown(pid: number) {
  const [r] = await db
    .select({
      avg: sql<number>`coalesce(avg(${reviews.rating}),0)`,
      c: sql<number>`count(*)`,
      pro: sql<number>`coalesce(avg(${reviews.professionalism}),0)`,
      pun: sql<number>`coalesce(avg(${reviews.punctuality}),0)`,
      com: sql<number>`coalesce(avg(${reviews.communication}),0)`,
    })
    .from(reviews)
    .where(eq(reviews.providerId, pid));
  const dist = await db
    .select({ rating: reviews.rating, c: sql<number>`count(*)` })
    .from(reviews)
    .where(eq(reviews.providerId, pid))
    .groupBy(reviews.rating);
  const f = (n: number) => Math.round(Number(n) * 10) / 10;
  return {
    avg: f(r.avg),
    count: Number(r.c),
    professionalism: f(r.pro),
    punctuality: f(r.pun),
    communication: f(r.com),
    dist: [5, 4, 3, 2, 1].map((s) => ({ s, c: Number(dist.find((d) => d.rating === s)?.c ?? 0) })),
  };
}

/* ------------------------------ bookings ------------------------------ */
const bookingSelect = {
  id: bookings.id,
  providerId: bookings.providerId,
  patientId: bookings.patientId,
  serviceType: bookings.serviceType,
  need: bookings.need,
  address: bookings.address,
  scheduledDate: bookings.scheduledDate,
  scheduledTime: bookings.scheduledTime,
  status: bookings.status,
  careNoteId: bookings.careNoteId,
  createdAt: bookings.createdAt,
  providerName: providers.name,
  reviewId: reviews.id,
  reviewRating: reviews.rating,
};

export async function getPatientBookings() {
  await ensureSeed();
  return db
    .select(bookingSelect)
    .from(bookings)
    .innerJoin(providers, eq(bookings.providerId, providers.id))
    .leftJoin(reviews, eq(reviews.bookingId, bookings.id))
    .where(eq(bookings.patientId, DEMO_PATIENT_ID))
    .orderBy(desc(bookings.createdAt));
}

export async function getPendingRatings() {
  await ensureSeed();
  return db
    .select(bookingSelect)
    .from(bookings)
    .innerJoin(providers, eq(bookings.providerId, providers.id))
    .leftJoin(reviews, eq(reviews.bookingId, bookings.id))
    .where(and(eq(bookings.patientId, DEMO_PATIENT_ID), eq(bookings.status, "completed"), isNull(reviews.id)))
    .orderBy(desc(bookings.completedAt));
}

export async function getBooking(id: number) {
  const [b] = await db
    .select(bookingSelect)
    .from(bookings)
    .innerJoin(providers, eq(bookings.providerId, providers.id))
    .leftJoin(reviews, eq(reviews.bookingId, bookings.id))
    .where(eq(bookings.id, id));
  return b ?? null;
}

export async function getProviderBookings(pid: number) {
  await ensureSeed();
  return db
    .select({ ...bookingSelect, patientName: patients.name })
    .from(bookings)
    .innerJoin(providers, eq(bookings.providerId, providers.id))
    .innerJoin(patients, eq(bookings.patientId, patients.id))
    .leftJoin(reviews, eq(reviews.bookingId, bookings.id))
    .where(eq(bookings.providerId, pid))
    .orderBy(desc(bookings.createdAt));
}

export async function spinsToday(pid: number) {
  const rows = await db
    .select()
    .from(wheelSpins)
    .where(and(eq(wheelSpins.providerId, pid), eq(wheelSpins.dayKey, dayKey())));
  return { freeUsed: rows.some((r) => !r.paid), total: rows.length };
}

export async function getRecentSpins(pid: number) {
  return db.select().from(wheelSpins).where(eq(wheelSpins.providerId, pid)).orderBy(desc(wheelSpins.createdAt)).limit(5);
}

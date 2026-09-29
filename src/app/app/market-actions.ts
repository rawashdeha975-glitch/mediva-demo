"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bookings, reviews, subscriptions, pointsLedger, wheelSpins, accessGrants } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { DEMO_PATIENT_ID, getProvider } from "@/lib/care";
import {
  awardTask,
  getPointsBalance,
  grantFeatured,
  createAd,
  getActiveSubscription,
  spinsToday,
  dayKey,
  getBooking,
} from "@/lib/market";
import { getPackages, STORE, WHEEL, EXTRA_SPIN_COST, REVIEW_TAGS, type Tier } from "@/lib/catalog";

type R = { ok: true; id?: number } | { ok: false; error: string };
const refresh = () => revalidatePath("/app", "layout");

/* ------------------------------ patient ------------------------------ */
export async function createBookingAction(input: {
  providerId: number;
  date: string;
  time: string;
  address: string;
  need: string;
  shareRecord: boolean;
}): Promise<R> {
  const p = await getProvider(Number(input.providerId));
  if (!p) return { ok: false, error: "مقدم الخدمة غير موجود" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false, error: "اختر التاريخ" };
  if (input.date < dayKey()) return { ok: false, error: "لا يمكن الحجز في تاريخ سابق" };
  if (!/^\d{2}:\d{2}$/.test(input.time)) return { ok: false, error: "اختر الوقت" };
  if (!input.need?.trim() || input.need.trim().length < 3) return { ok: false, error: "صف احتياجك باختصار" };
  if (!input.address?.trim()) return { ok: false, error: "أدخل العنوان" };

  const [b] = await db
    .insert(bookings)
    .values({
      patientId: DEMO_PATIENT_ID,
      providerId: p.id,
      serviceType: p.serviceType,
      need: input.need.trim().slice(0, 300),
      address: input.address.trim().slice(0, 200),
      scheduledDate: input.date,
      scheduledTime: input.time,
    })
    .returning({ id: bookings.id });

  if (input.shareRecord) {
    const [g] = await db
      .select()
      .from(accessGrants)
      .where(and(eq(accessGrants.patientId, DEMO_PATIENT_ID), eq(accessGrants.providerId, p.id), isNull(accessGrants.revokedAt)));
    if (!g) await db.insert(accessGrants).values({ patientId: DEMO_PATIENT_ID, providerId: p.id, scopes: [p.serviceType] });
  }
  refresh();
  return { ok: true, id: b.id };
}

export async function submitReviewAction(input: {
  bookingId: number;
  rating: number;
  professionalism: number;
  punctuality: number;
  communication: number;
  tags: string[];
  comment: string;
}): Promise<R> {
  const b = await getBooking(Number(input.bookingId));
  if (!b || b.patientId !== DEMO_PATIENT_ID) return { ok: false, error: "الحجز غير موجود" };
  if (b.status !== "completed") return { ok: false, error: "التقييم متاح بعد إتمام الخدمة فقط" };
  if (b.reviewId) return { ok: false, error: "تم تقييم هذه الخدمة مسبقاً" };
  const vals = [input.rating, input.professionalism, input.punctuality, input.communication].map(Number);
  if (vals.some((v) => !Number.isInteger(v) || v < 1 || v > 5)) return { ok: false, error: "اختر تقييماً لكل معيار" };

  await db.insert(reviews).values({
    bookingId: b.id,
    patientId: DEMO_PATIENT_ID,
    providerId: b.providerId,
    rating: vals[0],
    professionalism: vals[1],
    punctuality: vals[2],
    communication: vals[3],
    tags: (input.tags ?? []).filter((t) => REVIEW_TAGS.includes(t)).slice(0, 6),
    comment: input.comment?.trim().slice(0, 500) || null,
  });
  if (vals[0] === 5) await awardTask(b.providerId, "five_star", "من ليلى");
  refresh();
  return { ok: true, id: b.id };
}

/* ------------------------------ provider: requests ------------------------------ */
export async function acceptBookingAction(formData: FormData) {
  const id = Number(formData.get("bookingId"));
  const pid = Number(formData.get("providerId"));
  const b = await getBooking(id);
  if (!b || b.providerId !== pid || b.status !== "pending") return;
  await db.update(bookings).set({ status: "accepted" }).where(eq(bookings.id, id));
  await awardTask(pid, "accept_fast");
  refresh();
}

export async function declineBookingAction(formData: FormData) {
  const id = Number(formData.get("bookingId"));
  const pid = Number(formData.get("providerId"));
  const b = await getBooking(id);
  if (!b || b.providerId !== pid || b.status === "completed") return;
  await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, id));
  refresh();
}

/* ------------------------------ provider: growth ------------------------------ */
export async function subscribeAction(formData: FormData) {
  const pid = Number(formData.get("providerId"));
  const tier = String(formData.get("tier")) as Tier;
  const p = await getProvider(pid);
  const pkg = p && getPackages(p.serviceType).find((x) => x.tier === tier);
  if (!p || !pkg) return;
  await db.update(subscriptions).set({ active: false }).where(eq(subscriptions.providerId, pid));
  if (tier !== "starter") {
    await db.insert(subscriptions).values({ providerId: pid, tier, adCredits: pkg.adCredits, endsAt: new Date(Date.now() + 30 * 86400000) });
    if (pkg.featuredDays) await grantFeatured(pid, pkg.featuredDays, "package");
  }
  refresh();
  redirect(`/app/provider/${pid}/packages?ok=${tier}`);
}

export async function redeemFeaturedAction(formData: FormData) {
  const pid = Number(formData.get("providerId"));
  const item = STORE.find((s) => s.key === formData.get("item") && s.kind === "featured");
  if (!item) return;
  const bal = await getPointsBalance(pid);
  if (bal < item.cost) redirect(`/app/provider/${pid}/rewards?err=balance`);
  await db.insert(pointsLedger).values({ providerId: pid, delta: -item.cost, reason: `🛒 استبدال: ${item.title}`, taskKey: "redeem", dayKey: dayKey() });
  await grantFeatured(pid, item.days, "points");
  refresh();
  redirect(`/app/provider/${pid}/rewards?ok=${item.key}`);
}

export async function createAdAction(input: { providerId: number; title: string; body: string; source: "package" | "points"; days: number }): Promise<R> {
  const pid = Number(input.providerId);
  const title = input.title?.trim() ?? "";
  const body = input.body?.trim() ?? "";
  if (title.length < 4 || title.length > 60) return { ok: false, error: "العنوان بين 4 و60 حرفاً" };
  if (body.length < 10 || body.length > 150) return { ok: false, error: "النص بين 10 و150 حرفاً" };

  if (input.source === "package") {
    const sub = await getActiveSubscription(pid);
    if (!sub || sub.adCredits < 1) return { ok: false, error: "لا يوجد رصيد إعلانات في باقتك" };
    await db.update(subscriptions).set({ adCredits: sub.adCredits - 1 }).where(eq(subscriptions.id, sub.id));
    const id = await createAd(pid, title, body, 7, "package");
    refresh();
    return { ok: true, id };
  }
  const item = STORE.find((s) => s.kind === "ad" && s.days === Number(input.days));
  if (!item) return { ok: false, error: "مدة غير صالحة" };
  const bal = await getPointsBalance(pid);
  if (bal < item.cost) return { ok: false, error: `تحتاج ${item.cost} نقطة (رصيدك ${bal})` };
  await db.insert(pointsLedger).values({ providerId: pid, delta: -item.cost, reason: `🛒 استبدال: ${item.title}`, taskKey: "redeem", dayKey: dayKey() });
  const id = await createAd(pid, title, body, item.days, "points");
  refresh();
  return { ok: true, id };
}

export async function checkinAction(formData: FormData) {
  const pid = Number(formData.get("providerId"));
  await awardTask(pid, "daily_checkin");
  refresh();
}

export async function spinWheelAction(providerId: number): Promise<
  { ok: true; index: number; label: string; balance: number } | { ok: false; error: string }
> {
  const p = await getProvider(Number(providerId));
  if (!p) return { ok: false, error: "مقدم خدمة غير معروف" };
  const { freeUsed } = await spinsToday(p.id);
  const paid = freeUsed;
  if (paid) {
    const bal = await getPointsBalance(p.id);
    if (bal < EXTRA_SPIN_COST) return { ok: false, error: `اللفّة الإضافية تحتاج ${EXTRA_SPIN_COST} نقطة` };
    await db.insert(pointsLedger).values({ providerId: p.id, delta: -EXTRA_SPIN_COST, reason: "🎡 لفّة إضافية لعجلة الحظ", taskKey: "wheel_cost", dayKey: dayKey() });
  }

  // server-side weighted random (the client only animates the result)
  const total = WHEEL.reduce((a, w) => a + w.weight, 0);
  let r = Math.random() * total;
  let index = 0;
  for (let i = 0; i < WHEEL.length; i++) {
    r -= WHEEL[i].weight;
    if (r <= 0) {
      index = i;
      break;
    }
  }
  const prize = WHEEL[index];
  if (prize.points) await db.insert(pointsLedger).values({ providerId: p.id, delta: prize.points, reason: `🎡 عجلة الحظ — ${prize.label}`, taskKey: "wheel", dayKey: dayKey() });
  if (prize.featuredDays) await grantFeatured(p.id, prize.featuredDays, "wheel");
  if (prize.adDays) await createAd(p.id, `${p.label} — ${p.name}`, (p.bio || `خدمات منزلية عبر MEDIVA في ${p.city}`).slice(0, 150), prize.adDays, "wheel");
  await db.insert(wheelSpins).values({ providerId: p.id, prizeKey: prize.key, paid, dayKey: dayKey() });

  refresh();
  return { ok: true, index, label: prize.label, balance: await getPointsBalance(p.id) };
}

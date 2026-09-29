import "server-only";
import { db } from "@/db";
import {
  patients,
  providers,
  bookings,
  reviews,
  subscriptions,
  featuredSlots,
  ads,
  pointsLedger,
  type ServiceType,
} from "@/db/schema";
import { sql } from "drizzle-orm";

const DAY = 86400000;
const ago = (d: number) => new Date(Date.now() - d * DAY);
const ahead = (d: number) => new Date(Date.now() + d * DAY);
const iso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Amman" }).format(d);

export const DEMO_PROVIDERS = [
  { id: 1, name: "محمد", serviceType: "nursing" as const, label: "ممرض منزلي — Nurse A", bio: "ممرض قانوني متخصص في رعاية ما بعد العمليات والعناية بالجروح في المنزل.", city: "عمّان — خلدا", experienceYears: 7, priceFrom: 20 },
  { id: 2, name: "سامر", serviceType: "nursing" as const, label: "ممرض منزلي — Nurse B (جديد)", bio: "ممرض منزلي جديد على المنصة، يقدّم الحقن والضمادات والعلامات الحيوية.", city: "عمّان — تلاع العلي", experienceYears: 2, priceFrom: 15 },
  { id: 3, name: "أحمد", serviceType: "physio" as const, label: "أخصائي علاج طبيعي", bio: "أخصائي علاج طبيعي — برامج إعادة تأهيل منزلية بعد الكسور وجراحات الركبة.", city: "عمّان — الصويفية", experienceYears: 9, priceFrom: 25 },
  { id: 4, name: "رنا", serviceType: "lab" as const, label: "فنية سحب عينات — مختبر", bio: "فنية مختبر لجمع العينات المنزلية صباحاً مع الالتزام بتعليمات الصيام.", city: "عمّان — الجبيهة", experienceYears: 5, priceFrom: 10 },
  { id: 5, name: "خالد", serviceType: "pharmacy" as const, label: "صيدلي", bio: "صيدلي — منتجات العناية المنزلية ومستلزمات الجروح والرعاية.", city: "عمّان — الشميساني", experienceYears: 6, priceFrom: 5 },
  { id: 6, name: "هبة", serviceType: "nursing" as const, label: "ممرضة منزلية", bio: "ممرضة منزلية لرعاية كبار السن والمتابعة الدورية ورعاية المرضى طريحي الفراش.", city: "عمّان — دابوق", experienceYears: 11, priceFrom: 25 },
  { id: 7, name: "يزن", serviceType: "physio" as const, label: "أخصائي علاج طبيعي رياضي", bio: "إصابات الملاعب، آلام الظهر والرقبة، وبرامج التقوية.", city: "عمّان — عبدون", experienceYears: 4, priceFrom: 22 },
  { id: 8, name: "دينا", serviceType: "physio" as const, label: "أخصائية تأهيل عصبي", bio: "تأهيل ما بعد الجلطات وتدريبات التوازن والمشي في المنزل.", city: "الزرقاء", experienceYears: 8, priceFrom: 24 },
  { id: 9, name: "عمر", serviceType: "lab" as const, label: "فني مختبر", bio: "جمع عينات منزلي للفحوصات الدورية وفحوصات ما قبل العمليات.", city: "إربد", experienceYears: 3, priceFrom: 8 },
  { id: 10, name: "لين", serviceType: "pharmacy" as const, label: "صيدلانية", bio: "منتجات الأم والطفل، المكملات، ومستلزمات الرعاية المنزلية.", city: "عمّان — مرج الحمام", experienceYears: 5, priceFrom: 5 },
  { id: 11, name: "نور", serviceType: "nursing" as const, label: "ممرضة منزلية", bio: "حقن وسيروم منزلي وقياس العلامات الحيوية.", city: "السلط", experienceYears: 4, priceFrom: 18 },
];

const OTHER_PATIENTS = ["سلمى", "فراس", "رهف", "باسل", "مي", "عدي", "تالا"];
const COMMENTS = [
  "خدمة ممتازة وملتزم جداً بالموعد.",
  "شرح كل خطوة بوضوح، شكراً.",
  "تعامل راقٍ ونظافة عالية.",
  "جيد، تأخر قليلاً لكن الخدمة ممتازة.",
  "أنصح به بشدة.",
  null,
];
const TAGS = ["ملتزم بالموعد", "لطيف ومحترم", "شرح واضح", "نظافة وتعقيم", "مهارة عالية", "أنصح به"];

// target average profile per provider (deterministic pseudo-random)
const PROFILE: Record<number, number[]> = {
  1: [5, 5, 4, 5, 5, 5],
  2: [4],
  3: [5, 5, 5, 4, 5, 5, 5],
  4: [5, 4, 5],
  5: [4, 5, 4],
  6: [5, 5, 5, 5, 4],
  7: [4, 4, 5],
  8: [5, 4, 5, 5],
  9: [4, 3, 4],
  10: [5, 4],
  11: [4, 5],
};

const NEED: Record<ServiceType, string> = {
  nursing: "تغيير ضماد ومتابعة",
  physio: "جلسة إعادة تأهيل",
  lab: "جمع عينة دم",
  pharmacy: "مستلزمات رعاية",
};

export async function seedMarket(noteIds: { id: number; providerId: number; serviceType: ServiceType; visitDate: string }[]) {
  // other patients for review variety
  await db.insert(patients).values(OTHER_PATIENTS.map((n, i) => ({ id: i + 2, name: n, city: "عمّان" })));
  await db.execute(sql`SELECT setval('patients_id_seq', ${OTHER_PATIENTS.length + 1})`);

  let k = 0;
  for (const [pidStr, ratings] of Object.entries(PROFILE)) {
    const pid = Number(pidStr);
    const prov = DEMO_PROVIDERS.find((p) => p.id === pid)!;
    for (const r of ratings) {
      k++;
      const when = ago(3 + ((k * 7) % 60));
      const [b] = await db
        .insert(bookings)
        .values({
          patientId: 2 + (k % OTHER_PATIENTS.length),
          providerId: pid,
          serviceType: prov.serviceType,
          need: NEED[prov.serviceType],
          address: "عمّان",
          scheduledDate: iso(when),
          scheduledTime: "10:00",
          status: "completed",
          createdAt: when,
          completedAt: when,
        })
        .returning({ id: bookings.id });
      await db.insert(reviews).values({
        bookingId: b.id,
        patientId: 2 + (k % OTHER_PATIENTS.length),
        providerId: pid,
        rating: r,
        professionalism: Math.min(5, r + (k % 2 === 0 ? 0 : 0)),
        punctuality: Math.max(3, r - (k % 3 === 0 ? 1 : 0)),
        communication: r,
        tags: [TAGS[k % TAGS.length], TAGS[(k + 2) % TAGS.length]],
        comment: COMMENTS[k % COMMENTS.length],
        createdAt: when,
      });
    }
  }

  // demo patient (Laila): completed bookings linked to her care notes
  for (const n of noteIds) {
    const when = new Date(`${n.visitDate}T12:00:00Z`);
    const [b] = await db
      .insert(bookings)
      .values({
        patientId: 1,
        providerId: n.providerId,
        serviceType: n.serviceType,
        need: NEED[n.serviceType],
        address: "عمّان — خلدا",
        scheduledDate: n.visitDate,
        scheduledTime: "11:00",
        status: "completed",
        careNoteId: n.id,
        createdAt: when,
        completedAt: when,
      })
      .returning({ id: bookings.id });
    // leave the latest nursing visit unrated → shows "rate after procedure" prompt
    if (n.id !== noteIds[noteIds.length - 1].id) {
      await db.insert(reviews).values({
        bookingId: b.id,
        patientId: 1,
        providerId: n.providerId,
        rating: 5,
        professionalism: 5,
        punctuality: n.serviceType === "nursing" ? 4 : 5,
        communication: 5,
        tags: ["ملتزم بالموعد", "شرح واضح"],
        comment: "تجربة مريحة، شكراً.",
        createdAt: when,
      });
    }
  }

  // upcoming requests
  await db.insert(bookings).values([
    { patientId: 1, providerId: 1, serviceType: "nursing", need: "رعاية تمريضية منزلية بعد عملية — تغيير ضماد", address: "عمّان — خلدا", scheduledDate: iso(ahead(1)), scheduledTime: "17:00", status: "pending" },
    { patientId: 1, providerId: 3, serviceType: "physio", need: "جلسة إعادة تأهيل — الجلسة 2", address: "عمّان — خلدا", scheduledDate: iso(ahead(2)), scheduledTime: "18:00", status: "accepted" },
    { patientId: 4, providerId: 1, serviceType: "nursing", need: "حقن منزلية حسب الوصفة", address: "عمّان — الرابية", scheduledDate: iso(ahead(1)), scheduledTime: "10:00", status: "pending" },
  ]);

  // packages
  await db.insert(subscriptions).values([
    { providerId: 1, tier: "pro", adCredits: 1, startsAt: ago(5), endsAt: ahead(25) },
    { providerId: 3, tier: "elite", adCredits: 5, startsAt: ago(10), endsAt: ahead(20) },
    { providerId: 6, tier: "pro", adCredits: 2, startsAt: ago(2), endsAt: ahead(28) },
  ]);
  await db.insert(featuredSlots).values([
    { providerId: 1, source: "package", startsAt: ago(1), endsAt: ahead(4) },
    { providerId: 3, source: "package", startsAt: ago(10), endsAt: ahead(20) },
    { providerId: 10, source: "points", startsAt: ago(1), endsAt: ahead(2) },
  ]);
  await db.insert(ads).values([
    { providerId: 3, title: "برنامج تأهيل الركبة في بيتك", body: "خطة من 8 جلسات منزلية بعد جراحات الركبة — احجز جلستك الأولى.", source: "package", startsAt: ago(3), endsAt: ahead(4), impressions: 412, clicks: 37 },
    { providerId: 6, title: "رعاية كبار السن بلمسة إنسانية", body: "زيارات تمريضية دورية ومتابعة منتظمة لأحبائك في المنزل.", source: "package", startsAt: ago(1), endsAt: ahead(6), impressions: 158, clicks: 12 },
    { providerId: 10, title: "مستلزمات الرعاية المنزلية", body: "شاش، ضمادات ومستلزمات عناية تصلك من صيدلية لين.", source: "wheel", startsAt: ago(1), endsAt: ahead(1), impressions: 96, clicks: 9 },
  ]);

  // points history
  const hist: [number, number, string, string][] = [
    [1, 100, "✅ إتمام خدمة لمريض (×1.5)", "complete_booking"],
    [1, 60, "✅ إتمام خدمة لمريض (×1.5)", "complete_booking"],
    [1, 30, "📋 توثيق ملاحظة رعاية (×1.5)", "care_note"],
    [1, 45, "⭐ الحصول على تقييم 5 نجوم (×1.5)", "five_star"],
    [1, 250, "🎡 عجلة الحظ — 250 نقطة", "wheel"],
    [1, -120, "🛒 استبدال: ظهور مميز — يوم واحد", "redeem"],
    [2, 40, "✅ إتمام خدمة لمريض", "complete_booking"],
    [3, 480, "رصيد نقاط سابق", "legacy"],
    [6, 320, "رصيد نقاط سابق", "legacy"],
  ];
  for (const [i, h] of hist.entries()) {
    await db.insert(pointsLedger).values({ providerId: h[0], delta: h[1], reason: h[2], taskKey: h[3], dayKey: iso(ago(12 - i)), createdAt: ago(12 - i) });
  }
}



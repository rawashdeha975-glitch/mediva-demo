import "server-only";
import { db } from "@/db";
import {
  patients,
  providers,
  careNotes,
  careNoteVersions,
  accessGrants,
  accessLog,
  issueReports,
  type ServiceType,
  type CareNoteData,
} from "@/db/schema";
import { and, desc, eq, isNull, inArray, sql } from "drizzle-orm";
import { seedMarket, DEMO_PROVIDERS } from "@/lib/seed-market";

export const DEMO_PATIENT_ID = 1;

/* ------------------------------------------------------------------ */
/*  Demo seed (idempotent). All data is fictional demo data.          */
/* ------------------------------------------------------------------ */
let seedPromise: Promise<void> | null = null;

export function ensureSeed() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(patients);
      if (Number(count) === 0) await seedDemo();
    })().catch((e) => {
      seedPromise = null; // allow retry on failure
      throw e;
    });
  }
  return seedPromise;
}

export async function seedDemo() {
  await db.execute(
    sql`TRUNCATE wheel_spins, points_ledger, ads, featured_slots, subscriptions, reviews, bookings, issue_reports, access_log, access_grants, care_note_versions, care_notes, providers, patients RESTART IDENTITY CASCADE`
  );

  await db.insert(patients).values({ id: 1, name: "ليلى أحمد", city: "عمّان — خلدا" });
  await db.insert(providers).values(DEMO_PROVIDERS);
  await db.execute(sql`SELECT setval('patients_id_seq', 1)`);
  await db.execute(sql`SELECT setval('providers_id_seq', ${DEMO_PROVIDERS.length})`);
  const createdNotes: { id: number; providerId: number; serviceType: ServiceType; visitDate: string }[] = [];

  const seedNotes: {
    providerId: number;
    serviceType: ServiceType;
    title: string;
    visitDate: string;
    durationMin: number;
    data: CareNoteData;
  }[] = [
    {
      providerId: 4,
      serviceType: "lab",
      title: "جمع عينة منزلي",
      visitDate: "2026-09-02",
      durationMin: 15,
      data: {
        sampleType: "دم",
        collectionTime: "08:30 صباحاً",
        sampleStatus: "سليمة",
        notes: "تم جمع العينة وفق الإجراء المتبع.",
      },
    },
    {
      providerId: 3,
      serviceType: "physio",
      title: "جلسة إعادة تأهيل — الجلسة 1",
      visitDate: "2026-09-05",
      durationMin: 50,
      data: {
        sessionType: "جلسة إعادة تأهيل منزلية",
        exercises: ["تمارين مدى الحركة", "تمارين تقوية"],
        notes: "تم تنفيذ برنامج الجلسة الأولى حسب الخطة.",
        followUp: "الجلسة الثانية حسب البرنامج المتفق عليه.",
      },
    },
    {
      providerId: 1,
      serviceType: "nursing",
      title: "العناية بالجرح",
      visitDate: "2026-09-09",
      durationMin: 20,
      data: {
        reason: "العناية بالجرح",
        procedures: ["تنظيف الجرح", "تغيير الضماد"],
        notes: "تم تنظيف الجرح وتغيير الضماد وفق الإجراء المتبع.",
        followUp: "زيارة متابعة خلال أيام حسب خطة الرعاية.",
      },
    },
    {
      providerId: 5,
      serviceType: "pharmacy",
      title: "طلب مستلزمات ضماد",
      visitDate: "2026-09-10",
      durationMin: 10,
      data: {
        requestType: "مستلزمات عناية بالجروح",
        orderStatus: "تم التسليم",
        notes: "تم تجهيز الطلب وتسليمه.",
      },
    },
    {
      providerId: 1,
      serviceType: "nursing",
      title: "متابعة ما بعد العملية",
      visitDate: "2026-09-12",
      durationMin: 45,
      data: {
        reason: "متابعة ما بعد العملية",
        procedures: [
          "تقييم الحالة العامة",
          "قياس العلامات الحيوية",
          "تغيير الضماد",
          "إعطاء الدواء حسب الوصفة",
          "تقييم موضع الجرح",
        ],
        notes: "تم تغيير الضماد وفق الإجراء المتبع، وتمت متابعة حالة الجرح.",
        followUp: "زيارة متابعة حسب خطة الرعاية.",
      },
    },
  ];

  for (const n of seedNotes) {
    const [row] = await db
      .insert(careNotes)
      .values({ patientId: 1, ...n })
      .returning({ id: careNotes.id });
    await db.insert(careNoteVersions).values({
      noteId: row.id,
      version: 1,
      action: "created",
      actorProviderId: n.providerId,
      snapshot: { ...n.data, durationMin: String(n.durationMin) },
    });
    createdNotes.push({ id: row.id, providerId: n.providerId, serviceType: n.serviceType, visitDate: n.visitDate });
  }

  // Demonstrate an amendment in the audit trail (note #3: 9 Sep)
  await db.update(careNotes).set({ durationMin: 30, version: 2 }).where(eq(careNotes.id, 3));
  await db.insert(careNoteVersions).values({
    noteId: 3,
    version: 2,
    action: "amended",
    actorProviderId: 1,
    reason: "تصحيح مدة الزيارة المسجلة",
    changes: [{ field: "durationMin", before: "20", after: "30" }],
    snapshot: { ...seedNotes[2].data, durationMin: "30" },
  });

  // Patient consent — Nurse B (id 2) intentionally has NO access yet
  await db.insert(accessGrants).values([
    { patientId: 1, providerId: 1, scopes: ["nursing"] },
    { patientId: 1, providerId: 3, scopes: ["physio"] },
    { patientId: 1, providerId: 4, scopes: ["lab"] },
    { patientId: 1, providerId: 5, scopes: ["pharmacy"] },
  ]);

  await seedMarket(createdNotes);
}

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */
export async function getPatient() {
  await ensureSeed();
  const [p] = await db.select().from(patients).where(eq(patients.id, DEMO_PATIENT_ID));
  return p;
}

export async function getProviders() {
  await ensureSeed();
  return db.select().from(providers).orderBy(providers.id);
}

export async function getProvider(id: number) {
  await ensureSeed();
  const [p] = await db.select().from(providers).where(eq(providers.id, id));
  return p ?? null;
}

const noteSelect = {
  id: careNotes.id,
  patientId: careNotes.patientId,
  providerId: careNotes.providerId,
  serviceType: careNotes.serviceType,
  title: careNotes.title,
  visitDate: careNotes.visitDate,
  durationMin: careNotes.durationMin,
  data: careNotes.data,
  version: careNotes.version,
  createdAt: careNotes.createdAt,
  updatedAt: careNotes.updatedAt,
  providerName: providers.name,
  providerLabel: providers.label,
};

/** Patient view: full own record (read-only) */
export async function getPatientTimeline() {
  await ensureSeed();
  return db
    .select(noteSelect)
    .from(careNotes)
    .innerJoin(providers, eq(careNotes.providerId, providers.id))
    .where(eq(careNotes.patientId, DEMO_PATIENT_ID))
    .orderBy(desc(careNotes.visitDate), desc(careNotes.id));
}

export async function getNote(id: number) {
  await ensureSeed();
  const [n] = await db
    .select(noteSelect)
    .from(careNotes)
    .innerJoin(providers, eq(careNotes.providerId, providers.id))
    .where(eq(careNotes.id, id));
  return n ?? null;
}

export async function getNoteVersions(noteId: number) {
  return db
    .select({
      id: careNoteVersions.id,
      version: careNoteVersions.version,
      action: careNoteVersions.action,
      reason: careNoteVersions.reason,
      changes: careNoteVersions.changes,
      createdAt: careNoteVersions.createdAt,
      actorName: providers.name,
    })
    .from(careNoteVersions)
    .innerJoin(providers, eq(careNoteVersions.actorProviderId, providers.id))
    .where(eq(careNoteVersions.noteId, noteId))
    .orderBy(desc(careNoteVersions.version));
}

export async function getNoteIssues(noteId: number) {
  return db
    .select()
    .from(issueReports)
    .where(eq(issueReports.noteId, noteId))
    .orderBy(desc(issueReports.createdAt));
}

export async function getActiveGrant(providerId: number) {
  const [g] = await db
    .select()
    .from(accessGrants)
    .where(
      and(
        eq(accessGrants.patientId, DEMO_PATIENT_ID),
        eq(accessGrants.providerId, providerId),
        isNull(accessGrants.revokedAt)
      )
    );
  return g ?? null;
}

export async function getGrantsOverview() {
  await ensureSeed();
  const all = await getProviders();
  const grants = await db
    .select()
    .from(accessGrants)
    .where(and(eq(accessGrants.patientId, DEMO_PATIENT_ID), isNull(accessGrants.revokedAt)));
  return all.map((p) => ({
    provider: p,
    grant: grants.find((g) => g.providerId === p.id) ?? null,
  }));
}

/**
 * Role-Based Access + Patient Consent.
 * A provider sees ONLY notes whose service type is inside the scope the
 * patient granted them. Every attempt (allowed or denied) is logged.
 */
export async function getRecordForProvider(providerId: number) {
  await ensureSeed();
  const provider = await getProvider(providerId);
  if (!provider) return { allowed: false as const, scopes: [], notes: [] };

  const grant = await getActiveGrant(providerId);
  if (!grant || grant.scopes.length === 0) {
    await db.insert(accessLog).values({
      patientId: DEMO_PATIENT_ID,
      providerId,
      outcome: "denied",
      detail: "لا توجد موافقة نشطة من المريض",
    });
    return { allowed: false as const, scopes: [] as ServiceType[], notes: [] };
  }

  const notes = await db
    .select(noteSelect)
    .from(careNotes)
    .innerJoin(providers, eq(careNotes.providerId, providers.id))
    .where(
      and(
        eq(careNotes.patientId, DEMO_PATIENT_ID),
        inArray(careNotes.serviceType, grant.scopes)
      )
    )
    .orderBy(desc(careNotes.visitDate), desc(careNotes.id));

  await db.insert(accessLog).values({
    patientId: DEMO_PATIENT_ID,
    providerId,
    outcome: "allowed",
    detail: `نطاق الاطلاع: ${grant.scopes.join(", ")}`,
  });

  return { allowed: true as const, scopes: grant.scopes, notes };
}

export async function getAccessLog(limit = 12) {
  await ensureSeed();
  return db
    .select({
      id: accessLog.id,
      outcome: accessLog.outcome,
      detail: accessLog.detail,
      createdAt: accessLog.createdAt,
      providerName: providers.name,
      providerLabel: providers.label,
    })
    .from(accessLog)
    .innerJoin(providers, eq(accessLog.providerId, providers.id))
    .where(eq(accessLog.patientId, DEMO_PATIENT_ID))
    .orderBy(desc(accessLog.createdAt))
    .limit(limit);
}

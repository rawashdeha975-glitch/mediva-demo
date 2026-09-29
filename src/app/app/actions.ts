"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  careNotes,
  careNoteVersions,
  accessGrants,
  issueReports,
  type CareNoteData,
} from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { DEMO_PATIENT_ID, getProvider, getNote, seedDemo } from "@/lib/care";
import { structureCareNote, type StructureResult } from "@/lib/ai";
import { TEMPLATES, valueToText } from "@/lib/templates";
import { bookings } from "@/db/schema";
import { awardTask, getBooking } from "@/lib/market";

type ActionResult = { ok: true; id?: number } | { ok: false; error: string };

function sanitize(type: keyof typeof TEMPLATES, data: CareNoteData): CareNoteData {
  const out: CareNoteData = {};
  for (const f of TEMPLATES[type].fields) {
    const v = data[f.key];
    if (v === undefined) continue;
    if (f.kind === "checklist") {
      const arr = (Array.isArray(v) ? v : [v]).filter((x) => f.options.includes(x));
      if (arr.length) out[f.key] = arr;
    } else if (f.kind === "select") {
      const s = Array.isArray(v) ? v[0] : v;
      if (s && f.options.includes(s)) out[f.key] = s;
    } else {
      const s = String(Array.isArray(v) ? v.join("، ") : v).trim().slice(0, 1500);
      if (s) out[f.key] = s;
    }
  }
  return out;
}

export async function aiStructureAction(providerId: number, text: string): Promise<StructureResult | { error: string }> {
  const provider = await getProvider(providerId);
  if (!provider) return { error: "مقدم خدمة غير معروف" };
  if (!text || text.trim().length < 5) return { error: "اكتب وصفاً مختصراً للزيارة أولاً" };
  return structureCareNote(provider.serviceType, text);
}

export async function createCareNoteAction(
  providerId: number,
  input: { title: string; visitDate: string; durationMin: number; data: CareNoteData; confirmed: boolean; bookingId?: number }
): Promise<ActionResult> {
  const provider = await getProvider(providerId);
  if (!provider) return { ok: false, error: "مقدم خدمة غير معروف" };
  if (!input.confirmed) return { ok: false, error: "يجب مراجعة الملاحظة وتأكيدها قبل الحفظ" };
  if (!input.title?.trim()) return { ok: false, error: "أدخل عنوان / نوع الزيارة" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.visitDate)) return { ok: false, error: "تاريخ الزيارة غير صحيح" };
  const duration = Math.round(Number(input.durationMin));
  if (!duration || duration < 1 || duration > 600) return { ok: false, error: "مدة الزيارة غير صحيحة" };

  const data = sanitize(provider.serviceType, input.data ?? {});
  if (Object.keys(data).length === 0) return { ok: false, error: "الملاحظة فارغة — أكمل حقلاً واحداً على الأقل" };

  const [row] = await db
    .insert(careNotes)
    .values({
      patientId: DEMO_PATIENT_ID,
      providerId,
      serviceType: provider.serviceType,
      title: input.title.trim().slice(0, 200),
      visitDate: input.visitDate,
      durationMin: duration,
      data,
    })
    .returning({ id: careNotes.id });

  await db.insert(careNoteVersions).values({
    noteId: row.id,
    version: 1,
    action: "created",
    actorProviderId: providerId,
    snapshot: { ...data, durationMin: String(duration) },
  });

  // Completing the linked booking → patient gets a rating prompt, provider earns points
  if (input.bookingId) {
    const b = await getBooking(Number(input.bookingId));
    if (b && b.providerId === providerId && (b.status === "accepted" || b.status === "pending")) {
      await db
        .update(bookings)
        .set({ status: "completed", careNoteId: row.id, completedAt: new Date() })
        .where(eq(bookings.id, b.id));
      await awardTask(providerId, "complete_booking", b.need.slice(0, 40));
    }
  }
  await awardTask(providerId, "care_note");

  revalidatePath("/app", "layout");
  return { ok: true, id: row.id };
}

export async function amendCareNoteAction(
  providerId: number,
  noteId: number,
  input: { durationMin: number; data: CareNoteData; reason: string }
): Promise<ActionResult> {
  const note = await getNote(noteId);
  if (!note) return { ok: false, error: "الملاحظة غير موجودة" };
  if (note.providerId !== providerId)
    return { ok: false, error: "يمكن فقط لكاتب الملاحظة إضافة تصحيح عليها" };
  if (!input.reason || input.reason.trim().length < 3)
    return { ok: false, error: "سبب التصحيح مطلوب لتوثيقه في سجل التدقيق" };

  const data = sanitize(note.serviceType, input.data ?? {});
  const duration = Math.round(Number(input.durationMin)) || note.durationMin;

  const changes: { field: string; before: string; after: string }[] = [];
  const keys = new Set([...Object.keys(note.data), ...Object.keys(data)]);
  for (const k of keys) {
    const before = valueToText(note.data[k]);
    const after = valueToText(data[k]);
    if (before !== after) changes.push({ field: k, before, after });
  }
  if (duration !== note.durationMin)
    changes.push({ field: "durationMin", before: String(note.durationMin), after: String(duration) });
  if (changes.length === 0) return { ok: false, error: "لم يتم تغيير أي شيء" };

  const version = note.version + 1;
  await db
    .update(careNotes)
    .set({ data, durationMin: duration, version, updatedAt: new Date() })
    .where(eq(careNotes.id, noteId));
  await db.insert(careNoteVersions).values({
    noteId,
    version,
    action: "amended",
    actorProviderId: providerId,
    reason: input.reason.trim().slice(0, 500),
    changes,
    snapshot: { ...data, durationMin: String(duration) },
  });

  revalidatePath("/app", "layout");
  return { ok: true, id: noteId };
}

export async function grantAccessAction(formData: FormData) {
  const providerId = Number(formData.get("providerId"));
  const provider = await getProvider(providerId);
  if (!provider) return;
  const existing = await db
    .select()
    .from(accessGrants)
    .where(
      and(
        eq(accessGrants.patientId, DEMO_PATIENT_ID),
        eq(accessGrants.providerId, providerId),
        isNull(accessGrants.revokedAt)
      )
    );
  if (existing.length === 0) {
    await db.insert(accessGrants).values({
      patientId: DEMO_PATIENT_ID,
      providerId,
      scopes: [provider.serviceType], // least privilege: only the provider's own service scope
    });
  }
  revalidatePath("/app", "layout");
}

export async function revokeAccessAction(formData: FormData) {
  const providerId = Number(formData.get("providerId"));
  await db
    .update(accessGrants)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(accessGrants.patientId, DEMO_PATIENT_ID),
        eq(accessGrants.providerId, providerId),
        isNull(accessGrants.revokedAt)
      )
    );
  revalidatePath("/app", "layout");
}

export async function reportIssueAction(formData: FormData) {
  const noteId = Number(formData.get("noteId"));
  const message = String(formData.get("message") ?? "").trim();
  if (!noteId || message.length < 3) return;
  await db.insert(issueReports).values({ noteId, message: message.slice(0, 1000) });
  revalidatePath("/app", "layout");
}

export async function resetDemoAction() {
  await seedDemo();
  revalidatePath("/app", "layout");
}

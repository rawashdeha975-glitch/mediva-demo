import { notFound } from "next/navigation";
import { getNote, getNoteVersions, getNoteIssues, DEMO_PATIENT_ID } from "@/lib/care";
import { AppHeader, NoteBody, AuditTrail, ServiceChip } from "@/components/app/ui";
import { reportIssueAction } from "@/app/app/actions";
import { formatDateTimeAr } from "@/lib/templates";

export default async function PatientNote({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getNote(Number(id));
  if (!note || note.patientId !== DEMO_PATIENT_ID) notFound();
  const [versions, issues] = await Promise.all([getNoteVersions(note.id), getNoteIssues(note.id)]);

  return (
    <div className="pb-8">
      <AppHeader title={note.title} subtitle={`مقدم الخدمة: ${note.providerName}`} back="/app/patient/record" />
      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center justify-between">
          <ServiceChip type={note.serviceType} />
          <span className="rounded-full bg-mist px-2.5 py-1 text-[10px] font-bold text-navy-600">👁️ عرض فقط — لا يمكن للمريض التعديل</span>
        </div>
        <NoteBody type={note.serviceType} data={note.data} durationMin={note.durationMin} visitDate={note.visitDate} />
        <AuditTrail versions={versions} type={note.serviceType} />

        <div className="rounded-2xl border border-line p-4">
          <p className="text-xs font-bold">⚑ الإبلاغ عن مشكلة <span className="ltr text-navy-400">Report an Issue</span></p>
          <p className="mt-1 text-[11px] text-navy-400">يصل البلاغ لمقدم الخدمة ليصدر تصحيحاً موثقاً إن لزم.</p>
          {issues.map((i) => (
            <div key={i.id} className="mt-2 rounded-xl bg-amber-50 p-2.5 text-[12px] ring-1 ring-amber-200">
              <p>{i.message}</p>
              <p className="mt-0.5 text-[10px] text-amber-700">مفتوح · {formatDateTimeAr(i.createdAt)}</p>
            </div>
          ))}
          <form action={reportIssueAction} className="mt-3 flex gap-2">
            <input type="hidden" name="noteId" value={note.id} />
            <input
              name="message"
              required
              minLength={3}
              placeholder="مثال: تاريخ الزيارة غير دقيق"
              className="flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <button className="rounded-xl bg-navy-900 px-3 text-xs font-bold text-white">إرسال</button>
          </form>
        </div>
      </div>
    </div>
  );
}

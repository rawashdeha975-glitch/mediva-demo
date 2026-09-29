import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvider, getNote, getActiveGrant, getNoteVersions, getNoteIssues } from "@/lib/care";
import { AppHeader, NoteBody, AuditTrail, ServiceChip } from "@/components/app/ui";

export default async function ProviderNote({
  params,
  searchParams,
}: {
  params: Promise<{ pid: string; id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ pid, id }, { saved }] = await Promise.all([params, searchParams]);
  const provider = await getProvider(Number(pid));
  const note = await getNote(Number(id));
  if (!provider || !note) notFound();

  const isAuthor = note.providerId === provider.id;
  const grant = await getActiveGrant(provider.id);
  const inScope = !!grant && grant.scopes.includes(note.serviceType);

  if (!isAuthor && !inScope) {
    return (
      <div>
        <AppHeader title="غير مسموح" back={`/app/provider/${provider.id}`} />
        <p className="px-5 py-12 text-center text-sm text-navy-600">🔒 هذه الملاحظة خارج نطاق صلاحيتك.</p>
      </div>
    );
  }

  const [versions, issues] = await Promise.all([getNoteVersions(note.id), getNoteIssues(note.id)]);

  return (
    <div className="pb-8">
      <AppHeader title={note.title} subtitle={`كتبها: ${note.providerName}`} back={`/app/provider/${provider.id}/record`} />
      <div className="space-y-4 px-5 py-5">
        {saved && (
          <p className="rounded-2xl bg-emerald-600 p-3 text-center text-sm font-bold text-white">
            ✓ تم الحفظ وتوثيقه في سجل التدقيق
          </p>
        )}
        <ServiceChip type={note.serviceType} />
        <NoteBody type={note.serviceType} data={note.data} durationMin={note.durationMin} visitDate={note.visitDate} />

        {issues.length > 0 && isAuthor && (
          <div className="rounded-2xl bg-amber-50 p-3 text-[12px] ring-1 ring-amber-200">
            <p className="font-bold text-amber-800">⚑ بلاغات من المريض ({issues.length})</p>
            {issues.map((i) => (
              <p key={i.id} className="mt-1">• {i.message}</p>
            ))}
          </div>
        )}

        <AuditTrail versions={versions} type={note.serviceType} />

        {isAuthor ? (
          <Link
            href={`/app/provider/${provider.id}/note/${note.id}/amend`}
            className="block rounded-full border border-navy-900 py-3 text-center text-sm font-bold text-navy-900"
          >
            إضافة تصحيح (Amendment)
          </Link>
        ) : (
          <p className="text-center text-[11px] text-navy-400">للاطلاع فقط — التصحيح متاح لكاتب الملاحظة وحده.</p>
        )}
      </div>
    </div>
  );
}

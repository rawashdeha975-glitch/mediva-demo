import { notFound } from "next/navigation";
import { getProvider, getNote } from "@/lib/care";
import { AppHeader } from "@/components/app/ui";
import NoteEditor from "@/components/app/NoteEditor";

export default async function AmendNote({ params }: { params: Promise<{ pid: string; id: string }> }) {
  const { pid, id } = await params;
  const provider = await getProvider(Number(pid));
  const note = await getNote(Number(id));
  if (!provider || !note) notFound();

  if (note.providerId !== provider.id) {
    return (
      <div>
        <AppHeader title="غير مسموح" back={`/app/provider/${provider.id}`} />
        <p className="px-5 py-12 text-center text-sm text-navy-600">التصحيح متاح فقط لكاتب الملاحظة.</p>
      </div>
    );
  }

  return (
    <div>
      <AppHeader title="تصحيح الملاحظة" subtitle={`${note.title} · v${note.version} → v${note.version + 1}`} back={`/app/provider/${provider.id}/record/${note.id}`} />
      <p className="mx-5 mt-4 rounded-2xl bg-amber-50 p-3 text-[12px] leading-5 text-amber-800 ring-1 ring-amber-200">
        لا يُحذف السجل القديم بصمت — تُحفظ النسخة السابقة والفروقات وسبب التصحيح في سجل التدقيق.
      </p>
      <NoteEditor
        mode="amend"
        providerId={provider.id}
        serviceType={provider.serviceType}
        noteId={note.id}
        initial={{ data: note.data, durationMin: note.durationMin }}
      />
    </div>
  );
}

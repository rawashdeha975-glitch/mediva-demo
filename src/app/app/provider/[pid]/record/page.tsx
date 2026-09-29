import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvider, getRecordForProvider } from "@/lib/care";
import { AppHeader, Timeline } from "@/components/app/ui";
import { TEMPLATES } from "@/lib/templates";

export default async function ProviderRecord({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params;
  const provider = await getProvider(Number(pid));
  if (!provider) notFound();
  const rec = await getRecordForProvider(provider.id);

  return (
    <div className="pb-8">
      <AppHeader title="Patient Care Record" subtitle="🔒 Access controlled" back={`/app/provider/${provider.id}`} />
      {!rec.allowed ? (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-navy-900 text-4xl">🔒</div>
          <p className="mt-5 text-lg font-bold">لا تملك صلاحية على هذا السجل</p>
          <p className="mx-auto mt-2 max-w-xs text-[13px] leading-6 text-navy-600">
            يمكنك تنفيذ الخدمة وكتابة ملاحظتك، لكن الاطلاع على الزيارات السابقة يتطلب <strong>موافقة المريض</strong>.
            تم تسجيل هذه المحاولة في سجل الاطلاع.
          </p>
          <Link href="/app/patient/access" className="mt-6 inline-block rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white">
            (Demo) انتقل لتطبيق المريض لمنح الصلاحية
          </Link>
        </div>
      ) : (
        <>
          <div className="mx-5 mt-4 rounded-2xl bg-emerald-50 p-3 text-[12px] leading-5 text-emerald-800 ring-1 ring-emerald-200">
            🔓 نطاق الاطلاع الممنوح: <strong>{rec.scopes.map((s) => TEMPLATES[s].serviceLabel).join("، ")}</strong> فقط.
            السجلات الأخرى محجوبة. <span className="ltr">Continuity of Care</span> ✓
          </div>
          <Timeline notes={rec.notes} hrefBase={`/app/provider/${provider.id}/record`} />
        </>
      )}
    </div>
  );
}

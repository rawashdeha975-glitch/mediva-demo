import { getGrantsOverview, getAccessLog } from "@/lib/care";
import { AppHeader } from "@/components/app/ui";
import { grantAccessAction, revokeAccessAction } from "@/app/app/actions";
import { TEMPLATES, formatDateTimeAr } from "@/lib/templates";

export default async function AccessPage() {
  const [rows, log] = await Promise.all([getGrantsOverview(), getAccessLog(8)]);
  return (
    <div className="pb-8">
      <AppHeader title="🔒 صلاحيات الوصول" subtitle="Role-Based Access + Patient Consent" back="/app/patient" />
      <div className="space-y-3 px-5 py-5">
        <p className="rounded-2xl bg-navy-900 p-4 text-[12px] leading-6 text-white/85">
          كل مقدم خدمة يرى فقط السجلات المرتبطة <strong className="text-emerald-300">بنوع خدمته</strong> وبعد موافقتك.
          الصيدلية مثلاً لا ترى سجلات التمريض أو العلاج الطبيعي.
        </p>
        {rows.map(({ provider, grant }) => (
          <div key={provider.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5">
            <span className="grid size-10 place-items-center rounded-xl bg-mist text-lg">{TEMPLATES[provider.serviceType].emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-bold">{provider.name}</p>
              <p className="text-[11px] text-navy-400">
                {grant ? `يرى: ${grant.scopes.map((s) => TEMPLATES[s].serviceLabel).join("، ")} فقط` : "لا يملك صلاحية على سجلك"}
              </p>
            </div>
            <form action={grant ? revokeAccessAction : grantAccessAction}>
              <input type="hidden" name="providerId" value={provider.id} />
              <button
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                  grant ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "bg-emerald-600 text-white"
                }`}
              >
                {grant ? "سحب" : "منح"}
              </button>
            </form>
          </div>
        ))}

        <div className="rounded-2xl border border-line p-4">
          <p className="text-xs font-bold">🕵️ من اطّلع على سجلي؟</p>
          {log.length === 0 && <p className="mt-2 text-[11px] text-navy-400">لا توجد محاولات اطلاع بعد.</p>}
          <ul className="mt-2 space-y-1.5">
            {log.map((l) => (
              <li key={l.id} className="flex items-center justify-between text-[11px]">
                <span>
                  {l.outcome === "allowed" ? "✅" : "⛔"} {l.providerName}{" "}
                  <span className="text-navy-400">{l.outcome === "allowed" ? "اطّلع" : "مُنع"}</span>
                </span>
                <span className="text-navy-400">{formatDateTimeAr(l.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getProvider } from "@/lib/care";
import { getProviderAds, getActiveSubscription, getPointsBalance } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import AdForm from "@/components/app/AdForm";
import { formatDateTimeAr } from "@/lib/templates";

const SRC: Record<string, string> = { package: "👑 باقة", points: "🎁 نقاط", wheel: "🎡 عجلة الحظ" };

export default async function Ads({
  params,
  searchParams,
}: {
  params: Promise<{ pid: string }>;
  searchParams: Promise<{ t?: string; b?: string; source?: string; days?: string }>;
}) {
  const [{ pid }, q] = await Promise.all([params, searchParams]);
  const p = await getProvider(Number(pid));
  if (!p) notFound();
  const [list, sub, bal] = await Promise.all([getProviderAds(p.id), getActiveSubscription(p.id), getPointsBalance(p.id)]);
  const now = new Date();

  return (
    <div>
      <AppHeader title="إعلاناتي" subtitle="إعلانات داخل تطبيق المرضى" back={`/app/provider/${p.id}`} />
      <div className="space-y-4 px-5 py-5">
        <AdForm
          providerId={p.id}
          credits={sub?.adCredits ?? 0}
          balance={bal}
          initial={{ title: q.t ?? "", body: q.b ?? "", source: q.source === "points" ? "points" : "package", days: Number(q.days) === 7 ? 7 : 3 }}
        />
        <p className="text-xs font-bold text-navy-400">إعلاناتك ({list.length})</p>
        {list.map((a) => {
          const live = new Date(a.endsAt) > now;
          const ctr = a.impressions ? ((a.clicks / a.impressions) * 100).toFixed(1) : "0";
          return (
            <div key={a.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold">{a.title}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${live ? "bg-emerald-50 text-emerald-700" : "bg-mist text-navy-400"}`}>{live ? "● نشط" : "منتهٍ"}</span>
              </div>
              <p className="mt-1 text-[11px] text-navy-600">{a.body}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[["مشاهدات", a.impressions], ["نقرات", a.clicks], ["CTR", `${ctr}%`]].map(([k, v]) => (
                  <div key={String(k)} className="rounded-xl bg-mist p-2">
                    <p className="text-sm font-bold">{v}</p>
                    <p className="text-[10px] text-navy-400">{k}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-navy-400">{SRC[a.source]} · حتى {formatDateTimeAr(a.endsAt)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

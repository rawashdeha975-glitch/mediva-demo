import { notFound } from "next/navigation";
import { getProvider } from "@/lib/care";
import { getReviewBreakdown, getProviderReviews } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import { Stars } from "@/components/app/market-ui";
import { formatDateTimeAr } from "@/lib/templates";

export default async function ProviderReviews({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params;
  const p = await getProvider(Number(pid));
  if (!p) notFound();
  const [br, rv] = await Promise.all([getReviewBreakdown(p.id), getProviderReviews(p.id, 50)]);

  return (
    <div>
      <AppHeader title="تقييماتي" subtitle="تقييم بعد كل خدمة مكتملة" back={`/app/provider/${p.id}`} />
      <div className="space-y-4 px-5 py-5">
        <div className="rounded-3xl bg-navy-900 p-5 text-center text-white">
          <p className="text-5xl font-bold">{br.avg || "—"}</p>
          <div className="mt-1"><Stars value={br.avg} size="text-lg" /></div>
          <p className="mt-1 text-[11px] text-white/60">{br.count} تقييم موثّق</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[["الاحترافية", br.professionalism], ["الالتزام", br.punctuality], ["التواصل", br.communication]].map(([k, v]) => (
              <div key={String(k)} className="rounded-xl bg-white/8 p-2 ring-1 ring-white/10">
                <p className="font-bold">{v}</p>
                <p className="text-[10px] text-white/60">{k}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-800 ring-1 ring-emerald-200">💡 كل تقييم 5 نجوم يكسبك نقاطاً. اسأل المساعد الذكي «ملخص تقييماتي» لتحليل نقاط القوة والتحسين.</p>
        {rv.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold">{r.patientName}</span>
              <Stars value={r.rating} size="text-xs" />
            </div>
            {r.comment && <p className="mt-1 text-[12px] text-navy-700">{r.comment}</p>}
            <div className="mt-1.5 flex flex-wrap gap-1">
              {r.tags.map((x) => <span key={x} className="rounded-full bg-mist px-2 py-0.5 text-[10px]">{x}</span>)}
            </div>
            <p className="mt-1 text-[10px] text-navy-400">{formatDateTimeAr(r.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

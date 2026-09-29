import { notFound } from "next/navigation";
import { getProvider } from "@/lib/care";
import { getReviewBreakdown, getProviderReviews, getFeaturedUntil, getTier } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import { Stars, FeaturedBadge, TierBadge } from "@/components/app/market-ui";
import BookForm from "@/components/app/BookForm";
import { TEMPLATES, formatDateTimeAr } from "@/lib/templates";

const NEED: Record<string, string> = {
  nursing: "تغيير ضماد ومتابعة بعد عملية",
  physio: "جلسة علاج طبيعي منزلية",
  lab: "جمع عينة دم منزلي",
  pharmacy: "مستلزمات ضماد وعناية",
};

export default async function ProviderProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProvider(Number(id));
  if (!p) notFound();
  const [br, rv, feat, tier] = await Promise.all([getReviewBreakdown(p.id), getProviderReviews(p.id, 5), getFeaturedUntil(p.id), getTier(p.id)]);
  const t = TEMPLATES[p.serviceType];

  return (
    <div>
      <AppHeader title={p.name} subtitle={p.label} back={`/app/patient/services/${p.serviceType}`} dark />
      <div className="bg-navy-900 px-5 pb-6 text-white">
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-2xl bg-emerald-500 text-2xl font-bold text-navy-950">{p.name[0]}</span>
          <div>
            <div className="flex flex-wrap gap-1.5">
              {feat && <FeaturedBadge />}
              <TierBadge tier={tier} />
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">{t.emoji} {t.serviceLabel}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Stars value={br.avg} />
              <span className="text-lg font-bold">{br.avg || "—"}</span>
              <span className="text-[11px] text-white/60">({br.count} تقييم)</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[13px] leading-6 text-white/75">{p.bio}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["الخبرة", `${p.experienceYears} سنوات`], ["يبدأ من", `${p.priceFrom} د.أ`], ["المنطقة", p.city.split("—")[0]]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/8 p-2 ring-1 ring-white/10">
              <p className="text-[10px] text-white/50">{k}</p>
              <p className="text-[13px] font-bold">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <BookForm providerId={p.id} providerName={p.name} defaultNeed={NEED[p.serviceType]} />

        {br.count > 0 && (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <p className="text-sm font-bold">التقييمات بعد كل خدمة</p>
            <div className="mt-3 space-y-1">
              {br.dist.map((d) => (
                <div key={d.s} className="flex items-center gap-2 text-[11px]">
                  <span className="w-3">{d.s}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${(d.c / br.count) * 100}%` }} />
                  </div>
                  <span className="w-4 text-navy-400">{d.c}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[["الاحترافية", br.professionalism], ["الالتزام بالموعد", br.punctuality], ["التواصل", br.communication]].map(([k, v]) => (
                <div key={String(k)} className="rounded-xl bg-mist p-2">
                  <p className="text-sm font-bold">{v}</p>
                  <p className="text-[10px] text-navy-400">{k}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-3">
              {rv.map((r) => (
                <div key={r.id} className="border-t border-line pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold">{r.patientName}</span>
                    <Stars value={r.rating} size="text-xs" />
                  </div>
                  {r.comment && <p className="mt-1 text-[12px] leading-5 text-navy-700">{r.comment}</p>}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {r.tags.map((x) => <span key={x} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">{x}</span>)}
                  </div>
                  <p className="mt-1 text-[10px] text-navy-400">{formatDateTimeAr(r.createdAt)} · خدمة موثّقة</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

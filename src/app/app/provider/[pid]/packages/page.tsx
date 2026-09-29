import { notFound } from "next/navigation";
import { getProvider } from "@/lib/care";
import { getActiveSubscription } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import { getPackages, TIER_LABEL, type Tier } from "@/lib/catalog";
import { TEMPLATES, formatDateTimeAr } from "@/lib/templates";
import { subscribeAction } from "@/app/app/market-actions";

export default async function Packages({ params, searchParams }: { params: Promise<{ pid: string }>; searchParams: Promise<{ ok?: string }> }) {
  const [{ pid }, { ok }] = await Promise.all([params, searchParams]);
  const p = await getProvider(Number(pid));
  if (!p) notFound();
  const sub = await getActiveSubscription(p.id);
  const current = (sub?.tier as Tier) ?? "starter";
  const pk = getPackages(p.serviceType);
  const t = TEMPLATES[p.serviceType];

  return (
    <div>
      <AppHeader title="الباقات" subtitle={`مصممة لمجال ${t.emoji} ${t.serviceLabel}`} back={`/app/provider/${p.id}`} />
      <div className="space-y-4 px-5 py-5">
        {ok && <p className="rounded-2xl bg-emerald-600 p-3 text-center text-sm font-bold text-white">🎉 تم تفعيل باقة {TIER_LABEL[ok as Tier] ?? ""} — الظهور المميز فعّال الآن</p>}
        {sub && (
          <div className="rounded-2xl bg-mist p-3 text-[12px] ring-1 ring-line">
            باقتك: <strong>{TIER_LABEL[current]}</strong> · تنتهي {formatDateTimeAr(sub.endsAt).split(" — ")[0]} · رصيد إعلانات: <strong>{sub.adCredits}</strong>
          </div>
        )}
        {pk.map((x) => {
          const active = x.tier === current;
          const hot = x.tier === "pro";
          return (
            <div key={x.tier} className={`relative rounded-3xl p-5 ${x.tier === "elite" ? "bg-navy-900 text-white" : "bg-white ring-1 ring-line"} ${hot && !active ? "ring-2 ring-emerald-500" : ""}`}>
              {hot && <span className="absolute -top-2.5 left-5 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">الأكثر اختياراً</span>}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold">{x.name}</p>
                  <p className={`text-[11px] ${x.tier === "elite" ? "text-white/60" : "text-navy-400"}`}>{TIER_LABEL[x.tier]}</p>
                </div>
                <p className="text-2xl font-bold">
                  {x.priceJod ? <>{x.priceJod} <span className="text-xs font-semibold">د.أ/شهر</span></> : "مجاناً"}
                </p>
              </div>

              <p className={`mt-4 text-[10px] font-bold ${x.tier === "elite" ? "text-amber-300" : "text-emerald-700"}`}>مزايا مشتركة</p>
              <ul className="mt-1 space-y-1">
                {x.common.map((c) => <li key={c} className="text-[12px]">✓ {c}</li>)}
              </ul>
              <p className={`mt-3 text-[10px] font-bold ${x.tier === "elite" ? "text-amber-300" : "text-emerald-700"}`}>مزايا خاصة بمجال {t.serviceLabel}</p>
              <ul className="mt-1 space-y-1">
                {x.field.map((c) => <li key={c} className={`text-[12px] ${x.tier === "elite" ? "text-white/80" : "text-navy-700"}`}>• {c}</li>)}
              </ul>

              <form action={subscribeAction} className="mt-4">
                <input type="hidden" name="providerId" value={p.id} />
                <input type="hidden" name="tier" value={x.tier} />
                <button disabled={active} className={`w-full rounded-full py-2.5 text-sm font-bold disabled:opacity-60 ${x.tier === "elite" ? "bg-amber-400 text-navy-950" : "bg-navy-900 text-white"}`}>
                  {active ? "باقتك الحالية ✓" : x.priceJod ? "اشترك (دفع تجريبي)" : "العودة للأساسي"}
                </button>
              </form>
            </div>
          );
        })}
        <p className="text-center text-[10px] leading-5 text-navy-400">الأسعار مقترحة وتجريبية (Planned) · الدفع غير مفعّل في الـ Demo — الاشتراك يُفعَّل فوراً للتجربة.</p>
      </div>
    </div>
  );
}

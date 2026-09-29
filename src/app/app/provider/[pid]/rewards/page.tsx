import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvider } from "@/lib/care";
import { getPointsBalance, getLedger, getTaskStatus, spinsToday, getFeaturedUntil, getTier } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import LuckyWheel from "@/components/app/LuckyWheel";
import { STORE, getPackages } from "@/lib/catalog";
import { formatDateTimeAr } from "@/lib/templates";
import { checkinAction, redeemFeaturedAction } from "@/app/app/market-actions";

export default async function Rewards({ params, searchParams }: { params: Promise<{ pid: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const [{ pid }, { ok, err }] = await Promise.all([params, searchParams]);
  const p = await getProvider(Number(pid));
  if (!p) notFound();
  const [bal, ledger, tasks, spins, feat, tier] = await Promise.all([
    getPointsBalance(p.id),
    getLedger(p.id, 10),
    getTaskStatus(p.id),
    spinsToday(p.id),
    getFeaturedUntil(p.id),
    getTier(p.id),
  ]);
  const mult = getPackages(p.serviceType).find((x) => x.tier === tier)!.pointsMultiplier;
  const base = `/app/provider/${p.id}`;
  const okItem = STORE.find((s) => s.key === ok);

  return (
    <div>
      <AppHeader title="النقاط والمكافآت" subtitle="اكسب ← استبدل ← اظهر أولاً" back={base} />
      <div className="space-y-4 px-5 py-5">
        <div className="rounded-3xl bg-gradient-to-l from-emerald-500 to-emerald-700 p-5 text-white">
          <p className="text-[11px] text-white/80">رصيدك</p>
          <p className="text-4xl font-bold">{bal} <span className="text-base">نقطة</span></p>
          <p className="mt-1 text-[11px] text-white/80">{mult > 1 ? `🚀 باقتك تضاعف نقاطك ×${mult}` : "رقِّ باقتك لمضاعفة النقاط حتى ×2"}</p>
          {feat && <p className="mt-2 rounded-lg bg-white/15 px-2 py-1 text-[11px]">⭐ ظهورك المميز فعّال حتى {formatDateTimeAr(feat)}</p>}
        </div>

        {okItem && <p className="rounded-2xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">✓ تم تفعيل: {okItem.title}</p>}
        {err && <p className="rounded-2xl bg-red-50 p-3 text-center text-sm font-bold text-red-600">رصيد النقاط غير كافٍ</p>}

        <LuckyWheel providerId={p.id} freeAvailable={!spins.freeUsed} balance={bal} />

        <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <p className="text-sm font-bold">🎯 مهام تكسبك نقاط</p>
          <div className="mt-3 space-y-2">
            {tasks.map((t) => (
              <div key={t.key} className="flex items-center gap-3 rounded-xl bg-mist p-2.5">
                <span className="text-lg">{t.icon}</span>
                <div className="flex-1">
                  <p className="text-[12px] font-bold">{t.title}</p>
                  <p className="text-[10px] text-navy-400">{t.freq === "daily" ? "يومياً" : t.freq === "once" ? "مرة واحدة" : `كل مرة · أنجزتها ${t.total} مرة`}</p>
                </div>
                {t.key === "daily_checkin" && !t.locked ? (
                  <form action={checkinAction}>
                    <input type="hidden" name="providerId" value={p.id} />
                    <button className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white">+{Math.round(t.points * mult)} سجّل</button>
                  </form>
                ) : (
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${t.locked ? "bg-emerald-100 text-emerald-700" : "bg-white text-navy-700 ring-1 ring-line"}`}>
                    {t.locked ? "✓ تم" : `+${Math.round(t.points * mult)}`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <p className="text-sm font-bold">🛒 استبدل نقاطك</p>
          <div className="mt-3 space-y-2">
            {STORE.map((s) => (
              <div key={s.key} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <span className="text-xl">{s.kind === "featured" ? "⭐" : "📣"}</span>
                <div className="flex-1">
                  <p className="text-[12px] font-bold">{s.title}</p>
                  <p className="text-[10px] text-navy-400">{s.kind === "featured" ? "تظهر أولاً للمرضى مع شارة مميز" : "إعلانك في الصفحة الرئيسية للمرضى"}</p>
                </div>
                {s.kind === "featured" ? (
                  <form action={redeemFeaturedAction}>
                    <input type="hidden" name="providerId" value={p.id} />
                    <input type="hidden" name="item" value={s.key} />
                    <button disabled={bal < s.cost} className="rounded-full bg-navy-900 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-30">{s.cost}</button>
                  </form>
                ) : (
                  <Link href={`${base}/ads?source=points&days=${s.days}`} className={`rounded-full bg-navy-900 px-3 py-1.5 text-[11px] font-bold text-white ${bal < s.cost ? "pointer-events-none opacity-30" : ""}`}>{s.cost}</Link>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
          <p className="text-sm font-bold">سجل النقاط</p>
          <ul className="mt-2 divide-y divide-line">
            {ledger.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2 text-[11px]">
                <span className="max-w-[75%]">{l.reason}</span>
                <span className={`ltr font-bold ${l.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>{l.delta > 0 ? `+${l.delta}` : l.delta}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

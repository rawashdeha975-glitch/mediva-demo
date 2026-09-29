import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvider, getActiveGrant } from "@/lib/care";
import { getProviderBookings, getPointsBalance, getReviewBreakdown, getFeaturedUntil, getTier, getProviderAds, spinsToday } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import { Stars, StatusPill, TierBadge } from "@/components/app/market-ui";
import { TEMPLATES, formatDateAr, formatDateTimeAr } from "@/lib/templates";
import { acceptBookingAction } from "@/app/app/market-actions";

export default async function ProviderHome({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params;
  const p = await getProvider(Number(pid));
  if (!p) notFound();
  const [bk, bal, br, feat, tier, myAds, spins, grant] = await Promise.all([
    getProviderBookings(p.id),
    getPointsBalance(p.id),
    getReviewBreakdown(p.id),
    getFeaturedUntil(p.id),
    getTier(p.id),
    getProviderAds(p.id),
    spinsToday(p.id),
    getActiveGrant(p.id),
  ]);
  const t = TEMPLATES[p.serviceType];
  const pending = bk.filter((b) => b.status === "pending");
  const accepted = bk.filter((b) => b.status === "accepted");
  const completed = bk.filter((b) => b.status === "completed").length;
  const activeAds = myAds.filter((a) => new Date(a.endsAt) > new Date());
  const base = `/app/provider/${p.id}`;

  return (
    <div>
      <AppHeader title={`${t.emoji} ${p.name}`} subtitle={p.label} dark />
      <div className="bg-navy-900 px-5 pb-10 text-white">
        <div className="flex items-center gap-2">
          <TierBadge tier={tier} />
          {feat ? (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-navy-950">⭐ مميز حتى {formatDateTimeAr(feat).split(" — ")[0]}</span>
          ) : (
            <Link href={`${base}/rewards`} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">غير مميز — فعّل الظهور ←</Link>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
            <p className="text-xl font-bold">{br.avg || "—"}</p>
            <Stars value={br.avg} size="text-[10px]" />
            <p className="text-[10px] text-white/50">{br.count} تقييم</p>
          </div>
          <Link href={`${base}/rewards`} className="rounded-2xl bg-emerald-500 p-3 text-navy-950">
            <p className="text-xl font-bold">{bal}</p>
            <p className="text-[10px] font-semibold">نقطة 🎁</p>
            <p className="text-[10px]">{spins.freeUsed ? "استبدل ←" : "🎡 لفّة مجانية!"}</p>
          </Link>
          <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
            <p className="text-xl font-bold">{completed}</p>
            <p className="text-[10px] text-white/50">خدمة مكتملة</p>
            <p className="text-[10px] text-white/50">{activeAds.length} إعلان نشط</p>
          </div>
        </div>
      </div>

      <div className="-mt-5 space-y-4 px-5">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">طلبات جديدة ({pending.length})</p>
            <Link href={`${base}/requests`} className="text-[11px] font-bold text-emerald-700">كل الطلبات</Link>
          </div>
          {pending.length === 0 && <p className="mt-2 text-[12px] text-navy-400">لا توجد طلبات جديدة الآن.</p>}
          {pending.slice(0, 2).map((b) => (
            <div key={b.id} className="mt-3 rounded-xl bg-mist p-3">
              <p className="text-[13px] font-bold">{b.need}</p>
              <p className="text-[11px] text-navy-400">
                {b.patientName.split(" ")[0]} · {b.address} · {formatDateAr(b.scheduledDate)} <span className="ltr">{b.scheduledTime}</span>
              </p>
              <form action={acceptBookingAction} className="mt-2">
                <input type="hidden" name="bookingId" value={b.id} />
                <input type="hidden" name="providerId" value={p.id} />
                <button className="w-full rounded-full bg-emerald-600 py-2 text-xs font-bold text-white">قبول الطلب (+10 نقاط ⚡)</button>
              </form>
            </div>
          ))}
        </div>

        {accepted.length > 0 && (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <p className="text-sm font-bold">مواعيد مؤكدة</p>
            {accepted.map((b) => (
              <div key={b.id} className="mt-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[13px] font-bold">{b.need}</p>
                  <p className="text-[11px] text-navy-400">{formatDateAr(b.scheduledDate)} · <span className="ltr">{b.scheduledTime}</span></p>
                </div>
                <Link href={`${base}/new?booking=${b.id}`} className="shrink-0 rounded-full bg-navy-900 px-3 py-1.5 text-[11px] font-bold text-white">إتمام + توثيق</Link>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {[
            [`${base}/record`, "📁", "سجل رعاية المريض", grant ? "🔓 بموافقة" : "🔒 يتطلب موافقة"],
            [`${base}/reviews`, "⭐", "تقييماتي", `${br.count} تقييم`],
            [`${base}/ads`, "📣", "إعلاناتي", `${activeAds.length} نشط`],
            [`${base}/packages`, "👑", "الباقات", tier === "starter" ? "ترقية" : "باقتك"],
          ].map(([href, e, l, s]) => (
            <Link key={href} href={href} className="rounded-2xl bg-white p-3.5 ring-1 ring-line">
              <span className="text-xl">{e}</span>
              <p className="mt-1 text-[13px] font-bold">{l}</p>
              <p className="text-[10px] text-navy-400">{s}</p>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl bg-gradient-to-l from-navy-800 to-navy-900 p-4 text-white">
          <p className="text-sm font-bold">✨ مساعدك الذكي جاهز</p>
          <p className="mt-1 text-[11px] leading-5 text-white/70">اضغط زر AI واسأله: «كيف أزيد طلباتي؟» أو «اكتب لي إعلان» — إجابات مبنية على بياناتك ومجالك.</p>
        </div>

        {bk.filter((b) => b.status === "completed").slice(0, 3).map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 ring-1 ring-line">
            <span className="text-[12px]">{b.need}</span>
            <StatusPill status={b.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { getPatient, getPatientTimeline } from "@/lib/care";
import { getActiveAds, getPendingRatings, getRankedProviders, trackImpressions, getPatientBookings } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import { AdsStrip, ProviderCard, StatusPill } from "@/components/app/market-ui";
import { TEMPLATES, formatDateAr } from "@/lib/templates";
import type { ServiceType } from "@/db/schema";

const TYPES: ServiceType[] = ["nursing", "physio", "pharmacy", "lab"];

export default async function PatientHome() {
  const [patient, notes, adsList, pending, ranked, bookings] = await Promise.all([
    getPatient(),
    getPatientTimeline(),
    getActiveAds(4),
    getPendingRatings(),
    getRankedProviders(),
    getPatientBookings(),
  ]);
  await trackImpressions(adsList.map((a) => a.id));
  const featured = ranked.filter((p) => p.featuredUntil);
  const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "accepted");

  return (
    <div>
      <AppHeader title={`مرحباً، ${patient.name.split(" ")[0]} 👋`} subtitle={`📍 ${patient.city}`} dark />
      <div className="bg-navy-900 px-5 pb-10">
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-[13px] text-white/70 ring-1 ring-white/15">
          <span className="text-emerald-300">✨</span> اسأل المساعد الذكي عن احتياجك — زر <span className="ltr font-bold text-white">AI</span> بالأسفل
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {TYPES.map((t) => (
            <Link key={t} href={`/app/patient/services/${t}`} className="rounded-2xl bg-white/8 p-2.5 text-center ring-1 ring-white/10 transition hover:bg-white/15">
              <div className="text-2xl">{TEMPLATES[t].emoji}</div>
              <div className="mt-1 text-[10px] font-semibold text-white/85">{TEMPLATES[t].serviceLabel}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="-mt-5 space-y-5 px-5">
        {pending.map((b) => (
          <Link key={b.id} href={`/app/patient/bookings/${b.id}/rate`} className="flex items-center gap-3 rounded-2xl bg-amber-400 p-4 text-navy-950 shadow-lg shadow-amber-400/30">
            <span className="text-2xl">⭐</span>
            <span className="flex-1">
              <span className="block text-sm font-bold">كيف كانت خدمة {b.providerName}؟</span>
              <span className="text-[11px]">{TEMPLATES[b.serviceType].serviceLabel} · {formatDateAr(b.scheduledDate)} — قيّم الآن</span>
            </span>
            <span>‹</span>
          </Link>
        ))}

        {upcoming.length > 0 && (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <p className="text-[11px] font-bold text-navy-400">مواعيدي القادمة</p>
            {upcoming.slice(0, 2).map((b) => (
              <div key={b.id} className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{TEMPLATES[b.serviceType].emoji} {b.providerName}</p>
                  <p className="text-[11px] text-navy-400">{formatDateAr(b.scheduledDate)} · <span className="ltr">{b.scheduledTime}</span></p>
                </div>
                <StatusPill status={b.status} />
              </div>
            ))}
          </div>
        )}

        {adsList.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-bold text-navy-400">عروض من مقدمي الخدمة</p>
            <AdsStrip items={adsList} />
          </section>
        )}

        {featured.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-navy-400">⭐ مقدمو خدمة مميزون</p>
              <Link href="/app/patient/services" className="text-[11px] font-bold text-emerald-700">الكل</Link>
            </div>
            <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
              {featured.map((p) => <ProviderCard key={p.id} p={p} compact />)}
            </div>
          </section>
        )}

        <Link href="/app/patient/record" className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-xl">📋</span>
          <span className="flex-1">
            <span className="block text-sm font-bold">سجل الرعاية الرقمي</span>
            <span className="text-[11px] text-navy-400">{notes.length} سجلات · أنت تتحكم بمن يطّلع</span>
          </span>
          <span className="text-navy-400">‹</span>
        </Link>
        <Link href="/app/patient/access" className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
          <span className="grid size-11 place-items-center rounded-xl bg-navy-900 text-white">🔒</span>
          <span className="flex-1 text-sm font-bold">من يستطيع رؤية سجلي؟</span>
          <span className="text-navy-400">‹</span>
        </Link>
      </div>
    </div>
  );
}

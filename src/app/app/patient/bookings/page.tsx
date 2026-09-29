import Link from "next/link";
import { getPatientBookings } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import { StatusPill, Stars } from "@/components/app/market-ui";
import { TEMPLATES, formatDateAr } from "@/lib/templates";

export default async function Bookings({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [{ new: created }, list] = await Promise.all([searchParams, getPatientBookings()]);
  return (
    <div>
      <AppHeader title="حجوزاتي" subtitle="طلب ← حجز ← إتمام ← تقييم" back="/app/patient" />
      <div className="space-y-3 px-5 py-5">
        {created && (
          <p className="rounded-2xl bg-emerald-600 p-3 text-center text-sm font-bold text-white">✓ تم إرسال طلب الحجز — بانتظار قبول مقدم الخدمة</p>
        )}
        {list.map((b) => (
          <div key={b.id} className={`rounded-2xl bg-white p-4 ring-1 ${String(b.id) === created ? "ring-emerald-400" : "ring-line"}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">{TEMPLATES[b.serviceType].emoji} {b.providerName}</p>
              <StatusPill status={b.status} />
            </div>
            <p className="mt-1 text-[12px] text-navy-600">{b.need}</p>
            <p className="mt-0.5 text-[11px] text-navy-400">{formatDateAr(b.scheduledDate)} · <span className="ltr">{b.scheduledTime}</span></p>
            {b.status === "completed" && (
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                {b.reviewId ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-navy-600">تقييمك: <Stars value={b.reviewRating ?? 0} size="text-xs" /></span>
                ) : (
                  <Link href={`/app/patient/bookings/${b.id}/rate`} className="rounded-full bg-amber-400 px-3 py-1.5 text-[11px] font-bold text-navy-950">⭐ قيّم الخدمة</Link>
                )}
                {b.careNoteId && (
                  <Link href={`/app/patient/record/${b.careNoteId}`} className="text-[11px] font-bold text-emerald-700">📋 ملاحظة الرعاية</Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

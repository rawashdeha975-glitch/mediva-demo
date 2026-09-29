import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvider } from "@/lib/care";
import { getProviderBookings } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import { StatusPill, Stars } from "@/components/app/market-ui";
import { formatDateAr } from "@/lib/templates";
import { acceptBookingAction, declineBookingAction } from "@/app/app/market-actions";

export default async function Requests({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params;
  const p = await getProvider(Number(pid));
  if (!p) notFound();
  const list = await getProviderBookings(p.id);
  const order = { pending: 0, accepted: 1, completed: 2, cancelled: 3 } as Record<string, number>;
  list.sort((a, b) => order[a.status] - order[b.status]);
  const base = `/app/provider/${p.id}`;

  return (
    <div>
      <AppHeader title="الطلبات" subtitle="قبول ← إتمام + توثيق ← تقييم المريض" back={base} />
      <div className="space-y-3 px-5 py-5">
        {list.length === 0 && <p className="py-10 text-center text-sm text-navy-400">لا توجد طلبات بعد.</p>}
        {list.map((b) => (
          <div key={b.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold">{b.need}</p>
              <StatusPill status={b.status} />
            </div>
            <p className="mt-1 text-[11px] text-navy-400">
              👤 {b.patientName.split(" ")[0]} · 📍 {b.address} · {formatDateAr(b.scheduledDate)} <span className="ltr">{b.scheduledTime}</span>
            </p>
            {b.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <form action={acceptBookingAction} className="flex-1">
                  <input type="hidden" name="bookingId" value={b.id} />
                  <input type="hidden" name="providerId" value={p.id} />
                  <button className="w-full rounded-full bg-emerald-600 py-2 text-xs font-bold text-white">قبول (+10 ⚡)</button>
                </form>
                <form action={declineBookingAction}>
                  <input type="hidden" name="bookingId" value={b.id} />
                  <input type="hidden" name="providerId" value={p.id} />
                  <button className="rounded-full bg-mist px-4 py-2 text-xs font-bold text-navy-600">اعتذار</button>
                </form>
              </div>
            )}
            {b.status === "accepted" && (
              <Link href={`${base}/new?booking=${b.id}`} className="mt-3 block rounded-full bg-navy-900 py-2 text-center text-xs font-bold text-white">
                ✍️ إتمام الخدمة وكتابة ملاحظة الرعاية (+60 نقطة)
              </Link>
            )}
            {b.status === "completed" && (
              <div className="mt-2 flex items-center justify-between text-[11px]">
                {b.reviewId ? (
                  <span className="flex items-center gap-1">تقييم المريض: <Stars value={b.reviewRating ?? 0} size="text-xs" /></span>
                ) : (
                  <span className="text-amber-600">⏳ بانتظار تقييم المريض</span>
                )}
                {b.careNoteId && <Link href={`${base}/record/${b.careNoteId}`} className="font-bold text-emerald-700">📋 الملاحظة</Link>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

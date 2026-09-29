import { notFound } from "next/navigation";
import Link from "next/link";
import { getBooking } from "@/lib/market";
import { DEMO_PATIENT_ID } from "@/lib/care";
import { AppHeader } from "@/components/app/ui";
import RatingForm from "@/components/app/RatingForm";
import { TEMPLATES, formatDateAr } from "@/lib/templates";

export default async function RatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await getBooking(Number(id));
  if (!b || b.patientId !== DEMO_PATIENT_ID) notFound();

  return (
    <div>
      <AppHeader title={`قيّم ${b.providerName}`} subtitle={`${TEMPLATES[b.serviceType].serviceLabel} · ${formatDateAr(b.scheduledDate)}`} back="/app/patient/bookings" />
      {b.status !== "completed" ? (
        <p className="px-5 py-12 text-center text-sm text-navy-600">التقييم متاح بعد إتمام الخدمة.</p>
      ) : b.reviewId ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-navy-600">تم تقييم هذه الخدمة مسبقاً ✓</p>
          <Link href="/app/patient/bookings" className="mt-4 inline-block text-sm font-bold text-emerald-700">حجوزاتي</Link>
        </div>
      ) : (
        <RatingForm bookingId={b.id} providerName={b.providerName} />
      )}
    </div>
  );
}

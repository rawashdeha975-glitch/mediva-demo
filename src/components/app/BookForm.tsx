"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/app/app/market-actions";

const TIMES = ["08:00", "10:00", "12:00", "15:00", "17:00", "19:00"];

export default function BookForm({ providerId, providerName, defaultNeed }: { providerId: number; providerName: string; defaultNeed: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Amman" }).format(new Date());
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("17:00");
  const [need, setNeed] = useState(defaultNeed);
  const [address, setAddress] = useState("عمّان — خلدا");
  const [share, setShare] = useState(true);
  const [error, setError] = useState("");

  const cls = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500";

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-line">
      <p className="text-sm font-bold">احجز مع {providerName}</p>
      <label className="block">
        <span className="mb-1 block text-[11px] font-bold text-navy-600">ما الذي تحتاجه؟</span>
        <input className={cls} value={need} onChange={(e) => setNeed(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-navy-600">التاريخ</span>
          <input type="date" min={today} className={cls} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-navy-600">العنوان</span>
          <input className={cls} value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
      </div>
      <div>
        <span className="mb-1 block text-[11px] font-bold text-navy-600">الوقت</span>
        <div className="grid grid-cols-6 gap-1">
          {TIMES.map((t) => (
            <button type="button" key={t} onClick={() => setTime(t)} className={`ltr rounded-lg py-1.5 text-[11px] font-bold ${time === t ? "bg-navy-900 text-white" : "bg-mist text-navy-600"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-emerald-50 p-3 text-[11px] leading-5 text-emerald-900">
        <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} className="mt-0.5 size-4 accent-emerald-600" />
        أوافق أن يطّلع مقدم الخدمة على سجلات الرعاية <strong>المرتبطة بنفس نوع الخدمة فقط</strong> (يمكن سحب الموافقة لاحقاً).
      </label>
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            const r = await createBookingAction({ providerId, date, time, address, need, shareRecord: share });
            if (!r.ok) return setError(r.error);
            router.push(`/app/patient/bookings?new=${r.id}`);
          })
        }
        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {pending ? "جارٍ الإرسال…" : "إرسال طلب الحجز"}
      </button>
      <p className="text-center text-[10px] text-navy-400">الدفع داخل التطبيق — ضمن مرحلة MVP القادمة (غير مفعّل في الـ Demo)</p>
    </div>
  );
}

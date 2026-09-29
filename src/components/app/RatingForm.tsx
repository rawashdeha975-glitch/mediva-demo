"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { submitReviewAction } from "@/app/app/market-actions";
import { REVIEW_TAGS } from "@/lib/catalog";

function StarInput({ value, onChange, big = false }: { value: number; onChange: (v: number) => void; big?: boolean }) {
  return (
    <div className="flex gap-1" style={{ direction: "ltr" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.button
          type="button"
          key={i}
          whileTap={{ scale: 1.3 }}
          onClick={() => onChange(i)}
          className={`${big ? "text-4xl" : "text-2xl"} leading-none ${i <= value ? "text-amber-400" : "text-navy-200"}`}
          aria-label={`${i} نجوم`}
        >
          ★
        </motion.button>
      ))}
    </div>
  );
}

const LABELS = ["", "سيئة", "مقبولة", "جيدة", "جيدة جداً", "ممتازة"];

export default function RatingForm({ bookingId, providerName }: { bookingId: number; providerName: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rating, setRating] = useState(0);
  const [sub, setSub] = useState({ professionalism: 0, punctuality: 0, communication: 0 });
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (done)
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="px-5 py-16 text-center">
        <div className="text-6xl">🎉</div>
        <p className="mt-4 text-lg font-bold">شكراً لتقييمك!</p>
        <p className="mt-2 text-[13px] leading-6 text-navy-600">تقييمك يساعد المرضى الآخرين ويكافئ {providerName} على جودة الخدمة.</p>
        <button onClick={() => router.push("/app/patient")} className="mt-6 rounded-full bg-navy-900 px-6 py-3 text-sm font-bold text-white">العودة للرئيسية</button>
      </motion.div>
    );

  return (
    <div className="space-y-5 px-5 py-5">
      <div className="rounded-2xl bg-white p-5 text-center ring-1 ring-line">
        <p className="text-sm font-bold">التقييم العام</p>
        <div className="mt-3 flex justify-center"><StarInput value={rating} onChange={setRating} big /></div>
        <p className="mt-2 h-5 text-sm font-semibold text-amber-600">{LABELS[rating]}</p>
      </div>

      <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-line">
        {([
          ["professionalism", "الاحترافية"],
          ["punctuality", "الالتزام بالموعد"],
          ["communication", "التواصل والشرح"],
        ] as const).map(([k, l]) => (
          <div key={k} className="flex items-center justify-between">
            <span className="text-[13px] font-semibold">{l}</span>
            <StarInput value={sub[k]} onChange={(v) => setSub((s) => ({ ...s, [k]: v }))} />
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-[12px] font-bold text-navy-600">ما الذي أعجبك؟</p>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TAGS.map((t) => {
            const on = tags.includes(t);
            return (
              <button type="button" key={t} onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${on ? "bg-emerald-600 text-white" : "bg-white text-navy-700 ring-1 ring-line"}`}>
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تعليقاً (اختياري)" className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      <button
        disabled={pending || !rating}
        onClick={() =>
          start(async () => {
            setError("");
            const r = await submitReviewAction({
              bookingId,
              rating,
              professionalism: sub.professionalism || rating,
              punctuality: sub.punctuality || rating,
              communication: sub.communication || rating,
              tags,
              comment,
            });
            if (!r.ok) return setError(r.error);
            setDone(true);
          })
        }
        className="w-full rounded-full bg-navy-900 py-3.5 text-sm font-bold text-white disabled:opacity-40"
      >
        {pending ? "جارٍ الإرسال…" : "إرسال التقييم"}
      </button>
      <p className="text-center text-[10px] text-navy-400">التقييم مرتبط بخدمة مكتملة وموثّقة فقط — لا تقييمات وهمية.</p>
    </div>
  );
}

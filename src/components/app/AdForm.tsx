"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAdAction } from "@/app/app/market-actions";
import { STORE } from "@/lib/catalog";

export default function AdForm({
  providerId,
  credits,
  balance,
  initial,
}: {
  providerId: number;
  credits: number;
  balance: number;
  initial: { title: string; body: string; source: "package" | "points"; days: number };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [source, setSource] = useState<"package" | "points">(credits > 0 ? initial.source : "points");
  const [days, setDays] = useState(initial.days);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const adItems = STORE.filter((s) => s.kind === "ad");
  const cls = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500";

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-line">
      <p className="text-sm font-bold">📣 إعلان جديد داخل التطبيق</p>
      <input className={cls} placeholder="عنوان الإعلان" maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className={`${cls} resize-none`} rows={2} placeholder="نص قصير يظهر للمرضى" maxLength={150} value={body} onChange={(e) => setBody(e.target.value)} />
      <p className="text-left text-[10px] text-navy-400">{body.length}/150</p>

      {/* live preview */}
      <div className="relative rounded-2xl bg-gradient-to-l from-emerald-600 to-emerald-800 p-4 text-white">
        <span className="absolute top-3 left-3 rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-bold">إعلان</span>
        <p className="text-sm font-bold">{title || "عنوان الإعلان"}</p>
        <p className="mt-1 text-[11px] leading-5 text-white/80">{body || "هكذا سيظهر إعلانك للمرضى في الصفحة الرئيسية."}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={credits < 1} onClick={() => setSource("package")} className={`rounded-xl p-2.5 text-right text-[11px] ring-1 disabled:opacity-40 ${source === "package" ? "bg-navy-900 text-white ring-navy-900" : "ring-line"}`}>
          <span className="block font-bold">👑 رصيد الباقة</span>
          {credits} متبقٍ · 7 أيام
        </button>
        <button type="button" onClick={() => setSource("points")} className={`rounded-xl p-2.5 text-right text-[11px] ring-1 ${source === "points" ? "bg-navy-900 text-white ring-navy-900" : "ring-line"}`}>
          <span className="block font-bold">🎁 بالنقاط</span>
          رصيدك {balance}
        </button>
      </div>
      {source === "points" && (
        <div className="flex gap-2">
          {adItems.map((a) => (
            <button type="button" key={a.key} onClick={() => setDays(a.days)} className={`flex-1 rounded-xl py-2 text-[11px] font-bold ${days === a.days ? "bg-emerald-600 text-white" : "bg-mist"}`}>
              {a.days} أيام · {a.cost}
            </button>
          ))}
        </div>
      )}

      {msg && <p className={`rounded-xl px-3 py-2 text-xs font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.t}</p>}
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await createAdAction({ providerId, title, body, source, days });
            if (!r.ok) return setMsg({ ok: false, t: r.error });
            setMsg({ ok: true, t: "✓ تم نشر الإعلان — يظهر الآن للمرضى" });
            setTitle("");
            setBody("");
            router.refresh();
          })
        }
        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {pending ? "جارٍ النشر…" : "نشر الإعلان"}
      </button>
      <p className="text-center text-[10px] text-navy-400">💡 اطلب من المساعد الذكي: «اكتب لي إعلان» ليقترح نصاً مناسباً لمجالك</p>
    </div>
  );
}

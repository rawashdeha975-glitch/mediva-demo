"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceType, CareNoteData } from "@/db/schema";
import { TEMPLATES } from "@/lib/templates";
import { aiStructureAction, createCareNoteAction, amendCareNoteAction } from "@/app/app/actions";

type Props =
  | { mode: "create"; providerId: number; serviceType: ServiceType; defaultTitle: string; bookingId?: number }
  | {
      mode: "amend";
      providerId: number;
      serviceType: ServiceType;
      noteId: number;
      initial: { data: CareNoteData; durationMin: number };
    };

const SAMPLE: Record<ServiceType, string> = {
  nursing:
    "غيرت الضماد، قست العلامات الحيوية، المريض كان بحالة مستقرة، وطلبت منه متابعة موعده القادم.",
  physio: "عملنا تمارين مدى الحركة وتمارين تقوية للركبة، ومشي داخل البيت، المريضة تحسنت حركتها، والجلسة القادمة الأسبوع القادم.",
  lab: "جمعت عينة دم الساعة 9 صباحا، العينة سليمة، المريض كان صايم.",
  pharmacy: "طلب مستلزمات ضماد وشاش، تم التسليم للمنزل.",
};

export default function NoteEditor(props: Props) {
  const t = TEMPLATES[props.serviceType];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [aiPending, startAi] = useTransition();

  const [title, setTitle] = useState(props.mode === "create" ? props.defaultTitle : "");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState<string>(
    props.mode === "amend" ? String(props.initial.durationMin) : ""
  );
  const [data, setData] = useState<CareNoteData>(props.mode === "amend" ? props.initial.data : {});
  const [freeText, setFreeText] = useState("");
  const [aiInfo, setAiInfo] = useState<{ engine: string; removed: string[]; filled: string[] } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const setField = (k: string, v: string | string[]) => setData((d) => ({ ...d, [k]: v }));

  function runAi() {
    setError("");
    startAi(async () => {
      const res = await aiStructureAction(props.providerId, freeText);
      if ("error" in res) return setError(res.error);
      setData((d) => ({ ...d, ...res.data }));
      if (res.durationMin) setDuration(String(res.durationMin));
      setAiInfo({ engine: res.engine, removed: res.removed, filled: Object.keys(res.data) });
      setConfirmed(false);
    });
  }

  function save() {
    setError("");
    start(async () => {
      const res =
        props.mode === "create"
          ? await createCareNoteAction(props.providerId, {
              title,
              visitDate,
              durationMin: Number(duration),
              data,
              confirmed,
              bookingId: props.bookingId,
            })
          : await amendCareNoteAction(props.providerId, props.noteId, {
              durationMin: Number(duration),
              data,
              reason,
            });
      if (!res.ok) return setError(res.error);
      router.push(`/app/provider/${props.providerId}/record/${res.id}?saved=1`);
    });
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

  return (
    <div className="space-y-4 px-5 py-5">
      <div className="rounded-2xl bg-navy-900 p-4 text-white">
        <p className="text-[11px] text-white/60">القالب حسب نوع الخدمة</p>
        <p className="mt-0.5 font-bold">
          {t.emoji} {t.name} · <span className="ltr text-emerald-300">{t.nameEn}</span>
        </p>
      </div>

      {/* AI assist */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
        <p className="text-sm font-bold text-navy-900">✨ اكتب بكلماتك — والـ <span className="ltr">AI</span> ينظّم</p>
        <p className="mt-1 text-[11px] leading-5 text-navy-600">
          ينظّم ← يهيكل ← يلخّص فقط. لا يخترع قيماً، لا يشخّص، ولا يصف علاجاً.
        </p>
        <textarea
          rows={3}
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder={SAMPLE[props.serviceType]}
          className={`${inputCls} mt-3 resize-none`}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setFreeText(SAMPLE[props.serviceType])}
            className="text-[11px] font-semibold text-emerald-700 underline-offset-2 hover:underline"
          >
            استخدم مثالاً
          </button>
          <button
            type="button"
            onClick={runAi}
            disabled={aiPending}
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            {aiPending ? "جارٍ التنظيم…" : "نظّم الملاحظة"}
          </button>
        </div>
        {aiInfo && (
          <div className="mt-3 rounded-xl bg-white p-3 text-[11px] leading-5 ring-1 ring-emerald-100">
            <p className="font-semibold text-emerald-700">
              ✓ تم ملء {aiInfo.filled.length} حقول من نصك فقط{" "}
              <span className="text-navy-400">({aiInfo.engine === "openai" ? "LLM + guard" : "محرك محلي مُقيَّد بالنص"})</span>
            </p>
            {aiInfo.removed.map((r) => (
              <p key={r} className="text-amber-700">⚠️ {r}</p>
            ))}
            <p className="text-navy-400">الحقول غير المذكورة تُركت فارغة — راجعها وأكملها بنفسك.</p>
          </div>
        )}
      </div>

      {/* Structured form */}
      {props.mode === "create" && (
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block">
            <span className="mb-1 block text-[11px] font-bold text-navy-600">نوع الزيارة</span>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-navy-600">تاريخ الزيارة</span>
            <input type="date" className={inputCls} value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-navy-600">المدة (دقيقة)</span>
            <input type="number" min={1} className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </label>
        </div>
      )}
      {props.mode === "amend" && (
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-navy-600">المدة (دقيقة)</span>
          <input type="number" min={1} className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)} />
        </label>
      )}

      {t.fields.map((f) => {
        const v = data[f.key];
        return (
          <div key={f.key}>
            <span className="mb-1 block text-[11px] font-bold text-navy-600">{f.label}</span>
            {f.kind === "checklist" ? (
              <div className="space-y-1.5 rounded-xl border border-line p-3">
                {f.options.map((o) => {
                  const arr = Array.isArray(v) ? v : [];
                  const on = arr.includes(o);
                  return (
                    <label key={o} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => setField(f.key, on ? arr.filter((x) => x !== o) : [...arr, o])}
                        className="size-4 accent-emerald-600"
                      />
                      {o}
                    </label>
                  );
                })}
              </div>
            ) : f.kind === "select" ? (
              <select className={inputCls} value={typeof v === "string" ? v : ""} onChange={(e) => setField(f.key, e.target.value)}>
                <option value="">— اختر —</option>
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : f.kind === "textarea" ? (
              <textarea rows={3} className={`${inputCls} resize-none`} value={typeof v === "string" ? v : ""} onChange={(e) => setField(f.key, e.target.value)} />
            ) : (
              <input className={inputCls} value={typeof v === "string" ? v : ""} onChange={(e) => setField(f.key, e.target.value)} />
            )}
          </div>
        );
      })}

      {props.mode === "amend" ? (
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold text-navy-600">سبب التصحيح (إلزامي — يُحفظ في سجل التدقيق)</span>
          <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثال: تصحيح مدة الزيارة" />
        </label>
      ) : (
        <label className="flex cursor-pointer items-start gap-2 rounded-xl bg-mist p-3 text-[12px] leading-5">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 size-4 accent-emerald-600" />
          <span>
            <strong>Provider Review:</strong> راجعتُ الملاحظة وأؤكد أنها تعكس ما تم فعلاً أثناء الزيارة.
          </span>
        </label>
      )}

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

      <button
        onClick={save}
        disabled={pending || (props.mode === "create" && !confirmed)}
        className="w-full rounded-full bg-navy-900 py-3.5 text-sm font-bold text-white disabled:opacity-40"
      >
        {pending ? "جارٍ الحفظ…" : props.mode === "create" ? "تأكيد وحفظ ملاحظة الرعاية" : "حفظ التصحيح (Amendment)"}
      </button>
    </div>
  );
}

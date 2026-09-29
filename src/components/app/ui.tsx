import Link from "next/link";
import type { ServiceType, CareNoteData } from "@/db/schema";
import { TEMPLATES, SERVICE_COLORS, formatDateAr, formatDateTimeAr, fieldLabel } from "@/lib/templates";

export function AppHeader({
  title,
  subtitle,
  back,
  dark = false,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  dark?: boolean;
}) {
  return (
    <header
      className={`sticky top-0 z-20 px-5 pt-10 pb-4 sm:pt-12 ${
        dark ? "bg-navy-900 text-white" : "border-b border-line bg-white/95 backdrop-blur"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {back && (
            <Link
              href={back}
              className={`grid size-8 place-items-center rounded-full text-lg ${
                dark ? "bg-white/10" : "bg-mist"
              }`}
              aria-label="رجوع"
            >
              ›
            </Link>
          )}
          <div>
            <h1 className="text-lg leading-tight font-bold">{title}</h1>
            {subtitle && (
              <p className={`text-[11px] ${dark ? "text-white/60" : "text-navy-400"}`}>{subtitle}</p>
            )}
          </div>
        </div>
        <Link
          href="/app"
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            dark ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <span className="ltr">DEMO</span> · بيانات تجريبية
        </Link>
      </div>
    </header>
  );
}

export function ServiceChip({ type }: { type: ServiceType }) {
  const t = TEMPLATES[type];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${SERVICE_COLORS[type]}`}>
      {t.emoji} {t.serviceLabel}
    </span>
  );
}

type TimelineNote = {
  id: number;
  serviceType: ServiceType;
  title: string;
  visitDate: string;
  providerName: string;
  version: number;
};

export function Timeline({ notes, hrefBase }: { notes: TimelineNote[]; hrefBase: string }) {
  if (notes.length === 0)
    return <p className="px-5 py-10 text-center text-sm text-navy-400">لا توجد سجلات ضمن نطاق الاطلاع.</p>;
  return (
    <ol className="relative px-5 py-5">
      <span className="absolute top-6 bottom-6 right-[31px] w-px bg-line" />
      {notes.map((n) => (
        <li key={n.id} className="relative mb-4 pr-10 last:mb-0">
          <span className="absolute top-3 right-1.5 grid size-5 place-items-center rounded-full border-2 border-white bg-emerald-500 text-[9px] shadow ring-2 ring-emerald-100" />
          <Link
            href={`${hrefBase}/${n.id}`}
            className="block rounded-2xl border border-line bg-white p-4 shadow-sm transition hover:border-emerald-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-navy-400">{formatDateAr(n.visitDate)}</span>
              <ServiceChip type={n.serviceType} />
            </div>
            <p className="mt-2 text-sm font-bold text-navy-900">{n.title}</p>
            <p className="mt-0.5 text-[12px] text-navy-400">مقدم الخدمة: {n.providerName}</p>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
              📋 ملاحظة رعاية متاحة
              {n.version > 1 && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 ring-1 ring-amber-200">
                  مُصحّحة · v{n.version}
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function NoteBody({
  type,
  data,
  durationMin,
  visitDate,
}: {
  type: ServiceType;
  data: CareNoteData;
  durationMin: number;
  visitDate: string;
}) {
  const t = TEMPLATES[type];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-mist p-3">
          <p className="text-[10px] text-navy-400">تاريخ الزيارة</p>
          <p className="text-sm font-bold">{formatDateAr(visitDate)}</p>
        </div>
        <div className="rounded-xl bg-mist p-3">
          <p className="text-[10px] text-navy-400">المدة</p>
          <p className="text-sm font-bold">{durationMin} دقيقة</p>
        </div>
      </div>
      {t.fields.map((f) => {
        const v = data[f.key];
        if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) return null;
        return (
          <div key={f.key} className="rounded-xl border border-line p-3">
            <p className="text-[11px] font-bold text-navy-400">{f.label}</p>
            {Array.isArray(v) ? (
              <ul className="mt-1.5 space-y-1">
                {v.map((x) => (
                  <li key={x} className="flex items-center gap-2 text-sm">
                    <span className="grid size-4 place-items-center rounded bg-emerald-500 text-[10px] text-white">✓</span>
                    {x}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm leading-6">{v}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

type Version = {
  id: number;
  version: number;
  action: string;
  reason: string | null;
  changes: { field: string; before: string; after: string }[];
  createdAt: Date;
  actorName: string;
};

export function AuditTrail({ versions, type }: { versions: Version[]; type: ServiceType }) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="text-xs font-bold">
        🧾 سجل التدقيق <span className="ltr text-navy-400">Audit Trail</span>
      </p>
      <ol className="mt-3 space-y-3">
        {versions.map((v) => (
          <li key={v.id} className="border-r-2 border-emerald-200 pr-3">
            <p className="text-[12px] font-semibold">
              v{v.version} · {v.action === "created" ? "إنشاء وتأكيد الملاحظة" : "تصحيح (Amendment)"} — {v.actorName}
            </p>
            <p className="text-[10px] text-navy-400">{formatDateTimeAr(v.createdAt)}</p>
            {v.reason && <p className="mt-1 text-[11px] text-navy-600">السبب: {v.reason}</p>}
            {v.changes.map((c, i) => (
              <p key={i} className="mt-1 text-[11px] leading-5">
                <span className="font-semibold">{fieldLabel(type, c.field)}:</span>{" "}
                <span className="text-red-600 line-through">{c.before || "—"}</span> ←{" "}
                <span className="text-emerald-700">{c.after || "—"}</span>
              </p>
            ))}
          </li>
        ))}
      </ol>
    </div>
  );
}

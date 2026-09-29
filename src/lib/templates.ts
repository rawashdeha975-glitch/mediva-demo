import type { ServiceType } from "@/db/schema";

export type FieldDef =
  | { key: string; label: string; kind: "text" | "textarea" }
  | { key: string; label: string; kind: "checklist"; options: string[] }
  | { key: string; label: string; kind: "select"; options: string[] };

export type Template = {
  type: ServiceType;
  name: string;
  nameEn: string;
  emoji: string;
  serviceLabel: string;
  fields: FieldDef[];
};

export const TEMPLATES: Record<ServiceType, Template> = {
  nursing: {
    type: "nursing",
    name: "ملاحظة رعاية تمريضية",
    nameEn: "Nursing Care Note",
    emoji: "🩺",
    serviceLabel: "تمريض منزلي",
    fields: [
      { key: "reason", label: "سبب / نوع الزيارة", kind: "text" },
      {
        key: "procedures",
        label: "الإجراءات التي تم تنفيذها",
        kind: "checklist",
        options: [
          "تقييم الحالة العامة",
          "قياس العلامات الحيوية",
          "تغيير الضماد",
          "تنظيف الجرح",
          "إعطاء الدواء حسب الوصفة",
          "تقييم موضع الجرح",
        ],
      },
      { key: "notes", label: "الملاحظات", kind: "textarea" },
      { key: "followUp", label: "المتابعة", kind: "text" },
    ],
  },
  physio: {
    type: "physio",
    name: "ملاحظة جلسة علاج طبيعي",
    nameEn: "Physiotherapy Note",
    emoji: "🧑‍🦽",
    serviceLabel: "علاج طبيعي",
    fields: [
      { key: "sessionType", label: "نوع الجلسة", kind: "text" },
      {
        key: "exercises",
        label: "التمارين / الإجراءات المنفذة",
        kind: "checklist",
        options: [
          "تمارين تقوية",
          "تمارين مدى الحركة",
          "تمارين توازن",
          "تدريب على المشي",
          "علاج يدوي",
        ],
      },
      { key: "notes", label: "ملاحظات الجلسة", kind: "textarea" },
      { key: "followUp", label: "خطة المتابعة", kind: "text" },
    ],
  },
  lab: {
    type: "lab",
    name: "ملاحظة جمع عينة مخبرية",
    nameEn: "Laboratory Collection Note",
    emoji: "🧪",
    serviceLabel: "مختبر",
    fields: [
      { key: "sampleType", label: "نوع العينة", kind: "select", options: ["دم", "بول", "مسحة"] },
      { key: "collectionTime", label: "وقت الجمع", kind: "text" },
      { key: "sampleStatus", label: "حالة العينة", kind: "select", options: ["سليمة", "تحتاج إعادة جمع"] },
      { key: "notes", label: "ملاحظات الجمع", kind: "textarea" },
    ],
  },
  pharmacy: {
    type: "pharmacy",
    name: "ملاحظة تعامل صيدلاني",
    nameEn: "Pharmacy Interaction Note",
    emoji: "💊",
    serviceLabel: "صيدلية",
    fields: [
      { key: "requestType", label: "نوع الطلب / الخدمة", kind: "text" },
      { key: "orderStatus", label: "حالة الطلب", kind: "select", options: ["قيد التجهيز", "جاهز", "تم التسليم"] },
      { key: "notes", label: "ملاحظات مرتبطة بالمعاملة", kind: "textarea" },
    ],
  },
};

export const SERVICE_COLORS: Record<ServiceType, string> = {
  nursing: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  physio: "bg-sky-50 text-sky-700 ring-sky-200",
  lab: "bg-violet-50 text-violet-700 ring-violet-200",
  pharmacy: "bg-amber-50 text-amber-700 ring-amber-200",
};

export function fieldLabel(type: ServiceType, key: string) {
  if (key === "durationMin") return "مدة الزيارة (دقيقة)";
  if (key === "visitDate") return "تاريخ الزيارة";
  if (key === "title") return "عنوان الزيارة";
  return TEMPLATES[type].fields.find((f) => f.key === key)?.label ?? key;
}

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function formatDateAr(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${AR_MONTHS[m - 1]} ${y}`;
}

export function formatDateTimeAr(date: Date | string) {
  const d = new Date(date);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Amman",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${formatDateAr(`${g("year")}-${g("month")}-${g("day")}`)} — ${g("hour")}:${g("minute")}`;
}

export function valueToText(v: string | string[] | undefined) {
  if (v === undefined || v === null) return "";
  return Array.isArray(v) ? v.join("، ") : String(v);
}

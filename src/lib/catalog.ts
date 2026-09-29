import type { ServiceType } from "@/db/schema";

/* =============================== PACKAGES =============================== */
export type Tier = "starter" | "pro" | "elite";

export type PackageDef = {
  tier: Tier;
  name: string;
  priceJod: number; // monthly, proposed demo pricing
  featuredDays: number; // featured visibility to patients / month
  adCredits: number; // in-app ads / month
  pointsMultiplier: number;
  common: string[];
  field: string[];
};

const FIELD_BRAND: Record<ServiceType, string> = {
  nursing: "رعاية",
  physio: "حركة",
  lab: "عيّنة",
  pharmacy: "دواء",
};

const PRICES: Record<ServiceType, [number, number]> = {
  nursing: [15, 35],
  physio: [18, 40],
  lab: [25, 60],
  pharmacy: [20, 50],
};

const FIELD_FEATURES: Record<ServiceType, [string[], string[], string[]]> = {
  nursing: [
    ["استقبال طلبات التمريض المنزلي", "قوالب ملاحظات تمريضية"],
    ["أولوية في طلبات رعاية ما بعد العمليات", "مساعد AI لتنظيم ملاحظات الضماد والمتابعة"],
    ["شارة «ممرض موثوق» على الملف", "تقارير أداء شهرية مفصّلة", "أولوية قصوى في طلبات الرعاية طويلة المدى"],
  ],
  physio: [
    ["استقبال طلبات الجلسات المنزلية", "قالب ملاحظة جلسة علاج طبيعي"],
    ["إدارة برامج متعددة الجلسات", "تذكير المرضى بالجلسات التالية"],
    ["عرض «برامج التأهيل» على الملف", "تحليلات التزام المرضى بالبرامج", "أولوية في طلبات إعادة التأهيل"],
  ],
  lab: [
    ["استقبال طلبات جمع العينات", "قالب ملاحظة جمع عينة"],
    ["جدولة مسارات الجمع المنزلي", "تنبيهات الصيام وتعليمات ما قبل الفحص للمريض"],
    ["عرض باقات الفحوصات على الملف", "أولوية في طلبات الجمع الصباحية", "تقارير طلب حسب المنطقة"],
  ],
  pharmacy: [
    ["استقبال طلبات المنتجات الصحية", "قالب ملاحظة تعامل صيدلاني"],
    ["كتالوج منتجات قابل للبحث", "إشعارات الطلبات الفورية"],
    ["عرض «منتجات مميزة» للمرضى", "تحليلات المنتجات الأكثر طلباً", "أولوية في طلبات مستلزمات الرعاية المنزلية"],
  ],
};

export function getPackages(type: ServiceType): PackageDef[] {
  const b = FIELD_BRAND[type];
  const [pro, elite] = PRICES[type];
  const f = FIELD_FEATURES[type];
  return [
    {
      tier: "starter",
      name: `${b} — أساسي`,
      priceJod: 0,
      featuredDays: 0,
      adCredits: 0,
      pointsMultiplier: 1,
      common: ["ملف مهني في السوق", "مساعد AI أساسي", "نظام النقاط وعجلة الحظ"],
      field: f[0],
    },
    {
      tier: "pro",
      name: `${b} برو`,
      priceJod: pro,
      featuredDays: 7,
      adCredits: 2,
      pointsMultiplier: 1.5,
      common: ["⭐ ظهور مميز للمرضى 7 أيام/شهر", "📣 إعلانان داخل التطبيق/شهر", "نقاط ×1.5 على كل مهمة", "مساعد AI متقدم"],
      field: [...f[0], ...f[1]],
    },
    {
      tier: "elite",
      name: `${b} إليت`,
      priceJod: elite,
      featuredDays: 30,
      adCredits: 6,
      pointsMultiplier: 2,
      common: ["⭐ ظهور مميز للمرضى طوال الشهر", "📣 6 إعلانات داخل التطبيق/شهر", "نقاط ×2 على كل مهمة", "مساعد AI كامل + تحليلات"],
      field: [...f[0], ...f[1], ...f[2]],
    },
  ];
}

export const TIER_LABEL: Record<Tier, string> = { starter: "أساسي", pro: "برو", elite: "إليت" };

/* =============================== POINTS =============================== */
export type TaskDef = { key: string; title: string; points: number; freq: "daily" | "each" | "once"; icon: string };

export const TASKS: TaskDef[] = [
  { key: "daily_checkin", title: "تسجيل الحضور اليومي", points: 10, freq: "daily", icon: "📅" },
  { key: "complete_booking", title: "إتمام خدمة لمريض", points: 40, freq: "each", icon: "✅" },
  { key: "care_note", title: "توثيق ملاحظة رعاية", points: 20, freq: "each", icon: "📋" },
  { key: "five_star", title: "الحصول على تقييم 5 نجوم", points: 30, freq: "each", icon: "⭐" },
  { key: "accept_fast", title: "قبول طلب جديد", points: 10, freq: "each", icon: "⚡" },
  { key: "first_ad", title: "نشر أول إعلان", points: 50, freq: "once", icon: "📣" },
];

export type StoreItem = { key: string; title: string; kind: "featured" | "ad"; days: number; cost: number };

export const STORE: StoreItem[] = [
  { key: "featured_1", title: "ظهور مميز — يوم واحد", kind: "featured", days: 1, cost: 120 },
  { key: "featured_3", title: "ظهور مميز — 3 أيام", kind: "featured", days: 3, cost: 300 },
  { key: "featured_7", title: "ظهور مميز — 7 أيام", kind: "featured", days: 7, cost: 600 },
  { key: "ad_3", title: "إعلان داخل التطبيق — 3 أيام", kind: "ad", days: 3, cost: 400 },
  { key: "ad_7", title: "إعلان داخل التطبيق — 7 أيام", kind: "ad", days: 7, cost: 800 },
];

/* =============================== LUCKY WHEEL =============================== */
export type Prize = {
  key: string;
  label: string;
  short: string;
  weight: number;
  color: string;
  points?: number;
  featuredDays?: number;
  adDays?: number;
};

export const WHEEL: Prize[] = [
  { key: "p20", label: "20 نقطة", short: "20", weight: 26, color: "#0a1a33", points: 20 },
  { key: "f1", label: "ظهور مميز يوم", short: "⭐ يوم", weight: 8, color: "#10b981", featuredDays: 1 },
  { key: "p50", label: "50 نقطة", short: "50", weight: 20, color: "#193459", points: 50 },
  { key: "none", label: "حظاً أوفر", short: "🍀", weight: 16, color: "#7089ad" },
  { key: "p100", label: "100 نقطة", short: "100", weight: 12, color: "#0a1a33", points: 100 },
  { key: "ad2", label: "إعلان يومين", short: "📣 2", weight: 6, color: "#059669", adDays: 2 },
  { key: "p250", label: "250 نقطة", short: "250", weight: 5, color: "#193459", points: 250 },
  { key: "f3", label: "ظهور مميز 3 أيام", short: "⭐ 3", weight: 7, color: "#10b981", featuredDays: 3 },
];

export const EXTRA_SPIN_COST = 50;

/* =============================== REVIEWS =============================== */
export const REVIEW_TAGS = ["ملتزم بالموعد", "لطيف ومحترم", "شرح واضح", "نظافة وتعقيم", "مهارة عالية", "أنصح به"];

export const SERVICE_KEYWORDS: Record<ServiceType, string[]> = {
  nursing: ["ضماد", "جرح", "حقن", "ابره", "إبرة", "تمريض", "ممرض", "ممرضه", "ممرضة", "عمليه", "عملية", "قسطره", "مسن", "كبير", "رعايه", "رعاية", "سيروم", "قياس ضغط", "تغيير"],
  physio: ["علاج طبيعي", "تاهيل", "تأهيل", "ظهر", "ركبه", "ركبة", "مفصل", "كسر", "جلطه", "جلطة", "حركه", "حركة", "تمارين", "عضل", "رقبه", "رقبة", "كتف", "مشي"],
  lab: ["تحليل", "تحاليل", "فحص دم", "عينه", "عينة", "مختبر", "سكر تراكمي", "فيتامين", "دم", "بول", "كوليسترول", "غده", "غدة"],
  pharmacy: ["دواء", "ادويه", "أدوية", "صيدليه", "صيدلية", "مستلزمات", "شاش", "حليب", "منتج", "كريم", "مكمل", "فيتامينات", "حفاضات"],
};

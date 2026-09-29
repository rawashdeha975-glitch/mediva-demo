import "server-only";
import type { ServiceType, CareNoteData } from "@/db/schema";
import { TEMPLATES } from "@/lib/templates";

export type StructureResult = {
  data: CareNoteData;
  durationMin?: number;
  engine: "openai" | "local";
  removed: string[]; // anything dropped by the anti-invention guard
};

/* ---------- helpers ---------- */
function norm(s: string) {
  return s
    .replace(/[\u064B-\u0652\u0640]/g, "") // tashkeel + tatweel
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase();
}

function toWesternDigits(s: string) {
  return s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

function splitClauses(text: string) {
  return text
    .split(/[.،,؛;\n!؟?]+|\s+و(?=(?:طلبت|قست|غيرت|بدلت|اعطيت|أعطيت|نظفت|قيمت|المريض|المريضه|المريضة|الحاله|الحالة|تم|عملت|سويت|جمعت|سلمت|نفذت|راجعت|لاحظت|اشتكى|اشتكت))/)
    .map((c) => c.trim())
    .filter((c) => c.length > 1);
}

type Rule = { re: RegExp; item: string };

const PROCEDURE_RULES: Record<ServiceType, Rule[]> = {
  nursing: [
    { re: /(غيرت|بدلت|تغيير|تبديل|غيرنا).{0,12}ضماد/, item: "تغيير الضماد" },
    { re: /(قست|قياس|قسنا|فحصت).{0,20}(علامات|ضغط|حراره|نبض|سكر)/, item: "قياس العلامات الحيوية" },
    { re: /(اعطيت|اعطاء|عطيت|اعطينا).{0,20}(دواء|علاج|ابره|حقنه|جرعه)/, item: "إعطاء الدواء حسب الوصفة" },
    { re: /(نظفت|تنظيف|عقمت|تعقيم).{0,12}جرح/, item: "تنظيف الجرح" },
    { re: /(قيمت|تقييم|فحصت|تفقدت).{0,12}(موضع الجرح|الجرح)/, item: "تقييم موضع الجرح" },
    { re: /(قيمت|تقييم).{0,12}(الحاله|الوضع) العام/, item: "تقييم الحالة العامة" },
  ],
  physio: [
    { re: /تقويه/, item: "تمارين تقوية" },
    { re: /مدي الحركه|مرونه/, item: "تمارين مدى الحركة" },
    { re: /توازن/, item: "تمارين توازن" },
    { re: /(مشي|المشي)/, item: "تدريب على المشي" },
    { re: /(علاج يدوي|مساج|تدليك)/, item: "علاج يدوي" },
  ],
  lab: [],
  pharmacy: [],
};

const FOLLOWUP_RE = /(متابعه|موعد|الزياره القادمه|الجلسه القادمه|راجع|يراجع|المره الجايه|الاسبوع القادم)/;
const OBSERVATION_RE = /(الحاله|مستقر|يشكو|تشكو|اشتكي|(^|\s)(الم|وجع)(\s|$)|لاحظت|المريض|المريضه|وضعه|وضعها|بحاله)/;

function cleanFollowUp(c: string) {
  return c.replace(/^(و?طلبت\s+(منه|منها|منهم)\s+)/, "").replace(/^(و\s*)/, "").trim();
}

/* ---------- local, grounded structurer ---------- */
function structureLocal(type: ServiceType, text: string): StructureResult {
  const t = TEMPLATES[type];
  const clauses = splitClauses(text);
  const data: CareNoteData = {};
  const checklistKey = t.fields.find((f) => f.kind === "checklist")?.key;
  const items = new Set<string>();
  const notes: string[] = [];
  const follow: string[] = [];
  const n = norm(text);

  for (const c of clauses) {
    const nc = norm(c);
    const matched = PROCEDURE_RULES[type].filter((r) => r.re.test(nc));
    if (matched.length) {
      matched.forEach((m) => items.add(m.item));
      // keep any extra observation inside the same clause as a note
      if (OBSERVATION_RE.test(nc) && !FOLLOWUP_RE.test(nc)) notes.push(c);
      continue;
    }
    if (FOLLOWUP_RE.test(nc)) {
      follow.push(cleanFollowUp(c));
      continue;
    }
    // clauses already captured by dedicated fields shouldn't be duplicated in notes
    if (/\d+\s*دقيق/.test(toWesternDigits(nc))) continue;
    if (type === "lab" && /(عينه|الساعه)/.test(nc)) continue;
    if (type === "pharmacy" && /(سلمت|تم التسليم|جاهز|تجهيز)/.test(nc)) continue;
    if (OBSERVATION_RE.test(nc)) {
      notes.push(`${c} (حسب ملاحظة مقدم الخدمة)`);
      continue;
    }
    notes.push(c);
  }

  if (checklistKey && items.size) data[checklistKey] = [...items];

  // service-specific extraction (only from provided text)
  if (type === "lab") {
    if (/دم/.test(n)) data.sampleType = "دم";
    else if (/بول/.test(n)) data.sampleType = "بول";
    else if (/مسحه/.test(n)) data.sampleType = "مسحة";
    if (/(اعاده|تالف|غير كافي|غير صالح)/.test(n)) data.sampleStatus = "تحتاج إعادة جمع";
    else if (/(سليم|جيده|صالح)/.test(n)) data.sampleStatus = "سليمة";
    const tm = toWesternDigits(text).match(/(?:الساع[ةه]\s*)(\d{1,2}(?::\d{2})?)(\s*(صباحا|صباحاً|مساء|مساءً|الصبح|المسا))?/);
    if (tm) data.collectionTime = tm[0].replace(/^الساع[ةه]\s*/, "").trim();
  }
  if (type === "pharmacy") {
    if (/(سلمت|تم التسليم|وصلت|توصيل)/.test(n)) data.orderStatus = "تم التسليم";
    else if (/جاهز/.test(n)) data.orderStatus = "جاهز";
    else if (/تجهيز/.test(n)) data.orderStatus = "قيد التجهيز";
  }

  if (notes.length) data.notes = notes.join("، ") + ".";
  if (follow.length && t.fields.some((f) => f.key === "followUp")) data.followUp = follow.join("، ");

  const dm = toWesternDigits(text).match(/(\d{1,3})\s*دقيق/);
  return {
    data,
    durationMin: dm ? Number(dm[1]) : undefined,
    engine: "local",
    removed: [],
  };
}

/* ---------- anti-invention guard ---------- */
function guard(type: ServiceType, source: string, res: StructureResult): StructureResult {
  const src = toWesternDigits(source);
  const srcNums = new Set(src.match(/\d+/g) ?? []);
  const removed: string[] = [...res.removed];
  const t = TEMPLATES[type];
  const out: CareNoteData = {};

  for (const f of t.fields) {
    const v = res.data[f.key];
    if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) continue;

    if (f.kind === "checklist" || f.kind === "select") {
      const allowed = f.options;
      const vals = (Array.isArray(v) ? v : [v]).filter((x) => {
        const ok = allowed.includes(x);
        if (!ok) removed.push(`${f.label}: «${x}» خارج خيارات القالب`);
        return ok;
      });
      if (vals.length) out[f.key] = f.kind === "select" ? vals[0] : vals;
      continue;
    }

    const text = toWesternDigits(String(v));
    const nums = text.match(/\d+/g) ?? [];
    const invented = nums.filter((x) => !srcNums.has(x));
    if (invented.length) {
      removed.push(`${f.label}: تم حذف قيمة رقمية لم يدخلها مقدم الخدمة (${invented.join(", ")})`);
      continue;
    }
    out[f.key] = String(v);
  }

  let durationMin = res.durationMin;
  if (durationMin !== undefined && !srcNums.has(String(durationMin))) {
    removed.push("مدة الزيارة: غير مذكورة في النص الأصلي");
    durationMin = undefined;
  }
  return { ...res, data: out, durationMin, removed };
}

/* ---------- optional LLM path ---------- */
async function structureOpenAI(type: ServiceType, text: string): Promise<StructureResult | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const t = TEMPLATES[type];
  const schemaDesc = t.fields
    .map((f) =>
      "options" in f
        ? `"${f.key}" (${f.label}) — ${f.kind === "checklist" ? "array" : "one"} of: ${f.options.join(" | ")}`
        : `"${f.key}" (${f.label}) — string`
    )
    .join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You organize a healthcare provider's free-text visit note into a structured Arabic care note. " +
              "STRICT RULES: Only use information explicitly written by the provider. NEVER invent values, vital signs, numbers, diagnoses, prescriptions or recommendations. " +
              "If a field is not mentioned, omit it. Do not diagnose. Do not prescribe. Organize → Structure → Summarize only. " +
              'Return JSON: {"data": {...fields}, "durationMin": number|null}. Fields:\n' +
              schemaDesc,
          },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
    return {
      data: (parsed.data ?? {}) as CareNoteData,
      durationMin: typeof parsed.durationMin === "number" ? parsed.durationMin : undefined,
      engine: "openai",
      removed: [],
    };
  } catch {
    return null;
  }
}

export async function structureCareNote(type: ServiceType, text: string): Promise<StructureResult> {
  const clean = text.trim().slice(0, 2000);
  const llm = await structureOpenAI(type, clean);
  return guard(type, clean, llm ?? structureLocal(type, clean));
}

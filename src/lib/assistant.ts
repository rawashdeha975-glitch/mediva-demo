import "server-only";
import type { ServiceType } from "@/db/schema";
import { SERVICE_KEYWORDS, TASKS, STORE, getPackages, TIER_LABEL } from "@/lib/catalog";
import { TEMPLATES } from "@/lib/templates";
import { getProvider, getPatient } from "@/lib/care";
import {
  getRankedProviders,
  getPointsBalance,
  getTier,
  getFeaturedUntil,
  getReviewBreakdown,
  getProviderReviews,
  getProviderBookings,
  getPendingRatings,
  getProviderAds,
} from "@/lib/market";

export type AiLink = { label: string; href: string };
export type AiReply = { reply: string; links: AiLink[]; suggestions: string[]; engine: "local" | "openai" };
export type ChatMsg = { role: "user" | "assistant"; content: string };

function norm(s: string) {
  return s.replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase();
}
const has = (t: string, words: string[]) => words.some((w) => t.includes(norm(w)));

const EMERGENCY = ["الم في الصدر", "الم صدر", "نزيف شديد", "فقدان وعي", "فقد الوعي", "اغماء", "ضيق تنفس", "ضيق نفس", "لا يتنفس", "تشنج", "جلطه الان", "حادث", "طوارئ", "تسمم"];
const EMERGENCY_REPLY =
  "⚠️ ما تصفه قد يكون حالة طارئة. اتصل فوراً بالطوارئ على الرقم 911 أو توجّه لأقرب قسم طوارئ.\nMEDIVA ليست خدمة طوارئ، والمساعد لا يقدّم تشخيصاً.";

function detectService(t: string): ServiceType | null {
  let best: ServiceType | null = null;
  let score = 0;
  (Object.keys(SERVICE_KEYWORDS) as ServiceType[]).forEach((k) => {
    const s = SERVICE_KEYWORDS[k].filter((w) => t.includes(norm(w))).length;
    if (s > score) {
      score = s;
      best = k;
    }
  });
  return best;
}

/* ================================ PATIENT ================================ */
async function patientLocal(text: string): Promise<Omit<AiReply, "engine">> {
  const t = norm(text);
  if (has(t, EMERGENCY)) return { reply: EMERGENCY_REPLY, links: [], suggestions: [] };

  if (has(t, ["شخص", "تشخيص", "شو عندي", "ايش عندي", "مرضي", "وصف", "اي دواء", "شو اخذ", "جرعه"])) {
    return {
      reply:
        "لا أستطيع تشخيص الحالة أو وصف دواء أو جرعة — هذا دور مقدم الرعاية المؤهل.\nلكن أقدر أساعدك تلاقي الخدمة المناسبة. احكيلي شو نوع المساعدة اللي بتحتاجها (مثلاً: تغيير ضماد، جلسة علاج طبيعي، سحب عينة، مستلزمات).",
      links: [],
      suggestions: ["بدي ممرض لتغيير ضماد", "بحتاج علاج طبيعي للركبة", "بدي سحب عينة دم بالبيت"],
    };
  }

  if (has(t, ["قيم", "تقييم", "اقيم"])) {
    const pending = await getPendingRatings();
    return {
      reply: pending.length
        ? `عندك ${pending.length} خدمة مكتملة بانتظار تقييمك. التقييم بعد كل إجراء يساعد المرضى الآخرين ويكافئ مقدمي الخدمة المتميزين.`
        : "ما عندك خدمات بانتظار التقييم حالياً. بعد إتمام كل خدمة بيظهر لك طلب تقييم.",
      links: pending.slice(0, 2).map((b) => ({ label: `قيّم ${b.providerName}`, href: `/app/patient/bookings/${b.id}/rate` })),
      suggestions: ["شو حجوزاتي؟", "افتح سجل الرعاية"],
    };
  }
  if (has(t, ["حجوزات", "حجزي", "مواعيدي", "موعدي"]))
    return { reply: "هاي حجوزاتك وحالتها:", links: [{ label: "حجوزاتي", href: "/app/patient/bookings" }], suggestions: ["بدي أقيّم خدمة"] };
  if (has(t, ["سجل", "ملاحظات", "زيارات سابقه"]))
    return {
      reply: "سجل الرعاية الرقمي فيه كل الخدمات اللي تمت عبر MEDIVA، وأنت تتحكم مين يشوفه.",
      links: [
        { label: "سجل الرعاية", href: "/app/patient/record" },
        { label: "صلاحيات الوصول", href: "/app/patient/access" },
      ],
      suggestions: [],
    };

  const svc = detectService(t);
  if (svc) {
    const top = (await getRankedProviders(svc)).slice(0, 3);
    const tpl = TEMPLATES[svc];
    const lines = top.map(
      (p, i) =>
        `${i + 1}. ${p.name} — ${p.label}${p.featuredUntil ? " ⭐مميز" : ""}\n   ${p.rating.count ? `★ ${p.rating.avg} (${p.rating.count} تقييم)` : "جديد"} · ${p.city} · من ${p.priceFrom} د.أ`
    );
    return {
      reply: `يبدو أن طلبك ضمن خدمة ${tpl.emoji} ${tpl.serviceLabel}. هؤلاء الأنسب حسب التقييمات والخبرة والتوفر:\n\n${lines.join("\n")}\n\nℹ️ الترشيح مبني على بيانات المنصة وليس تشخيصاً طبياً.`,
      links: [
        ...top.map((p) => ({ label: `احجز مع ${p.name}`, href: `/app/patient/providers/${p.id}` })),
        { label: `كل مزودي ${tpl.serviceLabel}`, href: `/app/patient/services/${svc}` },
      ],
      suggestions: ["شو الفرق بين المزودين؟", "كيف بقيّم بعد الخدمة؟"],
    };
  }

  if (has(t, ["فرق", "اختار", "مين احسن", "افضل"]))
    return {
      reply:
        "نرتّب مقدمي الخدمة حسب: متوسط التقييم وعدده، سنوات الخبرة، والتقييمات التفصيلية (الاحترافية، الالتزام بالموعد، التواصل). المزودون الذين يحملون شارة ⭐ «مميز» يظهرون أولاً ضمن ظهور مدفوع أو مكتسب — ونوضح ذلك دائماً بشفافية.",
      links: [],
      suggestions: ["بدي ممرض لتغيير ضماد", "بحتاج علاج طبيعي"],
    };

  return {
    reply: "أهلاً! أنا مساعد MEDIVA 👋\nاكتبلي احتياجك بكلماتك، وبساعدك تلاقي الخدمة ومقدم الخدمة الأنسب، تتابع حجوزاتك، أو تقيّم خدمة.",
    links: [],
    suggestions: ["بدي ممرض لتغيير ضماد", "بحتاج علاج طبيعي للظهر", "بدي تحليل دم بالبيت", "بدي مستلزمات ضماد"],
  };
}

/* ================================ PROVIDER ================================ */
const FIELD_TIPS: Record<ServiceType, string[]> = {
  nursing: [
    "جهّز حقيبة مستلزمات ثابتة (ضمادات، معقّم، قفازات) قبل كل زيارة لتقليل وقت الزيارة.",
    "وثّق ملاحظة الرعاية مباشرة بعد الزيارة — تكسبك نقاط وتبني ثقة المريض.",
    "رسالة تأكيد قبل الموعد بساعة ترفع تقييم «الالتزام بالموعد».",
  ],
  physio: [
    "قدّم البرنامج كسلسلة جلسات واضحة الأهداف — المرضى يفضّلون الخطط متعددة الجلسات.",
    "أرسل للمريض ملخص تمارين الجلسة ليتابعها بين الزيارات.",
    "تقييم «التواصل» يرتفع عندما تشرح هدف كل جلسة.",
  ],
  lab: [
    "ذكّر المريض بتعليمات الصيام قبل الموعد بليلة — يقلّل إعادة الجمع.",
    "المواعيد الصباحية المبكرة هي الأكثر طلباً لجمع العينات.",
    "سجّل حالة العينة ووقت الجمع بدقة في ملاحظة الجمع.",
  ],
  pharmacy: [
    "ركّز على مستلزمات الرعاية المنزلية — الطلب عليها مرتبط بخدمات التمريض.",
    "حدّث حالة الطلب أولاً بأول لتقييم أعلى.",
    "إعلان لمنتجات موسمية داخل التطبيق يرفع الزيارات لملفك.",
  ],
};

const AD_DRAFTS: Record<ServiceType, [string, string][]> = {
  nursing: [
    ["رعاية تمريضية في بيتك", "تغيير ضماد، حقن ومتابعة بعد العمليات — بمواعيد مرنة وتوثيق لكل زيارة."],
    ["راحة أحبائك في المنزل", "زيارات تمريضية منتظمة مع ملاحظات رعاية موثقة لكل زيارة."],
  ],
  physio: [
    ["تعافَ في بيتك", "جلسات علاج طبيعي منزلية ضمن برنامج واضح الأهداف — احجز الجلسة الأولى."],
    ["برنامج تأهيل منزلي", "خطة جلسات متدرجة بعد الإصابات والعمليات، مع متابعة بين الجلسات."],
  ],
  lab: [
    ["فحوصاتك بدون مشوار", "جمع عينات منزلي صباحي مع تذكير بتعليمات الصيام."],
    ["سحب عينات في البيت", "مواعيد صباحية مبكرة والتزام كامل بتعليمات الفحص."],
  ],
  pharmacy: [
    ["مستلزمات الرعاية لباب بيتك", "ضمادات وشاش ومنتجات عناية منزلية — اطلبها من خلال MEDIVA."],
    ["كل احتياجات الرعاية المنزلية", "منتجات صحية مختارة مع تحديث مستمر لحالة طلبك."],
  ],
};

async function providerLocal(pid: number, text: string): Promise<Omit<AiReply, "engine">> {
  const p = await getProvider(pid);
  if (!p) return { reply: "مقدم خدمة غير معروف.", links: [], suggestions: [] };
  const t = norm(text);
  const base = `/app/provider/${pid}`;
  const tpl = TEMPLATES[p.serviceType];

  if (has(t, ["شخص", "تشخيص", "جرعه", "اي دواء", "اوصف", "وصفه"]))
    return {
      reply: "المساعد لا يشخّص ولا يصف علاجاً أو جرعات — القرار السريري لك وحسب الوصفة المعتمدة. أقدر أساعدك في تنظيم الملاحظة، إدارة الطلبات، وتحسين ظهورك.",
      links: [{ label: "ملاحظة رعاية بمساعدة AI", href: `${base}/new` }],
      suggestions: ["كيف أزيد طلباتي؟", "نظّم ملاحظة زيارة"],
    };

  if (has(t, ["نقاط", "نقطه", "رصيد", "عجله", "حظ", "استبدل"])) {
    const [bal, tier] = await Promise.all([getPointsBalance(pid), getTier(pid)]);
    const mult = getPackages(p.serviceType).find((x) => x.tier === tier)!.pointsMultiplier;
    const afford = STORE.filter((s) => s.cost <= bal).map((s) => `• ${s.title} (${s.cost})`);
    return {
      reply: `رصيدك الحالي: ${bal} نقطة${mult > 1 ? ` — باقتك تضاعف النقاط ×${mult}` : ""}.\n\nتكسب النقاط من:\n${TASKS.map((x) => `• ${x.icon} ${x.title}: +${x.points}`).join("\n")}\n\n${afford.length ? `تقدر تستبدل الآن:\n${afford.join("\n")}` : "اجمع نقاط أكثر لتستبدلها بظهور مميز أو إعلان."}\n🎡 ولا تنسَ لفّة عجلة الحظ المجانية اليوم.`,
      links: [{ label: "النقاط وعجلة الحظ", href: `${base}/rewards` }],
      suggestions: ["كيف أزيد طلباتي؟", "اكتب لي إعلان"],
    };
  }

  if (has(t, ["اعلان", "اعلن", "ترويج"])) {
    const d = AD_DRAFTS[p.serviceType];
    return {
      reply: `هاي مسودتين إعلان مناسبة لمجالك (${tpl.serviceLabel}) — عدّلها كما تريد:\n\n① ${d[0][0]}\n${d[0][1]}\n\n② ${d[1][0]}\n${d[1][1]}\n\nالإعلان يظهر للمرضى في الصفحة الرئيسية مع وسم «إعلان».`,
      links: [{ label: "أنشئ إعلاناً", href: `${base}/ads?t=${encodeURIComponent(d[0][0])}&b=${encodeURIComponent(d[0][1])}` }],
      suggestions: ["كم نقاطي؟", "أي باقة تناسبني؟"],
    };
  }

  if (has(t, ["نبذه", "بايو", "bio", "وصف ملفي", "ملفي"])) {
    return {
      reply: `مسودة نبذة مهنية (بدون ادعاءات غير موثقة):\n\n«${p.label} في ${p.city} بخبرة ${p.experienceYears} سنوات. أقدّم خدمات ${tpl.serviceLabel} في المنزل بمواعيد مرنة، مع توثيق كل زيارة في سجل رعاية رقمي والتزام بالخصوصية.»\n\nنصيحة: اذكر فقط المؤهلات والتراخيص التي تستطيع إثباتها عند التحقق.`,
      links: [],
      suggestions: ["اكتب لي إعلان", "كيف أزيد طلباتي؟"],
    };
  }

  if (has(t, ["تقييم", "تقييمات", "مراجعات", "رايهم", "المرضى يقولوا"])) {
    const [br, rv] = await Promise.all([getReviewBreakdown(pid), getProviderReviews(pid, 30)]);
    const tagCount = new Map<string, number>();
    rv.forEach((r) => r.tags.forEach((x) => tagCount.set(x, (tagCount.get(x) ?? 0) + 1)));
    const topTags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    const weakest = [
      ["الاحترافية", br.professionalism],
      ["الالتزام بالموعد", br.punctuality],
      ["التواصل", br.communication],
    ].sort((a, b) => Number(a[1]) - Number(b[1]))[0];
    return {
      reply: br.count
        ? `ملخص تقييماتك: ★ ${br.avg} من ${br.count} تقييم.\n• الاحترافية ${br.professionalism} · الالتزام ${br.punctuality} · التواصل ${br.communication}\n• أكثر ما يمدحه المرضى: ${topTags.join("، ") || "—"}\n• فرصة التحسين: ${weakest[0]} (${weakest[1]})`
        : "لا توجد تقييمات بعد. أول 3 خدمات مكتملة وموثقة ستبني ملفك بسرعة.",
      links: [{ label: "كل التقييمات", href: `${base}/reviews` }],
      suggestions: ["كيف أحسّن تقييمي؟", "كيف أزيد طلباتي؟"],
    };
  }

  if (has(t, ["باقه", "باقات", "اشتراك", "اشترك"])) {
    const [tier, br] = await Promise.all([getTier(p.id), getReviewBreakdown(pid)]);
    const pk = getPackages(p.serviceType);
    const rec = br.count >= 5 && br.avg >= 4.6 ? pk[2] : pk[1];
    return {
      reply: `باقتك الحالية: ${TIER_LABEL[tier]}.\nبناءً على تقييمك (${br.avg || "—"}) وعدد خدماتك، أقترح «${rec.name}» (${rec.priceJod} د.أ/شهر): ظهور مميز ${rec.featuredDays} يوم، ${rec.adCredits} إعلانات، ونقاط ×${rec.pointsMultiplier}.\n(أسعار تجريبية مقترحة)`,
      links: [{ label: "الباقات", href: `${base}/packages` }],
      suggestions: ["كم نقاطي؟", "اكتب لي إعلان"],
    };
  }

  if (has(t, ["ملاحظه", "توثيق", "نظم", "care note"]))
    return {
      reply: "اكتب وصف الزيارة بكلماتك في صفحة الملاحظة، وأنا أنظّمه في قالب " + tpl.name + " — بدون إضافة أي معلومة أو قيمة لم تكتبها. أنت تراجع وتؤكد قبل الحفظ.",
      links: [{ label: "ملاحظة رعاية جديدة", href: `${base}/new` }],
      suggestions: ["كم نقاطي؟"],
    };

  if (has(t, ["طلب", "طلبات", "زياده", "ظهور", "ازيد", "مرضى جدد", "احسن"])) {
    const [br, feat, tier, bk, bal, myAds] = await Promise.all([
      getReviewBreakdown(pid),
      getFeaturedUntil(pid),
      getTier(pid),
      getProviderBookings(pid),
      getPointsBalance(pid),
      getProviderAds(pid),
    ]);
    const pending = bk.filter((b) => b.status === "pending").length;
    const tips: string[] = [];
    if (pending) tips.push(`عندك ${pending} طلب بانتظار الرد — القبول السريع يكسبك +10 نقاط ويرفع ترتيبك.`);
    if (!feat) tips.push(bal >= 120 ? `رصيدك ${bal} نقطة يكفي لظهور مميز — استبدله الآن.` : "فعّل الظهور المميز عبر باقة أو نقاط لتظهر أولاً للمرضى.");
    if (br.count < 5) tips.push("اطلب من مرضاك التقييم بعد كل خدمة — التقييمات أهم عامل في الترتيب.");
    if (br.punctuality && br.punctuality < 4.6) tips.push(`تقييم الالتزام بالموعد لديك ${br.punctuality} — رسالة تأكيد قبل الموعد تحسّنه.`);
    if (!myAds.some((a) => new Date(a.endsAt) > new Date())) tips.push("لا يوجد لديك إعلان نشط — إعلان داخل التطبيق يوصلك لمرضى جدد.");
    if (tier === "starter") tips.push("باقة برو تعطيك 7 أيام ظهور مميز وإعلانين شهرياً.");
    tips.push(...FIELD_TIPS[p.serviceType].slice(0, 2));
    return {
      reply: `خطة مخصصة لك كمقدم ${tpl.serviceLabel}:\n\n${tips.map((x, i) => `${i + 1}. ${x}`).join("\n")}`,
      links: [
        { label: "الطلبات", href: `${base}/requests` },
        { label: "النقاط والمكافآت", href: `${base}/rewards` },
      ],
      suggestions: ["اكتب لي إعلان", "أي باقة تناسبني؟", "ملخص تقييماتي"],
    };
  }

  return {
    reply: `أهلاً ${p.name} 👋 أنا مساعدك في MEDIVA كمقدم ${tpl.emoji} ${tpl.serviceLabel}.\nأقدر أساعدك في: زيادة طلباتك وظهورك، تلخيص تقييماتك، كتابة إعلان أو نبذة، اختيار الباقة، وإدارة نقاطك.\n\n💡 نصيحة اليوم: ${FIELD_TIPS[p.serviceType][new Date().getDate() % 3]}`,
    links: [],
    suggestions: ["كيف أزيد طلباتي؟", "ملخص تقييماتي", "اكتب لي إعلان", "كم نقاطي؟"],
  };
}

/* ================================ LLM (optional) ================================ */
async function llmRewrite(system: string, history: ChatMsg[], draft: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              system +
              "\nRULES: Reply in Arabic (Jordanian-friendly). Never diagnose, prescribe, or give doses. For emergencies tell them to call 911. " +
              "Only use facts from the PLATFORM DATA below; never invent providers, numbers, ratings or features. Keep it concise.\nPLATFORM DATA (grounded draft answer):\n" +
              draft,
          },
          ...history.slice(-8),
        ],
      }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export async function askAssistant(ctx: { role: "patient" } | { role: "provider"; providerId: number }, history: ChatMsg[]): Promise<AiReply> {
  const last = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  const local = ctx.role === "patient" ? await patientLocal(last) : await providerLocal(ctx.providerId, last);
  if (local.reply === EMERGENCY_REPLY) return { ...local, engine: "local" };

  let system = "You are MEDIVA's in-app assistant.";
  if (ctx.role === "patient") {
    const pt = await getPatient();
    system += ` You help a PATIENT (${pt.name}) find home-care services (nursing, physiotherapy, labs, pharmacies) and providers, manage bookings and ratings.`;
  } else {
    const p = await getProvider(ctx.providerId);
    system += ` You help a HEALTHCARE PROVIDER (${p?.name}, ${p?.label}, field: ${p?.serviceType}) grow on the marketplace: requests, visibility, reviews, packages, ads, points.`;
  }
  const llm = await llmRewrite(system, history, local.reply);
  return llm ? { ...local, reply: llm, engine: "openai" } : { ...local, engine: "local" };
}

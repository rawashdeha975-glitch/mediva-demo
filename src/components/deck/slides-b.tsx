"use client";

import {
  Stethoscope, Accessibility, Pill as PillIcon, FlaskConical, ArrowLeft, Layers, UsersRound,
  Crosshair, Route, BrainCircuit, User, UserRound, Store, Telescope, ShieldCheck, Check, FileHeart,
} from "lucide-react";
import { Slide, Phone, L } from "./primitives";

/* ============================ 5. SERVICES ============================ */
export function S5() {
  const cards = [
    { img: "/img/nursing.jpg", icon: Stethoscope, t: "التمريض المنزلي", d: "رعاية منزلية، حقن وأدوية، جروح وضمادات، رعاية ما بعد العمليات والمتابعة." },
    { img: "/img/physio.jpg", icon: Accessibility, t: "العلاج الطبيعي", d: "إعادة تأهيل وتعافٍ، جلسات منزلية، وبرامج متعددة الجلسات." },
    { img: "/img/pharmacy.jpg", icon: PillIcon, t: "الصيدليات", d: "اكتشاف المنتجات الصحية، التواصل، والطلبات الرقمية (مستقبلاً)." },
    { img: "/img/lab.jpg", icon: FlaskConical, t: "المختبرات", d: "طلبات الفحوصات، جمع العينات المنزلية، النتائج والتواصل." },
  ];
  const future = ["Doctors", "Clinics", "Hospitals", "Insurance", "Healthcare Organizations"];
  return (
    <Slide n={5} section="منظومة الخدمات" kicker="منظومة الخدمات" title="منصة واحدة لعدة احتياجات صحية">
      <div className="grid grid-cols-4 gap-7">
        {cards.map((c) => (
          <div key={c.t} className="overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_18px_40px_rgba(10,26,51,0.07)]">
            <div className="relative h-[210px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={c.t} className="h-full w-full object-cover" />
              <span className="absolute right-5 -bottom-7 grid size-14 place-items-center rounded-2xl bg-navy-900 text-emerald-400 shadow-lg">
                <c.icon className="size-7" />
              </span>
            </div>
            <div className="p-7 pt-10">
              <h3 className="text-[30px] font-bold">{c.t}</h3>
              <p className="mt-3 text-[21px] leading-[1.6] text-navy-600">{c.d}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-9 flex items-center gap-6 rounded-[26px] border-2 border-dashed border-navy-200 bg-mist px-8 py-6">
        <div className="flex shrink-0 items-center gap-3">
          <Layers className="size-8 text-navy-400" />
          <div>
            <p className="text-[24px] font-bold">طبقة التوسع المستقبلي</p>
            <p className="ltr text-[17px] font-semibold text-navy-400">Future Expansion — Planned</p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3" style={{ direction: "ltr" }}>
          {future.map((f, i) => (
            <span key={f} className="flex items-center gap-3">
              <span className="rounded-full bg-white px-5 py-2.5 text-[19px] font-semibold text-navy-700 ring-1 ring-line">{f}</span>
              {i < future.length - 1 && <span className="text-[22px] text-navy-200">→</span>}
            </span>
          ))}
        </div>
      </div>
    </Slide>
  );
}

/* ============================ 6. DIFFERENTIATION ============================ */
export function S6() {
  const items = [
    { icon: Store, en: "Multi-Service Marketplace", ar: "عدة خدمات صحية داخل سوق واحد" },
    { icon: UsersRound, en: "Independent Provider Network", ar: "ربط المرضى بمقدمي خدمات مستقلين ومؤهلين" },
    { icon: Crosshair, en: "Intelligent Matching & Ranking", ar: "مطابقة وترتيب مقدمي الخدمات وفق عوامل متعددة" },
    { icon: Route, en: "Integrated Patient Journey", ar: "طلب ← حجز ← تواصل ← دفع ← تقييم" },
    { icon: BrainCircuit, en: "AI-Powered Ecosystem", ar: "طبقة ذكاء اصطناعي لتحسين السوق وتجربة الأطراف" },
  ];
  return (
    <Slide n={6} section="التميّز" kicker="لماذا MEDIVA مختلفة؟" title="ليست مجرد تطبيق لحجز موعد">
      <div className="grid grid-cols-5 gap-6">
        {items.map((it, i) => (
          <div key={it.en} className={`flex h-[300px] flex-col rounded-[28px] p-7 ${i === 4 ? "bg-navy-900 text-white" : "border border-line bg-white"}`}>
            <div className="flex items-center justify-between">
              <span className={`grid size-16 place-items-center rounded-2xl ${i === 4 ? "bg-emerald-500 text-navy-950" : "bg-emerald-50 text-emerald-600"}`}>
                <it.icon className="size-8" />
              </span>
              <span className={`ltr text-[40px] font-bold ${i === 4 ? "text-white/20" : "text-navy-200"}`}>0{i + 1}</span>
            </div>
            <p className="ltr mt-auto text-[24px] leading-[1.3] font-bold" style={{ textAlign: "right" }}>{it.en}</p>
            <p className={`mt-3 text-[20px] leading-[1.55] ${i === 4 ? "text-white/65" : "text-navy-600"}`}>{it.ar}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-5 rounded-[24px] bg-emerald-50 px-8 py-5 ring-1 ring-emerald-200">
        <FileHeart className="size-9 shrink-0 text-emerald-600" />
        <p className="text-[22px] leading-[1.55] text-navy-800">
          <strong>مُطبّق في الـ <L>Working Demo</L>: <L>Digital Care Record</L></strong> — كل خدمة تترك سجل رعاية موثقاً، بصلاحيات حسب الدور
          وموافقة المريض و<L>Audit Trail</L>، لتحقيق <L>Continuity of Care</L>.
        </p>
      </div>

      <div className="mt-8 rounded-[26px] bg-navy-900 px-10 py-7 text-[27px] leading-[1.6] font-semibold text-white">
        الابتكار في MEDIVA هو <span className="text-emerald-400">الجمع</span> بين <L>Marketplace</L> متعدد الخدمات، ومقدمي الخدمات المستقلين،
        والرحلة الرقمية المتكاملة، والذكاء الاصطناعي — ضمن منظومة واحدة.
      </div>
    </Slide>
  );
}

/* ============================ 7. AI ============================ */
export function S7() {
  const q = [
    { icon: User, en: "Patient AI", items: ["فهم الاحتياج", "اكتشاف الخدمة", "تحسين المطابقة", "تجربة شخصية"] },
    { icon: UserRound, en: "Provider AI", items: ["تنظيم الطلبات", "تحليل الأداء", "تحسين الظهور", "دعم اتخاذ القرار"] },
    { icon: BrainCircuit, en: "Marketplace AI", items: ["Intelligent Matching", "Ranking", "Demand Analysis", "Supply Analysis"] },
    { icon: Telescope, en: "Future AI", items: ["Demand Forecasting", "Provider Availability", "Predictive Operations", "Personalized Experiences"] },
  ];
  return (
    <Slide n={7} section="الذكاء الاصطناعي" kicker="الذكاء الاصطناعي" title="الذكاء الاصطناعي عبر منظومة MEDIVA">
      <div className="flex h-full gap-14">
        <div className="flex flex-1 flex-col">
          <div className="grid grid-cols-2 gap-6">
            {q.map((b, i) => (
              <div key={b.en} className={`rounded-[26px] p-7 ${i === 3 ? "border-2 border-dashed border-navy-200 bg-mist" : i === 2 ? "bg-navy-900 text-white" : "border border-line bg-white"}`}>
                <div className="flex items-center gap-4">
                  <span className={`grid size-14 place-items-center rounded-2xl ${i === 2 ? "bg-emerald-500 text-navy-950" : "bg-emerald-50 text-emerald-600"}`}>
                    <b.icon className="size-7" />
                  </span>
                  <p className="ltr text-[28px] font-bold">{b.en}</p>
                  {i === 3 && <span className="rounded-full bg-white px-3 py-1 text-[15px] font-semibold text-navy-400 ring-1 ring-line">مستقبلي</span>}
                </div>
                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
                  {b.items.map((x) => (
                    <li key={x} className={`flex items-center gap-2 text-[20px] ${i === 2 ? "text-white/80" : "text-navy-700"}`}>
                      <span className={`size-2 rounded-full ${i === 2 ? "bg-emerald-400" : "bg-emerald-500"}`} />
                      {/[a-z]/i.test(x) ? <L>{x}</L> : x}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-4 rounded-2xl bg-emerald-50 px-7 py-4 ring-1 ring-emerald-200">
            <ShieldCheck className="size-8 shrink-0 text-emerald-600" />
            <p className="text-[21px] text-navy-800">
              <L className="font-bold">AI supports healthcare professionals — it does not replace them.</L>
              <span className="mx-3 text-navy-200">|</span>
              في ملاحظات الرعاية: <L>Organize → Structure → Summarize</L> — لا يخترع، لا يشخّص، لا يصف علاجاً.
            </p>
          </div>
        </div>
        <Phone src="/app/provider/1/new" scale={0.8} caption="AI Care Note — في الـ Working Demo" />
      </div>
    </Slide>
  );
}

/* ============================ 8. VALUE + BUSINESS MODEL ============================ */
export function S8() {
  const Half = ({ icon: Icon, title, words, items, accent }: { icon: typeof User; title: string; words: string; items: string[]; accent: boolean }) => (
    <div className={`rounded-[28px] p-9 ${accent ? "bg-navy-900 text-white" : "border border-line bg-white"}`}>
      <div className="flex items-center gap-4">
        <span className={`grid size-16 place-items-center rounded-2xl ${accent ? "bg-emerald-500 text-navy-950" : "bg-navy-900 text-white"}`}><Icon className="size-8" /></span>
        <div>
          <h3 className="text-[34px] font-bold">{title}</h3>
          <p className={`text-[21px] font-semibold ${accent ? "text-emerald-400" : "text-emerald-600"}`}>{words}</p>
        </div>
      </div>
      <ul className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4">
        {items.map((x) => (
          <li key={x} className="flex items-center gap-3 text-[22px]">
            <span className={`grid size-7 place-items-center rounded-full ${accent ? "bg-white/10" : "bg-emerald-50"}`}>
              <Check className={`size-4 ${accent ? "text-emerald-400" : "text-emerald-600"}`} />
            </span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
  const revenue = ["Commission", "Subscriptions", "Featured Visibility", "Advertising", "Packages", "Future B2B"];
  return (
    <Slide n={8} section="القيمة ونموذج الأعمال" kicker="القيمة + نموذج الأعمال" title="قيمة لطرفي السوق">
      <div className="grid grid-cols-2 gap-8">
        <Half icon={User} title="للمريض" words="سهولة • وصول • خيارات • تنظيم • ثقة" items={["منصة واحدة", "عدة خدمات", "اكتشاف مقدمي الخدمة", "حجز وتواصل ودفع", "تقييمات وولاء"]} accent={false} />
        <Half icon={UserRound} title="لمقدم الخدمة" words="وصول • ظهور • فرص • نمو" items={["مرضى جدد", "حضور رقمي", "استقبال الطلبات", "إدارة الخدمات", "ظهور مميز"]} accent />
      </div>

      <div className="mt-7 flex items-center justify-center gap-6 text-[26px] font-bold" style={{ direction: "ltr" }}>
        <span className="rounded-full bg-mist px-7 py-3 ring-1 ring-line">Patient Demand</span>
        <span className="text-emerald-500">⟷</span>
        <span className="rounded-full bg-emerald-500 px-7 py-3 tracking-[0.12em] text-navy-950">MEDIVA</span>
        <span className="text-emerald-500">⟷</span>
        <span className="rounded-full bg-mist px-7 py-3 ring-1 ring-line">Provider Supply</span>
      </div>

      <div className="mt-7 flex items-center gap-6 rounded-[24px] border border-line px-8 py-5">
        <div className="shrink-0">
          <p className="text-[24px] font-bold">الإيرادات</p>
          <p className="text-[16px] text-navy-400">نموذج مخطط <L>(Planned)</L></p>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5" style={{ direction: "ltr" }}>
          {revenue.map((r, i) => (
            <span key={r} className="flex items-center gap-2.5">
              <span className="rounded-xl bg-mist px-4 py-2 text-[19px] font-semibold text-navy-800">{r}</span>
              {i < revenue.length - 1 && <span className="text-navy-200">+</span>}
            </span>
          ))}
        </div>
      </div>
    </Slide>
  );
}

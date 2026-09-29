"use client";

import {
  Check, Minus, X, MapPin, Heart, Languages, FlaskConical, Users, TrendingUp, Cpu, Smartphone, Sparkles,
  Rocket, GraduationCap, Code2, Stethoscope, Lightbulb, Flag, CircleDot, Cloud, ShieldCheck, Scale, UserPlus, Megaphone,
} from "lucide-react";
import { Slide, Logo, L } from "./primitives";

/* ============================ 9. COMPETITION ============================ */
type Mark = "yes" | "partial" | "no";
function Cell({ m, highlight = false }: { m: Mark; highlight?: boolean }) {
  if (m === "yes")
    return (
      <span className={`mx-auto grid size-11 place-items-center rounded-full ${highlight ? "bg-emerald-500 text-navy-950" : "bg-emerald-50 text-emerald-600"}`}>
        <Check className="size-6" strokeWidth={3} />
      </span>
    );
  if (m === "partial")
    return (
      <span className="mx-auto grid size-11 place-items-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200">
        <Minus className="size-6" strokeWidth={3} />
      </span>
    );
  return (
    <span className="mx-auto grid size-11 place-items-center rounded-full bg-mist text-navy-200">
      <X className="size-5" strokeWidth={3} />
    </span>
  );
}

export function S9() {
  const rows: [string, Mark, Mark][] = [
    ["Multi-Service", "no", "partial"],
    ["Independent Providers", "partial", "partial"],
    ["Intelligent Matching", "partial", "no"],
    ["Integrated Journey", "partial", "no"],
    ["AI Layer", "partial", "no"],
    ["Loyalty / Engagement", "partial", "no"],
    ["Regional Scalability", "partial", "partial"],
  ];
  return (
    <Slide n={9} section="المنافسة" kicker="المنافسة والتميّز" title="السوق موجود — وMEDIVA تبني نموذجاً مختلفاً">
      <div className="grid h-full grid-cols-[1fr_480px] gap-14">
        <div>
          <table className="w-full border-separate border-spacing-0 text-center">
            <thead>
              <tr className="text-[21px]">
                <th className="w-[330px] pb-4 text-right font-semibold text-navy-400">المعيار</th>
                <th className="pb-4 font-bold"><L>Single-Service Platforms</L><div className="text-[16px] font-medium text-navy-400">منصات الخدمة الواحدة</div></th>
                <th className="pb-4 font-bold"><L>Basic Booking Solutions</L><div className="text-[16px] font-medium text-navy-400">حلول الحجز الأساسية</div></th>
                <th className="rounded-t-[22px] bg-navy-900 pt-4 pb-4 text-white"><L className="tracking-[0.12em]">MEDIVA</L></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([c, a, b], i) => (
                <tr key={c}>
                  <td className="border-t border-line py-[13px] text-right text-[22px] font-semibold"><L>{c}</L></td>
                  <td className="border-t border-line py-[13px]"><Cell m={a} /></td>
                  <td className="border-t border-line py-[13px]"><Cell m={b} /></td>
                  <td className={`bg-navy-900 py-[13px] ${i === rows.length - 1 ? "rounded-b-[22px]" : ""}`}><Cell m="yes" highlight /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-5 flex items-center gap-8 text-[17px] text-navy-600">
            <span className="flex items-center gap-2"><Check className="size-5 text-emerald-600" /> ضمن التصميم</span>
            <span className="flex items-center gap-2"><Minus className="size-5 text-amber-600" /> جزئي / يختلف حسب المنصة</span>
            <span className="flex items-center gap-2"><X className="size-5 text-navy-200" /> ليس محور التركيز عادةً</span>
          </div>
          <p className="mt-2 text-[15px] leading-6 text-navy-400">
            مقارنة نوعية بين فئات حلول عامة وليست تقييماً لشركات بعينها. عمود MEDIVA يعكس التصميم المستهدف للمنتج (<L>Working Demo + Roadmap</L>).
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-[26px] bg-mist p-8 ring-1 ring-line">
            <p className="text-[24px] font-bold">وجود منافسين = دليل على الحاجة</p>
            <p className="mt-3 text-[21px] leading-[1.6] text-navy-600">الطلب على الرعاية الرقمية حقيقي، والحلول الحالية تركّز غالباً على خدمة واحدة أو على الحجز فقط.</p>
          </div>
          <div className="flex-1 rounded-[26px] bg-navy-900 p-8 text-white">
            <Sparkles className="size-9 text-emerald-400" />
            <p className="mt-5 text-[27px] leading-[1.55] font-semibold">
              MEDIVA لا تحاول اختراع حجز الرعاية الصحية من الصفر؛
              <span className="text-emerald-400"> بل تعيد تنظيمه داخل <L>Marketplace</L> صحي متعدد الخدمات.</span>
            </p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ============================ 10. WHY JORDAN / WHY NOW ============================ */
export function S10() {
  const jordan = [
    { icon: MapPin, t: "فهم السوق المحلي" },
    { icon: Heart, t: "احتياجات المرضى المحليين" },
    { icon: Users, t: "مقدمو خدمات محليون" },
    { icon: Languages, t: "تجربة عربية أولاً — Arabic-first" },
    { icon: FlaskConical, t: "اختبار النموذج في سوق نعرفه" },
  ];
  const now = [
    { icon: TrendingUp, t: "التحول الرقمي في الرعاية الصحية" },
    { icon: Smartphone, t: "توسع الخدمات الصحية الرقمية" },
    { icon: Cpu, t: "نمو استخدام الذكاء الاصطناعي" },
    { icon: Sparkles, t: "زيادة الاعتماد على الحلول الرقمية" },
    { icon: Rocket, t: "فرصة لبناء Marketplace صحي متكامل" },
  ];
  const List = ({ items }: { items: typeof jordan }) => (
    <ul className="mt-6 space-y-4">
      {items.map((x) => (
        <li key={x.t} className="flex items-center gap-4 text-[23px]">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><x.icon className="size-6" /></span>
          {x.t}
        </li>
      ))}
    </ul>
  );
  const route = [
    { c: "الأردن", s: "البداية — Pilot", on: true },
    { c: "الإمارات", s: "مخطط", on: false },
    { c: "السعودية", s: "مخطط", on: false },
    { c: "الخليج", s: "مخطط", on: false },
  ];
  return (
    <Slide n={10} section="السوق" kicker="لماذا الأردن؟ + لماذا الآن؟" title="الأردن أولاً — والتوسع إقليمياً">
      <div className="grid grid-cols-[1fr_1fr_430px] gap-8">
        <div className="rounded-[26px] border border-line p-8">
          <h3 className="text-[30px] font-bold">لماذا الأردن؟</h3>
          <List items={jordan} />
        </div>
        <div className="rounded-[26px] border border-line p-8">
          <h3 className="text-[30px] font-bold">لماذا الآن؟</h3>
          <List items={now} />
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex-1 rounded-[26px] bg-navy-900 p-7 text-white">
            <p className="ltr text-[64px] leading-none font-bold text-emerald-400">92.5%</p>
            <p className="mt-3 text-[21px] leading-[1.5]">نسبة انتشار الإنترنت في الأردن (بداية 2025)</p>
            <p className="mt-3 text-[14px] leading-5 text-white/45">المصدر: <L>DataReportal — Digital 2025</L>، كما نشرته جمعية <L>Int@j</L> / <L>Jordan Times</L></p>
          </div>
          <div className="flex-1 rounded-[26px] bg-mist p-7 ring-1 ring-line">
            <p className="ltr text-[64px] leading-none font-bold text-navy-900">+90%</p>
            <p className="mt-3 text-[21px] leading-[1.5]">من السكان تغطيهم شبكات <L>4G LTE</L></p>
            <p className="mt-3 text-[14px] leading-5 text-navy-400">المصدر: <L>Freedom House — Freedom on the Net 2024: Jordan</L></p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4 rounded-[26px] bg-mist px-10 py-6 ring-1 ring-line">
        <p className="shrink-0 text-[22px] font-bold text-navy-600">المسار:</p>
        {route.map((r, i) => (
          <div key={r.c} className="flex flex-1 items-center gap-4">
            <div className={`flex flex-1 items-center gap-3 rounded-2xl px-5 py-3 ${r.on ? "bg-emerald-500 text-navy-950" : "bg-white ring-1 ring-line"}`}>
              <MapPin className={`size-6 ${r.on ? "" : "text-navy-400"}`} />
              <div>
                <p className="text-[23px] font-bold">{r.c}</p>
                <p className={`text-[15px] ${r.on ? "text-navy-900/70" : "text-navy-400"}`}>{r.s}</p>
              </div>
            </div>
            {i < route.length - 1 && <span className="text-[26px] text-navy-200">←</span>}
          </div>
        ))}
      </div>
    </Slide>
  );
}

/* ============================ 11. STAGE + ROADMAP + FOUNDER ============================ */
export function S11() {
  const done = ["المنتج التجريبي يعمل", "User Journeys محددة", "Marketplace Model محدد", "Business Model محدد", "AI Roadmap محددة"];
  const road = ["Demo", "MVP", "Regulatory Validation", "Jordan Pilot", "Market Entry", "Regional Expansion"];
  return (
    <Slide n={11} section="المرحلة والفريق" kicker="الوضع الحالي + خارطة الطريق + الفريق" title="أين نحن اليوم، وإلى أين نتجه">
      <div className="grid grid-cols-[500px_1fr] gap-8">
        <div className="rounded-[28px] border border-line p-8">
          <div className="flex items-center gap-3">
            <CircleDot className="size-7 text-emerald-600" />
            <h3 className="text-[28px] font-bold">Current Stage</h3>
          </div>
          <p className="ltr mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-[22px] font-bold text-navy-950">Working Demo</p>
          <ul className="mt-5 space-y-3">
            {done.map((d) => (
              <li key={d} className="flex items-center gap-3 text-[21px]">
                <Check className="size-6 text-emerald-600" strokeWidth={3} />
                {d}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-mist p-4 text-[18px] leading-7 text-navy-600 ring-1 ring-line">
            <strong className="ltr text-navy-900">Pre-Launch / Pre-Seed</strong> — لم يتم الإطلاق التجاري بعد؛ التحقق من السوق يبدأ مع الـ <L>Pilot</L>.
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="rounded-[28px] bg-navy-900 p-8 text-white">
            <div className="flex items-center gap-3">
              <Flag className="size-7 text-emerald-400" />
              <h3 className="text-[28px] font-bold">Roadmap</h3>
            </div>
            <div className="mt-8 grid grid-cols-6">
              {road.map((r, i) => (
                <div key={r} className="relative flex flex-col items-center text-center">
                  {i < road.length - 1 && <span className={`absolute top-[18px] right-1/2 h-[3px] w-full ${i === 0 ? "bg-emerald-400/40" : "bg-white/15"}`} />}
                  <span className={`relative z-10 grid size-10 place-items-center rounded-full text-[17px] font-bold ${i === 0 ? "bg-emerald-400 text-navy-950 ring-8 ring-emerald-400/20" : "bg-navy-700 text-white/70"}`}>{i + 1}</span>
                  <span className="ltr mt-4 px-2 text-[19px] leading-[1.3] font-semibold">{r}</span>
                  {i === 0 && <span className="mt-1 text-[15px] font-bold text-emerald-400">نحن هنا</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-8 rounded-[28px] border border-line p-8">
            <span className="grid size-28 shrink-0 place-items-center rounded-[28px] bg-emerald-50 text-emerald-600">
              <GraduationCap className="size-14" />
            </span>
            <div className="flex-1">
              <p className="text-[18px] font-semibold text-navy-400">Founder</p>
              <p className="mt-1 text-[28px] font-bold">المؤسس — طالب تمريض أردني</p>
              <div className="mt-3 flex items-center gap-3 text-[20px] font-semibold" style={{ direction: "ltr", justifyContent: "flex-end" }}>
                <span className="flex items-center gap-2 rounded-full bg-mist px-4 py-1.5"><Stethoscope className="size-5 text-emerald-600" />Healthcare Understanding</span>+
                <span className="flex items-center gap-2 rounded-full bg-mist px-4 py-1.5"><Code2 className="size-5 text-emerald-600" />Technology</span>+
                <span className="flex items-center gap-2 rounded-full bg-mist px-4 py-1.5"><Lightbulb className="size-5 text-emerald-600" />Entrepreneurship</span>
              </div>
              <p className="mt-3 text-[19px] text-navy-600">تم تطوير MEDIVA والعمل عليها لعدة أشهر للوصول إلى <L>Working Demo</L>.</p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ============================ 12. INVESTMENT + VISION ============================ */
export function S12() {
  const funds = [
    { icon: Code2, t: "Product Development" },
    { icon: Cloud, t: "Cloud & APIs" },
    { icon: ShieldCheck, t: "Security & Testing" },
    { icon: Scale, t: "Legal / Regulatory Preparation" },
    { icon: UserPlus, t: "Provider Onboarding" },
    { icon: Megaphone, t: "Pilot Operations & Marketing" },
  ];
  const ms = ["Demo", "MVP", "Pilot", "Market Entry"];
  return (
    <Slide n={12} section="الاستثمار والرؤية" kicker="الاستثمار + الرؤية" title="ما نحتاجه" dark>
      <div className="grid h-full grid-cols-[1fr_640px] gap-14">
        <div>
          <div className="flex items-end gap-8">
            <p className="ltr text-[150px] leading-[0.9] font-bold text-emerald-400">20,000 <span className="text-[70px] text-white">JOD</span></p>
          </div>
          <p className="mt-6 text-[28px] leading-[1.5] text-white/80">
            الهدف: نقل MEDIVA من <L className="font-bold text-white">Working Demo</L> إلى <L className="font-bold text-white">MVP</L> ثم <L className="font-bold text-white">Jordan Pilot</L>
          </p>

          <p className="mt-9 text-[20px] font-semibold text-white/50">استخدام التمويل</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {funds.map((f) => (
              <div key={f.t} className="flex items-center gap-3 rounded-2xl bg-white/6 px-5 py-4 ring-1 ring-white/10">
                <f.icon className="size-6 shrink-0 text-emerald-400" />
                <span className="ltr text-[19px] font-semibold">{f.t}</span>
              </div>
            ))}
          </div>

          <div className="mt-9 flex items-center gap-4" style={{ direction: "ltr", justifyContent: "flex-end" }}>
            <span className="text-[18px] font-semibold text-white/50" style={{ direction: "rtl" }}>المراحل:</span>
            {ms.map((m, i) => (
              <span key={m} className="flex items-center gap-4">
                <span className={`rounded-full px-5 py-2 text-[21px] font-bold ${i === 0 ? "bg-white/10 text-white/60" : "bg-emerald-500 text-navy-950"}`}>{m}</span>
                {i < ms.length - 1 && <span className="text-[22px] text-white/30">→</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[32px] bg-white p-10 text-navy-900">
          <div>
            <p className="text-[20px] font-semibold text-emerald-600">الرؤية</p>
            <p className="mt-4 text-[38px] leading-[1.4] font-bold">
              من سوق صحي رقمي في الأردن
              <br />
              <span className="text-emerald-600">إلى منظومة رعاية صحية رقمية إقليمية</span>
            </p>
          </div>
          <div className="ltr space-y-2 text-left text-[30px] font-bold">
            <p>Connect Healthcare.</p>
            <p>Enable Access.</p>
            <p className="text-emerald-600">Build the Marketplace.</p>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-6">
            <p className="text-[24px] font-bold">الأردن أولاً — والمنطقة هي الأفق.</p>
            <Logo size={34} />
          </div>
        </div>
      </div>
    </Slide>
  );
}

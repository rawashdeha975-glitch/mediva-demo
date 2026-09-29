"use client";

import {
  Stethoscope, Accessibility, Pill as PillIcon, FlaskConical, MapPin, User, UserRound,
  Phone as PhoneIcon, MessageCircle, Share2, Users, Building2, X,
  ClipboardList, Crosshair, Sparkles, Inbox, CalendarCheck, CreditCard, CheckCircle2, Star, ArrowLeft, ArrowDown,
} from "lucide-react";
import { Slide, Logo, Phone, Pill, L } from "./primitives";

const SERVICES = [
  { icon: Stethoscope, t: "التمريض المنزلي" },
  { icon: Accessibility, t: "العلاج الطبيعي" },
  { icon: PillIcon, t: "الصيدليات" },
  { icon: FlaskConical, t: "المختبرات" },
];

/* ============================ 1. COVER ============================ */
export function S1() {
  return (
    <div className="relative flex h-[1080px] w-[1920px] overflow-hidden bg-navy-950 text-white">
      <div className="pointer-events-none absolute inset-0 dot-grid-dark" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative flex w-[1080px] flex-col justify-center pr-[110px]">
        <Logo dark size={52} />
        <h1 className="ltr mt-10 text-[150px] leading-none font-bold tracking-[0.06em]">MEDIVA</h1>
        <p className="mt-8 text-[52px] leading-[1.3] font-bold">
          منصة أردنية رقمية
          <br />
          <span className="text-emerald-400">لسوق الرعاية الصحية</span>
        </p>
        <p className="mt-6 max-w-[860px] text-[28px] leading-[1.6] text-white/65">
          ربط المرضى بمقدمي الرعاية الصحية المستقلين والمؤهلين عبر منصة رقمية واحدة
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          {SERVICES.map((s) => (
            <Pill key={s.t} tone="dark">
              <s.icon className="size-6 text-emerald-400" /> {s.t}
            </Pill>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-8">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-6 py-3 text-[22px] font-bold text-navy-950">
            <L>Working Demo</L> <span className="opacity-40">|</span> <L>Pre-Seed</L>
          </div>
          <div className="flex items-center gap-3 text-[21px] text-white/60">
            <span className="font-semibold text-white/80">التوسع المستقبلي:</span>
            {["الأردن", "الإمارات", "السعودية", "الخليج"].map((c, i) => (
              <span key={c} className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 ${i === 0 ? "font-bold text-emerald-400" : ""}`}>
                  {i === 0 && <MapPin className="size-5" />}
                  {c}
                </span>
                {i < 3 && <ArrowLeft className="size-5 text-white/30" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center gap-10 pl-[80px]">
        <Phone src="/app/patient" scale={0.92} className="translate-y-10" />
        <Phone src="/app/patient/record" scale={0.92} className="-translate-y-10" />
        <p className="absolute bottom-[56px] text-[17px] text-white/45">
          شاشات حيّة من الـ <L>Working Demo</L> — بيانات تجريبية
        </p>
      </div>
    </div>
  );
}

/* ============================ 2. PROBLEM ============================ */
function Pain({ items }: { items: string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-3 text-[24px] leading-[1.45] text-navy-800">
          <span className="mt-[9px] grid size-6 shrink-0 place-items-center rounded-full bg-red-50 ring-1 ring-red-200">
            <X className="size-3.5 text-red-500" />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

export function S2() {
  const channels = [
    { icon: PhoneIcon, t: "مكالمات هاتفية", x: 380, y: 70 },
    { icon: MessageCircle, t: "مجموعات المراسلة", x: 175, y: 190 },
    { icon: Share2, t: "وسائل التواصل", x: 585, y: 190 },
    { icon: Users, t: "توصيات شفهية", x: 250, y: 345 },
    { icon: Building2, t: "قناة مختلفة لكل خدمة", x: 510, y: 345 },
  ];
  return (
    <Slide n={2} section="المشكلة" kicker="المشكلة" title="الرعاية الصحية ما زالت مجزأة">
      <div className="grid h-[calc(100%-130px)] grid-cols-[440px_1fr_440px] gap-10">
        <div className="rounded-[28px] border border-line bg-white p-9">
          <div className="flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-navy-900 text-white"><User className="size-7" /></span>
            <h3 className="text-[30px] font-bold">للمريض</h3>
          </div>
          <div className="mt-7">
            <Pain items={["البحث يتم عبر قنوات مختلفة", "صعوبة مقارنة الخيارات", "صعوبة تنظيم الحجز والتواصل والمتابعة", "تجربة مختلفة لكل خدمة"]} />
          </div>
        </div>

        {/* Fragmented journey visual */}
        <div className="relative">
          <svg viewBox="0 0 760 470" className="absolute inset-0 h-full w-full">
            {channels.map((c, i) => (
              <g key={i}>
                <path d={`M 740 235 Q ${(740 + c.x) / 2} ${c.y + 20} ${c.x} ${c.y}`} fill="none" stroke="#c3cfdf" strokeWidth="2.5" strokeDasharray="7 9" />
                <path d={`M 20 235 Q ${(20 + c.x) / 2} ${c.y + 20} ${c.x} ${c.y}`} fill="none" stroke="#c3cfdf" strokeWidth="2.5" strokeDasharray="7 9" />
              </g>
            ))}
          </svg>
          <div className="absolute top-1/2 right-0 flex -translate-y-1/2 translate-x-1/2 flex-col items-center">
            <span className="grid size-20 place-items-center rounded-full bg-navy-900 text-white shadow-xl"><User className="size-9" /></span>
            <span className="mt-2 text-[18px] font-bold">المريض</span>
          </div>
          <div className="absolute top-1/2 left-0 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="grid size-20 place-items-center rounded-full bg-emerald-600 text-white shadow-xl"><UserRound className="size-9" /></span>
            <span className="mt-2 text-[18px] font-bold">مقدم الخدمة</span>
          </div>
          {channels.map((c) => (
            <div
              key={c.t}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5 text-[18px] font-semibold whitespace-nowrap text-navy-700 shadow-sm"
              style={{ left: `${(c.x / 760) * 100}%`, top: `${(c.y / 470) * 100}%` }}
            >
              <c.icon className="size-5 text-navy-400" />
              {c.t}
              <span className="grid size-5 place-items-center rounded-full bg-red-500 text-white"><X className="size-3" /></span>
            </div>
          ))}
          <p className="absolute bottom-0 w-full text-center text-[19px] font-semibold text-navy-400">
            <L>Fragmented Healthcare Journey</L> — لا توجد نقطة ربط واحدة
          </p>
        </div>

        <div className="rounded-[28px] border border-line bg-white p-9">
          <div className="flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-emerald-600 text-white"><UserRound className="size-7" /></span>
            <h3 className="text-[30px] font-bold">لمقدم الخدمة المستقل</h3>
          </div>
          <div className="mt-7">
            <Pain items={["صعوبة الوصول إلى مرضى جدد", "الاعتماد على العلاقات والقنوات التقليدية", "محدودية الظهور الرقمي", "لا يوجد Marketplace متخصص يجمع الطلب والعرض"]} />
          </div>
        </div>
      </div>
      <div className="absolute right-0 bottom-0 left-0 rounded-[24px] bg-navy-900 px-10 py-6 text-center text-[27px] leading-[1.5] font-semibold text-white">
        المريض يبحث عن مقدم الخدمة، ومقدم الخدمة يبحث عن المريض —{" "}
        <span className="text-emerald-400">بينما عملية الربط بينهما ما زالت مجزأة.</span>
      </div>
    </Slide>
  );
}

/* ============================ 3. SOLUTION ============================ */
export function S3() {
  const journey = [
    ["Discover", "اكتشاف"], ["Match", "مطابقة"], ["Book", "حجز"], ["Chat", "تواصل"],
    ["Pay", "دفع"], ["Complete", "إتمام"], ["Review", "تقييم"],
  ];
  return (
    <Slide
      n={3}
      section="الحل"
      kicker="الحل"
      title={<>MEDIVA — سوق رقمي واحد لعدة خدمات صحية</>}
      message={<>منصة <L>HealthTech</L> أردنية تعمل كـ <L>Marketplace</L> يربط طلب المرضى بعرض مقدمي الرعاية المستقلين.</>}
    >
      <div className="grid h-full grid-cols-[760px_1fr] gap-16">
        {/* Marketplace diagram */}
        <div className="flex flex-col items-center">
          <div className="flex w-full items-center gap-5 rounded-[26px] border border-line bg-mist px-8 py-5">
            <span className="grid size-14 place-items-center rounded-2xl bg-navy-900 text-white"><Users className="size-7" /></span>
            <div>
              <p className="ltr text-[26px] font-bold">Patient Demand</p>
              <p className="text-[19px] text-navy-600">المرضى وعائلاتهم — الطلب</p>
            </div>
          </div>
          <div className="flex h-12 flex-col items-center justify-center text-emerald-500"><span className="text-[30px] leading-none">↕</span></div>
          <div className="relative w-full rounded-[30px] bg-navy-900 px-8 py-7 text-center text-white shadow-[0_30px_60px_rgba(10,26,51,0.25)]">
            <div className="flex justify-center"><Logo dark size={46} /></div>
            <p className="mt-3 text-[22px] font-semibold text-emerald-400"><L>Digital Marketplace</L> — منصة ربط رقمية</p>
            <p className="mt-2 text-[18px] text-white/60">ليست منشأة طبية ولا تقدّم الخدمة بنفسها</p>
          </div>
          <div className="flex h-12 flex-col items-center justify-center text-emerald-500"><span className="text-[30px] leading-none">↕</span></div>
          <div className="w-full rounded-[26px] border border-line bg-mist px-8 py-5">
            <div className="flex items-center gap-5">
              <span className="grid size-14 place-items-center rounded-2xl bg-emerald-600 text-white"><UserRound className="size-7" /></span>
              <div>
                <p className="ltr text-[26px] font-bold">Independent Healthcare Providers</p>
                <p className="text-[19px] text-navy-600">مقدمو خدمات مستقلون ومؤهلون — العرض</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {SERVICES.map((s) => (
                <div key={s.t} className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[17px] font-semibold ring-1 ring-line">
                  <s.icon className="size-5 text-emerald-600" /> {s.t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Journey */}
        <div className="flex flex-col justify-center">
          <p className="text-[22px] font-semibold text-navy-400">رحلة واحدة متكاملة داخل المنصة</p>
          <div className="mt-8 grid grid-cols-7 gap-0">
            {journey.map(([en, ar], i) => (
              <div key={en} className="relative flex flex-col items-center">
                {i < journey.length - 1 && <span className="absolute top-[38px] right-1/2 h-[3px] w-full bg-emerald-200" />}
                <span className={`relative z-10 grid size-[76px] place-items-center rounded-full text-[24px] font-bold ${i === 0 || i === 6 ? "bg-emerald-500 text-white" : "bg-white text-navy-900 ring-2 ring-emerald-300"}`}>
                  {i + 1}
                </span>
                <span className="ltr mt-4 text-[20px] font-bold">{en}</span>
                <span className="text-[18px] text-navy-400">{ar}</span>
              </div>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 gap-5">
            <div className="rounded-[24px] bg-emerald-50 p-7 ring-1 ring-emerald-200">
              <p className="text-[22px] font-bold text-emerald-800">✓ MEDIVA هي</p>
              <p className="mt-2 text-[21px] leading-[1.6] text-navy-800">سوق رقمي يربط، يطابق، وينظّم الرحلة بين الطرفين</p>
            </div>
            <div className="rounded-[24px] bg-mist p-7 ring-1 ring-line">
              <p className="text-[22px] font-bold text-navy-600">✕ MEDIVA ليست</p>
              <p className="mt-2 text-[21px] leading-[1.6] text-navy-800">مستشفى أو عيادة أو جهة تقدّم الخدمة الطبية مباشرة</p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ============================ 4. HOW IT WORKS ============================ */
export function S4() {
  const steps = [
    { icon: ClipboardList, t: "طلب الخدمة" },
    { icon: MapPin, t: "تحديد الاحتياج والموقع" },
    { icon: Crosshair, t: "المطابقة الذكية" },
    { icon: Inbox, t: "استجابة مقدمي الخدمة" },
    { icon: CalendarCheck, t: "اختيار / حجز مقدم الخدمة" },
    { icon: CreditCard, t: "التواصل والدفع" },
    { icon: CheckCircle2, t: "إتمام الخدمة" },
    { icon: Star, t: "التقييم والولاء" },
  ];
  const Row = ({ from }: { from: number }) => (
    <div className="flex items-stretch">
      {steps.slice(from, from + 4).map((s, i) => (
        <div key={s.t} className="flex items-center">
          <div className={`flex h-[210px] w-[250px] flex-col justify-between rounded-[26px] p-6 ${from + i === 2 ? "bg-navy-900 text-white" : from + i === 6 ? "bg-emerald-600 text-white" : "border border-line bg-white"}`}>
            <div className="flex items-center justify-between">
              <s.icon className={`size-10 ${from + i === 2 || from + i === 6 ? "text-emerald-300" : "text-emerald-600"}`} />
              <span className={`ltr text-[44px] leading-none font-bold ${from + i === 2 || from + i === 6 ? "text-white/25" : "text-navy-200"}`}>{from + i + 1}</span>
            </div>
            <p className="text-[25px] leading-[1.35] font-bold">{s.t}</p>
          </div>
          {i < 3 && <ArrowLeft className="mx-2 size-8 text-emerald-500" />}
        </div>
      ))}
    </div>
  );
  return (
    <Slide n={4} section="كيف تعمل؟" kicker="كيف تعمل MEDIVA؟" title="رحلة المريض داخل المنصة" message="ثماني خطوات واضحة — من الطلب حتى التقييم، داخل تجربة واحدة.">
      <div className="flex h-full items-start gap-16">
        <div className="flex flex-col items-start">
          <Row from={0} />
          <div className="flex w-[250px] justify-center">
            <ArrowDown className="my-3 size-9 text-emerald-500" />
          </div>
          <Row from={4} />
          <div className="mt-8 flex items-center gap-4 rounded-2xl bg-mist px-6 py-4 text-[21px] text-navy-700 ring-1 ring-line">
            <Sparkles className="size-6 text-emerald-600" />
            بعد <strong>إتمام الخدمة</strong>: تُنشأ ملاحظة رعاية موثقة في <L className="font-bold">Digital Care Record</L> الخاص بالمريض
          </div>
        </div>
        <Phone src="/app/patient/record" scale={0.86} caption="Digital Care Record — من الـ Working Demo" />
      </div>
    </Slide>
  );
}


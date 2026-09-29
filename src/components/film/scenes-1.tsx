"use client";

import {
  User, UserRound, Phone as PhoneIcon, MessageCircle, Share2, Users, Building2, X, Stethoscope, Accessibility,
  Pill, FlaskConical, ClipboardList, MapPin, Crosshair, Inbox, CalendarCheck, CreditCard, CheckCircle2, Star, Sparkles, Check,
  type LucideIcon,
} from "lucide-react";
import { E, p, fx, lerp, clamp, typed } from "./engine";
import { Words, At, Kicker, LogoMark, Glass } from "./kit";

const SERVICES: { I: LucideIcon; t: string }[] = [
  { I: Stethoscope, t: "التمريض المنزلي" },
  { I: Accessibility, t: "العلاج الطبيعي" },
  { I: Pill, t: "الصيدليات" },
  { I: FlaskConical, t: "المختبرات" },
];

/* ============================== 1 · INTRO ============================== */
export function Intro({ t }: { t: number }) {
  const box = p(t, 0.15, 0.9, E.outBack);
  const draw = p(t, 0.55, 1.1, E.inOutCubic);
  const dot = p(t, 1.5, 0.45, E.outBack);
  const lift = p(t, 2.3, 1.1, E.inOutCubic);
  const spacing = p(t, 1.5, 1.6, E.outExpo);
  const flash = Math.max(0, 1 - Math.abs(t - 0.35) * 3);

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-emerald-300" style={{ opacity: flash * 0.08 }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: `translateY(${lerp(90, -40, lift)}px)` }}>
        <div className="relative">
          <div className="absolute inset-0 rounded-[40px] bg-emerald-400 blur-[60px]" style={{ opacity: 0.35 * box }} />
          <LogoMark size={200} box={box} draw={draw} dot={dot} />
        </div>
        <div className="ltr mt-12 flex text-[150px] leading-none font-bold text-white" style={{ letterSpacing: `${lerp(0.55, 0.08, spacing)}em` }}>
          {"MEDIVA".split("").map((c, i) => {
            const q = p(t, 1.4 + i * 0.07, 0.7);
            return (
              <span key={i} style={{ display: "inline-block", opacity: q, transform: `translateY(${lerp(70, 0, q)}px)` }}>
                {c}
              </span>
            );
          })}
        </div>
        <div className="mt-8 h-[3px] rounded-full bg-gradient-to-l from-transparent via-emerald-400 to-transparent" style={{ width: lerp(0, 900, p(t, 2.5, 1.2, E.outExpo)) }} />
        <p className="mt-8 text-[54px] font-bold text-white">
          <Words text="منصة أردنية رقمية لسوق الرعاية الصحية" t={t} start={2.8} />
        </p>
        <div className="mt-10 flex gap-4">
          {SERVICES.map((s, i) => (
            <div key={s.t} style={fx(t, 3.7 + i * 0.13, 0.6, { y: 24, s: 0.85 })} className="flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-7 py-3.5 text-[26px] font-semibold text-white">
              <s.I className="size-7 text-emerald-400" />
              {s.t}
            </div>
          ))}
        </div>
        <p className="ltr mt-10 text-[22px] font-semibold tracking-[0.35em] text-white/45" style={{ opacity: p(t, 4.5, 0.8) }}>
          HEALTHTECH MARKETPLACE · JORDAN
        </p>
      </div>
    </div>
  );
}

/* ============================== 2 · PROBLEM ============================== */
const PAT = { x: 1560, y: 610 };
const PRO = { x: 360, y: 610 };
const CH: { x: number; y: number; t: string; I: LucideIcon }[] = [
  { x: 960, y: 400, t: "مكالمات هاتفية", I: PhoneIcon },
  { x: 720, y: 540, t: "مجموعات المراسلة", I: MessageCircle },
  { x: 1200, y: 540, t: "وسائل التواصل", I: Share2 },
  { x: 820, y: 790, t: "توصيات شفهية", I: Users },
  { x: 1100, y: 790, t: "قناة لكل خدمة", I: Building2 },
];

function Node({ t, start, x, y, I, label, tone }: { t: number; start: number; x: number; y: number; I: LucideIcon; label: string; tone: "navy" | "emerald" }) {
  const ring = (t * 0.8) % 1;
  return (
    <At x={x} y={y}>
      <div style={fx(t, start, 0.7, { y: 0, s: 0.4, e: E.outBack })} className="flex flex-col items-center">
        <div className="relative">
          <span className="absolute inset-0 rounded-full border-2 border-emerald-400" style={{ transform: `scale(${1 + ring * 0.9})`, opacity: (1 - ring) * 0.5 }} />
          <span className={`relative grid size-[130px] place-items-center rounded-full ${tone === "navy" ? "bg-white text-[#0a1a33]" : "bg-emerald-500 text-white"} shadow-[0_20px_60px_rgba(0,0,0,0.5)]`}>
            <I className="size-16" />
          </span>
        </div>
        <span className="mt-5 text-[30px] font-bold text-white">{label}</span>
      </div>
    </At>
  );
}

export function Problem({ t }: { t: number }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-0 top-[80px] text-center">
        <Kicker t={t} start={0.1}>المشكلة</Kicker>
        <h2 className="mt-4 text-[96px] leading-tight font-bold text-white">
          <Words text="الرعاية الصحية ما زالت مجزأة" t={t} start={0.3} />
        </h2>
      </div>

      <svg className="absolute inset-0" width="1920" height="1080" viewBox="0 0 1920 1080">
        {CH.map((c, i) => {
          const a = p(t, 1.5 + i * 0.22, 0.9, E.inOutCubic);
          const b = p(t, 1.9 + i * 0.22, 0.9, E.inOutCubic);
          const broken = p(t, 4.5 + i * 0.16, 0.35);
          const col = broken > 0.5 ? "#f87171" : "#6ee7b7";
          const dash = broken > 0.5 ? "0.012 0.018" : "1";
          return (
            <g key={i} opacity={1 - broken * 0.5}>
              <path d={`M${PAT.x} ${PAT.y} Q ${(PAT.x + c.x) / 2} ${c.y} ${c.x} ${c.y}`} pathLength={1} strokeDasharray={dash} strokeDashoffset={broken > 0.5 ? 0 : 1 - a} stroke={col} strokeWidth="3" fill="none" />
              <path d={`M${c.x} ${c.y} Q ${(PRO.x + c.x) / 2} ${c.y} ${PRO.x} ${PRO.y}`} pathLength={1} strokeDasharray={dash} strokeDashoffset={broken > 0.5 ? 0 : 1 - b} stroke={col} strokeWidth="3" fill="none" />
            </g>
          );
        })}
      </svg>

      <Node t={t} start={0.9} x={PAT.x} y={PAT.y} I={User} label="المريض" tone="navy" />
      <Node t={t} start={1.1} x={PRO.x} y={PRO.y} I={UserRound} label="مقدم الخدمة" tone="emerald" />

      {CH.map((c, i) => {
        const br = p(t, 4.5 + i * 0.16, 0.4, E.outBack);
        const jit = br * Math.sin(t * 38 + i * 2) * 3;
        return (
          <At key={c.t} x={c.x + jit} y={c.y}>
            <div style={fx(t, 1.8 + i * 0.22, 0.6, { y: 20, s: 0.7 })} className="relative flex items-center gap-3 rounded-2xl border border-white/15 bg-[#0d1a30] px-6 py-4 text-[26px] font-semibold whitespace-nowrap text-white/85 shadow-xl">
              <c.I className="size-7 text-white/50" />
              {c.t}
              <span className="absolute -top-4 -left-4 grid size-11 place-items-center rounded-full bg-red-500 text-white shadow-lg" style={{ transform: `scale(${br})` }}>
                <X className="size-6" strokeWidth={3} />
              </span>
            </div>
          </At>
        );
      })}

      <div className="absolute inset-x-0 bottom-[70px] text-center">
        <p className="text-[40px] font-medium text-white/80">
          <Words text="المريض يبحث عن مقدم الخدمة… ومقدم الخدمة يبحث عن المريض" t={t} start={5.8} stagger={0.06} />
        </p>
        <p className="mt-3 text-[48px] font-bold text-emerald-400" style={fx(t, 7.0, 0.8, { y: 20, blur: 10 })}>
          بينما الربط بينهما ما زال مجزأً
        </p>
      </div>
    </div>
  );
}

/* ============================== 3 · SOLUTION ============================== */
const C = { x: 960, y: 590 };
const SVC_POS = [
  { x: 1480, y: 470 },
  { x: 1480, y: 720 },
  { x: 440, y: 470 },
  { x: 440, y: 720 },
];

export function Solution({ t }: { t: number }) {
  const conv = p(t, 0, 1.3, E.inOutCubic);
  const core = p(t, 1.1, 0.9, E.outBack);
  const lines = p(t, 3.0, 0.7, E.inOutCubic);

  return (
    <div className="absolute inset-0">
      {/* fragments converge */}
      {CH.map((c, i) => {
        const x = lerp(c.x, C.x, conv);
        const y = lerp(c.y, C.y, conv);
        return <span key={i} className="absolute size-5 rounded-full bg-emerald-400 shadow-[0_0_30px_#34d399]" style={{ left: x - 10, top: y - 10, opacity: 1 - p(t, 1.2, 0.3) }} />;
      })}

      <div className="absolute inset-x-0 top-[56px] text-center">
        <Kicker t={t} start={1.8}>الحل</Kicker>
        <h2 className="mt-3 text-[76px] font-bold text-white">
          <Words text="سوق رقمي واحد لعدة خدمات صحية" t={t} start={2.0} />
        </h2>
      </div>

      <svg className="absolute inset-0" width="1920" height="1080" viewBox="0 0 1920 1080">
        {[
          [C.x, 345, C.x, C.y - 160],
          [C.x, C.y + 160, C.x, 835],
        ].map(([x1, y1, x2, y2], i) => (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={lerp(y1, y2, lines)} stroke="rgba(110,231,183,0.35)" strokeWidth="3" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#34d399" strokeWidth="4" strokeDasharray="10 16" strokeDashoffset={(i === 0 ? -1 : 1) * t * 60} opacity={p(t, 3.6, 0.5)} />
          </g>
        ))}
        {SVC_POS.map((s, i) => {
          const d = p(t, 4.4 + i * 0.18, 0.6, E.inOutCubic);
          const ex = s.x > C.x ? C.x + 165 : C.x - 165;
          return <line key={i} x1={s.x + (s.x > C.x ? -165 : 165)} y1={s.y} x2={lerp(s.x + (s.x > C.x ? -165 : 165), ex, d)} y2={lerp(s.y, C.y, d)} stroke="rgba(110,231,183,0.35)" strokeWidth="2" strokeDasharray="6 8" />;
        })}
      </svg>

      {/* pulse rings + core */}
      <At x={C.x} y={C.y}>
        <div className="relative grid place-items-center" style={{ transform: `scale(${core})` }}>
          {[0, 1, 2].map((k) => {
            const q = (t * 0.45 + k / 3) % 1;
            return <span key={k} className="absolute rounded-full border-2 border-emerald-400" style={{ width: 320 + q * 420, height: 320 + q * 420, opacity: (1 - q) * 0.35 }} />;
          })}
          <div className="relative grid size-[320px] place-items-center rounded-full border-2 border-emerald-400/60 bg-[#0a1a33] shadow-[0_0_120px_rgba(16,185,129,0.35)]">
            <div className="flex flex-col items-center">
              <LogoMark size={96} />
              <span className="ltr mt-4 text-[44px] font-bold tracking-[0.14em] text-white">MEDIVA</span>
              <span className="text-[20px] font-semibold text-emerald-400">Marketplace</span>
            </div>
          </div>
        </div>
      </At>

      <At x={C.x} y={300}>
        <div style={fx(t, 2.7, 0.7, { y: -30 })} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.06] px-8 py-4">
          <Users className="size-9 text-white" />
          <span className="ltr text-[32px] font-bold text-white">Patient Demand</span>
          <span className="text-[26px] text-white/60">· طلب المرضى</span>
        </div>
      </At>
      <At x={C.x} y={880}>
        <div style={fx(t, 2.9, 0.7, { y: 30 })} className="flex items-center gap-4 rounded-2xl bg-emerald-500 px-8 py-4 text-[#04121f]">
          <UserRound className="size-9" />
          <span className="ltr text-[32px] font-bold">Independent Providers</span>
          <span className="text-[26px] font-semibold">· مقدمو رعاية مستقلون ومؤهلون</span>
        </div>
      </At>

      {SERVICES.map((s, i) => (
        <At key={s.t} x={SVC_POS[i].x} y={SVC_POS[i].y + Math.sin(t * 1.3 + i) * 8}>
          <div style={fx(t, 4.2 + i * 0.18, 0.7, { s: 0.5, y: 0, e: E.outBack })} className="flex w-[330px] items-center gap-4 rounded-2xl border border-white/12 bg-[#0d1a30]/90 px-6 py-5 whitespace-nowrap shadow-2xl">
            <span className="grid size-16 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400"><s.I className="size-9" /></span>
            <span className="text-[28px] font-bold text-white">{s.t}</span>
          </div>
        </At>
      ))}

      <div className="absolute inset-x-0 bottom-[42px] flex justify-center gap-6">
        <span style={fx(t, 6.3, 0.6)} className="flex items-center gap-3 rounded-full bg-emerald-500/15 px-7 py-3 text-[26px] font-semibold text-emerald-300 ring-1 ring-emerald-400/40">
          <Check className="size-7" /> يربط · يطابق · ينظّم الرحلة
        </span>
        <span style={fx(t, 6.6, 0.6)} className="flex items-center gap-3 rounded-full bg-white/[0.06] px-7 py-3 text-[26px] font-semibold text-white/70 ring-1 ring-white/15">
          <X className="size-7" /> ليست منشأة طبية
        </span>
      </div>
    </div>
  );
}

/* ============================== 4 · JOURNEY ============================== */
const STEPS: { I: LucideIcon; t: string }[] = [
  { I: ClipboardList, t: "طلب الخدمة" },
  { I: MapPin, t: "الاحتياج والموقع" },
  { I: Crosshair, t: "المطابقة الذكية" },
  { I: Inbox, t: "استجابة المزودين" },
  { I: CalendarCheck, t: "الحجز" },
  { I: CreditCard, t: "التواصل والدفع" },
  { I: CheckCircle2, t: "إتمام الخدمة" },
  { I: Star, t: "التقييم والولاء" },
];
const X0 = 1730;
const X1 = 190;
const TY = 560;

export function Journey({ t }: { t: number }) {
  const q = p(t, 1.0, 6.4, E.inOutCubic);
  const head = lerp(X0, X1, q);
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-0 top-[90px] text-center">
        <Kicker t={t} start={0.1}>كيف تعمل MEDIVA؟</Kicker>
        <h2 className="mt-3 text-[84px] font-bold text-white">
          <Words text="رحلة المريض في 8 خطوات" t={t} start={0.3} />
        </h2>
      </div>

      <div className="absolute h-[6px] rounded-full bg-white/10" style={{ left: X1, width: X0 - X1, top: TY - 3, opacity: p(t, 0.6, 0.5) }} />
      <div className="absolute h-[6px] rounded-full bg-gradient-to-l from-emerald-300 to-emerald-500" style={{ left: head, width: X0 - head, top: TY - 3 }} />
      {q > 0 && q < 1 && <span className="absolute size-8 rounded-full bg-emerald-300 shadow-[0_0_40px_12px_rgba(52,211,153,0.6)]" style={{ left: head - 16, top: TY - 16 }} />}

      {STEPS.map((s, i) => {
        const x = lerp(X0, X1, i / 7);
        const a = clamp((q - i / 7) * 14 + 1);
        const pop = 1 + 0.2 * Math.sin(Math.PI * clamp((q - i / 7) * 10));
        const on = a >= 1;
        return (
          <At key={s.t} x={x} y={TY}>
            <div style={fx(t, 0.5 + i * 0.06, 0.5, { y: 20 })} className="flex flex-col items-center">
              <span className={`ltr mb-5 text-[26px] font-bold ${on ? "text-emerald-300" : "text-white/30"}`}>{String(i + 1).padStart(2, "0")}</span>
              <span
                className={`grid size-[120px] place-items-center rounded-full border-4 transition-colors ${on ? "border-emerald-300 bg-emerald-500 text-white shadow-[0_0_50px_rgba(16,185,129,0.55)]" : "border-white/15 bg-[#0d1a30] text-white/40"}`}
                style={{ transform: `scale(${pop})` }}
              >
                <s.I className="size-14" />
              </span>
              <span className={`mt-6 w-[200px] text-center text-[27px] leading-tight font-bold ${on ? "text-white" : "text-white/35"}`}>{s.t}</span>
            </div>
          </At>
        );
      })}

      <div className="absolute inset-x-0 bottom-[80px] flex justify-center">
        <Glass className="flex items-center gap-4 px-9 py-5" style={fx(t, 7.8, 0.7, { y: 30 })}>
          <Sparkles className="size-8 text-emerald-400" />
          <span className="text-[30px] font-semibold text-white">بعد الإتمام ← ملاحظة رعاية موثّقة ← تقييم المريض ← نقاط لمقدم الخدمة</span>
        </Glass>
      </div>
    </div>
  );
}

/* ============================== 5 · AI ============================== */
const LAYERS = [4, 6, 4].map((n, li) =>
  Array.from({ length: n }, (_, k) => ({ x: 190 + li * 280, y: 320 + ((k + 0.5) * 520) / n }))
);
const EDGES: [number, number, number, number][] = [];
for (let l = 0; l < 2; l++) for (const a of LAYERS[l]) for (const b of LAYERS[l + 1]) EDGES.push([a.x, a.y, b.x, b.y]);

function Chat({ t, start, who, q, a }: { t: number; start: number; who: string; q: string; a: string }) {
  const u = typed(q, t, start + 0.4, 30);
  const r = typed(a, t, start + 0.5 + Array.from(q).length / 30 + 0.35, 34);
  const caret = Math.floor(t * 2.5) % 2 === 0;
  return (
    <Glass className="w-[800px] p-7" style={fx(t, start, 0.6, { x: 60, y: 0 })}>
      <p className="text-[22px] font-bold text-emerald-300">{who}</p>
      <div className="mt-4 flex justify-start">
        <span className="max-w-[86%] rounded-3xl rounded-tr-md bg-emerald-500 px-6 py-3.5 text-[27px] leading-snug font-semibold text-white">
          {u.s}
          {!u.done && u.started && caret && "|"}
        </span>
      </div>
      <div className="mt-3 flex justify-end" style={{ opacity: r.started ? 1 : 0 }}>
        <span className="flex max-w-[92%] items-start gap-3 rounded-3xl rounded-tl-md bg-white/10 px-6 py-3.5 text-[26px] leading-snug text-white">
          <Sparkles className="mt-1 size-6 shrink-0 text-emerald-400" />
          <span>
            {r.s}
            {!r.done && caret && "|"}
          </span>
        </span>
      </div>
    </Glass>
  );
}

export function AI({ t }: { t: number }) {
  const net = p(t, 0.3, 0.9);
  return (
    <div className="absolute inset-0">
      <svg className="absolute inset-0" width="1920" height="1080" viewBox="0 0 1920 1080" style={{ opacity: net }}>
        {EDGES.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(110,231,183,0.14)" strokeWidth="1.5" />
        ))}
        {Array.from({ length: 16 }, (_, s) => {
          const e = EDGES[(s * 11) % EDGES.length];
          const ph = (t * 0.8 + s * 0.137) % 1;
          return <circle key={s} cx={lerp(e[0], e[2], ph)} cy={lerp(e[1], e[3], ph)} r="5" fill="#6ee7b7" opacity={Math.sin(Math.PI * ph)} />;
        })}
        {LAYERS.flat().map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={14 + 3 * Math.sin(t * 2 + i)} fill="#0d1a30" stroke="#34d399" strokeWidth="3" />
        ))}
      </svg>
      <At x={470} y={900}>
        <div style={{ opacity: net }} className="flex items-center gap-3 text-[28px] font-bold text-white">
          <Sparkles className="size-8 text-emerald-400" />
          <span className="ltr">MEDIVA AI Layer</span>
        </div>
      </At>

      <div className="absolute top-[90px] right-[110px] text-right">
        <Kicker t={t} start={0.1}>الذكاء الاصطناعي</Kicker>
        <h2 className="mt-3 text-[76px] font-bold text-white">
          <Words text="مساعد ذكي لكل طرف" t={t} start={0.3} />
        </h2>
      </div>

      <div className="absolute top-[310px] right-[110px] space-y-6">
        <Chat t={t} start={0.9} who="👤 للمريض — اكتشاف الخدمة" q="بدي ممرض يغيّرلي الضماد بعد العملية" a="لقيتلك 3 ممرضين مناسبين حسب التقييم والخبرة والمنطقة — احجز بضغطة." />
        <Chat t={t} start={4.3} who="🩺 لمقدم الخدمة — حسب مجاله وبياناته" q="كيف أزيد طلباتي؟" a="خطة مخصصة: اقبل الطلبات بسرعة، فعّل الظهور المميز بنقاطك، وانشر إعلاناً." />
      </div>

      <div className="absolute bottom-[56px] right-[110px]" style={fx(t, 8.0, 0.6, { y: 20 })}>
        <p className="text-[26px] font-semibold text-white/60">
          <span className="ltr text-emerald-300">AI supports professionals — it does not replace them</span> · لا تشخيص ولا وصف علاج
        </p>
      </div>
    </div>
  );
}

"use client";

import { FileHeart, Lock, History, Star, MapPin, Megaphone, Crown, Gift, type LucideIcon } from "lucide-react";
import { E, p, fx, lerp, qbez } from "./engine";
import { Words, At, Kicker, LogoMark, Glass } from "./kit";

/* ============================== 6 · CARE RECORD ============================== */
const RECORDS = [
  { d: "12 سبتمبر", e: "🩺", s: "تمريض منزلي", c: "bg-emerald-50 text-emerald-700", ti: "متابعة ما بعد العملية", by: "محمد" },
  { d: "9 سبتمبر", e: "🩺", s: "تمريض منزلي", c: "bg-emerald-50 text-emerald-700", ti: "العناية بالجرح", by: "محمد" },
  { d: "5 سبتمبر", e: "🧑‍🦽", s: "علاج طبيعي", c: "bg-sky-50 text-sky-700", ti: "جلسة إعادة تأهيل", by: "أحمد" },
  { d: "2 سبتمبر", e: "🧪", s: "مختبر", c: "bg-violet-50 text-violet-700", ti: "جمع عينة منزلي", by: "رنا" },
];

const FEATURES: { I: LucideIcon; t: string }[] = [
  { I: FileHeart, t: "ملاحظة لكل خدمة — والـ AI ينظّم ولا يخترع" },
  { I: Lock, t: "صلاحيات حسب الدور + موافقة المريض" },
  { I: History, t: "Audit Trail — كل تعديل موثّق ولا شيء يُحذف بصمت" },
];

export function CareRecord({ t }: { t: number }) {
  const tilt = lerp(-9, -4, p(t, 0.2, 2, E.outCubic));
  return (
    <div className="absolute inset-0">
      <div className="absolute" style={{ left: 250, top: 120, ...fx(t, 0.15, 1, { y: 120, e: E.outQuint }) }}>
        <div className="relative" style={{ transform: `rotate(${tilt}deg)` }}>
          <div className="absolute -inset-10 rounded-[80px] bg-emerald-400/20 blur-[70px]" />
          <div className="relative h-[830px] w-[400px] overflow-hidden rounded-[58px] border-[12px] border-[#020814] bg-[#f3f5f8] shadow-[0_60px_140px_rgba(0,0,0,0.65)]">
            <div className="absolute top-2 left-1/2 z-10 h-7 w-32 -translate-x-1/2 rounded-full bg-[#020814]" />
            <div className="bg-[#0a1a33] px-6 pt-14 pb-6 text-white">
              <p className="text-[24px] font-bold">📋 سجل الرعاية</p>
              <p className="ltr text-right text-[14px] text-white/60">Digital Care Record · view only</p>
            </div>
            <div className="relative space-y-4 px-5 py-5">
              <span className="absolute top-8 right-[33px] bottom-8 w-px bg-slate-300" />
              {RECORDS.map((r, i) => (
                <div key={i} className="relative pr-10" style={fx(t, 1.0 + i * 0.42, 0.6, { y: -40, e: E.outBack })}>
                  <span className="absolute top-4 right-1.5 size-5 rounded-full border-4 border-white bg-emerald-500 shadow" />
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-slate-400">{r.d} 2026</span>
                      <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${r.c}`}>{r.e} {r.s}</span>
                    </div>
                    <p className="mt-1.5 text-[17px] font-bold text-[#0a1a33]">{r.ti}</p>
                    <p className="text-[13px] text-slate-500">مقدم الخدمة: {r.by}</p>
                    <p className="mt-1 text-[12px] font-semibold text-emerald-700">📋 ملاحظة رعاية متاحة</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -top-6 -left-24 flex items-center gap-3 rounded-2xl bg-amber-400 px-5 py-3 text-[22px] font-bold text-[#04121f] shadow-2xl" style={fx(t, 3.3, 0.6, { s: 0.5, y: 0, e: E.outBack })}>
            ⭐ قيّم الخدمة
          </div>
          <div className="absolute bottom-16 -left-28 flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-[22px] font-bold text-[#0a1a33] shadow-2xl" style={fx(t, 3.8, 0.6, { s: 0.5, y: 0, e: E.outBack })}>
            <Lock className="size-6 text-emerald-600" /> <span className="ltr">Access controlled</span>
          </div>
        </div>
      </div>

      <div className="absolute top-[200px] right-[120px] w-[900px] text-right">
        <Kicker t={t} start={0.4}>ميزة مطبّقة في الـ MVP</Kicker>
        <h2 className="ltr mt-4 text-right text-[100px] leading-none font-bold text-white" style={fx(t, 0.6, 0.8, { y: 30, blur: 12 })}>
          Digital Care Record
        </h2>
        <p className="mt-6 text-[40px] leading-snug text-white/75">
          <Words text="كل خدمة تترك سجلاً موثقاً — والرعاية تستمر مع أي مقدم خدمة" t={t} start={1.2} stagger={0.06} />
        </p>
        <div className="mt-12 space-y-5">
          {FEATURES.map((f, i) => (
            <div key={f.t} className="flex items-center gap-5" style={fx(t, 2.7 + i * 0.45, 0.6, { x: 60, y: 0 })}>
              <span className="grid size-[76px] shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30">
                <f.I className="size-10" />
              </span>
              <span className="text-[32px] font-semibold text-white">{f.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== 7 · GROWTH ENGINE ============================== */
const WHEEL_COLORS = ["#10b981", "#193459", "#0a1a33", "#059669", "#2a4a78", "#10b981", "#0a1a33", "#193459"];

function Tile({ t, start, title, I, children }: { t: number; start: number; title: string; I: LucideIcon; children: React.ReactNode }) {
  return (
    <Glass className="relative flex h-[540px] w-[390px] flex-col items-center overflow-hidden p-7" style={fx(t, start, 0.7, { y: 60, e: E.outQuint })}>
      <div className="flex w-full items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400"><I className="size-7" /></span>
        <span className="text-[28px] font-bold text-white">{title}</span>
      </div>
      <div className="relative flex w-full flex-1 flex-col items-center justify-center">{children}</div>
    </Glass>
  );
}

export function Growth({ t }: { t: number }) {
  const rating = lerp(0, 4.9, p(t, 1.0, 2.2, E.outCubic));
  const pts = Math.round(lerp(0, 1250, p(t, 1.1, 3.4, E.outCubic)));
  const rot = lerp(0, 1800 + 360 - 157.5, p(t, 1.1, 4.1, E.outQuint));
  const move = p(t, 2.6, 1.1, E.inOutCubic);
  const rows = [
    { n: "هبة", r: "4.8", base: 0 },
    { n: "نور", r: "4.5", base: 1 },
    { n: "محمد", r: "4.9", base: 2, feat: true },
  ];

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-0 top-[80px] text-center">
        <Kicker t={t} start={0.1}>محرك النمو</Kicker>
        <h2 className="mt-3 text-[74px] font-bold text-white">
          <Words text="مقدم الخدمة يكسب… وينمو داخل السوق" t={t} start={0.3} />
        </h2>
      </div>

      <div className="absolute inset-x-0 top-[300px] flex justify-center gap-10">
        <Tile t={t} start={0.5} title="تقييم بعد كل خدمة" I={Star}>
          <p className="ltr text-[120px] leading-none font-bold text-white">{rating.toFixed(1)}</p>
          <div className="mt-4 flex gap-2" style={{ direction: "ltr" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="text-[52px] leading-none text-amber-400" style={{ transform: `scale(${p(t, 1.0 + i * 0.18, 0.4, E.outBack)})`, display: "inline-block" }}>★</span>
            ))}
          </div>
          <div className="mt-8 w-full space-y-3">
            {[["الاحترافية", 0.98], ["الالتزام بالموعد", 0.92], ["التواصل", 0.96]].map(([k, v], i) => (
              <div key={String(k)}>
                <p className="text-[20px] text-white/60">{k}</p>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Number(v) * 100 * p(t, 2.2 + i * 0.15, 0.9)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Tile>

        <Tile t={t} start={0.65} title="عجلة الحظ" I={Gift}>
          <div className="relative">
            <div className="absolute -top-3 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-x-[16px] border-t-[26px] border-x-transparent border-t-amber-400" />
            <svg width="290" height="290" viewBox="0 0 300 300" style={{ transform: `rotate(${rot}deg)` }}>
              <circle cx="150" cy="150" r="148" fill="#fbbf24" />
              {WHEEL_COLORS.map((c, i) => {
                const a0 = ((i * 45 - 90) * Math.PI) / 180;
                const a1 = (((i + 1) * 45 - 90) * Math.PI) / 180;
                return <path key={i} d={`M150 150 L${150 + 140 * Math.cos(a0)} ${150 + 140 * Math.sin(a0)} A140 140 0 0 1 ${150 + 140 * Math.cos(a1)} ${150 + 140 * Math.sin(a1)} Z`} fill={c} stroke="#fff" strokeWidth="2" />;
              })}
              <circle cx="150" cy="150" r="30" fill="#fff" />
            </svg>
          </div>
          <div className="mt-8 rounded-full bg-amber-400 px-6 py-3 text-[24px] font-bold text-[#04121f]" style={fx(t, 5.3, 0.5, { s: 0.4, y: 0, e: E.outBack })}>
            🎁 ظهور مميز 3 أيام
          </div>
        </Tile>

        <Tile t={t} start={0.8} title="نقاط على المهام" I={Crown}>
          {/* dedicated lane above the counter: one reward chip rises at a time */}
          <div className="relative h-[90px] w-full">
            {(() => {
              const labels = ["+40 إتمام خدمة", "+20 توثيق ملاحظة", "+30 تقييم 5 نجوم"];
              const cyc = Math.max(0, (t - 1.2) * 0.8);
              const k = Math.floor(cyc) % 3;
              const ph = cyc % 1;
              return (
                <span
                  className="absolute left-1/2 rounded-full bg-emerald-500 px-5 py-2 text-[22px] font-bold whitespace-nowrap text-white shadow-[0_8px_30px_rgba(16,185,129,0.45)]"
                  style={{ top: lerp(60, 0, E.outCubic(ph)), transform: "translateX(-50%)", opacity: t > 1.2 ? Math.sin(Math.PI * ph) : 0 }}
                >
                  {labels[k]}
                </span>
              );
            })()}
          </div>
          <p className="ltr text-[110px] leading-none font-bold text-emerald-300">{pts.toLocaleString("en")}</p>
          <p className="mt-2 text-[26px] text-white/60">نقطة</p>
          <div className="mt-10 rounded-2xl bg-white/[0.07] px-5 py-3 text-[22px] font-semibold text-white ring-1 ring-white/10" style={fx(t, 4.6, 0.6)}>
            استبدال ← ⭐ ظهور مميز أو 📣 إعلان
          </div>
        </Tile>

        <Tile t={t} start={0.95} title="ظهور مميز + إعلانات" I={Megaphone}>
          <div className="relative h-[270px] w-full">
            {rows.map((r) => {
              const idx = r.feat ? lerp(2, 0, move) : r.base + move;
              return (
                <div key={r.n} className={`absolute inset-x-0 flex items-center gap-3 rounded-2xl px-4 py-3 ${r.feat ? "bg-white ring-4 ring-amber-400/80" : "bg-white/[0.07]"}`} style={{ top: idx * 88, boxShadow: r.feat ? `0 0 ${40 * move}px rgba(251,191,36,0.5)` : undefined }}>
                  <span className={`grid size-12 place-items-center rounded-xl text-[22px] font-bold ${r.feat ? "bg-[#0a1a33] text-white" : "bg-white/10 text-white"}`}>{r.n[0]}</span>
                  <span className={`flex-1 text-[24px] font-bold ${r.feat ? "text-[#0a1a33]" : "text-white"}`}>{r.n}</span>
                  {r.feat && <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[16px] font-bold text-[#04121f]" style={{ opacity: move }}>⭐ مميز</span>}
                  <span className={`ltr text-[20px] font-bold ${r.feat ? "text-amber-500" : "text-amber-300"}`}>★ {r.r}</span>
                </div>
              );
            })}
          </div>
          <div className="w-full rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-700 p-4" style={fx(t, 4.8, 0.7, { y: 60 })}>
            <span className="rounded bg-white/25 px-2 py-0.5 text-[14px] font-bold text-white">إعلان</span>
            <p className="mt-2 text-[22px] font-bold text-white">برنامج تأهيل منزلي</p>
          </div>
        </Tile>
      </div>

      <div className="absolute inset-x-0 bottom-[60px] flex items-center justify-center gap-4" style={fx(t, 6.3, 0.7, { y: 20 })}>
        <span className="text-[30px] font-bold text-white">باقات مصممة لكل مجال:</span>
        {["رعاية · تمريض", "حركة · علاج طبيعي", "عيّنة · مختبرات", "دواء · صيدليات"].map((c) => (
          <span key={c} className="rounded-full bg-white/[0.07] px-5 py-2.5 text-[24px] font-semibold text-emerald-300 ring-1 ring-white/10">{c}</span>
        ))}
      </div>
    </div>
  );
}

/* ============================== 8 · REGION ============================== */
const J: [number, number] = [560, 420];
const U: [number, number] = [1400, 610];
const S: [number, number] = [960, 700];
const C1: [number, number] = [980, 240];
const C2: [number, number] = [1230, 860];

function City({ t, start, x, y, name, sub, active = false }: { t: number; start: number; x: number; y: number; name: string; sub: string; active?: boolean }) {
  const ring = (t * 0.7) % 1;
  return (
    <At x={x} y={y}>
      <div className="relative flex flex-col items-center" style={fx(t, start, 0.6, { s: 0.3, y: 0, e: E.outBack })}>
        {active && <span className="absolute top-0 size-9 rounded-full border-2 border-emerald-300" style={{ transform: `scale(${1 + ring * 3})`, opacity: 1 - ring }} />}
        <span className={`relative grid size-9 place-items-center rounded-full ${active ? "bg-emerald-400 shadow-[0_0_40px_#34d399]" : "bg-white"}`}>
          <MapPin className="size-5 text-[#04121f]" />
        </span>
        <span className="mt-4 text-[38px] font-bold whitespace-nowrap text-white">{name}</span>
        <span className={`text-[22px] font-semibold whitespace-nowrap ${active ? "text-emerald-300" : "text-white/50"}`}>{sub}</span>
      </div>
    </At>
  );
}

export function Region({ t }: { t: number }) {
  const r1 = p(t, 1.4, 1.4, E.inOutCubic);
  const r2 = p(t, 2.9, 1.2, E.inOutCubic);
  const ring = p(t, 4.1, 1.4, E.inOutCubic);
  const traveler = t < 2.9 ? qbez(r1, J, C1, U) : qbez(r2, U, C2, S);

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(110,231,183,0.22) 2px, transparent 2px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse 55% 45% at 52% 58%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 55% 45% at 52% 58%, black 30%, transparent 75%)",
          opacity: p(t, 0.2, 1),
        }}
      />
      <div className="absolute inset-x-0 top-[80px] text-center">
        <Kicker t={t} start={0.1}>التوسع</Kicker>
        <h2 className="mt-3 text-[80px] font-bold text-white">
          <Words text="الأردن أولاً — والمنطقة هي الأفق" t={t} start={0.3} />
        </h2>
      </div>

      <svg className="absolute inset-0" width="1920" height="1080" viewBox="0 0 1920 1080">
        <ellipse cx="1000" cy="620" rx="640" ry="330" fill="none" stroke="rgba(110,231,183,0.5)" strokeWidth="3" strokeDasharray="1" pathLength={1} strokeDashoffset={1 - ring} />
        <path d={`M${J[0]} ${J[1]} Q ${C1[0]} ${C1[1]} ${U[0]} ${U[1]}`} fill="none" stroke="#34d399" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - r1} />
        <path d={`M${U[0]} ${U[1]} Q ${C2[0]} ${C2[1]} ${S[0]} ${S[1]}`} fill="none" stroke="#34d399" strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - r2} />
        {t > 1.4 && t < 4.1 && <circle cx={traveler[0]} cy={traveler[1]} r="12" fill="#a7f3d0" style={{ filter: "drop-shadow(0 0 14px #34d399)" }} />}
      </svg>

      <City t={t} start={0.8} x={J[0]} y={J[1]} name="الأردن" sub="البداية — Jordan Pilot" active />
      <City t={t} start={2.6} x={U[0]} y={U[1]} name="الإمارات" sub="مخطط" />
      <City t={t} start={3.9} x={S[0]} y={S[1]} name="السعودية" sub="مخطط" />
      <At x={1480} y={880}>
        <div style={fx(t, 5.0, 0.6, { y: 20 })} className="rounded-full bg-white/[0.07] px-6 py-3 text-[30px] font-bold text-white ring-1 ring-emerald-400/40">
          🌍 الخليج — <span className="text-emerald-300">مخطط</span>
        </div>
      </At>
    </div>
  );
}

/* ============================== 9 · OUTRO ============================== */
export function Outro({ t, d }: { t: number; d: number }) {
  const out1 = p(t, 3.0, 0.7, E.inCubic);
  const logo = p(t, 3.4, 1, E.outBack);
  const black = p(t, d - 0.9, 0.9, E.inCubic);
  const lines = ["Connect Healthcare.", "Enable Access.", "Build the Marketplace."];

  return (
    <div className="absolute inset-0">
      <div className="ltr absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: 1 - out1, transform: `translateY(${-80 * out1}px)` }}>
        {lines.map((l, i) => (
          <p key={l} className={`text-[120px] leading-[1.15] font-bold ${i === 2 ? "text-emerald-400" : "text-white"}`} style={fx(t, 0.3 + i * 0.6, 0.8, { y: 60, blur: 16 })}>
            {l}
          </p>
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: p(t, 3.4, 0.6) }}>
        <div className="flex items-center gap-8" style={{ transform: `scale(${logo})`, direction: "ltr" }}>
          <LogoMark size={150} />
          <span className="text-[140px] font-bold tracking-[0.1em] text-white">MEDIVA</span>
        </div>
        <p className="mt-8 text-[48px] font-bold text-white">
          <Words text="منصة أردنية رقمية لسوق الرعاية الصحية" t={t} start={4.0} />
        </p>
        <div className="mt-10 flex items-center gap-5" style={fx(t, 4.8, 0.7, { y: 20 })}>
          <span className="ltr rounded-full bg-emerald-500 px-7 py-3 text-[28px] font-bold text-[#04121f]">Working Demo · Pre-Seed</span>
          <span className="text-[30px] font-semibold text-white/80">
            نبحث عن <span className="ltr font-bold text-emerald-300">20,000 JOD</span> للانتقال إلى <span className="ltr">MVP</span> ثم <span className="ltr">Jordan Pilot</span>
          </span>
        </div>
        <p className="mt-12 text-[30px] font-semibold text-white/50" style={fx(t, 5.4, 0.7)}>
          الأردن أولاً — والمنطقة هي الأفق
        </p>
      </div>
      <div className="absolute inset-0 bg-black" style={{ opacity: black }} />
    </div>
  );
}

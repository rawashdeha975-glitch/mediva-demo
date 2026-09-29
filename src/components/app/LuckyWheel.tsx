"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { WHEEL, EXTRA_SPIN_COST } from "@/lib/catalog";
import { spinWheelAction } from "@/app/app/market-actions";

const SEG = 360 / WHEEL.length;
const R = 140;
const C = 150;
const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)];
};

export default function LuckyWheel({ providerId, freeAvailable, balance }: { providerId: number; freeAvailable: boolean; balance: number }) {
  const router = useRouter();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, start] = useTransition();
  const canPay = balance >= EXTRA_SPIN_COST;

  function spin() {
    if (spinning) return;
    setError("");
    setResult(null);
    setSpinning(true);
    start(async () => {
      const r = await spinWheelAction(providerId);
      if (!r.ok) {
        setError(r.error);
        setSpinning(false);
        return;
      }
      const center = r.index * SEG + SEG / 2;
      const base = Math.ceil(rotation / 360) * 360;
      setRotation(base + 360 * 6 - center);
      setTimeout(() => {
        setSpinning(false);
        setResult(r.label);
        router.refresh();
      }, 4300);
    });
  }

  return (
    <div className="relative rounded-3xl bg-navy-900 p-5 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold">🎡 عجلة الحظ</p>
          <p className="text-[11px] text-white/60">لفّة مجانية يومياً · اللفّة الإضافية {EXTRA_SPIN_COST} نقطة</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${freeAvailable ? "bg-emerald-400 text-navy-950" : "bg-white/10"}`}>
          {freeAvailable ? "مجانية متاحة" : "تم استخدام المجانية"}
        </span>
      </div>

      <div className="relative mx-auto mt-5 aspect-square w-full max-w-[280px]">
        <div className="absolute top-[-6px] left-1/2 z-10 -translate-x-1/2">
          <div className="h-0 w-0 border-x-[12px] border-t-[20px] border-x-transparent border-t-amber-400 drop-shadow" />
        </div>
        <svg
          viewBox="0 0 300 300"
          className="h-full w-full drop-shadow-[0_10px_30px_rgba(16,185,129,0.25)]"
          style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 1)" : "none" }}
        >
          <circle cx={C} cy={C} r={R + 8} fill="#fbbf24" />
          {WHEEL.map((w, i) => {
            const [x0, y0] = pt(i * SEG, R);
            const [x1, y1] = pt((i + 1) * SEG, R);
            const [tx, ty] = pt(i * SEG + SEG / 2, R * 0.66);
            return (
              <g key={w.key}>
                <path d={`M${C},${C} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`} fill={w.color} stroke="#fff" strokeWidth="2" />
                <text x={tx} y={ty} fill="#fff" fontSize="15" fontWeight="700" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i * SEG + SEG / 2} ${tx} ${ty})`}>
                  {w.short}
                </text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r="26" fill="#fff" />
          <text x={C} y={C} fontSize="11" fontWeight="800" textAnchor="middle" dominantBaseline="middle" fill="#0a1a33">MEDIVA</text>
        </svg>
      </div>

      <button
        onClick={spin}
        disabled={spinning || (!freeAvailable && !canPay)}
        className="mt-5 w-full rounded-full bg-amber-400 py-3 text-sm font-bold text-navy-950 disabled:opacity-40"
      >
        {spinning ? "العجلة تدور…" : freeAvailable ? "لفّ مجاناً 🎉" : `لفّة إضافية (${EXTRA_SPIN_COST} نقطة)`}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-300">{error}</p>}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-navy-950/90 p-6 text-center">
            <div className="text-6xl">{result === "حظاً أوفر" ? "🍀" : "🎁"}</div>
            <p className="mt-3 text-xl font-bold">{result === "حظاً أوفر" ? "حظاً أوفر المرة القادمة!" : `ربحت: ${result}`}</p>
            <p className="mt-1 text-[12px] text-white/60">{result.includes("ظهور") ? "تم تفعيل الظهور المميز لملفك تلقائياً" : result.includes("إعلان") ? "تم نشر إعلان لملفك داخل التطبيق" : result.includes("نقطة") ? "أُضيفت النقاط لرصيدك" : ""}</p>
            <button onClick={() => setResult(null)} className="mt-5 rounded-full bg-white px-5 py-2 text-xs font-bold text-navy-900">رائع</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

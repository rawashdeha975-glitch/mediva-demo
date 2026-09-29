"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, FileDown, Smartphone, Grid3x3, Clapperboard } from "lucide-react";
import { S1, S2, S3, S4 } from "./slides-a";
import { S5, S6, S7, S8 } from "./slides-b";
import { S9, S10, S11, S12 } from "./slides-c";

const SLIDES = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12];
const TITLES = [
  "الغلاف", "المشكلة", "الحل", "كيف تعمل", "الخدمات", "التميّز",
  "الذكاء الاصطناعي", "القيمة والإيرادات", "المنافسة", "الأردن والآن", "المرحلة والفريق", "الاستثمار والرؤية",
];

export default function Deck() {
  const [idx, setIdx] = useState(0);
  const [scale, setScale] = useState(0.5);
  const [printAll, setPrintAll] = useState(false);
  const [grid, setGrid] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((n: number) => {
    setIdx((cur) => {
      const next = Math.max(0, Math.min(SLIDES.length - 1, n));
      if (next !== cur && typeof window !== "undefined") history.replaceState(null, "", `#${next + 1}`);
      return next;
    });
  }, []);

  useEffect(() => {
    const fromHash = parseInt(window.location.hash.slice(1), 10);
    if (fromHash >= 1 && fromHash <= SLIDES.length) setIdx(fromHash - 1);
    const fit = () => setScale(Math.min(window.innerWidth / 1920, (window.innerHeight - 64) / 1080));
    fit();
    window.addEventListener("resize", fit);
    const after = () => setPrintAll(false);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      // RTL deck: Left arrow = next, Right arrow = previous
      if (["ArrowLeft", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); go(idx + 1); }
      if (["ArrowRight", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); go(idx - 1); }
      if (e.key === "Home") go(0);
      if (e.key === "End") go(SLIDES.length - 1);
      if (e.key.toLowerCase() === "f") document.documentElement.requestFullscreen?.();
      if (e.key.toLowerCase() === "g") setGrid((g) => !g);
      if (e.key === "Escape") setGrid(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, go]);

  const exportPdf = () => {
    setPrintAll(true);
    setTimeout(() => window.print(), 1200);
  };

  if (printAll) {
    return (
      <div>
        {SLIDES.map((S, i) => (
          <div key={i} className="print-slide mx-auto mb-6 origin-top" style={{ width: 1920, height: 1080 }}>
            <S />
          </div>
        ))}
      </div>
    );
  }

  const Current = SLIDES[idx];

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#dfe4ec]"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx > 0 ? idx + 1 : idx - 1); // swipe right = next in RTL
        touchX.current = null;
      }}
    >
      {/* stage */}
      <div className="absolute inset-x-0 top-0 bottom-16 flex items-center justify-center">
        <div style={{ width: 1920 * scale, height: 1080 * scale }} className="relative overflow-hidden shadow-[0_30px_80px_rgba(6,15,31,0.25)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute top-0 right-0 origin-top-right"
              style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}
            >
              <Current />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* controls */}
      <div className="print-hide absolute inset-x-0 bottom-0 flex h-16 items-center justify-between gap-4 border-t border-black/5 bg-white/90 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <button onClick={() => go(idx - 1)} disabled={idx === 0} className="grid size-10 place-items-center rounded-full bg-mist text-navy-900 disabled:opacity-30" aria-label="السابق">
            <ChevronRight className="size-5" />
          </button>
          <button onClick={() => go(idx + 1)} disabled={idx === SLIDES.length - 1} className="grid size-10 place-items-center rounded-full bg-navy-900 text-white disabled:opacity-30" aria-label="التالي">
            <ChevronLeft className="size-5" />
          </button>
          <span className="mr-2 hidden text-sm font-semibold text-navy-700 sm:inline">
            <span className="ltr tabular-nums">{idx + 1} / {SLIDES.length}</span> · {TITLES[idx]}
          </span>
        </div>

        <div className="hidden flex-1 items-center gap-1 md:flex">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => go(i)} title={TITLES[i]} className={`h-1.5 flex-1 rounded-full transition ${i <= idx ? "bg-emerald-500" : "bg-navy-200/60"}`} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setGrid(true)} className="grid size-10 place-items-center rounded-full bg-mist text-navy-800" title="كل الشرائح (G)">
            <Grid3x3 className="size-5" />
          </button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} className="grid size-10 place-items-center rounded-full bg-mist text-navy-800" title="ملء الشاشة (F)">
            <Maximize2 className="size-5" />
          </button>
          <button onClick={exportPdf} className="flex h-10 items-center gap-2 rounded-full bg-mist px-4 text-sm font-semibold text-navy-800" title="تصدير PDF">
            <FileDown className="size-4" /> <span className="hidden sm:inline">PDF</span>
          </button>
          <Link href="/film" className="flex h-10 items-center gap-2 rounded-full bg-navy-900 px-4 text-sm font-bold text-white">
            <Clapperboard className="size-4" /> <span className="hidden sm:inline ltr">Film</span>
          </Link>
          <Link href="/app" className="flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-bold text-white">
            <Smartphone className="size-4" /> <span className="hidden sm:inline ltr">Working Demo</span>
          </Link>
        </div>
      </div>

      {/* overview grid */}
      <AnimatePresence>
        {grid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 overflow-y-auto bg-navy-950/95 p-8" onClick={() => setGrid(false)}>
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {TITLES.map((t, i) => (
                <button key={i} onClick={() => { go(i); setGrid(false); }} className={`rounded-2xl p-5 text-right ring-2 transition ${i === idx ? "bg-emerald-500 text-navy-950 ring-emerald-300" : "bg-white/5 text-white ring-white/10 hover:bg-white/10"}`}>
                  <span className="ltr text-3xl font-bold opacity-60">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-2 block text-lg font-bold">{t}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import type { CSSProperties, ReactNode } from "react";
import { E, p, lerp, rng, clamp } from "./engine";

/** Kinetic typography: word-by-word rise + de-blur */
export function Words({
  text,
  t,
  start,
  stagger = 0.08,
  dur = 0.7,
  className = "",
  style,
}: {
  text: string;
  t: number;
  start: number;
  stagger?: number;
  dur?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <span className={className} style={style}>
      {words.map((w, i) => {
        const q = p(t, start + i * stagger, dur, E.outCubic);
        return (
          <span key={i}>
            <span
              style={{
                display: "inline-block",
                opacity: q,
                transform: `translateY(${lerp(0.55, 0, q)}em)`,
                filter: q < 1 ? `blur(${lerp(12, 0, q)}px)` : undefined,
              }}
            >
              {w}
            </span>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}

/** Absolutely positioned, centered on (x, y) of the 1920×1080 stage */
export function At({ x, y, children, className = "", style }: { x: number; y: number; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`absolute ${className}`} style={{ left: x, top: y, transform: "translate(-50%, -50%)", ...style }}>
      {children}
    </div>
  );
}

export function Kicker({ t, start, children }: { t: number; start: number; children: ReactNode }) {
  const q = p(t, start, 0.6);
  return (
    <div className="inline-flex items-center gap-3 text-[28px] font-semibold text-emerald-400" style={{ opacity: q }}>
      <span className="h-[3px] rounded-full bg-emerald-400" style={{ width: lerp(0, 56, q) }} />
      {children}
    </div>
  );
}

export function LogoMark({ size = 120, draw = 1, box = 1, dot = 1 }: { size?: number; draw?: number; box?: number; dot?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ transform: `scale(${box}) rotate(${lerp(-90, 0, clamp(box))}deg)` }}>
      <rect width="40" height="40" rx="11" fill="#ffffff" />
      <path
        d="M11 27V13l9 9 9-9v14"
        stroke="#10b981"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - draw}
      />
      <circle cx="20" cy="29.5" r={2.2 * dot} fill="#0a1a33" />
    </svg>
  );
}

const DOTS = (() => {
  const r = rng(11);
  return Array.from({ length: 54 }, () => ({ x: r() * 1920, y: r() * 1080, s: 1 + r() * 2.6, sp: 6 + r() * 22, ph: r() * 6.28 }));
})();

/** Persistent cinematic backdrop: drifting light orbs, moving grid, particles, vignette */
export function Backdrop({ t }: { t: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050d1c]">
      <div
        className="absolute rounded-full"
        style={{
          width: 1300,
          height: 1300,
          left: 1050 + Math.sin(t * 0.13) * 160,
          top: -520 + Math.cos(t * 0.11) * 110,
          background: "radial-gradient(circle, rgba(16,185,129,0.17), transparent 62%)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 1400,
          height: 1400,
          left: -620 + Math.cos(t * 0.09) * 140,
          top: 280 + Math.sin(t * 0.1) * 120,
          background: "radial-gradient(circle, rgba(42,74,120,0.42), transparent 62%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          backgroundPosition: `${(t * 6) % 96}px ${(t * 10) % 96}px`,
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
      {DOTS.map((d, i) => {
        const y = (((d.y - t * d.sp) % 1080) + 1080) % 1080;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-emerald-300"
            style={{ left: d.x + Math.sin(t * 0.4 + d.ph) * 14, top: y, width: d.s, height: d.s, opacity: 0.12 + 0.22 * (0.5 + 0.5 * Math.sin(t * 1.3 + d.ph)) }}
          />
        );
      })}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(2,6,14,0.75) 100%)" }} />
    </div>
  );
}

export function Glass({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-white/[0.05] backdrop-blur-md ${className}`} style={style}>
      {children}
    </div>
  );
}

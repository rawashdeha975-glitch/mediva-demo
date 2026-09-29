"use client";

import type { ReactNode } from "react";

export function Logo({ dark = false, size = 40 }: { dark?: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect width="40" height="40" rx="11" fill={dark ? "#ffffff" : "#0a1a33"} />
        <path d="M11 27V13l9 9 9-9v14" stroke="#10b981" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="29.5" r="2.2" fill={dark ? "#0a1a33" : "#ffffff"} />
      </svg>
      <span
        className={`ltr font-bold tracking-[0.14em] ${dark ? "text-white" : "text-navy-900"}`}
        style={{ fontSize: size * 0.55 }}
      >
        MEDIVA
      </span>
    </div>
  );
}

/** Latin token that stays correctly ordered inside Arabic RTL text */
export function L({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`ltr ${className}`}>{children}</span>;
}

export function Slide({
  n,
  section,
  kicker,
  title,
  message,
  children,
  dark = false,
}: {
  n: number;
  section: string;
  kicker?: ReactNode;
  title: ReactNode;
  message?: ReactNode;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`relative flex h-[1080px] w-[1920px] flex-col overflow-hidden px-[110px] pt-[64px] pb-[56px] ${
        dark ? "bg-navy-950 text-white" : "bg-white text-navy-900"
      }`}
    >
      <div className={`pointer-events-none absolute inset-0 ${dark ? "dot-grid-dark" : "dot-grid"} opacity-60`} />
      <header className="relative flex items-center justify-between">
        <Logo dark={dark} size={36} />
        <div className={`flex items-center gap-4 text-[18px] font-medium ${dark ? "text-white/50" : "text-navy-400"}`}>
          <span>{section}</span>
          <span className={`h-5 w-px ${dark ? "bg-white/20" : "bg-line"}`} />
          <span className="ltr tabular-nums">{String(n).padStart(2, "0")} / 12</span>
        </div>
      </header>

      <div className="relative mt-[44px]">
        {kicker && <p className="text-[22px] font-semibold text-emerald-500">{kicker}</p>}
        <h2 className={`mt-2 text-[68px] leading-[1.15] font-bold tracking-tight ${dark ? "text-white" : "text-navy-900"}`}>
          {title}
        </h2>
        {message && (
          <p className={`mt-4 max-w-[1300px] text-[28px] leading-[1.6] ${dark ? "text-white/65" : "text-navy-600"}`}>{message}</p>
        )}
      </div>

      <div className="relative mt-[40px] flex-1">{children}</div>
    </div>
  );
}

/** Professional smartphone mockup rendering the LIVE Working Demo screen */
export function Phone({
  src,
  caption,
  scale = 1,
  className = "",
}: {
  src: string;
  caption?: string;
  scale?: number;
  className?: string;
}) {
  const W = 380 * scale;
  const H = 790 * scale;
  const border = 12 * scale;
  const innerW = W - border * 2;
  const innerH = H - border * 2;
  const nativeW = 390;
  const s = innerW / nativeW;
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="relative bg-navy-950 shadow-[0_40px_80px_rgba(6,15,31,0.35)]"
        style={{ width: W, height: H, borderRadius: 54 * scale, padding: border }}
      >
        <div className="relative h-full w-full overflow-hidden bg-white" style={{ borderRadius: 42 * scale }}>
          <iframe
            src={src}
            title={caption ?? "MEDIVA Working Demo"}
            loading="lazy"
            className="absolute top-0 left-0 border-0"
            style={{ width: nativeW, height: innerH / s, transform: `scale(${s})`, transformOrigin: "top left" }}
          />
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-navy-950"
          style={{ top: border + 8 * scale, width: 104 * scale, height: 26 * scale }}
        />
      </div>
      {caption && <p className="mt-5 text-center text-[17px] font-medium text-navy-400">{caption}</p>}
    </div>
  );
}

export function Pill({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" | "emerald" }) {
  const cls =
    tone === "dark"
      ? "bg-white/8 text-white ring-white/15"
      : tone === "emerald"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-mist text-navy-800 ring-line";
  return <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[20px] font-semibold ring-1 ${cls}`}>{children}</span>;
}

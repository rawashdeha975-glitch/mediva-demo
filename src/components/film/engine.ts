import type { CSSProperties } from "react";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, q: number) => a + (b - a) * q;

export const E = {
  linear: (x: number) => x,
  inCubic: (x: number) => x * x * x,
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  outQuint: (x: number) => 1 - Math.pow(1 - x, 5),
  inOutCubic: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outExpo: (x: number) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  outBack: (x: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
};

/** eased progress of an animation that starts at `start` and lasts `dur` seconds */
export function p(t: number, start: number, dur: number, e: (x: number) => number = E.outCubic) {
  return e(clamp((t - start) / dur));
}

/** entrance style: fade + translate + scale (+ optional blur) */
export function fx(
  t: number,
  start: number,
  dur = 0.7,
  o: { x?: number; y?: number; s?: number; blur?: number; e?: (x: number) => number } = {}
): CSSProperties {
  const q = p(t, start, dur, o.e ?? E.outCubic);
  const x = o.x ?? 0;
  const y = o.y ?? 30;
  const s = o.s ?? 1;
  return {
    opacity: clamp(q),
    transform: `translate(${lerp(x, 0, q)}px, ${lerp(y, 0, q)}px) scale(${lerp(s, 1, q)})`,
    filter: o.blur && q < 1 ? `blur(${lerp(o.blur, 0, q)}px)` : undefined,
  };
}

/** deterministic PRNG so SSR and client render identical particles */
export function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** point on a quadratic bezier */
export function qbez(u: number, a: [number, number], c: [number, number], b: [number, number]): [number, number] {
  const v = 1 - u;
  return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]];
}

export function typed(text: string, t: number, start: number, cps = 30) {
  const chars = Array.from(text);
  const n = clamp(Math.floor((t - start) * cps), 0, chars.length);
  return { s: chars.slice(0, n).join(""), started: t >= start, done: n >= chars.length };
}

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

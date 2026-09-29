"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Repeat, Maximize2, EyeOff, Circle, Square, Presentation } from "lucide-react";
import { E, p, lerp, clamp, fmtTime } from "./engine";
import { Backdrop, LogoMark } from "./kit";
import { Soundtrack, type SoundPlan } from "./sound";
import { Intro, Problem, Solution, Journey, AI } from "./scenes-1";
import { CareRecord, Growth, Region, Outro } from "./scenes-2";

type SceneComp = (props: { t: number; d: number }) => React.ReactElement;
const RAW: { id: string; title: string; dur: number; C: SceneComp }[] = [
  { id: "intro", title: "المقدمة", dur: 6, C: Intro },
  { id: "problem", title: "المشكلة", dur: 9, C: Problem },
  { id: "solution", title: "الحل", dur: 10, C: Solution },
  { id: "journey", title: "الرحلة", dur: 10, C: Journey },
  { id: "ai", title: "الذكاء الاصطناعي", dur: 10, C: AI },
  { id: "care", title: "سجل الرعاية", dur: 8, C: CareRecord },
  { id: "growth", title: "محرك النمو", dur: 9, C: Growth },
  { id: "region", title: "التوسع", dur: 7, C: Region },
  { id: "outro", title: "الختام", dur: 8, C: Outro },
];
let acc = 0;
const SCENES = RAW.map((s) => {
  const r = { ...s, start: acc };
  acc += s.dur;
  return r;
});
const TOTAL = acc;
const PLAN: SoundPlan = {
  total: TOTAL,
  cuts: SCENES.slice(1).map((s) => s.start),
  impacts: [0.3, SCENES[SCENES.length - 1].start + 3.4],
  heartFrom: SCENES[1].start + 0.5,
  heartTo: SCENES[2].start,
  beatFrom: SCENES[2].start,
  beatTo: SCENES[SCENES.length - 1].start + 3,
};

export default function Film() {
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const [loop, setLoop] = useState(false);
  const loopRef = useRef(false);
  const [scale, setScale] = useState(0.5);
  const [clean, setClean] = useState(false);
  const [idle, setIdle] = useState(false);
  const [started, setStarted] = useState(false);
  const [rec, setRec] = useState(false);
  const [msg, setMsg] = useState("");
  const sound = useRef<Soundtrack | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { mutedRef.current = muted; sound.current?.setMuted(muted); }, [muted]);
  useEffect(() => { loopRef.current = loop; }, [loop]);

  const snd = () => (sound.current ??= new Soundtrack());

  const play = useCallback((from?: number) => {
    let f = from ?? tRef.current;
    if (f >= TOTAL - 0.05) f = 0;
    tRef.current = f;
    setT(f);
    setStarted(true);
    setPlaying(true);
    const s = snd();
    s.setMuted(mutedRef.current);
    s.start(f, PLAN);
  }, []);

  const pause = useCallback(() => {
    setPlaying(false);
    sound.current?.stop();
  }, []);

  const seek = useCallback((v: number) => {
    const nv = clamp(v, 0, TOTAL);
    tRef.current = nv;
    setT(nv);
    if (playingRef.current) sound.current?.start(nv, PLAN);
  }, []);

  const stopRecording = useCallback(() => {
    if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
  }, []);

  // master clock
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last === null) last = now;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      let nt = tRef.current + dt;
      if (nt >= TOTAL) {
        if (loopRef.current && !recorder.current) {
          nt = 0;
          sound.current?.start(0, PLAN);
        } else {
          tRef.current = TOTAL;
          setT(TOTAL);
          setPlaying(false);
          sound.current?.stop();
          setTimeout(stopRecording, 500);
          return;
        }
      }
      tRef.current = nt;
      setT(nt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, stopRecording]);

  // fit 16:9 stage
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // auto-hide controls
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), 2400);
    };
    window.addEventListener("mousemove", wake);
    window.addEventListener("touchstart", wake);
    wake();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, []);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === " " || k === "k") {
        e.preventDefault();
        if (playingRef.current) pause();
        else play();
      }
      if (k === "arrowright") seek(tRef.current + 5);
      if (k === "arrowleft") seek(tRef.current - 5);
      if (k === "0" || k === "home") seek(0);
      if (k === "m") setMuted((m) => !m);
      if (k === "l") setLoop((l) => !l);
      if (k === "h") setClean((c) => !c);
      if (k === "f") document.documentElement.requestFullscreen?.();
      if (k === "escape") {
        setClean(false);
        stopRecording();
      }
      const n = parseInt(k, 10);
      if (n >= 1 && n <= 9 && SCENES[n - 1]) seek(SCENES[n - 1].start);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play, pause, seek, stopRecording]);

  async function exportVideo() {
    setMsg("");
    try {
      const md = navigator.mediaDevices as MediaDevices & { getDisplayMedia?: (o: unknown) => Promise<MediaStream> };
      if (!md?.getDisplayMedia || typeof MediaRecorder === "undefined") throw new Error("unsupported");
      const stream = await md.getDisplayMedia({ video: { frameRate: 60 }, audio: false, preferCurrentTab: true, selfBrowserSurface: "include" });
      const [vt] = stream.getVideoTracks();
      const CT = (window as unknown as { CropTarget?: { fromElement: (el: Element) => Promise<unknown> } }).CropTarget;
      if (CT && stageRef.current && "cropTo" in vt) {
        try {
          await (vt as MediaStreamTrack & { cropTo: (c: unknown) => Promise<void> }).cropTo(await CT.fromElement(stageRef.current));
        } catch {}
      }
      const s = snd();
      setMuted(false);
      s.setMuted(false);
      const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
      const mr = new MediaRecorder(new MediaStream([vt, ...s.out.stream.getAudioTracks()]), mime ? { mimeType: mime, videoBitsPerSecond: 14_000_000 } : undefined);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((x) => x.stop());
        const blob = new Blob(chunks, { type: mime || "video/webm" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `MEDIVA-Motion-Film.${mime.includes("mp4") ? "mp4" : "webm"}`;
        a.click();
        recorder.current = null;
        setRec(false);
        setClean(false);
        pause();
        setMsg("✓ تم تصدير الفيديو");
      };
      vt.addEventListener("ended", () => mr.state !== "inactive" && mr.stop());
      recorder.current = mr;
      setRec(true);
      setClean(true);
      pause();
      seek(0);
      await new Promise((r) => setTimeout(r, 700));
      mr.start(250);
      play(0);
    } catch (e) {
      setRec(false);
      setClean(false);
      setMsg(e instanceof Error && e.message === "unsupported" ? "التصدير يتطلب Chrome أو Edge على الكمبيوتر" : "تم إلغاء التسجيل");
    }
  }

  const scrub = (clientX: number) => {
    const r = barRef.current?.getBoundingClientRect();
    if (!r) return;
    seek(((clientX - r.left) / r.width) * TOTAL);
  };

  const current = [...SCENES].reverse().find((s) => t >= s.start) ?? SCENES[0];
  const showUI = !clean && (!playing || !idle);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black" style={{ cursor: playing && idle ? "none" : "default" }}>
      <div ref={stageRef} className="relative overflow-hidden" style={{ width: 1920 * scale, height: 1080 * scale }} onClick={() => (started ? (playing ? pause() : play()) : undefined)}>
        <div dir="rtl" className="absolute top-0 left-0 origin-top-left" style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}>
          <Backdrop t={t} />
          {SCENES.map((s, i) => {
            const local = t - s.start;
            if (local < 0 || local > s.dur) return null;
            const fin = i === 0 ? 1 : p(local, 0, 0.55);
            const fout = i === SCENES.length - 1 ? 1 : 1 - p(local, s.dur - 0.5, 0.5, E.inCubic);
            const zoom = lerp(1.05, 1, E.outCubic(clamp(local / 0.9))) * lerp(0.965, 1, fout);
            return (
              <div key={s.id} className="absolute inset-0" style={{ opacity: Math.min(fin, fout), transform: `scale(${zoom})` }}>
                <s.C t={local} d={s.dur} />
              </div>
            );
          })}
          {/* letterbox safe-frame grain */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        </div>

        {!started && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050d1c]/85 backdrop-blur-sm">
            <LogoMark size={Math.max(56, 110 * scale * 1.4)} />
            <p className="ltr mt-5 font-bold tracking-[0.3em] text-white" style={{ fontSize: Math.max(18, 44 * scale * 1.4) }}>MEDIVA</p>
            <p className="mt-2 text-sm text-white/60 sm:text-base">Motion Film · {fmtTime(TOTAL)}</p>
            <button onClick={(e) => { e.stopPropagation(); play(0); }} className="mt-7 flex items-center gap-3 rounded-full bg-emerald-500 px-8 py-3.5 text-base font-bold text-[#04121f] shadow-[0_0_60px_rgba(16,185,129,0.5)] transition hover:scale-105">
              <Play className="size-5 fill-current" /> شغّل الفيلم مع الصوت
            </button>
            <p className="mt-4 text-xs text-white/40">Space تشغيل/إيقاف · ← → تنقل · 1-9 المشاهد · H وضع نظيف · F ملء الشاشة</p>
          </div>
        )}
      </div>


      {/* controls */}
      <div className={`fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-4 pt-12 pb-4 transition-opacity duration-300 sm:px-8 ${showUI && started ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div
          ref={barRef}
          dir="ltr"
          className="group relative h-6 cursor-pointer"
          onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); scrub(e.clientX); }}
          onPointerMove={(e) => e.buttons === 1 && scrub(e.clientX)}
        >
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/20 transition-all group-hover:h-2" />
          <div className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-emerald-400 transition-all group-hover:h-2" style={{ width: `${(t / TOTAL) * 100}%` }} />
          {SCENES.slice(1).map((s) => (
            <span key={s.id} className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-black/60" style={{ left: `${(s.start / TOTAL) * 100}%` }} />
          ))}
          <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${(t / TOTAL) * 100}%` }} />
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-white" dir="ltr">
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => (playing ? pause() : play())} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="play">
              {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
            </button>
            <button onClick={() => seek(0)} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="restart"><RotateCcw className="size-5" /></button>
            <button onClick={() => setMuted((m) => !m)} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="mute">
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </button>
            <span className="ml-1 text-sm tabular-nums text-white/80">{fmtTime(t)} / {fmtTime(TOTAL)}</span>
            <span className="ml-3 hidden text-sm font-semibold text-emerald-300 sm:inline" dir="rtl">{current.title}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {msg && <span className="hidden text-xs text-white/70 md:inline" dir="rtl">{msg}</span>}
            <button onClick={() => setLoop((l) => !l)} className={`grid size-10 place-items-center rounded-full hover:bg-white/10 ${loop ? "text-emerald-400" : ""}`} title="Loop (L)"><Repeat className="size-5" /></button>
            <button onClick={() => setClean(true)} className="grid size-10 place-items-center rounded-full hover:bg-white/10" title="Clean mode (H / Esc)"><EyeOff className="size-5" /></button>
            <button onClick={() => document.documentElement.requestFullscreen?.()} className="grid size-10 place-items-center rounded-full hover:bg-white/10" title="Fullscreen (F)"><Maximize2 className="size-5" /></button>
            <button onClick={rec ? stopRecording : exportVideo} className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold ${rec ? "bg-red-600" : "bg-white text-black"}`}>
              {rec ? <Square className="size-4 fill-current" /> : <Circle className="size-4 fill-red-500 text-red-500" />}
              <span className="hidden sm:inline">{rec ? "Stop" : "Export video"}</span>
            </button>
            <Link href="/" className="hidden h-10 items-center gap-2 rounded-full bg-emerald-500 px-4 text-sm font-bold text-[#04121f] sm:flex">
              <Presentation className="size-4" /> Deck
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, CalendarDays, FileHeart, Store, Inbox, Gift, Crown, Megaphone, Sparkles, X, Send, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; links?: { label: string; href: string }[]; suggestions?: string[] };

function useRole() {
  const path = usePathname();
  const m = path.match(/^\/app\/provider\/(\d+)/);
  if (m) return { role: "provider" as const, pid: Number(m[1]), path };
  if (path.startsWith("/app/patient")) return { role: "patient" as const, pid: 0, path };
  return { role: null, pid: 0, path };
}

export default function PhoneChrome() {
  const { role, pid, path } = useRole();
  const [open, setOpen] = useState(false);
  if (!role) return null;

  const tabs =
    role === "patient"
      ? [
          { href: "/app/patient", icon: Home, label: "الرئيسية", exact: true },
          { href: "/app/patient/services", icon: Store, label: "الخدمات" },
          { href: "/app/patient/bookings", icon: CalendarDays, label: "حجوزاتي" },
          { href: "/app/patient/record", icon: FileHeart, label: "سجلي" },
        ]
      : [
          { href: `/app/provider/${pid}`, icon: Home, label: "الرئيسية", exact: true },
          { href: `/app/provider/${pid}/requests`, icon: Inbox, label: "الطلبات" },
          { href: `/app/provider/${pid}/rewards`, icon: Gift, label: "النقاط" },
          { href: `/app/provider/${pid}/ads`, icon: Megaphone, label: "إعلاناتي" },
          { href: `/app/provider/${pid}/packages`, icon: Crown, label: "الباقات" },
        ];

  return (
    <>
      <nav className="absolute inset-x-0 bottom-0 z-30 flex border-t border-line bg-white/95 px-2 pt-2 pb-3 backdrop-blur sm:pb-5">
        {tabs.map((t) => {
          const active = t.exact ? path === t.href : path.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={`flex flex-1 flex-col items-center gap-0.5 text-[10px] font-semibold ${active ? "text-emerald-600" : "text-navy-400"}`}>
              <t.icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              {t.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-20 left-4 z-30 flex items-center gap-1.5 rounded-full bg-navy-900 py-2.5 pr-3 pl-4 text-xs font-bold text-white shadow-[0_10px_30px_rgba(10,26,51,0.4)] sm:bottom-24"
        aria-label="المساعد الذكي"
      >
        <Sparkles className="size-4 text-emerald-400" />
        <span className="ltr">AI</span>
      </button>

      <AnimatePresence>{open && <AiSheet key={`${role}-${pid}`} role={role} pid={pid} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function AiSheet({ role, pid, onClose }: { role: "patient" | "provider"; pid: number; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  async function send(text: string, history = msgs) {
    const t = text.trim();
    if (!t || loading) return;
    const next: Msg[] = [...history, { role: "user", content: t }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, providerId: pid, messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setEngine(j.engine);
      setMsgs([...next, { role: "assistant", content: j.reply, links: j.links, suggestions: j.suggestions }]);
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: e instanceof Error && e.message ? e.message : "تعذر الرد الآن، حاول مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    send("مرحبا", []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex flex-col justify-end bg-navy-950/40" onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[85%] flex-col rounded-t-[28px] bg-white"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-navy-900"><Sparkles className="size-5 text-emerald-400" /></span>
            <div>
              <p className="text-sm font-bold">مساعد MEDIVA</p>
              <p className="text-[10px] text-navy-400">
                {role === "patient" ? "للمريض — اكتشاف الخدمة والمتابعة" : "لمقدم الخدمة — حسب مجالك وبياناتك"}
                {engine && ` · ${engine === "openai" ? "LLM" : "محرك محلي"}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full bg-mist" aria-label="إغلاق"><X className="size-4" /></button>
        </div>

        <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {msgs.slice(1).length === 0 && !loading && null}
          {msgs.map((m, i) =>
            i === 0 && m.role === "user" ? null : (
              <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-6 whitespace-pre-line ${m.role === "user" ? "rounded-br-md bg-emerald-600 text-white" : "rounded-bl-md bg-mist text-navy-900"}`}>
                  {m.content}
                  {!!m.links?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.links.map((l) => (
                        <Link key={l.href + l.label} href={l.href} onClick={onClose} className="rounded-full bg-navy-900 px-3 py-1 text-[11px] font-bold text-white">
                          {l.label} ←
                        </Link>
                      ))}
                    </div>
                  )}
                  {i === msgs.length - 1 && !!m.suggestions?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.suggestions.map((s) => (
                        <button key={s} onClick={() => send(s)} className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
          {loading && (
            <div className="flex justify-end">
              <div className="rounded-2xl bg-mist px-4 py-3"><Loader2 className="size-4 animate-spin text-navy-400" /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-line p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={role === "patient" ? "مثال: بدي ممرض لتغيير ضماد" : "مثال: كيف أزيد طلباتي؟"}
            className="flex-1 rounded-full border border-line bg-mist px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
          <button disabled={loading || !input.trim()} className="grid size-11 place-items-center rounded-full bg-emerald-600 text-white disabled:opacity-40" aria-label="إرسال">
            <Send className="size-4 -scale-x-100" />
          </button>
        </form>
        <p className="pb-3 text-center text-[10px] text-navy-400">AI يساعد ولا يستبدل مقدمي الرعاية · لا تشخيص ولا وصف علاج · طوارئ: 911</p>
      </motion.div>
    </motion.div>
  );
}

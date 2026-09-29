import Link from "next/link";
import type { ServiceType } from "@/db/schema";
import { TEMPLATES } from "@/lib/templates";
import { TIER_LABEL, type Tier } from "@/lib/catalog";

export function Stars({ value, size = "text-sm" }: { value: number; size?: string }) {
  return (
    <span className={`inline-flex ${size} leading-none`} aria-label={`${value} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? "text-amber-400" : "text-navy-200"}>★</span>
      ))}
    </span>
  );
}

export function FeaturedBadge() {
  return <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-navy-950">⭐ مميز</span>;
}

export function TierBadge({ tier }: { tier: Tier }) {
  if (tier === "starter") return null;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tier === "elite" ? "bg-navy-900 text-amber-300" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>
      👑 {TIER_LABEL[tier]}
    </span>
  );
}

type PCard = {
  id: number;
  name: string;
  label: string;
  serviceType: ServiceType;
  city: string;
  priceFrom: number;
  experienceYears: number;
  rating: { avg: number; count: number };
  featuredUntil: Date | null;
  tier: Tier;
};

export function ProviderCard({ p, compact = false }: { p: PCard; compact?: boolean }) {
  const t = TEMPLATES[p.serviceType];
  return (
    <Link
      href={`/app/patient/providers/${p.id}`}
      className={`block rounded-2xl bg-white p-4 transition ${p.featuredUntil ? "ring-2 ring-amber-300 shadow-[0_10px_30px_rgba(251,191,36,0.15)]" : "ring-1 ring-line"} ${compact ? "w-[230px] shrink-0 snap-start" : ""}`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-navy-900 text-lg font-bold text-white">{p.name[0]}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-bold">{p.name}</p>
            {p.featuredUntil && <FeaturedBadge />}
            {!compact && <TierBadge tier={p.tier} />}
          </div>
          <p className="truncate text-[11px] text-navy-400">{t.emoji} {p.label}</p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
            {p.rating.count ? (
              <>
                <Stars value={p.rating.avg} size="text-xs" />
                <span className="font-bold">{p.rating.avg}</span>
                <span className="text-navy-400">({p.rating.count})</span>
              </>
            ) : (
              <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-700">جديد</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[11px] text-navy-600">
        <span>📍 {p.city}</span>
        <span>{p.experienceYears} سنوات خبرة</span>
        <span className="font-bold text-navy-900">من {p.priceFrom} د.أ</span>
      </div>
    </Link>
  );
}

type Ad = { id: number; title: string; body: string; providerName: string; serviceType: ServiceType };

export function AdsStrip({ items }: { items: Ad[] }) {
  if (!items.length) return null;
  return (
    <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5">
      {items.map((a, i) => (
        <a
          key={a.id}
          href={`/api/ads/${a.id}/click`}
          className={`relative w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl p-4 text-white ${i % 2 === 0 ? "bg-gradient-to-l from-emerald-600 to-emerald-800" : "bg-gradient-to-l from-navy-700 to-navy-900"}`}
        >
          <span className="absolute top-3 left-3 rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-bold">إعلان</span>
          <span className="text-2xl">{TEMPLATES[a.serviceType].emoji}</span>
          <p className="mt-1 text-sm font-bold">{a.title}</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-white/80">{a.body}</p>
          <p className="mt-2 text-[10px] font-semibold text-white/70">{a.providerName} · اعرف أكثر ←</p>
        </a>
      ))}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const m: Record<string, [string, string]> = {
    pending: ["بانتظار القبول", "bg-amber-50 text-amber-700 ring-amber-200"],
    accepted: ["مؤكد", "bg-sky-50 text-sky-700 ring-sky-200"],
    completed: ["مكتمل", "bg-emerald-50 text-emerald-700 ring-emerald-200"],
    cancelled: ["ملغي", "bg-red-50 text-red-600 ring-red-200"],
  };
  const [l, c] = m[status] ?? m.pending;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${c}`}>{l}</span>;
}

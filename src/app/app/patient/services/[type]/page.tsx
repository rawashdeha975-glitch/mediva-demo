import { notFound } from "next/navigation";
import { getRankedProviders } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import { ProviderCard } from "@/components/app/market-ui";
import { TEMPLATES } from "@/lib/templates";
import type { ServiceType } from "@/db/schema";

export default async function ServiceList({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!(type in TEMPLATES)) notFound();
  const t = TEMPLATES[type as ServiceType];
  const list = await getRankedProviders(type as ServiceType);
  const featured = list.filter((p) => p.featuredUntil);
  const rest = list.filter((p) => !p.featuredUntil);

  return (
    <div>
      <AppHeader title={`${t.emoji} ${t.serviceLabel}`} subtitle={`${list.length} مقدمي خدمة · المطابقة الذكية`} back="/app/patient/services" />
      <div className="space-y-3 px-5 py-5">
        <p className="rounded-xl bg-mist p-3 text-[11px] leading-5 text-navy-600">
          الترتيب حسب: التقييم وعدده، الخبرة، والباقة. أصحاب شارة <strong>⭐ مميز</strong> يظهرون أولاً (ظهور مدفوع أو مكتسب بالنقاط).
        </p>
        {featured.length > 0 && <p className="text-[11px] font-bold text-amber-600">⭐ مميز</p>}
        {featured.map((p) => <ProviderCard key={p.id} p={p} />)}
        {rest.length > 0 && featured.length > 0 && <p className="pt-2 text-[11px] font-bold text-navy-400">الأعلى تقييماً</p>}
        {rest.map((p) => <ProviderCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}

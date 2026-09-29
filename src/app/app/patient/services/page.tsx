import { getRankedProviders } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import { ProviderCard } from "@/components/app/market-ui";
import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import type { ServiceType } from "@/db/schema";

const TYPES: ServiceType[] = ["nursing", "physio", "pharmacy", "lab"];

export default async function ServicesIndex() {
  const all = await getRankedProviders();
  return (
    <div>
      <AppHeader title="الخدمات" subtitle="سوق واحد لعدة خدمات صحية" back="/app/patient" />
      <div className="space-y-6 px-5 py-5">
        {TYPES.map((t) => {
          const list = all.filter((p) => p.serviceType === t).slice(0, 2);
          return (
            <section key={t}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold">{TEMPLATES[t].emoji} {TEMPLATES[t].serviceLabel}</p>
                <Link href={`/app/patient/services/${t}`} className="text-[11px] font-bold text-emerald-700">عرض الكل ({all.filter((p) => p.serviceType === t).length})</Link>
              </div>
              <div className="space-y-2">{list.map((p) => <ProviderCard key={p.id} p={p} />)}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

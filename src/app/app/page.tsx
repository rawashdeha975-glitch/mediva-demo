import Link from "next/link";
import { getProviders } from "@/lib/care";
import { TEMPLATES } from "@/lib/templates";
import { AppHeader } from "@/components/app/ui";

export default async function RolePicker() {
  const providers = await getProviders();
  return (
    <div>
      <AppHeader title="MEDIVA" subtitle="اختر الدور لتجربة Digital Care Record" dark />
      <div className="space-y-3 px-5 py-6">
        <Link href="/app/patient" className="flex items-center gap-3 rounded-2xl bg-emerald-600 p-4 text-white shadow-lg shadow-emerald-600/20">
          <span className="grid size-11 place-items-center rounded-xl bg-white/15 text-xl">👤</span>
          <span>
            <span className="block font-bold">ليلى — تطبيق المريض</span>
            <span className="text-[11px] text-white/75">سجل الرعاية · الصلاحيات · الإبلاغ</span>
          </span>
        </Link>
        <p className="pt-2 text-[11px] font-bold text-navy-400">تطبيق مقدم الخدمة</p>
        {providers.map((p) => (
          <Link key={p.id} href={`/app/provider/${p.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
            <span className="grid size-11 place-items-center rounded-xl bg-mist text-xl">{TEMPLATES[p.serviceType].emoji}</span>
            <span>
              <span className="block text-sm font-bold">{p.name}</span>
              <span className="text-[11px] text-navy-400">{p.label}</span>
            </span>
          </Link>
        ))}
        <Link href="/" className="block pt-4 text-center text-xs font-semibold text-navy-400">
          العرض التقديمي للمستثمرين ←
        </Link>
      </div>
    </div>
  );
}

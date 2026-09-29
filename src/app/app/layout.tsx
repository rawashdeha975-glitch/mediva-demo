import Link from "next/link";
import { getProviders } from "@/lib/care";
import { resetDemoAction } from "./actions";
import { TEMPLATES } from "@/lib/templates";
import PhoneChrome from "@/components/app/PhoneChrome";

export const dynamic = "force-dynamic";

export const metadata = { title: "MEDIVA — Working Demo · Digital Care Record" };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const providers = await getProviders();

  return (
    <div className="min-h-screen bg-mist sm:dot-grid">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center gap-12 sm:px-6 sm:py-10">
        {/* Desktop side panel: role switcher (hidden on phones & inside deck mockups) */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <Link href="/" className="text-xs font-semibold text-navy-400 hover:text-emerald-600">
            → العودة إلى العرض التقديمي
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-navy-900">
            <span className="ltr">MEDIVA MVP</span>
          </h1>
          <p className="mt-2 text-sm leading-7 text-navy-600">
            <span className="ltr">Working Demo</span> — جرّب السوق من منظور كل طرف: مساعد AI لكل دور، تقييم بعد كل خدمة، باقات حسب المجال، ظهور مميز، إعلانات داخل التطبيق، نقاط وعجلة حظ، وسجل رعاية رقمي. كل البيانات
            هنا <strong>تجريبية وخيالية</strong>.
          </p>

          <div className="mt-6 space-y-2">
            <p className="text-[11px] font-bold tracking-wider text-navy-400">المريض</p>
            <Link
              href="/app/patient"
              className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-navy-900 transition hover:border-emerald-400"
            >
              <span className="text-lg">👤</span> ليلى — تطبيق المريض
            </Link>
            <p className="pt-3 text-[11px] font-bold tracking-wider text-navy-400">مقدمو الخدمة</p>
            {providers.map((p) => (
              <Link
                key={p.id}
                href={`/app/provider/${p.id}`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-navy-900 transition hover:border-emerald-400"
              >
                <span className="text-lg">{TEMPLATES[p.serviceType].emoji}</span>
                <span>
                  {p.name}
                  <span className="block text-[11px] font-normal text-navy-400">{p.label}</span>
                </span>
              </Link>
            ))}
          </div>

          <form action={resetDemoAction} className="mt-5">
            <button className="text-xs font-semibold text-navy-400 underline-offset-4 hover:text-red-600 hover:underline">
              إعادة ضبط بيانات الـ Demo
            </button>
          </form>
        </aside>

        {/* Phone */}
        <div className="relative w-full sm:w-[400px]">
          <div className="relative h-screen w-full overflow-hidden bg-white sm:h-[820px] sm:rounded-[3rem] sm:border-[10px] sm:border-navy-950 sm:shadow-[0_40px_90px_rgba(6,15,31,0.35)]">
            <div className="absolute top-2 left-1/2 z-30 hidden h-6 w-28 -translate-x-1/2 rounded-full bg-navy-950 sm:block" />
            <div className="no-scrollbar h-full overflow-y-auto pb-24">{children}</div>
            <PhoneChrome />
          </div>
        </div>
      </div>
    </div>
  );
}

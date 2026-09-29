import { notFound } from "next/navigation";
import { getProvider } from "@/lib/care";
import { getBooking } from "@/lib/market";
import { AppHeader } from "@/components/app/ui";
import NoteEditor from "@/components/app/NoteEditor";

const DEFAULT_TITLE: Record<string, string> = {
  nursing: "متابعة ما بعد العملية",
  physio: "جلسة إعادة تأهيل",
  lab: "جمع عينة منزلي",
  pharmacy: "طلب منتجات صحية",
};

export default async function NewNote({
  params,
  searchParams,
}: {
  params: Promise<{ pid: string }>;
  searchParams: Promise<{ booking?: string }>;
}) {
  const [{ pid }, { booking }] = await Promise.all([params, searchParams]);
  const provider = await getProvider(Number(pid));
  if (!provider) notFound();
  const b = booking ? await getBooking(Number(booking)) : null;
  const linked = b && b.providerId === provider.id && b.status !== "completed" && b.status !== "cancelled" ? b : null;

  return (
    <div>
      <AppHeader title="إنشاء ملاحظة رعاية" subtitle={linked ? "إتمام الخدمة + التوثيق" : "Create Care Note"} back={`/app/provider/${provider.id}`} />
      {linked && (
        <div className="mx-5 mt-4 rounded-2xl bg-emerald-50 p-3 text-[12px] leading-5 text-emerald-800 ring-1 ring-emerald-200">
          ✅ حفظ الملاحظة سيُتمّ الطلب <strong>#{linked.id}</strong> ({linked.need}) — ويصل للمريض طلب تقييم، وتكسب{" "}
          <strong>نقاط الإتمام + التوثيق</strong>.
        </div>
      )}
      <NoteEditor
        mode="create"
        providerId={provider.id}
        serviceType={provider.serviceType}
        defaultTitle={linked?.need ?? DEFAULT_TITLE[provider.serviceType]}
        bookingId={linked?.id}
      />
    </div>
  );
}

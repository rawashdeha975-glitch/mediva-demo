import { getPatientTimeline } from "@/lib/care";
import { AppHeader, Timeline } from "@/components/app/ui";

export default async function PatientRecord() {
  const notes = await getPatientTimeline();
  return (
    <div>
      <AppHeader title="📋 سجل الرعاية" subtitle="Digital Care Record · للعرض فقط" back="/app/patient" />
      <Timeline notes={notes} hrefBase="/app/patient/record" />
    </div>
  );
}

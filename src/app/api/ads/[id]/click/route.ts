import { NextResponse } from "next/server";
import { db } from "@/db";
import { ads } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [ad] = await db
    .update(ads)
    .set({ clicks: sql`${ads.clicks} + 1` })
    .where(eq(ads.id, Number(id)))
    .returning({ providerId: ads.providerId });
  const target = ad ? `/app/patient/providers/${ad.providerId}` : "/app/patient";
  // relative Location keeps the redirect correct behind proxies
  return new NextResponse(null, { status: 307, headers: { Location: target } });
}

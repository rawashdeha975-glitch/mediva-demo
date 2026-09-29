import { NextResponse } from "next/server";
import { askAssistant, type ChatMsg } from "@/lib/assistant";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const role = body?.role === "provider" ? "provider" : "patient";
    const providerId = Number(body?.providerId);
    const history: ChatMsg[] = Array.isArray(body?.messages)
      ? body.messages
          .filter((m: ChatMsg) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .map((m: ChatMsg) => ({ role: m.role, content: m.content.slice(0, 1000) }))
          .slice(-10)
      : [];
    if (!history.some((m) => m.role === "user")) return NextResponse.json({ error: "رسالة فارغة" }, { status: 400 });
    if (role === "provider" && !providerId) return NextResponse.json({ error: "مقدم خدمة غير معروف" }, { status: 400 });

    const res = await askAssistant(role === "provider" ? { role, providerId } : { role }, history);
    return NextResponse.json(res);
  } catch (e) {
    console.error("ai error", e);
    return NextResponse.json({ error: "تعذر الرد الآن" }, { status: 500 });
  }
}

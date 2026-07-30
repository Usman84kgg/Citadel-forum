import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { escrowDB } from "@/lib/db/escrow";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production");

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const deal = await escrowDB.getDeal(id);
  const events = await escrowDB.getDealEvents(params.id);
  const messages = await escrowDB.getDealMessages(params.id);
  return NextResponse.json({ deal, events, messages });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("access_token="))?.split("=")[1];
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const { action, note } = await request.json();

    if (action === "send_message") {
      const msg = await escrowDB.sendDealMessage(params.id, payload.sub as string, note);
      return NextResponse.json({ success: true, message: msg });
    }

    // Смена статуса сделки
    const statusMap: Record<string, string> = {
      accept: "pending_accept",
      fund: "funded",
      deliver: "delivered",
      complete: "completed",
      cancel: "cancelled",
      dispute: "disputed",
    };

    const newStatus = statusMap[action];
    if (!newStatus) return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });

    const deal = await escrowDB.updateDealStatus(params.id, newStatus, payload.sub as string, note);
    return NextResponse.json({ success: true, deal });
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { supabase } from "@/lib/db/supabase";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production"
);

async function getUserId(request: Request): Promise<string | null> {
  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.sub as string;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, link, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json([]);
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("is_read", false);

  return NextResponse.json({ success: true });
}
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { forumDB } from "@/lib/db/forum";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forumSlug = searchParams.get("forum") || "general";
  const threads = await forumDB.getThreads(forumSlug);
  return NextResponse.json(threads);
}

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("access_token="))?.split("=")[1];
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const { forumSlug, title, content } = await request.json();
    const thread = await forumDB.createThread({
      forumSlug,
      title,
      content,
      authorId: payload.sub as string,
    });
    return NextResponse.json({ success: true, thread });
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 401 });
  }
}
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { forumDB } from "@/lib/db/forum";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production"
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forumSlug = searchParams.get("forum") || "general";
  const threads = await forumDB.getThreads(forumSlug);
  return NextResponse.json(threads);
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      console.error("Токен не найден. Доступные куки:", cookieStore.getAll().map(c => c.name));
      return NextResponse.json({ error: "Не авторизован (токен не найден)" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const { forumSlug, title, content } = await request.json();

    const thread = await forumDB.createThread({
      forumSlug,
      title,
      content,
      authorId: payload.sub as string,
    });

    if (!thread) {
      console.error("forumDB.createThread вернул null");
      return NextResponse.json({ error: "Ошибка создания темы в базе данных" }, { status: 500 });
    }

    return NextResponse.json({ success: true, thread });
  } catch (error) {
    console.error("Критическая ошибка в POST /api/forum/threads:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
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
      return NextResponse.json({ error: "Не авторизован (токен не найден)" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const { forumSlug, title, content } = await request.json();

    console.log("=== DEBUG: Создание темы ===");
    console.log("authorId:", payload.sub);
    console.log("forumSlug:", forumSlug);
    console.log("title:", title);

    const result = await forumDB.createThread({
      forumSlug,
      title,
      content,
      authorId: payload.sub as string,
    });

    console.log("Результат:", JSON.stringify(result, null, 2));

    if (!result.thread) {
      const errorMsg = result.error 
        ? JSON.stringify(result.error) 
        : "Неизвестная ошибка (error object is null/undefined)";
      
      console.error("Ошибка создания темы:", errorMsg);
      
      return NextResponse.json({ 
        error: "Ошибка создания темы",
        details: errorMsg
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, thread: result.thread });
  } catch (error) {
    console.error("Критическая ошибка:", error);
    return NextResponse.json({ 
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
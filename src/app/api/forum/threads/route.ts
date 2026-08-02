import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { forumDB } from "@/lib/db/forum";
import { getAuthorsProfileData } from "@/lib/db/userProfile";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production"
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forumSlug = searchParams.get("forum") || "general";
  const threads = await forumDB.getThreads(forumSlug);

  const authorIds = threads.map((t: any) => t.author_id).filter(Boolean);
  const profiles = await getAuthorsProfileData(authorIds);

  const enriched = threads.map((t: any) => ({
    ...t,
    author: t.author
      ? {
          ...t.author,
          badges: profiles[t.author_id]?.badges || [],
          stats: profiles[t.author_id]?.stats || { balance: 0, reputation: 0, deals: 0 },
        }
      : null,
  }));

  return NextResponse.json(enriched);
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

    const result = await forumDB.createThread({
      forumSlug,
      title,
      content,
      authorId: payload.sub as string,
    });

    if (!result.thread) {
      const errorMsg = result.error
        ? JSON.stringify(result.error)
        : "Неизвестная ошибка (error object is null/undefined)";

      return NextResponse.json(
        {
          error: "Ошибка создания темы",
          details: errorMsg,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, thread: result.thread });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Ошибка сервера",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { forumDB } from "@/lib/db/forum";
import { getAuthorsProfileData } from "@/lib/db/userProfile";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production"
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get("threadId");
  if (!threadId) return NextResponse.json({ error: "threadId обязателен" }, { status: 400 });

  const posts = await forumDB.getPosts(threadId);

  const authorIds = posts.map((p: any) => p.author_id).filter(Boolean);
  const profiles = await getAuthorsProfileData(authorIds);

  const enriched = posts.map((p: any) => ({
    ...p,
    author: p.author
      ? {
          ...p.author,
          badges: profiles[p.author_id]?.badges || [],
          stats: profiles[p.author_id]?.stats || { balance: 0, reputation: 0, deals: 0 },
        }
      : null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const { threadId, content } = await request.json();
    const post = await forumDB.createPost({
      threadId,
      content,
      authorId: payload.sub as string,
    });
    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 401 });
  }
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthorCard } from "@/components/forum/author-card";
import type { AuthorBadge, AuthorStats } from "@/lib/db/userProfile";

interface Author {
  id: string;
  username: string;
  avatar_url: string | null;
  badges: AuthorBadge[];
  stats: AuthorStats;
}

interface Post {
  id: string;
  thread_id: string;
  author_id: string;
  author?: Author | null;
  content: string;
  reaction_count: number;
  is_edited: boolean;
  created_at: string;
}

interface Thread {
  id: string;
  title: string;
  author_id: string;
  author?: Author | null;
  content: string;
  is_locked: boolean;
  view_count: number;
  created_at: string;
}

export default function ThreadPage() {
  const { slug, threadId } = useParams<{ slug: string; threadId: string }>();
  const router = useRouter();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null | undefined>(undefined);

  useEffect(() => {
    Promise.all([
      fetch(`/api/forum/threads?forum=${slug}`).then((r) => r.json()),
      fetch(`/api/forum/posts?threadId=${threadId}`).then((r) => r.json()),
    ]).then(([threads, postData]) => {
      const found = Array.isArray(threads)
        ? threads.find((t: Thread) => t.id === threadId)
        : null;
      setThread(found || null);
      setPosts(Array.isArray(postData) ? postData : []);
      setLoading(false);
    });
  }, [slug, threadId]);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCurrentUser(data?.user ?? null))
      .catch(() => setCurrentUser(null));
  }, []);

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, content: reply }),
    });
    const data = await res.json();
    if (data.success) {
      setReply("");
      fetch(`/api/forum/posts?threadId=${threadId}`)
        .then((r) => r.json())
        .then((d) => setPosts(Array.isArray(d) ? d : []));
    }
  }

  async function thankPost(postId: string) {
    await fetch("/api/forum/thank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    fetch(`/api/forum/posts?threadId=${threadId}`)
      .then((r) => r.json())
      .then((d) => setPosts(Array.isArray(d) ? d : []));
  }

  if (loading) {
    return (
      <div className="citadel-container py-16 text-center text-ink-muted text-sm">
        Загрузка...
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="citadel-container py-16 text-center text-ink-muted text-sm">
        Тема не найдена
      </div>
    );
  }

  return (
    <div className="citadel-container py-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push(`/forum/${slug}`)}>
        ← Назад к разделу
      </Button>

      {/* Шапка автора темы */}
      <Card padding="lg">
        {thread.author && (
          <AuthorCard
            username={thread.author.username}
            avatarUrl={thread.author.avatar_url}
            badges={thread.author.badges}
            stats={thread.author.stats}
            size="lg"
          />
        )}
      </Card>

      {/* Сама тема */}
      <Card padding="lg">
        <h1 className="font-display text-xl font-bold text-gold-400">{thread.title}</h1>
        <p className="text-xs text-ink-muted mt-1">
          {new Date(thread.created_at).toLocaleDateString("ru-RU")} · {thread.view_count} просм.
        </p>
        <p className="text-sm text-ink-secondary whitespace-pre-wrap mt-3">{thread.content}</p>
      </Card>

      {/* Комментарии */}
      <div>
        <h2 className="font-display text-sm font-bold text-ink mb-2">
          Комментарии {posts.length > 0 && posts.length}
        </h2>

        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} padding="md">
              {post.author && (
                <AuthorCard
                  username={post.author.username}
                  avatarUrl={post.author.avatar_url}
                  badges={post.author.badges}
                  stats={post.author.stats}
                  size="sm"
                />
              )}
              <p className="text-sm text-ink-secondary whitespace-pre-wrap mt-2">
                {post.content}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xs text-ink-muted">
                  {new Date(post.created_at).toLocaleDateString("ru-RU")}
                  {post.is_edited && " · (изм.)"}
                </span>
                <button
                  onClick={() => thankPost(post.id)}
                  className="flex items-center gap-1 text-xs text-ink-muted hover:text-gold-400 transition-colors"
                >
                  🙏 {post.reaction_count || 0}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Форма ответа / блок для гостей */}
      {thread.is_locked ? null : currentUser === undefined ? null : currentUser ? (
        <Card padding="lg">
          <form onSubmit={submitReply} className="space-y-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Ваш ответ..."
              rows={4}
              className="w-full rounded-control bg-surface border border-line-subtle p-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400 resize-none"
              required
            />
            <Button type="submit" size="sm">Ответить</Button>
          </form>
        </Card>
      ) : (
        <Card padding="md">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-ink-muted">
              Войдите, чтобы оставить комментарий.
            </p>
            <Link href="/login">
              <Button size="sm">Войти</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
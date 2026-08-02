"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdCarousel } from "@/components/ads/ad-carousel";

interface ThreadAuthor {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Thread {
  id: string;
  title: string;
  author_id: string;
  author?: ThreadAuthor | null;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  post_count: number;
  last_post_at: string;
  created_at: string;
}

export default function ForumPage() {
  const { slug } = useParams<{ slug: string }>();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`/api/forum/threads?forum=${slug}`)
      .then((r) => r.json())
      .then((data) => setThreads(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [slug]);

  async function createThread(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/forum/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forumSlug: slug, title, content }),
    });

    const data = await res.json();

    if (res.ok) {
      setShowNew(false);
      setTitle("");
      setContent("");
      const updated = await fetch(`/api/forum/threads?forum=${slug}`).then((r) => r.json());
      setThreads(Array.isArray(updated) ? updated : []);
    } else {
      alert("Ошибка: " + (data.details || data.error || "Не удалось создать тему"));
    }
  }

  if (loading) {
    return (
      <div className="citadel-container py-10 text-center text-ink-muted text-sm">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="citadel-container py-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg sm:text-2xl font-bold text-gold-400 capitalize truncate">
          {slug}
        </h1>
        <Button size="sm" onClick={() => setShowNew(!showNew)}>
          {showNew ? "Отмена" : "Новая тема"}
        </Button>
      </div>

      {showNew && (
        <Card padding="md">
          <form onSubmit={createThread} className="space-y-2.5">
            <div>
              <label className="block text-2xs text-ink-muted mb-1">Заголовок</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название темы"
                required
                className="w-full rounded-control bg-surface border border-line-subtle p-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="block text-2xs text-ink-muted mb-1">Текст</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Текст сообщения..."
                rows={4}
                required
                className="w-full rounded-control bg-surface border border-line-subtle p-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-gold-400 text-black text-sm font-semibold rounded-control hover:bg-gold-500 transition-colors"
            >
              Опубликовать
            </button>
          </form>
        </Card>
      )}

      {threads.length === 0 ? (
        <Card padding="md">
          <p className="text-sm text-ink-muted text-center">Тем пока нет</p>
        </Card>
      ) : (
        <div className="space-y-0">
          {threads.map((t, idx) => {
            const authorName = t.author?.username || "Аноним";
            const authorAvatar = t.author?.avatar_url || null;

            return (
              <div key={t.id}>
                <Card padding="none" className="mb-1.5">
                  <Link
                    href={`/forum/${slug}/${t.id}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-2 transition-colors"
                  >
                    <div className="shrink-0">
                      {authorAvatar ? (
                        <img
                          src={authorAvatar}
                          alt={authorName}
                          className="h-7 w-7 rounded-full object-cover border border-line-subtle"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-surface-3 flex items-center justify-center text-2xs font-bold text-gold-400">
                          {authorName[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {t.is_pinned && <span className="text-2xs shrink-0">📌</span>}
                        {t.is_locked && <span className="text-2xs shrink-0">🔒</span>}
                        <p className="text-xs sm:text-sm font-medium text-ink truncate">{t.title}</p>
                      </div>
                      <p className="text-2xs text-ink-muted mt-0.5 truncate">
                        <Link
                          href={`/u/${authorName}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-gold-400 transition-colors"
                        >
                          {authorName}
                        </Link>{" "}
                        · {new Date(t.created_at).toLocaleDateString("ru-RU")}
                      </p>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-2xs text-ink-muted whitespace-nowrap">{t.view_count} 👁</p>
                      <p className="text-2xs text-ink-muted whitespace-nowrap">{t.post_count} 💬</p>
                    </div>
                  </Link>
                </Card>

                {(idx + 1) % 6 === 0 && <AdCarousel />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
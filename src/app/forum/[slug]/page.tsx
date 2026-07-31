"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Thread {
  id: string;
  title: string;
  author_id: string;
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
  const router = useRouter();
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
    if (res.ok) {
      setShowNew(false);
      setTitle("");
      setContent("");
      fetch(`/api/forum/threads?forum=${slug}`)
        .then((r) => r.json())
        .then((d) => setThreads(Array.isArray(d) ? d : []));
    }
  }

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Загрузка...</div>;

  return (
    <div className="citadel-container py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold-400 capitalize">{slug}</h1>
        <Button size="sm" onClick={() => setShowNew(!showNew)}>
          {showNew ? "Отмена" : "Новая тема"}
        </Button>
      </div>

      {showNew && (
        <Card padding="lg">
          <form onSubmit={createThread} className="space-y-3">
            <Input label="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название темы" required />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Текст сообщения..."
              rows={5}
              className="w-full rounded-control bg-surface border border-line-subtle p-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400 resize-none"
              required
            />
            <Button type="submit" size="sm">Опубликовать</Button>
          </form>
        </Card>
      )}

      {threads.length === 0 ? (
        <Card padding="md"><p className="text-sm text-ink-muted text-center">Тем пока нет</p></Card>
      ) : (
        <Card padding="none">
          {threads.map((t) => (
            <Link
              key={t.id}
              href={`/forum/${slug}/${t.id}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-line-subtle last:border-0 hover:bg-surface-2 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {t.is_pinned && <Badge variant="warning" size="sm">📌</Badge>}
                  {t.is_locked && <Badge variant="danger" size="sm">🔒</Badge>}
                  <p className="text-sm font-medium text-ink truncate">{t.title}</p>
                </div>
                <p className="text-2xs text-ink-muted mt-0.5">
                  {t.author_id} · {new Date(t.created_at).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-ink-muted">{t.view_count} просм.</p>
                <p className="text-xs text-ink-muted">{t.post_count} отв.</p>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
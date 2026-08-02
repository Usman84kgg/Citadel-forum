use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    
    console.log("Отправка формы:", { title, content });
    
    const res = await fetch("/api/forum/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forumSlug: slug, title, content }),
    });
    
    const data = await res.json();
    console.log("Ответ API:", data);
    
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

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Загрузка...</div>;

// Найди место где map по threads и замени на это:
{threads.map((t: any) => {
  const author = t.author;
  const authorName = author?.username || "Аноним";
  const authorAvatar = author?.avatar_url || null;
  
  return (
    <div className="citadel-container py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold-400 capitalize">{slug}</h1>
        <Button size="sm" onClick={() => setShowNew(!showNew)}>
          {showNew ? "Отмена" : "Новая тема"}
        </Button>
    <Link
      key={t.id}
      href={`/forum/${slug}/${t.id}`}
      className="flex items-center gap-3 px-4 py-3 border-b border-line-subtle last:border-0 hover:bg-surface-2 transition-colors"
    >
      {/* Аватар автора */}
      <div className="shrink-0">
        {authorAvatar ? (
          <img 
            src={authorAvatar} 
            alt={authorName}
            className="h-8 w-8 rounded-full object-cover border border-line-subtle"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-surface-3 flex items-center justify-center text-2xs font-bold text-gold-400">
            {authorName[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {showNew && (
        <Card padding="lg">
          <form onSubmit={createThread} className="space-y-3">
            {/* Заменили кастомный Input на обычный input */}
            <div>
              <label className="block text-xs text-ink-muted mb-1">Заголовок</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  console.log("Title изменен:", e.target.value);
                  setTitle(e.target.value);
                }}
                placeholder="Название темы"
                required
                className="w-full rounded-control bg-surface border border-line-subtle p-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400"
              />
            </div>
            
            <div>
              <label className="block text-xs text-ink-muted mb-1">Текст</label>
              <textarea
                value={content}
                onChange={(e) => {
                  console.log("Content изменен:", e.target.value);
                  setContent(e.target.value);
                }}
                placeholder="Текст сообщения..."
                rows={5}
                required
                className="w-full rounded-control bg-surface border border-line-subtle p-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400 resize-none"
              />
            </div>
            
            <button 
              type="submit"
              className="px-4 py-2 bg-gold-400 text-black font-semibold rounded hover:bg-gold-500 transition-colors"
            >
              Опубликовать
            </button>
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
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {t.is_pinned && <Badge variant="warning" size="sm">📌</Badge>}
          {t.is_locked && <Badge variant="danger" size="sm">🔒</Badge>}
          <p className="text-sm font-medium text-ink truncate">{t.title}</p>
        </div>
        <p className="text-2xs text-ink-muted mt-0.5">
          {authorName} · {new Date(t.created_at).toLocaleDateString("ru-RU")}
        </p>
      </div>
      
      <div className="text-right shrink-0">
        <p className="text-xs text-ink-muted">{t.view_count} просм.</p>
        <p className="text-xs text-ink-muted">{t.post_count} отв.</p>
      </div>
    </Link>
  );
}
})}
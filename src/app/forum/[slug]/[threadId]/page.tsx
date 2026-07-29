"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  reaction_count: number;
  is_edited: boolean;
  created_at: string;
}

interface Thread {
  id: string;
  title: string;
  author_id: string;
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

  useEffect(() => {
    Promise.all([
      fetch(`/api/forum/threads?forum=${slug}`).then(r => r.json()),
      fetch(`/api/forum/posts?threadId=${threadId}`).then(r => r.json()),
    ]).then(([threads, postData]) => {
      const found = Array.isArray(threads) ? threads.find((t: Thread) => t.id === threadId) : null;
      setThread(found || null);
      setPosts(Array.isArray(postData) ? postData : []);
      setLoading(false);
    });
  }, [slug, threadId]);

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
        .then(r => r.json())
        .then(d => setPosts(Array.isArray(d) ? d : []));
    }
  }

  async function thankPost(postId: string) {
    await fetch("/api/forum/thank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    fetch(`/api/forum/posts?threadId=${threadId}`)
      .then(r => r.json())
      .then(d => setPosts(Array.isArray(d) ? d : []));
  }

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Загрузка...</div>;
  if (!thread) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Тема не найдена</div>;

  return (
    <div className="citadel-container py-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push(`/forum/${slug}`)}>← Назад к разделу</Button>

      <Card padding="lg">
        <h1 className="font-display text-xl font-bold text-gold-400">{thread.title}</h1>
        <p className="text-xs text-ink-muted mt-1">{thread.author_id} · {new Date(thread.created_at).toLocaleDateString("ru-RU")} · {thread.view_count} просм.</p>
      </Card>

      {posts.map((post) => (
        <Card key={post.id} padding="md">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-gold-400 shrink-0">
              {post.author_id?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-ink">{post.author_id}</span>
                <span className="text-2xs text-ink-muted">{new Date(post.created_at).toLocaleDateString("ru-RU")}</span>
                {post.is_edited && <span className="text-2xs text-ink-faint">(изм.)</span>}
              </div>
              <p className="text-sm text-ink-secondary whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => thankPost(post.id)}
                  className="flex items-center gap-1 text-xs text-ink-muted hover:text-gold-400 transition-colors"
                >
                  🙏 {post.reaction_count || 0}
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {!thread.is_locked && (
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
      )}
    </div>
  );
}
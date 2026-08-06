"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  status: string;
  seller_id: string;
  seller_username: string | null;
  seller_avatar_url: string | null;
  image_url: string | null;
  view_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  username: string | null;
  avatarUrl: string | null;
}

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  function loadAll() {
    Promise.all([
      fetch(`/api/market/listings/${id}`).then(r => (r.ok ? r.json() : null)),
      fetch(`/api/market/listings/${id}/comments`).then(r => (r.ok ? r.json() : [])),
    ]).then(([l, c]) => {
      setListing(l);
      setComments(Array.isArray(c) ? c : []);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadAll();
  }, [id]);

  async function submitComment() {
    if (!newComment.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/market/listings/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    setPosting(false);
    if (res.ok) {
      setNewComment("");
      loadAll();
    }
  }

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Загрузка...</div>;
  if (!listing) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Объявление не найдено</div>;

  const initials = (listing.seller_username || "?").slice(0, 2).toUpperCase();

  return (
    <div className="citadel-container py-6 max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/market")}>← Назад к маркету</Button>

      {/* Карточка продавца */}
      <Card padding="lg" className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-gold-400/15 flex items-center justify-center shrink-0">
          {listing.seller_avatar_url ? (
            <img src={listing.seller_avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-gold-400 font-bold text-lg">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">{listing.seller_username || "Продавец"}</p>
          <p className="text-2xs text-ink-muted mt-0.5">Продавец на площадке</p>
        </div>
      </Card>

      <Card padding="lg">
        {listing.image_url ? (
          <div className="h-56 w-full rounded-control overflow-hidden mb-4">
            <img src={listing.image_url} alt={listing.title} className="h-full w-full object-cover" />
          </div>
        ) : null}

        <div className="flex items-start justify-between mb-3">
          <h1 className="font-display text-xl font-bold text-gold-400">{listing.title}</h1>
          <Badge variant={listing.type === "service" ? "info" : "warning"}>{listing.type === "service" ? "Услуга" : "Товар"}</Badge>
        </div>
        <p className="text-sm text-ink-secondary whitespace-pre-wrap">{listing.description}</p>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line-subtle">
          <div>
            <p className="font-display text-2xl font-bold text-gold-400">${((listing.price || 0) / 100).toFixed(2)}</p>
            <p className="text-xs text-ink-muted mt-1">
              {new Date(listing.created_at).toLocaleDateString("ru-RU")} · {listing.view_count} просм.
            </p>
          </div>
          <Button size="sm" onClick={() => alert("Функция сделок пока в разработке")}>Заказать</Button>
        </div>
      </Card>

      {/* Комментарии */}
      <Card padding="lg" className="space-y-4">
        <p className="text-sm font-semibold text-ink">Комментарии · {comments.length}</p>

        {comments.length === 0 ? (
          <p className="text-xs text-ink-muted">Пока нет комментариев</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gold-400/15 flex items-center justify-center shrink-0 text-2xs text-gold-400 font-bold">
                  {(c.username || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink">{c.username || "Пользователь"}</p>
                  <p className="text-sm text-ink-secondary mt-0.5">{c.content}</p>
                  <p className="text-2xs text-ink-faint mt-1">{new Date(c.createdAt).toLocaleString("ru-RU")}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-line-subtle">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Написать комментарий..."
            className="flex-1 rounded-control bg-surface border border-line-subtle px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400"
          />
          <Button size="sm" disabled={posting} onClick={submitComment}>Отправить</Button>
        </div>
      </Card>
    </div>
  );
}

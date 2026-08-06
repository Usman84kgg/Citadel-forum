"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant, BadgeEffect } from "@/components/ui/badge";

interface PublicUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
  telegramUsername?: string | null;
  bio?: string | null;
}

interface AuthorStats {
  balance: number;
  reputation: number;
  deals: number;
}

interface AuthorBadge {
  id: string;
  label: string;
  variant: string;
  effect: string;
}

interface Listing {
  id: string;
  title: string;
  price: number | null;
  status: string;
  created_at: string;
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [badges, setBadges] = useState<AuthorBadge[]>([]);
  const [stats, setStats] = useState<AuthorStats>({ balance: 0, reputation: 0, deals: 0 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/user/${username}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setUser(data.user);
        setBadges(data.badges || []);
        setStats(data.stats || { balance: 0, reputation: 0, deals: 0 });
        setListings(data.listings || []);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Загрузка...</div>;
  if (notFound || !user) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Пользователь не найден</div>;

  const initials = user.username.slice(0, 1).toUpperCase();
  const repLabel = stats.reputation > 0 ? `+${stats.reputation}` : stats.reputation === 0 ? "—" : `${stats.reputation}`;
  const balanceLabel = stats.balance > 0 ? `${(stats.balance / 100).toFixed(2)} $` : "0 $";
  const regDate = new Date(user.createdAt).toLocaleDateString("ru-RU");

  return (
    <div className="pb-8">
      {/* Аватар — крупный блок */}
      <div className="w-full bg-surface-2 flex items-center justify-center" style={{ minHeight: 220 }}>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.username} className="w-full object-cover" style={{ maxHeight: 280 }} />
        ) : (
          <div className="h-28 w-28 rounded-full border-2 border-gold-400/40 bg-surface flex items-center justify-center">
            <span className="font-display text-5xl font-bold text-gold-400">{initials}</span>
          </div>
        )}
      </div>

      <div className="citadel-container py-4 space-y-3">
        {/* Имя + telegram */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="font-display text-xl font-bold text-ink">{user.username}</h1>
              {user.telegramUsername && (
                <p className="text-sm text-ink-muted flex items-center gap-1 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM18.562 8.189L16.38 18.486C16.22 19.216 15.782 19.394 15.171 19.048L12.171 16.834L10.724 18.228C10.55 18.402 10.402 18.548 10.056 18.548L10.274 15.492L16.01 10.337C16.257 10.118 15.957 9.994 15.63 10.213L8.543 14.663L5.582 13.769C4.863 13.54 4.849 13.053 5.736 12.707L17.733 7.889C18.332 7.66 18.852 8.019 18.562 8.189Z"/>
                  </svg>
                  {user.telegramUsername}
                </p>
              )}
            </div>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end">
                {badges.map((b) => (
                  <Badge key={b.id} variant={b.variant as BadgeVariant} effect={b.effect as BadgeEffect} size="sm">
                    {b.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-ink-faint mt-1">На форуме с {regDate}</p>
        </div>

        {/* Таблица статистики */}
        <Card padding="none">
          {[
            { label: "Количество сделок", value: stats.deals },
            { label: "Рейтинг", value: repLabel },
            { label: "Депозит", value: balanceLabel },
            { label: "Регистрация", value: regDate },
            { label: "Активные арбитражи (ответчик)", value: "0" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-2.5 border-b border-line-subtle last:border-0">
              <span className="text-sm text-ink-muted">{row.label}</span>
              <span className="text-sm text-ink font-medium">{row.value}</span>
            </div>
          ))}
        </Card>

        {/* Описание */}
        {user.bio && (
          <p className="text-sm text-ink-secondary leading-relaxed">{user.bio}</p>
        )}

        {/* Кнопки действий */}
        <div className="space-y-2">
          <Link href={`/escrow/create?with=${user.id}`} className="block">
            <Button className="w-full">Открыть сделку</Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/messages/new?to=${user.id}`} className="flex-1">
              <Button variant="secondary" className="w-full">Перейти в чат</Button>
            </Link>
            <button className="h-10 w-10 rounded-control border border-line-subtle bg-surface flex items-center justify-center text-ink-muted hover:text-ink shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Объявления пользователя */}
        {listings.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-ink mb-2">Объявления</h2>
            <Card padding="none">
              {listings.map((l) => (
                <Link key={l.id} href={`/market/${l.id}`}>
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line-subtle last:border-0 hover:bg-surface-2/40 transition-colors">
                    <p className="text-sm text-ink truncate">{l.title}</p>
                    <p className="text-xs text-ink-muted shrink-0">{l.price ? `$${(l.price / 100).toFixed(2)}` : "—"}</p>
                  </div>
                </Link>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
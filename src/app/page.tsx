"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdSlots from "@/components/ads/ad-slots";

export default function HomePage() {
  return (
    <div className="space-y-0 pb-8">
      <RegisterPrompt />
      <AdSlots />
      <div className="citadel-container space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ForumSections />
          </div>
          <div className="space-y-4">
            <TopUsers />
            <LatestDeals />
          </div>
        </div>
        <LatestListings />
        <OnlineNow />
      </div>
    </div>
  );
}

function RegisterPrompt() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (isLoggedIn !== false) return null;

  return (
    <section className="citadel-container pt-4 pb-2">
      <Card padding="lg">
        <h1 className="font-display text-lg sm:text-xl font-bold text-ink mb-2">
          Хотите разместить свою публикацию?
        </h1>
        <p className="text-xs text-ink-muted mb-4">
          Необходимо зарегистрироваться, это откроет доступ ко всем функциям платформы
        </p>
        <a href="/register">
          <Button className="w-full">Зарегистрироваться</Button>
        </a>
      </Card>
    </section>
  );
}

function ForumSections() {
  const [forums, setForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/forum/forums")
      .then((r) => r.json())
      .then((data) => { setForums(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink mb-3">Основные разделы</h2>
      <div className="text-sm text-ink-muted">Загрузка разделов...</div>
    </section>
  );

  if (forums.length === 0) return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink mb-3">Основные разделы</h2>
      <Card padding="md"><p className="text-sm text-ink-muted text-center">Разделы загружаются.</p></Card>
    </section>
  );

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink mb-3">Основные разделы</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {forums.map((f: any) => (
          <a key={f.id} href={`/forum/${f.slug}`}>
            <Card variant={f.slug === "vip" ? "gold" : "interactive"} padding="sm">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink truncate">{f.name}</p>
                    {f.slug === "vip" && <Badge variant="gold" size="sm">VIP</Badge>}
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{f.description || "Описание раздела"}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-2xs text-ink-faint">
                    <span>Тем: {f.thread_count || 0}</span>
                    <span>Сооб: {f.post_count || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </section>
  );
}

function TopUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/top-users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="font-display text-sm font-bold text-ink">Топ пользователей</h2>
      </div>
      <Card padding="none">
        {loading ? (
          <p className="text-xs text-ink-muted text-center py-4">Загрузка...</p>
        ) : users.length === 0 ? (
          <p className="text-xs text-ink-muted text-center py-4">Пока нет данных</p>
        ) : (
          users.map((u, i) => (
            <a
              key={u.id}
              href={`/u/${u.username}`}
              className="flex items-center gap-2 px-3 py-2.5 border-b border-line-subtle last:border-0 hover:bg-surface-2 transition-colors"
            >
              <span className="font-display text-xs text-gold-400 w-5">#{i + 1}</span>
              <div className="h-6 w-6 rounded-full bg-surface-3 flex items-center justify-center text-2xs font-bold text-gold-400 overflow-hidden shrink-0">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  u.username?.[0]?.toUpperCase()
                )}
              </div>
              <span className="flex-1 text-xs text-ink truncate">{u.username}</span>
              {u.badges?.[0] && (
                <Badge variant={(u.badges[0].variant as any) || "gold"} size="sm">
                  {u.badges[0].label}
                </Badge>
              )}
              <span className="text-xs font-semibold text-gold-400">
                {u.reputation > 0 ? `+${u.reputation}` : u.reputation}
              </span>
            </a>
          ))
        )}
      </Card>
    </section>
  );
}

function LatestDeals() {
  const deals = [
    { name: "Дизайн лендинга", from: "CryptoKing", to: "PixelQueen", amount: "$250", status: "finished" },
    { name: "Аудит безопасности", from: "DarkMaster", to: "GhostTrader", amount: "$1 200", status: "active" },
    { name: "Разработка бота", from: "ShadowDev", to: "CryptoKing", amount: "$800", status: "active" },
  ];

  return (
    <section>
      <h2 className="font-display text-sm font-bold text-ink mb-2">Последние сделки</h2>
      <Card padding="none">
        {deals.map((d) => (
          <div key={d.name} className="flex items-center gap-2 px-3 py-2.5 border-b border-line-subtle last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink truncate">{d.name}</p>
              <p className="text-2xs text-ink-muted">{d.from} → {d.to}</p>
            </div>
            <span className="text-xs font-semibold text-ink">{d.amount}</span>
            <Badge variant={d.status === "finished" ? "success" : "info"} size="sm">{d.status === "finished" ? "Заверш." : "Актив."}</Badge>
          </div>
        ))}
      </Card>
      <p className="text-2xs text-ink-faint text-center mt-1">Демо-данные, подключим после escrow.ts</p>
    </section>
  );
}

function LatestListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/latest-listings")
      .then((r) => r.json())
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  function timeAgo(dateStr: string) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diffMs / 3600000);
    if (hours < 1) return "только что";
    if (hours < 24) return `${hours}ч`;
    return `${Math.floor(hours / 24)}д`;
  }

  return (
    <section>
      <h2 className="font-display text-sm font-bold text-ink mb-2">Последние объявления</h2>
      {loading ? (
        <p className="text-xs text-ink-muted">Загрузка...</p>
      ) : listings.length === 0 ? (
        <Card padding="md"><p className="text-sm text-ink-muted text-center">Объявлений пока нет</p></Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {listings.map((l) => (
            <a key={l.id} href={`/market/${l.id}`}>
              <Card variant="interactive" padding="sm">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-surface-3 flex items-center justify-center text-2xs font-bold text-gold-400 shrink-0 overflow-hidden">
                    {l.seller?.avatar_url ? (
                      <img src={l.seller.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      l.seller?.username?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink truncate">{l.title}</p>
                    <p className="text-2xs text-ink-muted">
                      {l.seller?.username || "Аноним"} · {timeAgo(l.created_at)}
                    </p>
                    <p className="text-xs font-semibold text-gold-400 mt-0.5">
                      {l.price ? `$${(l.price / 100).toFixed(0)}` : "—"}
                    </p>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function OnlineNow() {
  return (
    <section>
      <h2 className="font-display text-sm font-bold text-ink mb-2">Онлайн сейчас</h2>
      <Card padding="sm" className="flex items-center gap-3">
        <div className="flex -space-x-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-surface-3 border-2 border-surface flex items-center justify-center text-2xs font-bold text-gold-400">U</div>
          ))}
        </div>
        <span className="text-xs text-ink-muted">+334</span>
        <Badge variant="success" size="sm">127 онлайн</Badge>
      </Card>
      <p className="text-2xs text-ink-faint text-center mt-1">Демо-данные, нужен механизм отслеживания активности</p>
    </section>
  );
}
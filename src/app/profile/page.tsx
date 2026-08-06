"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BadgeEffect, BadgeVariant } from "@/components/ui/badge";

type UserData = { id: string; email: string; username: string; createdAt?: string };
type UserBadge = { id: string; label: string; variant: string; effect: string };
type UserStats = {
  posts: number;
  deals: number;
  turnover: number;
  reputation: number;
  positiveRep: number;
  negativeRep: number;
  balance: number;
};

const DEFAULT_STATS: UserStats = {
  posts: 0,
  deals: 0,
  turnover: 0,
  reputation: 0,
  positiveRep: 0,
  negativeRep: 0,
  balance: 0,
};

type ActiveTab = "reviews" | "wall" | "posts" | "comments";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("reviews");

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) { router.push("/login"); return; }
        const meData = await meRes.json();
        setUser(meData.user);

        const [badgesRes, statsRes, balanceRes] = await Promise.allSettled([
          fetch(`/api/user/badges?userId=${meData.user.id}`).then(r => r.ok ? r.json() : []),
          fetch("/api/user/stats").then(r => r.ok ? r.json() : {}),
          fetch("/api/wallet/balance").then(r => r.ok ? r.json() : { available: 0 }),
        ]);

        if (badgesRes.status === "fulfilled") setBadges(Array.isArray(badgesRes.value) ? badgesRes.value : []);
        if (statsRes.status === "fulfilled") setStats({ ...DEFAULT_STATS, ...statsRes.value });
        if (balanceRes.status === "fulfilled") setBalance((balanceRes.value as any)?.available ?? 0);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Загрузка...</div>;
  if (!user) return null;

  const formatBalance = (cents: number) => `${(cents / 100).toFixed(2)} $`;
  const regDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("ru-RU") : "—";
  const repLabel = stats.reputation > 0 ? `+${stats.reputation}` : stats.reputation === 0 ? "—" : `${stats.reputation}`;

  const tabs: { key: ActiveTab; label: string; count: number }[] = [
    { key: "reviews", label: "Отзывы", count: stats.positiveRep + stats.negativeRep },
    { key: "wall", label: "Стена", count: 0 },
    { key: "posts", label: "Публикации", count: stats.posts },
    { key: "comments", label: "Комментарии", count: 0 },
  ];

  return (
    <div className="citadel-container py-4 space-y-0 pb-8">
      {/* Хедер профиля */}
      <div className="mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-xl border border-line-gold bg-surface-2 flex items-center justify-center shrink-0">
            <span className="font-display text-xl font-bold text-gold-400">
              {user.username?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold text-gold-400 truncate">{user.username}</h1>
            <p className="text-xs text-ink-muted truncate">{user.email}</p>
          </div>
        </div>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {badges.map((b) => (
              <Badge key={b.id} variant={b.variant as BadgeVariant} effect={b.effect as BadgeEffect} size="sm">
                {b.label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Таблица инфо */}
      <Card padding="none" className="mb-3">
        {[
          { label: "Рейтинг", value: repLabel },
          { label: "Депозит", value: formatBalance(balance) },
          { label: "Регистрация", value: regDate },
          { label: "Активные арбитражи (ответчик)", value: "0" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-2.5 border-b border-line-subtle last:border-0">
            <span className="text-sm text-ink-muted">{row.label}</span>
            <span className="text-sm text-ink font-medium">{row.value}</span>
          </div>
        ))}
      </Card>

      {/* Кнопка создать публикацию */}
      <Link href="/publish" className="block mb-3">
        <Button className="w-full">Создать публикацию</Button>
      </Link>

      {/* Депозиты */}
      <Card padding="md" className="mb-3">
        {balance <= 0 ? (
          <p className="text-sm text-ink-muted mb-3">Нет депозитов</p>
        ) : (
          <p className="text-sm text-ink mb-3">Баланс: <span className="text-gold-400 font-bold">{formatBalance(balance)}</span></p>
        )}
        <Link href="/wallet/deposit">
          <Button className="w-full">Пополнить</Button>
        </Link>
      </Card>

      {/* Статистика 2×2 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: "Сумма покупок, $", value: "0" },
          { label: "Сумма продаж, $", value: "0" },
          { label: "Кол-во сделок", value: String(stats.deals) },
          { label: "Рейтинг", value: repLabel },
        ].map((item) => (
          <Card key={item.label} padding="sm" className="text-center py-3">
            <p className="font-display text-xl font-bold text-ink">{item.value}</p>
            <p className="text-2xs text-ink-muted mt-1">{item.label}</p>
          </Card>
        ))}
      </div>

      {/* Вкладки */}
      <div className="flex gap-0 border-b border-line-subtle overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === t.key
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === t.key ? "bg-gold-400 text-black" : "bg-surface-2 text-ink-faint"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Сортировка */}
      <div className="flex items-center justify-between py-2 mb-2">
        <span className="text-sm text-ink-muted">Сортировать по:</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Пустое состояние */}
      <Card padding="lg" className="text-center py-10">
        <p className="font-display text-base font-bold text-ink mb-1">Здесь пока ничего нет</p>
        <p className="text-sm text-ink-muted">
          {activeTab === "reviews" && "У пользователя не было отзывов"}
          {activeTab === "wall" && "На стене пока пусто"}
          {activeTab === "posts" && "Публикаций пока нет"}
          {activeTab === "comments" && "Комментариев пока нет"}
        </p>
      </Card>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BadgeEffect, BadgeVariant } from "@/components/ui/badge";

type UserData = { id: string; email: string; username: string };
type UserBadge = { id: string; label: string; variant: string; effect: string };
type UserStats = {
  posts: number;
  thanks: number;
  deals: number;
  turnover: number;
  reputation: number;
  positiveRep: number;
  negativeRep: number;
  balance: number;
};

const DEFAULT_STATS: UserStats = {
  posts: 0,
  thanks: 0,
  deals: 0,
  turnover: 0,
  reputation: 0,
  positiveRep: 0,
  negativeRep: 0,
  balance: 0,
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [showNicknameForm, setShowNicknameForm] = useState(false);
  const [newNick, setNewNick] = useState("");
  const [nickError, setNickError] = useState("");
  const [nickSuccess, setNickSuccess] = useState("");
  const [nickLoading, setNickLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        try {
          const badgesRes = await fetch(`/api/user/badges?userId=${meData.user.id}`);
          if (badgesRes.ok) {
            const badgesData = await badgesRes.json();
            setBadges(Array.isArray(badgesData) ? badgesData : []);
          }
        } catch {}

        try {
          const statsRes = await fetch("/api/user/stats");
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats({ ...DEFAULT_STATS, ...statsData });
          }
        } catch {}
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function changeNickname(e: React.FormEvent) {
    e.preventDefault();
    setNickError("");
    setNickSuccess("");
    setNickLoading(true);
    const res = await fetch("/api/user/change-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newUsername: newNick }),
    });
    const data = await res.json();
    setNickLoading(false);
    if (!res.ok) {
      setNickError(data.error || "Ошибка");
      return;
    }
    setNickSuccess(`Ник изменён на ${data.username}!`);
    setNewNick("");
    setShowNicknameForm(false);
    setUser((prev) => (prev ? { ...prev, username: data.username } : prev));
  }

  if (loading) {
    return (
      <div className="citadel-container py-16 text-center text-ink-muted text-sm">
        Загрузка...
      </div>
    );
  }

  if (!user) return null;

  const formatMoney = (amount: number) => {
    if (amount > 10000) return `$${(amount / 100).toFixed(2)}`;
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="citadel-container py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-2xl border-2 border-line-gold bg-surface-2 shadow-gold flex items-center justify-center">
          <span className="font-display text-3xl font-bold text-gold-400">
            {user.username?.charAt(0).toUpperCase() ?? "U"}
          </span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-400">{user.username}</h1>
          <p className="text-sm text-ink-muted">{user.email}</p>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {badges.map((b) => (
                <Badge key={b.id} variant={b.variant as BadgeVariant} effect={b.effect as BadgeEffect} size="sm">
                  {b.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card padding="sm" className="text-center">
          <p className="font-display text-xl font-bold text-gold-400">{stats.posts}</p>
          <p className="text-2xs text-ink-muted uppercase mt-1">Сообщений</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="font-display text-xl font-bold text-gold-400">{stats.deals}</p>
          <p className="text-2xs text-ink-muted uppercase mt-1">Сделок</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="font-display text-xl font-bold text-gold-400">
            {stats.reputation >= 0 ? `+${stats.reputation}` : stats.reputation}
          </p>
          <p className="text-2xs text-ink-muted uppercase mt-1">Репутация</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="font-display text-xl font-bold text-gold-400">{formatMoney(stats.balance)}</p>
          <p className="text-2xs text-ink-muted uppercase mt-1">Баланс</p>
        </Card>
      </div>

      <Card padding="md" className="mb-6">
        <h2 className="font-display text-sm font-bold text-ink mb-3">Репутация</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-success">+{stats.positiveRep}</span>
            <span className="text-2xs text-ink-muted">положительных</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-danger">-{stats.negativeRep}</span>
            <span className="text-2xs text-ink-muted">отрицательных</span>
          </div>
        </div>
      </Card>

      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-bold text-ink">Настройки</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowNicknameForm(!showNicknameForm)}>
            {showNicknameForm ? "Отмена" : "Изменить ник"}
          </Button>
        </div>
        {nickSuccess && <p className="text-xs text-success mb-3">{nickSuccess}</p>}
        {showNicknameForm && (
          <form onSubmit={changeNickname} className="flex gap-2">
            <Input value={newNick} onChange={(e) => setNewNick(e.target.value)} placeholder="Новый никнейм" className="flex-1" />
            <Button type="submit" loading={nickLoading} size="sm">Сохранить</Button>
          </form>
        )}
        {nickError && <p className="text-xs text-danger mt-2">{nickError}</p>}
      </Card>
    </div>
  );
}
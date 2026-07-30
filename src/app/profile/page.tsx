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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  // Смена ника
  const [showNicknameForm, setShowNicknameForm] = useState(false);
  const [newNick, setNewNick] = useState("");
  const [nickError, setNickError] = useState("");
  const [nickSuccess, setNickSuccess] = useState("");
  const [nickLoading, setNickLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setUser(data.user);
        return fetch(`/api/user/badges?userId=${data.user.id}`);
      })
      .then((r) => r.json())
      .then((data) => setBadges(Array.isArray(data) ? data : []))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
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

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Загрузка...</div>;
  if (!user) return null;

  return (
    <div className="citadel-container py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-2xl border-2 border-line-gold bg-surface-2 shadow-gold flex items-center justify-center">
          <span className="font-display text-3xl font-bold text-gold-400">
            {user.username?.charAt(0).toUpperCase() ?? "U"}
          </span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-400">
            {user.username}
          </h1>
          <p className="text-sm text-ink-muted">{user.email}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {badges.map((b) => (
              <Badge
                key={b.id}
                variant={(b.variant as BadgeVariant) || "gold"}
                effect={(b.effect as BadgeEffect) || "solid"}
              >
                {b.label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
            Выйти
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowNicknameForm(!showNicknameForm)}>
            Сменить ник ($100)
          </Button>
        </div>
      </div>

      {/* Форма смены ника */}
      {showNicknameForm && (
        <Card padding="md" className="mb-6 max-w-md">
          <form onSubmit={changeNickname} className="space-y-3">
            <p className="text-xs text-ink-muted">
              Стоимость смены ника: <span className="text-gold-400 font-bold">$100</span>
            </p>
            <Input
              label="Новый ник"
              value={newNick}
              onChange={(e) => setNewNick(e.target.value)}
              placeholder="Ваш новый ник"
              required
            />
            {nickError && <p className="text-xs text-danger">{nickError}</p>}
            {nickSuccess && <p className="text-xs text-success">{nickSuccess}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={nickLoading}>
                Сменить за $100
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowNicknameForm(false)}>
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ProfileStat value="128" label="Публикации" icon="📄" />
            <ProfileStat value="342" label="Спасибо" icon="🙏" />
            <ProfileStat value="12" label="Сделок" icon="🛡️" />
            <ProfileStat value="$8 450" label="Оборот" icon="💰" />
          </div>
          <Card variant="gold" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wide">Общий баланс</p>
                <p className="font-display text-2xl font-bold text-gold-400 mt-1">$2 450.75</p>
              </div>
              <a href="/wallet" className="text-xs text-gold-400 hover:underline">Кошелёк →</a>
            </div>
          </Card>
        </div>
        <Card padding="md">
          <h3 className="font-display text-sm font-bold text-ink mb-3">Репутация</h3>
          <p className="font-display text-3xl font-bold text-gold-400">1 245</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-ink-muted">
            <span className="text-success">+128 позит.</span>
            <span className="text-danger">-2 негат.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProfileStat({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <Card padding="sm" className="text-center">
      <span className="text-lg block mb-1">{icon}</span>
      <p className="font-display text-lg font-bold text-gold-400">{value}</p>
      <p className="text-2xs text-ink-muted">{label}</p>
    </Card>
  );
}
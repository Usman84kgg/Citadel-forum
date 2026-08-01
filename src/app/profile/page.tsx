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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
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
        if (!meRes.ok) throw new Error("Not auth");
        const meData = await meRes.json();
        setUser(meData.user);

        const badgesRes = await fetch(`/api/user/badges?userId=${meData.user.id}`);
        const badgesData = await badgesRes.json();
        setBadges(Array.isArray(badgesData) ? badgesData : []);

        const statsRes = await fetch("/api/user/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
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

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Загрузка...</div>;
  if (!user || !stats) return null;

  const formatMoney = (amount: number) => {
    if (amount > 10000) {
      return `$${(amount / 100).toFixed(2)}`;
    }
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
              <Button type="submit" size
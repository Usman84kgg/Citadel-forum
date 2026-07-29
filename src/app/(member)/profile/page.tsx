"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type UserData = {
  id: string;
  email: string;
  username: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => setUser(data.user))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="citadel-container py-16 text-center text-ink-muted">
        Загрузка...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="citadel-container py-6">
      {/* Заголовок */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-2xl border-2 border-line-gold bg-surface-2 shadow-gold flex items-center justify-center">
          <span className="font-display text-3xl font-bold text-gold-400">
            {user.username[0].toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-400">
            {user.username}
          </h1>
          <p className="text-sm text-ink-muted">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="gold">VIP</Badge>
            <Badge variant="success">Активен</Badge>
          </div>
        </div>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная колонка */}
        <div className="lg:col-span-2 space-y-6">
          {/* Статистика профиля */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ProfileStat value="128" label="Публикации" icon="📄" />
            <ProfileStat value="342" label="Спасибо" icon="🙏" />
            <ProfileStat value="12" label="Сделок" icon="🛡️" />
            <ProfileStat value="$8 450" label="Оборот" icon="💰" />
          </div>

          {/* Баланс */}
          <Card variant="gold" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-muted uppercase tracking-wide">
                  Общий баланс
                </p>
                <p className="font-display text-2xl font-bold text-gold-400 mt-1">
                  $2 450.75
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Пополнить</Button>
                <Button variant="secondary" size="sm">Вывод</Button>
              </div>
            </div>
          </Card>

          {/* Достижения */}
          <section>
            <h2 className="font-display text-sm font-bold text-ink mb-3">
              Достижения
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {["🏆 Первая сделка", "💎 10 сделок", "⭐ Любимчик", "🔥 Активный", "🛡️ Надёжный"].map((badge) => (
                <Card key={badge} padding="sm" className="text-center">
                  <span className="text-lg block mb-1">{badge.split(" ")[0]}</span>
                  <p className="text-2xs text-ink-muted">{badge.split(" ").slice(1).join(" ")}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Боковая колонка */}
        <div className="space-y-4">
          {/* Репутация */}
          <Card padding="md">
            <h3 className="font-display text-sm font-bold text-ink mb-3">
              Репутация
            </h3>
            <p className="font-display text-3xl font-bold text-gold-400">1 245</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-ink-muted">
              <span className="text-success">+128 позит.</span>
              <span className="text-danger">-2 негат.</span>
            </div>
          </Card>

          {/* Меню */}
          <Card padding="none">
            {[
              { label: "Обзор", icon: "📋", active: true },
              { label: "Публикации", icon: "📄" },
              { label: "Темы", icon: "💬" },
              { label: "Сообщения", icon: "✉️" },
              { label: "Сделки", icon: "🛡️" },
              { label: "История операций", icon: "📊" },
              { label: "Уведомления", icon: "🔔" },
              { label: "Настройки", icon: "⚙️" },
              { label: "Безопасность", icon: "🔒" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-surface-2 border-b border-line-subtle last:border-0"
              >
                <span>{item.icon}</span>
                <span className={item.active ? "text-gold-300 font-medium" : "text-ink-secondary"}>
                  {item.label}
                </span>
              </button>
            ))}
          </Card>
        </div>
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
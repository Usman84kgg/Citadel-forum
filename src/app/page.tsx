"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdSlots from "@/components/ads/ad-slots";

export default function HomePage() {
  return (
    <div className="space-y-0 pb-8">
      <WelcomeBlock />
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

function WelcomeBlock() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <section className="relative overflow-hidden bg-surface-2 border-b border-line-subtle">
      <img src="/AADEF62D-15DC-44AE-880F-AEBCDF96F03A.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-base via-base/80 to-transparent" />
      <div className="citadel-container relative py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-brand text-ink-muted mb-2">Добро пожаловать в</p>
            <h1 className="citadel-gold-text font-display text-4xl sm:text-5xl font-bold uppercase tracking-wider2 mb-3">CITADEL</h1>
            <p className="text-sm text-ink-secondary max-w-lg leading-relaxed mb-4">Приватное сообщество для общения, безопасных сделок и размещения услуг в одном месте.</p>
            <div className="flex flex-wrap gap-3 mb-4">
              <StatBadge value="12 487" label="Пользователей" />
              <StatBadge value="342" label="Онлайн" />
              <StatBadge value="5 892" label="Тем" />
              <StatBadge value="21 456" label="Сообщений" />
            </div>
          </div>
          {isLoggedIn === false && (
            <div className="lg:justify-self-end">
              <Card variant="gold" padding="lg" className="text-center w-full max-w-xs">
                <img src="/708EF42A-E02E-487F-91D5-F03B44F921D8.png" alt="CITADEL" className="h-12 w-12 mx-auto rounded-xl mb-3" />
                <p className="text-sm text-gold-300 font-display font-semibold mb-2">Стань частью закрытого сообщества</p>
                <p className="text-xs text-ink-muted mb-4">Получи доступ к уникальным возможностям и привилегиям CITADEL</p>
                <a href="/register"><Button className="w-full">Стать участником</Button></a>
              </Card>
            </div>
          )}
          {isLoggedIn === true && (
            <div className="lg:justify-self-end">
              <Card variant="gold" padding="lg" className="text-center w-full max-w-xs">
                <img src="/708EF42A-E02E-487F-91D5-F03B44F921D8.png" alt="CITADEL" className="h-12 w-12 mx-auto rounded-xl mb-3" />
                <p className="text-sm text-gold-300 font-display font-semibold mb-2">Добро пожаловать обратно!</p>
                <p className="text-xs text-ink-muted mb-4">Вы вошли в закрытое сообщество CITADEL</p>
                <a href="/forum/general"><Button className="w-full">Перейти на форум</Button></a>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface/60 backdrop-blur border border-line-subtle rounded-lg px-4 py-2.5">
      <p className="font-display text-lg font-bold text-gold-400">{value}</p>
      <p className="text-2xs text-ink-muted uppercase">{label}</p>
    </div>
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
  const users = [
    { name: "CryptoKing", score: 1245, badge: "VIP" },
    { name: "DarkMaster", score: 980, badge: "Pro" },
    { name: "GhostTrader", score: 856, badge: "VIP" },
    { name: "ShadowDev", score: 742, badge: "Dev" },
    { name: "PixelQueen", score: 631, badge: "Pro" },
  ];

  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="font-display text-sm font-bold text-ink">Топ пользователей</h2>
      </div>
      <Card padding="none">
        {users.map((u, i) => (
          <div key={u.name} className="flex items-center gap-2 px-3 py-2.5 border-b border-line-subtle last:border-0">
            <span className="font-display text-xs text-gold-400 w-5">#{i + 1}</span>
            <div className="h-6 w-6 rounded-full bg-surface-3 flex items-center justify-center text-2xs font-bold text-gold-400">{u.name[0]}</div>
            <span className="flex-1 text-xs text-ink truncate">{u.name}</span>
            <Badge variant={u.badge === "VIP" ? "gold" : "info"} size="sm">{u.badge}</Badge>
            <span className="text-xs font-semibold text-gold-400">{u.score}</span>
          </div>
        ))}
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
    </section>
  );
}

function LatestListings() {
  const listings = [
    { name: "Разработка смарт-контрактов", author: "ShadowDev", time: "2ч", price: "$500" },
    { name: "Дизайн логотипов", author: "PixelQueen", time: "5ч", price: "$150" },
    { name: "Продвижение в Telegram", author: "CryptoKing", time: "8ч", price: "$300" },
    { name: "Видеомонтаж", author: "DarkMaster", time: "12ч", price: "$200" },
  ];

  return (
    <section>
      <h2 className="font-display text-sm font-bold text-ink mb-2">Последние объявления</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {listings.map((l) => (
          <Card key={l.name} variant="interactive" padding="sm">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-surface-3 flex items-center justify-center text-2xs font-bold text-gold-400 shrink-0">{l.author[0]}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink truncate">{l.name}</p>
                <p className="text-2xs text-ink-muted">{l.author} · {l.time}</p>
                <p className="text-xs font-semibold text-gold-400 mt-0.5">{l.price}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
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
    </section>
  );
}
import { ESCROW_RULES } from "@/lib/config/site";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ==========================================================
// CITADEL — Главная страница
//
// В точности по макету:
//   1. Приветственный блок с замком и счётчиками
//   2. Объявление
//   3. Разделы форума (сетка 11 карточек)
//   4. Полоса статистики
//   5. Топ пользователей
//   6. Последние сделки
//   7. Последние объявления
//   8. Онлайн сейчас
// ==========================================================

export default function HomePage() {
  return (
    <div className="citadel-container py-6 space-y-6">
      {/* 1. Приветственный блок */}
      <WelcomeBlock />

      {/* 2. Объявление */}
      <AnnouncementBar />

      {/* 3. Разделы форума + правая колонка */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ForumSections />
        </div>
        <div className="space-y-6">
          <TopUsers />
          <LatestDeals />
        </div>
      </div>

      {/* 4. Статистика */}
      <StatsStrip />

      {/* 5. Последние объявления */}
      <LatestListings />

      {/* 6. Онлайн сейчас */}
      <OnlineNow />
    </div>
  );
}

// ==========================================================

function WelcomeBlock() {
  return (
    <div className="citadel-card bg-surface border border-line-gold shadow-gold relative overflow-hidden p-7">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-gold-500/5 to-transparent pointer-events-none" />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <p className="text-xs uppercase tracking-brand text-ink-muted mb-3">
            Добро пожаловать в
          </p>
          <h1 className="citadel-gold-text font-display text-4xl sm:text-5xl font-bold uppercase tracking-wider2 mb-4">
            CITADEL
          </h1>
          <p className="text-sm text-ink-secondary max-w-md leading-relaxed mb-6">
            Приватное сообщество для общения, безопасных сделок и размещения
            услуг в одном месте.
          </p>
          <div className="inline-block rounded-control border border-line-gold bg-gold-500/10 px-6 py-3 text-sm font-medium text-gold-300">
            Стать участником
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatBox value="2 458" label="Пользователей" />
          <StatBox value="15 320" label="Сообщений" />
          <StatBox value="842" label="Тем" />
          <StatBox value="127" label="Онлайн" />
        </div>
      </div>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="citadel-card bg-surface-2 px-4 py-3 text-center">
      <p className="font-display text-xl font-bold text-gold-400">{value}</p>
      <p className="text-2xs text-ink-muted mt-1 uppercase">{label}</p>
    </div>
  );
}

function AnnouncementBar() {
  return (
    <Card className="flex items-center gap-3">
      <span className="text-xl">👑</span>
      <div className="flex-1">
        <p className="text-sm text-gold-300 font-medium">
          Важное объявление для всех участников сообщества
        </p>
        <p className="text-xs text-ink-muted mt-0.5">
          Ознакомьтесь с обновлёнными правилами платформы
        </p>
      </div>
      <Button variant="ghost" size="sm">
        Подробнее →
      </Button>
    </Card>
  );
}

// Заглушка разделов форума
function ForumSections() {
  const sections = [
    { name: "Новости и правила", desc: "Официальные объявления и правила сообщества", threads: 124, posts: 1890, icon: "📢" },
    { name: "Общий раздел", desc: "Свободное общение на любые темы", threads: 456, posts: 8230, icon: "💬" },
    { name: "Маркет услуг", desc: "Услуги и цифровые товары", threads: 89, posts: 1240, icon: "🏪" },
    { name: "Гарант-сервис", desc: "Безопасные сделки и обсуждение", threads: 45, posts: 670, icon: "🛡️" },
    { name: "Криптовалюты", desc: "Блокчейн, трейдинг, инвестиции", threads: 230, posts: 4100, icon: "₿" },
    { name: "Разработка", desc: "Программирование и технологии", threads: 98, posts: 1560, icon: "⚙️" },
    { name: "Дизайн", desc: "Графика, UI/UX, брендинг", threads: 67, posts: 890, icon: "🎨" },
    { name: "Безопасность", desc: "Защита данных и анонимность", threads: 34, posts: 520, icon: "🔒" },
    { name: "Ресурсы", desc: "Полезные материалы и инструменты", threads: 56, posts: 780, icon: "📚" },
    { name: "Флудилка", desc: "Развлекательный раздел", threads: 312, posts: 5600, icon: "🎯" },
  ];

  return (
    <section>
      <h2 className="font-display text-xl font-bold text-ink mb-4">
        Основные разделы
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map((s) => (
          <Card key={s.name} variant="interactive" padding="md">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">
                  {s.name}
                </p>
                <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
                  {s.desc}
                </p>
                <div className="flex items-center gap-4 mt-2 text-2xs text-ink-faint">
                  <span>Тем: {s.threads}</span>
                  <span>Сооб: {s.posts}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* VIP-раздел */}
        <Card variant="gold" padding="md" className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gold-400">
                VIP-раздел
              </p>
              <Badge variant="gold">VIP</Badge>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Закрытый раздел для привилегированных участников
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}

// Заглушка статистики
function StatsStrip() {
  return (
    <Card className="flex flex-wrap items-center justify-around gap-4 py-4">
      <StatItem value="2 458" label="Пользователей" />
      <StatItem value="15 320" label="Сообщений" />
      <StatItem value="842" label="Тем" />
      <StatItem value="127" label="Онлайн" />
    </Card>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-xl font-bold text-gold-400">{value}</p>
      <p className="text-2xs text-ink-muted uppercase mt-1">{label}</p>
    </div>
  );
}

// Заглушка топа пользователей
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
      <h2 className="font-display text-lg font-bold text-ink mb-3">
        Топ пользователей
      </h2>
      <Card padding="none">
        {users.map((u, i) => (
          <div
            key={u.name}
            className="flex items-center gap-3 px-4 py-3 border-b border-line-subtle last:border-0 hover:bg-surface-2 transition-colors"
          >
            <span className="font-display text-sm text-gold-400 w-6">
              #{i + 1}
            </span>
            <div className="h-7 w-7 rounded-full bg-surface-3 border border-line-subtle flex items-center justify-center text-xs font-medium text-gold-400">
              {u.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{u.name}</p>
            </div>
            <Badge variant={u.badge === "VIP" ? "gold" : "info"}>{u.badge}</Badge>
            <span className="text-sm font-semibold text-gold-400">
              {u.score}
            </span>
          </div>
        ))}
      </Card>
    </section>
  );
}

// Заглушка последних сделок
function LatestDeals() {
  const deals = [
    { name: "Дизайн лендинга", from: "CryptoKing", to: "PixelQueen", amount: "$250", status: "finished" },
    { name: "Аудит безопасности", from: "DarkMaster", to: "GhostTrader", amount: "$1 200", status: "active" },
    { name: "Разработка бота", from: "ShadowDev", to: "CryptoKing", amount: "$800", status: "active" },
  ];

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink mb-3">
        Последние сделки
      </h2>
      <Card padding="none">
        {deals.map((d) => (
          <div
            key={d.name}
            className="flex items-center gap-3 px-4 py-3 border-b border-line-subtle last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {d.name}
              </p>
              <p className="text-2xs text-ink-muted">
                {d.from} → {d.to}
              </p>
            </div>
            <span className="text-sm font-semibold text-ink">{d.amount}</span>
            <Badge variant={d.status === "finished" ? "success" : "info"}>
              {d.status === "finished" ? "Завершена" : "Активна"}
            </Badge>
          </div>
        ))}
      </Card>
    </section>
  );
}

// Заглушка последних объявлений
function LatestListings() {
  const listings = [
    { name: "Разработка смарт-контрактов", author: "ShadowDev", time: "2 часа назад", price: "$500" },
    { name: "Дизайн логотипов", author: "PixelQueen", time: "5 часов назад", price: "$150" },
    { name: "Продвижение в Telegram", author: "CryptoKing", time: "8 часов назад", price: "$300" },
    { name: "Видеомонтаж", author: "DarkMaster", time: "12 часов назад", price: "$200" },
  ];

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink mb-3">
        Последние объявления
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {listings.map((l) => (
          <Card key={l.name} variant="interactive" padding="md">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-surface-3 border border-line-subtle flex items-center justify-center text-xs font-medium text-gold-400 shrink-0">
                {l.author[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {l.name}
                </p>
                <p className="text-2xs text-ink-muted mt-0.5">
                  {l.author} · {l.time}
                </p>
                <p className="text-sm font-semibold text-gold-400 mt-1">
                  {l.price}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

// Заглушка «Онлайн сейчас»
function OnlineNow() {
  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink mb-3">
        Онлайн сейчас
      </h2>
      <Card className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full bg-surface-3 border-2 border-surface flex items-center justify-center text-2xs font-medium text-gold-400"
            >
              U
            </div>
          ))}
        </div>
        <span className="text-sm text-ink-muted">+334</span>
        <Badge variant="success">127 онлайн</Badge>
      </Card>
    </section>
  );
}
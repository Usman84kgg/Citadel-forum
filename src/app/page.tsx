import { ESCROW_RULES } from "@/lib/config/site";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="citadel-container py-4 space-y-4">
      {/* Рекламный блок */}
      <AdBanner />

      {/* Приветственный блок + правая колонка */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WelcomeBlock />
        </div>
        <div className="space-y-4">
          <StatsCompact />
          <TopUsers />
        </div>
      </div>

      {/* Объявление */}
      <AnnouncementBar />

      {/* Разделы форума */}
      <ForumSections />

      {/* Последние сделки + объявления */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LatestDeals />
        <LatestListings />
      </div>

      {/* Онлайн */}
      <OnlineNow />
    </div>
  );
}

// ==========================================================
// РЕКЛАМНЫЙ БЛОК (управляется через админ-панель)
// ==========================================================
function AdBanner() {
  return (
    <div className="citadel-card bg-surface border border-dashed border-line-strong flex items-center justify-center h-20 text-ink-faint text-xs uppercase tracking-wide">
      Реклама — настраивается в админ-панели
    </div>
  );
}

// ==========================================================
// ПРИВЕТСТВЕННЫЙ БЛОК (уменьшенный)
// ==========================================================
function WelcomeBlock() {
  return (
    <Card variant="gold" padding="md" className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-gold-500/5 to-transparent pointer-events-none" />
      <div className="relative flex items-center gap-4">
        <div className="flex-1">
          <p className="text-2xs uppercase tracking-brand text-ink-muted mb-1">
            Добро пожаловать в
          </p>
          <h1 className="citadel-gold-text font-display text-2xl sm:text-3xl font-bold uppercase tracking-wider2 mb-1.5">
            CITADEL
          </h1>
          <p className="text-xs text-ink-secondary leading-relaxed mb-3 max-w-sm">
            Приватное сообщество для общения, безопасных сделок и размещения услуг в одном месте.
          </p>
          <Button size="sm">Стать участником</Button>
        </div>
        <div className="hidden sm:grid grid-cols-2 gap-2">
          <MiniStat value="2 458" label="Польз." />
          <MiniStat value="15 320" label="Сооб." />
          <MiniStat value="842" label="Тем" />
          <MiniStat value="127" label="Онлайн" />
        </div>
      </div>
    </Card>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface-2 rounded-lg px-3 py-2 text-center">
      <p className="font-display text-base font-bold text-gold-400">{value}</p>
      <p className="text-2xs text-ink-muted">{label}</p>
    </div>
  );
}

// ==========================================================
// КОМПАКТНАЯ СТАТИСТИКА
// ==========================================================
function StatsCompact() {
  return (
    <Card padding="md">
      <div className="grid grid-cols-2 gap-2">
        <MiniStat value="2 458" label="Пользователей" />
        <MiniStat value="15 320" label="Сообщений" />
        <MiniStat value="842" label="Тем" />
        <MiniStat value="127" label="Онлайн" />
      </div>
    </Card>
  );
}

// ==========================================================
// ОБЪЯВЛЕНИЕ
// ==========================================================
function AnnouncementBar() {
  return (
    <Card padding="sm" className="flex items-center gap-3">
      <span className="text-lg">👑</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gold-300 font-medium truncate">
          Важное объявление для всех участников сообщества
        </p>
        <p className="text-2xs text-ink-muted truncate">
          Ознакомьтесь с обновлёнными правилами платформы
        </p>
      </div>
      <Button variant="ghost" size="sm">Подробнее →</Button>
    </Card>
  );
}

// ==========================================================
// РАЗДЕЛЫ ФОРУМА
// ==========================================================
function ForumSections() {
  const sections = [
    { name: "Новости и правила", desc: "Официальные объявления и правила", threads: 124, posts: 1890, icon: "📢" },
    { name: "Общий раздел", desc: "Свободное общение на любые темы", threads: 456, posts: 8230, icon: "💬" },
    { name: "Маркет услуг", desc: "Услуги и цифровые товары", threads: 89, posts: 1240, icon: "🏪" },
    { name: "Гарант-сервис", desc: "Безопасные сделки", threads: 45, posts: 670, icon: "🛡️" },
    { name: "Криптовалюты", desc: "Блокчейн, трейдинг, инвестиции", threads: 230, posts: 4100, icon: "₿" },
    { name: "Разработка", desc: "Программирование и технологии", threads: 98, posts: 1560, icon: "⚙️" },
    { name: "Дизайн", desc: "Графика, UI/UX, брендинг", threads: 67, posts: 890, icon: "🎨" },
    { name: "Безопасность", desc: "Защита данных и анонимность", threads: 34, posts: 520, icon: "🔒" },
    { name: "Ресурсы", desc: "Полезные материалы и инструменты", threads: 56, posts: 780, icon: "📚" },
    { name: "Флудилка", desc: "Развлекательный раздел", threads: 312, posts: 5600, icon: "🎯" },
  ];

  return (
    <section>
      <h2 className="font-display text-base font-bold text-ink mb-3">Основные разделы</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {sections.map((s) => (
          <Card key={s.name} variant="interactive" padding="sm">
            <span className="text-lg">{s.icon}</span>
            <p className="text-xs font-semibold text-ink mt-1.5 truncate">{s.name}</p>
            <p className="text-2xs text-ink-muted mt-0.5 line-clamp-1">{s.desc}</p>
            <p className="text-2xs text-ink-faint mt-1">Тем: {s.threads} · Сооб: {s.posts}</p>
          </Card>
        ))}
        <Card variant="gold" padding="sm">
          <span className="text-lg">🔒</span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <p className="text-xs font-semibold text-gold-400 truncate">VIP-раздел</p>
            <Badge variant="gold" size="sm">VIP</Badge>
          </div>
          <p className="text-2xs text-ink-muted mt-0.5">Закрытый раздел</p>
        </Card>
      </div>
    </section>
  );
}

// ==========================================================
// ТОП ПОЛЬЗОВАТЕЛЕЙ
// ==========================================================
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
      <h2 className="font-display text-sm font-bold text-ink mb-2">Топ пользователей</h2>
      <Card padding="none">
        {users.map((u, i) => (
          <div key={u.name} className="flex items-center gap-2 px-3 py-2 border-b border-line-subtle last:border-0">
            <span className="font-display text-xs text-gold-400 w-5">#{i + 1}</span>
            <div className="h-6 w-6 rounded-full bg-surface-3 border border-line-subtle flex items-center justify-center text-2xs font-medium text-gold-400">{u.name[0]}</div>
            <span className="flex-1 text-xs text-ink truncate">{u.name}</span>
            <Badge variant={u.badge === "VIP" ? "gold" : "info"} size="sm">{u.badge}</Badge>
            <span className="text-xs font-semibold text-gold-400">{u.score}</span>
          </div>
        ))}
      </Card>
    </section>
  );
}

// ==========================================================
// ПОСЛЕДНИЕ СДЕЛКИ
// ==========================================================
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
          <div key={d.name} className="flex items-center gap-2 px-3 py-2 border-b border-line-subtle last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink truncate">{d.name}</p>
              <p className="text-2xs text-ink-muted">{d.from} → {d.to}</p>
            </div>
            <span className="text-xs font-semibold text-ink">{d.amount}</span>
            <Badge variant={d.status === "finished" ? "success" : "info"} size="sm">
              {d.status === "finished" ? "Заверш." : "Актив."}
            </Badge>
          </div>
        ))}
      </Card>
    </section>
  );
}

// ==========================================================
// ПОСЛЕДНИЕ ОБЪЯВЛЕНИЯ
// ==========================================================
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
      <div className="grid grid-cols-2 gap-2">
        {listings.map((l) => (
          <Card key={l.name} variant="interactive" padding="sm">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-surface-3 border border-line-subtle flex items-center justify-center text-2xs font-medium text-gold-400 shrink-0">{l.author[0]}</div>
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

// ==========================================================
// ОНЛАЙН СЕЙЧАС
// ==========================================================
function OnlineNow() {
  return (
    <section>
      <h2 className="font-display text-sm font-bold text-ink mb-2">Онлайн сейчас</h2>
      <Card padding="sm" className="flex items-center gap-3">
        <div className="flex -space-x-1.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 w-6 rounded-full bg-surface-3 border-2 border-surface flex items-center justify-center text-2xs font-medium text-gold-400">U</div>
          ))}
        </div>
        <span className="text-xs text-ink-muted">+334</span>
        <Badge variant="success" size="sm">127 онлайн</Badge>
      </Card>
    </section>
  );
}
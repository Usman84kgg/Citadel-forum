import { ESCROW_RULES } from "@/lib/config/site";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="space-y-0 pb-8">
      {/* Реклама */}
      <div className="citadel-container py-2">
        <div className="citadel-card bg-surface border border-dashed border-line-strong flex items-center justify-center h-16 text-ink-faint text-xs uppercase tracking-wide">
          Реклама — настраивается в админ-панели
        </div>
      </div>

      <WelcomeBlock />
      <div className="citadel-container space-y-4">
        <AnnouncementBar />
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

// ==========================================================
function WelcomeBlock() {
  return (
    <section className="relative overflow-hidden bg-surface-2 border-b border-line-subtle">
      <img
        src="/AADEF62D-15DC-44AE-880F-AEBCDF96F03A.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-base via-base/80 to-transparent" />

      <div className="citadel-container relative py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-brand text-ink-muted mb-2">
              Добро пожаловать в
            </p>
            <h1 className="citadel-gold-text font-display text-4xl sm:text-5xl font-bold uppercase tracking-wider2 mb-3">
              CITADEL
            </h1>
            <p className="text-sm text-ink-secondary max-w-lg leading-relaxed mb-4">
              Приватное сообщество для общения, безопасных сделок и размещения услуг в одном месте.
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              <StatBadge value="12 487" label="Пользователей" />
              <StatBadge value="342" label="Онлайн" />
              <StatBadge value="5 892" label="Тем" />
              <StatBadge value="21 456" label="Сообщений" />
            </div>
          </div>

          {/* Карточка "Стать участником" */}
          <div className="lg:justify-self-end">
            <Card variant="gold" padding="lg" className="text-center w-full max-w-xs">
              <img
                src="/708EF42A-E02E-487F-91D5-F03B44F921D8.png"
                alt="CITADEL"
                className="h-12 w-12 mx-auto rounded-xl mb-3"
              />
              <p className="text-sm text-gold-300 font-display font-semibold mb-2">
                Стань частью закрытого сообщества
              </p>
              <p className="text-xs text-ink-muted mb-4">
                Получи доступ к уникальным возможностям и привилегиям CITADEL
              </p>
              <a href="/register">
                <Button className="w-full">Стать участником</Button>
              </a>
            </Card>
          </div>
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
function ForumSections() {
  const sections = [
    { name: "Общий раздел", desc: "Свободное общение на любые темы", threads: 456, posts: 8230, slug: "general", icon: "💬" },
    { name: "Новости платформы", desc: "Официальные новости и важные объявления", threads: 124, posts: 1890, slug: "news", icon: "📢" },
    { name: "Правила и FAQ", desc: "Правила сообщества и ответы на вопросы", threads: 56, posts: 420, slug: "rules", icon: "📋" },
    { name: "Маркет услуг", desc: "Услуги и цифровые товары от участников", threads: 67, posts: 890, slug: "market", icon: "🏪" },
    { name: "Гарант-сервис", desc: "Безопасные сделки через гаранта", threads: 45, posts: 670, slug: "escrow", icon: "🛡️" },
    { name: "Вакансии", desc: "Поиск работы и исполнителей", threads: 89, posts: 1240, slug: "vacancies", icon: "💼" },
    { name: "Резюме", desc: "Портфолио и предложения специалистов", threads: 34, posts: 520, slug: "resumes", icon: "📄" },
    { name: "Халява", desc: "Бесплатные материалы, курсы, раздачи", threads: 78, posts: 1560, slug: "freebies", icon: "🎁" },
    { name: "Чат", desc: "Мгновенное общение в реальном времени", threads: 312, posts: 5600, slug: "chat", icon: "⚡" },
    { name: "Предложения и идеи", desc: "Идеи и улучшения для сообщества", threads: 89, posts: 1240, slug: "ideas", icon: "💡" },
    { name: "Работа и сотрудничество", desc: "Поиск партнёров и проекты", threads: 98, posts: 1560, slug: "work", icon: "🤝" },
    { name: "Техническая поддержка", desc: "Помощь и ответы на вопросы", threads: 34, posts: 520, slug: "support", icon: "🎧" },
    { name: "Ресурсы и инструменты", desc: "Полезные материалы и руководства", threads: 56, posts: 780, slug: "resources", icon: "📚" },
    { name: "VIP-раздел", desc: "Закрытый раздел для привилегированных", threads: 12, posts: 340, slug: "vip", icon: "🔒", isVip: true },
  ];

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink mb-3">Основные разделы</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sections.map((s) => (
          <a key={s.slug} href={`/forum/${s.slug}`}>
            <Card variant={s.isVip ? "gold" : "interactive"} padding="sm">
              <div className="flex items-start gap-3">
                <span className="text-xl">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink truncate">{s.name}</p>
                    {s.isVip && <Badge variant="gold" size="sm">VIP</Badge>}
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{s.desc}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-2xs text-ink-faint">
                    <span>Тем: {s.threads}</span>
                    <span>Сооб: {s.posts}</span>
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
      <div className="flex items-center gap-3 mb-2">
        <h2 className="font-display text-sm font-bold text-ink">Топ пользователей</h2>
        <div className="flex gap-1">
          {["Неделя","Месяц","Год"].map((t) => (
            <button key={t} className="text-2xs px-2 py-0.5 rounded-full bg-surface-2 text-ink-muted hover:text-ink transition-colors">{t}</button>
          ))}
        </div>
      </div>
      <Card padding="none">
        {users.map((u, i) => (
          <div key={u.name} className="flex items-center gap-2 px-3 py-2.5 border-b border-line-subtle last:border-0">
            <span className="font-display text-xs text-gold-400 w-5">#{i+1}</span>
            <div className="h-6 w-6 rounded-full bg-surface-3 flex items-center justify-center text-2xs font-bold text-gold-400">{u.name[0]}</div>
            <span className="flex-1 text-xs text-ink truncate">{u.name}</span>
            <Badge variant={u.badge==="VIP"?"gold":"info"} size="sm">{u.badge}</Badge>
            <span className="text-xs font-semibold text-gold-400">{u.score}</span>
          </div>
        ))}
      </Card>
    </section>
  );
}

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
          <div key={d.name} className="flex items-center gap-2 px-3 py-2.5 border-b border-line-subtle last:border-0">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink truncate">{d.name}</p>
              <p className="text-2xs text-ink-muted">{d.from} → {d.to}</p>
            </div>
            <span className="text-xs font-semibold text-ink">{d.amount}</span>
            <Badge variant={d.status==="finished"?"success":"info"} size="sm">
              {d.status==="finished"?"Заверш.":"Актив."}
            </Badge>
          </div>
        ))}
      </Card>
    </section>
  );
}

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

// ==========================================================
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
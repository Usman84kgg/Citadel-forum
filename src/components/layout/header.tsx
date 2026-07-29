import Link from "next/link";
import { SITE, MAIN_NAV } from "@/lib/config/site";

const NAV_ICONS: Record<string, string> = {
  home: "🏰", forum: "💬", users: "👥", escrow: "🛡️",
  market: "🏪", wallet: "💰", resources: "📚", support: "🎧",
};

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line-subtle bg-base/95 backdrop-blur-md">
      <div className="citadel-container flex h-16 items-center gap-3">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/708EF42A-E02E-487F-91D5-F03B44F921D8.png"
            alt="CITADEL"
            className="h-9 w-9 rounded-lg"
          />
          <div className="hidden lg:block leading-tight">
            <p className="font-display text-sm font-bold uppercase tracking-brand text-gold-400">
              {SITE.name}
            </p>
            <p className="text-2xs uppercase tracking-brand text-ink-faint">
              {SITE.tagline}
            </p>
          </div>
        </Link>

        {/* Меню */}
        <nav className="hidden lg:flex items-center gap-0.5 ml-2">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-2 rounded-control transition-colors"
            >
              <span>{NAV_ICONS[item.key]}</span>
              <span>{item.labelRu}</span>
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Поиск */}
        <div className="hidden xl:flex w-56">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Поиск по форуму..."
              className="w-full h-9 rounded-control bg-surface border border-line-subtle pl-3 pr-12 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400 transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-2xs bg-surface-2 border border-line-subtle text-ink-muted">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Иконки + профиль */}
        <div className="flex items-center gap-1">
          <button className="relative p-2 rounded-control hover:bg-surface-2 transition-colors" aria-label="Сообщения">
            <span className="text-base">✉️</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 text-black text-2xs font-bold px-1">3</span>
          </button>

          <button className="relative p-2 rounded-control hover:bg-surface-2 transition-colors" aria-label="Уведомления">
            <span className="text-base">🔔</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger text-white text-2xs font-bold px-1">12</span>
          </button>

          <button className="flex items-center gap-2 p-1.5 rounded-control hover:bg-surface-2 transition-colors">
            <div className="h-8 w-8 rounded-full bg-surface-3 border border-line-subtle flex items-center justify-center text-xs font-bold text-gold-400">U</div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-medium text-ink">CitadelUser</p>
              <p className="text-2xs text-ink-muted">Administrator</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
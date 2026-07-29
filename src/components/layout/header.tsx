import Link from "next/link";
import { SITE, MAIN_NAV } from "@/lib/config/site";

// ==========================================================
// CITADEL — Header
//
// Шапка сайта: логотип, поиск, уведомления, меню пользователя.
// В точности как на макете:
//   слева  — логотип CITADEL
//   центр  — поиск (Ctrl+K)
//   справа — конверт (3), колокольчик (12), аватар с именем и ролью
// ==========================================================

export function Header() {
  return (
    <header className="sticky top-0 z-[var(--citadel-z-header)] border-b border-line-subtle bg-base/95 backdrop-blur-md">
      <div className="citadel-container flex h-[var(--citadel-header-height)] items-center justify-between gap-4">
        {/* --- Логотип --- */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong bg-surface-2 shadow-gold">
            <span className="font-display text-xl font-bold text-gold-400">
              C
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-base font-bold uppercase tracking-brand text-gold-400">
              {SITE.name}
            </p>
            <p className="text-2xs uppercase tracking-brand text-ink-faint">
              {SITE.tagline}
            </p>
          </div>
        </Link>

        {/* --- Поиск --- */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-sm">
              🔍
            </span>
            <input
              type="search"
              placeholder="Поиск по форуму и маркету..."
              className="w-full h-10 rounded-control bg-surface border border-line-subtle pl-10 pr-16 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400 transition-colors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-2xs bg-surface-2 border border-line-subtle text-ink-muted">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* --- Иконки справа --- */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Сообщения */}
          <button className="relative p-2 rounded-control hover:bg-surface-2 transition-colors" aria-label="Сообщения">
            <span className="text-lg">✉️</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 text-black text-2xs font-bold px-1">
              3
            </span>
          </button>

          {/* Уведомления */}
          <button className="relative p-2 rounded-control hover:bg-surface-2 transition-colors" aria-label="Уведомления">
            <span className="text-lg">🔔</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger text-white text-2xs font-bold px-1">
              12
            </span>
          </button>

          {/* Профиль */}
          <button className="flex items-center gap-2 p-1.5 rounded-control hover:bg-surface-2 transition-colors">
            <div className="h-8 w-8 rounded-full bg-surface-3 border border-line-subtle flex items-center justify-center text-sm font-medium text-gold-400">
              U
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-ink leading-none">
                Usman84
              </p>
              <p className="text-2xs text-ink-muted">Участник</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
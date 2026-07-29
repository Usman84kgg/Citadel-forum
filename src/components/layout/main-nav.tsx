import Link from "next/link";
import { MAIN_NAV } from "@/lib/config/site";

// ==========================================================
// CITADEL — Главное меню
//
// 8 разделов из макета:
//   Главная, Форум, Пользователи, Гарант,
//   Маркет, Кошелёк, Ресурсы, Поддержка
//
// Активный пункт подсвечен золотом.
// ==========================================================

// Иконки для каждого раздела (текстовые символы)
const NAV_ICONS: Record<string, string> = {
  home: "🏰",
  forum: "💬",
  users: "👥",
  escrow: "🛡️",
  market: "🏪",
  wallet: "💰",
  resources: "📚",
  support: "🎧",
};

export function MainNav({ active }: { active?: string }) {
  return (
    <nav className="border-b border-line-subtle bg-surface">
      <div className="citadel-container">
        <ul className="flex h-[var(--citadel-nav-height)] items-center gap-0 overflow-x-auto scrollbar-none">
          {MAIN_NAV.map((item) => {
            const isActive = active === item.key;

            return (
              <li key={item.key} className="shrink-0">
                <Link
                  href={item.href}
                  className={[
                    "flex items-center gap-2 px-4 h-[var(--citadel-nav-height)] text-sm font-medium transition-colors duration-200",
                    "border-b-2",
                    isActive
                      ? "border-gold-400 text-gold-300"
                      : "border-transparent text-ink-muted hover:text-ink hover:border-line-strong",
                  ].join(" ")}
                >
                  <span className="text-base">{NAV_ICONS[item.key]}</span>
                  <span className="hidden sm:inline">{item.labelRu}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
import Link from "next/link";
import { SITE } from "@/lib/config/site";

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
            <p className="font-display text-sm font-bold uppercase tracking-brand text-gold-400">{SITE.name}</p>
            <p className="text-2xs uppercase tracking-brand text-ink-faint">{SITE.tagline}</p>
          </div>
        </Link>

        {/* Навигация */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          <NavLink href="/forum/general">Форум</NavLink>
          <NavLink href="/market">Маркет</NavLink>
          <NavLink href="/escrow">Гарант</NavLink>
          <NavLink href="/wallet">Кошелёк</NavLink>
        </nav>

        <div className="flex-1" />

        {/* Профиль и админка */}
        <div className="flex items-center gap-2">
          <NavLink href="/admin">Админка</NavLink>
          <NavLink href="/profile">Профиль</NavLink>
          <Link href="/login" className="text-xs text-gold-400 hover:text-gold-300 px-2 py-1 rounded-control hover:bg-surface-2 transition-colors">Войти</Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-2 px-2.5 py-1.5 rounded-control transition-colors"
    >
      {children}
    </Link>
  );
}
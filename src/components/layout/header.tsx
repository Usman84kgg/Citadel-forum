"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SITE } from "@/lib/config/site";

type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: string;
  avatarUrl: string | null;
} | null;

const UNKNOWN = undefined as unknown as AuthUser;

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser>(UNKNOWN);
  const [loggingOut, setLoggingOut] = useState(false);

  const refreshUser = useCallback(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  // Хедер живёт в корневом layout и не размонтируется при переходах
  // между страницами, поэтому проверяем сессию заново при каждой смене
  // маршрута — иначе после входа/выхода шапка показывает старое состояние.
  useEffect(() => {
    refreshUser();
  }, [pathname, refreshUser]);

  // На iOS Safari страница может восстановиться из bfcache со старым
  // снимком DOM. В этом случае тоже нужно перепроверить сессию.
  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) refreshUser();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [refreshUser]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setLoggingOut(false);
    router.push("/");
    router.refresh();
  }

  const authReady = user !== UNKNOWN;
  const isAdmin = !!user && (user.role === "owner" || user.role === "admin");

  return (
    <header className="sticky top-0 z-50 border-b border-line-subtle bg-base/95 backdrop-blur-md">
      <div className="citadel-container flex h-16 items-center gap-3">
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

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          <NavLink href="/forum/general">Форум</NavLink>
          <NavLink href="/market">Маркет</NavLink>
          <NavLink href="/escrow">Гарант</NavLink>
          <NavLink href="/wallet">Кошелёк</NavLink>
        </nav>

        <div className="flex-1" />

        {authReady && (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && <NavLink href="/admin">Админка</NavLink>}
                <NavLink href="/profile">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-surface-3 text-2xs font-bold text-gold-400">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        user.username?.charAt(0).toUpperCase() ?? "U"
                      )}
                    </span>
                    {user.username}
                  </span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-xs text-ink-muted hover:text-ink hover:bg-surface-2 px-2.5 py-1.5 rounded-control transition-colors disabled:opacity-50"
                >
                  {loggingOut ? "Выход..." : "Выйти"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="text-xs font-medium text-gold-400 hover:text-gold-300 px-2.5 py-1.5 rounded-control border border-line-gold hover:bg-surface-2 transition-colors"
                >
                  Стать участником
                </Link>
                <Link
                  href="/login"
                  className="text-xs text-ink-muted hover:text-ink hover:bg-surface-2 px-2.5 py-1.5 rounded-control transition-colors"
                >
                  Войти
                </Link>
              </>
            )}
          </div>
        )}
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
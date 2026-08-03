"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SITE } from "@/lib/config/site";
import { MenuDrawer } from "./menu-drawer";
import { NotificationsBell } from "./notifications-bell";

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
  const [menuOpen, setMenuOpen] = useState(false);

  const refreshUser = useCallback(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    refreshUser();
  }, [pathname, refreshUser]);

  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) refreshUser();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [refreshUser]);

  const authReady = user !== UNKNOWN;
  const isAdmin = !!user && (user.role === "owner" || user.role === "admin");

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line-subtle bg-base/95 backdrop-blur-md">
        <div className="citadel-container flex h-16 items-center justify-between">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 text-ink-muted hover:text-ink transition-colors"
            aria-label="Меню"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <img
              src="/FBE5C086-8E99-40FA-9134-A73FC1ACE591.png"
              alt="XALISKO GLOBAL"
              className="h-9 w-9 rounded-lg"
            />
          </Link>

          <div className="flex items-center gap-1">
            {authReady && user && <NotificationsBell />}
            <Link href="/search" className="p-2 text-ink-muted hover:text-ink transition-colors" aria-label="Поиск">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
                <path d="M20 20L16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>

        {authReady && isAdmin && (
          <div className="citadel-container flex items-center justify-end gap-2 pb-2">
            <Link
              href="/admin"
              className="text-xs font-medium text-gold-400 hover:text-gold-300 px-2.5 py-1 rounded-control border border-line-gold transition-colors"
            >
              Админка
            </Link>
          </div>
        )}
      </header>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
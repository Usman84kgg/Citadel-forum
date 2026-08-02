"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: string;
  avatarUrl: string | null;
} | null;

const UNKNOWN = undefined as unknown as AuthUser;

export function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser>(UNKNOWN);

  const refreshUser = useCallback(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    refreshUser();
  }, [pathname, refreshUser]);

  const authReady = user !== UNKNOWN;

  if (!authReady) {
    return <div className="h-14" />;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line-subtle bg-base/95 backdrop-blur-md">
      <div className="citadel-container flex items-center justify-around h-14">
        {user ? (
          <>
            <NavItem href="/" icon={HomeIcon} label="Главная" active={pathname === "/"} />
            <NavItem href="/market" icon={GridIcon} label="Каталог" active={pathname.startsWith("/market")} />
            <CreateButton />
            <NavItem href="/chat" icon={ChatIcon} label="Чат" active={pathname.startsWith("/chat")} />
            <NavItem href="/profile" icon={UserIcon} label="Профиль" active={pathname.startsWith("/profile")} />
          </>
        ) : (
          <>
            <NavItem href="/" icon={HomeIcon} label="Главная" active={pathname === "/"} />
            <NavItem href="/market" icon={GridIcon} label="Маркет" active={pathname.startsWith("/market")} />
            <NavItem href="/login" icon={LoginIcon} label="Вход" active={pathname.startsWith("/login")} />
          </>
        )}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: (props: { active: boolean }) => React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
        active ? "text-gold-400" : "text-ink-muted hover:text-ink"
      }`}
    >
      <Icon active={active} />
      <span className="text-2xs">{label}</span>
    </Link>
  );
}

function CreateButton() {
  return (
    <Link
      href="/publish"
      className="flex items-center justify-center shrink-0 -mt-5"
    >
      <span className="flex items-center justify-center h-11 w-11 rounded-full bg-gold-400 text-black shadow-gold-strong">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
    </Link>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5L12 4L20 10.5V19C20 19.55 19.55 20 19 20H15C14.45 20 14 19.55 14 19V15C14 14.45 13.55 14 13 14H11C10.45 14 10 14.45 10 15V19C10 19.55 9.55 20 9 20H5C4.45 20 4 19.55 4 19V10.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
      />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <rect x="13" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <rect x="4" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <rect x="13" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5H20V16H9L5 19.5V16H4V5Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <path
        d="M5 20C5 16.5 8 14 12 14C16 14 19 16.5 19 20"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoginIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M11 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.9 20 6 20H11"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
      <path
        d="M15 8L19 12L15 16"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M19 12H9" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
    </svg>
  );
}
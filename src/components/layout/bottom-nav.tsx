"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProfileDrawer } from "@/components/layout/profile-drawer";

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
  const [profileOpen, setProfileOpen] = useState(false);

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
    return <div className="h-14 pb-[env(safe-area-inset-bottom)]" />;
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line-subtle bg-base/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="citadel-container h-14">
          {user ? (
            <div className="grid grid-cols-5 items-center h-full">
              <NavItem href="/" icon={HomeIcon} label="Главная" active={pathname === "/"} />
              <NavItem href="/wallet" icon={WalletIcon} label="Кошелёк" active={pathname.startsWith("/wallet")} />
              <CreateButton />
              <NavItem href="/market" icon={GridIcon} label="Маркет" active={pathname.startsWith("/market")} />
              <button
                onClick={() => setProfileOpen(true)}
                className={`flex flex-col items-center justify-center gap-0.5 h-full transition-colors w-full ${
                  profileOpen ? "text-gold-400" : "text-ink-muted hover:text-ink"
                }`}
              >
                <UserIcon active={profileOpen} />
                <span className="text-2xs">Профиль</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 items-center h-full">
              <NavItem href="/" icon={HomeIcon} label="Главная" active={pathname === "/"} />
              <NavItem href="/market" icon={GridIcon} label="Маркет" active={pathname.startsWith("/market")} />
              <NavItem href="/login" icon={LoginIcon} label="Вход" active={pathname.startsWith("/login")} />
            </div>
          )}
        </div>
      </nav>

      {user && (
        <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
      )}
    </>
  );
}

function NavItem({ href, icon: Icon, label, active }: {
  href: string; icon: (props: { active: boolean }) => React.ReactNode; label: string; active: boolean;
}) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${active ? "text-gold-400" : "text-ink-muted hover:text-ink"}`}>
      <Icon active={active} />
      <span className="text-2xs">{label}</span>
    </Link>
  );
}

function CreateButton() {
  return (
    <Link href="/publish" className="flex items-center justify-center h-full">
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
      <path d="M4 10.5L12 4L20 10.5V19C20 19.55 19.55 20 19 20H15C14.45 20 14 19.55 14 19V15C14 14.45 13.55 14 13 14H11C10.45 14 10 14.45 10 15V19C10 19.55 9.55 20 9 20H5C4.45 20 4 19.55 4 19V10.5Z" stroke="currentColor" strokeWidth={active ? 2 : 1.6}/>
    </svg>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 7C3 5.9 3.9 5 5 5H19C20.1 5 21 5.9 21 7V17C21 18.1 20.1 19 19 19H5C3.9 19 3 18.1 3 17V7Z" stroke="currentColor" strokeWidth={active ? 2 : 1.6}/>
      <path d="M21 10H17C15.9 10 15 10.9 15 12C15 13.1 15.9 14 17 14H21" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round"/>
      <circle cx="17" cy="12" r="1.2" fill="currentColor"/>
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2 : 1.6}/>
      <rect x="13" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2 : 1.6}/>
      <rect x="4" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2 : 1.6}/>
      <rect x="13" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth={active ? 2 : 1.6}/>
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth={active ? 2 : 1.6}/>
      <path d="M5 20C5 16.5 8 14 12 14C16 14 19 16.5 19 20" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round"/>
    </svg>
  );
}

function LoginIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.9 20 6 20H11" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round"/>
      <path d="M15 8L19 12L15 16" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 12H9" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round"/>
    </svg>
  );
}
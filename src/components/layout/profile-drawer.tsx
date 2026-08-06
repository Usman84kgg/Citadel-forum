"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

type AuthUser = { id: string; email: string; username: string; role: string; avatarUrl: string | null } | null;

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => setUser(d?.user ?? null));
    fetch("/api/wallet/balance").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.available != null) setBalance(d.available);
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onClose();
    router.push("/login");
    router.refresh();
  }

  if (!open) return null;

  const initials = user?.username?.charAt(0).toUpperCase() ?? "?";
  const balanceLabel = balance != null ? `${(balance / 100).toFixed(2)} $` : "0.00 $";

  const menuItems = [
    {
      href: `/u/${user?.username}`,
      label: "Мой профиль",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M5 20C5 16.5 8 14 12 14C16 14 19 16.5 19 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      href: "/escrow",
      label: "Мои сделки",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6"/>
        </svg>
      ),
    },
    {
      href: "/arbitrage",
      label: "Арбитражи",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L20 6.5V11C20 15.9 16.9 20 12 21.5C7.1 20 4 15.9 4 11V6.5L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      href: "/ads",
      label: "Покупка рекламы",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 11L12 3L21 11V20H15V14H9V20H3V11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      href: "/settings",
      label: "Настройки",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M12 2V4M12 20V22M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12H4M20 12H22M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full bg-surface rounded-t-2xl border-t border-line-subtle">

        {/* Хедер с аватаром */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-line-subtle">
          <div className="h-11 w-11 rounded-full bg-surface-2 border border-line-subtle flex items-center justify-center shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover"/>
            ) : (
              <span className="font-display text-lg font-bold text-ink-muted">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink truncate">{user?.username ?? "..."}</p>
          </div>
          <button onClick={onClose} className="text-ink-muted p-1 hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Меню */}
        <nav className="py-1">
          {/* Кошелёк со спец. строкой баланса */}
          <Link href="/wallet" onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 transition-colors">
            <span className="text-ink-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 7C3 5.9 3.9 5 5 5H19C20.1 5 21 5.9 21 7V17C21 18.1 20.1 19 19 19H5C3.9 19 3 18.1 3 17V7Z" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M21 10H17C15.9 10 15 10.9 15 12C15 13.1 15.9 14 17 14H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="17" cy="12" r="1" fill="currentColor"/>
              </svg>
            </span>
            <span className="flex-1 text-sm text-ink">Кошелек</span>
            <span className="text-sm font-semibold text-ink mr-2">{balanceLabel}</span>
            <Link
              href="/wallet/deposit"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="h-7 w-7 rounded-full bg-gold-400 flex items-center justify-center text-black shrink-0 hover:bg-gold-300 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </Link>
          </Link>

          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 transition-colors">
              <span className="text-ink-muted">{item.icon}</span>
              <span className="text-sm text-ink">{item.label}</span>
            </Link>
          ))}

          {/* Выйти */}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 transition-colors">
            <span className="text-ink-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.9 20 6 20H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M15 8L19 12L15 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="text-sm text-danger">Выйти из аккаунта</span>
          </button>
        </nav>

        <div className="pb-[env(safe-area-inset-bottom)] pb-6"/>
      </div>
    </div>
  );
}
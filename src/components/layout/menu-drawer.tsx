"use client";

import Link from "next/link";
import { useEffect } from "react";

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

const LINKS = [
  { href: "/contacts", label: "Контакты", icon: LoginIcon },
  { href: "/users", label: "Пользователи", icon: UsersIcon },
  { href: "/support", label: "Служба поддержки", icon: SupportIcon },
  { href: "/rules", label: "Правила", icon: RulesIcon },
  { href: "/escrow", label: "Гарант", icon: EscrowIcon },
  { href: "/faq", label: "FAQ", icon: FaqIcon },
];

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-surface border-r border-line-subtle animate-fadeIn">
        <div className="flex items-center justify-between px-4 h-16 border-b border-line-subtle">
          <span className="font-display text-sm font-bold text-ink">Меню</span>
          <button onClick={onClose} className="text-ink-muted hover:text-ink p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="py-2">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-sm text-ink-secondary hover:bg-surface-2 hover:text-ink transition-colors"
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function LoginIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.9 20 6 20H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 8L19 12L15 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 20C3 16.5 5.5 14 9 14C12.5 14 15 16.5 15 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="8.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 14.2C18.2 14.6 20 16.7 20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function SupportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="3" y="12" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="17" y="12" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 18C20 19.6 18.6 21 17 21H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function RulesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8H16M8 12H16M8 16H12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function EscrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L20 6.5V11C20 15.9 16.9 20 12 21.5C7.1 20 4 15.9 4 11V6.5L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function FaqIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 9.5C10 8.1 11.1 7 12.5 7C13.9 7 15 8.1 15 9.5C15 10.9 13 11 12.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12.5" cy="16" r="0.9" fill="currentColor" />
    </svg>
  );
}
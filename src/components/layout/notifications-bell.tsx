"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.is_read).length;

  useEffect(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function toggleOpen() {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      setLoading(true);
      await fetch("/api/notifications", { method: "POST" }).catch(() => {});
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative p-2 text-ink-muted hover:text-ink transition-colors"
        aria-label="Уведомления"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 10C6 6.7 8.7 4 12 4C15.3 4 18 6.7 18 10V14L20 17H4L6 14V10Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-1 rounded-full bg-danger text-white text-[10px] leading-4 text-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] rounded-panel border border-line-subtle bg-surface shadow-card z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-line-subtle">
            <p className="text-xs font-semibold text-ink">Уведомления</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-xs text-ink-muted text-center py-6">Уведомлений нет</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2.5 border-b border-line-subtle last:border-0 hover:bg-surface-2 transition-colors ${
                    !n.is_read ? "bg-gold-400/5" : ""
                  }`}
                >
                  <p className="text-xs font-medium text-ink">{n.title}</p>
                  {n.body && <p className="text-2xs text-ink-muted mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-2xs text-ink-faint mt-1">
                    {new Date(n.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
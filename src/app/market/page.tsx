"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdCarousel } from "@/components/ads/ad-carousel";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  seller_username: string | null;
  seller_avatar_url: string | null;
  view_count: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function MarketPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/market/listings" + (activeCategory ? `?category=${activeCategory}` : "")).then(r => r.json()),
      fetch("/api/market/categories").then(r => r.json()),
    ]).then(([l, c]) => {
      setListings(Array.isArray(l) ? l : []);
      setCategories(Array.isArray(c) ? c : []);
      setLoading(false);
    });
  }, [activeCategory]);

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-8">
      <AdCarousel showPlaceholder />

      <div className="citadel-container space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Маркет</h1>
          <p className="text-sm text-ink-muted mt-1">Покупка и продажа товаров и услуг</p>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по публикациям..."
            className="w-full rounded-control bg-surface border border-line-subtle pl-10 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-control text-xs font-medium transition-colors ${
                !activeCategory ? "bg-gold-500 text-black" : "bg-surface text-ink-muted hover:bg-surface-2"
              }`}
            >
              Все
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.slug)}
                className={`px-3 py-1.5 rounded-control text-xs font-medium transition-colors ${
                  activeCategory === c.slug ? "bg-gold-500 text-black" : "bg-surface text-ink-muted hover:bg-surface-2"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <Link href="/market/create">
            <Button size="sm">Разместить</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-ink-muted text-sm">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <Card padding="md"><p className="text-sm text-ink-muted text-center">Объявлений пока нет</p></Card>
        ) : (
          <div className="space-y-0">
            {filtered.map((l, idx) => {
              const initials = (l.seller_username || "?").slice(0, 2).toUpperCase();
              return (
                <div key={l.id}>
                  <Link href={`/market/${l.id}`}>
                    <div className="flex gap-3 py-3 border-b border-line-subtle hover:bg-surface-2/40 transition-colors px-1">
                      <div className="h-10 w-10 rounded-full bg-gold-400/15 flex items-center justify-center shrink-0 text-xs text-gold-400 font-bold overflow-hidden">
                        {l.seller_avatar_url ? (
                          <img src={l.seller_avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{l.title}</p>
                        <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{l.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-2xs text-ink-faint">
                          <span>{l.seller_username || "Продавец"}</span>
                          <span>·</span>
                          <span>{new Date(l.created_at).toLocaleDateString("ru-RU")}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right flex flex-col items-end justify-between">
                        <span className="text-sm font-bold text-gold-400">${((l.price || 0) / 100).toFixed(2)}</span>
                        <span className="text-2xs text-ink-faint flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.6" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                          </svg>
                          {l.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {(idx + 1) % 6 === 0 && (
                    <div className="my-3">
                      <AdCarousel />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

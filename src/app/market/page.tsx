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
  comment_count?: number;
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
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [sort, setSort] = useState("new");

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

  const filtered = listings
    .filter((l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "popular") return (b.view_count || 0) - (a.view_count || 0);
      if (sort === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sort === "price_desc") return (b.price || 0) - (a.price || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  function selectCategory(slug: string, name: string) {
    setActiveCategory(slug);
    setActiveCategoryName(name);
    setShowCategoryModal(false);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-0 pb-8">
      {/* Выбрать раздел */}
      <div className="citadel-container pt-4 pb-2">
        <button
          onClick={() => setShowCategoryModal(true)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-control border border-gold-400/40 bg-surface text-sm font-medium text-ink hover:border-gold-400 transition-colors"
        >
          <span className="flex items-center gap-2 text-ink-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M4 12H14M4 18H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {activeCategoryName || "Выбрать раздел"}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Рекламный баннер */}
      <AdCarousel showPlaceholder />

      <div className="citadel-container space-y-3 pt-3">
        {/* Поиск */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M21 21L16.5 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по публикациям"
            className="w-full rounded-control bg-surface border border-line-subtle pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400"
          />
        </div>

        {/* Сортировка */}
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-ink-muted shrink-0">
            <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="flex-1 bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink-muted focus:outline-none focus:border-gold-400 appearance-none"
          >
            <option value="new">Сортировать по: Новым</option>
            <option value="popular">Сортировать по: Популярным</option>
            <option value="price_asc">Цена: по возрастанию</option>
            <option value="price_desc">Цена: по убыванию</option>
          </select>
          <Link href="/market/create">
            <button className="h-9 w-9 rounded-full bg-gold-400 flex items-center justify-center text-black shadow-gold shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </Link>
        </div>

        {/* Список */}
        {loading ? (
          <div className="text-center py-16 text-ink-muted text-sm">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <Card padding="md"><p className="text-sm text-ink-muted text-center">Объявлений пока нет</p></Card>
        ) : (
          <div>
            {filtered.map((l, idx) => {
              const initials = (l.seller_username || "?").slice(0, 2).toUpperCase();
              return (
                <div key={l.id}>
                  <Link href={`/market/${l.id}`}>
                    <div className="py-3 border-b border-line-subtle hover:bg-surface-2/30 transition-colors">
                      <p className="text-sm font-semibold text-ink line-clamp-2 mb-1.5 pr-1">{l.title}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-gold-400/15 flex items-center justify-center text-[9px] text-gold-400 font-bold overflow-hidden shrink-0">
                            {l.seller_avatar_url ? (
                              <img src={l.seller_avatar_url} alt="" className="h-full w-full object-cover"/>
                            ) : initials.slice(0, 1)}
                          </div>
                          <span className="text-xs text-ink-muted">{l.seller_username || "Продавец"}</span>
                          <span className="text-2xs text-ink-faint">{formatDate(l.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-2xs text-ink-faint">
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {l.comment_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.6"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
                            </svg>
                            {l.view_count || 0}
                          </span>
                          {l.price > 0 && (
                            <span className="text-gold-400 font-semibold">${((l.price || 0) / 100).toFixed(0)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {(idx + 1) % 6 === 0 && (
                    <div className="my-2"><AdCarousel /></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модал выбора раздела */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCategoryModal(false)}/>
          <div className="relative w-full bg-surface rounded-t-2xl border-t border-line-subtle max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-line-subtle">
              <span className="font-display text-base font-bold text-ink">Выбрать раздел</span>
              <button onClick={() => setShowCategoryModal(false)} className="text-ink-muted p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="py-2">
              <button
                onClick={() => selectCategory("", "Все разделы")}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${!activeCategory ? "text-gold-400 font-medium" : "text-ink hover:bg-surface-2"}`}
              >
                Все разделы
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCategory(c.slug, c.name)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${activeCategory === c.slug ? "text-gold-400 font-medium" : "text-ink hover:bg-surface-2"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  status: string;
  seller_id: string;
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

  return (
    <div className="citadel-container py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold-400">Маркет</h1>
        <Link href="/market/create">
          <Button size="sm">Разместить объявление</Button>
        </Link>
      </div>

      {/* Категории */}
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

      {loading ? (
        <div className="text-center py-16 text-ink-muted text-sm">Загрузка...</div>
      ) : listings.length === 0 ? (
        <Card padding="md"><p className="text-sm text-ink-muted text-center">Объявлений пока нет</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {listings.map((l) => (
            <Link key={l.id} href={`/market/${l.id}`}>
              <Card variant="interactive" padding="md">
                <p className="text-sm font-semibold text-ink truncate">{l.title}</p>
                <p className="text-xs text-ink-muted mt-1 line-clamp-2">{l.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm font-bold text-gold-400">${((l.price || 0) / 100).toFixed(2)}</p>
                  <Badge variant={l.type === "service" ? "info" : "warning"} size="sm">
                    {l.type === "service" ? "Услуга" : "Товар"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [type, setType] = useState("service");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/market/categories").then(r => r.json()).then(setCategories);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/market/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, price: parseFloat(price), categorySlug, type }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка");
      return;
    }

    router.push(`/market/${data.listing.id}`);
  }

  return (
    <div className="citadel-container py-6 max-w-lg mx-auto space-y-4">
      <h1 className="font-display text-2xl font-bold text-gold-400">Разместить объявление</h1>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Название" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что продаёте?" required />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Подробное описание..."
            rows={5}
            className="w-full rounded-control bg-surface border border-line-subtle p-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400 resize-none"
            required
          />
          <Input label="Цена (USD)" type="number" step="0.01" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="100" required />

          <div>
            <label className="text-xs text-ink-muted mb-1 block">Категория</label>
            <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="w-full bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink" required>
              <option value="">Выберите</option>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            {["service", "product", "digital"].map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`px-4 py-2 rounded-control text-sm font-medium transition-colors ${
                  type === t ? "bg-gold-500 text-black" : "bg-surface text-ink-muted hover:bg-surface-2"
                }`}
              >
                {t === "service" ? "Услуга" : t === "product" ? "Товар" : "Цифровой"}
              </button>
            ))}
          </div>

          {error ? <p className="text-xs text-danger">{error}</p> : null}

          <Button type="submit" loading={loading} className="w-full">Опубликовать</Button>
        </form>
      </Card>
    </div>
  );
}
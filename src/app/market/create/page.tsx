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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/market/categories").then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []));
  }, []);

  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("categorySlug", categorySlug);
      formData.append("type", type);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/market/listings", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка при публикации");
        return;
      }

      if (!data.listing || !data.listing.id) {
        setError("Сервер не вернул созданное объявление: " + JSON.stringify(data));
        return;
      }

      router.push(`/market/${data.listing.id}`);
    } catch (err: any) {
      console.error("Ошибка публикации:", err);
      setError("Ошибка: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="citadel-container py-6 max-w-lg mx-auto space-y-4">
      <div>
        <p className="text-2xs text-ink-faint uppercase tracking-wide">
          Каталог{selectedCategory ? ` / ${selectedCategory.name}` : ""}
        </p>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-gold-400 mt-1">
          Разместить объявление
        </h1>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Фото объявления</label>
            <label className="flex items-center justify-center h-40 rounded-control border border-dashed border-line-subtle bg-surface cursor-pointer overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Превью" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-ink-muted">Нажмите, чтобы выбрать фото</span>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="text-xs text-ink-muted mb-1 block">Категория</label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink"
              required
            >
              <option value="">Выберите категорию</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Продам машину"
            required
          />

          <div>
            <label className="text-xs text-ink-muted mb-1 block">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробное описание того, что вы предоставляете..."
              rows={5}
              className="w-full rounded-control bg-surface border border-line-subtle p-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400 resize-none"
              required
            />
          </div>

          <Input
            label="Цена (USD)"
            type="number"
            step="0.01"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="100"
            required
          />

          <div>
            <label className="text-xs text-ink-muted mb-1 block">Тип</label>
            <div className="flex gap-2">
              {["service", "product", "digital"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-control text-sm font-medium transition-colors ${
                    type === t ? "bg-gold-500 text-black" : "bg-surface text-ink-muted hover:bg-surface-2"
                  }`}
                >
                  {t === "service" ? "Услуга" : t === "product" ? "Товар" : "Цифровой"}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <Button type="submit" loading={loading} className="w-full">Опубликовать</Button>
        </form>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateDealPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/escrow/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, amount: parseFloat(amount), sellerId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка");
      return;
    }

    router.push(`/escrow/${data.deal.id}`);
  }

  return (
    <div className="citadel-container py-6 max-w-lg mx-auto space-y-4">
      <h1 className="font-display text-2xl font-bold text-gold-400">Создание сделки</h1>
      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Название сделки" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Дизайн лендинга" required />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание условий сделки..."
            rows={4}
            className="w-full rounded-control bg-surface border border-line-subtle p-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400 resize-none"
            required
          />
          <Input label="Сумма (USD)" type="number" step="0.01" min="10" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Минимум 10 USD" required />
          <Input label="Продавец (email)" value={sellerId} onChange={(e) => setSellerId(e.target.value)} placeholder="seller@mail.com" required />
          <div className="citadel-card bg-surface-2 border border-line-gold/30 p-3 rounded-panel">
            <p className="text-xs text-ink-muted">Комиссия: 2%</p>
            <p className="text-xs text-ink-muted">Мин. сумма: 10 USD</p>
            <p className="text-xs text-ink-muted">Споры: до 72 часов</p>
          </div>
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <Button type="submit" loading={loading} className="w-full">Создать сделку</Button>
        </form>
      </Card>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/market/listings`)
      .then(r => r.json())
      .then(data => {
        const found = Array.isArray(data) ? data.find((l: Listing) => l.id === id) : null;
        setListing(found || null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Загрузка...</div>;
  if (!listing) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Объявление не найдено</div>;

  return (
    <div className="citadel-container py-6 max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/market")}>← Назад к маркету</Button>

      <Card padding="lg">
        <div className="flex items-start justify-between mb-3">
          <h1 className="font-display text-xl font-bold text-gold-400">{listing.title}</h1>
          <Badge variant={listing.type === "service" ? "info" : "warning"}>{listing.type === "service" ? "Услуга" : "Товар"}</Badge>
        </div>
        <p className="text-sm text-ink-secondary whitespace-pre-wrap">{listing.description}</p>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line-subtle">
          <div>
            <p className="font-display text-2xl font-bold text-gold-400">${((listing.price || 0) / 100).toFixed(2)}</p>
            <p className="text-xs text-ink-muted mt-1">{listing.seller_id} · {new Date(listing.created_at).toLocaleDateString("ru-RU")} · {listing.view_count} просм.</p>
          </div>
          <Button size="sm">Заказать</Button>
        </div>
      </Card>
    </div>
  );
}
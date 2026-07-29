"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Deal {
  id: string;
  code: string;
  title: string;
  amount: number;
  status: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  pending_accept: "Ожидает принятия",
  funded: "Оплачен",
  in_progress: "В работе",
  delivered: "Выполнен",
  completed: "Завершён",
  cancelled: "Отменён",
  disputed: "Спор",
};

const STATUS_VARIANTS: Record<string, "muted" | "warning" | "info" | "success" | "danger"> = {
  draft: "muted",
  pending_accept: "warning",
  funded: "info",
  in_progress: "info",
  delivered: "info",
  completed: "success",
  cancelled: "danger",
  disputed: "danger",
};

export default function EscrowPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const status = tab === "all" ? "" : tab;
    fetch(`/api/escrow/deals${status ? `?status=${status}` : ""}`)
      .then((r) => r.json())
      .then((d) => setDeals(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="citadel-container py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold-400">Гарант-сервис</h1>
        <Link href="/escrow/create">
          <Button size="sm">Создать сделку</Button>
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "Все" },
          { key: "funded", label: "Активные" },
          { key: "completed", label: "Завершённые" },
          { key: "disputed", label: "Споры" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-control text-xs font-medium transition-colors ${
              tab === t.key ? "bg-gold-500 text-black" : "bg-surface text-ink-muted hover:bg-surface-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-ink-muted">Загрузка...</div>
      ) : deals.length === 0 ? (
        <Card padding="md"><p className="text-sm text-ink-muted text-center">Сделок пока нет</p></Card>
      ) : (
        <Card padding="none">
          {deals.map((d) => (
            <Link key={d.id} href={`/escrow/${d.id}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-line-subtle last:border-0 hover:bg-surface-2 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-ink-muted">{d.code}</span>
                  <p className="text-sm font-medium text-ink truncate">{d.title}</p>
                </div>
                <p className="text-2xs text-ink-muted">{d.buyer_id} → {d.seller_id} · {new Date(d.created_at).toLocaleDateString("ru-RU")}</p>
              </div>
              <span className="text-sm font-semibold text-ink">${((d.amount || 0) / 100).toFixed(2)}</span>
              <Badge variant={STATUS_VARIANTS[d.status] || "muted"} size="sm">{STATUS_LABELS[d.status] || d.status}</Badge>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
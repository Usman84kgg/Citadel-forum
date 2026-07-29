"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BalanceData {
  available: number;
  hold: number;
  total: number;
  currency: string;
}

interface HistoryItem {
  id: string;
  operationType: "deposit" | "withdrawal";
  currency: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  addressTo?: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/wallet/balance").then((r) => r.json()),
      fetch("/api/wallet/history").then((r) => r.json()),
    ]).then(([bal, hist]) => {
      setBalance(bal);
      setHistory(Array.isArray(hist) ? hist.slice(0, 10) : []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="citadel-container py-16 text-center text-ink-muted text-sm">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="citadel-container py-6 space-y-6">
      <h1 className="font-display text-2xl font-bold text-gold-400">
        Кошелёк
      </h1>

      {/* Карточка баланса */}
      <Card variant="gold" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wide">
              Общий баланс
            </p>
            <p className="font-display text-3xl font-bold text-gold-400 mt-1">
              ${((balance?.total ?? 0) / 100).toFixed(2)}
            </p>
            {balance?.hold ? (
              <p className="text-xs text-ink-muted mt-1">
                Доступно: ${((balance.available) / 100).toFixed(2)} · Заморожено: ${((balance.hold) / 100).toFixed(2)}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Link href="/wallet/deposit">
              <Button size="sm">Пополнить</Button>
            </Link>
            <Link href="/wallet/withdraw">
              <Button variant="secondary" size="sm">
                Вывод
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* История операций */}
      <section>
        <h2 className="font-display text-sm font-bold text-ink mb-3">
          История операций
        </h2>
        {history.length === 0 ? (
          <Card padding="md">
            <p className="text-sm text-ink-muted text-center">
              Операций пока нет
            </p>
          </Card>
        ) : (
          <Card padding="none">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-line-subtle last:border-0"
              >
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    item.operationType === "deposit"
                      ? "bg-success"
                      : "bg-danger"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {item.operationType === "deposit" ? "Пополнение" : "Вывод"}
                  </p>
                  <p className="text-2xs text-ink-muted">
                    {item.method} ·{" "}
                    {new Date(item.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    item.operationType === "deposit"
                      ? "text-success"
                      : "text-danger"
                  }`}
                >
                  {item.operationType === "deposit" ? "+" : "−"}$
                  {(item.amount / 100).toFixed(2)}
                </span>
                <Badge
                  variant={
                    item.status === "confirmed" || item.status === "paid"
                      ? "success"
                      : item.status === "rejected"
                      ? "danger"
                      : "warning"
                  }
                  size="sm"
                >
                  {item.status === "confirmed" || item.status === "paid"
                    ? "Выполнено"
                    : item.status === "rejected"
                    ? "Отклонено"
                    : "В обработке"}
                </Badge>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [addressTo, setAddressTo] = useState("");
  const [method, setMethod] = useState("usdt_trc20");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currency: method === "btc" ? "BTC" : "USDT",
        amount: Math.round(parseFloat(amount) * 100),
        method,
        addressTo,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка");
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="citadel-container py-6 max-w-lg mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-gold-400">
        Вывод средств
      </h1>

      {success ? (
        <Card variant="gold" padding="lg" className="text-center">
          <p className="text-lg mb-2">📤</p>
          <p className="font-display text-lg font-bold text-gold-400">
            Заявка отправлена
          </p>
          <p className="text-sm text-ink-muted mt-2">
            Администратор обработает заявку в ближайшее время
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => router.push("/wallet")}
          >
            Вернуться в кошелёк
          </Button>
        </Card>
      ) : (
        <>
          {/* Выбор метода */}
          <div className="flex gap-2">
            {[
              { id: "usdt_trc20", label: "USDT (TRC20)" },
              { id: "btc", label: "Bitcoin" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`px-4 py-2 rounded-control text-sm font-medium transition-colors ${
                  method === m.id
                    ? "bg-gold-500 text-black"
                    : "bg-surface text-ink-muted hover:bg-surface-2"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Сумма (USD)"
                type="number"
                step="0.01"
                min="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Минимум $10"
                required
              />

              <Input
                label="Адрес кошелька"
                value={addressTo}
                onChange={(e) => setAddressTo(e.target.value)}
                placeholder={
                  method === "btc"
                    ? "bc1q..."
                    : "TX..."
                }
                required
              />

              <p className="text-2xs text-ink-muted">
                Средства будут отправлены вручную администратором.
                Заявка обрабатывается до 24 часов.
              </p>

              {error ? (
                <p className="text-xs text-danger">{error}</p>
              ) : null}

              <Button type="submit" loading={loading} className="w-full">
                Отправить заявку
              </Button>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
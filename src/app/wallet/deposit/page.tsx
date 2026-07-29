"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentAddress {
  currency: string;
  network: string;
  address: string;
  label: string;
  isActive: boolean;
}

export default function DepositPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<PaymentAddress[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/wallet/addresses")
      .then((r) => r.json())
      .then(setAddresses);
  }, []);

  const activeAddress = addresses.find(
    (a) => a.currency === selectedCurrency && a.isActive,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currency: selectedCurrency,
        amount: Math.round(parseFloat(amount) * 100),
        method: selectedCurrency === "BTC" ? "btc" : "usdt_trc20",
        txId,
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

  if (success) {
    return (
      <div className="citadel-container py-6 max-w-lg mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold text-gold-400">
          Пополнение
        </h1>
        <Card variant="gold" padding="lg" className="text-center">
          <p className="text-lg mb-2">✅</p>
          <p className="font-display text-lg font-bold text-gold-400">
            Заявка отправлена
          </p>
          <p className="text-sm text-ink-muted mt-2">
            Администратор проверит поступление и зачислит средства
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
      </div>
    );
  }

  return (
    <div className="citadel-container py-6 max-w-lg mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-gold-400">
        Пополнение
      </h1>

      <div className="flex gap-2">
        {["USDT", "BTC"].map((cur) => (
          <button
            key={cur}
            onClick={() => setSelectedCurrency(cur)}
            className={`px-4 py-2 rounded-control text-sm font-medium transition-colors ${
              selectedCurrency === cur
                ? "bg-gold-500 text-black"
                : "bg-surface text-ink-muted hover:bg-surface-2"
            }`}
          >
            {cur === "USDT" ? "USDT (TRC20)" : "Bitcoin"}
          </button>
        ))}
      </div>

      {activeAddress ? (
        <Card padding="md">
          <p className="text-xs text-ink-muted mb-1">Адрес для пополнения</p>
          <div className="flex items-center gap-2">
            <!--CODEPH:0-->
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                navigator.clipboard.writeText(activeAddress.address)
              }
            >
              📋
            </Button>
          </div>
          <p className="text-2xs text-ink-faint mt-2">
            Отправьте{" "}
            {selectedCurrency === "USDT" ? "USDT TRC-20" : "BTC"}{" "}
            на этот адрес и заполните форму ниже
          </p>
        </Card>
      ) : (
        <Card padding="md">
          <p className="text-sm text-ink-muted text-center">
            Адрес для {selectedCurrency} временно недоступен
          </p>
        </Card>
      )}

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
            label="TXID транзакции"
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            placeholder="ID транзакции из блокчейна"
            required
          />
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <Button type="submit" loading={loading} className="w-full">
            Отправить заявку
          </Button>
        </form>
      </Card>
    </div>
  );
}
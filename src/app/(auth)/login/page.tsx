"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SITE } from "@/lib/config/site";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Ошибка входа");
        setLoading(false);
        return;
      }

      // Вход успешен — принудительно переходим на главную
      window.location.href = "/";
    } catch {
      setError("Ошибка соединения");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4">
      <Card className="w-full max-w-sm" padding="lg">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line-strong bg-surface-2 shadow-gold mb-3">
            <span className="font-display text-2xl font-bold text-gold-400">C</span>
          </div>
          <p className="font-display text-lg font-bold text-gold-400 uppercase tracking-wider2">{SITE.name}</p>
          <p className="text-2xs text-ink-muted mt-1">Вход в аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cotadelforum77@gmail.com"
            required
          />

          {error ? (
            <p className="text-xs text-danger text-center">{error}</p>
          ) : null}

          <Button type="submit" loading={loading} className="w-full">
            Войти
          </Button>
        </form>

        <p className="text-center text-xs text-ink-muted mt-4">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-gold-400 hover:text-gold-300">
            Зарегистрироваться
          </Link>
        </p>

        <p className="text-center text-2xs text-ink-faint mt-2">
          Владелец: cotadelforum77@gmail.com
        </p>
      </Card>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SITE } from "@/lib/config/site";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Пароль должен быть не менее 8 символов");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка регистрации");
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4">
      <Card className="w-full max-w-sm" padding="lg">
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line-strong bg-surface-2 shadow-gold mb-3">
            <span className="font-display text-2xl font-bold text-gold-400">C</span>
          </div>
          <p className="font-display text-lg font-bold text-gold-400 uppercase tracking-wider2">{SITE.name}</p>
          <p className="text-2xs text-ink-muted mt-1">Регистрация</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="CryptoKing" required />
          <Input label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 8 символов" required />
          {error ? <p className="text-xs text-danger text-center">{error}</p> : null}
          <Button type="submit" loading={loading} className="w-full">Зарегистрироваться</Button>
        </form>

        <p className="text-center text-xs text-ink-muted mt-4">
          Уже есть аккаунт? <Link href="/login" className="text-gold-400 hover:text-gold-300">Войти</Link>
        </p>
      </Card>
    </div>
  );
}
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
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Ошибка соединения");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4">
      <Card className="w-full max-w-sm" padding="lg">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/FBE5C086-8E99-40FA-9134-A73FC1ACE591.png"
            alt="XALISKO GLOBAL"
            className="h-12 w-12 rounded-xl"
          />
          <p className="font-display text-lg font-bold text-gold-400 uppercase tracking-wider2 mt-3">{SITE.name}</p>
          <p className="text-2xs text-ink-muted mt-1">Вход в аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="citadelforum77@gmail.com" required />
          <Input label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          {error ? <p className="text-xs text-danger text-center">{error}</p> : null}
          <Button type="submit" loading={loading} className="w-full">Войти</Button>
        </form>

        <p className="text-center text-xs text-ink-muted mt-4">
          Нет аккаунта? <Link href="/register" className="text-gold-400 hover:text-gold-300">Зарегистрироваться</Link>
        </p>
      </Card>
    </div>
  );
}
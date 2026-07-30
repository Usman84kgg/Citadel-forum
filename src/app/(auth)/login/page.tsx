"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SITE } from "@/lib/config/site";

// Компонент капчи Cloudflare Turnstile
function TurnstileWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  return (
    <div
      ref={ref}
      className="cf-turnstile"
      data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
      data-theme="dark"
    />
  );
}

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

    const form = e.target as HTMLFormElement;
    const turnstileToken = (form.querySelector("[name=cf-turnstile-response]") as HTMLInputElement)?.value;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, turnstileToken }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка входа");
      return;
    }

    router.push("/");
    router.refresh();
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
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <TurnstileWidget />
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
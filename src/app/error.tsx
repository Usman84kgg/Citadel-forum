"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[CITADEL]", error.digest ?? "unknown"); }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line-strong bg-surface-2">
        <span className="font-display text-2xl font-bold text-gold-400">!</span>
      </div>
      <h1 className="mt-6 font-display text-2xl font-semibold text-ink">Произошла ошибка</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        Не удалось загрузить страницу. Попробуйте обновить её. Если ошибка повторяется, обратитесь в поддержку.
      </p>
      {error.digest ? <p className="mt-4 font-mono text-2xs text-ink-faint">Код обращения: {error.digest}</p> : null}
      <div className="citadel-divider my-8 w-full max-w-xs" />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="rounded-control border border-line-gold bg-gold-500/10 px-6 py-3 text-sm font-medium text-gold-300">
          Попробовать снова
        </button>
        <a href="/" className="rounded-control border border-line-subtle px-6 py-3 text-sm font-medium text-ink-secondary">
          На главную
        </a>
      </div>
    </main>
  );
}
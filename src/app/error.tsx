"use client";

export default function Error() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-gold-400 mb-2">Ошибка</h1>
      <p className="text-sm text-ink-muted">Попробуйте обновить страницу</p>
      <a href="/" className="mt-4 text-sm text-gold-400 hover:underline">
        На главную
      </a>
    </main>
  );
}
"use client";

export default function GlobalError() {
  return (
    <html>
      <body className="bg-base text-ink">
        <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold text-gold-400 mb-2">Ошибка сервера</h1>
          <p className="text-sm text-ink-muted">Произошла критическая ошибка</p>
        </main>
      </body>
    </html>
  );
}
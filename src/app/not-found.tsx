import Link from "next/link";

export const metadata = { title: "Страница не найдена" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="citadel-gold-text font-display text-7xl font-bold">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Страница не найдена</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        Запрошенный раздел не существует, был перемещён или доступен только определённым участникам.
      </p>
      <div className="citadel-divider my-8 w-full max-w-xs" />
      <Link
        href="/"
        className="rounded-control border border-line-gold bg-gold-500/10 px-6 py-3 text-sm font-medium text-gold-300"
      >
        Вернуться на главную
      </Link>
    </main>
  );
}
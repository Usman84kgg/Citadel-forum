import { BUILD_STATUS, ESCROW_RULES, SITE } from "@/lib/config/site";

const MODULES = [
  { name: "Форум", note: "Разделы, темы, сообщения" },
  { name: "Гарант", note: "Безопасные сделки" },
  { name: "Маркет", note: "Объявления и услуги" },
  { name: "Кошелёк", note: "Баланс и операции" },
  { name: "Репутация", note: "Отзывы и рейтинг" },
  { name: "Поддержка", note: "Тикеты и помощь" },
];

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/[0.07] blur-[120px]"
      />

      <div className="citadel-container relative flex max-w-3xl flex-col items-center text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-line-strong bg-surface-2 shadow-gold">
          <span className="font-display text-4xl font-bold text-gold-400">C</span>
        </div>

        <p className="mb-3 text-xs uppercase tracking-brand text-ink-muted">Добро пожаловать в</p>

        <h1 className="citadel-gold-text font-display text-5xl font-bold uppercase tracking-wider2 sm:text-7xl">
          {SITE.name}
        </h1>

        <p className="mt-4 text-xs uppercase tracking-brand text-gold-700">{SITE.tagline}</p>
        <div className="citadel-divider my-8 w-full max-w-md" />

        <p className="max-w-xl text-balance text-base leading-relaxed text-ink-secondary">
          {SITE.description}
        </p>

        <div className="mt-10 grid w-full max-w-lg grid-cols-3 gap-3">
          <Stat value={`${ESCROW_RULES.feePercent}%`} label="Комиссия" />
          <Stat value={`$${ESCROW_RULES.minAmount}`} label="Минимум сделки" />
          <Stat value={`${ESCROW_RULES.disputeHours}ч`} label="Срок спора" />
        </div>

        <div className="mt-12 grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {MODULES.map((item) => (
            <div key={item.name} className="citadel-card px-4 py-3 text-left">
              <p className="font-display text-sm font-semibold text-gold-300">{item.name}</p>
              <p className="mt-1 text-2xs leading-tight text-ink-muted">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface px-4 py-2">
          <span className="h-1.5 w-1.5 animate-gold-pulse rounded-full bg-gold-500" />
          <span className="text-2xs uppercase tracking-wider2 text-ink-muted">
            Фаза {BUILD_STATUS.phase} — {BUILD_STATUS.phaseTitle}
          </span>
        </div>

        <p className="mt-6 text-2xs uppercase tracking-brand text-ink-faint">Платформа в разработке</p>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="citadel-card px-3 py-4">
      <p className="font-display text-xl font-bold text-gold-400">{value}</p>
      <p className="mt-1 text-2xs uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  );
}
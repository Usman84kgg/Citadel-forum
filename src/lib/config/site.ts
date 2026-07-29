export const SITE = {
  name: "CITADEL",
  tagline: "PRIVATE COMMUNITY",
  title: "CITADEL — Private Community",
  description:
    "Приватное сообщество для общения, безопасных сделок и размещения услуг в одном месте.",
  descriptionEn:
    "Private community for communication, secure deals and service listings in one place.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://rocketcrown.top",
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.rocketcrown.top",
} as const;

export const LOCALES = ["ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";

export const CURRENCY = { code: "USD", symbol: "$", decimals: 2 } as const;

export const ESCROW_RULES = {
  feePercent: 2,
  minAmount: 10,
  disputeHours: 72,
  autoReleaseHours: 72,
  withdrawalQuarantineHours: 24,
} as const;

export const PAYMENT_METHODS = [
  { id: "btc", label: "Bitcoin", network: "BTC" },
  { id: "usdt_trc20", label: "USDT", network: "TRC20" },
] as const;

export const MAIN_NAV = [
  { key: "home", href: "/", labelRu: "Главная", labelEn: "Home" },
  { key: "forum", href: "/forum/general", labelRu: "Форум", labelEn: "Forum" },
  { key: "chat", href: "/forum/chat", labelRu: "Чат", labelEn: "Chat" },
  { key: "users", href: "/users", labelRu: "Пользователи", labelEn: "Members" },
  { key: "escrow", href: "/escrow", labelRu: "Гарант", labelEn: "Escrow" },
  { key: "market", href: "/market", labelRu: "Маркет", labelEn: "Market" },
  { key: "wallet", href: "/wallet", labelRu: "Кошелёк", labelEn: "Wallet" },
  { key: "resources", href: "/resources", labelRu: "Ресурсы", labelEn: "Resources" },
  { key: "vacancies", href: "/forum/vacancies", labelRu: "Вакансии", labelEn: "Vacancies" },
  { key: "resumes", href: "/forum/resumes", labelRu: "Резюме", labelEn: "Resumes" },
  { key: "freebies", href: "/forum/freebies", labelRu: "Халява", labelEn: "Freebies" },
  { key: "support", href: "/support", labelRu: "Поддержка", labelEn: "Support" },
] as const;

export const BUILD_STATUS = {
  phase: 10,
  phaseTitle: "Форум",
  updated: "2026-07",
} as const;
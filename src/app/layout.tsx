import type { Metadata, Viewport } from "next";
import { Cinzel, Manrope } from "next/font/google";
import { SITE } from "@/lib/config/site";
import { Header } from "@/components/layout/header";
import "@/styles/tokens.css";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400","500","600","700","800","900"], variable: "--font-display", display: "swap" });
const manrope = Manrope({ subsets: ["latin","cyrillic"], weight: ["300","400","500","600","700","800"], variable: "--font-ui", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s — ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["приватное сообщество","безопасные сделки","гарант сервис","маркетплейс услуг","форум"],
  authors: [{ name: SITE.name }],
  openGraph: { type: "website", locale: "ru_RU", url: SITE.url, siteName: SITE.name, title: SITE.title, description: SITE.description },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  robots: { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#0A0A0B", colorScheme: "dark", width: "device-width", initialScale: 1, maximumScale: 5 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${cinzel.variable} ${manrope.variable} dark`} suppressHydrationWarning>
      <body className="min-h-dvh bg-base font-ui text-ink antialiased">
        <Header />
        <main>{children}</main>
        <footer className="border-t border-line-subtle py-4 mt-8">
          <div className="citadel-container text-center text-2xs text-ink-faint">
            © {new Date().getFullYear()} {SITE.name}. Все права защищены.
          </div>
        </footer>
      </body>
    </html>
  );
}
import { ESCROW_RULES } from "@/lib/config/site";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="citadel-container py-4 space-y-4">
      {/* Рекламный блок */}
      <AdBanner />

      {/* Приветственный блок + правая колонка */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WelcomeBlock />
        </div>
        <div className="space-y-4">
          <StatsCompact />
          <TopUsers />
        </div>
      </div>

      {/* Объявление */}
      <AnnouncementBar />

      {/* Разделы форума */}
      <ForumSections />

      {/* Последние сделки + объявления */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LatestDeals />
        <LatestListings />
      </div>

      {/* Онлайн */}
      <OnlineNow />
    </div>
  );
}

// ==========================================================
// РЕКЛАМНЫЙ БЛОК (управляется через админ-панель)
// ==========================================================
function AdBanner() {
  return (
    <div className="citadel-card bg-surface border border-dashed border-line-strong flex items-center justify-center h-20 text-ink-faint text-xs uppercase tracking-wide">
      Реклама — настраивается в админ-панели
    </div>
  );
}

// ==========================================================
// ПРИВЕТСТВЕННЫЙ БЛОК (уменьшенный)
// ==========================================================
function WelcomeBlock() {
  return (
    <Card variant="gold" padding="md" className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-gold-500/5 to-transparent pointer-events-none" />
      <div className="relative flex items-center gap-4">
        <div className="flex-1">
          <p className="text-2xs uppercase tracking-brand text-ink-muted mb-1">
            Добро пожаловать в
          </p>
          <h1 className="citadel-gold-text font-display text-
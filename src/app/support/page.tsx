import { Card } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="citadel-container py-6 space-y-4 max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold text-gold-400">Служба поддержки</h1>
      <Card padding="lg">
        <p className="text-sm text-ink-secondary">
          Раздел находится в разработке. Скоро здесь можно будет создать обращение в поддержку.
        </p>
      </Card>
    </div>
  );
}
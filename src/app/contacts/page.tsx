import { Card } from "@/components/ui/card";

export default function ContactsPage() {
  return (
    <div className="citadel-container py-6 space-y-4 max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold text-gold-400">Контакты</h1>
      <Card padding="lg">
        <p className="text-sm text-ink-secondary">
          Раздел находится в разработке. Скоро здесь появятся ссылки на команду проекта и способы связи.
        </p>
      </Card>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Deal {
  id: string; code: string; title: string; description: string;
  amount: number; status: string; buyer_id: string; seller_id: string;
  fee_percent: number; fee_amount: number; created_at: string;
}

interface DealEvent {
  id: string; to_status: string; note?: string; actor_id: string; created_at: string;
}

interface DealMessage {
  id: string; sender_id: string; content: string; is_system_message: boolean; created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик", pending_accept: "Ожидает принятия", funded: "Оплачен",
  in_progress: "В работе", delivered: "Выполнен", completed: "Завершён",
  cancelled: "Отменён", disputed: "Спор",
};

export default function DealPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [events, setEvents] = useState<DealEvent[]>([]);
  const [messages, setMessages] = useState<DealMessage[]>([]);
  const [msgText, setMsgText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/escrow/deals/${id}`)
      .then(r => r.json())
      .then(data => {
        setDeal(data.deal);
        setEvents(data.events || []);
        setMessages(data.messages || []);
        setLoading(false);
      });
  }, [id]);

  async function doAction(action: string, note?: string) {
    await fetch(`/api/escrow/deals/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    // Перезагружаем
    const res = await fetch(`/api/escrow/deals/${id}`);
    const data = await res.json();
    setDeal(data.deal);
    setEvents(data.events || []);
    setMessages(data.messages || []);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!msgText.trim()) return;
    await doAction("send_message", msgText);
    setMsgText("");
  }

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted">Загрузка...</div>;
  if (!deal) return <div className="citadel-container py-16 text-center text-ink-muted">Сделка не найдена</div>;

  return (
    <div className="citadel-container py-6 max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/escrow")}>← Назад</Button>

      <Card padding="lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xs text-ink-muted">{deal.code}</span>
          <Badge variant={deal.status === "completed" ? "success" : deal.status === "disputed" ? "danger" : "info"}>
            {STATUS_LABELS[deal.status] || deal.status}
          </Badge>
        </div>
        <h1 className="font-display text-xl font-bold text-gold-400">{deal.title}</h1>
        <p className="text-sm text-ink-secondary mt-2">{deal.description}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-line-subtle">
          <div>
            <p className="text-xs text-ink-muted">{deal.buyer_id} → {deal.seller_id}</p>
            <p className="font-display text-xl font-bold text-gold-400 mt-1">${((deal.amount || 0) / 100).toFixed(2)}</p>
            <p className="text-2xs text-ink-faint">Комиссия: {deal.fee_percent}% (${((deal.fee_amount || 0) / 100).toFixed(2)})</p>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {deal.status === "draft" && <Button size="sm" onClick={() => doAction("accept")}>Отправить контрагенту</Button>}
          {deal.status === "pending_accept" && <Button size="sm" onClick={() => doAction("fund")}>Оплатить</Button>}
          {deal.status === "funded" && <Button size="sm" onClick={() => doAction("deliver")}>Отметить выполнение</Button>}
          {deal.status === "delivered" && <Button size="sm" onClick={() => doAction("complete")}>Подтвердить завершение</Button>}
          {(deal.status === "funded" || deal.status === "delivered") && (
            <Button variant="danger" size="sm" onClick={() => doAction("dispute")}>Открыть спор</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => doAction("cancel")}>Отменить</Button>
        </div>
      </Card>

      {/* Чат сделки */}
      <Card padding="md">
        <h3 className="font-display text-sm font-bold text-ink mb-3">Чат сделки</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
          {messages.map((m) => (
            <div key={m.id} className={`text-sm ${m.is_system_message ? "text-ink-muted italic text-center" : "text-ink"}`}>
              {!m.is_system_message && <span className="text-xs text-ink-muted mr-1">{m.sender_id}:</span>}
              {m.content}
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input value={msgText} onChange={(e) => setMsgText(e.target.value)} placeholder="Сообщение..."
            className="flex-1 h-9 rounded-control bg-surface border border-line-subtle px-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400" />
          <Button type="submit" size="sm">Отпр.</Button>
        </form>
      </Card>

      {/* История событий */}
      <Card padding="md">
        <h3 className="font-display text-sm font-bold text-ink mb-2">История</h3>
        {events.map((ev) => (
          <div key={ev.id} className="text-xs text-ink-muted py-1 border-b border-line-subtle last:border-0">
            {ev.actor_id} → {STATUS_LABELS[ev.to_status] || ev.to_status} {ev.note ? `· ${ev.note}` : ""}
          </div>
        ))}
      </Card>
    </div>
  );
}
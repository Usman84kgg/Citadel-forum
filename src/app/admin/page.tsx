"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DepositItem { id: string; userId: string; currency: string; amount: number; method: string; txId?: string; status: string; createdAt: string; }
interface WithdrawalItem { id: string; userId: string; currency: string; amount: number; method: string; addressTo: string; status: string; createdAt: string; }
interface AddressItem { currency: string; network: string; address: string; label: string; isActive: boolean; }
interface AdItem { id: string; title: string; slot: string; media_url: string; media_type: string; link_url: string; is_active: boolean; priority: number; }

export default function AdminPage() {
  const [tab, setTab] = useState<"deposits" | "withdrawals" | "manual" | "addresses" | "badges" | "ads">("deposits");
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/deposits").then(r => r.ok ? r.json() : []),
      fetch("/api/admin/withdrawals").then(r => r.ok ? r.json() : []),
      fetch("/api/admin/addresses").then(r => r.ok ? r.json() : []),
    ]).then(([d, w, a]) => {
      setDeposits(Array.isArray(d) ? d : []);
      setWithdrawals(Array.isArray(w) ? w : []);
      setAddresses(Array.isArray(a) ? a : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="citadel-container py-16 text-center text-ink-muted text-sm">Загрузка...</div>;

  return (
    <div className="citadel-container py-6 space-y-6">
      <h1 className="font-display text-2xl font-bold text-gold-400">Админ-панель</h1>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "deposits", label: "Пополнения" },
          { key: "withdrawals", label: "Выводы" },
          { key: "manual", label: "Ручные операции" },
          { key: "addresses", label: "Адреса" },
          { key: "badges", label: "Плашки" },
          { key: "ads", label: "Реклама" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-control text-sm font-medium transition-colors ${
              tab === t.key ? "bg-gold-500 text-black" : "bg-surface text-ink-muted hover:bg-surface-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "deposits" && <DepositsTab items={deposits} onRefresh={() => fetch("/api/admin/deposits").then(r => r.json()).then(setDeposits)} />}
      {tab === "withdrawals" && <WithdrawalsTab items={withdrawals} onRefresh={() => fetch("/api/admin/withdrawals").then(r => r.json()).then(setWithdrawals)} />}
      {tab === "manual" && <ManualTab />}
      {tab === "addresses" && <AddressesTab items={addresses} onRefresh={() => fetch("/api/admin/addresses").then(r => r.json()).then(setAddresses)} />}
      {tab === "badges" && <BadgesTab />}
      {tab === "ads" && <AdsTab />}
    </div>
  );
}

// ==========================================================
function DepositsTab({ items, onRefresh }: { items: DepositItem[]; onRefresh: () => void }) {
  async function confirm(id: string) {
    await fetch("/api/admin/deposits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "confirm" }) });
    onRefresh();
  }

  if (items.length === 0) return <Card padding="md"><p className="text-sm text-ink-muted text-center">Нет заявок на пополнение</p></Card>;

  return (
    <Card padding="none">
      {items.map((d) => (
        <div key={d.id} className="flex items-center gap-3 px-4 py-3 border-b border-line-subtle last:border-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink">{d.userId}</p>
            <p className="text-2xs text-ink-muted">{d.method} · TXID: {d.txId?.slice(0, 16)}... · {(d.amount / 100).toFixed(2)} USD</p>
          </div>
          <Badge variant="warning" size="sm">Ожидает</Badge>
          <Button size="sm" onClick={() => confirm(d.id)}>Подтвердить</Button>
        </div>
      ))}
    </Card>
  );
}

// ==========================================================
function WithdrawalsTab({ items, onRefresh }: { items: WithdrawalItem[]; onRefresh: () => void }) {
  const [txIdInputs, setTxIdInputs] = useState<Record<string, string>>({});

  async function approve(id: string) {
    await fetch("/api/admin/withdrawals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "approve" }) });
    onRefresh();
  }
  async function markPaid(id: string) {
    await fetch("/api/admin/withdrawals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "paid", txId: txIdInputs[id] || "" }) });
    onRefresh();
  }
  async function reject(id: string) {
    await fetch("/api/admin/withdrawals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "reject" }) });
    onRefresh();
  }

  if (items.length === 0) return <Card padding="md"><p className="text-sm text-ink-muted text-center">Нет заявок на вывод</p></Card>;

  return (
    <Card padding="none">
      {items.map((w) => (
        <div key={w.id} className="px-4 py-3 border-b border-line-subtle last:border-0 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink">{w.userId}</p>
              <p className="text-2xs text-ink-muted">{w.method} · {w.addressTo.slice(0, 12)}... · {(w.amount / 100).toFixed(2)} USD</p>
            </div>
            <Badge variant={w.status === "approved" ? "info" : "warning"} size="sm">
              {w.status === "approved" ? "Одобрено" : "Ожидает"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {w.status === "pending" && <Button size="sm" onClick={() => approve(w.id)}>Одобрить</Button>}
            {w.status === "approved" && (
              <>
                <Input placeholder="TXID выплаты" value={txIdInputs[w.id] || ""} onChange={(e) => setTxIdInputs((prev) => ({ ...prev, [w.id]: e.target.value }))} className="h-8 text-xs" />
                <Button size="sm" onClick={() => markPaid(w.id)}>Выплачено</Button>
              </>
            )}
            <Button variant="danger" size="sm" onClick={() => reject(w.id)}>Отклонить</Button>
          </div>
        </div>
      ))}
    </Card>
  );
}

// ==========================================================
function ManualTab() {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState("");

  async function doAction(action: string) {
    const res = await fetch("/api/admin/manual", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount: Math.round(parseFloat(amount) * 100), action, note }),
    });
    const data = await res.json();
    setResult(data.success ? "Готово" : data.error || "Ошибка");
  }

  return (
    <Card padding="lg" className="max-w-md space-y-4">
      <Input label="ID пользователя" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="user_..." />
      <Input label="Сумма (USD)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <Input label="Примечание" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={() => doAction("credit")}>Зачислить</Button>
        <Button size="sm" variant="danger" onClick={() => doAction("debit")}>Списать</Button>
        <Button size="sm" variant="secondary" onClick={() => doAction("freeze")}>Заморозить</Button>
        <Button size="sm" variant="secondary" onClick={() => doAction("unfreeze")}>Разморозить</Button>
      </div>
      {result ? <p className="text-sm text-gold-300">{result}</p> : null}
    </Card>
  );
}

// ==========================================================
function AddressesTab({ items, onRefresh }: { items: AddressItem[]; onRefresh: () => void }) {
  const [currency, setCurrency] = useState("BTC");
  const [network, setNetwork] = useState("BTC");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");

  async function save() {
    await fetch("/api/admin/addresses", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency, network, address, label }),
    });
    onRefresh();
    setAddress(""); setLabel("");
  }

  async function toggle(currency: string, network: string, isActive: boolean) {
    await fetch("/api/admin/addresses", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency, network, isActive: !isActive }),
    });
    onRefresh();
  }

  return (
    <div className="space-y-4 max-w-md">
      {items.map((a) => (
        <Card key={`${a.currency}-${a.network}`} padding="md" className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">{a.label} ({a.currency} {a.network})</p>
            <p className="text-xs text-ink-muted break-all">{a.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={a.isActive ? "success" : "muted"} size="sm">{a.isActive ? "Активен" : "Отключён"}</Badge>
            <Button size="sm" variant="ghost" onClick={() => toggle(a.currency, a.network, a.isActive)}>
              {a.isActive ? "Откл." : "Вкл."}
            </Button>
          </div>
        </Card>
      ))}

      <Card padding="lg" className="space-y-3">
        <p className="text-sm font-semibold text-ink">Добавить / изменить адрес</p>
        <select value={currency} onChange={(e) => { setCurrency(e.target.value); setNetwork(e.target.value === "USDT" ? "TRC20" : "BTC"); }} className="bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink">
          <option value="BTC">BTC</option>
          <option value="USDT">USDT (TRC20)</option>
        </select>
        <Input label="Адрес" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="bc1q... или TX..." />
        <Input label="Метка" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Основной BTC" />
        <Button size="sm" onClick={save}>Сохранить</Button>
      </Card>
    </div>
  );
}

// ==========================================================
function BadgesTab() {
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [label, setLabel] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [variant, setVariant] = useState("gold");
  const [effect, setEffect] = useState("solid");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignBadgeId, setAssignBadgeId] = useState("");

  useEffect(() => {
    fetch("/api/admin/badges").then(r => r.json()).then(d => {
      setBadges(d.badges || []);
      setUserBadges(d.userBadges || []);
    });
  }, []);

  async function createBadge() {
    await fetch("/api/admin/badges", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", id: badgeId, label, variant, effect }),
    });
    setLabel(""); setBadgeId(""); setVariant("gold"); setEffect("solid");
    refresh();
  }

  async function assignBadge() {
    await fetch("/api/admin/badges", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", userId: assignUserId, badgeId: assignBadgeId }),
    });
    setAssignUserId(""); setAssignBadgeId("");
    refresh();
  }

  async function removeBadge(userId: string, badgeId: string) {
    await fetch("/api/admin/badges", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", userId, badgeId }),
    });
    refresh();
  }

  function refresh() {
    fetch("/api/admin/badges").then(r => r.json()).then(d => {
      setBadges(d.badges || []);
      setUserBadges(d.userBadges || []);
    });
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Card padding="lg" className="space-y-3">
        <p className="text-sm font-semibold text-ink">Создать новую плашку</p>
        <Input label="ID (латиница)" value={badgeId} onChange={(e) => setBadgeId(e.target.value)} placeholder="vip, verified, custom..." />
        <Input label="Текст" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="VIP" />
        <div className="flex gap-2">
          <select value={variant} onChange={(e) => setVariant(e.target.value)} className="bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink">
            <option value="gold">Золотой</option><option value="success">Зелёный</option><option value="warning">Жёлтый</option>
            <option value="danger">Красный</option><option value="info">Синий</option><option value="muted">Серый</option>
          </select>
          <select value={effect} onChange={(e) => setEffect(e.target.value)} className="bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink">
            <option value="solid">Обычный</option><option value="neon">Неон</option>
            <option value="fire">Огонь</option><option value="outline">Рамка</option>
          </select>
        </div>
        <Button size="sm" onClick={createBadge}>Создать</Button>
      </Card>

      <Card padding="lg" className="space-y-3">
        <p className="text-sm font-semibold text-ink">Выдать плашку пользователю</p>
        <Input label="ID пользователя" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} placeholder="user_..." />
        <select value={assignBadgeId} onChange={(e) => setAssignBadgeId(e.target.value)} className="bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink w-full">
          <option value="">Выберите плашку</option>
          {badges.map((b: any) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
        <Button size="sm" onClick={assignBadge}>Выдать</Button>
      </Card>

      <Card padding="md">
        <p className="text-sm font-semibold text-ink mb-3">Выданные плашки</p>
        {userBadges.map((ub: any, i: number) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-line-subtle last:border-0">
            <span className="text-sm text-ink">{ub.userId}</span>
            <span className="text-xs text-ink-muted">{ub.badgeId}</span>
            <Button size="sm" variant="danger" onClick={() => removeBadge(ub.userId, ub.badgeId)}>Снять</Button>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ==========================================================
// РЕКЛАМА
// ==========================================================
function AdsTab() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [title, setTitle] = useState("");
  const [slot, setSlot] = useState("hero_banner");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [linkUrl, setLinkUrl] = useState("");
  const [priority, setPriority] = useState("0");

  useEffect(() => { fetch("/api/admin/ads").then(r => r.json()).then(d => setAds(Array.isArray(d) ? d : [])); }, []);

  async function create() {
    await fetch("/api/admin/ads", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slot, mediaUrl, mediaType, linkUrl, priority: parseInt(priority) }),
    });
    setTitle(""); setMediaUrl(""); setLinkUrl("");
    refresh();
  }

  async function toggle(id: string) {
    await fetch("/api/admin/ads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle", id }) });
    refresh();
  }

  async function remove(id: string) {
    await fetch("/api/admin/ads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    refresh();
  }

  function refresh() { fetch("/api/admin/ads").then(r => r.json()).then(d => setAds(Array.isArray(d) ? d : [])); }

  return (
    <div className="space-y-6 max-w-lg">
      <Card padding="lg" className="space-y-3">
        <p className="text-sm font-semibold text-ink">Добавить рекламный баннер</p>
        <Input label="Название" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Баннер распродажи" />

        <div>
          <label className="text-xs text-ink-muted mb-1 block">Слот размещения</label>
          <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink">
            <option value="hero_banner">Под приветственным блоком</option>
            <option value="sidebar">Боковая колонка</option>
            <option value="between_sections">Между разделами форума</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink">
            <option value="image">Картинка</option>
            <option value="video">Видео</option>
          </select>
        </div>

        <Input label="Ссылка на медиа (URL)" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://i.imgur.com/..." />
        <Input label="Ссылка для перехода (опционально)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
        <Input label="Приоритет (чем выше — тем раньше показывается)" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
        <Button size="sm" onClick={create}>Добавить баннер</Button>
      </Card>

      <Card padding="md">
        <p className="text-sm font-semibold text-ink mb-3">Все баннеры</p>
        {ads.length === 0 ? (
          <p className="text-xs text-ink-muted text-center py-4">Баннеров пока нет</p>
        ) : (
          ads.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-line-subtle last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">{a.title}</p>
                <p className="text-2xs text-ink-muted">{a.slot} · {a.media_type} · приоритет {a.priority}</p>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant={a.is_active ? "success" : "muted"} size="sm">
                  {a.is_active ? "Активен" : "Выкл"}
                </Badge>
                <Button size="sm" variant="ghost" onClick={() => toggle(a.id)}>
                  {a.is_active ? "🔵" : "⚫"}
                </Button>
                <Button size="sm" variant="danger" onClick={() => remove(a.id)}>✕</Button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
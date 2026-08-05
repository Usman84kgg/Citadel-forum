"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DepositItem { id: string; userId: string; currency: string; amount: number; method: string; txId?: string; status: string; createdAt: string; }
interface WithdrawalItem { id: string; userId: string; currency: string; amount: number; method: string; addressTo: string; status: string; createdAt: string; }
interface AddressItem { id: string; currency: string; network: string; address: string; label: string; isActive: boolean; }
interface AdItem {
  id: string;
  title: string;
  slot: string;
  media_url: string | null;
  media_type: string;
  text_content: string | null;
  link_url: string | null;
  is_active: boolean;
  priority: number;
}

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
function AddressesTab({
  items,
  onRefresh,
}: {
  items: AddressItem[];
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [currency, setCurrency] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (!address) { setError("Введите адрес"); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", currency, network, address, label }),
    });
    setSaving(false);
    if (res.ok) {
      setAddress("");
      setLabel("");
      setShowForm(false);
      onRefresh();
    } else {
      const d = await res.json();
      setError(d.error || "Ошибка");
    }
  }

  async function toggle(id: string, current: boolean) {
    await fetch("/api/admin/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", id, isActive: !current }),
    });
    onRefresh();
  }

  async function remove(id: string) {
    if (!confirm("Удалить адрес?")) return;
    await fetch("/api/admin/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onRefresh();
  }

  const qrUrl = (addr: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(addr)}&bgcolor=ffffff&color=000000&margin=6`;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-ink-muted">
          Адреса для пополнения ({items.length})
        </p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Отмена" : "Добавить адрес"}
        </Button>
      </div>

      {showForm && (
        <Card padding="lg" className="space-y-3">
          <p className="text-sm font-semibold text-ink">Новый адрес</p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-2xs text-ink-muted mb-1 block">Валюта</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  setNetwork(e.target.value === "BTC" ? "Bitcoin" : e.target.value === "ETH" ? "ERC20" : e.target.value === "TON" ? "TON" : "TRC20");
                }}
                className="w-full rounded-control bg-surface border border-line-subtle px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold-400"
              >
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="TON">TON</option>
              </select>
            </div>
            <div>
              <label className="text-2xs text-ink-muted mb-1 block">Сеть</label>
              <input
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                placeholder="TRC20, ERC20, Bitcoin..."
                className="w-full rounded-control bg-surface border border-line-subtle px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>

          <Input
            label="Адрес кошелька"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Вставьте адрес..."
          />

          <Input
            label="Метка (необязательно)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Например: Основной USDT"
          />

          {address.length > 10 && (
            <div className="flex flex-col items-center gap-2 py-2">
              <p className="text-2xs text-ink-muted">QR-код (превью)</p>
              <img
                src={qrUrl(address)}
                alt="QR-код"
                className="rounded-lg border border-line-subtle"
                width={140}
                height={140}
              />
            </div>
          )}

          {error && <p className="text-xs text-danger">{error}</p>}

          <Button size="sm" disabled={saving} onClick={create} className="w-full">
            {saving ? "Сохранение..." : "Сохранить адрес"}
          </Button>
        </Card>
      )}

      {items.length === 0 ? (
        <Card padding="md">
          <p className="text-sm text-ink-muted text-center">
            Адреса не добавлены. Нажмите «Добавить адрес».
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id} padding="md">
              <div className="flex gap-4 items-start">
                <div className="shrink-0">
                  <img
                    src={qrUrl(a.address)}
                    alt="QR"
                    width={100}
                    height={100}
                    className="rounded-lg border border-line-subtle bg-white"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-ink">{a.currency}</span>
                    <span className="text-2xs text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full">{a.network}</span>
                    {a.label && <span className="text-2xs text-ink-faint">{a.label}</span>}
                    <Badge variant={a.isActive ? "success" : "muted"} size="sm">
                      {a.isActive ? "Активен" : "Выключен"}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-ink break-all">{a.address}</p>
                  <div className="flex gap-1 pt-1 flex-wrap">
                    <Button size="sm" variant="ghost" type="button" onClick={() => navigator.clipboard.writeText(a.address)}>
                      Скопировать
                    </Button>
                    <Button size="sm" variant={a.isActive ? "secondary" : "ghost"} type="button" onClick={() => toggle(a.id, a.isActive)}>
                      {a.isActive ? "Выключить" : "Включить"}
                    </Button>
                    <Button size="sm" variant="danger" type="button" onClick={() => remove(a.id)}>
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
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
function AdsTab() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("text");
  const [textContent, setTextContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [priority, setPriority] = useState("0");
  const [errorMsg, setErrorMsg] = useState("");

  const slot = "banner";

  useEffect(() => {
    fetch("/api/admin/ads")
      .then(r => r.json())
      .then(d => setAds(Array.isArray(d) ? d : []))
      .catch(err => console.error("Ошибка загрузки ads:", err));
  }, []);

  async function create() {
    setErrorMsg("");
    if (!title.trim()) { setErrorMsg("Введите название"); return; }
    if (!textContent.trim() && !mediaUrl.trim()) { setErrorMsg("Введите текст или ссылку на медиа"); return; }
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slot, mediaUrl, mediaType, textContent, linkUrl, priority: parseInt(priority) }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitle(""); setMediaUrl(""); setTextContent(""); setLinkUrl("");
        refresh();
      } else {
        setErrorMsg(data.details || data.error || "Ошибка создания");
      }
    } catch (err) {
      setErrorMsg("Ошибка сети: " + err);
    }
  }

  async function toggle(id: string) {
    await fetch("/api/admin/ads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle", id }) });
    refresh();
  }

  async function remove(id: string) {
    await fetch("/api/admin/ads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    refresh();
  }

  function refresh() {
    fetch("/api/admin/ads")
      .then(r => r.json())
      .then(d => setAds(Array.isArray(d) ? d : []));
  }

  return (
    <div className="space-y-6 max-w-lg">
      <Card padding="lg" className="space-y-3">
        <p className="text-sm font-semibold text-ink">Добавить объявление / баннер</p>
        <p className="text-xs text-ink-muted">
          Баннер один общий на всю платформу: показывается сверху главной и через каждые 6 публикаций в форуме/маркете.
          Если баннеров несколько — они крутятся по кругу.
        </p>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <Input label="Название (для админки)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новогодняя распродажа" />

        <div>
          <label className="text-xs text-ink-muted mb-1 block">Тип медиа</label>
          <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="w-full bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink">
            <option value="text">Только текст</option>
            <option value="image">Картинка (JPG/PNG)</option>
            <option value="gif">GIF-анимация</option>
            <option value="video">Видео (MP4)</option>
          </select>
        </div>

        {mediaType !== "text" && (
          <Input label="Ссылка на медиа (URL)" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://i.imgur.com/..." />
        )}

        <div>
          <label className="text-xs text-ink-muted mb-1 block">Текст объявления</label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Грандиозная скидка 50% на все услуги!"
            rows={3}
            className="w-full rounded-control bg-surface border border-line-subtle p-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-gold-400 resize-none"
          />
        </div>

        <Input label="Ссылка для перехода (опционально)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
        <Input label="Приоритет (чем выше — тем раньше показывается)" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
        <Button size="sm" onClick={create}>Добавить</Button>
      </Card>

      <Card padding="md">
        <p className="text-sm font-semibold text-ink mb-3">Все объявления</p>
        {ads.length === 0 ? (
          <p className="text-xs text-ink-muted text-center py-4">Объявлений пока нет</p>
        ) : (
          ads.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-line-subtle last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">{a.title}</p>
                <p className="text-2xs text-ink-muted">{a.media_type}</p>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant={a.is_active ? "success" : "muted"} size="sm">{a.is_active ? "Активно" : "Выкл"}</Badge>
                <Button size="sm" variant="ghost" onClick={() => toggle(a.id)}>{a.is_active ? "Откл." : "Вкл."}</Button>
                <Button size="sm" variant="danger" onClick={() => remove(a.id)}>Удалить</Button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
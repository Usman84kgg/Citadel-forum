function AdsTab() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [title, setTitle] = useState("");
  const [slot, setSlot] = useState("slot_1");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("text");
  const [textContent, setTextContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [priority, setPriority] = useState("0");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => { 
    fetch("/api/admin/ads")
      .then(r => r.json())
      .then(d => setAds(Array.isArray(d) ? d : []))
      .catch(err => console.error("Ошибка загрузки ads:", err));
  }, []);

  async function create() {
    setErrorMsg("");
    
    if (!title.trim()) {
      setErrorMsg("Введите название");
      return;
    }
    if (!textContent.trim() && !mediaUrl.trim()) {
      setErrorMsg("Введите текст или ссылку на медиа");
      return;
    }

    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slot, mediaUrl, mediaType, textContent, linkUrl, priority: parseInt(priority) }),
      });
      
      const data = await res.json();
      console.log("Ответ API:", data);
      
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
        
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
            ❌ {errorMsg}
          </div>
        )}
        
        <Input label="Название (для админки)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новогодняя распродажа" />

        <div>
          <label className="text-xs text-ink-muted mb-1 block">Выберите слот (блок на главной)</label>
          <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full bg-surface border border-line-subtle rounded-control px-3 py-2 text-sm text-ink">
            <option value="slot_1">Рекламный блок 1</option>
            <option value="slot_2">Рекламный блок 2</option>
            <option value="slot_3">Рекламный блок 3</option>
            <option value="slot_4">Рекламный блок 4</option>
            <option value="slot_5">Рекламный блок 5</option>
            <option value="slot_6">Рекламный блок 6</option>
          </select>
        </div>

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
                <p className="text-2xs text-ink-muted">{a.slot} · {a.media_type}</p>
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
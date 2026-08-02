// Найди место где map по threads и замени на это:
{threads.map((t: any) => {
  const author = t.author;
  const authorName = author?.username || "Аноним";
  const authorAvatar = author?.avatar_url || null;
  
  return (
    <Link
      key={t.id}
      href={`/forum/${slug}/${t.id}`}
      className="flex items-center gap-3 px-4 py-3 border-b border-line-subtle last:border-0 hover:bg-surface-2 transition-colors"
    >
      {/* Аватар автора */}
      <div className="shrink-0">
        {authorAvatar ? (
          <img 
            src={authorAvatar} 
            alt={authorName}
            className="h-8 w-8 rounded-full object-cover border border-line-subtle"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-surface-3 flex items-center justify-center text-2xs font-bold text-gold-400">
            {authorName[0]?.toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {t.is_pinned && <Badge variant="warning" size="sm">📌</Badge>}
          {t.is_locked && <Badge variant="danger" size="sm">🔒</Badge>}
          <p className="text-sm font-medium text-ink truncate">{t.title}</p>
        </div>
        <p className="text-2xs text-ink-muted mt-0.5">
          {authorName} · {new Date(t.created_at).toLocaleDateString("ru-RU")}
        </p>
      </div>
      
      <div className="text-right shrink-0">
        <p className="text-xs text-ink-muted">{t.view_count} просм.</p>
        <p className="text-xs text-ink-muted">{t.post_count} отв.</p>
      </div>
    </Link>
  );
})}
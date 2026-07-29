"use client";

import { useEffect, useState } from "react";

interface Ad {
  id: string;
  title: string;
  slot: string;
  media_url: string;
  media_type: string;
  link_url: string;
  is_active: boolean;
  priority: number;
}

export function AdBanner({ slot = "hero_banner" }: { slot?: string }) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetch("/api/admin/ads")
      .then((r) => r.json())
      .then((data) => {
        const active = Array.isArray(data)
          ? data
              .filter((a: Ad) => a.slot === slot && a.is_active)
              .sort((a: Ad, b: Ad) => b.priority - a.priority)[0]
          : null;
        setAd(active || null);
      });
  }, [slot]);

  if (!ad) {
    return (
      <div className="citadel-container py-2">
        <div className="citadel-card bg-surface border border-dashed border-line-strong flex items-center justify-center h-16 text-ink-faint text-xs uppercase tracking-wide">
          Реклама — настраивается в админ-панели
        </div>
      </div>
    );
  }

  return (
    <div className="citadel-container py-2">
      <a
        href={ad.link_url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="citadel-card bg-surface border border-line-subtle overflow-hidden h-20 relative group">
          {ad.media_type === "video" ? (
            <video
              src={ad.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
          ) : (
            <img
              src={ad.media_url}
              alt={ad.title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/70 bg-black/40 px-3 py-1 rounded-full">
              {ad.title || "Подробнее"}
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}
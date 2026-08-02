"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Ad {
  id: string;
  title: string;
  slot: string;
  media_url: string | null;
  media_type: string;
  text_content: string | null;
  link_url: string | null;
  priority: number;
  is_active: boolean;
}

const ALL_SLOTS = [
  { key: "slot_1", title: "Рекламный блок 1" },
  { key: "slot_2", title: "Рекламный блок 2" },
  { key: "slot_3", title: "Рекламный блок 3" },
  { key: "slot_4", title: "Рекламный блок 4" },
  { key: "slot_5", title: "Рекламный блок 5" },
  { key: "slot_6", title: "Рекламный блок 6" },
];

export default function AdSlots() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollIndexes, setScrollIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/ads")
      .then((r) => r.json())
      .then((data) => {
        const activeAds = Array.isArray(data) ? data.filter((a: Ad) => a.is_active) : [];
        setAds(activeAds);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Инициализация индексов
  useEffect(() => {
    if (ads.length === 0) return;
    const initial: Record<string, number> = {};
    ALL_SLOTS.forEach((s) => {
      const count = ads.filter((a) => a.slot === s.key).length;
      if (count > 0) initial[s.key] = 0;
    });
    setScrollIndexes(initial);
  }, [ads]);

  // Автопрокрутка каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndexes((prev) => {
        const next = { ...prev };
        ALL_SLOTS.forEach((s) => {
          const count = ads.filter((a) => a.slot === s.key).length;
          if (count > 2) {
            next[s.key] = ((next[s.key] ?? 0) + 1) % (count - 2);
          }
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [ads]);

  const getAdsBySlot = (slotName: string) => {
    return ads
      .filter((ad) => ad.slot === slotName)
      .sort((a, b) => b.priority - a.priority);
  };

  const renderAdContent = (ad: Ad) => {
    if (ad.media_type === "video" && ad.media_url) {
      return (
        <video
          src={ad.media_url}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      );
    }
    if ((ad.media_type === "image" || ad.media_type === "gif") && ad.media_url) {
      return (
        <img
          src={ad.media_url}
          alt={ad.title}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-3 text-center h-full">
        {ad.text_content && (
          <p className="text-xs sm:text-sm font-medium text-ink mb-1">
            {ad.text_content}
          </p>
        )}
        {ad.title && <p className="text-2xs text-ink-muted">{ad.title}</p>}
      </div>
    );
  };

  const AdSlot = ({ slotKey, title }: { slotKey: string; title: string }) => {
    const slotAds = getAdsBySlot(slotKey);
    const scrollIndex = scrollIndexes[slotKey] ?? 0;

    if (slotAds.length === 0) {
      return (
        <Card
          padding="md"
          className="border border-dashed border-line-subtle bg-surface/30"
        >
          <p className="text-xs text-ink-muted text-center py-2">
            {title} — настройте в админ-панели
          </p>
        </Card>
      );
    }

    // Показываем до 3 объявлений одновременно
    const visibleAds = slotAds.slice(scrollIndex, scrollIndex + 3);
    const hasMore = slotAds.length > 3;

    return (
      <Card
        padding="none"
        className="relative overflow-hidden border border-gold-400/20"
      >
        <div className="relative w-full bg-surface-2">
          {/* Контейнер с несколькими объявлениями */}
          <div className="flex overflow-hidden">
            {visibleAds.map((ad, idx) => {
              const Wrapper = ad.link_url ? "a" : "div";
              const wrapperProps = ad.link_url
                ? {
                    href: ad.link_url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "block group flex-1 min-w-0",
                  }
                : { className: "block flex-1 min-w-0" };

              return (
                <Wrapper key={ad.id} {...wrapperProps}>
                  <div className="relative h-24 sm:h-28 border-r border-line-subtle last:border-r-0 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center animate-fadeIn">
                      {renderAdContent(ad)}
                    </div>
                    <Badge
                      variant="gold"
                      size="sm"
                      className="absolute top-1 left-1 pointer-events-none z-10 scale-75"
                    >
                      Рекл.
                    </Badge>
                  </div>
                </Wrapper>
              );
            })}
          </div>

          {/* Индикаторы прокрутки */}
          {hasMore && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {Array.from({ length: slotAds.length - 2 }, (_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === scrollIndex ? "w-4 bg-gold-400" : "w-1 bg-ink-muted/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="citadel-container py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              padding="md"
              className="h-24 bg-surface animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="citadel-container py-4 space-y-4">
      <h2 className="font-display text-sm font-bold text-ink mb-3">
        Партнёры и реклама
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ALL_SLOTS.map((s) => (
          <AdSlot key={s.key} slotKey={s.key} title={s.title} />
        ))}
      </div>
    </div>
  );
}
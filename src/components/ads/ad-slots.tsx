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
  const [currentIndexes, setCurrentIndexes] = useState<Record<string, number>>({});

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

  // Инициализация индексов (всегда начинаем с 0)
  useEffect(() => {
    if (ads.length === 0) return;
    const initial: Record<string, number> = {};
    ALL_SLOTS.forEach((s) => {
      const count = ads.filter((a) => a.slot === s.key).length;
      if (count > 0) initial[s.key] = 0;
    });
    setCurrentIndexes(initial);
  }, [ads]);

  // Автопереключение каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndexes((prev) => {
        const next = { ...prev };
        ALL_SLOTS.forEach((s) => {
          const count = ads.filter((a) => a.slot === s.key).length;
          if (count > 1) {
            // Переключаем на следующую, если дошли до конца — начинаем сначала
            next[s.key] = ((next[s.key] ?? 0) + 1) % count;
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
    // Текстовый режим на весь блок
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
        {ad.text_content && (
          <p className="text-base sm:text-lg font-medium text-ink mb-2">
            {ad.text_content}
          </p>
        )}
        {ad.title && <p className="text-xs text-ink-muted">{ad.title}</p>}
      </div>
    );
  };

  const AdSlot = ({ slotKey, title }: { slotKey: string; title: string }) => {
    const slotAds = getAdsBySlot(slotKey);
    const currentIndex = currentIndexes[slotKey] ?? 0;

    if (slotAds.length === 0) {
      return (
        <Card
          padding="md"
          className="border border-dashed border-line-subtle bg-surface/30 h-32 sm:h-40 flex items-center justify-center"
        >
          <p className="text-xs text-ink-muted text-center">
            {title} — настройте в админ-панели
          </p>
        </Card>
      );
    }

    // Берем ТОЛЬКО ОДНУ текущую рекламу
    const currentAd = slotAds[currentIndex];

    const Wrapper = currentAd.link_url ? "a" : "div";
    const wrapperProps = currentAd.link_url
      ? {
          href: currentAd.link_url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "block w-full h-full",
        }
      : { className: "block w-full h-full" };

    return (
      <Card
        padding="none"
        className="relative overflow-hidden border border-gold-400/20 hover:border-gold-400/50 transition-all h-32 sm:h-40"
      >
        <Wrapper {...wrapperProps}>
          {/* Контейнер на весь слот */}
          <div className="relative w-full h-full bg-surface-2 flex items-center justify-center">
            {/* Ключ = id объявления. При смене индекса React пересоздает элемент и запускает анимацию */}
            <div
              key={currentAd.id}
              className="absolute inset-0 flex items-center justify-center animate-fadeIn"
            >
              {renderAdContent(currentAd)}
            </div>

            <Badge
              variant="gold"
              size="sm"
              className="absolute top-2 left-2 pointer-events-none z-10"
            >
              Реклама
            </Badge>

            {/* Точки-индикаторы внизу */}
            {slotAds.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {slotAds.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === currentIndex
                        ? "w-6 bg-gold-400"
                        : "w-1.5 bg-ink-muted/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Wrapper>
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
              className="h-32 sm:h-40 bg-surface animate-pulse"
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
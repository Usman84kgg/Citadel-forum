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

export default function AdSlots() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlides, setActiveSlides] = useState<Record<string, number>>({});

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

  // Автоматическая прокрутка каждые 5 секунд для каждого слота
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlides((prev) => {
        const newSlides = { ...prev };
        Object.keys(newSlides).forEach((slot) => {
          const slotAds = ads.filter((ad) => ad.slot === slot);
          if (slotAds.length > 1) {
            newSlides[slot] = (newSlides[slot] + 1) % slotAds.length;
          }
        });
        return newSlides;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [ads]);

  const getAdsBySlot = (slotName: string) => {
    return ads.filter((ad) => ad.slot === slotName).sort((a, b) => b.priority - a.priority);
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
      <div className="flex flex-col items-center justify-center p-4 text-center h-full">
        {ad.text_content && (
          <p className="text-sm sm:text-base font-medium text-ink mb-1">{ad.text_content}</p>
        )}
        {ad.title && (
          <p className="text-xs text-ink-muted">{ad.title}</p>
        )}
      </div>
    );
  };

  const AdSlot = ({ slotName, title }: { slotName: string; title: string }) => {
    const slotAds = getAdsBySlot(slotName);
    const currentSlide = activeSlides[slotName] || 0;

    if (slotAds.length === 0) {
      return (
        <Card padding="md" className="border border-dashed border-line-subtle bg-surface/30">
          <p className="text-xs text-ink-muted text-center py-2">
            {title} — настройте в админ-панели
          </p>
        </Card>
      );
    }

    const currentAd = slotAds[currentSlide];
    const Wrapper = currentAd.link_url ? "a" : "div";
    const wrapperProps = currentAd.link_url
      ? { 
          href: currentAd.link_url, 
          target: "_blank", 
          rel: "noopener noreferrer",
          className: "block group" 
        }
      : { className: "block" };

    return (
      <Wrapper {...wrapperProps}>
        <Card padding="none" className="relative overflow-hidden border border-gold-400/20 hover:border-gold-400/50 transition-all">
          <div className="relative w-full h-24 sm:h-28 bg-surface-2 flex items-center justify-center">
            {/* Анимированный переход */}
            <div 
              key={currentAd.id}
              className="absolute inset-0 flex items-center justify-center animate-fadeIn"
            >
              {renderAdContent(currentAd)}
            </div>
            
            <Badge variant="gold" size="sm" className="absolute top-2 left-2 pointer-events-none z-10">
              Реклама
            </Badge>

            {/* Индикаторы (точки) */}
            {slotAds.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {slotAds.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === currentSlide ? "w-6 bg-gold-400" : "w-1.5 bg-ink-muted/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </Wrapper>
    );
  };

  if (loading) {
    return (
      <div className="citadel-container py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} padding="md" className="h-24 bg-surface animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="citadel-container py-4 space-y-4">
      <h2 className="font-display text-sm font-bold text-ink mb-3">Партнёры и реклама</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AdSlot slotName="slot_1" title="Рекламный блок 1" />
        <AdSlot slotName="slot_2" title="Рекламный блок 2" />
        <AdSlot slotName="slot_3" title="Рекламный блок 3" />
        <AdSlot slotName="slot_4" title="Рекламный блок 4" />
        <AdSlot slotName="slot_5" title="Рекламный блок 5" />
        <AdSlot slotName="slot_6" title="Рекламный блок 6" />
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Ad {
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

let cachedAds: Ad[] | null = null;
let cachedPromise: Promise<Ad[]> | null = null;

function loadAds(): Promise<Ad[]> {
  if (cachedAds) return Promise.resolve(cachedAds);
  if (cachedPromise) return cachedPromise;

  cachedPromise = fetch("/api/admin/ads")
    .then((r) => r.json())
    .then((data) => {
      const active = Array.isArray(data)
        ? data
            .filter((a: Ad) => a.slot === "banner" && a.is_active)
            .sort((a: Ad, b: Ad) => b.priority - a.priority)
        : [];
      cachedAds = active;
      return active;
    })
    .catch(() => {
      cachedAds = [];
      return [];
    });

  return cachedPromise;
}

interface AdCarouselProps {
  showPlaceholder?: boolean;
  className?: string;
}

export function AdCarousel({ showPlaceholder = false, className = "" }: AdCarouselProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAds().then((data) => {
      setAds(data);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (ads.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % ads.length), 5000);
    return () => clearInterval(t);
  }, [ads.length]);

  if (!loaded) return null;

  if (ads.length === 0) {
    if (!showPlaceholder) return null;
    return (
      <div className={`citadel-container py-2 ${className}`}>
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface h-40 sm:h-48 flex items-center justify-center">
          <p className="text-xs text-ink-faint uppercase tracking-wide">
            Реклама — настраивается в админ-панели
          </p>
        </div>
      </div>
    );
  }

  const ad = ads[index];
  const Wrapper = ad.link_url ? "a" : "div";
  const wrapperProps = ad.link_url
    ? { href: ad.link_url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <div className={`citadel-container py-2 ${className}`}>
      <Wrapper {...(wrapperProps as any)} className="block">
        <Card padding="none" className="relative overflow-hidden h-40 sm:h-48 rounded-2xl">
          <div key={ad.id} className="absolute inset-0 animate-fadeIn">
            {ad.media_type === "video" && ad.media_url ? (
              <video
                src={ad.media_url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (ad.media_type === "image" || ad.media_type === "gif") && ad.media_url ? (
              <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center bg-surface-2">
                {ad.text_content && (
                  <p className="text-base sm:text-lg font-medium text-ink mb-2">{ad.text_content}</p>
                )}
                {ad.title && <p className="text-xs text-ink-muted">{ad.title}</p>}
              </div>
            )}
          </div>

          {ads.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {ads.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === index ? "w-6 bg-gold-400" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </Card>
      </Wrapper>
    </div>
  );
}
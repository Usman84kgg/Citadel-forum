"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdBanner } from "@/components/ads/ad-banner";

export default function HomePage() {
  return (
    <div className="space-y-0 pb-8">
      <AdBanner />
      <WelcomeBlock />
      <div className="citadel-container space-y-4">
        <AnnouncementBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ForumSections />
          </div>
          <div className="space-y-4">
            <TopUsers />
            <LatestDeals />
          </div>
        </div>
        <LatestListings />
        <OnlineNow />
      </div>
    </div>
  );
}

function WelcomeBlock() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <section className="relative overflow-hidden bg-surface-2 border-b border-line-subtle">
      <img src="/AADEF62D-15DC-44AE-880F-AEBCDF96F03A.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-base via-base/80 to-transparent" />
      <div className="citadel-container relative py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-brand text-ink-muted mb-2">Добро пожаловать в</p>
            <h1 className="citadel-gold-text font-display text-4xl sm:text-5xl font-bold uppercase tracking-wider2 mb-3">CITADEL</h1>
            <p className="text-sm text-ink-secondary max-w-lg leading-relaxed mb-4">Приватное сообщество для общения, безопасных сделок и размещения услуг в одном месте.</p>
            <div className="flex flex-wrap gap-3 mb-4"> **…**

_This response is too long to display in full._
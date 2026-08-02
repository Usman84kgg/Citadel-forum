"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { BadgeEffect, BadgeVariant } from "@/components/ui/badge";
import type { AuthorBadge, AuthorStats } from "@/lib/db/userProfile";

interface AuthorCardProps {
  username: string;
  avatarUrl: string | null;
  badges: AuthorBadge[];
  stats: AuthorStats;
  size?: "lg" | "sm";
}

function formatBalance(amount: number) {
  if (amount > 10000) return `$${(amount / 100).toFixed(0)}`;
  return `$${amount.toFixed(0)}`;
}

export function AuthorCard({ username, avatarUrl, badges, stats, size = "lg" }: AuthorCardProps) {
  const isLarge = size === "lg";
  const avatarSize = isLarge ? "h-16 w-16" : "h-9 w-9";
  const nameSize = isLarge ? "text-lg" : "text-sm";

  return (
    <div className="flex items-center gap-3">
      <Link href={`/u/${username}`} className="shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className={`${avatarSize} rounded-full object-cover border-2 border-line-gold`}
          />
        ) : (
          <div
            className={`${avatarSize} rounded-full bg-surface-3 flex items-center justify-center font-bold text-gold-400 border-2 border-line-gold`}
          >
            {username?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/u/${username}`}
          className={`${nameSize} font-display font-bold text-ink hover:text-gold-400 transition-colors`}
        >
          {username}
        </Link>

        <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
          <div className="flex items-center gap-2.5 text-xs text-ink-muted shrink-0">
            <span>{formatBalance(stats.balance)}</span>
            <span>
              ⭐ {stats.reputation > 0 ? `+${stats.reputation}` : stats.reputation || "-"}
            </span>
            <span>💼 {stats.deals}</span>
          </div>

          <AuthorBadges badges={badges} large={isLarge} />
        </div>
      </div>
    </div>
  );
}

function AuthorBadges({ badges, large }: { badges: AuthorBadge[]; large: boolean }) {
  if (!badges || badges.length === 0) return null;

  // Одна плашка — показываем крупнее, несколько — сеткой мелких
  if (badges.length === 1) {
    const b = badges[0];
    return (
      <div style={{ transform: large ? "scale(1.35)" : "scale(1.1)" }} className="origin-right">
        <Badge variant={b.variant as BadgeVariant} effect={b.effect as BadgeEffect} size="sm">
          {b.label}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-1 max-w-[160px]">
      {badges.map((b) => (
        <div key={b.id} style={{ transform: "scale(0.85)" }} className="origin-right">
          <Badge variant={b.variant as BadgeVariant} effect={b.effect as BadgeEffect} size="sm">
            {b.label}
          </Badge>
        </div>
      ))}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthorCard } from "@/components/forum/author-card";
import type { AuthorBadge, AuthorStats } from "@/lib/db/userProfile";

interface PublicUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface Listing {
  id: string;
  title: string;
  price: number | null;
  status: string;
  created_at: string;
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [badges, setBadges] = useState<AuthorBadge[]>([]);
  const [stats, setStats] = useState<AuthorStats>({ balance: 0, reputation: 0, deals: 0 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/user/${username}`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setUser(data.user);
        setBadges(data.badges || []);
        setStats(data.stats || { balance: 0, reputation: 0, deals: 0 });
        setListings(data.listings || []);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="citadel-container py-16 text-center text-ink-muted text-sm">
        Загрузка...
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="citadel-container py-16 text-center text-ink-muted text-sm">
        Пользователь не найден
      </div>
    );
  }

  return (
    <div className="citadel-container py-6 space-y-4">
      <Card padding="lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <AuthorCard
            username={user.username}
            avatarUrl={user.avatarUrl}
            badges={badges}
            stats={stats}
            size="lg"
          />
          <Link href={`/messages/new?to=${user.id}`}>
            <Button size="sm">Написать сообщение</Button>
          </Link>
        </div>
        <p className="text-2xs text-ink-faint mt-3">
          На платформе с {new Date(user.createdAt).toLocaleDateString("ru-RU")}
        </p>
      </Card>

      <div>
        <h2 className="font-display text-sm font-bold text-ink mb-2">Объявления пользователя</h2>
        {listings.length === 0 ? (
          <Card padding="md">
            <p className="text-sm text-ink-muted text-center">Объявлений пока нет</p>
          </Card>
        ) : (
          <Card padding="none">
            {listings.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line-subtle last:border-0"
              >
                <p className="text-sm text-ink truncate">{l.title}</p>
                <p className="text-xs text-ink-muted shrink-0">
                  {l.price ? `$${(l.price / 100).toFixed(2)}` : "—"}
                </p>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
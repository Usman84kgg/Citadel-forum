import { supabase } from "./supabase";
import { walletDB } from "./wallet";

export interface AuthorBadge {
  id: string;
  label: string;
  variant: string;
  effect: string;
}

export interface AuthorStats {
  balance: number;
  reputation: number;
  deals: number;
}

export interface AuthorProfileData {
  badges: AuthorBadge[];
  stats: AuthorStats;
}

/**
 * Забирает плашки, репутацию, количество сделок и баланс
 * для набора пользователей одним пакетом (чтобы не делать
 * по 5 запросов на каждого автора темы/поста/комментария).
 */
export async function getAuthorsProfileData(
  userIds: string[]
): Promise<Record<string, AuthorProfileData>> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const result: Record<string, AuthorProfileData> = {};

  for (const id of uniqueIds) {
    result[id] = { badges: [], stats: { balance: 0, reputation: 0, deals: 0 } };
  }

  if (uniqueIds.length === 0) return result;

  const [badgesRes, dealsAsBuyer, dealsAsSeller, reviewsRes, balances] =
    await Promise.all([
      supabase
        .from("user_badges")
        .select("id, user_id, label, variant, effect")
        .in("user_id", uniqueIds),
      supabase
        .from("deals")
        .select("buyer_id, seller_id, status")
        .in("buyer_id", uniqueIds),
      supabase
        .from("deals")
        .select("buyer_id, seller_id, status")
        .in("seller_id", uniqueIds),
      supabase
        .from("reviews")
        .select("target_user_id, is_positive")
        .in("target_user_id", uniqueIds),
      Promise.all(
        uniqueIds.map((id) =>
          walletDB
            .getBalance(id)
            .then((b) => ({ id, balance: Number(b.available) || 0 }))
            .catch(() => ({ id, balance: 0 }))
        )
      ),
    ]);

  // Плашки
  for (const row of badgesRes.data || []) {
    if (result[row.user_id]) {
      result[row.user_id].badges.push({
        id: row.id,
        label: row.label,
        variant: row.variant,
        effect: row.effect,
      });
    }
  }

  // Сделки (покупатель + продавец)
  const allDeals = [...(dealsAsBuyer.data || []), ...(dealsAsSeller.data || [])];
  for (const d of allDeals) {
    if (d.buyer_id && result[d.buyer_id]) result[d.buyer_id].stats.deals += 1;
    if (d.seller_id && result[d.seller_id]) result[d.seller_id].stats.deals += 1;
  }

  // Репутация
  for (const r of reviewsRes.data || []) {
    if (!result[r.target_user_id]) continue;
    result[r.target_user_id].stats.reputation += r.is_positive ? 1 : -1;
  }

  // Баланс
  for (const b of balances) {
    if (result[b.id]) result[b.id].stats.balance = b.balance;
  }

  return result;
}

/** То же самое, но для одного пользователя — удобно для страницы профиля */
export async function getAuthorProfileData(
  userId: string
): Promise<AuthorProfileData> {
  const map = await getAuthorsProfileData([userId]);
  return map[userId] || { badges: [], stats: { balance: 0, reputation: 0, deals: 0 } };
}
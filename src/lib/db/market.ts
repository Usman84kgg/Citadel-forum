import { supabase } from "./supabase";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\wа-яё\s-]/gi, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "listing"}-${suffix}`;
}

async function attachSellerInfo<T extends { seller_id: string }>(rows: T[]) {
  const ids = Array.from(new Set(rows.map((r) => r.seller_id).filter(Boolean)));
  if (ids.length === 0) return rows.map((r) => ({ ...r, seller_username: null, seller_avatar_url: null }));

  try {
    const { data } = await supabase.from("users").select("id, username, avatar_url").in("id", ids);
    const map = new Map((data || []).map((u: any) => [u.id, u]));
    return rows.map((r) => {
      const u = map.get(r.seller_id);
      return { ...r, seller_username: u?.username || null, seller_avatar_url: u?.avatar_url || null };
    });
  } catch {
    return rows.map((r) => ({ ...r, seller_username: null, seller_avatar_url: null }));
  }
}

export const marketDB = {
  async getListings(category?: string) {
    let query = supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false });
    if (category) {
      const { data: cat } = await supabase.from("listing_categories").select("id").eq("slug", category).single();
      if (cat) query = query.eq("category_id", cat.id);
    }
    const { data } = await query;
    return attachSellerInfo(data || []);
  },

  async getListing(id: string) {
    const { data } = await supabase.from("listings").select("*").eq("id", id).single();
    if (!data) return null;
    const [enriched] = await attachSellerInfo([data]);
    return enriched;
  },

  async createListing(data: {
    title: string;
    description: string;
    price: number;
    categorySlug: string;
    sellerId: string;
    type: string;
    imageUrl?: string | null;
  }) {
    const { data: cat, error: catError } = await supabase
      .from("listing_categories")
      .select("id")
      .eq("slug", data.categorySlug)
      .single();

    if (catError || !cat) {
      throw new Error(`Категория "${data.categorySlug}" не найдена: ${catError?.message || "нет данных"}`);
    }

    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        title: data.title,
        slug: generateSlug(data.title),
        description: data.description,
        price: Math.round(data.price * 100),
        category_id: cat.id,
        seller_id: data.sellerId,
        type: data.type,
        status: "active",
        image_url: data.imageUrl || null,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Ошибка создания объявления: ${insertError.message}`);
    }

    return listing;
  },

  async getCategories() {
    const { data } = await supabase.from("listing_categories").select("*").eq("is_active", true).order("sort_order");
    return data || [];
  },

  async updateListingStatus(id: string, status: string) {
    const { data } = await supabase.from("listings").update({ status }).eq("id", id).select().single();
    return data;
  },

  async getComments(listingId: string) {
    const { data } = await supabase
      .from("listing_comments")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: true });

    if (!data) return [];
    const withNames = await attachSellerInfo(
      data.map((c: any) => ({ ...c, seller_id: c.user_id }))
    );
    return withNames.map((c: any) => ({
      id: c.id,
      content: c.content,
      createdAt: c.created_at,
      username: c.seller_username,
      avatarUrl: c.seller_avatar_url,
    }));
  },

  async createComment(params: { listingId: string; userId: string; content: string }) {
    const { data, error } = await supabase
      .from("listing_comments")
      .insert({ listing_id: params.listingId, user_id: params.userId, content: params.content })
      .select()
      .single();
    if (error) throw new Error(`Ошибка добавления комментария: ${error.message}`);
    return data;
  },
};

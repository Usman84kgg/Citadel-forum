import { supabase } from "./supabase";

async function attachSellerNames<T extends { seller_id: string }>(rows: T[]) {
  const ids = Array.from(new Set(rows.map((r) => r.seller_id).filter(Boolean)));
  if (ids.length === 0) return rows.map((r) => ({ ...r, seller_username: null }));

  try {
    const { data } = await supabase.from("users").select("id, username").in("id", ids);
    const map = new Map((data || []).map((u: any) => [u.id, u.username]));
    return rows.map((r) => ({ ...r, seller_username: map.get(r.seller_id) || null }));
  } catch {
    return rows.map((r) => ({ ...r, seller_username: null }));
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
    return attachSellerNames(data || []);
  },

  async getListing(id: string) {
    const { data } = await supabase.from("listings").select("*").eq("id", id).single();
    if (!data) return null;
    const [enriched] = await attachSellerNames([data]);
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
};

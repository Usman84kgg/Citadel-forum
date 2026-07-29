import { supabase } from "./supabase";

export const marketDB = {
  async getListings(category?: string) {
    let query = supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false });
    if (category) {
      const { data: cat } = await supabase.from("listing_categories").select("id").eq("slug", category).single();
      if (cat) query = query.eq("category_id", cat.id);
    }
    const { data } = await query;
    return data || [];
  },

  async getListing(id: string) {
    const { data } = await supabase.from("listings").select("*").eq("id", id).single();
    return data;
  },

  async createListing(data: { title: string; description: string; price: number; categorySlug: string; sellerId: string; type: string }) {
    const { data: cat } = await supabase.from("listing_categories").select("id").eq("slug", data.categorySlug).single();
    const { data: listing } = await supabase.from("listings").insert({
      title: data.title,
      description: data.description,
      price: Math.round(data.price * 100),
      category_id: cat?.id,
      seller_id: data.sellerId,
      type: data.type,
      status: "active",
    }).select().single();
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
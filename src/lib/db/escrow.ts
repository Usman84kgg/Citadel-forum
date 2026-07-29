import { supabase } from "./supabase";

export const escrowDB = {
  async getDeals(userId: string, status?: string) {
    let query = supabase.from("deals").select("*").or(`buyer_id.eq.${userId},seller_id.eq.${userId}`).order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data } = await query;
    return data || [];
  },
  async getDeal(dealId: string) {
    const { data: deal } = await supabase.from("deals").select("*").eq("id", dealId).single();
    return deal;
  },
  async createDeal(p: { title: string; description: string; amount: number; buyerId: string; sellerId: string }) {
    const code = "CTD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data } = await supabase.from("deals").insert({
      code, title: p.title, description: p.description,
      amount: Math.round(p.amount * 100), buyer_id: p.buyerId, seller_id: p.sellerId,
      currency_id: "USD", status: "draft", fee_percent: 2,
      fee_amount: Math.round(p.amount * 100 * 0.02), fee_payer: "seller",
    }).select().single();
    return data;
  },
  async updateDealStatus(dealId: string, status: string, actorId: string, note?: string) {
    const { data: deal } = await supabase.from("deals").update({ status }).eq("id", dealId).select().single();
    await supabase.from("deal_events").insert({ deal_id: dealId, actor_id: actorId, to_status: status, note: note || null });
    return deal;
  },
  async getDealEvents(dealId: string) {
    const { data } = await supabase.from("deal_events").select("*").eq("deal_id", dealId).order("created_at");
    return data || [];
  },
  async getDealMessages(dealId: string) {
    const { data } = await supabase.from("deal_messages").select("*").eq("deal_id", dealId).order("created_at");
    return data || [];
  },
  async sendDealMessage(dealId: string, senderId: string, content: string, isSystem = false) {
    const { data } = await supabase.from("deal_messages").insert({ deal_id: dealId, sender_id: senderId, content, is_system_message: isSystem }).select().single();
    return data;
  },
};
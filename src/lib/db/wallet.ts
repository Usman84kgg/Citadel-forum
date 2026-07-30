import { supabase } from "./supabase";

export const walletDB = {
  async getBalance(userId: string) {
    const { data } = await supabase
      .from("accounts")
      .select("balance, type")
      .eq("user_id", userId);

    const available =
      data?.find((a) => a.type === "available")?.balance ?? 0;
    const hold = data?.find((a) => a.type === "hold")?.balance ?? 0;

    return { available, hold, total: available + hold };
  },

  async createDeposit(params: {
    userId: string;
    currency: string;
    amount: number;
    method: string;
    txId?: string;
  }) {
    const { data } = await supabase
      .from("deposits")
      .insert({
        user_id: params.userId,
        currency_id: params.currency === "BTC" ? "BTC" : "USDT",
        amount: params.amount,
        method: params.method,
        tx_id: params.txId || null,
        status: "pending",
      })
      .select()
      .single();
    return data;
  },

  async getDeposits(userId: string) {
    const { data } = await supabase
      .from("deposits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data || [];
  },

  async createWithdrawal(params: {
    userId: string;
    currency: string;
    amount: number;
    method: string;
    addressTo: string;
  }) {
    const { data } = await supabase
      .from("withdrawals")
      .insert({
        user_id: params.userId,
        currency_id: params.currency === "BTC" ? "BTC" : "USDT",
        amount: params.amount,
        method: params.method,
        address_to: params.addressTo,
        status: "pending",
      })
      .select()
      .single();
    return data;
  },

  async getWithdrawals(userId: string) {
    const { data } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return data || [];
  },

  async getAddresses() {
    const { data } = await supabase
      .from("payment_addresses")
      .select("*")
      .eq("is_active", true);
    return data || [];
  },

  // --- Админские методы ---

  async getPendingDeposits() {
    const { data } = await supabase
      .from("deposits")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    return data || [];
  },

  async confirmDeposit(depositId: string, adminNote?: string) {
    // Получаем депозит
    const { data: deposit } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", depositId)
      .single();

    if (!deposit) return null;

    // Обновляем статус
    await supabase
      .from("deposits")
      .update({ status: "confirmed", admin_note: adminNote || null })
      .eq("id", depositId);

    // Зачисляем на баланс
    await supabase.rpc("credit_balance", {
      p_user_id: deposit.user_id,
      p_amount: deposit.amount,
    });

    return deposit;
  },

  async getPendingWithdrawals() {
    const { data } = await supabase
      .from("withdrawals")
      .select("*")
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false });
    return data || [];
  },

  async approveWithdrawal(id: string) {
    await supabase
      .from("withdrawals")
      .update({ status: "approved" })
      .eq("id", id);
  },

  async markWithdrawalPaid(id: string, txId?: string) {
    const { data: withdrawal } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", id)
      .single();

    if (!withdrawal) return;

    await supabase
      .from("withdrawals")
      .update({ status: "paid", tx_id: txId || null })
      .eq("id", id);

    // Списываем с баланса
    await supabase.rpc("debit_balance", {
      p_user_id: withdrawal.user_id,
      p_amount: withdrawal.amount,
    });
  },

  async rejectWithdrawal(id: string, note?: string) {
    await supabase
      .from("withdrawals")
      .update({ status: "rejected", admin_note: note || null })
      .eq("id", id);
  },

  async updateAddress(
    currency: string,
    network: string,
    address: string,
    label: string,
  ) {
    const { data: existing } = await supabase
      .from("payment_addresses")
      .select("id")
      .eq("currency_id", currency)
      .eq("network", network)
      .single();

    if (existing) {
      await supabase
        .from("payment_addresses")
        .update({ address, label })
        .eq("id", existing.id);
    } else {
      await supabase.from("payment_addresses").insert({
        currency_id: currency,
        network,
        address,
        label,
        is_active: true,
        created_by: "admin",
      });
    }
  },

  async toggleAddress(
    currency: string,
    network: string,
    isActive: boolean,
  ) {
    await supabase
      .from("payment_addresses")
      .update({ is_active: isActive })
      .eq("currency_id", currency)
      .eq("network", network);
  },
};
import { supabase } from "./supabase";

export const walletDB = {
  async getBalance(userId: string) {
    const { data } = await supabase
      .from("accounts")
      .select("balance, type")
      .eq("user_id", userId);

    const available = data?.find((a: any) => a.type === "available")?.balance ?? 0;
    const hold = data?.find((a: any) => a.type === "hold")?.balance ?? 0;

    return { available, hold, total: available + hold, currency: "USD" };
  },

  async getAddresses() {
    const { data } = await supabase
      .from("payment_addresses")
      .select("*")
      .eq("is_active", true);
    return data || [];
  },

  async createDeposit(params: {
    userId: string;
    currency: string;
    amount: number;
    method: string;
    txId?: string;
  }) {
    const { data, error } = await supabase
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

    if (error) throw error;
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
    const { data, error } = await supabase
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

    if (error) throw error;
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

  // Админские методы
  async getPendingDeposits() {
    const { data } = await supabase
      .from("deposits")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    return data || [];
  },

  async confirmDeposit(depositId: string) {
    // Получаем депозит
    const { data: deposit } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", depositId)
      .single();

    if (!deposit) return null;

    // Обновляем статус
    await supabase.from("deposits").update({ status: "confirmed" }).eq("id", depositId);

    // Зачисляем на баланс
    const { data: account } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", deposit.user_id)
      .eq("type", "available")
      .single();

    if (account) {
      await supabase
        .from("accounts")
        .update({ balance: account.balance + deposit.amount })
        .eq("id", account.id);
    } else {
      await supabase.from("accounts").insert({
        user_id: deposit.user_id,
        currency_id: "USD",
        type: "available",
        balance: deposit.amount,
      });
    }

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

  async processWithdrawal(withdrawalId: string, action: string, txId?: string) {
    if (action === "approve") {
      await supabase.from("withdrawals").update({ status: "approved" }).eq("id", withdrawalId);
      return;
    }

    if (action === "paid") {
      const { data: withdrawal } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("id", withdrawalId)
        .single();

      if (!withdrawal) return;

      await supabase
        .from("withdrawals")
        .update({ status: "paid", tx_id: txId || null })
        .eq("id", withdrawalId);

      // Списываем с баланса
      const { data: account } = await supabase
        .from("accounts")
        .select("id, balance")
        .eq("user_id", withdrawal.user_id)
        .eq("type", "available")
        .single();

      if (account) {
        await supabase
          .from("accounts")
          .update({ balance: Math.max(0, account.balance - withdrawal.amount) })
          .eq("id", account.id);
      }
    }

    if (action === "reject") {
      await supabase.from("withdrawals").update({ status: "rejected" }).eq("id", withdrawalId);
    }
  },

  async updateAddress(currency: string, network: string, address: string, label: string) {
    const { data: existing } = await supabase
      .from("payment_addresses")
      .select("id")
      .eq("currency_id", currency)
      .eq("network", network)
      .single();

    if (existing) {
      await supabase.from("payment_addresses").update({ address, label }).eq("id", existing.id);
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

  async toggleAddress(currency: string, network: string, isActive: boolean) {
    await supabase
      .from("payment_addresses")
      .update({ is_active: isActive })
      .eq("currency_id", currency)
      .eq("network", network);
  },

  async manualCredit(userId: string, amount: number) {
    const { data: account } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", userId)
      .eq("type", "available")
      .single();

    if (account) {
      await supabase
        .from("accounts")
        .update({ balance: account.balance + amount })
        .eq("id", account.id);
    } else {
      await supabase.from("accounts").insert({
        user_id: userId,
        currency_id: "USD",
        type: "available",
        balance: amount,
      });
    }

    return { success: true };
  },

  async manualDebit(userId: string, amount: number) {
    const { data: account } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("user_id", userId)
      .eq("type", "available")
      .single();

    if (!account || account.balance < amount) {
      return { success: false, error: "Недостаточно средств" };
    }

    await supabase
      .from("accounts")
      .update({ balance: account.balance - amount })
      .eq("id", account.id);

    return { success: true };
  },
};
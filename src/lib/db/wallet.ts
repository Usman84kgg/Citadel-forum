import { supabase } from "./supabase";

async function getAccount(userId: string, type: "available" | "hold") {
  const { data } = await supabase
    .from("accounts")
    .select("id, balance")
    .eq("user_id", userId)
    .eq("type", type)
    .single();
  return data;
}

async function ensureAccount(userId: string, type: "available" | "hold") {
  const existing = await getAccount(userId, type);
  if (existing) return existing;
  const { data, error } = await supabase
    .from("accounts")
    .insert({ user_id: userId, type, balance: 0 })
    .select("id, balance")
    .single();
  if (error) throw error;
  return data;
}

async function setBalance(accountId: string, newBalance: number) {
  const { error } = await supabase
    .from("accounts")
    .update({ balance: newBalance })
    .eq("id", accountId);
  if (error) throw error;
}

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
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    return (data || []).map((a: any) => ({
      id: a.id,
      currency: a.currency,
      network: a.network,
      address: a.address,
      label: a.label,
      isActive: a.is_active,
    }));
  },

  async getAllAddresses() {
    const { data } = await supabase
      .from("payment_addresses")
      .select("*")
      .order("created_at", { ascending: true });
    return (data || []).map((a: any) => ({
      id: a.id,
      currency: a.currency,
      network: a.network,
      address: a.address,
      label: a.label,
      isActive: a.is_active,
    }));
  },

  async createAddress(params: {
    currency: string;
    network: string;
    address: string;
    label: string;
  }) {
    const { data, error } = await supabase
      .from("payment_addresses")
      .insert({
        currency: params.currency,
        network: params.network,
        address: params.address,
        label: params.label,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAddress(id: string, params: { address: string; label: string }) {
    const { error } = await supabase
      .from("payment_addresses")
      .update({ address: params.address, label: params.label })
      .eq("id", id);
    if (error) throw error;
  },

  async toggleAddress(id: string, isActive: boolean) {
    const { error } = await supabase
      .from("payment_addresses")
      .update({ is_active: isActive })
      .eq("id", id);
    if (error) throw error;
  },

  async deleteAddress(id: string) {
    const { error } = await supabase
      .from("payment_addresses")
      .delete()
      .eq("id", id);
    if (error) throw error;
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
        currency: params.currency,
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

  // ИСПРАВЛЕНО: теперь при создании заявки сумма реально замораживается
  // (списывается из available, зачисляется в hold), а не просто создаётся запись.
  async createWithdrawal(params: {
    userId: string;
    currency: string;
    amount: number;
    method: string;
    addressTo: string;
  }) {
    const { userId, amount } = params;

    const availableAccount = await ensureAccount(userId, "available");
    if (availableAccount.balance < amount) {
      throw new Error("Недостаточно средств");
    }

    const holdAccount = await ensureAccount(userId, "hold");

    // Списываем с available и переносим в hold — замораживаем деньги под заявку
    await setBalance(availableAccount.id, availableAccount.balance - amount);
    await setBalance(holdAccount.id, holdAccount.balance + amount);

    const { data, error } = await supabase
      .from("withdrawals")
      .insert({
        user_id: params.userId,
        currency: params.currency,
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

  async getPendingDeposits() {
    const { data } = await supabase
      .from("deposits")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    return (data || []).map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      currency: d.currency,
      amount: d.amount,
      method: d.method,
      txId: d.tx_id,
      status: d.status,
      createdAt: d.created_at,
    }));
  },

  async confirmDeposit(depositId: string) {
    const { data: deposit } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", depositId)
      .single();

    if (!deposit) return null;

    await supabase
      .from("deposits")
      .update({ status: "confirmed" })
      .eq("id", depositId);

    const account = await ensureAccount(deposit.user_id, "available");
    await setBalance(account.id, account.balance + deposit.amount);

    return deposit;
  },

  async getPendingWithdrawals() {
    const { data } = await supabase
      .from("withdrawals")
      .select("*")
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false });
    return (data || []).map((w: any) => ({
      id: w.id,
      userId: w.user_id,
      currency: w.currency,
      amount: w.amount,
      method: w.method,
      addressTo: w.address_to,
      status: w.status,
      createdAt: w.created_at,
    }));
  },

  // ИСПРАВЛЕНО: approve/complete/reject теперь работают с hold, а не с available,
  // потому что деньги уже заморожены на этапе createWithdrawal.
  async processWithdrawal(withdrawalId: string, action: string, txId?: string) {
    const { data: w, error: fetchErr } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single();
    if (fetchErr) throw fetchErr;
    if (!w) throw new Error("Заявка на вывод не найдена");

    if (w.status !== "pending" && w.status !== "approved") {
      throw new Error(`Заявка уже обработана (статус: ${w.status})`);
    }

    if (action === "approve") {
      // Деньги уже в hold с момента создания заявки — просто меняем статус
      const { error } = await supabase
        .from("withdrawals")
        .update({ status: "approved" })
        .eq("id", withdrawalId);
      if (error) throw error;
    } else if (action === "complete") {
      const holdAccount = await getAccount(w.user_id, "hold");
      if (!holdAccount || holdAccount.balance < w.amount) {
        throw new Error("Недостаточно замороженных средств для завершения вывода");
      }

      const { error: updErr } = await supabase
        .from("withdrawals")
        .update({ status: "completed", tx_id: txId || null })
        .eq("id", withdrawalId);
      if (updErr) throw updErr;

      // Окончательно списываем из hold — деньги покидают систему
      await setBalance(holdAccount.id, holdAccount.balance - w.amount);
    } else if (action === "reject") {
      const holdAccount = await getAccount(w.user_id, "hold");
      if (!holdAccount || holdAccount.balance < w.amount) {
        throw new Error("Несоответствие замороженного баланса при отклонении заявки");
      }

      const { error: updErr } = await supabase
        .from("withdrawals")
        .update({ status: "rejected" })
        .eq("id", withdrawalId);
      if (updErr) throw updErr;

      // Возвращаем из hold обратно в available — размораживаем
      const availableAccount = await ensureAccount(w.user_id, "available");
      await setBalance(holdAccount.id, holdAccount.balance - w.amount);
      await setBalance(availableAccount.id, availableAccount.balance + w.amount);
    } else {
      throw new Error(`Неизвестное действие: ${action}`);
    }

    return { success: true };
  },

  async manualCredit(userId: string, amount: number) {
    const account = await ensureAccount(userId, "available");
    await setBalance(account.id, account.balance + amount);
    return { success: true };
  },

  async manualDebit(userId: string, amount: number) {
    const account = await getAccount(userId, "available");
    if (!account || account.balance < amount) {
      return { success: false, error: "Недостаточно средств" };
    }
    await setBalance(account.id, account.balance - amount);
    return { success: true };
  },
};

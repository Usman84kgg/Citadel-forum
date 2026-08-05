// src/lib/db/wallet.ts
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

  async processWithdrawal(withdrawalId: string, action: string, txId?: string) {
    // Получаем данные заявки перед обработкой
    const { data: w, error: fetchErr } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single();
    if (fetchErr) throw fetchErr;
    if (!w) throw new Error("Заявка на вывод не найдена");

    if (action === "approve") {
      // Просто меняем статус – при необходимости можно заблокировать средства в hold
      const { error } = await supabase
        .from("withdrawals")
        .update({ status: "approved" })
        .eq("id", withdrawalId);
      if (error) throw error;
      // TODO: реализовать перемещение суммы из available в hold, если hold используется
    } else if (action === "complete") {
      // Помечаем как выплачено
      const { error: updErr } = await supabase
        .from("withdrawals")
        .update({ status: "completed", tx_id: txId || null })
        .eq("id", withdrawalId);
      if (updErr) throw updErr;

      // Списываем сумму с баланса пользователя (available)
      const { data: account } = await supabase
        .from("accounts")
        .select("id, balance")
        .eq("user_id", w.user_id)
        .eq("type", "available")
        .single();

      if (!account) {
        throw new Error("Available account not found");
      }
      if (account.balance < w.amount) {
        throw new Error("Недостаточно средств для выполнения вывода");
      }

      await supabase
        .from("accounts")
        .update({ balance: account.balance - w.amount })
        .eq("id", account.id);
    } else if (action === "reject") {
      const { error: updErr } = await supabase
        .from("withdrawals")
        .update({ status: "rejected" })
        .eq("id", withdrawalId);
      if (updErr) throw updErr;

      // Возвращаем сумму на баланс пользователя
      const { data: account } = await supabase
        .from("accounts")
        .select("id, balance")
        .eq("user_id", w.user_id)
        .eq("type", "available")
        .single();

      if (account) {
        await supabase
          .from("accounts")
          .update({ balance: account.balance + w.amount })
          .eq("id", account.id);
      } else {
        await supabase.from("accounts").insert({
          user_id: w.user_id,
          type: "available",
          balance: w.amount,
        });
      }
    } else {
      throw new Error(`Неизвестное действие: ${action}`);
    }

    return { success: true };
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
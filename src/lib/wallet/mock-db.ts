// Временное хранилище кошельков (заменится на Prisma)

type AccountType = "available" | "hold";

interface WalletAccount {
  userId: string;
  currency: string;
  type: AccountType;
  balance: number; // в центах (USD) или сатоши
}

interface Deposit {
  id: string;
  userId: string;
  currency: string;
  amount: number;
  method: string;
  addressFrom?: string;
  txId?: string;
  status: "pending" | "confirmed" | "rejected";
  adminNote?: string;
  createdAt: Date;
}

interface Withdrawal {
  id: string;
  userId: string;
  currency: string;
  amount: number;
  method: string;
  addressTo: string;
  txId?: string;
  status: "pending" | "approved" | "paid" | "rejected";
  adminNote?: string;
  createdAt: Date;
}

interface PaymentAddress {
  currency: string;
  network: string;
  address: string;
  label: string;
  isActive: boolean;
}

// Начальные данные
const accounts: WalletAccount[] = [
  { userId: "mock_user_1", currency: "USD", type: "available", balance: 245075 }, // $2 450.75
  { userId: "mock_user_1", currency: "USD", type: "hold", balance: 0 },
];

const deposits: Deposit[] = [];
const withdrawals: Withdrawal[] = [];

const paymentAddresses: PaymentAddress[] = [
  { currency: "BTC", network: "BTC", address: "bc1q_admin_wallet_address_here", label: "Основной BTC", isActive: true },
  { currency: "USDT", network: "TRC20", address: "TX_admin_usdt_wallet_address_here", label: "Основной USDT", isActive: true },
];

let depositIdCounter = 0;
let withdrawalIdCounter = 0;

export const walletDB = {
  // Аккаунты
  getBalance(userId: string, currency = "USD") {
    const acc = accounts.find((a) => a.userId === userId && a.currency === currency && a.type === "available");
    return acc?.balance ?? 0;
  },
  getHoldBalance(userId: string, currency = "USD") {
    const acc = accounts.find((a) => a.userId === userId && a.currency === currency && a.type === "hold");
    return acc?.balance ?? 0;
  },

  // Депозиты
  createDeposit(data: { userId: string; currency: string; amount: number; method: string; addressFrom?: string; txId?: string }) {
    const id = `dep_${++depositIdCounter}`;
    const deposit: Deposit = { id, ...data, status: "pending", createdAt: new Date() };
    deposits.push(deposit);
    return deposit;
  },
  getDeposits(userId: string) {
    return deposits.filter((d) => d.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
  getPendingDeposits() {
    return deposits.filter((d) => d.status === "pending");
  },
  confirmDeposit(id: string, adminNote?: string) {
    const deposit = deposits.find((d) => d.id === id);
    if (deposit) {
      deposit.status = "confirmed";
      deposit.adminNote = adminNote;
      // Зачисляем баланс
      const acc = accounts.find((a) => a.userId === deposit.userId && a.currency === "USD" && a.type === "available");
      if (acc) acc.balance += deposit.amount;
    }
    return deposit;
  },

  // Выводы
  createWithdrawal(data: { userId: string; currency: string; amount: number; method: string; addressTo: string }) {
    const id = `wit_${++withdrawalIdCounter}`;
    const withdrawal: Withdrawal = { id, ...data, status: "pending", createdAt: new Date() };
    withdrawals.push(withdrawal);
    return withdrawal;
  },
  getWithdrawals(userId: string) {
    return withdrawals.filter((w) => w.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
  getPendingWithdrawals() {
    return withdrawals.filter((w) => w.status === "pending" || w.status === "approved");
  },
  approveWithdrawal(id: string) {
    const w = withdrawals.find((w) => w.id === id);
    if (w) w.status = "approved";
    return w;
  },
  markWithdrawalPaid(id: string, txId?: string) {
    const w = withdrawals.find((w) => w.id === id);
    if (w) {
      w.status = "paid";
      w.txId = txId;
      // Списываем баланс
      const acc = accounts.find((a) => a.userId === w.userId && a.currency === "USD" && a.type === "available");
      if (acc) acc.balance -= w.amount;
    }
    return w;
  },
  rejectWithdrawal(id: string, note?: string) {
    const w = withdrawals.find((w) => w.id === id);
    if (w) {
      w.status = "rejected";
      w.adminNote = note;
    }
    return w;
  },

  // Ручные операции
  manualCredit(userId: string, amount: number, note?: string) {
    const acc = accounts.find((a) => a.userId === userId && a.currency === "USD" && a.type === "available");
    if (acc) acc.balance += amount;
    return { success: true, note };
  },
  manualDebit(userId: string, amount: number, note?: string) {
    const acc = accounts.find((a) => a.userId === userId && a.currency === "USD" && a.type === "available");
    if (acc && acc.balance >= amount) {
      acc.balance -= amount;
      return { success: true, note };
    }
    return { success: false, error: "Недостаточно средств" };
  },
  freezeFunds(userId: string, amount: number) {
    const avail = accounts.find((a) => a.userId === userId && a.currency === "USD" && a.type === "available");
    const hold = accounts.find((a) => a.userId === userId && a.currency === "USD" && a.type === "hold");
    if (avail && hold && avail.balance >= amount) {
      avail.balance -= amount;
      hold.balance += amount;
      return { success: true };
    }
    return { success: false, error: "Недостаточно средств" };
  },
  unfreezeFunds(userId: string, amount: number) {
    const avail = accounts.find((a) => a.userId === userId && a.currency === "USD" && a.type === "available");
    const hold = accounts.find((a) => a.userId === userId && a.currency === "USD" && a.type === "hold");
    if (avail && hold && hold.balance >= amount) {
      hold.balance -= amount;
      avail.balance += amount;
      return { success: true };
    }
    return { success: false, error: "Недостаточно замороженных средств" };
  },

  // Адреса
  getActiveAddresses() {
    return paymentAddresses.filter((a) => a.isActive);
  },
  updateAddress(currency: string, network: string, address: string, label: string) {
    const existing = paymentAddresses.find((a) => a.currency === currency && a.network === network);
    if (existing) {
      existing.address = address;
      existing.label = label;
    } else {
      paymentAddresses.push({ currency, network, address, label, isActive: true });
    }
    return existing || paymentAddresses[paymentAddresses.length - 1];
  },
  toggleAddress(currency: string, network: string, isActive: boolean) {
    const addr = paymentAddresses.find((a) => a.currency === currency && a.network === network);
    if (addr) addr.isActive = isActive;
    return addr;
  },

  // Полная история (для админки)
  getAllHistory() {
    const depHistory = deposits.map((d) => ({ type: "deposit", ...d }));
    const witHistory = withdrawals.map((w) => ({ type: "withdrawal", ...w }));
    return [...depHistory, ...witHistory].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
};
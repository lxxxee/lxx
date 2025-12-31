export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  date: string; // ISO Date string
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
}

export interface AiResponseSchema {
  transactions: {
    description: string;
    category: string;
    amount: number;
    type: string; // "INCOME" or "EXPENSE"
    date?: string; // Optional, AI might infer "yesterday"
  }[];
}

// src/services/transactionService.ts
import apiClient from "@/services/apiClient";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  date: string; // "YYYY-MM-DD"
  category: number | null;
  category_name: string | null;
};

export type TransactionPayload = {
  description: string;
  amount: number;
  type: TransactionType;
  date: string; // "YYYY-MM-DD"
  category?: number | null;
};

export type TransactionFilters = {
  type?: TransactionType | "all";
  categoryId?: number;
  search?: string;
};

export const getTransactions = async (
  filters?: TransactionFilters
): Promise<Transaction[]> => {
  const params: Record<string, string> = {};

  if (filters?.type && filters.type !== "all") {
    params.type = filters.type;
  }
  if (filters?.categoryId) {
    params.category = String(filters.categoryId);
  }
  if (filters?.search) {
    params.search = filters.search;
  }

  const res = await apiClient.get<Transaction[]>("transactions/", {
    params,
  });
  return res.data;
};

export const createTransaction = async (
  payload: TransactionPayload
): Promise<Transaction> => {
  const res = await apiClient.post<Transaction>("transactions/", payload);
  return res.data;
};

export const updateTransaction = async (
  id: number,
  payload: TransactionPayload
): Promise<Transaction> => {
  const res = await apiClient.put<Transaction>(`transactions/${id}/`, payload);
  return res.data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await apiClient.delete(`transactions/${id}/`);
};

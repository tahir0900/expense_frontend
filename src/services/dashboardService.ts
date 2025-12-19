// src/services/dashboardService.ts
import apiClient from "@/services/apiClient";

export type DashboardSummary = {
  total_income: number;
  total_expenses: number;
  balance: number;
};

export type DashboardChartPoint = {
  month: string;
  income: number;
  expenses: number;
};

export type DashboardTransaction = {
  id: number;
  description: string;
  amount: number;
  category: number | null;
  category_name: string | null;
  type: "income" | "expense";
  date: string;
};

export type DashboardResponse = {
  summary: DashboardSummary;
  chart: DashboardChartPoint[];
  recent_transactions: DashboardTransaction[];
};

export const fetchDashboard = async (): Promise<DashboardResponse> => {
  const res = await apiClient.get<DashboardResponse>("dashboard/summary/");
  return res.data;
};

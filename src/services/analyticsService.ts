// src/services/analyticsService.ts
import apiClient from "@/services/apiClient";

export type CategoryAnalyticsPoint = {
  name: string;
  value: number;
};

export type TrendPoint = {
  month: string;
  amount: number;
};

export type AnalyticsOverview = {
  category_data: CategoryAnalyticsPoint[];
  trend_data: TrendPoint[];
  average_daily_spending: number;
  top_category: string | null;
  top_category_percent: number | null;
  savings_rate: number | null;
};

export const fetchAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  const res = await apiClient.get<AnalyticsOverview>("analytics/overview/");
  return res.data;
};

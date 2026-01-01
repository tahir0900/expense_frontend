// src/pages/Analytics.tsx
import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsOverview } from "@/services/analyticsService";
import { toast } from "sonner";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

const MONTH_ORDER: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  Mayy: 5, // ignore if you don't want; remove if not needed
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

function parseMonthYear(monthStr: string) {
  const parts = monthStr.trim().split(/\s+/);
  const monthName = parts[0];
  const year = parts[1]
    ? Number.parseInt(parts[1], 10)
    : new Date().getFullYear();
  const monthNum = MONTH_ORDER[monthName] ?? 0;
  return { year, month: monthNum, original: monthStr };
}

function EmptyChartState({ text }: { text: string }) {
  return (
    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
      {text}
    </div>
  );
}

export default function Analytics() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: fetchAnalyticsOverview,
  });

  // ✅ move side-effect out of render
  useEffect(() => {
    if (isError) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.error("Failed to load analytics data");
    }
  }, [isError, error]);

  const categoryData = data?.category_data ?? [];

  const trendData = useMemo(() => {
    const trend = data?.trend_data ?? [];
    return [...trend].sort((a, b) => {
      const parsedA = parseMonthYear(a.month);
      const parsedB = parseMonthYear(b.month);

      if (parsedA.year !== parsedB.year) return parsedA.year - parsedB.year;
      return parsedA.month - parsedB.month;
    });
  }, [data]);

  const averageDailySpending = data?.average_daily_spending ?? 0;
  const topCategory = data?.top_category ?? "N/A";
  const topCategoryPercent = data?.top_category_percent ?? null;
  const savingsRate = data?.savings_rate ?? null;

  const renderCategoryChart = () => {
    if (isLoading) return <EmptyChartState text="Loading chart..." />;
    if (categoryData.length === 0)
      return <EmptyChartState text="Not enough data yet." />;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, idx) => (
              <Cell
                key={`category-${entry.name}`}
                fill={COLORS[idx % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderTrendChart = () => {
    if (isLoading) return <EmptyChartState text="Loading chart..." />;
    if (trendData.length === 0)
      return <EmptyChartState text="Not enough data yet." />;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="month" className="text-muted-foreground" />
          <YAxis className="text-muted-foreground" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const topCategoryText =
    topCategory !== "N/A" && topCategoryPercent !== null
      ? `${topCategoryPercent.toFixed(1)}% of total expenses`
      : "No category data yet";

  const savingsRateText =
    savingsRate !== null ? `${savingsRate.toFixed(1)}%` : "--";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Insights into your spending patterns
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {renderCategoryChart()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>{renderTrendChart()}</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-lg">Average Daily Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              £{averageDailySpending.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Based on last 30 days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-lg">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{topCategory}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {topCategoryText}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-lg">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">{savingsRateText}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Of total income
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
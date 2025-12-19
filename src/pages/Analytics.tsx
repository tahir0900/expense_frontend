// src/pages/Analytics.tsx
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

export default function Analytics() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: fetchAnalyticsOverview,
  });

  if (isError) {
    console.error(error);
    toast.error("Failed to load analytics data");
  }

  const categoryData = data?.category_data ?? [];
  const trendData = data?.trend_data ?? [];
  const averageDailySpending = data?.average_daily_spending ?? 0;
  const topCategory = data?.top_category ?? "N/A";
  const topCategoryPercent = data?.top_category_percent ?? null;
  const savingsRate = data?.savings_rate ?? null;

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
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart...
              </div>
            ) : categoryData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Not enough data yet.
              </div>
            ) : (
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
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart...
              </div>
            ) : trendData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Not enough data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
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
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-lg">Average Daily Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              ${averageDailySpending.toFixed(2)}
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
              {topCategory !== "N/A" && topCategoryPercent !== null
                ? `${topCategoryPercent.toFixed(1)}% of total expenses`
                : "No category data yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-lg">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">
              {savingsRate !== null ? `${savingsRate.toFixed(1)}%` : "--"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Of total income
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

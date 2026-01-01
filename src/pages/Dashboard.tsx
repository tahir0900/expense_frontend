// src/pages/Dashboard.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchDashboard } from "@/services/dashboardService";
import { Skeleton } from "@/components/ui/skeleton"; // if you don't have this, just remove and use plain text
import { toast } from "sonner";

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (isError) {
    // You can type error better if you like; for now just show toast once per mount
    console.error(error);
    toast.error("Failed to load dashboard data");
  }

  const monthOrder: Record<string, number> = {
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
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };

  const parseMonthYear = (monthStr: string) => {
    // Handle formats like "Jan 2024", "January 2024", or just "Jan"
    const parts = monthStr.trim().split(/\s+/);
    const monthName = parts[0];
    const year = parts[1]
      ? Number.parseInt(parts[1])
      : new Date().getFullYear();
    const monthNum = monthOrder[monthName] || 0;
    return { year, month: monthNum, original: monthStr };
  };

  const summaryCards = useMemo(() => {
    const totalIncome = data?.summary.total_income ?? 0;
    const totalExpenses = data?.summary.total_expenses ?? 0;
    const balance = data?.summary.balance ?? 0;

    return [
      {
        title: "Total Income",
        value: `£${totalIncome.toLocaleString()}`,
        icon: TrendingUp,
        // For now static trend text – you can compute real trend later if you add it to the API
        trend: "",
        trendUp: true,
        iconBgColor: "bg-success",
      },
      {
        title: "Total Expenses",
        value: `£${totalExpenses.toLocaleString()}`,
        icon: TrendingDown,
        trend: "",
        trendUp: false,
        iconBgColor: "bg-destructive",
      },
      {
        title: "Balance",
        value: `£${balance.toLocaleString()}`,
        icon: Wallet,
        trend: "",
        trendUp: balance >= 0,
        iconBgColor: "bg-gradient-primary",
      },
    ];
  }, [data]);

  const chartData = useMemo(() => {
    const data_chart = data?.chart ?? [];
    return [...data_chart].sort((a, b) => {
      const parsedA = parseMonthYear(a.month);
      const parsedB = parseMonthYear(b.month);

      // Sort by year first, then by month
      if (parsedA.year !== parsedB.year) {
        return parsedA.year - parsedB.year;
      }
      return parsedA.month - parsedB.month;
    });
  }, [data]);

  const recentTransactions = data?.recent_transactions ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial activity
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => ({
              id: `summary-skeleton-${i}`,
            })).map((item) => (
              <Card key={item.id} className="p-4">
                {/* If you don't have Skeleton, just put "Loading..." */}
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </Card>
            ))
          : summaryCards.map((card) => (
              <SummaryCard key={card.title} {...card} />
            ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
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
                    dataKey="income"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
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
                  <Bar dataKey="income" fill="hsl(var(--success))" />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => ({
                id: `transaction-skeleton-${i}`,
              })).map((item) => (
                <Skeleton key={item.id} className="h-14 w-full" />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No recent transactions yet.
            </p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.type === "income"
                          ? "bg-success/10"
                          : "bg-destructive/10"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {/* backend gives category_name */}
                        {(transaction as any).category_name ||
                          "Uncategorized"}{" "}
                        • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      transaction.type === "income"
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}£
                    {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
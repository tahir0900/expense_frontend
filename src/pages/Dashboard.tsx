// src/pages/Dashboard.tsx
import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/services/dashboardService";
import { toast } from "sonner";

/* ===================== constants ===================== */

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3"];

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

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
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

/* ===================== helpers ===================== */

function parseMonthYear(monthStr: string) {
  const [monthName, yearStr] = monthStr.trim().split(/\s+/);
  return {
    year: Number(yearStr) || new Date().getFullYear(),
    month: MONTH_ORDER[monthName] ?? 0,
  };
}

/* ===================== components ===================== */

type EmptyStateProps = Readonly<{
  text: string;
}>;

function EmptyState({ text }: EmptyStateProps) {
  return (
    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
      {text}
    </div>
  );
}

type EmptyChartStateProps = Readonly<{
  text: string;
}>;

function EmptyChartState({ text }: EmptyChartStateProps) {
  return (
    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
      {text}
    </div>
  );
}

/* ===================== page ===================== */

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchDashboard,
  });

  useEffect(() => {
    if (isError) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    }
  }, [isError, error]);

  const balance = data?.summary.balance ?? 0;
  const income = data?.summary.total_income ?? 0;
  const expenses = data?.summary.total_expenses ?? 0;
  const transactions = data?.recent_transactions ?? [];

  const chartData = useMemo(() => {
    const chart = data?.chart ?? [];
    return [...chart].sort((a, b) => {
      const A = parseMonthYear(a.month);
      const B = parseMonthYear(b.month);
      if (A.year === B.year) {
        return A.month - B.month;
      }

      return A.year - B.year;
    });
  }, [data]);

  /* ===================== render helpers ===================== */

  const renderTransactions = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-14 w-full" />
          ))}
        </div>
      );
    }

    if (!transactions.length) {
      return <EmptyState text="No recent transactions yet." />;
    }

    return (
      <ul className="space-y-3">
        {transactions.map((tx) => (
          <li
            key={tx.id}
            className="flex justify-between items-center p-3 rounded-lg border"
          >
            <div>
              <p className="font-medium">{tx.description}</p>
              <p className="text-sm text-muted-foreground">{tx.date}</p>
            </div>
            <p
              className={`font-semibold ${
                tx.amount < 0 ? "text-destructive" : "text-success"
              }`}
            >
              £{Math.abs(tx.amount).toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
    );
  };

  const renderChartData = () => {
    if (isLoading) return <EmptyChartState text="Loading chart..." />;
    if (!chartData.length)
      return <EmptyChartState text="Not enough data yet." />;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={2}
            name="Income"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ec4899"
            strokeWidth={2}
            name="Expenses"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  /* ===================== JSX ===================== */

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial activity
        </p>
      </div>

      {/* summary cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">£{balance.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">
              £{income.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              £{expenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses Trend</CardTitle>
        </CardHeader>
        <CardContent>{renderChartData()}</CardContent>
      </Card>

      {/* recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>{renderTransactions()}</CardContent>
      </Card>
    </div>
  );
}

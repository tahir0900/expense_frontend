// src/pages/Dashboard.tsx
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview } from "@/services/dashboardService";
import { toast } from "sonner";

/* ===================== constants ===================== */

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3"];

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

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

/* ===================== page ===================== */

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchDashboardOverview,
  });

  useEffect(() => {
    if (isError) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    }
  }, [isError, error]);

  const balance = data?.balance ?? 0;
  const income = data?.income ?? 0;
  const expenses = data?.expenses ?? 0;
  const transactions = data?.recent_transactions ?? [];

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
            <p className="text-3xl font-bold">
              £{balance.toFixed(2)}
            </p>
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

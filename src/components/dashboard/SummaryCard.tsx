import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type SummaryCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  iconBgColor: string;
};

export const SummaryCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  iconBgColor,
}: SummaryCardProps) => {
  return (
    <Card className="bg-gradient-card border-border hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <p
                className={`text-sm font-medium ${
                  trendUp ? "text-success" : "text-destructive"
                }`}
              >
                {trend}
              </p>
            )}
          </div>
          <div className={`${iconBgColor} p-3 rounded-xl`}>
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

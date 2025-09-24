import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, className = "" }: StatCardProps) => {
  return (
    <Card className={`p-6 card-hover ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                trend.isPositive ? "text-success" : "text-destructive"
              }`}>
                {trend.isPositive ? "+" : ""}{trend.value}
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
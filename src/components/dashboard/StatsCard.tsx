import { LucideIcon, TrendingUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "highlight";
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = "default",
  className 
}: StatsCardProps) {
  const isHighlight = variant === "highlight";

  return (
    <div 
      className={cn(
        "stat-card animate-fade-in relative overflow-hidden",
        isHighlight && "bg-primary text-primary-foreground border-primary/50",
        className
      )}
    >
      {/* Background pattern for highlight variant */}
      {isHighlight && (
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path
              d="M0 80 Q 30 60, 60 70 T 120 50 T 180 60 L 200 100 L 0 100 Z"
              fill="currentColor"
              opacity="0.3"
            />
            <path
              d="M0 90 Q 40 70, 80 80 T 160 65 L 200 100 L 0 100 Z"
              fill="currentColor"
              opacity="0.2"
            />
          </svg>
        </div>
      )}

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            isHighlight ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold",
            isHighlight ? "text-primary-foreground" : "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && (
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              isHighlight 
                ? "bg-primary-foreground/20 text-primary-foreground" 
                : "bg-primary/10 text-primary"
            )}>
              {subtitle}
            </span>
          )}
          {trend && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className={cn(
                "w-4 h-4",
                isHighlight ? "text-primary-foreground" : (trend.positive ? "text-success" : "text-destructive"),
                !trend.positive && "rotate-180"
              )} />
              <span className={cn(
                "text-sm font-medium",
                isHighlight ? "text-primary-foreground" : (trend.positive ? "text-success" : "text-destructive")
              )}>
                {trend.positive ? "+" : "-"}{trend.value}%
              </span>
              <span className={cn(
                "text-xs",
                isHighlight ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          isHighlight ? "bg-primary-foreground/20" : "bg-secondary"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            isHighlight ? "text-primary-foreground" : "text-muted-foreground"
          )} />
        </div>
      </div>
    </div>
  );
}

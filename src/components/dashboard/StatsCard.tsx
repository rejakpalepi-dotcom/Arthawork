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
        "stat-card animate-fade-in relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm",
        isHighlight && "bg-primary text-primary-foreground border-primary/50 shadow-[0_18px_48px_-24px_rgba(14,165,233,0.75)]",
        className
      )}
    >

      <div className="relative flex items-start justify-between">
        <div className="space-y-1 md:space-y-2 flex-1 min-w-0">
          <p className={cn(
            "text-xs md:text-sm font-medium truncate",
            isHighlight ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-xl md:text-[1.9rem] font-semibold tracking-tight font-numeric truncate",
            isHighlight ? "text-primary-foreground" : "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && (
            <span className={cn(
              "hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium",
              isHighlight 
                ? "bg-primary-foreground/20 text-primary-foreground" 
                : "bg-primary/10 text-primary"
            )}>
              {subtitle}
            </span>
          )}
          {trend && (
            <div className="flex items-center gap-1 md:gap-1.5">
              <TrendingUp className={cn(
                "w-3 h-3 md:w-4 md:h-4",
                isHighlight ? "text-primary-foreground" : (trend.positive ? "text-success" : "text-destructive"),
                !trend.positive && "rotate-180"
              )} />
              <span className={cn(
                "text-xs md:text-sm font-medium",
                isHighlight ? "text-primary-foreground" : (trend.positive ? "text-success" : "text-destructive")
              )}>
                {trend.positive ? "+" : "-"}{trend.value}%
              </span>
              <span className={cn(
                "text-xs hidden lg:inline",
                isHighlight ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                dibanding bulan lalu
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-2 md:p-3 rounded-lg md:rounded-xl shrink-0 ml-2",
          isHighlight ? "bg-primary-foreground/20" : "bg-secondary"
        )}>
          <Icon className={cn(
            "w-4 h-4 md:w-6 md:h-6",
            isHighlight ? "text-primary-foreground" : "text-muted-foreground"
          )} />
        </div>
      </div>
    </div>
  );
}

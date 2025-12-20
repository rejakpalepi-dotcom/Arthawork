import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [period, setPeriod] = useState<"6months" | "year">("6months");

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Trends</h3>
          <p className="text-sm text-muted-foreground">Monthly income overview</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
          <button
            onClick={() => setPeriod("6months")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              period === "6months" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Last 6 Months
          </button>
        </div>
      </div>
      <div className="h-72">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 100%, 38%)" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="hsl(187, 100%, 38%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(187, 100%, 38%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(0, 0%, 55%)', fontSize: 12 }}
                dy={10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 14%)',
                  border: '1px solid hsl(0, 0%, 20%)',
                  borderRadius: '8px',
                  color: 'hsl(0, 0%, 95%)'
                }}
                formatter={(value: number) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(187, 100%, 38%)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                dot={{ fill: 'hsl(187, 100%, 38%)', strokeWidth: 0, r: 4 }}
                activeDot={{ fill: 'hsl(187, 100%, 45%)', strokeWidth: 3, stroke: 'hsl(0, 0%, 14%)', r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No revenue data yet
          </div>
        )}
      </div>
    </div>
  );
}

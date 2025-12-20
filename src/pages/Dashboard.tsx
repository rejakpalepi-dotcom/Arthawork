import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Receipt, FileText, Users, DollarSign } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, <span className="gradient-text">Creator</span>
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your studio today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value="$24,500"
            subtitle="This month"
            icon={DollarSign}
            trend={{ value: 12.5, positive: true }}
          />
          <StatsCard
            title="Pending Invoices"
            value="8"
            subtitle="$6,200 outstanding"
            icon={Receipt}
            trend={{ value: -3, positive: false }}
          />
          <StatsCard
            title="Active Proposals"
            value="5"
            subtitle="3 awaiting response"
            icon={FileText}
          />
          <StatsCard
            title="Total Clients"
            value="32"
            subtitle="4 new this month"
            icon={Users}
            trend={{ value: 14, positive: true }}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

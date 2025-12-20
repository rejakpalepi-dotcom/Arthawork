import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { Wallet, Bell, Plus, TrendingUp, FileText, Target, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR } from "@/lib/currency";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";
import { SEOHead } from "@/components/seo/SEOHead";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    stats,
    recentInvoices,
    projects,
    loading,
    userName,
    revenueData,
    upcomingDeadlines,
    greeting,
    today,
    acceptanceRate,
    exportReport,
  } = useDashboardData();

  const handleExport = () => {
    exportReport();
    toast.success("Report exported", {
      description: "Your monthly report has been downloaded as a CSV file.",
    });
  };

  return (
    <DashboardLayout>
      <SEOHead 
        title="Dashboard" 
        description="Your Papr business dashboard. Track revenue, manage proposals, invoices, and clients."
        noIndex={true}
      />
      <div className="p-8 font-sans">
        {/* Header with Dynamic Greeting */}
        <header className="flex items-start justify-between mb-8">
          <div>
            {loading ? (
              <>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-48" />
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {greeting}, {userName}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                  {today} • You have {upcomingDeadlines} deadline{upcomingDeadlines !== 1 ? 's' : ''} coming up.
                </p>
              </>
            )}
          </div>
          <nav className="flex items-center gap-3" aria-label="Dashboard actions">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-secondary border-border"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
            </Button>
            <Button 
              className="gap-2" 
              onClick={() => navigate("/projects/new")}
              aria-label="Create a new project"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              New Project
            </Button>
          </nav>
        </header>

        {/* Stats Grid - 4 columns with real-time metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" aria-label="Business metrics">
          {loading ? (
            <>
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </>
          ) : (
            <>
            <StatsCard
                title="Pipeline Value"
                value={formatIDR(stats.pipelineValue)}
                subtitle={`${stats.activeProposals} active proposals`}
                icon={TrendingUp}
                trend={stats.pipelineValue > 0 && stats.pipelineTrend !== 0 ? { value: Math.abs(stats.pipelineTrend), positive: stats.pipelineTrend > 0 } : undefined}
              />
              <StatsCard
                title="Acceptance Rate"
                value={`${acceptanceRate}%`}
                subtitle={`${stats.acceptedProposals} of ${stats.totalProposals} proposals`}
                icon={Target}
                trend={stats.totalProposals > 0 && stats.acceptanceTrend !== 0 ? { value: Math.abs(stats.acceptanceTrend), positive: stats.acceptanceTrend > 0 } : undefined}
              />
              <StatsCard
                title="Active Proposals"
                value={stats.sentProposals.toString()}
                subtitle="Awaiting response"
                icon={FileText}
                trend={stats.sentProposals > 0 && stats.proposalsTrend !== 0 ? { value: Math.abs(stats.proposalsTrend), positive: stats.proposalsTrend > 0 } : undefined}
              />
              <StatsCard
                title="Total Earnings"
                value={formatIDR(stats.totalRevenue)}
                icon={Wallet}
                trend={stats.totalRevenue > 0 && stats.revenueTrend !== 0 ? { value: Math.abs(stats.revenueTrend), positive: stats.revenueTrend > 0 } : undefined}
                variant="highlight"
              />
            </>
          )}
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart - takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Revenue Trends</h2>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleExport}
                disabled={loading}
              >
                <FileDown className="w-4 h-4" />
                Export Report
              </Button>
            </div>
            <RevenueChart data={revenueData} />
          </div>
          
          {/* Right sidebar - Quick Actions & Recent Invoices */}
          <div className="space-y-6">
            <QuickActions />
            <RecentInvoices invoices={recentInvoices} loading={loading} />
          </div>
        </div>

        {/* Active Projects Table + Today's Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActiveProjects projects={projects} loading={loading} />
          </div>
          <div>
            <TodaysFocus />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

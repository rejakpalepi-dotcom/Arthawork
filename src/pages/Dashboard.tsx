import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Wallet, Plus, TrendingUp, FileText, Target, FileDown } from "lucide-react";
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
    refetch,
  } = useDashboardData();

  const handleExport = () => {
    exportReport();
    toast.success("Laporan berhasil diekspor", {
      description: "Laporan bulanan kamu sudah diunduh dalam format CSV.",
    });
  };

  return (
    <DashboardLayout>
      <SEOHead
        title="Dashboard"
        description="Your Artha business dashboard. Track revenue, manage proposals, invoices, and clients."
        noIndex={true}
      />
      <div className="p-4 md:p-8 font-sans">
        {/* Header with Dynamic Greeting */}
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
          <div>
            {loading ? (
              <>
                <Skeleton className="h-8 md:h-9 w-48 md:w-64 mb-2" />
                <Skeleton className="h-4 md:h-5 w-36 md:w-48" />
              </>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-1 md:mb-2">
                  {greeting}, {userName}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  <span className="hidden sm:inline">{today} · </span>
                  {upcomingDeadlines} tenggat akan datang
                </p>
              </>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-3" aria-label="Aksi dashboard">
            <NotificationCenter />
            <Button
              className="gap-2"
              onClick={() => navigate("/projects/new")}
              aria-label="Buat proyek baru"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              PROYEK BARU
            </Button>
          </nav>
        </header>

        {/* Stats Grid - 4 columns with real-time metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8" aria-label="Metrik bisnis">
          {loading ? (
            <>
              <Skeleton className="h-24 md:h-32 rounded-xl" />
              <Skeleton className="h-24 md:h-32 rounded-xl" />
              <Skeleton className="h-24 md:h-32 rounded-xl" />
              <Skeleton className="h-24 md:h-32 rounded-xl" />
            </>
          ) : (
            <>
              <StatsCard
                title="Nilai Pipeline"
                value={formatIDR(stats.pipelineValue)}
                subtitle={`${stats.sentProposals} proposal terkirim`}
                icon={TrendingUp}
                trend={stats.pipelineValue > 0 && stats.pipelineTrend !== 0 ? { value: Math.abs(stats.pipelineTrend), positive: stats.pipelineTrend > 0 } : undefined}
              />
              <StatsCard
                title="Tingkat Persetujuan"
                value={`${acceptanceRate}%`}
                subtitle={`${stats.acceptedProposals} disetujui dari ${stats.sentProposals + stats.acceptedProposals} proposal`}
                icon={Target}
                trend={(stats.sentProposals + stats.acceptedProposals) > 0 && stats.acceptanceTrend !== 0 ? { value: Math.abs(stats.acceptanceTrend), positive: stats.acceptanceTrend > 0 } : undefined}
              />
              <StatsCard
                title="Proposal Aktif"
                value={stats.sentProposals.toString()}
                subtitle="Menunggu respons klien"
                icon={FileText}
                trend={stats.sentProposals > 0 && stats.proposalsTrend !== 0 ? { value: Math.abs(stats.proposalsTrend), positive: stats.proposalsTrend > 0 } : undefined}
              />
              <StatsCard
                title="Total Pendapatan"
                value={formatIDR(stats.totalRevenue)}
                icon={Wallet}
                trend={stats.totalRevenue > 0 && stats.revenueTrend !== 0 ? { value: Math.abs(stats.revenueTrend), positive: stats.revenueTrend > 0 } : undefined}
                variant="highlight"
              />
            </>
          )}
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Revenue Chart - takes 2 columns */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-semibold text-foreground">TREN PENDAPATAN</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs md:text-sm"
                onClick={handleExport}
                disabled={loading}
              >
                <FileDown className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">EKSPOR LAPORAN</span>
                <span className="sm:hidden">EKSPOR</span>
              </Button>
            </div>
            <RevenueChart data={revenueData} />
          </div>

          {/* Right sidebar - action shortcuts and recent invoices */}
          <div className="space-y-4 md:space-y-6 order-1 lg:order-2">
            <div className="hidden md:block">
              <QuickActions onExportReport={exportReport} />
            </div>
            <RecentInvoices invoices={recentInvoices} loading={loading} />
          </div>
        </div>

        {/* Active Projects Table + Today's Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <ActiveProjects projects={projects} loading={loading} onStatusChange={refetch} />
          </div>
          <div>
            <TodaysFocus />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

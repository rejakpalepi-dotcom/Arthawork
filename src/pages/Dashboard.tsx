import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { Wallet, Clock, FolderOpen, BarChart3, Bell, Plus, TrendingUp, FileText, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/currency";

interface DashboardStats {
  totalRevenue: number;
  pendingInvoices: number;
  pendingAmount: number;
  activeProposals: number;
  totalProposals: number;
  acceptedProposals: number;
  totalClients: number;
  pipelineValue: number;
  sentProposals: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  due_date: string | null;
  total: number;
  status: string;
}

interface Project {
  id: string;
  client: string;
  clientInitials: string;
  title: string;
  deadline: string;
  progress: number;
  status: "in_progress" | "review" | "planning";
}

// Dynamic greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    pendingInvoices: 0,
    pendingAmount: 0,
    activeProposals: 0,
    totalProposals: 0,
    acceptedProposals: 0,
    totalClients: 0,
    pipelineValue: 0,
    sentProposals: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number }>>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState(0);
  const navigate = useNavigate();

  // Memoized greeting that updates based on time
  const greeting = useMemo(() => getGreeting(), []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile - use company_name or full_name, fallback to email
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("id", user.id)
        .maybeSingle();

      // Priority: company_name > full_name > email prefix
      if (profile?.company_name) {
        setUserName(profile.company_name);
      } else if (profile?.full_name) {
        setUserName(profile.full_name.split(" ")[0]);
      } else if (user.email) {
        setUserName(user.email.split("@")[0]);
      } else {
        setUserName("Creator");
      }

      // Fetch invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, due_date, total, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch proposals with totals for pipeline calculation
      const { data: proposals } = await supabase
        .from("proposals")
        .select("id, title, status, total, valid_until, clients(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id);

      // Calculate stats
      const paidInvoices = invoices?.filter(inv => inv.status === "paid") || [];
      const pendingInvs = invoices?.filter(inv => inv.status === "pending" || inv.status === "sent") || [];
      const allProposals = proposals || [];
      
      // Pipeline Value: SUM of all proposals NOT rejected
      const pipelineProposals = allProposals.filter(prop => prop.status !== "rejected");
      const pipelineValue = pipelineProposals.reduce((sum, prop) => sum + Number(prop.total || 0), 0);
      
      // Active Proposals: COUNT where status is 'sent'
      const sentProposals = allProposals.filter(prop => prop.status === "sent");
      
      // Acceptance Rate: approved / total * 100
      const acceptedProps = allProposals.filter(prop => prop.status === "approved");
      const activeProps = allProposals.filter(prop => prop.status !== "draft");

      // Calculate upcoming deadlines (invoices due within 7 days)
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = invoices?.filter(inv => {
        if (!inv.due_date || inv.status === "paid") return false;
        const dueDate = new Date(inv.due_date);
        return dueDate >= now && dueDate <= weekFromNow;
      }).length || 0;
      setUpcomingDeadlines(upcoming);

      setStats({
        totalRevenue: paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0),
        pendingInvoices: pendingInvs.length,
        pendingAmount: pendingInvs.reduce((sum, inv) => sum + Number(inv.total), 0),
        activeProposals: activeProps.length,
        totalProposals: allProposals.length,
        acceptedProposals: acceptedProps.length,
        totalClients: clients?.length || 0,
        pipelineValue,
        sentProposals: sentProposals.length,
      });

      // Set recent invoices (top 3)
      setRecentInvoices(
        (invoices || []).slice(0, 3).map((inv) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          due_date: inv.due_date,
          total: Number(inv.total),
          status: inv.status,
        }))
      );

      // Map proposals to projects format
      const mappedProjects: Project[] = activeProps.slice(0, 3).map((prop: any) => {
        const clientName = prop.clients?.name || "Unknown Client";
        const initials = clientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        const deadline = prop.valid_until 
          ? new Date(prop.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'No deadline';
        
        // Simulate progress based on status
        let progress = 0;
        let status: "in_progress" | "review" | "planning" = "planning";
        if (prop.status === "approved") {
          progress = 75;
          status = "in_progress";
        } else if (prop.status === "sent") {
          progress = 50;
          status = "review";
        } else {
          progress = 25;
          status = "planning";
        }

        return {
          id: prop.id,
          client: clientName,
          clientInitials: initials,
          title: prop.title,
          deadline,
          progress,
          status,
        };
      });
      setProjects(mappedProjects);

      // Generate revenue data from paid invoices (group by month)
      const revenueByMonth = (paidInvoices || []).reduce((acc, inv) => {
        const date = new Date(inv.created_at);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        acc[monthKey] = (acc[monthKey] || 0) + Number(inv.total);
        return acc;
      }, {} as Record<string, number>);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const last6Months = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
      
      setRevenueData(last6Months.map(month => ({
        month,
        revenue: revenueByMonth[month] || 0
      })));

      setLoading(false);
    };

    fetchDashboardData();

    // Set up real-time subscription for proposals changes
    const proposalsChannel = supabase
      .channel('dashboard-proposals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposals' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    const invoicesChannel = supabase
      .channel('dashboard-invoices')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(proposalsChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, []);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  // Acceptance Rate calculation
  const acceptanceRate = stats.totalProposals > 0 
    ? Math.round((stats.acceptedProposals / stats.totalProposals) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <div className="p-8 font-sans">
        {/* Header with Dynamic Greeting */}
        <div className="flex items-start justify-between mb-8">
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
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {today} • You have {upcomingDeadlines} deadline{upcomingDeadlines !== 1 ? 's' : ''} coming up.
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="rounded-full bg-secondary border-border">
              <Bell className="w-5 h-5" />
            </Button>
            <Button className="gap-2" onClick={() => navigate("/projects/new")}>
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Grid - 4 columns with real-time metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                subtitle={`${stats.totalProposals - (stats.totalProposals - stats.activeProposals)} active proposals`}
                icon={TrendingUp}
              />
              <StatsCard
                title="Acceptance Rate"
                value={`${acceptanceRate}%`}
                subtitle={`${stats.acceptedProposals} of ${stats.totalProposals} proposals`}
                icon={Target}
              />
              <StatsCard
                title="Active Proposals"
                value={stats.sentProposals.toString()}
                subtitle="Awaiting response"
                icon={FileText}
              />
              <StatsCard
                title="Total Earnings"
                value={formatIDR(stats.totalRevenue)}
                icon={Wallet}
                trend={{ value: 12.5, positive: true }}
                variant="highlight"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart - takes 2 columns */}
          <div className="lg:col-span-2">
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

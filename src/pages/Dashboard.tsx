import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { Wallet, Clock, FolderOpen, BarChart3, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    pendingInvoices: 0,
    pendingAmount: 0,
    activeProposals: 0,
    totalProposals: 0,
    acceptedProposals: 0,
    totalClients: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Creator");
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number }>>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) {
        setUserName(profile.full_name.split(" ")[0]);
      }

      // Fetch invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, due_date, total, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch proposals
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
      const activeProps = allProposals.filter(prop => prop.status !== "draft");
      const acceptedProps = allProposals.filter(prop => prop.status === "approved");

      // Calculate upcoming deadlines (invoices due within 7 days)
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = invoices?.filter(inv => {
        if (!inv.due_date || inv.status === "paid") return false;
        const dueDate = new Date(inv.due_date);
        return dueDate >= now && dueDate <= weekFromNow;
      }).length || 0;
      setUpcomingDeadlines(upcoming);

      // Calculate win rate
      const winRate = allProposals.length > 0 
        ? Math.round((acceptedProps.length / allProposals.length) * 100) 
        : 0;

      setStats({
        totalRevenue: paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0),
        pendingInvoices: pendingInvs.length,
        pendingAmount: pendingInvs.reduce((sum, inv) => sum + Number(inv.total), 0),
        activeProposals: activeProps.length,
        totalProposals: allProposals.length,
        acceptedProposals: acceptedProps.length,
        totalClients: clients?.length || 0,
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
  }, []);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  const winRate = stats.totalProposals > 0 
    ? Math.round((stats.acceptedProposals / stats.totalProposals) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Good morning, {userName}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {today} • You have {upcomingDeadlines} deadline{upcomingDeadlines !== 1 ? 's' : ''} coming up.
            </p>
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

        {/* Stats Grid - 4 columns with highlight on last */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Earnings"
            value={formatIDR(stats.totalRevenue)}
            icon={Wallet}
            trend={{ value: 12.5, positive: true }}
          />
          <StatsCard
            title="Pending Invoices"
            value={formatIDR(stats.pendingAmount)}
            subtitle={`${stats.pendingInvoices} Invoices`}
            icon={Clock}
          />
          <StatsCard
            title="Active Projects"
            value={stats.activeProposals.toString()}
            subtitle="On track"
            icon={FolderOpen}
          />
          <StatsCard
            title="Win Rate"
            value={`${winRate}%`}
            icon={BarChart3}
            trend={{ value: 5, positive: true }}
            variant="highlight"
          />
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

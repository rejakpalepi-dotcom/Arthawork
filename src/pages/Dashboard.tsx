import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ActiveProjects } from "@/components/dashboard/ActiveProjects";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { Wallet, Clock, FolderOpen, TrendingUp, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/currency";

interface DashboardStats {
  totalRevenue: number;
  pendingInvoices: number;
  pendingAmount: number;
  activeProposals: number;
  awaitingResponse: number;
  totalClients: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  due_date: string | null;
  total: number;
  status: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    pendingInvoices: 0,
    pendingAmount: 0,
    activeProposals: 0,
    awaitingResponse: 0,
    totalClients: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Creator");
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number }>>([]);
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
        .select("status")
        .eq("user_id", user.id);

      // Fetch clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id);

      // Calculate stats
      const paidInvoices = invoices?.filter(inv => inv.status === "paid") || [];
      const pendingInvs = invoices?.filter(inv => inv.status === "pending" || inv.status === "sent") || [];
      const activeProps = proposals?.filter(prop => prop.status !== "draft") || [];
      const awaitingProps = proposals?.filter(prop => prop.status === "sent") || [];

      setStats({
        totalRevenue: paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0),
        pendingInvoices: pendingInvs.length,
        pendingAmount: pendingInvs.reduce((sum, inv) => sum + Number(inv.total), 0),
        activeProposals: activeProps.length,
        awaitingResponse: awaitingProps.length,
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

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Good morning, <span className="gradient-text">{userName}</span>
            </h1>
            <p className="text-muted-foreground">
              {today} • You have {stats.pendingInvoices} pending invoices.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            </Button>
            <Button className="gap-2" onClick={() => navigate("/projects/new")}>
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            value={`${stats.totalClients > 0 ? Math.round((stats.activeProposals / Math.max(stats.totalClients, 1)) * 100) : 0}%`}
            icon={TrendingUp}
            trend={{ value: 5, positive: true }}
          />
        </div>

        {/* Revenue Chart & Active Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData} />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Active Projects Table */}
        <div className="mb-8">
          <ActiveProjects projects={[]} loading={loading} />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentInvoices invoices={recentInvoices} loading={loading} />
          <TodaysFocus />
        </div>
      </div>
    </DashboardLayout>
  );
}

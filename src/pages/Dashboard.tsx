import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Receipt, FileText, Users, DollarSign } from "lucide-react";
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

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    pendingInvoices: 0,
    pendingAmount: 0,
    activeProposals: 0,
    awaitingResponse: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Creator");

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
        .select("total, status")
        .eq("user_id", user.id);

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

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, <span className="gradient-text">{userName}</span>
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your studio today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value={formatIDR(stats.totalRevenue)}
            subtitle="All time"
            icon={DollarSign}
          />
          <StatsCard
            title="Pending Invoices"
            value={stats.pendingInvoices.toString()}
            subtitle={`${formatIDR(stats.pendingAmount)} outstanding`}
            icon={Receipt}
          />
          <StatsCard
            title="Active Proposals"
            value={stats.activeProposals.toString()}
            subtitle={`${stats.awaitingResponse} awaiting response`}
            icon={FileText}
          />
          <StatsCard
            title="Total Clients"
            value={stats.totalClients.toString()}
            subtitle="Registered clients"
            icon={Users}
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

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  // Month-over-month trends
  revenueTrend: number;
  pipelineTrend: number;
  acceptanceTrend: number;
  proposalsTrend: number;
  // Previous month data for comparison
  prevMonthRevenue: number;
  prevMonthPipeline: number;
  prevMonthAcceptance: number;
  prevMonthProposals: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  due_date: string | null;
  total: number;
  status: string;
  created_at: string;
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
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

// Calculate month-over-month trend percentage
function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function useDashboardData() {
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
    revenueTrend: 0,
    pipelineTrend: 0,
    acceptanceTrend: 0,
    proposalsTrend: 0,
    prevMonthRevenue: 0,
    prevMonthPipeline: 0,
    prevMonthAcceptance: 0,
    prevMonthProposals: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [allProposals, setAllProposals] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number }>>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState(0);

  const greeting = useMemo(() => getGreeting(), []);

  const fetchDashboardData = useCallback(async () => {
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
      .select("id, title, status, total, valid_until, created_at, clients(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch clients
    const { data: clients } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id);

    // Store all data for export
    setAllInvoices(invoices || []);
    setAllProposals(proposals || []);

    // Get current and previous month dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Calculate current month metrics
    const currentMonthInvoices = (invoices || []).filter(inv => {
      const date = new Date(inv.created_at);
      return date >= currentMonthStart;
    });
    const currentMonthProposals = (proposals || []).filter(prop => {
      const date = new Date(prop.created_at);
      return date >= currentMonthStart;
    });

    // Calculate previous month metrics
    const prevMonthInvoices = (invoices || []).filter(inv => {
      const date = new Date(inv.created_at);
      return date >= prevMonthStart && date <= prevMonthEnd;
    });
    const prevMonthProposalsData = (proposals || []).filter(prop => {
      const date = new Date(prop.created_at);
      return date >= prevMonthStart && date <= prevMonthEnd;
    });

    // Current month stats
    const currentPaidInvoices = currentMonthInvoices.filter(inv => inv.status === "paid");
    const currentRevenue = currentPaidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const currentPipelineProposals = currentMonthProposals.filter(prop => prop.status !== "rejected");
    const currentPipeline = currentPipelineProposals.reduce((sum, prop) => sum + Number(prop.total || 0), 0);
    const currentAccepted = currentMonthProposals.filter(prop => prop.status === "approved").length;
    const currentTotal = currentMonthProposals.length;
    const currentAcceptanceRate = currentTotal > 0 ? (currentAccepted / currentTotal) * 100 : 0;
    const currentSent = currentMonthProposals.filter(prop => prop.status === "sent").length;

    // Previous month stats
    const prevPaidInvoices = prevMonthInvoices.filter(inv => inv.status === "paid");
    const prevRevenue = prevPaidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const prevPipelineProposals = prevMonthProposalsData.filter(prop => prop.status !== "rejected");
    const prevPipeline = prevPipelineProposals.reduce((sum, prop) => sum + Number(prop.total || 0), 0);
    const prevAccepted = prevMonthProposalsData.filter(prop => prop.status === "approved").length;
    const prevTotal = prevMonthProposalsData.length;
    const prevAcceptanceRate = prevTotal > 0 ? (prevAccepted / prevTotal) * 100 : 0;
    const prevSent = prevMonthProposalsData.filter(prop => prop.status === "sent").length;

    // Calculate trends
    const revenueTrend = calculateTrend(currentRevenue, prevRevenue);
    const pipelineTrend = calculateTrend(currentPipeline, prevPipeline);
    const acceptanceTrend = calculateTrend(currentAcceptanceRate, prevAcceptanceRate);
    const proposalsTrend = calculateTrend(currentSent, prevSent);

    // All-time stats
    const paidInvoices = invoices?.filter(inv => inv.status === "paid") || [];
    const pendingInvs = invoices?.filter(inv => inv.status === "pending" || inv.status === "sent") || [];
    const allProposalsList = proposals || [];
    
    // Pipeline Value: SUM of all proposals NOT rejected
    const pipelineProposals = allProposalsList.filter(prop => prop.status !== "rejected");
    const pipelineValue = pipelineProposals.reduce((sum, prop) => sum + Number(prop.total || 0), 0);
    
    // Active Proposals: COUNT where status is 'sent'
    const sentProposals = allProposalsList.filter(prop => prop.status === "sent");
    
    // Acceptance Rate: approved / total * 100
    const acceptedProps = allProposalsList.filter(prop => prop.status === "approved");
    const activeProps = allProposalsList.filter(prop => prop.status !== "draft");

    // Calculate upcoming deadlines (invoices due within 7 days)
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
      totalProposals: allProposalsList.length,
      acceptedProposals: acceptedProps.length,
      totalClients: clients?.length || 0,
      pipelineValue,
      sentProposals: sentProposals.length,
      revenueTrend,
      pipelineTrend,
      acceptanceTrend,
      proposalsTrend,
      prevMonthRevenue: prevRevenue,
      prevMonthPipeline: prevPipeline,
      prevMonthAcceptance: prevAcceptanceRate,
      prevMonthProposals: prevSent,
    });

    // Set recent invoices (top 3)
    setRecentInvoices(
      (invoices || []).slice(0, 3).map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        due_date: inv.due_date,
        total: Number(inv.total),
        status: inv.status,
        created_at: inv.created_at,
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
    const currentMonth = now.getMonth();
    const last6Months = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
    
    setRevenueData(last6Months.map(month => ({
      month,
      revenue: revenueByMonth[month] || 0
    })));

    setLoading(false);
  }, []);

  useEffect(() => {
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
  }, [fetchDashboardData]);

  // Export functionality
  const exportReport = useCallback(() => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filter current month paid invoices
    const monthlyPaidInvoices = allInvoices.filter(inv => {
      const date = new Date(inv.created_at);
      return inv.status === "paid" && date >= currentMonthStart;
    });

    // Filter current month proposals
    const monthlyProposals = allProposals.filter(prop => {
      const date = new Date(prop.created_at);
      return date >= currentMonthStart;
    });

    // Generate CSV content
    const csvRows: string[] = [];
    
    // Header
    csvRows.push("Artha Monthly Report - " + now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    csvRows.push("");
    
    // Paid Invoices Section
    csvRows.push("PAID INVOICES");
    csvRows.push("Invoice Number,Amount,Date,Status");
    monthlyPaidInvoices.forEach(inv => {
      csvRows.push(`${inv.invoice_number},${inv.total},${new Date(inv.created_at).toLocaleDateString()},${inv.status}`);
    });
    csvRows.push(`Total Paid,${monthlyPaidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)},,`);
    csvRows.push("");
    
    // Proposals Section
    csvRows.push("PROPOSALS");
    csvRows.push("Title,Amount,Status,Client");
    monthlyProposals.forEach((prop: any) => {
      csvRows.push(`"${prop.title}",${prop.total},${prop.status},"${prop.clients?.name || 'Unknown'}"`);
    });
    csvRows.push("");
    
    // Summary
    csvRows.push("SUMMARY");
    csvRows.push(`Total Revenue,${monthlyPaidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)}`);
    csvRows.push(`Total Proposals,${monthlyProposals.length}`);
    csvRows.push(`Approved Proposals,${monthlyProposals.filter((p: any) => p.status === 'approved').length}`);
    csvRows.push(`Pending Proposals,${monthlyProposals.filter((p: any) => p.status === 'sent').length}`);

    // Create and download file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `artha-report-${now.toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [allInvoices, allProposals]);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  // Acceptance Rate calculation
  const acceptanceRate = stats.totalProposals > 0 
    ? Math.round((stats.acceptedProposals / stats.totalProposals) * 100) 
    : 0;

  return {
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
    refetch: fetchDashboardData,
  };
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, FileText, Clock, CheckCircle, Send, Inbox, MoreHorizontal, TrendingUp, DollarSign, AlertCircle, Grid, List, Filter, Search, FileCheck, Pencil, Trash2, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/currency";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { exportToPDF } from "@/lib/pdfExport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { escapeHtml } from "@/lib/sanitize";
import { resolveProposalStatus, formatTimestamp } from "@/lib/documentStatus";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/layout/PageHeader";

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  client_name: string;
  client_initials: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
  sent_at?: string | null;
  approved_at?: string | null;
  valid_until?: string | null;
}

interface ProposalStats {
  pipelineValue: number;
  pipelineTrend: number;
  acceptanceRate: number;
  acceptanceTrend: number;
  activeCount: number;
  newThisWeek: number;
}

const tabs = ["SEMUA PROPOSAL", "DRAF", "TERKIRIM", "DISETUJUI"];

function getTimeAgo(date: string): string {
  return formatTimestamp(date);
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalStats>({
    pipelineValue: 0,
    pipelineTrend: 0,
    acceptanceRate: 0,
    acceptanceTrend: 0,
    activeCount: 0,
    newThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("SEMUA PROPOSAL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; proposalId: string | null }>({
    open: false,
    proposalId: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProposals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("proposals")
      .select("id, title, description, total, status, created_at, updated_at, sent_at, approved_at, valid_until, clients(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mappedProposals = data.map((p) => {
        const client = p.clients as { name?: string } | null;
        const clientName = client?.name || "Klien Tanpa Nama";
        const row = p as Record<string, unknown>;
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          client_name: clientName,
          client_initials: getInitials(clientName),
          total: Number(p.total),
          status: p.status,
          created_at: p.created_at,
          updated_at: p.updated_at,
          sent_at: (row.sent_at as string) || null,
          approved_at: (row.approved_at as string) || null,
          valid_until: (row.valid_until as string) || null,
        };
      });

      setProposals(mappedProposals);

      // Calculate stats
      const activeProposals = mappedProposals.filter(p => p.status !== "draft");
      const acceptedProposals = mappedProposals.filter(p => p.status === "approved");
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newThisWeek = mappedProposals.filter(p => new Date(p.created_at) > oneWeekAgo).length;

      // Calculate MoM trends
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const currentMonthProposals = mappedProposals.filter(p => new Date(p.created_at) >= currentMonthStart);
      const prevMonthProposals = mappedProposals.filter(p => {
        const date = new Date(p.created_at);
        return date >= prevMonthStart && date <= prevMonthEnd;
      });

      // Pipeline: current month non-rejected vs previous month
      const currentPipeline = currentMonthProposals.filter(p => p.status !== "rejected").reduce((sum, p) => sum + p.total, 0);
      const prevPipeline = prevMonthProposals.filter(p => p.status !== "rejected").reduce((sum, p) => sum + p.total, 0);
      const pipelineTrend = prevPipeline > 0 ? Math.round(((currentPipeline - prevPipeline) / prevPipeline) * 100) : 0;

      // Acceptance rate trend
      const currentAccepted = currentMonthProposals.filter(p => p.status === "approved").length;
      const currentTotal = currentMonthProposals.length;
      const currentRate = currentTotal > 0 ? (currentAccepted / currentTotal) * 100 : 0;

      const prevAccepted = prevMonthProposals.filter(p => p.status === "approved").length;
      const prevTotal = prevMonthProposals.length;
      const prevRate = prevTotal > 0 ? (prevAccepted / prevTotal) * 100 : 0;
      const acceptanceTrend = prevRate > 0 ? Math.round(((currentRate - prevRate) / prevRate) * 100) : 0;

      setStats({
        pipelineValue: activeProposals.reduce((sum, p) => sum + p.total, 0),
        pipelineTrend,
        acceptanceRate: mappedProposals.length > 0 ? Math.round((acceptedProposals.length / mappedProposals.length) * 100) : 0,
        acceptanceTrend,
        activeCount: activeProposals.length,
        newThisWeek,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleNewProposal = () => {
    navigate("/proposals/new");
  };

  const handleEdit = (proposalId: string) => {
    navigate(`/proposals/${proposalId}/edit`);
  };

  const handleStatusUpdate = async (proposalId: string, newStatus: string) => {
    try {
      // Set the appropriate timestamp based on the new status
      const timestampFields: Record<string, string> = {};
      const now = new Date().toISOString();

      switch (newStatus) {
        case 'sent':
          timestampFields.sent_at = now;
          break;
        case 'approved':
          timestampFields.approved_at = now;
          break;
      }

      const { error } = await supabase
        .from("proposals")
        .update({ status: newStatus, ...timestampFields })
        .eq("id", proposalId);

      if (error) throw error;

      const statusLabels: Record<string, string> = {
        sent: "Terkirim",
        approved: "Disetujui",
        rejected: "Ditolak",
        draft: "Draf",
      };

      toast.success(`Proposal berhasil diubah ke status ${statusLabels[newStatus] || newStatus}!`);
      fetchProposals();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update status";
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.proposalId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("proposals")
        .delete()
        .eq("id", deleteModal.proposalId);

      if (error) throw error;
      toast.success("Proposal berhasil dihapus!");
      fetchProposals();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete proposal";
      toast.error(message);
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, proposalId: null });
    }
  };

  const handleExportPDF = async (proposal: Proposal) => {
    setExportingId(proposal.id);
    try {
      // Create a temporary element for PDF rendering
      const container = document.createElement("div");
      container.id = `proposal-pdf-${proposal.id}`;

      // Sanitize all user-input data to prevent XSS
      const safeClientName = escapeHtml(proposal.client_name);
      const safeTitle = escapeHtml(proposal.title);
      const safeDescription = escapeHtml(proposal.description);

      container.innerHTML = `
        <div style="padding: 40px; font-family: system-ui, -apple-system, sans-serif; background: white; color: #1a1a1a; max-width: 794px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #00D9FF; padding-bottom: 20px;">
            <div>
              <h2 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0;">Artha</h2>
              <p style="color: #666; margin: 8px 0;">Creative Solutions</p>
            </div>
            <div style="text-align: right;">
              <h1 style="font-size: 32px; font-weight: bold; color: #00D9FF; margin: 0;">PROPOSAL</h1>
              <p style="color: #666; margin: 8px 0;">Dibuat: ${new Date(proposal.created_at).toLocaleDateString("id-ID")}</p>
            </div>
          </div>
          
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="font-size: 12px; color: #666; text-transform: uppercase; margin: 0 0 8px 0;">Disiapkan Untuk</h3>
            <p style="font-size: 18px; font-weight: 600; margin: 0;">${safeClientName}</p>
          </div>
          
          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 16px 0;">${safeTitle}</h2>
            ${proposal.description ? `<p style="color: #666; line-height: 1.6;">${safeDescription}</p>` : ""}
          </div>
          
          <div style="display: flex; justify-content: flex-end; margin-top: 40px;">
            <div style="background: #f5f5f5; padding: 24px; border-radius: 8px; text-align: right;">
              <p style="font-size: 12px; color: #666; text-transform: uppercase; margin: 0 0 8px 0;">Total Investment</p>
              <p style="font-size: 28px; font-weight: bold; color: #00D9FF; font-family: monospace; margin: 0;">Rp ${proposal.total.toLocaleString("id-ID")}</p>
            </div>
          </div>
          
          <div style="margin-top: 40px; padding: 16px; background: #f0feff; text-align: center; border-radius: 8px;">
            <p style="margin: 0; font-weight: 500;">Terima kasih sudah mempertimbangkan penawaran ini.</p>
          </div>
        </div>
      `;
      document.body.appendChild(container);

      await exportToPDF(`proposal-pdf-${proposal.id}`, `Proposal-${proposal.title.replace(/[^a-z0-9]/gi, "-")}.pdf`);
      document.body.removeChild(container);
      toast.success("PDF berhasil diekspor!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to export PDF";
      toast.error(message);
    } finally {
      setExportingId(null);
    }
  };

  const filteredProposals = proposals.filter(p => {
    const matchesTab =
      activeTab === "SEMUA PROPOSAL" ||
      (activeTab === "DRAF" && p.status === "draft") ||
      (activeTab === "TERKIRIM" && p.status === "sent") ||
      (activeTab === "DISETUJUI" && p.status === "approved");

    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <PageHeader
            title="PROPOSAL"
            description="Kelola proposal aktif, draft, dan arsip penawaran kamu."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <PageHeader
          title="PROPOSAL"
          description="Kelola proposal aktif, draft, dan arsip penawaran kamu."
          actions={
            <Button className="gap-2" onClick={handleNewProposal}>
              <Plus className="w-4 h-4" />
              PROPOSAL BARU
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Pipeline Value</span>
            </div>
            <p className="text-2xl font-semibold text-foreground mb-1">{formatIDR(stats.pipelineValue)}</p>
            {stats.pipelineValue > 0 && stats.pipelineTrend !== 0 ? (
              <div className="flex items-center gap-1">
                <TrendingUp className={cn("w-4 h-4", stats.pipelineTrend > 0 ? "text-success" : "text-destructive rotate-180")} />
                <span className={cn("text-sm", stats.pipelineTrend > 0 ? "text-success" : "text-destructive")}>{Math.abs(stats.pipelineTrend)}%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">0%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/10">
                <FileCheck className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Acceptance Rate</span>
            </div>
            <p className="text-2xl font-semibold text-foreground mb-1">{stats.acceptanceRate}%</p>
            {stats.acceptanceRate > 0 && stats.acceptanceTrend !== 0 ? (
              <div className="flex items-center gap-1">
                <TrendingUp className={cn("w-4 h-4", stats.acceptanceTrend > 0 ? "text-success" : "text-destructive rotate-180")} />
                <span className={cn("text-sm", stats.acceptanceTrend > 0 ? "text-success" : "text-destructive")}>{Math.abs(stats.acceptanceTrend)}%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">0%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">PROPOSAL AKTIF</span>
            </div>
            <p className="text-2xl font-semibold text-foreground mb-1">{stats.activeCount}</p>
            <div className="flex items-center gap-1">
              <Plus className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">{stats.newThisWeek}</span>
              <span className="text-xs text-muted-foreground">new this week</span>
            </div>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all",
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              FILTER
            </Button>
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === "grid" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === "list" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Proposals Grid/List */}
        {filteredProposals.length === 0 ? (
          <div className="glass-card rounded-2xl">
            <EmptyState
              icon={Inbox}
              title="Belum ada proposal"
              description="Buat proposal pertamamu untuk mulai menutup lebih banyak klien."
              actionLabel="BUAT PROPOSAL"
              onAction={handleNewProposal}
            />
          </div>
        ) : (
          <div className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "space-y-4"
          )}>
            {filteredProposals.map((proposal, index) => {
              const resolvedStatus = resolveProposalStatus({ status: proposal.status, valid_until: proposal.valid_until || null });
              const isEdited = proposal.updated_at !== proposal.created_at;
              const timeLabel = isEdited
                ? `Edited ${getTimeAgo(proposal.updated_at)}`
                : proposal.status === "sent" || proposal.status === "approved"
                  ? `Terkirim ${getTimeAgo(proposal.created_at)}`
                  : `Dibuat ${getTimeAgo(proposal.created_at)}`;

              return (
                <div
                  key={proposal.id}
                  className="glass-card rounded-2xl p-6 card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                        {proposal.client_initials}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{proposal.client_name}</h4>
                        <p className="text-xs text-muted-foreground">{timeLabel}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-secondary rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onClick={() => handleEdit(proposal.id)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportPDF(proposal)}
                          disabled={exportingId === proposal.id}
                        >
                          {exportingId === proposal.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <FileDown className="w-4 h-4 mr-2" />
                          )}
                          Ekspor PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {proposal.status === "draft" && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(proposal.id, "sent")}>
                            <Send className="w-4 h-4 mr-2" />
                            Tandai Terkirim
                          </DropdownMenuItem>
                        )}
                        {proposal.status === "sent" && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(proposal.id, "approved")}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Tandai Disetujui
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(proposal.id, "rejected")}>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Mark as Declined
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteModal({ open: true, proposalId: proposal.id })}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">{proposal.title}</h3>
                  {proposal.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{proposal.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Value</p>
                      <p className="text-lg font-semibold text-foreground font-numeric">{formatIDR(proposal.total)}</p>
                    </div>
                    <StatusBadge type="proposal" status={resolvedStatus} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, proposalId: deleteModal.proposalId })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Proposal?"
        description="Proposal ini akan dihapus permanen dan tindakan ini tidak bisa dibatalkan."
      />
    </DashboardLayout>
  );
}

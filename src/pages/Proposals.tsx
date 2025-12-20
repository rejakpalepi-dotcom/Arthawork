import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, FileText, Clock, CheckCircle, Send, Inbox, MoreHorizontal, TrendingUp, DollarSign, AlertCircle, Grid, List, Filter, Search, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/currency";

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
}

interface ProposalStats {
  pipelineValue: number;
  pipelineTrend: number;
  acceptanceRate: number;
  acceptanceTrend: number;
  activeCount: number;
  newThisWeek: number;
}

const statusConfig: Record<string, { label: string; icon: typeof FileText; color: string; bgColor: string }> = {
  draft: { label: "Draft", icon: FileText, color: "text-muted-foreground", bgColor: "bg-muted" },
  sent: { label: "Sent", icon: Send, color: "text-primary", bgColor: "bg-primary/20" },
  approved: { label: "Accepted", icon: CheckCircle, color: "text-success", bgColor: "bg-success/20" },
  rejected: { label: "Rejected", icon: AlertCircle, color: "text-destructive", bgColor: "bg-destructive/20" },
  overdue: { label: "Overdue", icon: AlertCircle, color: "text-warning", bgColor: "bg-warning/20" },
};

const tabs = ["All Proposals", "Drafts", "Sent", "Accepted"];

function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalStats>({
    pipelineValue: 0,
    pipelineTrend: 12,
    acceptanceRate: 0,
    acceptanceTrend: 5,
    activeCount: 0,
    newThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Proposals");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProposals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("proposals")
        .select("id, title, description, total, status, created_at, updated_at, clients(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mappedProposals = data.map((p) => {
          const clientName = (p.clients as any)?.name || "Unknown Client";
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
          };
        });

        setProposals(mappedProposals);

        // Calculate stats
        const activeProposals = mappedProposals.filter(p => p.status !== "draft");
        const acceptedProposals = mappedProposals.filter(p => p.status === "approved");
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newThisWeek = mappedProposals.filter(p => new Date(p.created_at) > oneWeekAgo).length;

        setStats({
          pipelineValue: activeProposals.reduce((sum, p) => sum + p.total, 0),
          pipelineTrend: 12,
          acceptanceRate: mappedProposals.length > 0 ? Math.round((acceptedProposals.length / mappedProposals.length) * 100) : 0,
          acceptanceTrend: 5,
          activeCount: activeProposals.length,
          newThisWeek,
        });
      }

      setLoading(false);
    };

    fetchProposals();
  }, []);

  const handleNewProposal = () => {
    navigate("/proposals/new");
  };

  const filteredProposals = proposals.filter(p => {
    const matchesTab = 
      activeTab === "All Proposals" ||
      (activeTab === "Drafts" && p.status === "draft") ||
      (activeTab === "Sent" && p.status === "sent") ||
      (activeTab === "Accepted" && p.status === "approved");
    
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Proposals</h1>
              <p className="text-muted-foreground">Manage your active bids, draft contracts, and archival records.</p>
            </div>
          </div>
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
        {/* Breadcrumb & Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>›</span>
            <span className="text-foreground">Proposals</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-secondary border-border"
              />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Proposals</h1>
            <p className="text-muted-foreground">Manage your active bids, draft contracts, and archival records.</p>
          </div>
          <Button className="gap-2" onClick={handleNewProposal}>
            <Plus className="w-4 h-4" />
            New Proposal
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Pipeline Value</span>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{formatIDR(stats.pipelineValue)}</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-success">{stats.pipelineTrend}%</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-success/10">
                <FileCheck className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Acceptance Rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stats.acceptanceRate}%</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-sm text-success">{stats.acceptanceTrend}%</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Active Proposals</span>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stats.activeCount}</p>
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
              Filter
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
              title="No proposals yet"
              description="Create your first proposal to start winning more clients."
              actionLabel="Create Proposal"
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
              const status = statusConfig[proposal.status] || statusConfig.draft;
              const StatusIcon = status.icon;
              const isEdited = proposal.updated_at !== proposal.created_at;
              const timeLabel = isEdited 
                ? `Edited ${getTimeAgo(proposal.updated_at)}`
                : proposal.status === "sent" || proposal.status === "approved"
                  ? `Sent ${getTimeAgo(proposal.created_at)}`
                  : `Created ${getTimeAgo(proposal.created_at)}`;

              return (
                <div
                  key={proposal.id}
                  className="glass-card rounded-2xl p-6 card-hover animate-fade-in cursor-pointer"
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
                    <button className="p-1 hover:bg-secondary rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">{proposal.title}</h3>
                  {proposal.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{proposal.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Value</p>
                      <p className="text-lg font-bold text-foreground font-mono">{formatIDR(proposal.total)}</p>
                    </div>
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5",
                      status.bgColor,
                      status.color
                    )}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

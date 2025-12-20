import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, FileText, Clock, CheckCircle, Send, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/currency";

interface Proposal {
  id: string;
  title: string;
  client_name: string;
  total: number;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  draft: { label: "Draft", icon: FileText, color: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", icon: Send, color: "bg-warning/20 text-warning" },
  approved: { label: "Approved", icon: CheckCircle, color: "bg-success/20 text-success" },
  rejected: { label: "Rejected", icon: FileText, color: "bg-destructive/20 text-destructive" },
};

export default function Proposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
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
        .select("id, title, total, status, created_at, clients(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProposals(data.map((p) => ({
          id: p.id,
          title: p.title,
          client_name: (p.clients as any)?.name || "Unknown Client",
          total: Number(p.total),
          status: p.status,
          created_at: p.created_at,
        })));
      }

      setLoading(false);
    };

    fetchProposals();
  }, []);

  const handleNewProposal = () => {
    // Navigate to new proposal page when available
    navigate("/proposals");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Proposals</h1>
              <p className="text-muted-foreground">Create and manage project proposals</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Proposal
            </Button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Proposals</h1>
            <p className="text-muted-foreground">Create and manage project proposals</p>
          </div>
          <Button className="gap-2" onClick={handleNewProposal}>
            <Plus className="w-4 h-4" />
            New Proposal
          </Button>
        </div>

        {proposals.length === 0 ? (
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
          <div className="space-y-4">
            {proposals.map((proposal, index) => {
              const status = statusConfig[proposal.status] || statusConfig.draft;
              const StatusIcon = status.icon;
              return (
                <div
                  key={proposal.id}
                  className="glass-card rounded-2xl p-6 card-hover animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{proposal.title}</h3>
                        <p className="text-sm text-muted-foreground">{proposal.client_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary font-mono">
                          {formatIDR(proposal.total)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(proposal.created_at).toLocaleDateString("id-ID")}
                        </div>
                      </div>
                      <span className={cn("px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5", status.color)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </div>
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

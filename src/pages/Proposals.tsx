import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, FileText, Clock, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockProposals = [
  { id: "1", title: "Website Redesign", client: "Acme Corporation", amount: 8500, status: "approved", date: "2024-01-15" },
  { id: "2", title: "Brand Identity Package", client: "Tech Startup Inc", amount: 4200, status: "sent", date: "2024-01-18" },
  { id: "3", title: "E-commerce Platform", client: "Digital Agency Co", amount: 15000, status: "draft", date: "2024-01-20" },
  { id: "4", title: "Mobile App UI", client: "Creative Labs", amount: 6800, status: "sent", date: "2024-01-22" },
];

const statusConfig = {
  draft: { label: "Draft", icon: FileText, color: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", icon: Send, color: "bg-warning/20 text-warning" },
  approved: { label: "Approved", icon: CheckCircle, color: "bg-success/20 text-success" },
};

export default function Proposals() {
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
          {mockProposals.map((proposal, index) => {
            const status = statusConfig[proposal.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            return (
              <div
                key={proposal.id}
                className="glass-card rounded-2xl p-6 card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{proposal.title}</h3>
                      <p className="text-sm text-muted-foreground">{proposal.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary font-mono">
                        ${proposal.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(proposal.date).toLocaleDateString()}
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
      </div>
    </DashboardLayout>
  );
}

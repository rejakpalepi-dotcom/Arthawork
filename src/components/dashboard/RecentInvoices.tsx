import { AlertCircle, Clock, CheckCircle, MoreHorizontal, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/currency";
import { EmptyState } from "@/components/ui/empty-state";

interface Invoice {
  id: string;
  invoice_number: string;
  due_date: string | null;
  total: number;
  status: string;
  paid_date?: string | null;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
  loading?: boolean;
}

const statusConfig = {
  overdue: { label: "Overdue", icon: AlertCircle, color: "text-destructive" },
  pending: { label: "Pending", icon: Clock, color: "text-warning" },
  sent: { label: "Sent", icon: Clock, color: "text-warning" },
  paid: { label: "Paid", icon: CheckCircle, color: "text-success" },
  draft: { label: "Draft", icon: Clock, color: "text-muted-foreground" },
};

export function RecentInvoices({ invoices, loading }: RecentInvoicesProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Invoices</h3>
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Invoices</h3>
        <button className="p-1 hover:bg-secondary rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices yet"
          description="Your invoices will appear here."
        />
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            const isOverdue = invoice.status !== "paid" && invoice.due_date && new Date(invoice.due_date) < new Date();
            const statusKey = isOverdue ? "overdue" : invoice.status;
            const status = statusConfig[statusKey as keyof typeof statusConfig] || statusConfig.draft;
            const StatusIcon = status.icon;

            return (
              <div key={invoice.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-border transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", isOverdue ? "bg-destructive/10" : invoice.status === "paid" ? "bg-success/10" : "bg-warning/10")}>
                    <StatusIcon className={cn("w-4 h-4", status.color)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-semibold text-foreground">Invoice #{invoice.invoice_number}</h4>
                      <span className="text-base font-bold text-foreground font-mono">{formatIDR(invoice.total)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {invoice.status === "paid" 
                        ? `Paid on ${invoice.paid_date ? new Date(invoice.paid_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}`
                        : invoice.due_date 
                          ? `Due ${new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${isOverdue ? ' (Overdue)' : ''}`
                          : 'No due date'
                      }
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button className="text-xs text-primary hover:underline">View details</button>
                      {isOverdue && (
                        <button className="text-xs text-primary hover:underline">Send Reminder</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

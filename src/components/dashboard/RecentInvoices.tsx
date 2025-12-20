import { AlertTriangle, Clock, CheckCircle, MoreHorizontal, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/currency";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

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
  overdue: { icon: AlertTriangle, bgColor: "bg-destructive/10", iconColor: "text-destructive" },
  pending: { icon: Clock, bgColor: "bg-warning/10", iconColor: "text-warning" },
  sent: { icon: Clock, bgColor: "bg-warning/10", iconColor: "text-warning" },
  paid: { icon: CheckCircle, bgColor: "bg-success/10", iconColor: "text-success" },
  draft: { icon: Clock, bgColor: "bg-muted", iconColor: "text-muted-foreground" },
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
            <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Invoices</h3>
        <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
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
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const isOverdue = invoice.status !== "paid" && invoice.due_date && new Date(invoice.due_date) < new Date();
            const statusKey = isOverdue ? "overdue" : invoice.status;
            const status = statusConfig[statusKey as keyof typeof statusConfig] || statusConfig.draft;
            const StatusIcon = status.icon;

            return (
              <div 
                key={invoice.id} 
                className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={cn("p-2.5 rounded-lg shrink-0", status.bgColor)}>
                    <StatusIcon className={cn("w-4 h-4", status.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          Invoice #{invoice.invoice_number}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {invoice.status === "paid" 
                            ? `Paid on ${invoice.paid_date ? new Date(invoice.paid_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}`
                            : invoice.due_date 
                              ? `Due ${new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${isOverdue ? ' (Overdue)' : ''}`
                              : 'No due date'
                          }
                        </p>
                      </div>
                      <span className={cn(
                        "text-base font-bold font-mono shrink-0",
                        invoice.status === "paid" ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {formatIDR(invoice.total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        View details
                      </Button>
                      {isOverdue && (
                        <Button variant="outline" size="sm" className="h-8 text-xs text-primary border-primary/30 hover:bg-primary/10">
                          Send Reminder
                        </Button>
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

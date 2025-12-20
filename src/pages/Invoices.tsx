import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Receipt, Clock, CheckCircle, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockInvoices = [
  { id: "1", number: "INV-001", client: "Acme Corporation", amount: 2500, status: "paid", dueDate: "2024-01-20" },
  { id: "2", number: "INV-002", client: "Tech Startup Inc", amount: 4200, status: "sent", dueDate: "2024-01-25" },
  { id: "3", number: "INV-003", client: "Digital Agency Co", amount: 8500, status: "overdue", dueDate: "2024-01-10" },
  { id: "4", number: "INV-004", client: "Creative Labs", amount: 1800, status: "draft", dueDate: "2024-02-01" },
];

const statusConfig = {
  draft: { label: "Draft", icon: Receipt, color: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", icon: Send, color: "bg-warning/20 text-warning" },
  paid: { label: "Paid", icon: CheckCircle, color: "bg-success/20 text-success" },
  overdue: { label: "Overdue", icon: AlertTriangle, color: "bg-destructive/20 text-destructive" },
};

export default function Invoices() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Invoices</h1>
            <p className="text-muted-foreground">Track payments and manage invoices</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Invoice
          </Button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Invoice</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((invoice, index) => {
                const status = statusConfig[invoice.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-4">
                      <span className="font-mono font-medium text-foreground">{invoice.number}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-foreground">{invoice.client}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono font-bold text-primary">
                        ${invoice.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5", status.color)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

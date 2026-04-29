import { AlertTriangle, Clock, CheckCircle, MoreHorizontal, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/currency";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { resolveInvoiceStatus, getInvoiceStatusUI } from "@/lib/documentStatus";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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



export function RecentInvoices({ invoices, loading }: RecentInvoicesProps) {
  const navigate = useNavigate();
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">INVOICE TERBARU</h3>
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
        <h3 className="text-lg font-semibold text-foreground">INVOICE TERBARU</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/invoices")}>
              Lihat Semua Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/invoices/new")}>
              Buat Invoice Baru
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Belum ada invoice"
          description="Invoice yang kamu buat akan muncul di sini."
          actionLabel="BUAT INVOICE"
          onAction={() => navigate("/invoices/new")}
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const resolvedStatus = resolveInvoiceStatus({ status: invoice.status, due_date: invoice.due_date });
            const isOverdue = resolvedStatus === 'overdue';
            const statusUI = getInvoiceStatusUI(resolvedStatus);

            return (
              <div
                key={invoice.id}
                className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={cn("p-2.5 rounded-lg shrink-0", statusUI.bgClass)}>
                    {isOverdue ? <AlertTriangle className={cn("w-4 h-4", statusUI.textClass)} /> 
                      : resolvedStatus === 'paid' ? <CheckCircle className={cn("w-4 h-4", statusUI.textClass)} />
                      : <Clock className={cn("w-4 h-4", statusUI.textClass)} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          INVOICE #{invoice.invoice_number}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {invoice.status === "paid"
                            ? `Lunas pada ${invoice.paid_date ? new Date(invoice.paid_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) : '-'}`
                            : invoice.due_date
                              ? `Jatuh tempo ${new Date(invoice.due_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}${isOverdue ? ' (Lewat jatuh tempo)' : ''}`
                              : 'Tanpa jatuh tempo'
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        Lihat detail
                      </Button>
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

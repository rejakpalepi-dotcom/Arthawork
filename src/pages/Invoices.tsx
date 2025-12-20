import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Receipt, Clock, CheckCircle, Send, AlertTriangle, MoreHorizontal, Trash2, CreditCard, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/currency";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string | null;
  total: number;
  status: string;
  due_date: string | null;
}

const statusConfig = {
  draft: { label: "Draft", icon: Receipt, color: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", icon: Send, color: "bg-warning/20 text-warning" },
  paid: { label: "Paid", icon: CheckCircle, color: "bg-success/20 text-success" },
  overdue: { label: "Overdue", icon: AlertTriangle, color: "bg-destructive/20 text-destructive" },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; invoiceId: string | null }>({
    open: false,
    invoiceId: null,
  });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, status, due_date, clients(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInvoices(data.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        client_name: (inv.clients as any)?.name || null,
        total: Number(inv.total),
        status: inv.status,
        due_date: inv.due_date,
      })));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", invoiceId);

      if (error) throw error;
      toast.success("Invoice marked as paid!");
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.message || "Failed to update invoice");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.invoiceId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", deleteModal.invoiceId);

      if (error) throw error;
      toast.success("Invoice deleted successfully!");
      fetchInvoices();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete invoice");
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, invoiceId: null });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Invoices</h1>
              <p className="text-muted-foreground">Track payments and manage invoices</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Invoices</h1>
            <p className="text-muted-foreground">Track payments and manage invoices</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/invoices/new")}>
            <Plus className="w-4 h-4" />
            New Invoice
          </Button>
        </div>

        {invoices.length === 0 ? (
          <div className="glass-card rounded-2xl">
            <EmptyState
              icon={Inbox}
              title="No invoices yet"
              description="Create your first invoice to start tracking payments."
              actionLabel="Create Invoice"
              onAction={() => navigate("/invoices/new")}
            />
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Invoice</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => {
                  const status = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4">
                        <span className="font-mono font-medium text-foreground">{invoice.invoice_number}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-foreground">{invoice.client_name || "—"}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-bold text-primary">
                          {formatIDR(invoice.total)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {invoice.due_date
                            ? new Date(invoice.due_date).toLocaleDateString()
                            : "—"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn("px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5", status.color)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {invoice.status !== "paid" && (
                              <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id)}>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteModal({ open: true, invoiceId: invoice.id })}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, invoiceId: deleteModal.invoiceId })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Invoice?"
        description="This will permanently delete this invoice and all its items. This action cannot be undone."
      />
    </DashboardLayout>
  );
}

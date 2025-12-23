import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Receipt, Clock, CheckCircle, Send, AlertTriangle, MoreHorizontal, Trash2, CreditCard, Inbox, FileDown, Loader2 } from "lucide-react";
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
import { exportToPDF } from "@/lib/pdfExport";
import { format } from "date-fns";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string | null;
  total: number;
  status: string;
  due_date: string | null;
  issue_date: string;
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  notes: string | null;
  client_email?: string | null;
  client_address?: string | null;
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
  const [exportingId, setExportingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { settings: businessSettings } = useBusinessSettings();

  const fetchInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, status, due_date, issue_date, subtotal, tax_rate, tax_amount, notes, clients(name, email, address)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInvoices(data.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        client_name: (inv.clients as any)?.name || null,
        client_email: (inv.clients as any)?.email || null,
        client_address: (inv.clients as any)?.address || null,
        total: Number(inv.total),
        status: inv.status,
        due_date: inv.due_date,
        issue_date: inv.issue_date,
        subtotal: Number(inv.subtotal),
        tax_rate: inv.tax_rate,
        tax_amount: inv.tax_amount ? Number(inv.tax_amount) : null,
        notes: inv.notes,
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
      // First delete invoice items
      await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", deleteModal.invoiceId);

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

  const handleExportPDF = async (invoice: Invoice) => {
    setExportingId(invoice.id);
    try {
      // Fetch invoice items for PDF
      const { data: items } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id);

      // Use dynamic business settings
      const businessName = businessSettings?.business_name || "Your Business Name";
      const businessAddress = businessSettings?.address || "Your Business Address";
      const businessEmail = businessSettings?.email || "your@email.com";
      const logoUrl = businessSettings?.logo_url;
      const bankName = businessSettings?.bank_name || "";
      const accountNumber = businessSettings?.account_number || "";
      const accountName = businessSettings?.account_name || "";

      // Create a temporary element for PDF rendering
      const container = document.createElement("div");
      container.id = `invoice-pdf-${invoice.id}`;
      container.innerHTML = `
        <div style="padding: 40px; font-family: system-ui, -apple-system, sans-serif; background: white; color: #1a1a1a; max-width: 794px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #00D9FF; padding-bottom: 20px;">
            <div style="display: flex; align-items: flex-start; gap: 16px;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${businessName}" style="width: 56px; height: 56px; object-fit: contain; border-radius: 8px;" />` : `<div style="width: 56px; height: 56px; background: #00D9FF20; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #00D9FF;">${businessName.charAt(0).toUpperCase()}</div>`}
              <div>
                <h2 style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 0;">${businessName}</h2>
                <p style="color: #666; margin: 8px 0; white-space: pre-line;">${businessAddress}</p>
                <p style="color: #00D9FF; margin: 4px 0;">${businessEmail}</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h1 style="font-size: 32px; font-weight: bold; color: #00D9FF; margin: 0;">INVOICE</h1>
              <p style="font-family: monospace; font-size: 18px; margin: 8px 0;">#${invoice.invoice_number}</p>
              <p style="color: #666; margin: 8px 0;">Issued: ${format(new Date(invoice.issue_date), "MMM d, yyyy")}</p>
              ${invoice.due_date ? `<p style="color: #666; margin: 4px 0;">Due: ${format(new Date(invoice.due_date), "MMM d, yyyy")}</p>` : ""}
            </div>
          </div>
          
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="font-size: 12px; color: #666; text-transform: uppercase; margin: 0 0 8px 0;">Bill To</h3>
            <p style="font-size: 18px; font-weight: 600; margin: 0;">${invoice.client_name || "Client"}</p>
            ${invoice.client_email ? `<p style="color: #666; margin: 4px 0;">${invoice.client_email}</p>` : ""}
            ${invoice.client_address ? `<p style="color: #666; margin: 4px 0;">${invoice.client_address}</p>` : ""}
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="text-align: left; padding: 12px; font-size: 12px; color: #666; text-transform: uppercase;">Description</th>
                <th style="text-align: center; padding: 12px; font-size: 12px; color: #666; text-transform: uppercase;">Qty</th>
                <th style="text-align: right; padding: 12px; font-size: 12px; color: #666; text-transform: uppercase;">Rate</th>
                <th style="text-align: right; padding: 12px; font-size: 12px; color: #666; text-transform: uppercase;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(items || []).map((item: any, i: number) => `
                <tr style="border-bottom: 1px solid #eee; background: ${i % 2 === 0 ? "white" : "#fafafa"};">
                  <td style="padding: 12px;">${item.description}</td>
                  <td style="padding: 12px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; font-family: monospace;">Rp ${Number(item.unit_price).toLocaleString("id-ID")}</td>
                  <td style="padding: 12px; text-align: right; font-family: monospace; font-weight: 600;">Rp ${Number(item.total).toLocaleString("id-ID")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          
          <div style="display: flex; justify-content: flex-end;">
            <div style="width: 250px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #666;">Subtotal</span>
                <span style="font-family: monospace;">Rp ${invoice.subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: #666;">Tax (${invoice.tax_rate || 0}%)</span>
                <span style="font-family: monospace;">Rp ${(invoice.tax_amount || 0).toLocaleString("id-ID")}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #1a1a1a; margin-top: 8px;">
                <span style="font-weight: 600;">Total Due</span>
                <span style="font-size: 20px; font-weight: bold; color: #00D9FF; font-family: monospace;">Rp ${invoice.total.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
          
          ${bankName || accountNumber ? `
            <div style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
              <h3 style="font-size: 12px; color: #666; text-transform: uppercase; margin: 0 0 12px 0;">Payment Details</h3>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                ${bankName ? `<div><p style="color: #666; margin: 0 0 4px 0; font-size: 12px;">Bank</p><p style="margin: 0; font-weight: 500;">${bankName}</p></div>` : ""}
                ${accountNumber ? `<div><p style="color: #666; margin: 0 0 4px 0; font-size: 12px;">Account</p><p style="margin: 0; font-weight: 500; font-family: monospace;">${accountNumber}</p></div>` : ""}
                ${accountName ? `<div><p style="color: #666; margin: 0 0 4px 0; font-size: 12px;">Account Name</p><p style="margin: 0; font-weight: 500;">${accountName}</p></div>` : ""}
              </div>
            </div>
          ` : ""}
          
          ${invoice.notes ? `
            <div style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
              <h3 style="font-size: 12px; color: #666; text-transform: uppercase; margin: 0 0 8px 0;">Notes</h3>
              <p style="color: #666; margin: 0; white-space: pre-line;">${invoice.notes}</p>
            </div>
          ` : ""}
          
          <div style="margin-top: 40px; padding: 16px; background: #f0feff; text-align: center; border-radius: 8px;">
            <p style="margin: 0; font-weight: 500;">Thank you for your business!</p>
          </div>
        </div>
      `;
      document.body.appendChild(container);

      await exportToPDF(`invoice-pdf-${invoice.id}`, `Invoice-${invoice.invoice_number}.pdf`);
      document.body.removeChild(container);
      toast.success("PDF exported successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to export PDF");
    } finally {
      setExportingId(null);
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
                            <DropdownMenuItem 
                              onClick={() => handleExportPDF(invoice)}
                              disabled={exportingId === invoice.id}
                            >
                              {exportingId === invoice.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <FileDown className="w-4 h-4 mr-2" />
                              )}
                              Download PDF
                            </DropdownMenuItem>
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

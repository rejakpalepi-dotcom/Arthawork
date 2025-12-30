import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { formatIDR } from "@/lib/currency";
import { toast } from "sonner";
import { ArrowLeft, Download, Mail, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToPDF } from "@/lib/pdfExport";
import { cn } from "@/lib/utils";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_rate: number | null;
  tax_amount: number | null;
  total: number;
  notes: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_company: string | null;
  client_address: string | null;
}

const statusConfig = {
  draft: { label: "Draft", icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted" },
  sent: { label: "Sent", icon: Clock, color: "text-warning", bgColor: "bg-warning/10" },
  paid: { label: "Paid", icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
  overdue: { label: "Overdue", icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10" },
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useBusinessSettings();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          status,
          issue_date,
          due_date,
          subtotal,
          tax_rate,
          tax_amount,
          total,
          notes,
          clients (
            name,
            email,
            phone,
            company,
            address
          )
        `)
        .eq("id", id)
        .single();

      if (invoiceError) throw invoiceError;

      const clientData = invoiceData.clients as any;
      setInvoice({
        ...invoiceData,
        client_name: clientData?.name || "Unknown Client",
        client_email: clientData?.email || null,
        client_phone: clientData?.phone || null,
        client_company: clientData?.company || null,
        client_address: clientData?.address || null,
      });

      const { data: itemsData, error: itemsError } = await supabase
        .from("invoice_items")
        .select("id, description, quantity, unit_price, total")
        .eq("invoice_id", id);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error: any) {
      toast.error("Failed to load invoice");
      navigate("/invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!invoice) return;
    setExporting(true);
    try {
      await exportToPDF("invoice-detail-preview", `Invoice-${invoice.invoice_number}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", invoice.id);

      if (error) throw error;
      toast.success("Invoice marked as paid!");
      fetchInvoice();
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Invoice not found</p>
          <Button variant="outline" onClick={() => navigate("/invoices")} className="mt-4">
            Back to Invoices
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isOverdue = invoice.status !== "paid" && invoice.due_date && new Date(invoice.due_date) < new Date();
  const statusKey = isOverdue ? "overdue" : invoice.status;
  const status = statusConfig[statusKey as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">Invoice #{invoice.invoice_number}</h1>
                <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium", status.bgColor, status.color)}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Issued on {new Date(invoice.issue_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {invoice.status !== "paid" && (
              <Button variant="outline" onClick={handleMarkAsPaid}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Paid
              </Button>
            )}
            <Button variant="outline" onClick={handleExportPDF} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" />
              {exporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="max-w-4xl mx-auto">
          <div id="invoice-detail-preview" className="bg-white rounded-xl border border-border p-8" style={{ color: '#1a1a1a' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-primary">
              <div className="flex items-start gap-4">
                {settings?.logo_url && (
                  <img src={settings.logo_url} alt="Logo" className="h-12 w-auto object-contain" />
                )}
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#1a1a1a' }}>{settings?.business_name || "Your Business"}</h2>
                  {settings?.address && <p className="text-sm" style={{ color: '#666666' }}>{settings.address}</p>}
                  {settings?.email && <p className="text-sm" style={{ color: '#666666' }}>{settings.email}</p>}
                  {settings?.phone && <p className="text-sm" style={{ color: '#666666' }}>{settings.phone}</p>}
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-black uppercase text-primary">INVOICE</h1>
                <p className="text-sm mt-1" style={{ color: '#666666' }}>#{invoice.invoice_number}</p>
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: '#888888' }}>Bill To</h3>
                <p className="font-semibold" style={{ color: '#1a1a1a' }}>{invoice.client_name}</p>
                {invoice.client_company && <p className="text-sm" style={{ color: '#666666' }}>{invoice.client_company}</p>}
                {invoice.client_email && <p className="text-sm" style={{ color: '#666666' }}>{invoice.client_email}</p>}
                {invoice.client_phone && <p className="text-sm" style={{ color: '#666666' }}>{invoice.client_phone}</p>}
                {invoice.client_address && <p className="text-sm" style={{ color: '#666666' }}>{invoice.client_address}</p>}
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <h3 className="text-xs font-semibold uppercase mb-1" style={{ color: '#888888' }}>Issue Date</h3>
                  <p style={{ color: '#1a1a1a' }}>{new Date(invoice.issue_date).toLocaleDateString()}</p>
                </div>
                {invoice.due_date && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase mb-1" style={{ color: '#888888' }}>Due Date</h3>
                    <p className="font-medium" style={{ color: isOverdue ? '#dc2626' : '#1a1a1a' }}>
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <th className="text-left py-3 text-xs font-semibold uppercase" style={{ color: '#888888' }}>Description</th>
                    <th className="text-right py-3 text-xs font-semibold uppercase" style={{ color: '#888888' }}>Qty</th>
                    <th className="text-right py-3 text-xs font-semibold uppercase" style={{ color: '#888888' }}>Unit Price</th>
                    <th className="text-right py-3 text-xs font-semibold uppercase" style={{ color: '#888888' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td className="py-4" style={{ color: '#1a1a1a' }}>{item.description}</td>
                      <td className="py-4 text-right" style={{ color: '#666666' }}>{item.quantity}</td>
                      <td className="py-4 text-right font-mono" style={{ color: '#666666' }}>{formatIDR(item.unit_price)}</td>
                      <td className="py-4 text-right font-semibold font-mono" style={{ color: '#1a1a1a' }}>{formatIDR(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72">
                <div className="flex justify-between py-2">
                  <span style={{ color: '#666666' }}>Subtotal</span>
                  <span className="font-mono" style={{ color: '#1a1a1a' }}>{formatIDR(invoice.subtotal)}</span>
                </div>
                {invoice.tax_rate && invoice.tax_rate > 0 && (
                  <div className="flex justify-between py-2">
                    <span style={{ color: '#666666' }}>Tax ({invoice.tax_rate}%)</span>
                    <span className="font-mono" style={{ color: '#1a1a1a' }}>{formatIDR(invoice.tax_amount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-t-2 border-primary mt-2">
                  <span className="font-bold" style={{ color: '#1a1a1a' }}>Total</span>
                  <span className="text-xl font-bold font-mono text-primary">{formatIDR(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes & Payment Info */}
            {(invoice.notes || settings?.bank_name) && (
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid #e5e5e5' }}>
                {invoice.notes && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: '#888888' }}>Notes</h3>
                    <p className="text-sm" style={{ color: '#666666' }}>{invoice.notes}</p>
                  </div>
                )}
                {settings?.bank_name && (
                  <div className="rounded-lg p-4" style={{ backgroundColor: '#f5f5f5' }}>
                    <h3 className="text-xs font-semibold uppercase mb-2" style={{ color: '#888888' }}>Payment Information</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p style={{ color: '#666666' }}>Bank</p>
                        <p className="font-medium" style={{ color: '#1a1a1a' }}>{settings.bank_name}</p>
                      </div>
                      {settings.account_name && (
                        <div>
                          <p style={{ color: '#666666' }}>Account Name</p>
                          <p className="font-medium" style={{ color: '#1a1a1a' }}>{settings.account_name}</p>
                        </div>
                      )}
                      {settings.account_number && (
                        <div>
                          <p style={{ color: '#666666' }}>Account Number</p>
                          <p className="font-medium font-mono" style={{ color: '#1a1a1a' }}>{settings.account_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

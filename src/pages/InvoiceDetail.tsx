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
import { resolveInvoiceStatus, getInvoiceStatusUI, formatDueDate } from "@/lib/documentStatus";
import { StatusBadge } from "@/components/ui/StatusBadge";

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

      interface ClientData {
        name?: string;
        email?: string;
        phone?: string;
        company?: string;
        address?: string;
      }
      const clientData = invoiceData.clients as ClientData | null;
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
    } catch (error: unknown) {
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
      const result = await exportToPDF("invoice-detail-preview", `Invoice-${invoice.invoice_number}.pdf`);
      if (result.success) {
        toast.success("PDF exported successfully!");
      } else {
        toast.error(result.error || "Failed to export PDF", {
          action: {
            label: "Retry",
            onClick: handleExportPDF,
          },
        });
      }
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
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", invoice.id);

      if (error) throw error;
      toast.success("Invoice marked as paid!");
      fetchInvoice();
    } catch (error: unknown) {
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

  const resolvedStatus = resolveInvoiceStatus({ status: invoice.status, due_date: invoice.due_date });
  const isOverdue = resolvedStatus === 'overdue';
  const statusUI = getInvoiceStatusUI(resolvedStatus);

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
                <h1 className="text-2xl font-semibold text-foreground">Invoice #{invoice.invoice_number}</h1>
                <StatusBadge type="invoice" status={resolvedStatus} />
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
          <div id="invoice-detail-preview" className="print-document bg-white border border-gray-200" style={{ color: '#1a1a1a' }}>
            {/* Header */}
            <div className="px-8 pt-8 pb-6" data-print-element="header">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  {settings?.logo_url && (
                    <img src={settings.logo_url} alt="Logo" className="h-12 w-auto object-contain shrink-0" />
                  )}
                  <div>
                    <h2 className="text-base font-semibold" style={{ color: '#111827' }}>{settings?.business_name || "Your Business"}</h2>
                    {settings?.address && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#6b7280' }}>{settings.address}</p>}
                    {settings?.email && <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{settings.email}</p>}
                    {settings?.phone && <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{settings.phone}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#9ca3af' }}>Invoice</h1>
                  <p className="text-lg font-semibold font-numeric mt-0.5 tracking-tight" style={{ color: '#111827' }}>#{invoice.invoice_number}</p>
                </div>
              </div>
            </div>

            {/* Meta Strip */}
            <div className="px-8 py-4 border-y" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }} data-print-element="meta">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#9ca3af' }}>Issue Date</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: '#1f2937' }}>
                    {new Date(invoice.issue_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                {invoice.due_date && (
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#9ca3af' }}>Due Date</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: isOverdue ? '#dc2626' : '#1f2937' }}>
                      {new Date(invoice.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#9ca3af' }}>Currency</p>
                  <p className="text-sm font-medium font-numeric mt-0.5" style={{ color: '#1f2937' }}>IDR</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6">
              {/* Bill To */}
              <div className="mb-6" data-print-element="bill-to">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>Bill To</p>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{invoice.client_name}</p>
                {invoice.client_company && <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{invoice.client_company}</p>}
                {invoice.client_email && <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{invoice.client_email}</p>}
                {invoice.client_phone && <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{invoice.client_phone}</p>}
                {invoice.client_address && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#6b7280' }}>{invoice.client_address}</p>}
              </div>

              {/* Line Items */}
              <div className="mb-6" data-print-element="line-items" data-print-page-break="avoid">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ borderBottom: '2px solid #111827' }}>
                      <th className="text-left pb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Description</th>
                      <th className="text-right pb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Qty</th>
                      <th className="text-right pb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Unit Price</th>
                      <th className="text-right pb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td className="py-3 pr-4 text-sm" style={{ color: '#1f2937' }}>{item.description}</td>
                        <td className="py-3 text-sm text-right font-numeric" style={{ color: '#374151' }}>{item.quantity}</td>
                        <td className="py-3 text-sm text-right font-numeric" style={{ color: '#374151' }}>{formatIDR(item.unit_price)}</td>
                        <td className="py-3 text-sm text-right font-numeric font-medium" style={{ color: '#111827' }}>{formatIDR(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end" data-print-element="totals" data-print-page-break="avoid">
                <div className="w-64">
                  <div className="flex justify-between py-1.5 text-sm">
                    <span style={{ color: '#6b7280' }}>Subtotal</span>
                    <span className="font-numeric" style={{ color: '#1f2937' }}>{formatIDR(invoice.subtotal)}</span>
                  </div>
                  {invoice.tax_rate && invoice.tax_rate > 0 && (
                    <div className="flex justify-between py-1.5 text-sm">
                      <span style={{ color: '#6b7280' }}>Tax ({invoice.tax_rate}%)</span>
                      <span className="font-numeric" style={{ color: '#1f2937' }}>{formatIDR(invoice.tax_amount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 mt-2" style={{ borderTop: '2px solid #111827' }}>
                    <span className="text-sm font-semibold" style={{ color: '#111827' }}>Total</span>
                    <span className="text-lg font-semibold font-numeric" style={{ color: '#111827' }}>{formatIDR(invoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Payment Info */}
              {(invoice.notes || settings?.bank_name) && (
                <div className="mt-8 pt-6" style={{ borderTop: '1px solid #e5e7eb' }} data-print-element="payment" data-print-page-break="avoid">
                  {invoice.notes && (
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#9ca3af' }}>Notes</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{invoice.notes}</p>
                    </div>
                  )}
                  {settings?.bank_name && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#9ca3af' }}>Payment Details</p>
                      <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Bank</p>
                          <p className="text-sm font-medium mt-0.5" style={{ color: '#1f2937' }}>{settings.bank_name}</p>
                        </div>
                        {settings.account_name && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Account Name</p>
                            <p className="text-sm font-medium mt-0.5" style={{ color: '#1f2937' }}>{settings.account_name}</p>
                          </div>
                        )}
                        {settings.account_number && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Account Number</p>
                            <p className="text-sm font-medium font-numeric mt-0.5" style={{ color: '#1f2937' }}>{settings.account_number}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }} data-print-element="footer">
              <p className="text-xs text-center" style={{ color: '#9ca3af' }}>Thank you for your business</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

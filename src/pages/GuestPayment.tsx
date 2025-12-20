import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Zap, CheckCircle, Clock, AlertCircle, CreditCard, Building2, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceData {
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
  client: {
    name: string;
    email: string | null;
    company: string | null;
    address: string | null;
  } | null;
  items: InvoiceItem[];
}

const statusConfig = {
  draft: { label: "Draft", icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  pending: { label: "Pending", icon: Clock, color: "text-warning", bg: "bg-warning/20" },
  sent: { label: "Awaiting Payment", icon: Clock, color: "text-warning", bg: "bg-warning/20" },
  paid: { label: "Paid", icon: CheckCircle, color: "text-success", bg: "bg-success/20" },
  overdue: { label: "Overdue", icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/20" },
};

export default function GuestPayment() {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!token) {
        setError("Invalid payment link");
        setLoading(false);
        return;
      }

      try {
        // Fetch invoice by payment token
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
              company,
              address
            )
          `)
          .eq("payment_token", token)
          .maybeSingle();

        if (invoiceError) throw invoiceError;

        if (!invoiceData) {
          setError("Invoice not found or link has expired");
          setLoading(false);
          return;
        }

        // Fetch invoice items
        const { data: itemsData, error: itemsError } = await supabase
          .from("invoice_items")
          .select("id, description, quantity, unit_price, total")
          .eq("invoice_id", invoiceData.id);

        if (itemsError) throw itemsError;

        setInvoice({
          ...invoiceData,
          client: invoiceData.clients as InvoiceData["client"],
          items: itemsData || [],
        });
      } catch (err: any) {
        console.error("Error fetching invoice:", err);
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border py-4 px-6">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Kalaudra Studio</span>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          <div className="glass-card rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Invoice Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The invoice you're looking for doesn't exist or has expired."}</p>
            <Link to="/">
              <Button>Go to Homepage</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isOverdue = invoice.status !== "paid" && invoice.due_date && new Date(invoice.due_date) < new Date();
  const statusKey = isOverdue ? "overdue" : invoice.status;
  const status = statusConfig[statusKey as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Kalaudra Studio</span>
          </div>
          <span className={cn("px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5", status.bg, status.color)}>
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto p-6 w-full">
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-8 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-1">INVOICE</h1>
                <p className="text-xl font-mono text-foreground">{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="text-foreground font-medium">
                  {format(new Date(invoice.issue_date), "MMMM d, yyyy")}
                </p>
                {invoice.due_date && (
                  <>
                    <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                    <p className={cn("font-medium", isOverdue ? "text-destructive" : "text-foreground")}>
                      {format(new Date(invoice.due_date), "MMMM d, yyyy")}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Client Info */}
            {invoice.client && (
              <div className="mb-8 p-4 rounded-xl bg-secondary/30 border border-border/50">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Bill To</h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-foreground">{invoice.client.name}</p>
                    {invoice.client.company && (
                      <p className="text-sm text-muted-foreground">{invoice.client.company}</p>
                    )}
                    {invoice.client.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {invoice.client.email}
                      </div>
                    )}
                    {invoice.client.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="whitespace-pre-line">{invoice.client.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Line Items */}
            <div className="rounded-xl overflow-hidden border border-border mb-6">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">
                      Description
                    </th>
                    <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4 w-20">
                      Qty
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4 w-32">
                      Unit Price
                    </th>
                    <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4 w-32">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
                      <td className="p-4 text-sm text-foreground">{item.description}</td>
                      <td className="p-4 text-sm text-foreground text-center">{item.quantity}</td>
                      <td className="p-4 text-sm text-foreground text-right font-mono">
                        {formatIDR(item.unit_price)}
                      </td>
                      <td className="p-4 text-sm text-foreground text-right font-mono font-medium">
                        {formatIDR(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono text-foreground">{formatIDR(invoice.subtotal)}</span>
                </div>
                {invoice.tax_rate && invoice.tax_rate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span>
                    <span className="font-mono text-foreground">{formatIDR(invoice.tax_amount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="text-xl font-semibold text-foreground">Total Due</span>
                  <span className="text-2xl font-bold font-mono gradient-text">{formatIDR(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 mb-8">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}

            {/* Payment Button */}
            {invoice.status !== "paid" && (
              <div className="space-y-4">
                <Button className="w-full h-14 text-lg gap-3" size="lg">
                  <CreditCard className="w-5 h-5" />
                  Pay {formatIDR(invoice.total)}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Secure payment powered by our payment gateway. Your payment information is encrypted.
                </p>
              </div>
            )}

            {invoice.status === "paid" && (
              <div className="p-6 rounded-xl bg-success/10 border border-success/30 text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-success mb-1">Payment Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Thank you for your payment. This invoice has been paid.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2024 Kalaudra Studio. All rights reserved.</p>
          <p className="mt-1">Questions about this invoice? Contact us at support@kalaudra.studio</p>
        </div>
      </footer>
    </div>
  );
}

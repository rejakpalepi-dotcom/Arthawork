import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { 
  CheckCircle, Clock, AlertCircle, CreditCard, Building2, 
  Lock, Shield, Search, Palette, Code, HelpCircle, Mail
} from "lucide-react";
import arthaLogo from "@/assets/artha-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
    company: string | null;
  } | null;
  items: InvoiceItem[];
}

const statusConfig = {
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted" },
  pending: { label: "Pending", color: "text-warning", bg: "bg-warning/20" },
  sent: { label: "Awaiting Payment", color: "text-warning", bg: "bg-warning/20" },
  paid: { label: "Paid", color: "text-success", bg: "bg-success/20" },
  overdue: { label: "Overdue", color: "text-destructive", bg: "bg-destructive/20" },
};

const serviceIcons: Record<number, typeof Search> = {
  0: Search,
  1: Palette,
  2: Code,
};

type PaymentMethod = "card" | "bank" | "paypal";

export default function GuestPayment() {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [useBillingAddress, setUseBillingAddress] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!token) {
        setError("Invalid payment link");
        setLoading(false);
        return;
      }

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
              company
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
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <img src={arthaLogo} alt="Artha" className="h-8 w-8 object-contain" />
            <span className="font-bold text-foreground tracking-tight">Artha</span>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4 px-6 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={arthaLogo} alt="Artha" className="h-8 w-8 object-contain" />
            <span className="font-bold text-foreground tracking-tight">Artha</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Invoice Summary */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-primary font-medium mb-2">Payment Portal</p>
              <h1 className="text-3xl font-bold text-foreground">
                Complete Your<br />Payment
              </h1>
              <p className="text-muted-foreground mt-3">
                Securely pay invoice #{invoice.invoice_number} for your recent project with Artha.
              </p>
            </div>

            {/* Project & Due Date */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Project</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {invoice.items[0]?.description?.split(' - ')[0] || "Project"}
                </p>
              </div>
              {invoice.due_date && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Due Date</p>
                  <p className={cn("text-sm font-medium mt-1", isOverdue ? "text-destructive" : "text-foreground")}>
                    {format(new Date(invoice.due_date), "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>

            {/* Services List */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              {invoice.items.map((item, index) => {
                const Icon = serviceIcons[index % 3] || Search;
                return (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.description}</span>
                    </div>
                    <span className="font-mono text-sm font-medium text-foreground">{formatIDR(item.total)}</span>
                  </div>
                );
              })}
            </div>

            {/* Total Amount */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount Due</p>
                  <p className="text-xs text-muted-foreground">Including all applicable taxes</p>
                </div>
                <span className="text-3xl font-bold gradient-text font-mono">{formatIDR(invoice.total)}</span>
              </div>
            </div>

            {/* Client & Invoice Info */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium text-foreground">{invoice.client?.name || "Client"}</p>
                  {invoice.client?.company && (
                    <p className="text-xs text-muted-foreground">{invoice.client.company}</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Invoice ID</p>
                <p className="font-medium text-foreground font-mono">#{invoice.invoice_number}</p>
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium", status.bg, status.color)}>
                  {status.label}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Form */}
          <div className="glass-card rounded-2xl p-8">
            {invoice.status === "paid" ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-success mb-2">Payment Complete</h2>
                <p className="text-muted-foreground">
                  Thank you for your payment. This invoice has been paid.
                </p>
              </div>
            ) : (
              <>
                {/* Payment Method Tabs */}
                <div className="flex items-center gap-2 p-1 bg-secondary rounded-xl mb-6">
                  {[
                    { id: "card" as const, label: "Card Payment", icon: CreditCard },
                    { id: "bank" as const, label: "Bank Transfer", icon: Building2 },
                    { id: "paypal" as const, label: "PayPal", icon: null },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                        paymentMethod === method.id
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {method.icon && <method.icon className="w-4 h-4" />}
                      {method.label}
                    </button>
                  ))}
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Payment Details</h3>
                    
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="cardNumber"
                          placeholder="4242 4242 4242 4242"
                          className="pl-10"
                        />
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">MM / YY</Label>
                        <Input
                          id="expiry"
                          placeholder="12 / 25"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc" className="flex items-center gap-1">
                          CVC
                          <HelpCircle className="w-3 h-3 text-muted-foreground" />
                        </Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                      <Input
                        id="cardholderName"
                        placeholder="John Doe"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email for Receipt</Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="email"
                          type="email"
                          placeholder="billing@acmecorp.com"
                          className="pl-10"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="useBilling" 
                        checked={useBillingAddress}
                        onCheckedChange={(checked) => setUseBillingAddress(checked === true)}
                      />
                      <label htmlFor="useBilling" className="text-sm text-muted-foreground cursor-pointer">
                        Use shipping address for billing
                      </label>
                    </div>

                    <Button className="w-full h-12 text-base gap-2 mt-4">
                      <Lock className="w-4 h-4" />
                      Pay {formatIDR(invoice.total)}
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        256-bit SSL Encrypted
                      </div>
                      <span>•</span>
                      <span>Powered by Stripe</span>
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      By confirming payment, you allow Artha to charge your card for the amount above securely.
                    </p>
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Bank Transfer Details</h3>
                    <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bank Name</span>
                        <span className="font-medium text-foreground">Bank Central Asia (BCA)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Account Number</span>
                        <span className="font-medium text-foreground font-mono">8839 2992 001</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Account Name</span>
                        <span className="font-medium text-foreground">Artha Studio</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-primary font-mono">{formatIDR(invoice.total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reference</span>
                        <span className="font-medium text-foreground font-mono">{invoice.invoice_number}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Please include the reference number in your transfer description. Payment confirmation may take 1-2 business days.
                    </p>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="space-y-4 text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#0070ba]/10 flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold text-[#0070ba]">P</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Pay with PayPal</h3>
                    <p className="text-sm text-muted-foreground">
                      You'll be redirected to PayPal to complete your payment securely.
                    </p>
                    <Button className="w-full h-12 bg-[#0070ba] hover:bg-[#005ea6] gap-2">
                      Continue to PayPal
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 mt-8">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2025 Artha. All rights reserved.</p>
          <p className="mt-1">Questions about this invoice? Contact us at support@artha.app</p>
        </div>
      </footer>
    </div>
  );
}

import { format } from "date-fns";
import { Zap, Mail, MapPin } from "lucide-react";
import { formatIDR } from "@/lib/currency";
import { InvoiceFormData } from "./types";
import { cn } from "@/lib/utils";
interface InvoicePreviewProps {
  data: InvoiceFormData;
  subtotal: number;
  taxAmount: number;
  total: number;
}
export function InvoicePreview({
  data,
  subtotal,
  taxAmount,
  total
}: InvoicePreviewProps) {
  return <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg glow-primary">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">Artha</h2>
              <p className="text-sm text-muted-foreground mt-1">123 Creative Ave, Studio 4B</p>
              <p className="text-sm text-muted-foreground">San Francisco, CA 94103</p>
              <p className="text-sm text-primary mt-1">hello@papr.studio</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold gradient-text tracking-tight">INVOICE</h1>
            <p className="text-lg font-mono text-foreground mt-1">
              #{data.invoiceNumber || "INV-XXXX"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Issued: {data.issueDate ? format(data.issueDate, "MMM d, yyyy") : "Not set"}
            </p>
            <div className="mt-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
                Draft
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Bill To */}
        <div className="mb-6 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Bill To
          </h3>
          <p className="text-lg font-semibold text-foreground">
            {data.clientName || "Client Name"}
          </p>
          {data.clientEmail && <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Mail className="w-4 h-4" />
              {data.clientEmail}
            </div>}
          {data.clientAddress && <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="whitespace-pre-line">{data.clientAddress}</span>
            </div>}
        </div>

        {/* Line Items Table */}
        <div className="rounded-xl overflow-hidden border border-border mb-6">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-3">
                  Description
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider p-3 w-16">
                  Qty
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider p-3 w-28">
                  Rate
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider p-3 w-28">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.length === 0 ? <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground text-sm">
                    No items added
                  </td>
                </tr> : data.lineItems.map((item, index) => <tr key={item.id} className={cn(index % 2 === 0 ? "bg-card" : "bg-secondary/20")}>
                    <td className="p-3 text-sm text-foreground">
                      {item.description || "Item description"}
                    </td>
                    <td className="p-3 text-sm text-foreground text-center">{item.quantity}</td>
                    <td className="p-3 text-sm text-foreground text-right font-mono">
                      {formatIDR(item.unitPrice)}
                    </td>
                    <td className="p-3 text-sm text-foreground text-right font-mono font-medium">
                      {formatIDR(item.total)}
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-56 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono text-foreground">{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({data.taxRate}%)</span>
              <span className="font-mono text-foreground">{formatIDR(taxAmount)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="font-semibold text-foreground">Total Due</span>
              <span className="text-lg font-bold font-mono gradient-text">{formatIDR(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Payment Details
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Bank</p>
              <p className="text-foreground font-medium">Bank Central Asia</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account</p>
              <p className="text-foreground font-medium font-mono">8839 2992 001</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account Name</p>
              <p className="text-foreground font-medium">Kalaudra Studio</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Notes
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{data.notes}</p>
          </div>}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 text-center border-t border-border">
        <p className="text-sm font-medium text-foreground">
          Thank you for your business!
        </p>
      </div>
    </div>;
}
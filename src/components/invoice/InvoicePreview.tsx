import { format } from "date-fns";
import { Zap } from "lucide-react";
import { formatIDR } from "@/lib/currency";
import { InvoiceFormData } from "./types";

interface InvoicePreviewProps {
  data: InvoiceFormData;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function InvoicePreview({ data, subtotal, taxAmount, total }: InvoicePreviewProps) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-8 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Kalaudra Studio</h2>
              <p className="text-sm text-muted-foreground">Creative Design Agency</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold gradient-text">INVOICE</h1>
            <p className="text-lg font-mono text-foreground mt-1">
              {data.invoiceNumber || "INV-XXX"}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-8">
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Bill To */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Bill To
            </h3>
            <p className="text-lg font-semibold text-foreground">
              {data.clientName || "Client Name"}
            </p>
            {data.clientEmail && (
              <p className="text-sm text-muted-foreground">{data.clientEmail}</p>
            )}
            {data.clientAddress && (
              <p className="text-sm text-muted-foreground whitespace-pre-line mt-1">
                {data.clientAddress}
              </p>
            )}
          </div>

          {/* Invoice Info */}
          <div className="text-right space-y-2">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Issue Date
              </span>
              <p className="text-sm text-foreground">
                {data.issueDate ? format(data.issueDate, "MMMM d, yyyy") : "Not set"}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Due Date
              </span>
              <p className="text-sm text-foreground">
                {data.dueDate ? format(data.dueDate, "MMMM d, yyyy") : "Not set"}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
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
              {data.lineItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No items added
                  </td>
                </tr>
              ) : (
                data.lineItems.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
                    <td className="p-4 text-sm text-foreground">
                      {item.description || "Item description"}
                    </td>
                    <td className="p-4 text-sm text-foreground text-center">{item.quantity}</td>
                    <td className="p-4 text-sm text-foreground text-right font-mono">
                      {formatIDR(item.unitPrice)}
                    </td>
                    <td className="p-4 text-sm text-foreground text-right font-mono font-medium">
                      {formatIDR(item.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono text-foreground">{formatIDR(subtotal)}</span>
            </div>
            {data.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({data.taxRate}%)</span>
                <span className="font-mono text-foreground">{formatIDR(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold font-mono gradient-text">{formatIDR(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Notes
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{data.notes}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-secondary/30 p-6 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          Thank you for your business!
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Payment is due within the specified due date. Please include the invoice number in your payment reference.
        </p>
      </div>
    </div>
  );
}

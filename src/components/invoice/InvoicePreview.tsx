import { format } from "date-fns";
import { formatCurrency, getCurrency } from "@/lib/currencies";
import { InvoiceFormData } from "./types";
import { cn } from "@/lib/utils";
import { BusinessSettings } from "@/hooks/useBusinessSettings";
import { getInvoiceStatus, formatDueDate } from "@/lib/documentStatus";

interface InvoicePreviewProps {
  data: InvoiceFormData;
  subtotal: number;
  taxAmount: number;
  total: number;
  businessSettings?: BusinessSettings;
  currentStatus?: string;
  /** When true, forces print-safe styles for PDF export */
  forExport?: boolean;
}

export function InvoicePreview({
  data,
  subtotal,
  taxAmount,
  total,
  businessSettings,
  currentStatus = 'draft',
  forExport = false,
}: InvoicePreviewProps) {
  const businessName = businessSettings?.business_name || "Nama Bisnis Kamu";
  const businessAddress = businessSettings?.address || "Alamat bisnis kamu";
  const businessEmail = businessSettings?.email || "halo@bisniskamu.com";
  const logoUrl = businessSettings?.logo_url;
  const bankName = businessSettings?.bank_name || "Nama Bank";
  const accountNumber = businessSettings?.account_number || "XXXX XXXX XXX";
  const accountName = businessSettings?.account_name || "Nama Pemilik Rekening";

  const statusConfig = getInvoiceStatus(currentStatus);
  const dueDateInfo = formatDueDate(data.dueDate ? data.dueDate.toISOString() : null);
  const currencyCode = getCurrency(data.currency || "IDR").code;

  // For export: explicit inline styles to avoid theme dependency
  const exportStyles = forExport ? {
    container: { width: "794px", background: "#ffffff", color: "#1a1a1a" },
    mutedText: { color: "#6b7280" },
    subtleText: { color: "#9ca3af" },
    primaryText: { color: "#00ACC1" },
    sectionBg: { backgroundColor: "#f8f9fa" },
    border: { borderColor: "#e5e7eb" },
    numeric: {
      fontFamily: "'IBM Plex Sans', 'Poppins', system-ui, sans-serif",
      fontVariantNumeric: "tabular-nums" as const,
    },
  } : {};

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 overflow-hidden",
        forExport && "print-document shadow-none"
      )}
      style={forExport ? exportStyles.container : undefined}
      data-print-element="invoice-document"
    >
      {/* ─── Document Header ─── */}
      <div
        className="px-8 pt-8 pb-6"
        data-print-element="header"
      >
        <div className="flex items-start justify-between">
          {/* Left: Business identity */}
          <div className="flex items-start gap-4">
            {logoUrl ? (
              <div className="w-12 h-12 overflow-hidden shrink-0">
                <img src={logoUrl} alt={businessName} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div
                className="w-12 h-12 bg-gray-100 flex items-center justify-center shrink-0"
                style={forExport ? { backgroundColor: "#f3f4f6" } : undefined}
              >
                <span
                  className="text-lg font-semibold text-gray-700"
                  style={forExport ? { color: "#374151" } : undefined}
                >
                  {businessName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2
                className="text-base font-semibold text-gray-900 tracking-tight"
                style={forExport ? { color: "#111827" } : undefined}
              >
                {businessName}
              </h2>
              <p
                className="text-xs text-gray-500 mt-0.5 whitespace-pre-line leading-relaxed"
                style={forExport ? exportStyles.mutedText : undefined}
              >
                {businessAddress}
              </p>
              <p
                className="text-xs text-gray-500 mt-0.5"
                style={forExport ? exportStyles.mutedText : undefined}
              >
                {businessEmail}
              </p>
            </div>
          </div>

          {/* Right: Invoice identity */}
          <div className="text-right">
            <h1
              className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em]"
              style={forExport ? { color: "#9ca3af" } : undefined}
            >
              Invoice
            </h1>
            <p
              className="text-lg font-semibold font-numeric text-gray-900 mt-0.5 tracking-tight"
              style={forExport ? { color: "#111827", ...exportStyles.numeric } : undefined}
              data-print-numeric
            >
              {data.invoiceNumber || "INV-XXXX"}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Meta Strip ─── */}
      <div
        className="px-8 py-4 bg-gray-50 border-y border-gray-200"
        style={forExport ? { backgroundColor: "#f9fafb", borderColor: "#e5e7eb" } : undefined}
        data-print-element="meta"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <p
                className="text-[10px] font-medium text-gray-400 uppercase tracking-wider"
                style={forExport ? exportStyles.subtleText : undefined}
              >
                Tanggal Terbit
              </p>
              <p
                className="text-sm font-medium text-gray-800 mt-0.5"
                style={forExport ? { color: "#1f2937" } : undefined}
              >
                {data.issueDate ? format(data.issueDate, "dd MMM yyyy") : "Belum diatur"}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] font-medium text-gray-400 uppercase tracking-wider"
                style={forExport ? exportStyles.subtleText : undefined}
              >
                Jatuh Tempo
              </p>
              <p
                className={cn(
                  "text-sm font-medium mt-0.5",
                  dueDateInfo.isOverdue ? "text-red-600" : dueDateInfo.isUrgent ? "text-amber-600" : "text-gray-800"
                )}
                style={forExport ? { color: dueDateInfo.isOverdue ? "#dc2626" : dueDateInfo.isUrgent ? "#d97706" : "#1f2937" } : undefined}
              >
                {dueDateInfo.text || "Belum diatur"}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] font-medium text-gray-400 uppercase tracking-wider"
                style={forExport ? exportStyles.subtleText : undefined}
              >
                Mata Uang
              </p>
              <p
                className="text-sm font-medium text-gray-800 font-numeric mt-0.5"
                style={forExport ? { color: "#1f2937", ...exportStyles.numeric } : undefined}
              >
                {currencyCode}
              </p>
            </div>
          </div>

          {/* Status badge — hidden in export */}
          {!forExport && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium",
                statusConfig.bgClass,
                statusConfig.textClass
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotClass)} />
              {statusConfig.labelId}
            </span>
          )}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* ─── Bill To ─── */}
        <div
          className="mb-6"
          data-print-element="bill-to"
        >
          <p
            className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2"
            style={forExport ? exportStyles.subtleText : undefined}
          >
            Ditagihkan Kepada
          </p>
          <p
            className="text-sm font-semibold text-gray-900"
            style={forExport ? { color: "#111827" } : undefined}
          >
            {data.clientName || "Nama Klien"}
          </p>
          {data.clientEmail && (
            <p
              className="text-xs text-gray-500 mt-0.5"
              style={forExport ? exportStyles.mutedText : undefined}
            >
              {data.clientEmail}
            </p>
          )}
          {data.clientPhone && (
            <p
              className="text-xs text-gray-500 mt-0.5"
              style={forExport ? exportStyles.mutedText : undefined}
            >
              {data.clientPhone}
            </p>
          )}
          {data.clientAddress && (
            <p
              className="text-xs text-gray-500 mt-0.5 whitespace-pre-line leading-relaxed"
              style={forExport ? exportStyles.mutedText : undefined}
            >
              {data.clientAddress}
            </p>
          )}
        </div>

        {/* ─── Line Items Table ─── */}
        <div
          className="mb-6"
          data-print-element="line-items"
          data-print-page-break="avoid"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr
                className="border-b-2 border-gray-900"
                style={forExport ? { borderColor: "#111827" } : undefined}
              >
                <th
                  className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider pb-2"
                  style={forExport ? exportStyles.mutedText : undefined}
                >
                  Description
                </th>
                <th
                  className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider pb-2 w-14"
                  style={forExport ? exportStyles.mutedText : undefined}
                >
                  Qty
                </th>
                <th
                  className="text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider pb-2 w-28"
                  style={forExport ? exportStyles.mutedText : undefined}
                >
                  Rate
                </th>
                <th
                  className="text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider pb-2 w-28"
                  style={forExport ? exportStyles.mutedText : undefined}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.lineItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-gray-400 text-sm"
                    style={forExport ? exportStyles.subtleText : undefined}
                  >
                    Belum ada item ditambahkan
                  </td>
                </tr>
              ) : (
                data.lineItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100"
                    style={forExport ? { borderColor: "#f3f4f6" } : undefined}
                  >
                    <td
                      className="py-3 pr-4 text-sm text-gray-800"
                      style={forExport ? { color: "#1f2937" } : undefined}
                    >
                      {item.description || "Item description"}
                    </td>
                    <td
                      className="py-3 text-sm text-gray-700 text-center font-numeric"
                      style={forExport ? { color: "#374151", ...exportStyles.numeric } : undefined}
                      data-print-numeric
                    >
                      {item.quantity}
                    </td>
                    <td
                      className="py-3 text-sm text-gray-700 text-right font-numeric"
                      style={forExport ? { color: "#374151", ...exportStyles.numeric } : undefined}
                      data-print-numeric
                    >
                      {formatCurrency(item.unitPrice, data.currency || "IDR")}
                    </td>
                    <td
                      className="py-3 text-sm text-gray-900 text-right font-numeric font-medium"
                      style={forExport ? { color: "#111827", ...exportStyles.numeric } : undefined}
                      data-print-numeric
                    >
                      {formatCurrency(item.total, data.currency || "IDR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Totals ─── */}
        <div className="flex justify-end" data-print-element="totals" data-print-page-break="avoid">
          <div className="w-64">
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-500" style={forExport ? exportStyles.mutedText : undefined}>
                Subtotal
              </span>
              <span
                className="font-numeric text-gray-800"
                style={forExport ? { color: "#1f2937", ...exportStyles.numeric } : undefined}
                data-print-numeric
              >
                {formatCurrency(subtotal, data.currency || "IDR")}
              </span>
            </div>
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-500" style={forExport ? exportStyles.mutedText : undefined}>
                Tax ({data.taxRate}%)
              </span>
              <span
                className="font-numeric text-gray-800"
                style={forExport ? { color: "#1f2937", ...exportStyles.numeric } : undefined}
                data-print-numeric
              >
                {formatCurrency(taxAmount, data.currency || "IDR")}
              </span>
            </div>
            <div
              className="flex justify-between pt-3 mt-2 border-t-2 border-gray-900"
              style={forExport ? { borderColor: "#111827" } : undefined}
            >
              <span
                className="text-sm font-semibold text-gray-900"
                style={forExport ? { color: "#111827" } : undefined}
              >
                Total Due
              </span>
              <span
                className="text-lg font-semibold font-numeric text-gray-900"
                style={forExport ? { color: "#111827", ...exportStyles.numeric } : undefined}
                data-print-numeric
              >
                {formatCurrency(total, data.currency || "IDR")}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Detail Pembayaran ─── */}
        <div
          className="mt-8 pt-6 border-t border-gray-200"
          style={forExport ? { borderColor: "#e5e7eb" } : undefined}
          data-print-element="payment"
          data-print-page-break="avoid"
        >
          <p
            className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3"
            style={forExport ? exportStyles.subtleText : undefined}
          >
            Detail Pembayaran
          </p>
          <div className="grid grid-cols-3 gap-x-6 gap-y-2">
            <div>
              <p
                className="text-[10px] text-gray-400 uppercase tracking-wider"
                style={forExport ? exportStyles.subtleText : undefined}
              >
                Bank
              </p>
              <p
                className="text-sm font-medium text-gray-800 mt-0.5"
                style={forExport ? { color: "#1f2937" } : undefined}
              >
                {bankName}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] text-gray-400 uppercase tracking-wider"
                style={forExport ? exportStyles.subtleText : undefined}
              >
                Account Number
              </p>
              <p
                className="text-sm font-medium text-gray-800 font-numeric mt-0.5"
                style={forExport ? { color: "#1f2937", ...exportStyles.numeric } : undefined}
                data-print-numeric
              >
                {accountNumber}
              </p>
            </div>
            <div>
              <p
                className="text-[10px] text-gray-400 uppercase tracking-wider"
                style={forExport ? exportStyles.subtleText : undefined}
              >
                Account Name
              </p>
              <p
                className="text-sm font-medium text-gray-800 mt-0.5"
                style={forExport ? { color: "#1f2937" } : undefined}
              >
                {accountName}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Notes ─── */}
        {data.notes && (
          <div
            className="mt-6 pt-4 border-t border-gray-100"
            style={forExport ? { borderColor: "#f3f4f6" } : undefined}
            data-print-element="notes"
          >
            <p
              className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5"
              style={forExport ? exportStyles.subtleText : undefined}
            >
              Notes
            </p>
            <p
              className="text-xs text-gray-500 whitespace-pre-line leading-relaxed"
              style={forExport ? exportStyles.mutedText : undefined}
            >
              {data.notes}
            </p>
          </div>
        )}
      </div>

      {/* ─── Footer ─── */}
      <div
        className="px-8 py-4 border-t border-gray-200 bg-gray-50"
        style={forExport ? { backgroundColor: "#f9fafb", borderColor: "#e5e7eb" } : undefined}
        data-print-element="footer"
      >
        <p
          className="text-xs text-gray-400 text-center"
          style={forExport ? exportStyles.subtleText : undefined}
        >
          Thank you for your business
        </p>
      </div>
    </div>
  );
}

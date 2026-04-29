import { useState, useMemo, useEffect, useCallback } from "react";
import { transitionBuilderView, type BuilderViewState } from "@/lib/builderViewMachine";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Send, ZoomIn, ZoomOut, Eye, FileEdit, Download } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BuilderContextBar } from "@/components/layout/BuilderContextBar";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { SaveStatusIndicator } from "@/components/ui/SaveStatusIndicator";
import { invoiceFormSchema, InvoiceFormData } from "@/components/invoice/types";
import { supabase } from "@/integrations/supabase/client";
import { renderElementToPDF } from "@/lib/exportEngine";
import { toast } from "sonner";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useSendInvoiceEmail } from "@/hooks/useSendInvoiceEmail";
import { useAutosave } from "@/hooks/useAutosave";
import { cn } from "@/lib/utils";

/**
 * Serialize InvoiceFormData for JSON storage.
 * Converts Date objects to ISO strings so they survive JSON round-trip.
 */
function serializeInvoiceData(data: InvoiceFormData): Record<string, unknown> {
  return {
    ...data,
    issueDate: data.issueDate?.toISOString() ?? null,
    dueDate: data.dueDate?.toISOString() ?? null,
  };
}

/**
 * Deserialize InvoiceFormData from JSON storage.
 * Converts ISO strings back to Date objects.
 */
function deserializeInvoiceData(raw: Record<string, unknown>): Partial<InvoiceFormData> {
  return {
    ...raw,
    issueDate: raw.issueDate ? new Date(raw.issueDate as string) : new Date(),
    dueDate: raw.dueDate ? new Date(raw.dueDate as string) : null,
  } as Partial<InvoiceFormData>;
}

export default function InvoiceBuilder() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [mobileView, setMobileView] = useState<BuilderViewState>("editor");
  const switchView = (event: "SWITCH_TO_EDITOR" | "SWITCH_TO_PREVIEW") => {
    const next = transitionBuilderView(mobileView, event);
    if (next) setMobileView(next);
  };
  const [isLoading, setIsLoading] = useState(!!editId);
  const [draftId, setDraftId] = useState<string | null>(editId ?? null);
  const { settings: businessSettings } = useBusinessSettings();
  const { sendInvoiceEmail, sending: sendingEmail } = useSendInvoiceEmail();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      clientId: null,
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      issueDate: new Date(),
      dueDate: null,
      lineItems: [],
      taxRate: 0,
      notes: "",
      currency: "IDR",
    },
  });

  const formData = form.watch();

  // Calculate totals
  const { subtotal, taxAmount, total } = useMemo(() => {
    const subtotal = formData.lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (formData.taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [formData.lineItems, formData.taxRate]);

  // ---------- Draft loading ----------
  useEffect(() => {
    if (!editId) return;

    const loadDraft = async () => {
      try {
        const { data: invoice, error } = await supabase
          .from("invoices")
          .select("*, invoice_items(*)")
          .eq("id", editId)
          .single();

        if (error || !invoice) {
          toast.error("Invoice tidak ditemukan");
          navigate("/invoices");
          return;
        }

        // Try to restore from JSONB first
        const jsonData = (invoice as Record<string, unknown>).invoice_data as Record<string, unknown> | null;

        if (jsonData) {
          const restored = deserializeInvoiceData(jsonData);
          form.reset(restored as InvoiceFormData);
        } else {
          // Fallback: reconstruct from normalized fields + items
          const client = (invoice as Record<string, unknown>).clients as Record<string, string> | null;
          form.reset({
            invoiceNumber: invoice.invoice_number,
            clientId: invoice.client_id || null,
            clientName: client?.name || "",
            clientEmail: client?.email || "",
            clientPhone: client?.phone || "",
            clientAddress: client?.address || "",
            issueDate: invoice.issue_date ? new Date(invoice.issue_date) : new Date(),
            dueDate: invoice.due_date ? new Date(invoice.due_date) : null,
            taxRate: Number(invoice.tax_rate) || 0,
            notes: invoice.notes || "",
            currency: "IDR",
            lineItems: ((invoice as Record<string, unknown>).invoice_items as Array<Record<string, unknown>> || []).map(
              (item) => ({
                id: item.id as string,
                description: item.description as string,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unit_price),
                total: Number(item.total),
                serviceId: (item.service_id as string) || null,
              })
            ),
          });
        }
      } catch (err) {
        console.error("Error loading invoice draft:", err);
        toast.error("Gagal memuat invoice");
        navigate("/invoices");
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // ---------- Autosave handler ----------
  const handleAutosave = useCallback(
    async (data: InvoiceFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentSubtotal = data.lineItems.reduce((sum, item) => sum + item.total, 0);
      const currentTaxAmount = currentSubtotal * (data.taxRate / 100);
      const currentTotal = currentSubtotal + currentTaxAmount;

      const invoicePayload = {
        user_id: user.id,
        invoice_number: data.invoiceNumber || `INV-${Date.now()}`,
        client_id: data.clientId || null,
        issue_date: data.issueDate.toISOString().split("T")[0],
        due_date: data.dueDate ? data.dueDate.toISOString().split("T")[0] : null,
        subtotal: currentSubtotal,
        tax_rate: data.taxRate,
        tax_amount: currentTaxAmount,
        total: currentTotal,
        notes: data.notes || null,
        status: "draft",
        invoice_data: serializeInvoiceData(data),
      };

      if (draftId) {
        // UPDATE existing
        const { error } = await supabase
          .from("invoices")
          .update(invoicePayload)
          .eq("id", draftId);

        if (error) throw new Error(error.message);

        // Sync line items: delete & re-insert
        const validItems = data.lineItems.filter((item) => item.description.trim() !== "");
        await supabase.from("invoice_items").delete().eq("invoice_id", draftId);

        if (validItems.length > 0) {
          const itemRows = validItems.map((item) => ({
            invoice_id: draftId,
            service_id: item.serviceId || null,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.total,
          }));
          const { error: itemsError } = await supabase
            .from("invoice_items")
            .insert(itemRows);
          if (itemsError) throw new Error(itemsError.message);
        }
      } else {
        // INSERT new
        const { data: newInvoice, error } = await supabase
          .from("invoices")
          .insert(invoicePayload)
          .select()
          .single();

        if (error) throw new Error(error.message);

        setDraftId(newInvoice.id);

        // Insert line items
        const validItems = data.lineItems.filter((item) => item.description.trim() !== "");
        if (validItems.length > 0) {
          const itemRows = validItems.map((item) => ({
            invoice_id: newInvoice.id,
            service_id: item.serviceId || null,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.total,
          }));
          await supabase.from("invoice_items").insert(itemRows);
        }

        // Redirect to edit URL so further saves are updates
        navigate(`/invoices/${newInvoice.id}/edit`, { replace: true });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    [draftId, navigate, queryClient]
  );

  // Autosave integration
  const autosave = useAutosave({
    data: formData,
    onSave: handleAutosave,
    enabled: !isLoading,
    debounceMs: 2000,
  });

  // After loading a draft, mark the autosave as clean
  useEffect(() => {
    if (!isLoading && editId) {
      // Small delay to let form.reset propagate
      const timer = setTimeout(() => autosave.markClean(), 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, editId]);

  // ---------- Send invoice ----------
  const handleSend = async () => {
    const data = form.getValues();
    setIsSubmitting(true);

    try {
      // Save first to make sure everything is persisted
      await handleAutosave(data);

      const currentId = draftId;
      if (!currentId) {
        toast.error("Simpan invoice terlebih dahulu");
        setIsSubmitting(false);
        return;
      }

      // Update status to sent
      const { error: statusError } = await supabase
        .from("invoices")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", currentId);

      if (statusError) throw new Error(statusError.message);

      // Send email if client has email
      if (data.clientEmail) {
        const emailResult = await sendInvoiceEmail({
          invoiceId: currentId,
          recipientEmail: data.clientEmail,
          recipientName: data.clientName,
        });

        if (emailResult.success) {
          toast.success("Invoice berhasil dikirim ke klien", {
            description: `Email berhasil dikirim ke ${data.clientEmail}`,
          });
        } else {
          toast.warning("Invoice tersimpan, tetapi email gagal dikirim", {
            description: emailResult.error || "Email tidak bisa dikirim",
          });
        }
      } else {
        toast.success("Invoice ditandai sebagai terkirim", {
          description: "Email klien belum diisi, jadi invoice disimpan tanpa pengiriman email",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate("/invoices");
    } catch (error: unknown) {
      console.error("Error sending invoice:", error);
      const message = error instanceof Error ? error.message : "Gagal mengirim invoice";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Back navigation with unsaved changes guard ----------
  const handleBack = () => {
    if (autosave.isDirty || autosave.status === "unsaved" || autosave.status === "saving") {
      const confirmed = window.confirm(
        "Masih ada perubahan yang belum tersimpan. Yakin ingin keluar?"
      );
      if (!confirmed) return;
    }
    navigate(-1);
  };

  const onSubmit = async () => {
    await handleSend();
  };

  // ---------- Ekspor PDF ----------
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Create a hidden container with the export-ready preview
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.id = "invoice-export-container";
      document.body.appendChild(container);

      // Import ReactDOM to render the preview
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(container);

      // Render export-ready preview
      root.render(
        <InvoicePreview
          data={formData}
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={total}
          businessSettings={businessSettings}
          currentStatus="draft"
          forExport={true}
        />
      );

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 500));

      const fileName = `Invoice-${formData.invoiceNumber || "draft"}.pdf`;
      const result = await renderElementToPDF(container, {
        fileName,
        margins: [15, 12, 15, 12],
      });

      root.unmount();
      document.body.removeChild(container);

      if (result.success) {
        toast.success("PDF berhasil diekspor");
      } else {
        toast.error(result.error || "Gagal mengekspor PDF", {
          action: {
            label: "Coba Lagi",
            onClick: handleExportPDF,
          },
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengekspor PDF", {
        action: {
          label: "Coba Lagi",
          onClick: handleExportPDF,
        },
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Memuat invoice...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div data-ui-shell="invoice-builder" className="flex flex-col h-full">
        {/* Builder Context Bar */}
        <BuilderContextBar
          breadcrumbs={[
            { label: "Dokumen" },
            { label: "Invoice", href: "/invoices" },
            { label: editId ? "Ubah Invoice" : "Invoice Baru" },
          ]}
          backTo="/invoices"
          onBack={handleBack}
          documentTitle={formData.invoiceNumber || undefined}
          clientName={formData.clientName || undefined}
          documentType="invoice"
          status="draft"
          autosave={autosave}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => autosave.save()}
                disabled={autosave.status === "saving"}
                className="gap-2 text-xs md:text-sm min-h-[40px] md:min-h-[44px] px-3 md:px-4"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {autosave.status === "saving" ? "Menyimpan..." : "Simpan Draf"}
                </span>
                <span className="sm:hidden">
                  {autosave.status === "saving" ? "..." : "Simpan"}
                </span>
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPDF}
                disabled={isExporting}
                className="hidden sm:flex gap-2 text-xs md:text-sm min-h-[40px] md:min-h-[44px] px-3 md:px-4"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? "Mengekspor..." : "Ekspor PDF"}</span>
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSubmitting}
                className="gap-2 text-xs md:text-sm min-h-[40px] md:min-h-[44px] px-3 md:px-4"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{isSubmitting ? "Mengirim..." : "Kirim Invoice"}</span>
                <span className="sm:hidden">{isSubmitting ? "..." : "Kirim"}</span>
              </Button>
            </>
          }
        />

          {/* Mobile View Toggle */}
          <div className="mx-4 mb-3 flex rounded-[22px] border border-border/70 bg-card/90 p-1 shadow-sm lg:hidden">
            <button
              onClick={() => switchView("SWITCH_TO_EDITOR")}
              className={cn(
                "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition-colors",
                mobileView === "editor"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <FileEdit className="w-4 h-4" />
              Form
            </button>
            <button
              onClick={() => switchView("SWITCH_TO_PREVIEW")}
              className={cn(
                "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium transition-colors",
                mobileView === "preview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <Eye className="w-4 h-4" />
              Pratinjau
            </button>
          </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-1 gap-3 px-4 pb-4 lg:grid-cols-2 lg:gap-0 lg:px-0 lg:pb-0">
            {/* Form Side */}
            <div className={cn(
              "overflow-y-auto rounded-[28px] border border-border/70 bg-card/88 p-4 shadow-sm md:p-6 lg:rounded-none lg:border-0 lg:border-r lg:bg-transparent lg:shadow-none",
              mobileView !== "editor" && "hidden lg:block"
            )}>
              <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">SUSUN INVOICE</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Lengkapi detail tagihan dan item pekerjaan di bawah ini.
                </p>
              </div>
              <InvoiceForm
                form={form}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Preview Side */}
            <div className={cn(
              "overflow-y-auto rounded-[28px] border border-border/70 bg-muted/30 shadow-sm lg:rounded-none lg:border-0 lg:shadow-none",
              mobileView !== "preview" && "hidden lg:block"
            )}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-muted/95 px-4 py-3 backdrop-blur md:px-6">
                <h2 className="text-sm font-medium text-foreground">PRATINJAU LANGSUNG</h2>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPreviewScale(s => Math.max(0.5, s - 0.1))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground w-12 text-center">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPreviewScale(s => Math.min(1.5, s + 0.1))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 md:p-6">
                <div
                  className="transition-transform origin-top"
                  style={{ transform: `scale(${previewScale})` }}
                >
                  <InvoicePreview
                    data={formData}
                    subtotal={subtotal}
                    taxAmount={taxAmount}
                    total={total}
                    businessSettings={businessSettings}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle, Save, Send, ZoomIn, ZoomOut, Zap, Eye, FileEdit } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { invoiceFormSchema, InvoiceFormData } from "@/components/invoice/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { useSendInvoiceEmail } from "@/hooks/useSendInvoiceEmail";
import { cn } from "@/lib/utils";

export default function InvoiceBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
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

  const handleSave = async (status: "draft" | "sent") => {
    const data = form.getValues();
    const setLoading = status === "draft" ? setIsSaving : setIsSubmitting;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create an invoice");
        return;
      }

      // Validate line items
      const validItems = data.lineItems.filter(item => item.description.trim() !== "");
      if (validItems.length === 0 && status === "sent") {
        toast.error("Please add at least one item with a description");
        setLoading(false);
        return;
      }

      // Validate client email for sending (optional - just warn if missing)
      if (status === "sent" && !data.clientEmail) {
        // Email not required for now - just a warning
        console.log("Note: Client email not provided, skipping email notification");
      }

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          invoice_number: data.invoiceNumber || `INV-${Date.now()}`,
          client_id: data.clientId || null,
          issue_date: data.issueDate.toISOString().split("T")[0],
          due_date: data.dueDate ? data.dueDate.toISOString().split("T")[0] : null,
          subtotal: subtotal,
          tax_rate: data.taxRate,
          tax_amount: taxAmount,
          total: total,
          notes: data.notes || null,
          status: status, // Save directly with the status
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      if (validItems.length > 0) {
        const invoiceItems = validItems.map(item => ({
          invoice_id: invoice.id,
          service_id: item.serviceId || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total,
        }));

        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      // TODO: Enable email sending when Edge Function is deployed
      // Email feature temporarily disabled - just save invoice with status
      // When ready, uncomment the sendInvoiceEmail call below:
      /*
      if (status === "sent" && data.clientEmail) {
        await sendInvoiceEmail({
          invoiceId: invoice.id,
          recipientEmail: data.clientEmail,
          recipientName: data.clientName,
        });
      }
      */

      // Invalidate dashboard queries for real-time sync
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      toast.success(status === "draft" ? "Draft saved!" : "Invoice sent successfully!");
      navigate("/invoices");
    } catch (error: unknown) {
      console.error("Error creating invoice:", error);
      const message = error instanceof Error ? error.message : "Failed to create invoice";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    await handleSave("sent");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Top Header Bar */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 md:h-10 md:w-10">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base md:text-lg font-semibold text-foreground">Invoice Builder</h1>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    All changes saved
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave("draft")}
                disabled={isSaving}
                className="gap-2 text-xs md:text-sm min-h-[40px] md:min-h-[44px] px-3 md:px-4"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Draft"}</span>
                <span className="sm:hidden">{isSaving ? "..." : "Save"}</span>
              </Button>
              <Button
                onClick={() => handleSave("sent")}
                disabled={isSubmitting}
                className="gap-2 text-xs md:text-sm min-h-[40px] md:min-h-[44px] px-3 md:px-4"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{isSubmitting ? "Sending..." : "Send Invoice"}</span>
                <span className="sm:hidden">{isSubmitting ? "..." : "Send"}</span>
              </Button>
            </div>
          </div>

          {/* Step Indicator - Hidden on mobile */}
          <div className="hidden md:block px-6 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-success text-success-foreground text-xs font-medium flex items-center justify-center">
                  1
                </span>
                <span className="text-sm text-muted-foreground">Project Details</span>
              </div>
              <div className="h-px w-8 bg-border" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                  2
                </span>
                <span className="text-sm text-foreground font-medium">Build Invoice</span>
              </div>
              <div className="h-px w-8 bg-border" />
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center justify-center">
                  3
                </span>
                <span className="text-sm text-muted-foreground">Review & Send</span>
              </div>
            </div>
          </div>

          {/* Mobile View Toggle */}
          <div className="flex lg:hidden border-t border-border">
            <button
              onClick={() => setMobileView("form")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors min-h-[44px]",
                mobileView === "form"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground"
              )}
            >
              <FileEdit className="w-4 h-4" />
              Edit Form
            </button>
            <button
              onClick={() => setMobileView("preview")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors min-h-[44px]",
                mobileView === "preview"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground"
              )}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Form Side */}
            <div className={cn(
              "overflow-y-auto p-4 md:p-6 border-r border-border",
              mobileView !== "form" && "hidden lg:block"
            )}>
              <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">Build Invoice</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Fill in the project scope and billing details below.
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
              "bg-secondary/20 overflow-y-auto",
              mobileView !== "preview" && "hidden lg:block"
            )}>
              <div className="sticky top-0 z-10 bg-secondary/80 backdrop-blur-sm border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">Live Preview</h2>
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

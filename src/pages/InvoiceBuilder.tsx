import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { invoiceFormSchema, InvoiceFormData } from "@/components/invoice/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function InvoiceBuilder() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      clientId: null,
      clientName: "",
      clientEmail: "",
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

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create an invoice");
        return;
      }

      // Validate line items
      const validItems = data.lineItems.filter(item => item.description.trim() !== "");
      if (validItems.length === 0) {
        toast.error("Please add at least one item with a description");
        setIsSubmitting(false);
        return;
      }

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,
          invoice_number: data.invoiceNumber,
          client_id: data.clientId || null,
          issue_date: data.issueDate.toISOString().split("T")[0],
          due_date: data.dueDate ? data.dueDate.toISOString().split("T")[0] : null,
          subtotal: subtotal,
          tax_rate: data.taxRate,
          tax_amount: taxAmount,
          total: total,
          notes: data.notes || null,
          status: "draft",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
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

      toast.success("Invoice created successfully!");
      navigate("/invoices");
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast.error(error.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Invoice</h1>
            <p className="text-muted-foreground mt-1">Build a new invoice for your client</p>
          </div>
        </div>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Side */}
          <div className="space-y-6">
            <InvoiceForm 
              form={form} 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting} 
            />
          </div>

          {/* Preview Side */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Live Preview</h2>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                Updates in real-time
              </span>
            </div>
            <InvoicePreview 
              data={formData} 
              subtotal={subtotal}
              taxAmount={taxAmount}
              total={total}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function InvoiceBuilder() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Invoice</h1>
          <p className="text-muted-foreground mt-2">Build a new invoice for your client</p>
        </div>

        {/* Invoice builder content will be added */}
        <div className="glass-card rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Invoice builder content will be added here</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

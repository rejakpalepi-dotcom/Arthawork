import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";

export function PaymentDetailsTab() {
  return (
    <div className="lg:col-span-3 glass-card rounded-2xl p-8 animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-primary" />
        Payment Details
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" placeholder="Bank Central Asia" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input id="accountName" placeholder="Kalaudra Studio" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" placeholder="1234567890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routingNumber">Routing / SWIFT Code</Label>
            <Input id="routingNumber" placeholder="CENAIDJA" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentNotes">Payment Instructions</Label>
          <Input
            id="paymentNotes"
            placeholder="Include invoice number in transfer description"
          />
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <h3 className="text-sm font-medium text-foreground mb-2">Online Payments</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Connect a payment processor to accept online payments directly from invoices.
          </p>
          <Button variant="outline" size="sm">
            Connect Stripe
          </Button>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

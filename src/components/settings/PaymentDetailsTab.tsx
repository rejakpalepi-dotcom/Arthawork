import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, CheckCircle2, Loader2, Unplug } from "lucide-react";
import { toast } from "sonner";
import { BusinessSettings } from "@/hooks/useBusinessSettings";

interface PaymentDetailsTabProps {
  settings: BusinessSettings;
  saving: boolean;
  onUpdate: (updates: Partial<BusinessSettings>) => void;
  onSave: () => void;
}

export function PaymentDetailsTab({ settings, saving, onUpdate, onSave }: PaymentDetailsTabProps) {
  const handleConnectStripe = async () => {
    toast.info("Menghubungkan ke Stripe...");
    
    // Simulate Stripe Connect flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onUpdate({ stripe_connected: true });
    toast.success("Stripe berhasil terhubung", {
      description: "Kamu sekarang bisa menerima pembayaran online dari invoice."
    });
  };

  const handleDisconnectStripe = () => {
    onUpdate({ stripe_connected: false });
    toast.info("Stripe diputuskan", {
      description: "Pembayaran online tidak lagi aktif."
    });
  };

  return (
    <div className="lg:col-span-3 glass-card rounded-[28px] border border-border/70 p-8 shadow-sm animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          DETAIL PEMBAYARAN
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Susun rekening dan jalur pembayaran online dengan jelas agar invoice lebih mudah dibayar tanpa kebingungan.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bankName">Nama Bank</Label>
            <Input
              id="bankName"
              placeholder="Bank Central Asia"
              value={settings.bank_name}
              onChange={(e) => onUpdate({ bank_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
            <Input
              id="accountName"
              placeholder="Artha Studio"
              value={settings.account_name}
              onChange={(e) => onUpdate({ account_name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Nomor Rekening</Label>
            <Input
              id="accountNumber"
              placeholder="1234567890"
              value={settings.account_number}
              onChange={(e) => onUpdate({ account_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routingNumber">Kode Routing / SWIFT</Label>
            <Input
              id="routingNumber"
              placeholder="CENAIDJA"
              value={settings.routing_number}
              onChange={(e) => onUpdate({ routing_number: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentNotes">Instruksi Pembayaran</Label>
          <Input
            id="paymentNotes"
            placeholder="Cantumkan nomor invoice pada deskripsi transfer"
            value={settings.payment_notes}
            onChange={(e) => onUpdate({ payment_notes: e.target.value })}
          />
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <h3 className="text-sm font-medium text-foreground mb-2">PEMBAYARAN ONLINE</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {settings.stripe_connected 
              ? "Stripe sudah terhubung. Kamu bisa menerima pembayaran online dari invoice."
              : "Hubungkan pemroses pembayaran agar invoice bisa dibayar langsung secara online."
            }
          </p>
          {settings.stripe_connected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-success text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Stripe Terhubung
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDisconnectStripe}
                className="text-muted-foreground hover:text-destructive"
              >
                <Unplug className="w-4 h-4 mr-1" />
                Putuskan
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleConnectStripe}
            >
              Hubungkan Stripe
            </Button>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
}

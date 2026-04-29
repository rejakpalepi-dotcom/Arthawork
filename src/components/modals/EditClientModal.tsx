import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, MapPin, Building2, Loader2 } from "lucide-react";

const clientSchema = z.object({
  company: z.string().max(100, "Nama perusahaan maksimal 100 karakter").optional(),
  name: z.string().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid").or(z.literal("")).optional(),
  phone: z.string().max(20, "Nomor telepon maksimal 20 karakter").optional(),
  address: z.string().max(200, "Alamat maksimal 200 karakter").optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
}

interface EditClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess?: () => void;
}

export function EditClientModal({ open, onOpenChange, client, onSuccess }: EditClientModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company: "",
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (client && open) {
      reset({
        company: client.company || "",
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
      });
    }
  }, [client, open, reset]);

  const onSubmit = async (data: ClientFormData) => {
    if (!client) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          company: data.company || null,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
        })
        .eq("id", client.id);

      if (error) throw error;

      toast.success("Klien berhasil diperbarui");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui klien";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            UBAH KLIEN
          </DialogTitle>
          <DialogDescription>
            Perbarui informasi klien.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Nama Perusahaan
            </Label>
            <Input
              id="edit-company"
              placeholder="Nama perusahaan atau organisasi"
              {...register("company")}
              className={errors.company ? "border-destructive" : ""}
            />
            {errors.company && (
              <p className="text-sm text-destructive">{errors.company.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              PIC / Kontak Utama *
            </Label>
            <Input
              id="edit-name"
              placeholder="Nama penanggung jawab"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="client@company.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Telepon
            </Label>
            <Input
              id="edit-phone"
              placeholder="+1 (555) 000-0000"
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Alamat
            </Label>
            <Input
              id="edit-address"
              placeholder="Jalan, kota, dan detail alamat"
              {...register("address")}
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

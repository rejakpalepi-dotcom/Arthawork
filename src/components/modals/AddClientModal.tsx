import { useState } from "react";
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

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddClientModal({ open, onOpenChange, onSuccess }: AddClientModalProps) {
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

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Kamu harus masuk untuk menambah klien");
        return;
      }

      const { error } = await supabase.from("clients").insert({
        company: data.company || null,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Klien berhasil ditambahkan");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menambah klien";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ui-panel="add-client-modal" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            TAMBAH KLIEN BARU
          </DialogTitle>
          <DialogDescription>
            Tambahkan klien baru ke daftar kerja kamu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Nama Perusahaan
            </Label>
            <Input
              id="company"
              placeholder="Nama perusahaan atau organisasi"
              {...register("company")}
              className={errors.company ? "border-destructive" : ""}
            />
            {errors.company && (
              <p className="text-sm text-destructive">{errors.company.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              PIC / Kontak Utama *
            </Label>
            <Input
              id="name"
              placeholder="Nama penanggung jawab"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
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
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Telepon
            </Label>
            <Input
              id="phone"
              placeholder="+1 (555) 000-0000"
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Alamat
            </Label>
            <Input
              id="address"
              placeholder="Jalan, kota, dan detail alamat"
              {...register("address")}
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-full px-4"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="rounded-full px-4">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tambah Klien
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

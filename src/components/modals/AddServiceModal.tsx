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
import { Package, DollarSign, Loader2 } from "lucide-react";

const serviceSchema = z.object({
  name: z.string().min(1, "Nama layanan wajib diisi").max(100, "Nama maksimal 100 karakter"),
  price: z.number().min(0, "Harga harus bernilai positif").or(z.string().transform((val) => parseFloat(val) || 0)),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface AddServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddServiceModal({ open, onOpenChange, onSuccess }: AddServiceModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      price: 0,
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Kamu harus masuk untuk menambah layanan");
        return;
      }

      const { error } = await supabase.from("services").insert({
        name: data.name,
        price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Layanan berhasil ditambahkan");
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menambah layanan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ui-panel="add-service-modal" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            TAMBAH LAYANAN BARU
          </DialogTitle>
          <DialogDescription>
            Tentukan layanan baru beserta harga dasarnya.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              Nama Layanan *
            </Label>
            <Input
              id="name"
              placeholder="Contoh: Desain Website"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              Harga Dasar *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                Rp
              </span>
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                {...register("price", { valueAsNumber: true })}
                className={`pl-10 ${errors.price ? "border-destructive" : ""}`}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
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
              Tambah Layanan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

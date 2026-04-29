import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, AlertTriangle, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { exportAndDownloadUserData } from "@/lib/dataExport";

export function AccountTab() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.full_name) {
          setFullName(profile.full_name);
        }
      }
    };
    loadUserData();
  }, []);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password berhasil diperbarui");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui password";
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveProfile = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;

      // Also update the profiles table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ full_name: fullName })
          .eq("id", user.id);
      }

      toast.success("Profil berhasil diperbarui");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui profil";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.error("Penghapusan akun memerlukan bantuan admin. Hubungi tim support.");
    setShowDeleteModal(false);
  };

  return (
    <div className="lg:col-span-3 glass-card rounded-2xl p-8 animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        PENGATURAN AKUN
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              placeholder="Alex Morgan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountEmail">Alamat Email</Label>
            <Input
              id="accountEmail"
              type="email"
              placeholder="alex@artha.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
            <p className="text-xs text-muted-foreground">Alamat email tidak bisa diubah</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Ubah Password
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleUpdatePassword}
            disabled={changingPassword}
          >
            {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Perbarui Password
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Download className="w-4 h-4" />
            EKSPOR DATA
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Unduh seluruh data kamu seperti invoice, klien, dan proposal dalam format JSON.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setExporting(true);
              const success = await exportAndDownloadUserData();
              setExporting(false);
              if (success) {
                toast.success("Data berhasil diekspor");
              } else {
                toast.error("Gagal mengekspor data");
              }
            }}
            disabled={exporting}
          >
            {exporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {exporting ? "Mengekspor..." : "Ekspor Data Saya"}
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <h3 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            ZONA KRITIS
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Hapus akun dan seluruh data terkait secara permanen.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            Hapus Akun
          </Button>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={handleSaveProfile} disabled={updating}>
            {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>

      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteAccount}
        title="Hapus akun?"
        description="Akun dan seluruh data terkait akan dihapus permanen. Tindakan ini tidak bisa dibatalkan."
      />
    </div>
  );
}

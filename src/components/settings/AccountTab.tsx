import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";

export function AccountTab() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
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

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.error("Account deletion requires admin action. Please contact support.");
    setShowDeleteModal(false);
  };

  return (
    <div className="lg:col-span-3 glass-card rounded-2xl p-8 animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Account Settings
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Alex Morgan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountEmail">Email Address</Label>
            <Input
              id="accountEmail"
              type="email"
              placeholder="alex@artha.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Change Password
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
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
            Update Password
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <h3 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Permanently delete your account and all associated data.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </Button>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={handleSaveProfile} disabled={updating}>
            {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        description="This will permanently delete your account and all associated data. This action cannot be undone."
      />
    </div>
  );
}
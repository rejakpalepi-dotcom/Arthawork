import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, AlertTriangle } from "lucide-react";

export function AccountTab() {
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
            <Input id="fullName" placeholder="Alex Morgan" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountEmail">Email Address</Label>
            <Input id="accountEmail" type="email" placeholder="alex@papr.studio" />
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
              <Input id="currentPassword" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" placeholder="••••••••" />
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4">
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
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

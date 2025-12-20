import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

export function BusinessProfileTab() {
  return (
    <div className="lg:col-span-3 glass-card rounded-2xl p-8 animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary" />
        Business Profile
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" placeholder="Your Studio Name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="hello@yourstudio.com" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="+1 (555) 000-0000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://yourstudio.com" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Business Address</Label>
          <Input id="address" placeholder="123 Creative Street, Design City" />
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

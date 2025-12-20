import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Upload } from "lucide-react";

export function BrandingTab() {
  return (
    <div className="lg:col-span-3 glass-card rounded-2xl p-8 animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        Branding
      </h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Logo</Label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag and drop your logo here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, or SVG (max 2MB)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary border border-border" />
              <Input id="primaryColor" placeholder="#00D9FF" className="flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent border border-border" />
              <Input id="accentColor" placeholder="#1A1F2E" className="flex-1" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" placeholder="Creative solutions for modern brands" />
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

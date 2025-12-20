import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Upload, Loader2, X, Image } from "lucide-react";
import { BusinessSettings } from "@/hooks/useBusinessSettings";
import { toast } from "sonner";

interface BrandingTabProps {
  settings: BusinessSettings;
  saving: boolean;
  onUpdate: (updates: Partial<BusinessSettings>) => void;
  onSave: () => void;
  onUploadLogo: (file: File) => Promise<string | null>;
}

export function BrandingTab({ settings, saving, onUpdate, onSave, onUploadLogo }: BrandingTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      toast.error("Please upload a PNG, JPG, or SVG file");
      return;
    }

    setUploading(true);
    const url = await onUploadLogo(file);
    if (url) {
      onUpdate({ logo_url: url });
      toast.success("Logo uploaded successfully!");
    }
    setUploading(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleFileChange(fakeEvent);
    }
  };

  const removeLogo = () => {
    onUpdate({ logo_url: "" });
  };

  return (
    <div className="lg:col-span-3 glass-card rounded-2xl p-8 animate-fade-in">
      <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        Branding
      </h2>

      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Logo</Label>
          {settings.logo_url ? (
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-border bg-secondary/30">
                <img
                  src={settings.logo_url}
                  alt="Business logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                onClick={removeLogo}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-2" />
              ) : (
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              )}
              <p className="text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Drag and drop your logo here, or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, or SVG (max 2MB)
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primary_color}
                onChange={(e) => onUpdate({ primary_color: e.target.value })}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                id="primaryColor"
                placeholder="#00D9FF"
                value={settings.primary_color}
                onChange={(e) => onUpdate({ primary_color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.accent_color}
                onChange={(e) => onUpdate({ accent_color: e.target.value })}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                id="accentColor"
                placeholder="#1A1F2E"
                value={settings.accent_color}
                onChange={(e) => onUpdate({ accent_color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            placeholder="Creative solutions for modern brands"
            value={settings.tagline}
            onChange={(e) => onUpdate({ tagline: e.target.value })}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

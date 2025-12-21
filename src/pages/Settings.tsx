import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Building2, CreditCard, Palette, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BusinessProfileTab } from "@/components/settings/BusinessProfileTab";
import { BrandingTab } from "@/components/settings/BrandingTab";
import { PaymentDetailsTab } from "@/components/settings/PaymentDetailsTab";
import { AccountTab } from "@/components/settings/AccountTab";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

const settingsSections = [
  { id: "business", label: "Business Profile", icon: Building2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "payment", label: "Payment Details", icon: CreditCard },
  { id: "account", label: "Account", icon: User },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");
  const { settings, loading, saving, updateSettings, saveSettings, uploadLogo } = useBusinessSettings();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "business":
        return (
          <BusinessProfileTab
            settings={settings}
            saving={saving}
            onUpdate={updateSettings}
            onSave={() => saveSettings()}
          />
        );
      case "branding":
        return (
          <BrandingTab
            settings={settings}
            saving={saving}
            onUpdate={updateSettings}
            onSave={saveSettings}
            onUploadLogo={uploadLogo}
          />
        );
      case "payment":
        return (
          <PaymentDetailsTab settings={settings} saving={saving} onUpdate={updateSettings} onSave={saveSettings} />
        );
      case "account":
        return <AccountTab />;
      default:
        return (
          <BusinessProfileTab settings={settings} saving={saving} onUpdate={updateSettings} onSave={saveSettings} />
        );
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your studio preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="glass-card rounded-2xl p-4 h-fit">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={cn(
                    "w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors",
                    activeTab === section.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <section.icon className="w-4 h-4 shrink-0" />
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          {renderActiveTab()}
        </div>
      </div>
    </DashboardLayout>
  );
}

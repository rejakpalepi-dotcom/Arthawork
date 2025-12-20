import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BusinessSettings {
  id?: string;
  user_id?: string;
  business_name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logo_url: string;
  primary_color: string;
  accent_color: string;
  tagline: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  routing_number: string;
  payment_notes: string;
  stripe_connected: boolean;
}

const defaultSettings: BusinessSettings = {
  business_name: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  logo_url: "",
  primary_color: "#00D9FF",
  accent_color: "#1A1F2E",
  tagline: "",
  bank_name: "",
  account_name: "",
  account_number: "",
  routing_number: "",
  payment_notes: "",
  stripe_connected: false,
};

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("business_settings").select("*").eq("user_id", user.id).maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          user_id: data.user_id,
          business_name: data.business_name || "",
          email: data.email || "",
          phone: data.phone || "",
          website: data.website || "",
          address: data.address || "",
          logo_url: data.logo_url || "",
          primary_color: data.primary_color || "#00D9FF",
          accent_color: data.accent_color || "#1A1F2E",
          tagline: data.tagline || "",
          bank_name: data.bank_name || "",
          account_name: data.account_name || "",
          account_number: data.account_number || "",
          routing_number: data.routing_number || "",
          payment_notes: data.payment_notes || "",
          stripe_connected: data.stripe_connected || false,
        });
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (updates: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const saveSettings = async (updates?: Partial<BusinessSettings>) => {
    // FIX: Pastikan kita gak nerima objek Event dari klik tombol sebagai data update
    const cleanUpdates = updates && (updates as any).nativeEvent ? undefined : updates;

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return false;
      }

      // Gunakan cleanUpdates di sini
      const dataToSave = cleanUpdates ? { ...settings, ...cleanUpdates } : settings;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return false;
      }

      const dataToSave = updates ? { ...settings, ...updates } : settings;
      const { id, ...settingsWithoutId } = dataToSave;

      const { data: existing } = await supabase
        .from("business_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("business_settings").update(settingsWithoutId).eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("business_settings").insert({ ...settingsWithoutId, user_id: user.id });

        if (error) throw error;
      }

      toast.success("Settings saved successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return null;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("logos").upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast.error(error.message || "Failed to upload logo");
      return null;
    }
  };

  return {
    settings,
    loading,
    saving,
    updateSettings,
    saveSettings,
    uploadLogo,
    refetch: fetchSettings,
  };
}

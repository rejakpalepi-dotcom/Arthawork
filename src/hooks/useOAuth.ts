import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type OAuthProvider = "google" | "github";

export function useOAuth() {
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  const signInWithOAuth = async (provider: OAuthProvider) => {
    setOauthLoading(provider);

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        toast.error("Sign in failed", {
          description: error.message,
        });
        setOauthLoading(null);
      }
      // Note: Don't set loading to false on success - redirect will happen
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Sign in failed", {
        description: message,
      });
      setOauthLoading(null);
    }
  };

  return {
    oauthLoading,
    signInWithOAuth,
  };
}

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to manage session persistence based on "Remember me" preference.
 * If the user chose not to be remembered, the session will be cleared
 * when they close the browser/tab.
 */
export function useSessionPersistence() {
  useEffect(() => {
    // Check if this is a session-only login
    const isSessionOnly = sessionStorage.getItem('papr_session_only') === 'true';
    
    if (isSessionOnly) {
      // Add beforeunload listener to clear session when browser closes
      const handleBeforeUnload = () => {
        // Note: We can't reliably sign out here due to async limitations
        // Instead, we mark for cleanup on next load
        localStorage.setItem('papr_cleanup_session', 'true');
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, []);

  useEffect(() => {
    // Check if we need to clean up a previous session-only login
    const shouldCleanup = localStorage.getItem('papr_cleanup_session') === 'true';
    
    if (shouldCleanup) {
      // Clean up the flag
      localStorage.removeItem('papr_cleanup_session');
      
      // If there's no active session marker in sessionStorage, sign out
      if (!sessionStorage.getItem('papr_session_only')) {
        supabase.auth.signOut();
      }
    }
  }, []);
}

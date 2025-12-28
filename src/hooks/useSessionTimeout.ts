import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { authAudit } from "@/lib/auditLog";

interface SessionTimeoutConfig {
    timeoutMs: number; // Inactivity timeout in milliseconds
    warningMs: number; // Warning before timeout
    enabled: boolean;
}

const DEFAULT_CONFIG: SessionTimeoutConfig = {
    timeoutMs: 30 * 60 * 1000, // 30 minutes
    warningMs: 5 * 60 * 1000, // 5 minutes warning
    enabled: true,
};

/**
 * Hook to manage session timeout with auto-logout after inactivity
 */
export function useSessionTimeout(config: Partial<SessionTimeoutConfig> = {}) {
    const { timeoutMs, warningMs, enabled } = { ...DEFAULT_CONFIG, ...config };
    const navigate = useNavigate();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const handleLogout = useCallback(async () => {
        await authAudit.logout();
        await supabase.auth.signOut();
        toast.error("Session expired due to inactivity", {
            description: "Please log in again to continue.",
        });
        navigate("/login");
    }, [navigate]);

    const showWarning = useCallback(() => {
        const remainingSeconds = Math.ceil(warningMs / 1000 / 60);
        toast.warning(`Session expiring soon`, {
            description: `You will be logged out in ${remainingSeconds} minutes due to inactivity.`,
            duration: 10000,
            action: {
                label: "Stay logged in",
                onClick: () => resetTimeout(),
            },
        });
    }, [warningMs]);

    const resetTimeout = useCallback(() => {
        lastActivityRef.current = Date.now();

        // Clear existing timeouts
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);

        if (!enabled) return;

        // Set warning timeout
        warningRef.current = setTimeout(() => {
            showWarning();
        }, timeoutMs - warningMs);

        // Set logout timeout
        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, timeoutMs);
    }, [enabled, timeoutMs, warningMs, handleLogout, showWarning]);

    useEffect(() => {
        if (!enabled) return;

        // Activity events to track
        const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];

        const handleActivity = () => {
            // Throttle resets to every 30 seconds
            if (Date.now() - lastActivityRef.current > 30000) {
                resetTimeout();
            }
        };

        // Add event listeners
        events.forEach((event) => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        // Initial timeout setup
        resetTimeout();

        return () => {
            // Cleanup
            events.forEach((event) => {
                document.removeEventListener(event, handleActivity);
            });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
        };
    }, [enabled, resetTimeout]);

    return {
        resetTimeout,
        lastActivity: lastActivityRef.current,
    };
}

/**
 * Get remaining session time in milliseconds
 */
export function getRemainingSessionTime(
    lastActivity: number,
    timeoutMs: number = DEFAULT_CONFIG.timeoutMs
): number {
    const elapsed = Date.now() - lastActivity;
    return Math.max(0, timeoutMs - elapsed);
}

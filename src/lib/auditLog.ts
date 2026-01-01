import { supabase } from "@/integrations/supabase/client";

/**
 * Audit Log Types
 */
export type AuditAction =
    | "auth.login"
    | "auth.logout"
    | "auth.login_failed"
    | "auth.password_reset"
    | "auth.mfa_enabled"
    | "auth.mfa_disabled"
    | "data.create"
    | "data.update"
    | "data.delete"
    | "export.report"
    | "settings.update";

export interface AuditLogEntry {
    action: AuditAction;
    resource_type?: string;
    resource_id?: string;
    metadata?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
}

// In-memory log buffer for client-side (fallback)
const auditBuffer: AuditLogEntry[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Log an audit event to database
 * Falls back to localStorage if database call fails
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
    const timestamp = new Date().toISOString();
    const { data: { user } } = await supabase.auth.getUser();

    const fullEntry = {
        ...entry,
        timestamp,
        user_id: user?.id || "anonymous",
        user_email: user?.email || "anonymous",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    };

    // Try to log to database first (primary storage)
    if (user?.id) {
        try {
            const { error } = await supabase.rpc("log_audit_event", {
                p_action: entry.action,
                p_table_name: entry.resource_type || null,
                p_record_id: entry.resource_id || null,
                p_old_data: null,
                p_new_data: entry.metadata ? JSON.stringify(entry.metadata) : null,
                p_ip_address: null,
                p_user_agent: fullEntry.user_agent || null,
            });

            if (error) {
                console.warn("[AUDIT] Database log failed, using localStorage fallback:", error.message);
            } else {
                // Successfully logged to database
                if (import.meta.env.DEV) {
                    console.log(`[AUDIT] ${timestamp} → DB`, entry.action);
                }
                return;
            }
        } catch (e) {
            console.warn("[AUDIT] Database log error:", e);
        }
    }

    // Fallback: Add to in-memory buffer
    auditBuffer.push(fullEntry);
    if (auditBuffer.length > MAX_BUFFER_SIZE) {
        auditBuffer.shift(); // Remove oldest entry
    }

    // Log to console in development
    if (import.meta.env.DEV) {
        console.log(`[AUDIT] ${timestamp} → localStorage`, fullEntry);
    }

    // Store in localStorage as fallback
    try {
        const existingLogs = JSON.parse(localStorage.getItem("artha_audit_logs") || "[]");
        existingLogs.push(fullEntry);

        // Keep only last 100 entries
        const trimmedLogs = existingLogs.slice(-100);
        localStorage.setItem("artha_audit_logs", JSON.stringify(trimmedLogs));
    } catch (e) {
        console.error("Failed to persist audit log:", e);
    }
}

/**
 * Log authentication events
 */
export const authAudit = {
    login: (email: string) => logAuditEvent({
        action: "auth.login",
        metadata: { email },
    }),

    logout: () => logAuditEvent({
        action: "auth.logout",
    }),

    loginFailed: (email: string, reason: string) => logAuditEvent({
        action: "auth.login_failed",
        metadata: { email, reason },
    }),

    passwordReset: (email: string) => logAuditEvent({
        action: "auth.password_reset",
        metadata: { email },
    }),

    mfaEnabled: () => logAuditEvent({
        action: "auth.mfa_enabled",
    }),

    mfaDisabled: () => logAuditEvent({
        action: "auth.mfa_disabled",
    }),
};

/**
 * Log data modification events
 */
export const dataAudit = {
    create: (resourceType: string, resourceId: string, metadata?: Record<string, unknown>) =>
        logAuditEvent({
            action: "data.create",
            resource_type: resourceType,
            resource_id: resourceId,
            metadata,
        }),

    update: (resourceType: string, resourceId: string, metadata?: Record<string, unknown>) =>
        logAuditEvent({
            action: "data.update",
            resource_type: resourceType,
            resource_id: resourceId,
            metadata,
        }),

    delete: (resourceType: string, resourceId: string) =>
        logAuditEvent({
            action: "data.delete",
            resource_type: resourceType,
            resource_id: resourceId,
        }),
};

/**
 * Get audit logs from localStorage (fallback logs only)
 */
export function getLocalAuditLogs(): AuditLogEntry[] {
    try {
        return JSON.parse(localStorage.getItem("artha_audit_logs") || "[]");
    } catch {
        return [];
    }
}

/**
 * Get audit logs from database (preferred)
 */
export async function getAuditLogs(limit: number = 100): Promise<AuditLogEntry[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getLocalAuditLogs();

    const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error || !data) {
        console.warn("[AUDIT] Failed to fetch from DB, using localStorage:", error?.message);
        return getLocalAuditLogs();
    }

    return data.map((log) => ({
        action: log.action as AuditAction,
        resource_type: log.table_name || undefined,
        resource_id: log.record_id || undefined,
        metadata: log.new_data as Record<string, unknown> | undefined,
        timestamp: log.created_at,
        user_id: log.user_id,
    }));
}

/**
 * Clear local audit logs (does not affect database)
 */
export function clearLocalAuditLogs(): void {
    localStorage.removeItem("artha_audit_logs");
    auditBuffer.length = 0;
}

/**
 * Export audit logs as JSON
 */
export async function exportAuditLogs(): Promise<string> {
    const logs = await getAuditLogs(500);
    return JSON.stringify(logs, null, 2);
}


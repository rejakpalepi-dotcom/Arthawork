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

// In-memory log buffer for client-side (will be synced to console/localStorage)
const auditBuffer: AuditLogEntry[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Log an audit event
 * In production, this should be sent to a backend logging service
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

    // Add to buffer
    auditBuffer.push(fullEntry);
    if (auditBuffer.length > MAX_BUFFER_SIZE) {
        auditBuffer.shift(); // Remove oldest entry
    }

    // Log to console in development
    if (import.meta.env.DEV) {
        console.log(`[AUDIT] ${timestamp}`, fullEntry);
    }

    // Store in localStorage for persistence
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
 * Get audit logs from localStorage
 */
export function getAuditLogs(): AuditLogEntry[] {
    try {
        return JSON.parse(localStorage.getItem("artha_audit_logs") || "[]");
    } catch {
        return [];
    }
}

/**
 * Clear audit logs
 */
export function clearAuditLogs(): void {
    localStorage.removeItem("artha_audit_logs");
    auditBuffer.length = 0;
}

/**
 * Export audit logs as JSON
 */
export function exportAuditLogs(): string {
    const logs = getAuditLogs();
    return JSON.stringify(logs, null, 2);
}

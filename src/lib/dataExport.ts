/**
 * Data Export Utility
 * Allows users to export all their data as JSON
 */

import { supabase } from "@/integrations/supabase/client";

export interface ExportedData {
    exportDate: string;
    user: {
        email: string | undefined;
        id: string;
    };
    invoices: unknown[];
    clients: unknown[];
    proposals: unknown[];
    services: unknown[];
    todos: unknown[];
}

/**
 * Export all user data from Supabase
 */
export async function exportUserData(): Promise<ExportedData | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch all user data in parallel
    const [invoicesRes, clientsRes, proposalsRes, servicesRes, todosRes] = await Promise.all([
        supabase.from("invoices").select("*, invoice_items(*)").eq("user_id", user.id),
        supabase.from("clients").select("*").eq("user_id", user.id),
        supabase.from("proposals").select("*, proposal_items(*)").eq("user_id", user.id),
        supabase.from("services").select("*").eq("user_id", user.id),
        supabase.from("todos").select("*").eq("user_id", user.id),
    ]);

    return {
        exportDate: new Date().toISOString(),
        user: {
            email: user.email,
            id: user.id,
        },
        invoices: invoicesRes.data || [],
        clients: clientsRes.data || [],
        proposals: proposalsRes.data || [],
        services: servicesRes.data || [],
        todos: todosRes.data || [],
    };
}

/**
 * Download data as JSON file
 */
export function downloadAsJSON(data: unknown, filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export and download all user data
 */
export async function exportAndDownloadUserData(): Promise<boolean> {
    try {
        const data = await exportUserData();
        if (!data) {
            throw new Error("Failed to fetch user data");
        }

        const filename = `arthawork-export-${new Date().toISOString().split('T')[0]}.json`;
        downloadAsJSON(data, filename);
        return true;
    } catch (error) {
        console.error("Export failed:", error);
        return false;
    }
}

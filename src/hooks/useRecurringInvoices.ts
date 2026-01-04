/**
 * Recurring Invoices Hook
 * Manage recurring invoice templates
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RecurringTemplate {
    id: string;
    user_id: string;
    client_id: string | null;
    title: string;
    description: string | null;
    interval: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
    day_of_month: number | null;
    next_run: string;
    end_date: string | null;
    is_active: boolean;
    items: InvoiceItem[];
    tax_rate: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    clients?: { name: string } | null;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface CreateRecurringTemplateInput {
    client_id?: string;
    title: string;
    description?: string;
    interval: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
    day_of_month?: number;
    next_run: string;
    end_date?: string;
    items: InvoiceItem[];
    tax_rate?: number;
    notes?: string;
}

export function useRecurringTemplates() {
    const queryClient = useQueryClient();

    // Fetch all recurring templates
    const {
        data: templates = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["recurring-templates"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("recurring_templates")
                .select("*, clients(name)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as RecurringTemplate[];
        },
    });

    // Create template
    const createTemplate = useMutation({
        mutationFn: async (input: CreateRecurringTemplateInput) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("recurring_templates")
                .insert({
                    user_id: user.id,
                    ...input,
                    items: input.items as unknown as object,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
            toast.success("Template recurring invoice dibuat!");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal membuat template");
        },
    });

    // Update template
    const updateTemplate = useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: Partial<CreateRecurringTemplateInput> & { id: string }) => {
            const { data, error } = await supabase
                .from("recurring_templates")
                .update({
                    ...updates,
                    items: updates.items as unknown as object,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
            toast.success("Template diperbarui!");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal memperbarui template");
        },
    });

    // Toggle active status
    const toggleActive = useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { data, error } = await supabase
                .from("recurring_templates")
                .update({ is_active, updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
            toast.success(data.is_active ? "Template diaktifkan" : "Template dinonaktifkan");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal mengubah status");
        },
    });

    // Delete template
    const deleteTemplate = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("recurring_templates")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
            toast.success("Template dihapus!");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal menghapus template");
        },
    });

    // Generate invoice from template manually
    const generateInvoice = useMutation({
        mutationFn: async (templateId: string) => {
            const { data, error } = await supabase.rpc("generate_recurring_invoice", {
                template_id: templateId,
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            toast.success("Invoice berhasil dibuat dari template!");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal membuat invoice");
        },
    });

    return {
        templates,
        isLoading,
        error,
        refetch,
        createTemplate,
        updateTemplate,
        toggleActive,
        deleteTemplate,
        generateInvoice,
    };
}

/**
 * Get interval display name
 */
export function getIntervalDisplay(interval: string): string {
    const displays: Record<string, string> = {
        weekly: "Mingguan",
        biweekly: "2 Minggu",
        monthly: "Bulanan",
        quarterly: "3 Bulan",
        yearly: "Tahunan",
    };
    return displays[interval] || interval;
}

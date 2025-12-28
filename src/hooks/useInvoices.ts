import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Invoice {
    id: string;
    invoice_number: string;
    client_name: string | null;
    client_phone: string | null;
    client_email: string | null;
    client_address: string | null;
    total: number;
    status: string;
    due_date: string | null;
    issue_date: string;
    subtotal: number;
    tax_rate: number | null;
    tax_amount: number | null;
    notes: string | null;
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export function useInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInvoices = useCallback(async () => {
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error: fetchError } = await supabase
            .from("invoices")
            .select("id, invoice_number, total, status, due_date, issue_date, subtotal, tax_rate, tax_amount, notes, clients(name, email, phone, address)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (fetchError) {
            setError(fetchError.message);
            setLoading(false);
            return;
        }

        if (data) {
            setInvoices(data.map((inv) => ({
                id: inv.id,
                invoice_number: inv.invoice_number,
                client_name: (inv.clients as any)?.name || null,
                client_email: (inv.clients as any)?.email || null,
                client_phone: (inv.clients as any)?.phone || null,
                client_address: (inv.clients as any)?.address || null,
                total: Number(inv.total),
                status: inv.status,
                due_date: inv.due_date,
                issue_date: inv.issue_date,
                subtotal: Number(inv.subtotal),
                tax_rate: inv.tax_rate,
                tax_amount: inv.tax_amount ? Number(inv.tax_amount) : null,
                notes: inv.notes,
            })));
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    return {
        invoices,
        loading,
        error,
        refetch: fetchInvoices,
    };
}

export function useInvoiceItems(invoiceId: string | null) {
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchItems = useCallback(async () => {
        if (!invoiceId) return;

        setLoading(true);
        const { data } = await supabase
            .from("invoice_items")
            .select("*")
            .eq("invoice_id", invoiceId);

        if (data) {
            setItems(data.map((item: any) => ({
                id: item.id,
                description: item.description,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                total: Number(item.total),
            })));
        }
        setLoading(false);
    }, [invoiceId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return { items, loading };
}

export function useInvoiceMutations() {
    const markAsPaid = useCallback(async (invoiceId: string) => {
        const { error } = await supabase
            .from("invoices")
            .update({ status: "paid" })
            .eq("id", invoiceId);

        if (error) throw new Error(error.message);
    }, []);

    const updateStatus = useCallback(async (invoiceId: string, status: string) => {
        const { error } = await supabase
            .from("invoices")
            .update({ status })
            .eq("id", invoiceId);

        if (error) throw new Error(error.message);
    }, []);

    const deleteInvoice = useCallback(async (invoiceId: string) => {
        // First delete invoice items
        await supabase
            .from("invoice_items")
            .delete()
            .eq("invoice_id", invoiceId);

        const { error } = await supabase
            .from("invoices")
            .delete()
            .eq("id", invoiceId);

        if (error) throw new Error(error.message);
    }, []);

    return {
        markAsPaid,
        updateStatus,
        deleteInvoice,
    };
}

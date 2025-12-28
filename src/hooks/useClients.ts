import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    address: string | null;
    created_at: string;
}

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = useCallback(async () => {
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error: fetchError } = await supabase
            .from("clients")
            .select("id, name, email, phone, company, address, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (fetchError) {
            setError(fetchError.message);
            setLoading(false);
            return;
        }

        if (data) {
            setClients(data);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    return {
        clients,
        loading,
        error,
        refetch: fetchClients,
    };
}

export function useClientMutations() {
    const createClient = useCallback(async (client: Omit<Client, "id" | "created_at">) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from("clients")
            .insert({
                user_id: user.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
                company: client.company,
                address: client.address,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }, []);

    const updateClient = useCallback(async (clientId: string, updates: Partial<Client>) => {
        const { error } = await supabase
            .from("clients")
            .update(updates)
            .eq("id", clientId);

        if (error) throw new Error(error.message);
    }, []);

    const deleteClient = useCallback(async (clientId: string) => {
        const { error } = await supabase
            .from("clients")
            .delete()
            .eq("id", clientId);

        if (error) throw new Error(error.message);
    }, []);

    return {
        createClient,
        updateClient,
        deleteClient,
    };
}

/**
 * useContracts Hook
 * Manages contract data and operations
 */

import { useState, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ContractScopeItem {
    id: string;
    description: string;
    included: boolean;
}

export interface Contract {
    id: string;
    user_id: string;
    proposal_id: string | null;
    client_id: string | null;
    title: string;
    description: string | null;
    scope_of_work: ContractScopeItem[];
    total_amount: number;
    dp_percentage: number;
    dp_amount: number;
    contract_token: string;
    status: 'draft' | 'sent' | 'signed' | 'paid' | 'active' | 'completed' | 'cancelled';
    client_signature_name: string | null;
    client_signature_date: string | null;
    client_ip_address: string | null;
    signature_hash: string | null;
    payment_due_date: string | null;
    mayar_payment_id: string | null;
    payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'expired';
    paid_at: string | null;
    created_at: string;
    updated_at: string;
    clients?: {
        id: string;
        name: string;
        email: string | null;
        company: string | null;
    } | null;
}

export interface CreateContractInput {
    title: string;
    description?: string;
    client_id?: string;
    proposal_id?: string;
    scope_of_work: ContractScopeItem[];
    total_amount: number;
    dp_percentage?: number;
    payment_due_date?: string;
}

export function useContracts() {
    const queryClient = useQueryClient();

    // Fetch all contracts for current user
    const {
        data: contracts,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ["contracts"],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("contracts")
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq("user_id", user.user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Contract[];
        },
    });

    // Create new contract
    const createMutation = useMutation({
        mutationFn: async (input: CreateContractInput) => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("contracts")
                .insert({
                    user_id: user.user.id,
                    title: input.title,
                    description: input.description,
                    client_id: input.client_id,
                    proposal_id: input.proposal_id,
                    scope_of_work: input.scope_of_work,
                    total_amount: input.total_amount,
                    dp_percentage: input.dp_percentage || 50,
                    payment_due_date: input.payment_due_date,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
            toast.success("Kontrak berhasil dibuat");
        },
        onError: (error: Error) => {
            toast.error(`Gagal membuat kontrak: ${error.message}`);
        },
    });

    // Update contract
    const updateMutation = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Contract> & { id: string }) => {
            const { data, error } = await supabase
                .from("contracts")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
            toast.success("Kontrak berhasil diperbarui");
        },
        onError: (error: Error) => {
            toast.error(`Gagal memperbarui kontrak: ${error.message}`);
        },
    });

    // Update contract status
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: Contract['status'] }) => {
            const { data, error } = await supabase
                .from("contracts")
                .update({ status })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
            toast.success(`Status kontrak diubah ke ${data.status}`);
        },
        onError: (error: Error) => {
            toast.error(`Gagal mengubah status: ${error.message}`);
        },
    });

    // Delete contract
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("contracts")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
            toast.success("Kontrak berhasil dihapus");
        },
        onError: (error: Error) => {
            toast.error(`Gagal menghapus kontrak: ${error.message}`);
        },
    });

    return {
        contracts,
        isLoading,
        error,
        refetch,
        createContract: createMutation.mutateAsync,
        updateContract: updateMutation.mutateAsync,
        updateStatus: updateStatusMutation.mutateAsync,
        deleteContract: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
    };
}

// Hook to fetch single contract by token (for public access)
export function useContractByToken(token: string | undefined) {
    return useQuery({
        queryKey: ["contract", token],
        queryFn: async () => {
            if (!token) return null;

            const { data, error } = await supabase
                .from("contracts")
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq("contract_token", token)
                .single();

            if (error) throw error;
            return data as Contract;
        },
        enabled: !!token,
    });
}

// Sign contract (public function)
export async function signContract(
    contractId: string,
    signatureName: string,
    ipAddress?: string
): Promise<void> {
    const signatureHash = btoa(`${signatureName}-${new Date().toISOString()}`);

    const { error } = await supabase
        .from("contracts")
        .update({
            status: "signed",
            client_signature_name: signatureName,
            client_signature_date: new Date().toISOString(),
            client_ip_address: ipAddress,
            signature_hash: signatureHash,
        })
        .eq("id", contractId);

    if (error) throw error;
}

// Create payment for contract DP
export async function createContractPayment(contractToken: string) {
    const { data, error } = await supabase.functions.invoke("create-contract-payment", {
        body: { contractToken },
    });

    if (error) throw error;
    return data as { paymentUrl: string; orderId: string; dpAmount: number };
}

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionTier, SUBSCRIPTION_TIERS, canPerformAction, getRemainingQuota } from "@/lib/subscription";

interface SubscriptionState {
    tier: SubscriptionTier;
    status: "active" | "cancelled" | "past_due";
    currentPeriodEnd: Date | null;
    loading: boolean;
}

interface UsageState {
    invoicesThisMonth: number;
    proposalsThisMonth: number;
    totalClients: number;
    loading: boolean;
}

export function useSubscription() {
    const [subscription, setSubscription] = useState<SubscriptionState>({
        tier: "free",
        status: "active",
        currentPeriodEnd: null,
        loading: true,
    });

    const [usage, setUsage] = useState<UsageState>({
        invoicesThisMonth: 0,
        proposalsThisMonth: 0,
        totalClients: 0,
        loading: true,
    });

    // Fetch subscription status
    useEffect(() => {
        const fetchSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setSubscription(prev => ({ ...prev, loading: false }));
                return;
            }

            // For now, default to free tier (subscription table will be created later)
            // In production, this would fetch from subscriptions table
            setSubscription({
                tier: "free",
                status: "active",
                currentPeriodEnd: null,
                loading: false,
            });
        };

        fetchSubscription();
    }, []);

    // Fetch usage stats
    useEffect(() => {
        const fetchUsage = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setUsage(prev => ({ ...prev, loading: false }));
                return;
            }

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Count invoices this month
            const { count: invoiceCount } = await supabase
                .from("invoices")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .gte("created_at", startOfMonth.toISOString())
                .lte("created_at", endOfMonth.toISOString());

            // Count proposals this month
            const { count: proposalCount } = await supabase
                .from("proposals")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .gte("created_at", startOfMonth.toISOString())
                .lte("created_at", endOfMonth.toISOString());

            // Count total clients
            const { count: clientCount } = await supabase
                .from("clients")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id);

            setUsage({
                invoicesThisMonth: invoiceCount || 0,
                proposalsThisMonth: proposalCount || 0,
                totalClients: clientCount || 0,
                loading: false,
            });
        };

        fetchUsage();
    }, []);

    // Check if user can create invoice
    const canCreateInvoice = useCallback(() => {
        return canPerformAction(subscription.tier, "create_invoice", usage.invoicesThisMonth);
    }, [subscription.tier, usage.invoicesThisMonth]);

    // Check if user can create proposal
    const canCreateProposal = useCallback(() => {
        return canPerformAction(subscription.tier, "create_proposal", usage.proposalsThisMonth);
    }, [subscription.tier, usage.proposalsThisMonth]);

    // Check if user can add client
    const canAddClient = useCallback(() => {
        return canPerformAction(subscription.tier, "add_client", usage.totalClients);
    }, [subscription.tier, usage.totalClients]);

    // Get remaining invoice quota
    const remainingInvoices = useCallback(() => {
        return getRemainingQuota(subscription.tier, "create_invoice", usage.invoicesThisMonth);
    }, [subscription.tier, usage.invoicesThisMonth]);

    // Get remaining proposal quota
    const remainingProposals = useCallback(() => {
        return getRemainingQuota(subscription.tier, "create_proposal", usage.proposalsThisMonth);
    }, [subscription.tier, usage.proposalsThisMonth]);

    // Check if should show upgrade prompt
    const shouldShowUpgrade = useCallback(() => {
        if (subscription.tier !== "free") return false;
        const limits = SUBSCRIPTION_TIERS.free.limits;
        return (
            usage.invoicesThisMonth >= limits.invoicesPerMonth - 1 ||
            usage.proposalsThisMonth >= limits.proposalsPerMonth - 1
        );
    }, [subscription.tier, usage.invoicesThisMonth, usage.proposalsThisMonth]);

    // Refresh usage stats
    const refreshUsage = useCallback(async () => {
        setUsage(prev => ({ ...prev, loading: true }));
        // Re-trigger the useEffect by forcing a state update
        setUsage(prev => ({ ...prev }));
    }, []);

    return {
        // Subscription info
        tier: subscription.tier,
        tierConfig: SUBSCRIPTION_TIERS[subscription.tier],
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        isLoading: subscription.loading || usage.loading,
        isPro: subscription.tier === "pro" || subscription.tier === "business",
        isBusiness: subscription.tier === "business",

        // Usage stats
        usage: {
            invoices: usage.invoicesThisMonth,
            proposals: usage.proposalsThisMonth,
            clients: usage.totalClients,
        },

        // Permission checks
        canCreateInvoice,
        canCreateProposal,
        canAddClient,

        // Quota info
        remainingInvoices,
        remainingProposals,
        shouldShowUpgrade,
        refreshUsage,
    };
}

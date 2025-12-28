import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    SubscriptionTier,
    SUBSCRIPTION_TIERS,
    canPerformAction,
    getRemainingQuota,
    isDeveloper,
    hasProFeature,
    hasBusinessFeature,
    ProFeature,
    BusinessFeature,
} from "@/lib/subscription";

interface SubscriptionState {
    tier: SubscriptionTier;
    status: "active" | "cancelled" | "past_due";
    currentPeriodEnd: Date | null;
    loading: boolean;
    isDeveloper: boolean;
    userEmail: string | null;
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
        isDeveloper: false,
        userEmail: null,
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

            const userEmail = user.email || null;
            const isDevUser = isDeveloper(userEmail);

            // Developers get "business" tier automatically
            if (isDevUser) {
                setSubscription({
                    tier: "business",
                    status: "active",
                    currentPeriodEnd: null,
                    loading: false,
                    isDeveloper: true,
                    userEmail,
                });
                return;
            }

            // Try to fetch from subscriptions table
            const { data: subData } = await supabase
                .from("subscriptions")
                .select("tier, status, current_period_end")
                .eq("user_id", user.id)
                .single();

            if (subData) {
                setSubscription({
                    tier: (subData.tier as SubscriptionTier) || "free",
                    status: subData.status as any || "active",
                    currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end) : null,
                    loading: false,
                    isDeveloper: false,
                    userEmail,
                });
            } else {
                // Default to free tier
                setSubscription({
                    tier: "free",
                    status: "active",
                    currentPeriodEnd: null,
                    loading: false,
                    isDeveloper: false,
                    userEmail,
                });
            }
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

    // Check if user can create invoice (developers always can)
    const canCreateInvoice = useCallback(() => {
        if (subscription.isDeveloper) return true;
        return canPerformAction(subscription.tier, "create_invoice", usage.invoicesThisMonth);
    }, [subscription.tier, subscription.isDeveloper, usage.invoicesThisMonth]);

    // Check if user can create proposal (developers always can)
    const canCreateProposal = useCallback(() => {
        if (subscription.isDeveloper) return true;
        return canPerformAction(subscription.tier, "create_proposal", usage.proposalsThisMonth);
    }, [subscription.tier, subscription.isDeveloper, usage.proposalsThisMonth]);

    // Check if user can add client (developers always can)
    const canAddClient = useCallback(() => {
        if (subscription.isDeveloper) return true;
        return canPerformAction(subscription.tier, "add_client", usage.totalClients);
    }, [subscription.tier, subscription.isDeveloper, usage.totalClients]);

    // Check if user has access to a Pro feature
    const hasProAccess = useCallback((feature: ProFeature) => {
        if (subscription.isDeveloper) return true;
        return hasProFeature(subscription.tier, feature);
    }, [subscription.tier, subscription.isDeveloper]);

    // Check if user has access to a Business feature
    const hasBusinessAccess = useCallback((feature: BusinessFeature) => {
        if (subscription.isDeveloper) return true;
        return hasBusinessFeature(subscription.tier, feature);
    }, [subscription.tier, subscription.isDeveloper]);

    // Get remaining invoice quota
    const remainingInvoices = useCallback(() => {
        if (subscription.isDeveloper) return Infinity;
        return getRemainingQuota(subscription.tier, "create_invoice", usage.invoicesThisMonth);
    }, [subscription.tier, subscription.isDeveloper, usage.invoicesThisMonth]);

    // Get remaining proposal quota
    const remainingProposals = useCallback(() => {
        if (subscription.isDeveloper) return Infinity;
        return getRemainingQuota(subscription.tier, "create_proposal", usage.proposalsThisMonth);
    }, [subscription.tier, subscription.isDeveloper, usage.proposalsThisMonth]);

    // Check if should show upgrade prompt (never for developers)
    const shouldShowUpgrade = useCallback(() => {
        if (subscription.isDeveloper) return false;
        if (subscription.tier !== "free") return false;
        const limits = SUBSCRIPTION_TIERS.free.limits;
        return (
            usage.invoicesThisMonth >= limits.invoicesPerMonth - 1 ||
            usage.proposalsThisMonth >= limits.proposalsPerMonth - 1
        );
    }, [subscription.tier, subscription.isDeveloper, usage.invoicesThisMonth, usage.proposalsThisMonth]);

    // Refresh usage stats
    const refreshUsage = useCallback(async () => {
        setUsage(prev => ({ ...prev, loading: true }));
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
        isDeveloper: subscription.isDeveloper,
        userEmail: subscription.userEmail,

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

        // Feature access
        hasProAccess,
        hasBusinessAccess,

        // Quota info
        remainingInvoices,
        remainingProposals,
        shouldShowUpgrade,
        refreshUsage,
    };
}

/**
 * Subscription Tier Definitions
 * Artha monetization system
 */

export type SubscriptionTier = "free" | "pro" | "business";

export interface TierConfig {
    name: string;
    displayName: string;
    price: number; // in IDR
    priceDisplay: string;
    features: string[];
    limits: {
        invoicesPerMonth: number;
        proposalsPerMonth: number;
        clients: number;
        teamMembers: number;
    };
    highlighted?: boolean;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
    free: {
        name: "free",
        displayName: "Free",
        price: 0,
        priceDisplay: "Rp 0",
        features: [
            "3 invoices per month",
            "5 proposals per month",
            "10 clients",
            "Basic invoice templates",
            "PDF export",
            "Email support",
        ],
        limits: {
            invoicesPerMonth: 3,
            proposalsPerMonth: 5,
            clients: 10,
            teamMembers: 1,
        },
    },
    pro: {
        name: "pro",
        displayName: "Pro",
        price: 50000,
        priceDisplay: "Rp 50.000",
        features: [
            "Unlimited invoices",
            "Unlimited proposals",
            "Unlimited clients",
            "Premium templates",
            "Custom branding",
            "Payment reminders",
            "Analytics dashboard",
            "Priority support",
        ],
        limits: {
            invoicesPerMonth: Infinity,
            proposalsPerMonth: Infinity,
            clients: Infinity,
            teamMembers: 1,
        },
        highlighted: true,
    },
    business: {
        name: "business",
        displayName: "Business",
        price: 199000,
        priceDisplay: "Rp 199.000",
        features: [
            "Everything in Pro",
            "5 team members",
            "API access",
            "White-label invoices",
            "Advanced analytics",
            "Dedicated support",
            "Custom integrations",
            "Audit logs",
        ],
        limits: {
            invoicesPerMonth: Infinity,
            proposalsPerMonth: Infinity,
            clients: Infinity,
            teamMembers: 5,
        },
    },
};

/**
 * Check if a user can perform an action based on their tier
 */
export function canPerformAction(
    tier: SubscriptionTier,
    action: "create_invoice" | "create_proposal" | "add_client" | "add_team_member",
    currentCount: number
): boolean {
    const config = SUBSCRIPTION_TIERS[tier];

    switch (action) {
        case "create_invoice":
            return currentCount < config.limits.invoicesPerMonth;
        case "create_proposal":
            return currentCount < config.limits.proposalsPerMonth;
        case "add_client":
            return currentCount < config.limits.clients;
        case "add_team_member":
            return currentCount < config.limits.teamMembers;
        default:
            return false;
    }
}

/**
 * Get remaining quota for an action
 */
export function getRemainingQuota(
    tier: SubscriptionTier,
    action: "create_invoice" | "create_proposal" | "add_client",
    currentCount: number
): number {
    const config = SUBSCRIPTION_TIERS[tier];

    switch (action) {
        case "create_invoice":
            return Math.max(0, config.limits.invoicesPerMonth - currentCount);
        case "create_proposal":
            return Math.max(0, config.limits.proposalsPerMonth - currentCount);
        case "add_client":
            return Math.max(0, config.limits.clients - currentCount);
        default:
            return 0;
    }
}

/**
 * Check if user should see upgrade prompt
 */
export function shouldShowUpgradePrompt(
    tier: SubscriptionTier,
    invoiceCount: number,
    proposalCount: number
): boolean {
    if (tier !== "free") return false;

    const config = SUBSCRIPTION_TIERS.free;
    const invoiceThreshold = config.limits.invoicesPerMonth * 0.8; // 80% of limit
    const proposalThreshold = config.limits.proposalsPerMonth * 0.8;

    return invoiceCount >= invoiceThreshold || proposalCount >= proposalThreshold;
}

/**
 * Format price for display
 */
export function formatSubscriptionPrice(tier: SubscriptionTier): string {
    const config = SUBSCRIPTION_TIERS[tier];
    if (config.price === 0) return "Free";
    return `${config.priceDisplay}/month`;
}

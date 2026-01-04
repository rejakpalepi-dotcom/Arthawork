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
        displayName: "Starter",
        price: 0,
        priceDisplay: "Rp 0",
        features: [
            "3 invoices per month",
            "5 proposals per month",
            "10 clients",
            "Basic templates",
            "PDF export",
            "Artha watermark on invoices",
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
            "Custom branding (logo + colors)",
            "Payment reminders",
            "No watermark",
            "Smart Contracts with DP Lock 🔒",
            "Priority email support",
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
            "Premium Client Portal 🌌",
            "Pin-point feedback on designs",
            "Indonesian Tax Engine (PPh 21/23) 🧮",
            "Annual Tax Summary for SPT",
            "Recurring invoices (auto-bill)",
            "White-label (100% your brand)",
            "Advanced analytics & reports",
            "Bulk PDF export",
            "Dedicated account manager",
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

/**
 * Developer emails that get full access (bypass subscription)
 * Add your email here!
 */
export const DEVELOPER_EMAILS: string[] = [
    "rejakpalepi@gmail.com", // Add your email
    "admin@arthawork.com",
    // Add more developer emails as needed
];

/**
 * Check if email is a developer (gets full access)
 */
export function isDeveloper(email: string | null | undefined): boolean {
    if (!email) return false;
    return DEVELOPER_EMAILS.includes(email.toLowerCase());
}

/**
 * Pro/Business feature definitions
 */
export type ProFeature =
    | "premium_templates"
    | "custom_branding"
    | "payment_reminders"
    | "analytics_dashboard"
    | "priority_support";

export type BusinessFeature =
    | "team_members"
    | "api_access"
    | "white_label"
    | "advanced_analytics"
    | "custom_integrations"
    | "audit_logs";

/**
 * Check if tier has access to a Pro feature
 */
export function hasProFeature(tier: SubscriptionTier, feature: ProFeature): boolean {
    return tier === "pro" || tier === "business";
}

/**
 * Check if tier has access to a Business feature
 */
export function hasBusinessFeature(tier: SubscriptionTier, feature: BusinessFeature): boolean {
    return tier === "business";
}

/**
 * Get feature display name in Indonesian
 */
export function getFeatureDisplayName(feature: ProFeature | BusinessFeature): string {
    const names: Record<string, string> = {
        premium_templates: "Template Premium",
        custom_branding: "Custom Branding",
        payment_reminders: "Pengingat Pembayaran",
        analytics_dashboard: "Dashboard Analytics",
        priority_support: "Priority Support",
        team_members: "Tim Members",
        api_access: "API Access",
        white_label: "White Label",
        advanced_analytics: "Advanced Analytics",
        custom_integrations: "Custom Integrations",
        audit_logs: "Audit Logs",
    };
    return names[feature] || feature;
}

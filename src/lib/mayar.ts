/**
 * Mayar Payment Integration
 * Simple redirect-based payment flow
 */

import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "pro" | "business";

export interface CreatePaymentParams {
    amount: number;
    tier: SubscriptionTier;
    customerEmail: string;
    customerName: string;
}

export interface PaymentResult {
    paymentUrl: string;
    orderId: string;
}

/**
 * Create a Mayar payment link via Edge Function
 */
export async function createMayarPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const { data, error } = await supabase.functions.invoke("create-mayar-payment", {
        body: params,
    });

    if (error) {
        throw new Error(error.message || "Failed to create payment");
    }

    if (!data.paymentUrl) {
        throw new Error("No payment URL returned");
    }

    return {
        paymentUrl: data.paymentUrl,
        orderId: data.orderId,
    };
}

/**
 * Redirect to Mayar payment page
 */
export function redirectToPayment(paymentUrl: string): void {
    window.location.href = paymentUrl;
}

/**
 * Check payment status from URL params (after redirect back)
 */
export function getPaymentStatusFromUrl(): { status: string | null; orderId: string | null } {
    const params = new URLSearchParams(window.location.search);
    return {
        status: params.get("payment"),
        orderId: params.get("order"),
    };
}

/**
 * Subscription pricing
 */
export const SUBSCRIPTION_PRICES = {
    pro: {
        monthly: 50000,
        name: "Pro",
        features: ["Unlimited Invoices", "Unlimited Clients", "PDF Export"],
    },
    business: {
        monthly: 199000,
        name: "Business",
        features: ["All Pro features", "Priority Support", "Custom Branding"],
    },
};

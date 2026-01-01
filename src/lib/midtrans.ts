/**
 * Midtrans Payment Integration
 * Supports QRIS, Virtual Account, and E-Wallets
 */

import { supabase } from "@/integrations/supabase/client";

export type PaymentMethod =
    | "qris"
    | "bca_va"
    | "bni_va"
    | "bri_va"
    | "mandiri_va"
    | "permata_va"
    | "gopay"
    | "shopeepay"
    | "dana";

export type PaymentCategory = "qris" | "virtual_account" | "ewallet";

export interface PaymentMethodConfig {
    id: PaymentMethod;
    name: string;
    category: PaymentCategory;
    icon: string;
    enabled: boolean;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
    // QRIS
    { id: "qris", name: "QRIS", category: "qris", icon: "📱", enabled: true },

    // Virtual Accounts
    { id: "bca_va", name: "BCA Virtual Account", category: "virtual_account", icon: "🏦", enabled: true },
    { id: "bni_va", name: "BNI Virtual Account", category: "virtual_account", icon: "🏦", enabled: true },
    { id: "bri_va", name: "BRI Virtual Account", category: "virtual_account", icon: "🏦", enabled: true },
    { id: "mandiri_va", name: "Mandiri Virtual Account", category: "virtual_account", icon: "🏦", enabled: true },
    { id: "permata_va", name: "Permata Virtual Account", category: "virtual_account", icon: "🏦", enabled: true },

    // E-Wallets
    { id: "gopay", name: "GoPay", category: "ewallet", icon: "💚", enabled: true },
    { id: "shopeepay", name: "ShopeePay", category: "ewallet", icon: "🧡", enabled: true },
    { id: "dana", name: "DANA", category: "ewallet", icon: "💙", enabled: true },
];

export function getPaymentMethodsByCategory(category: PaymentCategory): PaymentMethodConfig[] {
    return PAYMENT_METHODS.filter((m) => m.category === category && m.enabled);
}

export interface MidtransConfig {
    clientKey: string;
    isProduction: boolean;
}

// Get Midtrans client key from env
export function getMidtransConfig(): MidtransConfig {
    return {
        clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "",
        isProduction: import.meta.env.VITE_MIDTRANS_PRODUCTION === "true",
    };
}

// Load Midtrans Snap JS
export function loadMidtransSnap(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.snap) {
            resolve();
            return;
        }

        const config = getMidtransConfig();
        const script = document.createElement("script");
        script.src = config.isProduction
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", config.clientKey);
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Midtrans Snap"));
        document.head.appendChild(script);
    });
}

// Transaction types
export interface CreateTransactionParams {
    orderId: string;
    amount: number;
    itemName: string;
    customerEmail: string;
    customerName: string;
    paymentMethod?: PaymentMethod;
}

export interface TransactionResult {
    transactionId: string;
    orderId: string;
    status: "pending" | "success" | "failed" | "expired";
    paymentType: string;
    grossAmount: number;
    vaNumber?: string;
    qrCodeUrl?: string;
    deeplinkUrl?: string;
}

// Create Snap token (should be done server-side via Edge Function)
export async function createSnapToken(
    params: CreateTransactionParams
): Promise<string> {
    // In production, this calls a Supabase Edge Function
    // For now, we'll use a placeholder
    const { data, error } = await supabase.functions.invoke("create-midtrans-transaction", {
        body: params,
    });

    if (error) throw new Error(error.message);
    return data.snapToken;
}

// Midtrans result type for callbacks
export interface MidtransResult {
    order_id: string;
    transaction_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_status: string;
    status_code: string;
    status_message: string;
}

// Open Midtrans Snap popup
export async function openSnapPopup(
    snapToken: string,
    callbacks?: {
        onSuccess?: (result: MidtransResult) => void;
        onPending?: (result: MidtransResult) => void;
        onError?: (result: MidtransResult) => void;
        onClose?: () => void;
    }
): Promise<void> {
    await loadMidtransSnap();

    if (!window.snap) {
        throw new Error("Midtrans Snap not loaded");
    }

    window.snap.pay(snapToken, {
        onSuccess: callbacks?.onSuccess,
        onPending: callbacks?.onPending,
        onError: callbacks?.onError,
        onClose: callbacks?.onClose,
    });
}

// Declare global window type for Midtrans
declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                options: {
                    onSuccess?: (result: MidtransResult) => void;
                    onPending?: (result: MidtransResult) => void;
                    onError?: (result: MidtransResult) => void;
                    onClose?: () => void;
                }
            ) => void;
        };
    }
}

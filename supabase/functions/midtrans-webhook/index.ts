// Supabase Edge Function: Midtrans Webhook Handler
// Handles payment status notifications from Midtrans

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// ===========================================
// CORS Configuration (Environment-based)
// ===========================================
const PRODUCTION_ORIGINS = [
    "https://arthawork.com",
    "https://www.arthawork.com",
    "https://arthawork.lovable.app",
];

const DEVELOPMENT_ORIGINS = [
    ...PRODUCTION_ORIGINS,
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
];

// Use environment variable to determine if in production
const IS_PRODUCTION = Deno.env.get("ENVIRONMENT") === "production" ||
    Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";

const ALLOWED_ORIGINS = IS_PRODUCTION ? PRODUCTION_ORIGINS : DEVELOPMENT_ORIGINS;

// Midtrans IP whitelist (production)
const MIDTRANS_IPS = [
    "103.208.23.0/24",
    "103.208.22.0/24",
    "103.127.16.0/23",
];

function getCorsHeaders(origin: string | null) {
    const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
        ? origin
        : ALLOWED_ORIGINS[0];

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
}

interface MidtransNotification {
    transaction_status: string;
    status_code: string;
    order_id: string;
    gross_amount: string;
    signature_key: string;
    payment_type: string;
    transaction_id: string;
    fraud_status?: string;
}

// Verify Midtrans signature
function verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    serverKey: string,
    signatureKey: string
): boolean {
    const dataToHash = orderId + statusCode + grossAmount + serverKey;
    const encoder = new TextEncoder();
    const data = encoder.encode(dataToHash);

    // SHA-512 hash
    const hashBuffer = crypto.subtle.digestSync("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    return expectedSignature === signatureKey;
}

serve(async (req) => {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!MIDTRANS_SERVER_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing required environment variables");
        }

        // Parse notification body
        const notification: MidtransNotification = await req.json();
        const {
            transaction_status,
            status_code,
            order_id,
            gross_amount,
            signature_key,
            payment_type,
            transaction_id,
            fraud_status,
        } = notification;

        // Log order ID only (no sensitive data)
        console.log(`Webhook received for order: ${order_id}`);

        // Verify signature
        const isValid = verifySignature(
            order_id,
            status_code,
            gross_amount,
            MIDTRANS_SERVER_KEY,
            signature_key
        );

        if (!isValid) {
            console.error("Invalid webhook signature for order:", order_id);
            return new Response(
                JSON.stringify({ error: "Invalid signature" }),
                { headers: corsHeaders, status: 403 }
            );
        }

        // Create admin Supabase client
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Map Midtrans status to our status
        let paymentStatus: string;
        switch (transaction_status) {
            case "capture":
            case "settlement":
                paymentStatus = fraud_status === "accept" || !fraud_status ? "success" : "failed";
                break;
            case "pending":
                paymentStatus = "pending";
                break;
            case "deny":
            case "cancel":
            case "failure":
                paymentStatus = "failed";
                break;
            case "expire":
                paymentStatus = "expired";
                break;
            case "refund":
            case "partial_refund":
                paymentStatus = "refunded";
                break;
            default:
                paymentStatus = "pending";
        }

        // Update payment history
        const { data: payment, error: paymentError } = await supabase
            .from("payment_history")
            .update({
                status: paymentStatus,
                payment_type: payment_type,
                midtrans_transaction_id: transaction_id,
                updated_at: new Date().toISOString(),
            })
            .eq("midtrans_order_id", order_id)
            .select("user_id, amount, metadata")
            .single();

        if (paymentError) {
            console.error("Payment update failed for order:", order_id);
            throw new Error("Failed to update payment record");
        }

        // If payment successful, upgrade subscription
        if (paymentStatus === "success" && payment) {
            const tier = order_id.includes("PRO") ? "pro" : "business";
            const now = new Date();
            const periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 month subscription

            const { error: subscriptionError } = await supabase
                .from("subscriptions")
                .upsert({
                    user_id: payment.user_id,
                    tier: tier,
                    status: "active",
                    current_period_start: now.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    midtrans_order_id: order_id,
                    updated_at: now.toISOString(),
                }, {
                    onConflict: "user_id",
                });

            if (subscriptionError) {
                console.error("Subscription update failed for order:", order_id);
            } else {
                console.log(`Subscription upgraded: ${order_id} -> ${tier}`);
            }
        }

        return new Response(
            JSON.stringify({ success: true, status: paymentStatus }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Webhook error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});

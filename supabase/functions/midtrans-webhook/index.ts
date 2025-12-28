// Supabase Edge Function: Midtrans Webhook Handler
// Handles payment status notifications from Midtrans

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

        console.log(`Received notification for order: ${order_id}, status: ${transaction_status}`);

        // Verify signature
        const isValid = verifySignature(
            order_id,
            status_code,
            gross_amount,
            MIDTRANS_SERVER_KEY,
            signature_key
        );

        if (!isValid) {
            console.error("Invalid signature for order:", order_id);
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
            console.error("Error updating payment:", paymentError);
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
                console.error("Error updating subscription:", subscriptionError);
            } else {
                console.log(`Subscription upgraded to ${tier} for user ${payment.user_id}`);
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
        console.error("Webhook error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});

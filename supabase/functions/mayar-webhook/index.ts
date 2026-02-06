// Supabase Edge Function: Mayar Webhook Handler
// Handles payment status notifications from Mayar

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-mayar-signature",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface MayarWebhookPayload {
    event: string;
    data: {
        id: string;
        status: string;
        amount: number;
        customerEmail: string;
        paidAt?: string;
        expiredAt?: string;
        metadata?: Record<string, unknown>;
    };
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const MAYAR_WEBHOOK_TOKEN = Deno.env.get("MAYAR_WEBHOOK_TOKEN");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!MAYAR_WEBHOOK_TOKEN || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing required environment variables");
        }

        // Verify webhook signature
        const signature = req.headers.get("x-mayar-signature") || req.headers.get("x-webhook-token");

        // SECURITY: Validate webhook signature to prevent forged requests
        if (!signature || signature !== MAYAR_WEBHOOK_TOKEN) {
            console.error("Invalid webhook signature");
            return new Response(
                JSON.stringify({ error: "Invalid signature" }),
                { headers: corsHeaders, status: 403 }
            );
        }

        // Parse webhook payload
        const payload: MayarWebhookPayload = await req.json();
        console.log(`Webhook received: ${payload.event}`);

        // Create admin Supabase client
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Handle different events
        let paymentStatus: string;
        switch (payload.event) {
            case "payment.success":
            case "payment.completed":
                paymentStatus = "success";
                break;
            case "payment.pending":
                paymentStatus = "pending";
                break;
            case "payment.failed":
            case "payment.cancelled":
                paymentStatus = "failed";
                break;
            case "payment.expired":
                paymentStatus = "expired";
                break;
            default:
                paymentStatus = "pending";
        }

        // Find payment by Mayar ID in metadata
        const { data: payments, error: findError } = await supabase
            .from("payment_history")
            .select("*")
            .contains("metadata", { mayar_id: payload.data.id });

        if (findError || !payments || payments.length === 0) {
            // Try to find by email as fallback
            const { data: paymentsByEmail } = await supabase
                .from("payment_history")
                .select("*")
                .eq("status", "pending")
                .order("created_at", { ascending: false })
                .limit(1);

            if (!paymentsByEmail || paymentsByEmail.length === 0) {
                console.error("Payment not found for Mayar ID:", payload.data.id);
                return new Response(
                    JSON.stringify({ success: true, message: "No matching payment found" }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
                );
            }
        }

        const payment = payments?.[0];
        if (!payment) {
            return new Response(
                JSON.stringify({ success: true, message: "Payment not found" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
        }

        // Update payment status
        await supabase
            .from("payment_history")
            .update({
                status: paymentStatus,
                updated_at: new Date().toISOString(),
            })
            .eq("id", payment.id);

        // If payment successful, upgrade subscription
        if (paymentStatus === "success") {
            const paymentType = payment.metadata?.type;

            // Handle contract DP payment
            if (paymentType === "contract_dp") {
                const contractId = payment.metadata?.contract_id;
                if (contractId) {
                    // Update contract status to paid/active
                    await supabase
                        .from("contracts")
                        .update({
                            status: "active",
                            payment_status: "paid",
                            paid_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", contractId);

                    // Unlock any linked project
                    await supabase
                        .from("projects")
                        .update({
                            status: "active",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("contract_id", contractId)
                        .eq("status", "locked");

                    console.log(`Contract DP paid: ${contractId}`);
                }
            } else {
                // Handle subscription payment (existing logic)
                const tier = payment.metadata?.tier || "pro";
                const now = new Date();
                const periodEnd = new Date(now);
                periodEnd.setMonth(periodEnd.getMonth() + 1);

                await supabase
                    .from("subscriptions")
                    .upsert({
                        user_id: payment.user_id,
                        tier: tier,
                        status: "active",
                        current_period_start: now.toISOString(),
                        current_period_end: periodEnd.toISOString(),
                        midtrans_order_id: payment.midtrans_order_id,
                        updated_at: now.toISOString(),
                    }, {
                        onConflict: "user_id",
                    });

                console.log(`Subscription upgraded: ${payment.user_id} -> ${tier}`);
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

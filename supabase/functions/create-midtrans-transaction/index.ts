// Supabase Edge Function: Create Midtrans Transaction
// This function creates a Snap token for payment processing

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
    "https://arthawork.com",
    "https://www.arthawork.com",
    "https://arthawork.lovable.app",
    "http://localhost:8080",
    "http://localhost:5173",
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

interface TransactionRequest {
    orderId: string;
    amount: number;
    itemName: string;
    customerEmail: string;
    customerName: string;
    paymentMethod?: string;
}

serve(async (req) => {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get Midtrans credentials from environment
        const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY");
        const MIDTRANS_IS_PRODUCTION = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

        if (!MIDTRANS_SERVER_KEY) {
            throw new Error("MIDTRANS_SERVER_KEY not configured");
        }

        // Get user from auth header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            throw new Error("No authorization header");
        }

        const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: authHeader } },
        });

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error("Unauthorized");
        }

        // Parse request body
        const body: TransactionRequest = await req.json();
        const { orderId, amount, itemName, customerEmail, customerName, paymentMethod } = body;

        if (!orderId || !amount || !itemName) {
            throw new Error("Missing required fields: orderId, amount, itemName");
        }

        // Build Midtrans transaction payload
        const transactionPayload = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            item_details: [
                {
                    id: "subscription",
                    price: amount,
                    quantity: 1,
                    name: itemName,
                },
            ],
            customer_details: {
                email: customerEmail || user.email,
                first_name: customerName || "Customer",
            },
            callbacks: {
                finish: `${origin || "https://arthawork.com"}/dashboard?payment=success`,
                error: `${origin || "https://arthawork.com"}/dashboard?payment=error`,
                pending: `${origin || "https://arthawork.com"}/dashboard?payment=pending`,
            },
        };

        // Add enabled payment methods based on selection
        if (paymentMethod) {
            const paymentMethods: Record<string, string[]> = {
                qris: ["gopay", "shopeepay"],
                bca_va: ["bca_va"],
                bni_va: ["bni_va"],
                bri_va: ["bri_va"],
                mandiri_va: ["echannel"],
                permata_va: ["permata_va"],
                gopay: ["gopay"],
                shopeepay: ["shopeepay"],
                dana: ["dana"],
            };

            if (paymentMethods[paymentMethod]) {
                (transactionPayload as any).enabled_payments = paymentMethods[paymentMethod];
            }
        }

        // Create Snap token via Midtrans API
        const midtransUrl = MIDTRANS_IS_PRODUCTION
            ? "https://app.midtrans.com/snap/v1/transactions"
            : "https://app.sandbox.midtrans.com/snap/v1/transactions";

        const authString = btoa(`${MIDTRANS_SERVER_KEY}:`);

        const midtransResponse = await fetch(midtransUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${authString}`,
            },
            body: JSON.stringify(transactionPayload),
        });

        if (!midtransResponse.ok) {
            const errorBody = await midtransResponse.text();
            // Log error without sensitive data
            console.error("Midtrans API error:", midtransResponse.status);
            throw new Error(`Midtrans API error: ${midtransResponse.status}`);
        }

        const midtransData = await midtransResponse.json();

        // Save payment record to database
        const { error: insertError } = await supabase
            .from("payment_history")
            .insert({
                user_id: user.id,
                midtrans_order_id: orderId,
                amount: amount,
                status: "pending",
                metadata: { item_name: itemName, payment_method: paymentMethod },
            });

        if (insertError) {
            // Log without exposing full error object
            console.error("Payment record insert failed");
        }

        return new Response(
            JSON.stringify({
                snapToken: midtransData.token,
                redirectUrl: midtransData.redirect_url,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        // Only log error message, not full stack
        console.error("Transaction error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});

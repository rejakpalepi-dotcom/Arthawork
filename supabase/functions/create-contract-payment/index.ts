// Supabase Edge Function: Create Contract Payment
// Creates Mayar payment link specifically for contract DP payments

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS Configuration
const ALLOWED_ORIGINS = [
    "https://arthawork.com",
    "https://www.arthawork.com",
    "https://arthawork.lovable.app",
    "https://arthawork.vercel.app",
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

interface ContractPaymentRequest {
    contractId: string;
    contractToken?: string; // For public access
}

serve(async (req) => {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const MAYAR_API_KEY = Deno.env.get("MAYAR_API_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!MAYAR_API_KEY) {
            throw new Error("MAYAR_API_KEY not configured");
        }

        // Use service role for contract payment (public access via token)
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Parse request
        const body: ContractPaymentRequest = await req.json();
        const { contractId, contractToken } = body;

        if (!contractId && !contractToken) {
            throw new Error("Missing required field: contractId or contractToken");
        }

        // Fetch contract
        let query = supabase
            .from("contracts")
            .select(`
                *,
                clients (
                    id,
                    name,
                    email,
                    company
                )
            `);

        if (contractToken) {
            query = query.eq("contract_token", contractToken);
        } else {
            query = query.eq("id", contractId);
        }

        const { data: contract, error: contractError } = await query.single();

        if (contractError || !contract) {
            throw new Error("Contract not found");
        }

        // Validate contract status (must be signed to pay)
        if (contract.status !== 'signed') {
            throw new Error("Contract must be signed before payment");
        }

        // Generate unique order ID
        const orderId = `CONTRACT-DP-${Date.now()}-${contract.id.slice(0, 8)}`;

        // Get client email
        const customerEmail = contract.clients?.email || "client@arthawork.com";
        const customerName = contract.clients?.name || "Client";

        // Create payment via Mayar API
        const mayarResponse = await fetch("https://api.mayar.id/hl/v1/payment/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${MAYAR_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: `DP Payment: ${contract.title}`,
                amount: Math.round(contract.dp_amount),
                email: customerEmail,
                mobile: "081285864059", // Placeholder - Mayar requires min 10 chars
                redirectUrl: `${origin || "https://arthawork.vercel.app"}/contract/${contract.contract_token}?payment=success`,
                description: `Down Payment (${contract.dp_percentage}%) for ${contract.title}`,
                expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            }),
        });

        if (!mayarResponse.ok) {
            const errorText = await mayarResponse.text();
            console.error("Mayar API error:", mayarResponse.status, errorText);
            throw new Error(`Mayar API error: ${mayarResponse.status}`);
        }

        const mayarData = await mayarResponse.json();

        // Update contract with payment info
        await supabase
            .from("contracts")
            .update({
                mayar_payment_id: mayarData.data?.id,
                payment_status: "processing",
                updated_at: new Date().toISOString(),
            })
            .eq("id", contract.id);

        // Log payment attempt
        await supabase.from("payment_history").insert({
            user_id: contract.user_id,
            midtrans_order_id: orderId, // Reusing column for Mayar
            amount: Math.round(contract.dp_amount),
            status: "pending",
            metadata: {
                type: "contract_dp",
                contract_id: contract.id,
                provider: "mayar",
                mayar_id: mayarData.data?.id,
            },
        });

        return new Response(
            JSON.stringify({
                paymentUrl: mayarData.data?.link,
                orderId: orderId,
                dpAmount: contract.dp_amount,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Contract payment error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});

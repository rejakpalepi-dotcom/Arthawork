// Supabase Edge Function: Create Mayar Payment
// This function creates a payment link via Mayar API

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

// Rate Limiting
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT = { maxRequests: 10, windowMs: 60000 };

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(userId);

    if (entry && now > entry.resetTime) {
        rateLimitStore.delete(userId);
    }

    const current = rateLimitStore.get(userId);
    if (!current) {
        rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
        return true;
    }

    if (current.count >= RATE_LIMIT.maxRequests) {
        return false;
    }

    current.count++;
    return true;
}

// Request Types
interface PaymentRequest {
    amount: number;
    tier: "pro" | "business";
    customerEmail: string;
    customerName: string;
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
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

        if (!MAYAR_API_KEY) {
            throw new Error("MAYAR_API_KEY not configured");
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

        // Rate limiting
        if (!checkRateLimit(user.id)) {
            return new Response(
                JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
            );
        }

        // Parse request
        const body: PaymentRequest = await req.json();
        const { amount, tier, customerEmail, customerName } = body;

        if (!amount || !tier) {
            throw new Error("Missing required fields: amount, tier");
        }

        // Generate unique order ID
        const orderId = `ARTHA-${tier.toUpperCase()}-${Date.now()}-${user.id.slice(0, 8)}`;

        // Create payment via Mayar API
        const mayarResponse = await fetch("https://api.mayar.id/hl/v1/payment/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${MAYAR_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: `Arthawork ${tier === "pro" ? "Pro" : "Business"} Subscription`,
                amount: amount,
                email: customerEmail || user.email,
                mobile: "081285864059", // Placeholder - Mayar requires min 10 chars
                redirectUrl: `${origin || "https://arthawork.vercel.app"}/dashboard?payment=success&order=${orderId}`,
                description: `Monthly subscription for Arthawork ${tier} plan`,
                expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            }),
        });

        if (!mayarResponse.ok) {
            const errorText = await mayarResponse.text();
            console.error("Mayar API error:", mayarResponse.status, errorText);
            throw new Error(`Mayar API error: ${mayarResponse.status}`);
        }

        const mayarData = await mayarResponse.json();

        // Save payment record
        await supabase.from("payment_history").insert({
            user_id: user.id,
            midtrans_order_id: orderId, // Reusing column for Mayar
            amount: amount,
            status: "pending",
            metadata: { tier, provider: "mayar", mayar_id: mayarData.data?.id },
        });

        return new Response(
            JSON.stringify({
                paymentUrl: mayarData.data?.link,
                orderId: orderId,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Payment error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});

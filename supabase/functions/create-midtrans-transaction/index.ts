// Supabase Edge Function: Create Midtrans Transaction
// This function creates a Snap token for payment processing

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// ===========================================
// Server-Side Rate Limiting
// ===========================================
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// Simple in-memory rate limit store (resets on function cold start)
// For production, use Redis/Upstash or Supabase table
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_CONFIG = {
    maxRequests: 10, // 10 requests per window
    windowMs: 60000, // 1 minute window
};

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const key = `payment:${userId}`;
    const entry = rateLimitStore.get(key);

    // Clean expired entries
    if (entry && now > entry.resetTime) {
        rateLimitStore.delete(key);
    }

    const current = rateLimitStore.get(key);

    if (!current) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + RATE_LIMIT_CONFIG.windowMs,
        });
        return { allowed: true, remaining: RATE_LIMIT_CONFIG.maxRequests - 1, resetIn: RATE_LIMIT_CONFIG.windowMs };
    }

    if (current.count >= RATE_LIMIT_CONFIG.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: current.resetTime - now,
        };
    }

    current.count++;
    return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.maxRequests - current.count,
        resetIn: current.resetTime - now,
    };
}

// ===========================================
// Request Types
// ===========================================
interface TransactionRequest {
    orderId: string;
    amount: number;
    itemName: string;
    customerEmail: string;
    customerName: string;
    paymentMethod?: string;
}

// ===========================================
// Main Handler
// ===========================================
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

        // Server-side rate limiting
        const rateLimit = checkRateLimit(user.id);
        if (!rateLimit.allowed) {
            const retryAfter = Math.ceil(rateLimit.resetIn / 1000);
            return new Response(
                JSON.stringify({
                    error: "Rate limit exceeded",
                    retryAfter: retryAfter,
                    message: `Too many requests. Please try again in ${retryAfter} seconds.`,
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                        "Retry-After": String(retryAfter),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
                    },
                    status: 429,
                }
            );
        }

        // Parse request body
        const body: TransactionRequest = await req.json();
        const { orderId, amount, itemName, customerEmail, customerName, paymentMethod } = body;

        if (!orderId || !amount || !itemName) {
            throw new Error("Missing required fields: orderId, amount, itemName");
        }

        // Validate amount is positive integer
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error("Amount must be a positive integer");
        }

        // Build Midtrans transaction payload
        const transactionPayload: {
            transaction_details: { order_id: string; gross_amount: number };
            item_details: { id: string; price: number; quantity: number; name: string }[];
            customer_details: { email: string; first_name: string };
            callbacks: { finish: string; error: string; pending: string };
            enabled_payments?: string[];
        } = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            item_details: [
                {
                    id: "subscription",
                    price: amount,
                    quantity: 1,
                    name: itemName.slice(0, 50), // Midtrans limit
                },
            ],
            customer_details: {
                email: customerEmail || user.email || "",
                first_name: (customerName || "Customer").slice(0, 20),
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
                transactionPayload.enabled_payments = paymentMethods[paymentMethod];
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
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                    "X-RateLimit-Remaining": String(rateLimit.remaining),
                },
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


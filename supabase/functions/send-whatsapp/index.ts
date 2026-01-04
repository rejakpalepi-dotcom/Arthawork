// WhatsApp Business API Edge Function
// Sends messages via Meta's WhatsApp Cloud API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendMessageRequest {
    to: string; // Phone number in international format (e.g., 6281234567890)
    template?: string; // Template name for template messages
    message?: string; // Text message (for non-template messages)
    type: "text" | "template";
    templateParams?: string[]; // Parameters for template
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
            throw new Error("WhatsApp credentials not configured");
        }

        const body: SendMessageRequest = await req.json();
        const { to, type, message, template, templateParams } = body;

        // Format phone number (remove leading 0, add 62 for Indonesia)
        let formattedPhone = to.replace(/\D/g, "");
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "62" + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith("62") && formattedPhone.length <= 12) {
            formattedPhone = "62" + formattedPhone;
        }

        // Build request body based on message type
        let messageBody: Record<string, unknown>;

        if (type === "template" && template) {
            // Template message
            messageBody = {
                messaging_product: "whatsapp",
                to: formattedPhone,
                type: "template",
                template: {
                    name: template,
                    language: {
                        code: "id", // Indonesian
                    },
                    components: templateParams
                        ? [
                            {
                                type: "body",
                                parameters: templateParams.map((param) => ({
                                    type: "text",
                                    text: param,
                                })),
                            },
                        ]
                        : undefined,
                },
            };
        } else {
            // Text message
            messageBody = {
                messaging_product: "whatsapp",
                to: formattedPhone,
                type: "text",
                text: {
                    body: message || "Hello from Artha!",
                },
            };
        }

        // Send to WhatsApp Cloud API
        const whatsappResponse = await fetch(
            `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(messageBody),
            }
        );

        const result = await whatsappResponse.json();

        if (!whatsappResponse.ok) {
            console.error("WhatsApp API error:", result);
            throw new Error(result.error?.message || "Failed to send WhatsApp message");
        }

        return new Response(
            JSON.stringify({
                success: true,
                messageId: result.messages?.[0]?.id,
                to: formattedPhone,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error sending WhatsApp:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});

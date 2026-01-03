// Supabase Edge Function: Send Invoice Email
// Uses Resend API to send professional invoice emails to clients

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  invoiceId: string;
  recipientEmail: string;
  recipientName: string;
  paymentLink?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log("Received request body:", JSON.stringify(body));

    const { invoiceId, recipientEmail, recipientName, paymentLink } = body as InvoiceEmailRequest;
    console.log("Parsed fields - invoiceId:", invoiceId, "recipientEmail:", recipientEmail);

    if (!invoiceId || !recipientEmail) {
      console.error("Missing fields - invoiceId:", invoiceId, "recipientEmail:", recipientEmail);
      throw new Error("Missing required fields: invoiceId and recipientEmail");
    }

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        total,
        issue_date,
        due_date,
        payment_token,
        user_id
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error("Invoice not found");
    }

    // Fetch business settings
    const { data: settings } = await supabase
      .from("business_settings")
      .select("business_name, email, logo_url, bank_name, account_number, account_name")
      .eq("user_id", invoice.user_id)
      .single();

    const businessName = settings?.business_name || "Your Business";
    const businessEmail = settings?.email || "noreply@arthawork.com";
    const logoUrl = settings?.logo_url || "https://arthawork.vercel.app/icon-512.png";

    // Format currency
    const formatIDR = (amount: number) =>
      new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);

    // Generate payment link
    const payLink = paymentLink || `https://arthawork.vercel.app/pay/${invoice.payment_token}`;

    // Email HTML template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice from ${businessName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 32px; text-align: center;">
              <img src="${logoUrl}" alt="${businessName}" style="width: 60px; height: 60px; border-radius: 12px; margin-bottom: 16px;">
              <h1 style="color: #00D9FF; margin: 0; font-size: 24px; font-weight: bold;">Invoice from ${businessName}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                Hi ${recipientName || "there"},
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
                You have received a new invoice. Please find the details below:
              </p>
              
              <!-- Invoice Summary Card -->
              <table width="100%" style="background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%">
                      <tr>
                        <td style="color: #6b7280; font-size: 12px; text-transform: uppercase; padding-bottom: 8px;">Invoice Number</td>
                        <td style="color: #6b7280; font-size: 12px; text-transform: uppercase; padding-bottom: 8px; text-align: right;">Amount Due</td>
                      </tr>
                      <tr>
                        <td style="color: #111827; font-size: 18px; font-weight: 600; font-family: monospace;">#${invoice.invoice_number}</td>
                        <td style="color: #00D9FF; font-size: 24px; font-weight: bold; text-align: right; font-family: monospace;">${formatIDR(invoice.total)}</td>
                      </tr>
                    </table>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
                    <table width="100%">
                      <tr>
                        <td style="color: #6b7280; font-size: 12px;">Issue Date</td>
                        <td style="color: #374151; font-size: 14px; text-align: right;">${new Date(invoice.issue_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                      </tr>
                      ${invoice.due_date ? `
                      <tr>
                        <td style="color: #6b7280; font-size: 12px; padding-top: 8px;">Due Date</td>
                        <td style="color: #374151; font-size: 14px; text-align: right; padding-top: 8px;">${new Date(invoice.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${payLink}" style="display: inline-block; background: linear-gradient(135deg, #00D9FF 0%, #00B8D9 100%); color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,217,255,0.3);">
                      View & Pay Invoice →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Payment Info -->
              ${settings?.bank_name ? `
              <table width="100%" style="background-color: #f0fdfa; border-radius: 12px; margin-top: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #0d9488; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 12px 0;">Bank Transfer Details</p>
                    <p style="color: #374151; font-size: 14px; margin: 4px 0;"><strong>Bank:</strong> ${settings.bank_name}</p>
                    ${settings.account_number ? `<p style="color: #374151; font-size: 14px; margin: 4px 0;"><strong>Account:</strong> ${settings.account_number}</p>` : ""}
                    ${settings.account_name ? `<p style="color: #374151; font-size: 14px; margin: 4px 0;"><strong>Name:</strong> ${settings.account_name}</p>` : ""}
                  </td>
                </tr>
              </table>
              ` : ""}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This invoice was sent by ${businessName} via <a href="https://arthawork.vercel.app" style="color: #00D9FF; text-decoration: none;">Artha</a>
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0;">
                If you have questions, reply to ${businessEmail}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${businessName} <onboarding@resend.dev>`, // Use verified domain in production
        to: [recipientEmail],
        subject: `Invoice #${invoice.invoice_number} from ${businessName}`,
        html: emailHtml,
        reply_to: businessEmail,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);
      throw new Error(resendData.message || "Failed to send email");
    }

    // Update invoice status to 'sent'
    await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", invoiceId);

    // Log audit event
    await supabase.rpc("log_audit_event", {
      p_action: "invoice_email_sent",
      p_table_name: "invoices",
      p_record_id: invoiceId,
      p_new_data: { recipient: recipientEmail, resend_id: resendData.id },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invoice sent successfully",
        emailId: resendData.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});

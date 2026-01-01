/**
 * Email Notification Service
 * Sends transactional emails via Supabase Edge Functions
 */

import { supabase } from "@/integrations/supabase/client";

export type EmailTemplate =
    | "invoice_sent"
    | "invoice_reminder"
    | "invoice_paid"
    | "proposal_sent"
    | "proposal_accepted"
    | "welcome";

interface SendEmailParams {
    template: EmailTemplate;
    to: string;
    data: Record<string, unknown>;
}

interface InvoiceSentData {
    clientName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    paymentLink: string;
}

interface InvoiceReminderData {
    clientName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    daysOverdue?: number;
    paymentLink: string;
}

interface InvoicePaidData {
    clientName: string;
    invoiceNumber: string;
    amount: string;
    paymentDate: string;
}

interface ProposalSentData {
    clientName: string;
    proposalTitle: string;
    viewLink: string;
}

interface WelcomeData {
    userName: string;
}

/**
 * Send email notification via Edge Function
 */
export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await supabase.functions.invoke("send-email", {
            body: params,
        });

        if (error) {
            console.error("[Email] Failed to send:", error);
            return { success: false, error: error.message };
        }

        if (import.meta.env.DEV) {
            console.log("[Email] Sent successfully:", params.template);
        }
        return { success: true };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Email] Error:", err);
        return { success: false, error: message };
    }
}

/**
 * Send invoice notification to client
 */
export async function sendInvoiceSentEmail(
    to: string,
    data: InvoiceSentData
): Promise<{ success: boolean; error?: string }> {
    return sendEmail({
        template: "invoice_sent",
        to,
        data,
    });
}

/**
 * Send invoice reminder
 */
export async function sendInvoiceReminderEmail(
    to: string,
    data: InvoiceReminderData
): Promise<{ success: boolean; error?: string }> {
    return sendEmail({
        template: "invoice_reminder",
        to,
        data,
    });
}

/**
 * Send invoice paid confirmation
 */
export async function sendInvoicePaidEmail(
    to: string,
    data: InvoicePaidData
): Promise<{ success: boolean; error?: string }> {
    return sendEmail({
        template: "invoice_paid",
        to,
        data,
    });
}

/**
 * Send proposal notification
 */
export async function sendProposalSentEmail(
    to: string,
    data: ProposalSentData
): Promise<{ success: boolean; error?: string }> {
    return sendEmail({
        template: "proposal_sent",
        to,
        data,
    });
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
    to: string,
    data: WelcomeData
): Promise<{ success: boolean; error?: string }> {
    return sendEmail({
        template: "welcome",
        to,
        data,
    });
}

/**
 * Email template content (for reference / Edge Function)
 */
export const EMAIL_TEMPLATES = {
    invoice_sent: {
        subject: "Invoice dari {{businessName}}",
        preview: "Anda menerima invoice #{invoiceNumber}",
    },
    invoice_reminder: {
        subject: "Pengingat: Invoice #{invoiceNumber} jatuh tempo",
        preview: "Invoice Anda menunggu pembayaran",
    },
    invoice_paid: {
        subject: "Pembayaran Diterima - Invoice #{invoiceNumber}",
        preview: "Terima kasih atas pembayaran Anda",
    },
    proposal_sent: {
        subject: "Proposal Baru: {proposalTitle}",
        preview: "Anda menerima proposal baru",
    },
    welcome: {
        subject: "Selamat Datang di Artha! 🎉",
        preview: "Mulai buat invoice profesional",
    },
};

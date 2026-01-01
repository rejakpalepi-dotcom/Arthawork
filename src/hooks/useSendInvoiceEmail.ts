import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendInvoiceEmailParams {
    invoiceId: string;
    recipientEmail: string;
    recipientName?: string;
}

export function useSendInvoiceEmail() {
    const [sending, setSending] = useState(false);

    const sendInvoiceEmail = async ({ invoiceId, recipientEmail, recipientName }: SendInvoiceEmailParams) => {
        if (!recipientEmail) {
            toast.error("Client email is required to send invoice");
            return { success: false, error: "Missing recipient email" };
        }

        setSending(true);

        try {
            const { data, error } = await supabase.functions.invoke("send-invoice-email", {
                body: {
                    invoiceId,
                    recipientEmail,
                    recipientName,
                },
            });

            if (error) {
                throw new Error(error.message);
            }

            if (!data.success) {
                throw new Error(data.error || "Failed to send email");
            }

            toast.success("Invoice sent successfully!", {
                description: `Email sent to ${recipientEmail}`,
            });

            return { success: true, emailId: data.emailId };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to send email";
            console.error("Send invoice email error:", error);
            toast.error("Failed to send invoice", {
                description: message,
            });
            return { success: false, error: message };
        } finally {
            setSending(false);
        }
    };

    return { sendInvoiceEmail, sending };
}

/**
 * WhatsApp Integration Utilities
 * Deep link based - no API costs!
 */

/**
 * Format phone number to WhatsApp format (remove spaces, dashes, leading 0)
 */
export function formatWhatsAppNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 62 (Indonesia)
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
    }

    // If doesn't start with country code, assume Indonesia
    if (!cleaned.startsWith('62') && cleaned.length <= 12) {
        cleaned = '62' + cleaned;
    }

    return cleaned;
}

/**
 * Generate WhatsApp deep link
 */
export function getWhatsAppLink(phone: string, message: string): string {
    const formattedPhone = formatWhatsAppNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

/**
 * Open WhatsApp with pre-filled message (deep link fallback)
 */
export function sendWhatsApp(phone: string, message: string): void {
    const link = getWhatsAppLink(phone, message);
    window.open(link, '_blank');
}

/**
 * Send WhatsApp message via official API (Edge Function)
 * Falls back to deep link if API fails
 */
export async function sendWhatsAppAPI(
    phone: string,
    message: string,
    options?: { fallbackToDeepLink?: boolean }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({
                    to: phone,
                    type: 'text',
                    message,
                }),
            }
        );

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to send');
        }

        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('WhatsApp API error, using fallback:', error);

        // Fallback to deep link if enabled
        if (options?.fallbackToDeepLink !== false) {
            sendWhatsApp(phone, message);
            return { success: true, error: 'Used deep link fallback' };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}


/**
 * Generate invoice reminder message
 */
export function getInvoiceReminderMessage(
    clientName: string,
    invoiceNumber: string,
    amount: number,
    dueDate: string,
    paymentLink?: string,
    businessName?: string
): string {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);

    const studioName = businessName || 'Tim Kami';

    let message = `Halo ${clientName} 👋

Semoga harimu menyenangkan! Kami dari *${studioName}* ingin mengirimkan invoice untuk project yang sedang berjalan.

━━━━━━━━━━━━━━━━
📄 *INVOICE ${invoiceNumber}*
━━━━━━━━━━━━━━━━

💰 *Total:* ${formattedAmount}
📅 *Jatuh Tempo:* ${dueDate}`;

    if (paymentLink) {
        message += `

🔗 *Lihat & Bayar Invoice:*
${paymentLink}

_Klik link di atas untuk melihat detail invoice dan melakukan pembayaran._`;
    }

    message += `

Jangan ragu untuk menghubungi kami jika ada pertanyaan.

Terima kasih atas kerjasamanya! 🙏

Salam hangat,
*${studioName}*`;

    return message;
}

/**
 * Generate proposal follow-up message
 */
export function getProposalFollowUpMessage(
    clientName: string,
    proposalTitle: string,
    validUntil?: string
): string {
    let message = `Halo ${clientName} 👋

Saya ingin follow up mengenai proposal *"${proposalTitle}"* yang sudah saya kirimkan.

Apakah ada pertanyaan atau hal yang perlu didiskusikan lebih lanjut?`;

    if (validUntil) {
        message += `

⏰ Proposal berlaku hingga: ${validUntil}`;
    }

    message += `

Terima kasih!
_Dikirim via Artha_`;

    return message;
}

/**
 * Generate contract reminder message
 */
export function getContractReminderMessage(
    clientName: string,
    contractTitle: string,
    dpAmount: number,
    contractLink: string
): string {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(dpAmount);

    return `Halo ${clientName} 👋

Kontrak *"${contractTitle}"* sudah siap untuk ditandatangani!

💰 DP yang perlu dibayar: *${formattedAmount}*

📝 Silahkan klik link berikut untuk review dan tanda tangan:
${contractLink}

Terima kasih!
_Dikirim via Artha_`;
}

/**
 * Generate project update message
 */
export function getProjectUpdateMessage(
    clientName: string,
    projectTitle: string,
    portalLink: string
): string {
    return `Halo ${clientName} 👋

Ada update terbaru untuk proyek *"${projectTitle}"*! 🎨

Silahkan cek di portal klien:
${portalLink}

Anda bisa langsung klik pada gambar untuk memberikan feedback.

Terima kasih!
_Dikirim via Artha_`;
}

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
 * Open WhatsApp with pre-filled message
 */
export function sendWhatsApp(phone: string, message: string): void {
    const link = getWhatsAppLink(phone, message);
    window.open(link, '_blank');
}

/**
 * Generate invoice reminder message
 */
export function getInvoiceReminderMessage(
    clientName: string,
    invoiceNumber: string,
    amount: number,
    dueDate: string,
    paymentLink?: string
): string {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);

    let message = `Halo ${clientName} 👋

Ini adalah pengingat untuk invoice *${invoiceNumber}* dengan total *${formattedAmount}*.

📅 Jatuh tempo: ${dueDate}`;

    if (paymentLink) {
        message += `

💳 Link pembayaran:
${paymentLink}`;
    }

    message += `

Terima kasih!
_Dikirim via Artha_`;

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

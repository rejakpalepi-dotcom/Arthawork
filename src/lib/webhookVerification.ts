import crypto from "crypto";

/**
 * Webhook Signature Verification for Midtrans
 * 
 * Midtrans uses a specific signature format:
 * SHA512(order_id + status_code + gross_amount + server_key)
 */

interface MidtransNotification {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
    transaction_status: string;
    fraud_status: string;
    payment_type: string;
}

/**
 * Verify Midtrans webhook signature
 * This should be called from a Supabase Edge Function for security
 */
export function verifyMidtransSignature(
    notification: MidtransNotification,
    serverKey: string
): boolean {
    const { order_id, status_code, gross_amount, signature_key } = notification;

    // Compute expected signature
    const dataToHash = order_id + status_code + gross_amount + serverKey;
    const expectedSignature = crypto
        .createHash("sha512")
        .update(dataToHash)
        .digest("hex");

    return expectedSignature === signature_key;
}

/**
 * Generic webhook signature verification using HMAC
 * For other payment providers or custom webhooks
 */
export function verifyHmacSignature(
    payload: string,
    signature: string,
    secret: string,
    algorithm: "sha256" | "sha512" = "sha256"
): boolean {
    const expectedSignature = crypto
        .createHmac(algorithm, secret)
        .update(payload)
        .digest("hex");

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Verify timestamp to prevent replay attacks
 * Webhooks should be rejected if timestamp is too old
 */
export function verifyWebhookTimestamp(
    timestamp: number | string,
    maxAgeSeconds: number = 300 // 5 minutes
): boolean {
    const webhookTime = typeof timestamp === "string"
        ? parseInt(timestamp, 10)
        : timestamp;

    const now = Math.floor(Date.now() / 1000);
    const age = now - webhookTime;

    return age >= 0 && age <= maxAgeSeconds;
}

/**
 * IP Whitelist validation
 * Midtrans IP ranges should be verified
 */
const MIDTRANS_IP_WHITELIST = [
    // Production IPs
    "103.208.23.0/24",
    "103.208.23.0",
    "103.127.16.0/24",
    // Sandbox IPs
    "103.58.103.0/24",
];

export function isIPWhitelisted(ip: string, whitelist: string[] = MIDTRANS_IP_WHITELIST): boolean {
    return whitelist.some((allowed) => {
        if (allowed.includes("/")) {
            // CIDR range check (simplified)
            const [range, bits] = allowed.split("/");
            const rangeParts = range.split(".").map(Number);
            const ipParts = ip.split(".").map(Number);
            const mask = parseInt(bits, 10);
            const fullBytes = Math.floor(mask / 8);

            for (let i = 0; i < fullBytes; i++) {
                if (rangeParts[i] !== ipParts[i]) return false;
            }
            return true;
        }
        return ip === allowed;
    });
}

/**
 * Complete webhook verification
 */
export interface WebhookVerificationResult {
    valid: boolean;
    errors: string[];
}

export function verifyWebhook(
    notification: MidtransNotification,
    serverKey: string,
    sourceIP?: string
): WebhookVerificationResult {
    const errors: string[] = [];

    // Verify signature
    if (!verifyMidtransSignature(notification, serverKey)) {
        errors.push("Invalid signature");
    }

    // Verify IP if provided
    if (sourceIP && !isIPWhitelisted(sourceIP)) {
        errors.push(`IP ${sourceIP} not in whitelist`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

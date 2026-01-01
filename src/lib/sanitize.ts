/**
 * HTML Sanitization Utilities
 * Prevents XSS attacks when rendering user-generated content in HTML
 */

/**
 * Escape HTML special characters to prevent XSS
 * Use this when inserting user data into innerHTML
 */
export function escapeHtml(text: string | null | undefined): string {
    if (text == null) return "";

    const htmlEscapes: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;",
    };

    return String(text).replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char]);
}

/**
 * Sanitize a URL to prevent javascript: and data: protocol attacks
 */
export function sanitizeUrl(url: string | null | undefined): string {
    if (!url) return "";

    const trimmedUrl = url.trim().toLowerCase();

    // Block dangerous protocols
    if (
        trimmedUrl.startsWith("javascript:") ||
        trimmedUrl.startsWith("data:") ||
        trimmedUrl.startsWith("vbscript:")
    ) {
        return "";
    }

    return url;
}

/**
 * Sanitize user content for safe HTML rendering
 * Combines multiple sanitization strategies
 */
export function sanitizeContent(content: string | null | undefined): string {
    if (!content) return "";

    // First escape HTML entities
    let sanitized = escapeHtml(content);

    // Preserve newlines for display
    sanitized = sanitized.replace(/\n/g, "<br>");

    return sanitized;
}

/**
 * Sanitize an object's string values for HTML rendering
 * Useful for sanitizing entire invoice/client objects
 */
export function sanitizeObject<T extends Record<string, unknown>>(
    obj: T
): T {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
            result[key] = escapeHtml(value);
        } else if (value && typeof value === "object" && !Array.isArray(value)) {
            result[key] = sanitizeObject(value as Record<string, unknown>);
        } else {
            result[key] = value;
        }
    }

    return result as T;
}

/**
 * Create safe HTML content from template literals
 * Usage: safeHtml`<p>${userInput}</p>`
 */
export function safeHtml(
    strings: TemplateStringsArray,
    ...values: (string | number | null | undefined)[]
): string {
    return strings.reduce((result, str, i) => {
        const value = values[i - 1];
        const escaped = typeof value === "number" ? String(value) : escapeHtml(value);
        return result + escaped + str;
    });
}

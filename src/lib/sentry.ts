/**
 * Sentry Error Logging Configuration
 * Initialize in main.tsx
 */

import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || "";
const IS_PRODUCTION = import.meta.env.PROD;

/**
 * Initialize Sentry error tracking
 */
export function initSentry() {
    if (!SENTRY_DSN) {
        if (import.meta.env.DEV) {
            console.log("[Sentry] No DSN configured, skipping initialization");
        }
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: IS_PRODUCTION ? "production" : "development",

        // Performance monitoring
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: false,
                blockAllMedia: false,
            }),
        ],

        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

        // Session Replay
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

        // Filter out known non-issues
        beforeSend(event) {
            // Ignore network errors
            if (event.exception?.values?.[0]?.value?.includes("Failed to fetch")) {
                return null;
            }
            // Ignore ResizeObserver errors (common in React)
            if (event.exception?.values?.[0]?.value?.includes("ResizeObserver")) {
                return null;
            }
            return event;
        },
    });

    if (import.meta.env.DEV) {
        console.log("[Sentry] Initialized for", IS_PRODUCTION ? "production" : "development");
    }
}

/**
 * Set user context after login
 */
export function setSentryUser(user: { id: string; email?: string; name?: string }) {
    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
    });
}

/**
 * Clear user context after logout
 */
export function clearSentryUser() {
    Sentry.setUser(null);
}

/**
 * Capture a custom error
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
    Sentry.captureException(error, {
        extra: context,
    });
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
    Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(category: string, message: string, data?: Record<string, unknown>) {
    Sentry.addBreadcrumb({
        category,
        message,
        data,
        level: "info",
    });
}

// Export Sentry ErrorBoundary for use in components
export { Sentry };

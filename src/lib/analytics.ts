/**
 * Analytics Service
 * Supports PostHog and Google Analytics
 * Configure via environment variables
 */

// PostHog config
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

// GA4 config
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

// PostHog types
interface PostHogWindow {
    posthog?: {
        init: (key: string, config: object) => void;
        capture: (event: string, properties?: object) => void;
        identify: (userId: string, properties?: object) => void;
        reset: () => void;
    };
}

// GA4 types
interface GtagWindow {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
}

declare const window: Window & PostHogWindow & GtagWindow;

/**
 * Initialize analytics services
 * Call this once in main.tsx
 */
export function initAnalytics() {
    // Initialize PostHog
    if (POSTHOG_KEY) {
        const script = document.createElement("script");
        script.innerHTML = `
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('${POSTHOG_KEY}', {api_host: '${POSTHOG_HOST}'});
    `;
        document.head.appendChild(script);
    }

    // Initialize Google Analytics
    if (GA_MEASUREMENT_ID) {
        // Load gtag script
        const gaScript = document.createElement("script");
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(gaScript);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(...args: unknown[]) {
            window.dataLayer!.push(args);
        };
        window.gtag("js", new Date());
        window.gtag("config", GA_MEASUREMENT_ID);
    }

    console.log("[Analytics] Initialized", {
        posthog: !!POSTHOG_KEY,
        ga4: !!GA_MEASUREMENT_ID,
    });
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
    // PostHog
    if (window.posthog) {
        window.posthog.capture(eventName, properties);
    }

    // GA4
    if (window.gtag) {
        window.gtag("event", eventName, properties);
    }

    console.log("[Analytics] Event:", eventName, properties);
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
    // PostHog automatically tracks page views

    // GA4
    if (window.gtag) {
        window.gtag("event", "page_view", {
            page_path: path,
            page_title: title,
        });
    }

    console.log("[Analytics] Page View:", path);
}

/**
 * Identify user (after login)
 */
export function identifyUser(userId: string, properties?: {
    email?: string;
    name?: string;
    tier?: string;
}) {
    // PostHog
    if (window.posthog) {
        window.posthog.identify(userId, properties);
    }

    // GA4 - set user ID
    if (window.gtag) {
        window.gtag("config", GA_MEASUREMENT_ID, {
            user_id: userId,
        });
        if (properties) {
            window.gtag("set", "user_properties", properties);
        }
    }

    console.log("[Analytics] Identify:", userId, properties);
}

/**
 * Reset user (after logout)
 */
export function resetUser() {
    if (window.posthog) {
        window.posthog.reset();
    }
    console.log("[Analytics] User reset");
}

/**
 * Predefined event names for consistency
 */
export const AnalyticsEvents = {
    // Auth
    SIGNUP_STARTED: "signup_started",
    SIGNUP_COMPLETED: "signup_completed",
    LOGIN: "login",
    LOGOUT: "logout",

    // Invoice
    INVOICE_CREATED: "invoice_created",
    INVOICE_SENT: "invoice_sent",
    INVOICE_PAID: "invoice_paid",
    INVOICE_EXPORTED: "invoice_exported",

    // Proposal
    PROPOSAL_CREATED: "proposal_created",
    PROPOSAL_SENT: "proposal_sent",
    PROPOSAL_ACCEPTED: "proposal_accepted",

    // Client
    CLIENT_ADDED: "client_added",

    // Subscription
    UPGRADE_STARTED: "upgrade_started",
    UPGRADE_COMPLETED: "upgrade_completed",
    SUBSCRIPTION_CANCELLED: "subscription_cancelled",

    // Feature Usage
    FEATURE_USED: "feature_used",
    GLOBAL_SEARCH_USED: "global_search_used",
    PDF_EXPORTED: "pdf_exported",
};

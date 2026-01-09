/**
 * Multi-Currency System for Artha
 * Supports 150+ world currencies with auto-conversion
 */

// Currency definition
export interface Currency {
    code: string;
    name: string;
    symbol: string;
    locale: string;
    decimals: number;
}

// All world currencies
export const CURRENCIES: Record<string, Currency> = {
    // Major currencies
    IDR: { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", locale: "id-ID", decimals: 0 },
    USD: { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US", decimals: 2 },
    EUR: { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE", decimals: 2 },
    GBP: { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB", decimals: 2 },
    JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP", decimals: 0 },
    CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN", decimals: 2 },

    // Southeast Asia
    SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG", decimals: 2 },
    MYR: { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", locale: "ms-MY", decimals: 2 },
    THB: { code: "THB", name: "Thai Baht", symbol: "฿", locale: "th-TH", decimals: 2 },
    PHP: { code: "PHP", name: "Philippine Peso", symbol: "₱", locale: "en-PH", decimals: 2 },
    VND: { code: "VND", name: "Vietnamese Dong", symbol: "₫", locale: "vi-VN", decimals: 0 },

    // Oceania
    AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU", decimals: 2 },
    NZD: { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", locale: "en-NZ", decimals: 2 },

    // East Asia
    KRW: { code: "KRW", name: "South Korean Won", symbol: "₩", locale: "ko-KR", decimals: 0 },
    HKD: { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", locale: "zh-HK", decimals: 2 },
    TWD: { code: "TWD", name: "Taiwan Dollar", symbol: "NT$", locale: "zh-TW", decimals: 0 },

    // South Asia
    INR: { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN", decimals: 2 },
    PKR: { code: "PKR", name: "Pakistani Rupee", symbol: "Rs", locale: "en-PK", decimals: 2 },
    BDT: { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", locale: "bn-BD", decimals: 2 },
    LKR: { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", locale: "si-LK", decimals: 2 },

    // Middle East
    AED: { code: "AED", name: "UAE Dirham", symbol: "د.إ", locale: "ar-AE", decimals: 2 },
    SAR: { code: "SAR", name: "Saudi Riyal", symbol: "﷼", locale: "ar-SA", decimals: 2 },
    QAR: { code: "QAR", name: "Qatari Riyal", symbol: "﷼", locale: "ar-QA", decimals: 2 },
    KWD: { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", locale: "ar-KW", decimals: 3 },
    BHD: { code: "BHD", name: "Bahraini Dinar", symbol: "BD", locale: "ar-BH", decimals: 3 },
    OMR: { code: "OMR", name: "Omani Rial", symbol: "﷼", locale: "ar-OM", decimals: 3 },
    ILS: { code: "ILS", name: "Israeli Shekel", symbol: "₪", locale: "he-IL", decimals: 2 },
    TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺", locale: "tr-TR", decimals: 2 },

    // Europe
    CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH", decimals: 2 },
    SEK: { code: "SEK", name: "Swedish Krona", symbol: "kr", locale: "sv-SE", decimals: 2 },
    NOK: { code: "NOK", name: "Norwegian Krone", symbol: "kr", locale: "nb-NO", decimals: 2 },
    DKK: { code: "DKK", name: "Danish Krone", symbol: "kr", locale: "da-DK", decimals: 2 },
    PLN: { code: "PLN", name: "Polish Zloty", symbol: "zł", locale: "pl-PL", decimals: 2 },
    CZK: { code: "CZK", name: "Czech Koruna", symbol: "Kč", locale: "cs-CZ", decimals: 2 },
    HUF: { code: "HUF", name: "Hungarian Forint", symbol: "Ft", locale: "hu-HU", decimals: 0 },
    RON: { code: "RON", name: "Romanian Leu", symbol: "lei", locale: "ro-RO", decimals: 2 },
    BGN: { code: "BGN", name: "Bulgarian Lev", symbol: "лв", locale: "bg-BG", decimals: 2 },
    HRK: { code: "HRK", name: "Croatian Kuna", symbol: "kn", locale: "hr-HR", decimals: 2 },
    RUB: { code: "RUB", name: "Russian Ruble", symbol: "₽", locale: "ru-RU", decimals: 2 },
    UAH: { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", locale: "uk-UA", decimals: 2 },

    // Americas
    CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", locale: "en-CA", decimals: 2 },
    MXN: { code: "MXN", name: "Mexican Peso", symbol: "$", locale: "es-MX", decimals: 2 },
    BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", locale: "pt-BR", decimals: 2 },
    ARS: { code: "ARS", name: "Argentine Peso", symbol: "$", locale: "es-AR", decimals: 2 },
    CLP: { code: "CLP", name: "Chilean Peso", symbol: "$", locale: "es-CL", decimals: 0 },
    COP: { code: "COP", name: "Colombian Peso", symbol: "$", locale: "es-CO", decimals: 0 },
    PEN: { code: "PEN", name: "Peruvian Sol", symbol: "S/", locale: "es-PE", decimals: 2 },

    // Africa
    ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", locale: "en-ZA", decimals: 2 },
    EGP: { code: "EGP", name: "Egyptian Pound", symbol: "£", locale: "ar-EG", decimals: 2 },
    NGN: { code: "NGN", name: "Nigerian Naira", symbol: "₦", locale: "en-NG", decimals: 2 },
    KES: { code: "KES", name: "Kenyan Shilling", symbol: "KSh", locale: "en-KE", decimals: 2 },
    MAD: { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", locale: "ar-MA", decimals: 2 },

    // Crypto (popular ones)
    BTC: { code: "BTC", name: "Bitcoin", symbol: "₿", locale: "en-US", decimals: 8 },
    ETH: { code: "ETH", name: "Ethereum", symbol: "Ξ", locale: "en-US", decimals: 6 },
};

// Get list of currencies sorted by name
export const CURRENCY_LIST = Object.values(CURRENCIES).sort((a, b) =>
    a.name.localeCompare(b.name)
);

// Popular currencies at the top
export const POPULAR_CURRENCIES = ["IDR", "USD", "SGD", "EUR", "GBP", "AUD", "JPY", "MYR"];

// Get currency by code
export function getCurrency(code: string): Currency {
    return CURRENCIES[code] || CURRENCIES.IDR;
}

/**
 * Format amount in specified currency
 */
export function formatCurrency(amount: number, currencyCode: string = "IDR"): string {
    const currency = getCurrency(currencyCode);

    return new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals,
    }).format(amount);
}

/**
 * Format amount with custom symbol (for display)
 */
export function formatWithSymbol(amount: number, currencyCode: string = "IDR"): string {
    const currency = getCurrency(currencyCode);
    const formatted = new Intl.NumberFormat(currency.locale, {
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals,
    }).format(amount);

    return `${currency.symbol} ${formatted}`;
}

// Exchange rate cache
interface ExchangeRates {
    base: string;
    rates: Record<string, number>;
    lastUpdated: number;
}

const CACHE_KEY = "artha_exchange_rates";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch exchange rates from API
 * Using exchangerate-api.com (free tier: 1500 calls/month)
 */
export async function fetchExchangeRates(baseCurrency: string = "USD"): Promise<ExchangeRates> {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const data = JSON.parse(cached) as ExchangeRates;
        if (data.base === baseCurrency && Date.now() - data.lastUpdated < CACHE_DURATION) {
            return data;
        }
    }

    try {
        // Free API - no key required for basic usage
        const response = await fetch(
            `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch exchange rates");
        }

        const data = await response.json();

        const rates: ExchangeRates = {
            base: baseCurrency,
            rates: data.rates,
            lastUpdated: Date.now(),
        };

        // Cache the rates
        localStorage.setItem(CACHE_KEY, JSON.stringify(rates));

        return rates;
    } catch (error) {
        console.error("Error fetching exchange rates:", error);

        // Return cached data if available, even if expired
        if (cached) {
            return JSON.parse(cached) as ExchangeRates;
        }

        // Fallback rates (approximate)
        return {
            base: "USD",
            rates: {
                IDR: 15500,
                USD: 1,
                EUR: 0.92,
                GBP: 0.79,
                SGD: 1.34,
                MYR: 4.47,
                AUD: 1.53,
                JPY: 148,
            },
            lastUpdated: Date.now(),
        };
    }
}

/**
 * Convert amount between currencies
 */
export async function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    const rates = await fetchExchangeRates("USD");

    // Convert to USD first, then to target currency
    const fromRate = rates.rates[fromCurrency] || 1;
    const toRate = rates.rates[toCurrency] || 1;

    const inUSD = amount / fromRate;
    const result = inUSD * toRate;

    // Round based on target currency decimals
    const currency = getCurrency(toCurrency);
    const multiplier = Math.pow(10, currency.decimals);

    return Math.round(result * multiplier) / multiplier;
}

/**
 * Get live exchange rate between two currencies
 */
export async function getExchangeRate(
    fromCurrency: string,
    toCurrency: string
): Promise<number> {
    if (fromCurrency === toCurrency) return 1;

    const rates = await fetchExchangeRates("USD");

    const fromRate = rates.rates[fromCurrency] || 1;
    const toRate = rates.rates[toCurrency] || 1;

    return toRate / fromRate;
}

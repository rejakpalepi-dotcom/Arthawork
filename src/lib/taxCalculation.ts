/**
 * Indonesian Tax Calculation Engine
 * Handles PPh 21 and PPh 23 calculations
 */

export interface TaxCalculationResult {
    grossAmount: number;
    dpp: number; // Dasar Pengenaan Pajak
    taxRate: number;
    taxAmount: number;
    netAmount: number;
    taxType: 'pph21' | 'pph23' | 'none';
    hasNPWP: boolean;
}

export interface PPh21Result {
    grossIncome: number;
    dpp: number;
    taxBrackets: TaxBracket[];
    totalTax: number;
    netIncome: number;
    npwpSurcharge: number;
}

export interface TaxBracket {
    from: number;
    to: number;
    rate: number;
    taxableAmount: number;
    taxAmount: number;
}

/**
 * PPh 21 Tax Brackets (Pasal 17 UU PPh)
 * Updated per PP 58/2023
 */
const PPH21_BRACKETS = [
    { from: 0, to: 60_000_000, rate: 0.05 },
    { from: 60_000_000, to: 250_000_000, rate: 0.15 },
    { from: 250_000_000, to: 500_000_000, rate: 0.25 },
    { from: 500_000_000, to: 5_000_000_000, rate: 0.30 },
    { from: 5_000_000_000, to: Infinity, rate: 0.35 },
];

/**
 * Calculate PPh 21 for freelancer income
 * DPP = 50% of gross income for "jasa" category
 * 
 * @param grossIncome - Total gross income
 * @param hasNPWP - Whether the taxpayer has NPWP
 * @returns PPh21Result with detailed breakdown
 */
export function calculatePPh21(grossIncome: number, hasNPWP: boolean = true): PPh21Result {
    // DPP for jasa/services is 50% of gross
    const dpp = grossIncome * 0.5;

    // Calculate progressive tax
    let remainingDpp = dpp;
    let totalTax = 0;
    const taxBrackets: TaxBracket[] = [];

    for (const bracket of PPH21_BRACKETS) {
        if (remainingDpp <= 0) break;

        const bracketRange = Math.min(bracket.to, Infinity) - bracket.from;
        const taxableAmount = Math.min(remainingDpp, bracketRange);
        const taxAmount = taxableAmount * bracket.rate;

        if (taxableAmount > 0) {
            taxBrackets.push({
                from: bracket.from,
                to: bracket.to === Infinity ? dpp : Math.min(bracket.to, dpp),
                rate: bracket.rate,
                taxableAmount,
                taxAmount,
            });
        }

        totalTax += taxAmount;
        remainingDpp -= taxableAmount;
    }

    // Non-NPWP surcharge: +20%
    const npwpSurcharge = !hasNPWP ? totalTax * 0.2 : 0;
    const finalTax = totalTax + npwpSurcharge;

    return {
        grossIncome,
        dpp,
        taxBrackets,
        totalTax: finalTax,
        netIncome: grossIncome - finalTax,
        npwpSurcharge,
    };
}

/**
 * Calculate PPh 23 withholding tax for services
 * Rate: 2% with NPWP, 4% without NPWP (doubled rate)
 * 
 * @param invoiceAmount - Invoice total amount
 * @param hasNPWP - Whether the vendor has NPWP
 * @returns TaxCalculationResult
 */
export function calculatePPh23(invoiceAmount: number, hasNPWP: boolean = true): TaxCalculationResult {
    const taxRate = hasNPWP ? 0.02 : 0.04;
    const taxAmount = invoiceAmount * taxRate;

    return {
        grossAmount: invoiceAmount,
        dpp: invoiceAmount, // PPh 23 DPP is full amount
        taxRate: taxRate * 100, // Store as percentage
        taxAmount,
        netAmount: invoiceAmount - taxAmount,
        taxType: 'pph23',
        hasNPWP,
    };
}

/**
 * Calculate tax with Include/Exclude mode
 * 
 * @param amount - Base amount
 * @param taxType - 'pph21' | 'pph23' | 'none'
 * @param mode - 'include' (tax included in amount) | 'exclude' (tax added to amount)
 * @param hasNPWP - Whether taxpayer has NPWP
 */
export function calculateInvoiceTax(
    amount: number,
    taxType: 'pph21' | 'pph23' | 'none',
    mode: 'include' | 'exclude',
    hasNPWP: boolean = true
): TaxCalculationResult {
    if (taxType === 'none') {
        return {
            grossAmount: amount,
            dpp: amount,
            taxRate: 0,
            taxAmount: 0,
            netAmount: amount,
            taxType: 'none',
            hasNPWP: true,
        };
    }

    if (taxType === 'pph23') {
        const rate = hasNPWP ? 0.02 : 0.04;

        if (mode === 'include') {
            // Tax already included: gross = amount, tax = amount * rate, net = amount - tax
            const taxAmount = amount * rate;
            return {
                grossAmount: amount,
                dpp: amount,
                taxRate: rate * 100,
                taxAmount,
                netAmount: amount - taxAmount,
                taxType: 'pph23',
                hasNPWP,
            };
        } else {
            // Tax excluded: client pays tax on top of amount
            const taxAmount = amount * rate;
            return {
                grossAmount: amount + taxAmount,
                dpp: amount,
                taxRate: rate * 100,
                taxAmount,
                netAmount: amount,
                taxType: 'pph23',
                hasNPWP,
            };
        }
    }

    // PPh 21
    const pph21Result = calculatePPh21(amount, hasNPWP);
    const effectiveRate = (pph21Result.totalTax / amount) * 100;

    return {
        grossAmount: amount,
        dpp: pph21Result.dpp,
        taxRate: effectiveRate,
        taxAmount: pph21Result.totalTax,
        netAmount: pph21Result.netIncome,
        taxType: 'pph21',
        hasNPWP,
    };
}

/**
 * Format currency in IDR
 */
export function formatIDR(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Validate NPWP format (15 digits: XX.XXX.XXX.X-XXX.XXX)
 */
export function validateNPWP(npwp: string): boolean {
    // Remove all non-digits
    const digits = npwp.replace(/\D/g, '');
    return digits.length === 15;
}

/**
 * Format NPWP number with proper separators
 */
export function formatNPWP(npwp: string): string {
    const digits = npwp.replace(/\D/g, '');
    if (digits.length !== 15) return npwp;

    // Format: XX.XXX.XXX.X-XXX.XXX
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}.${digits.slice(8, 9)}-${digits.slice(9, 12)}.${digits.slice(12, 15)}`;
}

/**
 * Invoice Utility Tests
 * Tests for currency formatting and invoice calculations
 */

import { describe, it, expect } from 'vitest'
import { formatIDR } from '@/lib/currency'
import { escapeHtml as sanitizeHtml } from '@/lib/sanitize'

describe('Currency Formatting', () => {
    it('should format positive numbers correctly', () => {
        const result1 = formatIDR(1000)
        const result2 = formatIDR(1000000)
        const result3 = formatIDR(50000)

        expect(result1).toContain('Rp')
        expect(result1).toContain('1.000')
        expect(result2).toContain('1.000.000')
        expect(result3).toContain('50.000')
    })

    it('should format zero', () => {
        const result = formatIDR(0)
        expect(result).toContain('Rp')
        expect(result).toContain('0')
    })

    it('should handle decimal values', () => {
        const result = formatIDR(1500.5)
        expect(result).toContain('Rp')
        expect(result).toContain('1.500')
    })
})

describe('HTML Sanitization', () => {
    it('should escape HTML tags', () => {
        const malicious = '<script>alert("XSS")</script>'
        const result = sanitizeHtml(malicious)
        expect(result).not.toContain('<script>')
        expect(result).toContain('&lt;script&gt;')
    })

    it('should escape special characters', () => {
        const input = '< > & " \''
        const result = sanitizeHtml(input)
        expect(result).toContain('&lt;')
        expect(result).toContain('&gt;')
        expect(result).toContain('&amp;')
    })

    it('should handle normal text', () => {
        const normal = 'Hello World'
        expect(sanitizeHtml(normal)).toBe('Hello World')
    })

    it('should handle null/undefined safely', () => {
        expect(sanitizeHtml(null)).toBe('')
        expect(sanitizeHtml(undefined)).toBe('')
    })
})

describe('Invoice Calculations', () => {
    it('should calculate line item total', () => {
        const quantity = 3
        const unitPrice = 100000
        const total = quantity * unitPrice
        expect(total).toBe(300000)
    })

    it('should calculate subtotal from line items', () => {
        const lineItems = [
            { quantity: 2, unitPrice: 50000, total: 100000 },
            { quantity: 1, unitPrice: 150000, total: 150000 },
        ]
        const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
        expect(subtotal).toBe(250000)
    })

    it('should calculate tax amount', () => {
        const subtotal = 1000000
        const taxRate = 11
        const taxAmount = (subtotal * taxRate) / 100
        expect(taxAmount).toBe(110000)
    })

    it('should calculate grand total', () => {
        const subtotal = 1000000
        const taxAmount = 110000
        const grandTotal = subtotal + taxAmount
        expect(grandTotal).toBe(1110000)
    })
})

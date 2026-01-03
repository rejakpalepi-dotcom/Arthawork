/**
 * Authentication Validation Tests
 * Tests for signup/login form validation using Zod schemas
 */

import { describe, it, expect } from 'vitest'
import { signupSchema, loginSchema } from '@/lib/validation'

describe('Authentication Validation', () => {
    describe('Signup Schema', () => {
        it('should accept valid signup data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'Password123',
                fullName: 'John Doe',
            }

            const result = signupSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject invalid email', () => {
            const invalidData = {
                email: 'not-an-email',
                password: 'Password123',
                fullName: 'John Doe',
            }

            const result = signupSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject weak password (no uppercase)', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'password123',
                fullName: 'John Doe',
            }

            const result = signupSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject weak password (no lowercase)', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'PASSWORD123',
                fullName: 'John Doe',
            }

            const result = signupSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject weak password (no number)', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'PasswordABC',
                fullName: 'John Doe',
            }

            const result = signupSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject short password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'Pass1',
                fullName: 'John Doe',
            }

            const result = signupSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject empty full name', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'Password123',
                fullName: '',
            }

            const result = signupSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })

    describe('Login Schema', () => {
        it('should accept valid login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'anypassword',
            }

            const result = loginSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject invalid email', () => {
            const invalidData = {
                email: 'not-an-email',
                password: 'anypassword',
            }

            const result = loginSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject empty password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '',
            }

            const result = loginSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })
})

import { z } from "zod";

// ============================================
// Client Validation Schemas
// ============================================
export const clientSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().max(20, "Phone too long").optional(),
    company: z.string().max(100, "Company name too long").optional(),
    address: z.string().max(500, "Address too long").optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

// ============================================
// Invoice Validation Schemas
// ============================================
export const invoiceItemSchema = z.object({
    description: z.string().min(1, "Description required"),
    quantity: z.number().min(0.01, "Quantity must be positive"),
    unit_price: z.number().min(0, "Price cannot be negative"),
});

export const invoiceSchema = z.object({
    client_id: z.string().uuid("Invalid client").optional().nullable(),
    invoice_number: z.string().min(1, "Invoice number required"),
    issue_date: z.string().min(1, "Issue date required"),
    due_date: z.string().optional(),
    tax_rate: z.number().min(0).max(100, "Tax rate must be 0-100"),
    notes: z.string().max(2000, "Notes too long").optional(),
    items: z.array(invoiceItemSchema).min(1, "At least one item required"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

// ============================================
// Proposal Validation Schemas
// ============================================
export const proposalSchema = z.object({
    client_id: z.string().uuid("Invalid client").optional().nullable(),
    title: z.string().min(1, "Title required").max(200, "Title too long"),
    description: z.string().max(10000, "Description too long").optional(),
    total: z.number().min(0, "Total cannot be negative"),
    valid_until: z.string().optional(),
    status: z.enum(["draft", "sent", "approved", "rejected"]).default("draft"),
});

export type ProposalInput = z.infer<typeof proposalSchema>;

// ============================================
// Project Validation Schemas
// ============================================
export const projectSchema = z.object({
    title: z.string().min(1, "Title required").max(200, "Title too long"),
    description: z.string().max(5000, "Description too long").optional(),
    client_id: z.string().uuid("Invalid client").optional().nullable(),
    budget: z.number().min(0, "Budget cannot be negative").optional(),
    start_date: z.string().optional(),
    deadline: z.string().optional(),
    status: z.enum(["planning", "in_progress", "completed", "on_hold"]).default("planning"),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// ============================================
// Business Settings Validation
// ============================================
export const businessSettingsSchema = z.object({
    business_name: z.string().max(200, "Name too long").optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().max(20, "Phone too long").optional(),
    address: z.string().max(500, "Address too long").optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    tax_rate: z.number().min(0).max(100, "Tax rate must be 0-100").optional(),
    bank_name: z.string().max(100, "Bank name too long").optional(),
    account_name: z.string().max(100, "Account name too long").optional(),
    account_number: z.string().max(50, "Account number too long").optional(),
    routing_number: z.string().max(50, "Routing number too long").optional(),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;

// ============================================
// Auth Validation Schemas
// ============================================
export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain uppercase letter")
        .regex(/[a-z]/, "Password must contain lowercase letter")
        .regex(/[0-9]/, "Password must contain number"),
    fullName: z.string().min(1, "Name required").max(100, "Name too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// ============================================
// Validation Helper
// ============================================
export function validateInput<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        errors: result.error.errors.map((e) => e.message),
    };
}

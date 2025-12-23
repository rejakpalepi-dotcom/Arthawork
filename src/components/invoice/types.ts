import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  total: z.number(),
  serviceId: z.string().nullable(),
});

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  clientId: z.string().nullable(),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email").or(z.literal("")),
  clientPhone: z.string(),
  clientAddress: z.string(),
  issueDate: z.date(),
  dueDate: z.date().nullable(),
  lineItems: z.array(lineItemSchema).min(1, "At least one item is required"),
  taxRate: z.number().min(0).max(100),
  notes: z.string(),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
export type InvoiceLineItem = z.infer<typeof lineItemSchema>;

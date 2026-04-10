/**
 * Status State Machine — Pure Transition Layer
 *
 * Explicit states, events, and transitions for invoices and proposals.
 * All transition logic is pure — no side effects, no DB writes.
 * Side effects (timestamp writes) belong in hooks/services.
 */

// ═══════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════

export type InvoiceStoredStatus = "draft" | "sent" | "paid" | "cancelled";
export type InvoiceDisplayStatus = InvoiceStoredStatus | "overdue";
export type InvoiceEvent = "SEND" | "MARK_PAID" | "CANCEL";

export type ProposalStoredStatus = "draft" | "sent" | "approved" | "rejected";
export type ProposalDisplayStatus = ProposalStoredStatus | "expired";
export type ProposalEvent = "SEND" | "APPROVE" | "REJECT" | "REVISE";

// ═══════════════════════════════════════════════════════
//  TRANSITION TABLES
// ═══════════════════════════════════════════════════════

const INVOICE_TRANSITIONS: Record<InvoiceStoredStatus, Partial<Record<InvoiceEvent, InvoiceStoredStatus>>> = {
  draft:     { SEND: "sent",  CANCEL: "cancelled" },
  sent:      { MARK_PAID: "paid", CANCEL: "cancelled" },
  paid:      {},
  cancelled: {},
};

const PROPOSAL_TRANSITIONS: Record<ProposalStoredStatus, Partial<Record<ProposalEvent, ProposalStoredStatus>>> = {
  draft:    { SEND: "sent" },
  sent:     { APPROVE: "approved", REJECT: "rejected" },
  approved: {},
  rejected: { REVISE: "draft" },
};

// ═══════════════════════════════════════════════════════
//  PURE TRANSITION FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * Attempt an invoice status transition.
 * Returns the new status, or null if the transition is invalid.
 */
export function transitionInvoiceStatus(
  current: InvoiceStoredStatus,
  event: InvoiceEvent,
): InvoiceStoredStatus | null {
  const transitions = INVOICE_TRANSITIONS[current];
  if (!transitions) return null;
  return transitions[event] ?? null;
}

/**
 * Attempt a proposal status transition.
 * Returns the new status, or null if the transition is invalid.
 */
export function transitionProposalStatus(
  current: ProposalStoredStatus,
  event: ProposalEvent,
): ProposalStoredStatus | null {
  const transitions = PROPOSAL_TRANSITIONS[current];
  if (!transitions) return null;
  return transitions[event] ?? null;
}

// ═══════════════════════════════════════════════════════
//  DISPLAY STATUS DERIVATION
// ═══════════════════════════════════════════════════════

const VALID_INVOICE_STATUSES: Set<string> = new Set(["draft", "sent", "paid", "cancelled"]);
const VALID_PROPOSAL_STATUSES: Set<string> = new Set(["draft", "sent", "approved", "rejected"]);

/**
 * Derive the display status for an invoice.
 * 'overdue' is derived from due_date + stored status.
 */
export function resolveInvoiceDisplayStatus(
  stored: InvoiceStoredStatus,
  dueDate: string | null,
): InvoiceDisplayStatus {
  if (!VALID_INVOICE_STATUSES.has(stored)) return "draft";

  if (stored === "sent" && dueDate) {
    if (new Date(dueDate) < new Date()) return "overdue";
  }

  return stored;
}

/**
 * Derive the display status for a proposal.
 * 'expired' is derived from valid_until + stored status.
 */
export function resolveProposalDisplayStatus(
  stored: ProposalStoredStatus,
  validUntil: string | null,
): ProposalDisplayStatus {
  if (!VALID_PROPOSAL_STATUSES.has(stored)) return "draft";

  if (stored === "sent" && validUntil) {
    if (new Date(validUntil) < new Date()) return "expired";
  }

  return stored;
}

// ═══════════════════════════════════════════════════════
//  TIMESTAMP FIELD MAPPING (for use by hooks/services)
// ═══════════════════════════════════════════════════════

export const INVOICE_TIMESTAMP_FIELDS: Partial<Record<InvoiceEvent, string>> = {
  SEND: "sent_at",
  MARK_PAID: "paid_at",
};

export const PROPOSAL_TIMESTAMP_FIELDS: Partial<Record<ProposalEvent, string>> = {
  SEND: "sent_at",
  APPROVE: "approved_at",
};

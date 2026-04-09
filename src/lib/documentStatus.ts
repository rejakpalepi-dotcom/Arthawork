/**
 * Document Status System
 *
 * Three concerns, separated:
 *   1. StatusUIConfig  — badge colors, labels, dot classes (pure presentation)
 *   2. StatusLifecycle — transitions, terminal flags, timestamp fields (business rules)
 *   3. Resolver fns   — single source of truth for display status (derived logic)
 *
 * ## Status classification
 *
 * INVOICE (stored in DB: draft | sent | paid | cancelled)
 *   - overdue is DERIVED: due_date < now && status === 'sent'
 *   - viewed  is REMOVED: no tracking mechanism exists yet
 *
 * PROPOSAL (stored in DB: draft | sent | approved | rejected)
 *   - expired      is DERIVED: valid_until < now && status === 'sent'
 *   - viewed       is REMOVED: no tracking mechanism exists yet
 *   - needs_review is REMOVED: no workflow triggers it
 */

// ===== TYPE DEFINITIONS =====

/** Statuses that can be stored in the invoices.status column */
export type InvoiceStoredStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

/** All statuses that can appear in the UI (stored + derived) */
export type InvoiceDisplayStatus = InvoiceStoredStatus | 'overdue';

/** Statuses that can be stored in the proposals.status column */
export type ProposalStoredStatus = 'draft' | 'sent' | 'approved' | 'rejected';

/** All statuses that can appear in the UI (stored + derived) */
export type ProposalDisplayStatus = ProposalStoredStatus | 'expired';

// ===== UI CONFIG =====

export interface StatusUIConfig {
  label: string;
  labelId: string; // Bahasa Indonesia label
  color: 'warning' | 'primary' | 'info' | 'destructive' | 'success' | 'muted';
  bgClass: string;
  textClass: string;
  dotClass: string;
}

export const INVOICE_STATUS_UI: Record<InvoiceDisplayStatus, StatusUIConfig> = {
  draft: {
    label: 'Draft',
    labelId: 'Draf',
    color: 'muted',
    bgClass: 'bg-muted/50',
    textClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
  sent: {
    label: 'Sent',
    labelId: 'Terkirim',
    color: 'primary',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
    dotClass: 'bg-primary',
  },
  overdue: {
    label: 'Overdue',
    labelId: 'Telat Bayar',
    color: 'destructive',
    bgClass: 'bg-destructive/10',
    textClass: 'text-destructive',
    dotClass: 'bg-destructive',
  },
  paid: {
    label: 'Paid',
    labelId: 'Lunas',
    color: 'success',
    bgClass: 'bg-success/10',
    textClass: 'text-success',
    dotClass: 'bg-success',
  },
  cancelled: {
    label: 'Cancelled',
    labelId: 'Dibatalkan',
    color: 'muted',
    bgClass: 'bg-muted/30',
    textClass: 'text-muted-foreground line-through',
    dotClass: 'bg-muted-foreground/50',
  },
};

export const PROPOSAL_STATUS_UI: Record<ProposalDisplayStatus, StatusUIConfig> = {
  draft: {
    label: 'Draft',
    labelId: 'Draf',
    color: 'muted',
    bgClass: 'bg-muted/50',
    textClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
  sent: {
    label: 'Sent',
    labelId: 'Terkirim',
    color: 'primary',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
    dotClass: 'bg-primary',
  },
  expired: {
    label: 'Expired',
    labelId: 'Kedaluwarsa',
    color: 'muted',
    bgClass: 'bg-muted/30',
    textClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground/50',
  },
  approved: {
    label: 'Approved',
    labelId: 'Disetujui',
    color: 'success',
    bgClass: 'bg-success/10',
    textClass: 'text-success',
    dotClass: 'bg-success',
  },
  rejected: {
    label: 'Rejected',
    labelId: 'Ditolak',
    color: 'destructive',
    bgClass: 'bg-destructive/10',
    textClass: 'text-destructive',
    dotClass: 'bg-destructive',
  },
};

// ===== LIFECYCLE RULES =====

export interface StatusLifecycle {
  allowedTransitions: string[];
  isTerminal: boolean;
  timestampField: string | null;
}

export const INVOICE_LIFECYCLE: Record<InvoiceStoredStatus, StatusLifecycle> = {
  draft: {
    allowedTransitions: ['sent', 'cancelled'],
    isTerminal: false,
    timestampField: null,
  },
  sent: {
    allowedTransitions: ['paid', 'cancelled'],
    isTerminal: false,
    timestampField: 'sent_at',
  },
  paid: {
    allowedTransitions: [],
    isTerminal: true,
    timestampField: 'paid_at',
  },
  cancelled: {
    allowedTransitions: [],
    isTerminal: true,
    timestampField: null,
  },
};

export const PROPOSAL_LIFECYCLE: Record<ProposalStoredStatus, StatusLifecycle> = {
  draft: {
    allowedTransitions: ['sent'],
    isTerminal: false,
    timestampField: null,
  },
  sent: {
    allowedTransitions: ['approved', 'rejected'],
    isTerminal: false,
    timestampField: 'sent_at',
  },
  approved: {
    allowedTransitions: [],
    isTerminal: true,
    timestampField: 'approved_at',
  },
  rejected: {
    allowedTransitions: ['draft'],
    isTerminal: false,
    timestampField: null,
  },
};

// ===== RESOLVER FUNCTIONS =====
// Single source of truth for display status. All consumers must use these.

/**
 * Resolve the display status for an invoice row.
 * Derives 'overdue' from due_date + stored status.
 */
export function resolveInvoiceStatus(row: {
  status: string;
  due_date: string | null;
}): InvoiceDisplayStatus {
  const stored = row.status as InvoiceStoredStatus;

  // Derive overdue: unpaid + past due date
  if (stored === 'sent' && row.due_date) {
    const dueDate = new Date(row.due_date);
    const now = new Date();
    if (dueDate < now) {
      return 'overdue';
    }
  }

  // Validate stored status, fallback to draft
  if (stored in INVOICE_STATUS_UI) {
    return stored as InvoiceDisplayStatus;
  }
  return 'draft';
}

/**
 * Resolve the display status for a proposal row.
 * Derives 'expired' from valid_until + stored status.
 */
export function resolveProposalStatus(row: {
  status: string;
  valid_until: string | null;
}): ProposalDisplayStatus {
  const stored = row.status as ProposalStoredStatus;

  // Derive expired: sent + past valid_until
  if (stored === 'sent' && row.valid_until) {
    const expiresAt = new Date(row.valid_until);
    const now = new Date();
    if (expiresAt < now) {
      return 'expired';
    }
  }

  // Validate stored status, fallback to draft
  if (stored in PROPOSAL_STATUS_UI) {
    return stored as ProposalDisplayStatus;
  }
  return 'draft';
}

// ===== UI HELPERS =====

/** Get UI config for an invoice display status */
export function getInvoiceStatusUI(status: InvoiceDisplayStatus): StatusUIConfig {
  return INVOICE_STATUS_UI[status] || INVOICE_STATUS_UI.draft;
}

/** Get UI config for a proposal display status */
export function getProposalStatusUI(status: ProposalDisplayStatus): StatusUIConfig {
  return PROPOSAL_STATUS_UI[status] || PROPOSAL_STATUS_UI.draft;
}

// ===== TRANSITION GUARDS =====

/** Check if a manual transition is allowed for an invoice */
export function canTransitionInvoice(
  from: InvoiceStoredStatus,
  to: InvoiceStoredStatus,
): boolean {
  const lifecycle = INVOICE_LIFECYCLE[from];
  if (!lifecycle) return false;
  return lifecycle.allowedTransitions.includes(to);
}

/** Check if a manual transition is allowed for a proposal */
export function canTransitionProposal(
  from: ProposalStoredStatus,
  to: ProposalStoredStatus,
): boolean {
  const lifecycle = PROPOSAL_LIFECYCLE[from];
  if (!lifecycle) return false;
  return lifecycle.allowedTransitions.includes(to);
}

// ===== TIMESTAMP FORMATTING =====

/**
 * Format timestamp for display.
 * Returns relative time (e.g., "2 hours ago") or date string.
 */
export function formatTimestamp(dateStr: string | null): string {
  if (!dateStr) return '—';

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format due date relative to now.
 */
export function formatDueDate(dueDateStr: string | null): {
  text: string;
  isOverdue: boolean;
  isUrgent: boolean;
} {
  if (!dueDateStr) return { text: 'Tanpa tenggat', isOverdue: false, isUrgent: false };

  const dueDate = new Date(dueDateStr);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Telat ${Math.abs(diffDays)} hari`,
      isOverdue: true,
      isUrgent: true,
    };
  }
  if (diffDays === 0) {
    return { text: 'Jatuh tempo hari ini', isOverdue: false, isUrgent: true };
  }
  if (diffDays <= 3) {
    return { text: `${diffDays} hari lagi`, isOverdue: false, isUrgent: true };
  }
  if (diffDays <= 7) {
    return { text: `${diffDays} hari lagi`, isOverdue: false, isUrgent: false };
  }

  return {
    text: dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    isOverdue: false,
    isUrgent: false,
  };
}

// ===== BACKWARD COMPATIBILITY =====
// These aliases exist so files that haven't been updated yet don't break.
// They will be removed once all consumers are migrated.

/** @deprecated Use resolveInvoiceStatus() + getInvoiceStatusUI() instead */
export function getInvoiceStatus(status: string): StatusUIConfig {
  return INVOICE_STATUS_UI[status as InvoiceDisplayStatus] || INVOICE_STATUS_UI.draft;
}

/** @deprecated Use resolveProposalStatus() + getProposalStatusUI() instead */
export function getProposalStatus(status: string): StatusUIConfig {
  return PROPOSAL_STATUS_UI[status as ProposalDisplayStatus] || PROPOSAL_STATUS_UI.draft;
}

// Re-export old types for gradual migration
export type InvoiceStatus = InvoiceDisplayStatus;
export type ProposalStatus = ProposalDisplayStatus;
export type StatusConfig = StatusUIConfig;

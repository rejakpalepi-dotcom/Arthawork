/**
 * Document Status System
 * 
 * Canonical status definitions with real behavior, transitions, and timestamps.
 * Every status must have a visual indicator, allowed transitions, and a purpose.
 */

// ===== INVOICE STATUS =====

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'overdue' | 'paid' | 'cancelled';

export interface StatusConfig {
  label: string;
  labelId: string; // Bahasa Indonesia label
  color: 'warning' | 'primary' | 'info' | 'destructive' | 'success' | 'muted';
  bgClass: string;
  textClass: string;
  dotClass: string;
  allowedTransitions: string[];
  timestampField: string | null;
}

export const INVOICE_STATUSES: Record<InvoiceStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    labelId: 'Draf',
    color: 'muted',
    bgClass: 'bg-muted/50',
    textClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground',
    allowedTransitions: ['sent', 'cancelled'],
    timestampField: null,
  },
  sent: {
    label: 'Sent',
    labelId: 'Terkirim',
    color: 'primary',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
    dotClass: 'bg-primary',
    allowedTransitions: ['viewed', 'paid', 'overdue', 'cancelled'],
    timestampField: 'sent_at',
  },
  viewed: {
    label: 'Viewed',
    labelId: 'Dilihat',
    color: 'info',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-600 dark:text-blue-400',
    dotClass: 'bg-blue-500',
    allowedTransitions: ['paid', 'overdue', 'cancelled'],
    timestampField: 'viewed_at',
  },
  overdue: {
    label: 'Overdue',
    labelId: 'Telat Bayar',
    color: 'destructive',
    bgClass: 'bg-destructive/10',
    textClass: 'text-destructive',
    dotClass: 'bg-destructive',
    allowedTransitions: ['paid', 'cancelled'],
    timestampField: null, // Derived from due_date
  },
  paid: {
    label: 'Paid',
    labelId: 'Lunas',
    color: 'success',
    bgClass: 'bg-success/10',
    textClass: 'text-success',
    dotClass: 'bg-success',
    allowedTransitions: [], // Terminal state
    timestampField: 'paid_at',
  },
  cancelled: {
    label: 'Cancelled',
    labelId: 'Dibatalkan',
    color: 'muted',
    bgClass: 'bg-muted/30',
    textClass: 'text-muted-foreground line-through',
    dotClass: 'bg-muted-foreground/50',
    allowedTransitions: [], // Terminal state
    timestampField: null,
  },
};

// ===== PROPOSAL STATUS =====

export type ProposalStatus = 'draft' | 'needs_review' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired';

export const PROPOSAL_STATUSES: Record<ProposalStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    labelId: 'Draf',
    color: 'muted',
    bgClass: 'bg-muted/50',
    textClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground',
    allowedTransitions: ['needs_review', 'sent'],
    timestampField: null,
  },
  needs_review: {
    label: 'Needs Review',
    labelId: 'Perlu Review',
    color: 'warning',
    bgClass: 'bg-warning/10',
    textClass: 'text-warning',
    dotClass: 'bg-warning',
    allowedTransitions: ['sent', 'draft'],
    timestampField: null,
  },
  sent: {
    label: 'Sent',
    labelId: 'Terkirim',
    color: 'primary',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
    dotClass: 'bg-primary',
    allowedTransitions: ['viewed', 'approved', 'rejected', 'expired'],
    timestampField: 'sent_at',
  },
  viewed: {
    label: 'Viewed',
    labelId: 'Dilihat',
    color: 'info',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-600 dark:text-blue-400',
    dotClass: 'bg-blue-500',
    allowedTransitions: ['approved', 'rejected', 'expired'],
    timestampField: 'viewed_at',
  },
  approved: {
    label: 'Approved',
    labelId: 'Disetujui',
    color: 'success',
    bgClass: 'bg-success/10',
    textClass: 'text-success',
    dotClass: 'bg-success',
    allowedTransitions: [], // Terminal state
    timestampField: 'approved_at',
  },
  rejected: {
    label: 'Rejected',
    labelId: 'Ditolak',
    color: 'destructive',
    bgClass: 'bg-destructive/10',
    textClass: 'text-destructive',
    dotClass: 'bg-destructive',
    allowedTransitions: ['draft'], // Can revise
    timestampField: null,
  },
  expired: {
    label: 'Expired',
    labelId: 'Kedaluwarsa',
    color: 'muted',
    bgClass: 'bg-muted/30',
    textClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground/50',
    allowedTransitions: ['draft'], // Can revise
    timestampField: 'expires_at',
  },
};

// ===== HELPERS =====

export function getInvoiceStatus(status: string): StatusConfig {
  return INVOICE_STATUSES[status as InvoiceStatus] || INVOICE_STATUSES.draft;
}

export function getProposalStatus(status: string): StatusConfig {
  return PROPOSAL_STATUSES[status as ProposalStatus] || PROPOSAL_STATUSES.draft;
}

export function canTransition(
  currentStatus: string,
  targetStatus: string,
  statusMap: Record<string, StatusConfig>
): boolean {
  const current = statusMap[currentStatus];
  if (!current) return false;
  return current.allowedTransitions.includes(targetStatus);
}

/**
 * Format timestamp for display
 * Returns relative time (e.g., "2 hours ago") or date string
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
 * Format due date relative to now
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

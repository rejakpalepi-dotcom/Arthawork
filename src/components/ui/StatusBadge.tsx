import { cn } from "@/lib/utils";
import type { InvoiceDisplayStatus, ProposalDisplayStatus, StatusUIConfig } from "@/lib/documentStatus";
import { getInvoiceStatusUI, getProposalStatusUI } from "@/lib/documentStatus";

interface StatusBadgeProps {
  /** Which status set to use */
  type: "invoice" | "proposal";
  /** The resolved display status */
  status: InvoiceDisplayStatus | ProposalDisplayStatus;
  /** Badge size variant */
  size?: "sm" | "default";
  /** Additional class names */
  className?: string;
}

/**
 * Canonical status badge component.
 * Replaces all ad-hoc badge rendering across the app.
 */
export function StatusBadge({ type, status, size = "default", className }: StatusBadgeProps) {
  const config: StatusUIConfig =
    type === "invoice"
      ? getInvoiceStatusUI(status as InvoiceDisplayStatus)
      : getProposalStatusUI(status as ProposalDisplayStatus);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm"
          ? "px-2 py-0.5 text-xs"
          : "px-3 py-1.5 text-xs",
        config.bgClass,
        config.textClass,
        className,
      )}
    >
      <span className={cn("rounded-full", size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5", config.dotClass)} />
      {config.labelId}
    </span>
  );
}

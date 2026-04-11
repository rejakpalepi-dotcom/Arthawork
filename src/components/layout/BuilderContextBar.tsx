import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveStatusIndicator } from "@/components/ui/SaveStatusIndicator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/hooks/useBreadcrumbs";
import type { InvoiceDisplayStatus, ProposalDisplayStatus } from "@/lib/documentStatus";
import type { AutosaveState } from "@/hooks/useAutosave";

interface BuilderContextBarProps {
  /** Breadcrumb items to display */
  breadcrumbs: BreadcrumbItem[];
  /** Back navigation target */
  backTo: string;
  /** Document identifier (e.g. "INV-001" or proposal title) */
  documentTitle?: string;
  /** Client name */
  clientName?: string;
  /** Document type for status badge */
  documentType?: "invoice" | "proposal";
  /** Resolved display status */
  status?: InvoiceDisplayStatus | ProposalDisplayStatus;
  /** Autosave state for the save indicator */
  autosave: AutosaveState;
  /** Action buttons (right side) */
  actions?: ReactNode;
  /** Called when user confirms navigation away with unsaved changes */
  onBack?: () => void;
}

/**
 * Unified context bar for builder pages (InvoiceBuilder, ProposalBuilder).
 *
 * Shows:
 *   ← Section › Parent › Current
 *   Document title · Client · Status · Save state
 *                                        [Save] [Send]
 */
export function BuilderContextBar({
  breadcrumbs,
  backTo,
  documentTitle,
  clientName,
  documentType,
  status,
  autosave,
  actions,
  onBack,
}: BuilderContextBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(backTo);
    }
  };

  return (
    <div className="border-b border-border bg-card sticky top-0 z-10">
      <div className="px-4 md:px-6 py-3 md:py-4">
        {/* Row 1: Back + Breadcrumb + Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            {/* Desktop breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground min-w-0"
            >
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <span key={i} className="flex items-center gap-1.5 shrink-0">
                    {i > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                    )}
                    {crumb.href && !isLast ? (
                      <Link
                        to={crumb.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : isLast ? (
                      <span className="text-foreground font-medium">
                        {crumb.label}
                      </span>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </span>
                );
              })}
            </nav>

            {/* Mobile: just show the current page title */}
            <span className="md:hidden text-sm font-medium text-foreground truncate">
              {breadcrumbs[breadcrumbs.length - 1]?.label}
            </span>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Row 2: Document context (desktop below breadcrumb, mobile inline) */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 ml-0 md:ml-12">
          {/* Document title */}
          {documentTitle && (
            <span className="text-sm font-medium text-foreground">
              {documentTitle}
            </span>
          )}

          {/* Client name */}
          {clientName && (
            <>
              <span className="hidden sm:inline text-muted-foreground/40">·</span>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {clientName}
              </span>
            </>
          )}

          {/* Status badge */}
          {documentType && status && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <StatusBadge type={documentType} status={status} size="sm" />
            </>
          )}

          {/* Save indicator */}
          <span className="text-muted-foreground/40">·</span>
          <SaveStatusIndicator
            status={autosave.status}
            lastSavedAt={autosave.lastSavedAt}
            error={autosave.error}
            onRetry={autosave.retry}
          />
        </div>
      </div>
    </div>
  );
}

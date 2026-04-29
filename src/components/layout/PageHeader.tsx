import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useBreadcrumbs, type BreadcrumbItem } from "@/hooks/useBreadcrumbs";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Page heading (h1) */
  title: string;
  /** Supporting description text */
  description?: string;
  /** Action buttons (right side) */
  actions?: ReactNode;
  /** Optional metadata row below description */
  metadata?: ReactNode;
  /** Override the last breadcrumb label (e.g. document name) */
  breadcrumbLabel?: string;
  /** Extra breadcrumb items to append */
  breadcrumbItems?: BreadcrumbItem[];
  /** Additional class for the outer container */
  className?: string;
}

/**
 * Standardized page header replacing 6+ ad-hoc patterns.
 *
 * Renders:
 *   [Breadcrumb: Section › Parent › Current]
 *   [Title]                        [Actions]
 *   [Description]
 *   [Metadata row]
 */
export function PageHeader({
  title,
  description,
  actions,
  metadata,
  breadcrumbLabel,
  breadcrumbItems,
  className,
}: PageHeaderProps) {
  const { crumbs: routeCrumbs } = useBreadcrumbs({ overrideLabel: breadcrumbLabel });

  // Merge route breadcrumbs with any extra items
  const crumbs = breadcrumbItems
    ? [...routeCrumbs.slice(0, -1), ...breadcrumbItems]
    : routeCrumbs;

  return (
    <div className={cn("mb-6 md:mb-8", className)}>
      {/* Breadcrumb */}
      {crumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground mb-4"
        >
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />}
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : isLast ? (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 rounded-[28px] border border-border/70 bg-card/80 px-5 py-5 shadow-sm backdrop-blur md:px-6 md:py-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-[2rem] font-semibold tracking-tight text-foreground mb-1.5 md:mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-sm md:text-base leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional metadata row */}
      {metadata && (
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          {metadata}
        </div>
      )}
    </div>
  );
}

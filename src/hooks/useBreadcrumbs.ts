import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { buildBreadcrumbs, matchRoute } from "@/lib/routeConfig";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface UseBreadcrumbsOptions {
  /** Override the last breadcrumb label (e.g. document name) */
  overrideLabel?: string;
}

/**
 * Hook that builds a route-aware breadcrumb chain from the current pathname.
 *
 * Usage:
 *   const { crumbs, pageTitle, section } = useBreadcrumbs();
 *   const { crumbs } = useBreadcrumbs({ overrideLabel: "INV-001" });
 */
export function useBreadcrumbs(options?: UseBreadcrumbsOptions) {
  const location = useLocation();
  const pathname = location.pathname;

  return useMemo(() => {
    const config = matchRoute(pathname);
    const crumbs = buildBreadcrumbs(pathname, options?.overrideLabel);

    return {
      /** Full breadcrumb chain */
      crumbs,
      /** Current page title from route config */
      pageTitle: config?.title ?? "",
      /** Sidebar section (Dokumen, Kelola, or null) */
      section: config?.section ?? null,
    };
  }, [pathname, options?.overrideLabel]);
}

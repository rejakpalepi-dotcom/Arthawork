/**
 * Route Configuration — Single source of truth for IA metadata.
 *
 * Maps route patterns to their section, title, and parent relationships.
 * Consumed by useBreadcrumbs, PageHeader, MobileHeader.
 *
 * Section names match the Sidebar nav groups exactly.
 */

import {
  LayoutDashboard,
  Receipt,
  FileText,
  FileSignature,
  Users,
  Briefcase,
  FolderKanban,
  Calculator,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface RouteConfig {
  /** Sidebar group label (null = top-level like Dashboard) */
  section: string | null;
  /** Display title for breadcrumb / header */
  title: string;
  /** Route icon (from sidebar) */
  icon?: LucideIcon;
  /** Parent route path for breadcrumb chain */
  parent?: string;
}

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // Primary
  "/dashboard": { section: null, title: "Dashboard", icon: LayoutDashboard },

  // Dokumen
  "/invoices": { section: "Dokumen", title: "Invoices", icon: Receipt },
  "/invoices/new": { section: "Dokumen", title: "New Invoice", parent: "/invoices" },
  "/invoices/:id": { section: "Dokumen", title: "Invoice Detail", parent: "/invoices" },
  "/invoices/:id/edit": { section: "Dokumen", title: "Edit Invoice", parent: "/invoices" },
  "/proposals": { section: "Dokumen", title: "Proposals", icon: FileText },
  "/proposals/new": { section: "Dokumen", title: "New Proposal", parent: "/proposals" },
  "/proposals/:id/edit": { section: "Dokumen", title: "Edit Proposal", parent: "/proposals" },
  "/contracts": { section: "Dokumen", title: "Contracts", icon: FileSignature },

  // Kelola
  "/clients": { section: "Kelola", title: "Clients", icon: Users },
  "/services": { section: "Kelola", title: "Services", icon: Briefcase },
  "/projects": { section: "Kelola", title: "Projects", icon: FolderKanban },
  "/projects/new": { section: "Kelola", title: "New Project", parent: "/projects" },

  // Bottom
  "/tax-summary": { section: null, title: "Tax Summary", icon: Calculator },
  "/settings": { section: null, title: "Settings", icon: Settings },
};

/**
 * Match a pathname against the route config, handling :id params.
 * Returns the matched RouteConfig or null.
 */
export function matchRoute(pathname: string): RouteConfig | null {
  // Exact match first
  if (ROUTE_CONFIG[pathname]) {
    return ROUTE_CONFIG[pathname];
  }

  // Try parameterized patterns
  for (const [pattern, config] of Object.entries(ROUTE_CONFIG)) {
    if (!pattern.includes(":")) continue;

    const patternParts = pattern.split("/");
    const pathParts = pathname.split("/");

    if (patternParts.length !== pathParts.length) continue;

    const matches = patternParts.every(
      (part, i) => part.startsWith(":") || part === pathParts[i]
    );

    if (matches) return config;
  }

  return null;
}

/**
 * Build the breadcrumb chain for a given pathname.
 * Returns an array of { label, href? } objects.
 */
export function buildBreadcrumbs(
  pathname: string,
  overrideLabel?: string
): Array<{ label: string; href?: string }> {
  const config = matchRoute(pathname);
  if (!config) return [];

  const crumbs: Array<{ label: string; href?: string }> = [];

  // Add section (if present)
  if (config.section) {
    crumbs.push({ label: config.section });
  }

  // Walk up the parent chain
  if (config.parent) {
    const parentConfig = ROUTE_CONFIG[config.parent];
    if (parentConfig) {
      crumbs.push({ label: parentConfig.title, href: config.parent });
    }
  }

  // Current page (use override if provided)
  crumbs.push({ label: overrideLabel || config.title });

  return crumbs;
}

import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(__dirname, "../../", relativePath), "utf-8");
}

describe("UI copy localization regressions", () => {
  it("sidebar navigation no longer exposes English primary labels", () => {
    const content = readProjectFile("src/components/layout/Sidebar.tsx");

    expect(content).not.toContain('"Invoices"');
    expect(content).not.toContain('"Proposals"');
    expect(content).not.toContain('"Clients"');
    expect(content).not.toContain('"Services"');
    expect(content).not.toContain('"Projects"');
    expect(content).not.toContain('"Settings"');
    expect(content).not.toContain('"Sign Out"');
  });

  it("dashboard and quick actions use Indonesian action copy", () => {
    const dashboard = readProjectFile("src/pages/Dashboard.tsx");
    const actions = readProjectFile("src/components/dashboard/QuickActions.tsx");
    const recentInvoices = readProjectFile("src/components/dashboard/RecentInvoices.tsx");
    const activeProjects = readProjectFile("src/components/dashboard/ActiveProjects.tsx");
    const todaysFocus = readProjectFile("src/components/dashboard/TodaysFocus.tsx");
    const recentActivity = readProjectFile("src/components/dashboard/RecentActivity.tsx");

    expect(dashboard).not.toContain("New Project");
    expect(dashboard).not.toContain("Revenue Trends");
    expect(actions).not.toContain("Quick Actions");
    expect(actions).not.toContain("New Invoice");
    expect(actions).not.toContain("New Proposal");
    expect(actions).not.toContain("Add Client");
    expect(actions).not.toContain("Export Report");
    expect(recentInvoices).not.toContain("Recent Invoices");
    expect(recentInvoices).not.toContain("View All Invoices");
    expect(activeProjects).not.toContain("Active Projects");
    expect(activeProjects).not.toContain("View All");
    expect(todaysFocus).not.toContain("Today&apos;s Focus");
    expect(todaysFocus).not.toContain("Add a new task...");
    expect(recentActivity).not.toContain("Recent Activity");
    expect(recentActivity).not.toContain("View All");
  });

  it("landing page no longer includes the SaaS badge copy", () => {
    const landing = readProjectFile("src/pages/LandingPage.tsx");

    expect(landing).not.toContain("SaaS untuk freelancer Indonesia");
  });

  it("settings and financial pages use localized fallback copy", () => {
    const account = readProjectFile("src/components/settings/AccountTab.tsx");
    const business = readProjectFile("src/components/settings/BusinessProfileTab.tsx");
    const branding = readProjectFile("src/components/settings/BrandingTab.tsx");
    const payment = readProjectFile("src/components/settings/PaymentDetailsTab.tsx");
    const mfa = readProjectFile("src/components/settings/MFASetup.tsx");
    const proposals = readProjectFile("src/pages/Proposals.tsx");
    const invoices = readProjectFile("src/pages/Invoices.tsx");

    expect(account).not.toContain("Account Settings");
    expect(account).not.toContain("Export Your Data");
    expect(business).not.toContain("Business Profile");
    expect(business).not.toContain("Business Name");
    expect(branding).not.toContain("Primary Color");
    expect(branding).not.toContain("Drag and drop your logo here, or click to browse");
    expect(payment).not.toContain("Payment Details");
    expect(payment).not.toContain("Connect Stripe");
    expect(mfa).not.toContain("Two-Factor Authentication");
    expect(mfa).not.toContain("Your account is protected");
    expect(proposals).not.toContain("Pipeline Value");
    expect(proposals).not.toContain("Acceptance Rate");
    expect(invoices).not.toContain("Your Business Name");
    expect(invoices).not.toContain("Failed to export PDF");
  });
});

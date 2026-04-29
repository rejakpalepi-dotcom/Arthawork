import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(__dirname, "../../", relativePath), "utf-8");
}

describe("Authenticated layout polish regressions", () => {
  it("dashboard, invoices, proposals, and settings expose dedicated visual shells", () => {
    const dashboard = readProjectFile("src/pages/Dashboard.tsx");
    const invoices = readProjectFile("src/pages/Invoices.tsx");
    const proposals = readProjectFile("src/pages/Proposals.tsx");
    const settings = readProjectFile("src/pages/Settings.tsx");

    expect(dashboard).toContain('data-ui-shell="dashboard-overview"');
    expect(invoices).toContain('data-ui-shell="invoice-overview"');
    expect(proposals).toContain('data-ui-shell="proposal-overview"');
    expect(settings).toContain('data-ui-shell="settings-workspace"');
  });

  it("supporting panels and landing page expose polish hooks", () => {
    const todaysFocus = readProjectFile("src/components/dashboard/TodaysFocus.tsx");
    const revenueChart = readProjectFile("src/components/dashboard/RevenueChart.tsx");
    const subscriptionTab = readProjectFile("src/components/settings/SubscriptionTab.tsx");
    const securityTab = readProjectFile("src/components/settings/SecurityTab.tsx");
    const accountTab = readProjectFile("src/components/settings/AccountTab.tsx");
    const landing = readProjectFile("src/pages/LandingPage.tsx");

    expect(todaysFocus).toContain('data-ui-panel="todays-focus"');
    expect(revenueChart).toContain('data-ui-panel="revenue-chart"');
    expect(subscriptionTab).toContain('data-ui-panel="subscription-tab"');
    expect(securityTab).toContain('data-ui-panel="security-tab"');
    expect(accountTab).toContain('data-ui-panel="account-tab"');
    expect(landing).toContain('data-ui-shell="landing-marketing"');
  });

  it("mobile, security, and client-facing surfaces expose dedicated polish hooks", () => {
    const notifications = readProjectFile("src/components/NotificationCenter.tsx");
    const mobileHeader = readProjectFile("src/components/layout/MobileHeader.tsx");
    const mobileNav = readProjectFile("src/components/layout/MobileNav.tsx");
    const mfaSetup = readProjectFile("src/components/settings/MFASetup.tsx");
    const twoFactor = readProjectFile("src/components/settings/TwoFactorSettings.tsx");
    const invoiceDetail = readProjectFile("src/pages/InvoiceDetail.tsx");
    const clientPortal = readProjectFile("src/pages/ClientPortal.tsx");
    const contractViewer = readProjectFile("src/pages/ContractViewer.tsx");

    expect(notifications).toContain('data-ui-panel="notification-center"');
    expect(mobileHeader).toContain('data-ui-panel="mobile-header"');
    expect(mobileNav).toContain('data-ui-panel="mobile-nav"');
    expect(mfaSetup).toContain('data-ui-panel="mfa-setup"');
    expect(twoFactor).toContain('data-ui-panel="twofactor-settings"');
    expect(invoiceDetail).toContain('data-ui-shell="invoice-detail"');
    expect(clientPortal).toContain('data-ui-shell="client-portal"');
    expect(contractViewer).toContain('data-ui-shell="contract-viewer"');
  });
});

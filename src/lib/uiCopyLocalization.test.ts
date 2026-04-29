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

  it("invoice builder, clients, and services flows avoid obvious English UI copy", () => {
    const invoiceBuilder = readProjectFile("src/pages/InvoiceBuilder.tsx");
    const invoiceForm = readProjectFile("src/components/invoice/InvoiceForm.tsx");
    const clients = readProjectFile("src/pages/Clients.tsx");
    const addClient = readProjectFile("src/components/modals/AddClientModal.tsx");
    const editClient = readProjectFile("src/components/modals/EditClientModal.tsx");
    const services = readProjectFile("src/pages/Services.tsx");
    const addService = readProjectFile("src/components/modals/AddServiceModal.tsx");
    const editService = readProjectFile("src/components/modals/EditServiceModal.tsx");

    expect(invoiceBuilder).not.toContain("Failed to load invoice");
    expect(invoiceBuilder).not.toContain("Save Draft");
    expect(invoiceBuilder).not.toContain("Export PDF");
    expect(invoiceBuilder).not.toContain("Send Invoice");
    expect(invoiceBuilder).not.toContain("Build Invoice");
    expect(invoiceForm).not.toContain("Invoice Details");
    expect(invoiceForm).not.toContain("Client Information");
    expect(invoiceForm).not.toContain("Add Item");
    expect(invoiceForm).not.toContain("Select due date");
    expect(clients).not.toContain('title="Clients"');
    expect(clients).not.toContain("Add Client");
    expect(clients).not.toContain("Search clients...");
    expect(addClient).not.toContain("Add New Client");
    expect(editClient).not.toContain("Edit Client");
    expect(services).not.toContain('title="Services"');
    expect(services).not.toContain("Add Service");
    expect(services).not.toContain("No services yet");
    expect(addService).not.toContain("Add New Service");
    expect(editService).not.toContain("Edit Service");
  });

  it("proposal builder core flow and first editor sections use Indonesian copy", () => {
    const proposalBuilder = readProjectFile("src/pages/ProposalBuilder.tsx");
    const proposalEditor = readProjectFile("src/components/proposal/ProposalEditor.tsx");

    expect(proposalBuilder).not.toContain("Failed to load clients");
    expect(proposalBuilder).not.toContain("Failed to load proposal");
    expect(proposalBuilder).not.toContain("Save Draft");
    expect(proposalBuilder).not.toContain("Export PDF");
    expect(proposalBuilder).not.toContain("Loading proposal...");
    expect(proposalEditor).not.toContain("Cover Page");
    expect(proposalEditor).not.toContain("Set up your proposal's first impression");
    expect(proposalEditor).not.toContain("Select a client");
    expect(proposalEditor).not.toContain("No clients found. Add clients first.");
    expect(proposalEditor).not.toContain("Introduction");
    expect(proposalEditor).not.toContain("Introduction Text");
    expect(proposalEditor).not.toContain("Hero Image");
  });
});

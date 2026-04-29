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

  it("auth, projects, and mobile navigation avoid obvious English UI copy", () => {
    const login = readProjectFile("src/pages/Login.tsx");
    const forgotPassword = readProjectFile("src/pages/ForgotPassword.tsx");
    const signup = readProjectFile("src/pages/Signup.tsx");
    const projects = readProjectFile("src/pages/Projects.tsx");
    const projectBuilder = readProjectFile("src/pages/ProjectBuilder.tsx");
    const mobileNav = readProjectFile("src/components/layout/MobileNav.tsx");

    expect(login).not.toContain("Welcome to Artha");
    expect(login).not.toContain("Email Address");
    expect(login).not.toContain("Remember me");
    expect(login).not.toContain("Forgot password?");
    expect(login).not.toContain("Sign In");
    expect(forgotPassword).not.toContain("Forgot your password?");
    expect(forgotPassword).not.toContain("Reset Password");
    expect(forgotPassword).not.toContain("Send Reset Link");
    expect(signup).not.toContain("Email Address");
    expect(signup).not.toContain("Create Password");
    expect(signup).not.toContain("Log In");
    expect(projects).not.toContain('title="Projects"');
    expect(projects).not.toContain("New Project");
    expect(projects).not.toContain("No projects yet");
    expect(projectBuilder).not.toContain("New Project");
    expect(projectBuilder).not.toContain("Project Details");
    expect(projectBuilder).not.toContain("Create Project");
    expect(projectBuilder).not.toContain("Project Preview");
    expect(mobileNav).not.toContain('"Clients"');
    expect(mobileNav).not.toContain('"Invoices"');
    expect(mobileNav).not.toContain('"Services"');
    expect(mobileNav).not.toContain('"Projects"');
    expect(mobileNav).not.toContain('"Settings"');
    expect(mobileNav).not.toContain("Sign Out");
    expect(mobileNav).not.toContain(">Cancel<");
  });

  it("invoice detail, previews, and global search use Indonesian user-facing copy", () => {
    const invoiceDetail = readProjectFile("src/pages/InvoiceDetail.tsx");
    const invoicePreview = readProjectFile("src/components/invoice/InvoicePreview.tsx");
    const proposalPreview = readProjectFile("src/components/proposal/ProposalPreview.tsx");
    const globalSearch = readProjectFile("src/components/GlobalSearch.tsx");

    expect(invoiceDetail).not.toContain("Failed to load invoice");
    expect(invoiceDetail).not.toContain("Export PDF");
    expect(invoiceDetail).not.toContain("Mark as Paid");
    expect(invoiceDetail).not.toContain("Invoice not found");
    expect(invoicePreview).not.toContain("Bill To");
    expect(invoicePreview).not.toContain("Description");
    expect(invoicePreview).not.toContain("Total Due");
    expect(invoicePreview).not.toContain("Notes");
    expect(invoicePreview).not.toContain("Thank you for your business");
    expect(invoicePreview).not.toContain("Account Number");
    expect(invoicePreview).not.toContain("Account Name");
    expect(proposalPreview).not.toContain("Untitled Service");
    expect(proposalPreview).not.toContain("Untitled Phase");
    expect(proposalPreview).not.toContain("Total Investment");
    expect(globalSearch).not.toContain("Search clients, invoices, proposals...");
    expect(globalSearch).not.toContain("Searching...");
    expect(globalSearch).not.toContain("No results found.");
    expect(globalSearch).not.toContain("Quick Actions");
    expect(globalSearch).not.toContain("Search Results");
    expect(globalSearch).not.toContain("New Invoice");
  });

  it("subscription, tax, onboarding, payment, and error states avoid obvious English copy", () => {
    const taxSummary = readProjectFile("src/pages/TaxSummary.tsx");
    const upgradeModal = readProjectFile("src/components/subscription/UpgradeModal.tsx");
    const subscriptionTab = readProjectFile("src/components/settings/SubscriptionTab.tsx");
    const paymentButton = readProjectFile("src/components/contract/PaymentButton.tsx");
    const onboardingTour = readProjectFile("src/components/onboarding/OnboardingTour.tsx");
    const errorBoundary = readProjectFile("src/components/ErrorBoundary.tsx");

    expect(taxSummary).not.toContain("Export PDF");
    expect(upgradeModal).not.toContain("Upgrade Your Plan");
    expect(upgradeModal).not.toContain("Upgrade to Pro");
    expect(upgradeModal).not.toContain("Upgrade to Business");
    expect(upgradeModal).not.toContain("All plans include a 14-day free trial. Cancel anytime.");
    expect(subscriptionTab).not.toContain("Current Plan");
    expect(subscriptionTab).not.toContain("Monthly Usage");
    expect(subscriptionTab).not.toContain("Compare Plans");
    expect(subscriptionTab).not.toContain("Unlimited");
    expect(subscriptionTab).not.toContain(" invoices remaining this month");
    expect(subscriptionTab).not.toContain(" proposals remaining this month");
    expect(paymentButton).not.toContain("Total Down Payment");
    expect(paymentButton).not.toContain("Bank Transfer");
    expect(onboardingTour).not.toContain("Clients, Services, Proposals, dan Invoices");
    expect(onboardingTour).not.toContain("Explore Clients, buat Proposal, dan kirim Invoice pertama lu!");
    expect(errorBoundary).not.toContain("Something went wrong");
    expect(errorBoundary).not.toContain("Try Again");
    expect(errorBoundary).not.toContain("Refresh Page");
  });

  it("client-facing pages and proposal flow avoid obvious English UI copy", () => {
    const contractViewer = readProjectFile("src/pages/ContractViewer.tsx");
    const clientPortal = readProjectFile("src/pages/ClientPortal.tsx");
    const guestPayment = readProjectFile("src/pages/GuestPayment.tsx");
    const faq = readProjectFile("src/pages/FAQ.tsx");
    const proposalBuilder = readProjectFile("src/pages/ProposalBuilder.tsx");
    const proposalEditor = readProjectFile("src/components/proposal/ProposalEditor.tsx");
    const proposalPreview = readProjectFile("src/components/proposal/ProposalPreview.tsx");

    expect(contractViewer).not.toContain("Down Payment");
    expect(clientPortal).not.toContain("Premium Client Portal");
    expect(clientPortal).not.toContain("Download File Final");
    expect(guestPayment).not.toContain("Loading invoice...");
    expect(guestPayment).not.toContain("Invoice Not Found");
    expect(guestPayment).not.toContain("Secure Checkout");
    expect(guestPayment).not.toContain("Payment Portal");
    expect(guestPayment).not.toContain("Complete Your");
    expect(guestPayment).not.toContain("Total Amount Due");
    expect(guestPayment).not.toContain("Card Payment");
    expect(guestPayment).not.toContain("Bank Transfer Details");
    expect(faq).not.toContain("Sign Up");
    expect(faq).not.toContain("Settings >");
    expect(faq).not.toContain("Cancel Subscription");
    expect(faq).not.toContain("Enable 2FA");
    expect(proposalBuilder).not.toContain("Proposal not found");
    expect(proposalBuilder).not.toContain("The Ultimate Project Proposal");
    expect(proposalBuilder).not.toContain("Why work with me?");
    expect(proposalBuilder).not.toContain("Track Record");
    expect(proposalEditor).not.toContain("Upload Image Here");
    expect(proposalEditor).not.toContain("Headline");
    expect(proposalEditor).not.toContain("Projects");
    expect(proposalEditor).not.toContain("Countries");
    expect(proposalEditor).not.toContain("Rating");
    expect(proposalEditor).not.toContain("Scope of Work");
    expect(proposalPreview).not.toContain("Project Proposal");
    expect(proposalPreview).not.toContain("Prepared for");
    expect(proposalPreview).not.toContain("What we bring to the table");
    expect(proposalPreview).not.toContain("How we get from here to there");
    expect(proposalPreview).not.toContain("Ready to begin?");
    expect(proposalPreview).not.toContain("Let's start");
  });
});

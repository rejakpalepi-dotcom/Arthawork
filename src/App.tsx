import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { SupportWidget } from "@/components/support/SupportWidget";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

// Static imports for critical path (auth pages)
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

// Lazy-loaded pages for code splitting (reduces initial bundle size)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const Services = lazy(() => import("./pages/Services"));
const Proposals = lazy(() => import("./pages/Proposals"));
const Invoices = lazy(() => import("./pages/Invoices"));
const InvoiceBuilder = lazy(() => import("./pages/InvoiceBuilder"));
const InvoiceDetail = lazy(() => import("./pages/InvoiceDetail"));
const ProjectBuilder = lazy(() => import("./pages/ProjectBuilder"));
const ProposalBuilder = lazy(() => import("./pages/ProposalBuilder"));
const Settings = lazy(() => import("./pages/Settings"));
const GuestPayment = lazy(() => import("./pages/GuestPayment"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Checkout = lazy(() => import("./pages/Checkout"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Changelog = lazy(() => import("./pages/Changelog"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ContractViewer = lazy(() => import("./pages/ContractViewer"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const TaxSummary = lazy(() => import("./pages/TaxSummary"));
const Contracts = lazy(() => import("./pages/Contracts"));
const Projects = lazy(() => import("./pages/Projects"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

// Session persistence wrapper component
function SessionWrapper({ children }: { children: React.ReactNode }) {
  useSessionPersistence();
  return <>{children}</>;
}

/**
 * Forces light theme for public/unauthenticated routes.
 * Dark mode is only available inside the authenticated dashboard shell.
 */
function ForcedLightWrapper({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);
  return <>{children}</>;
}

const App = () => {
  return (
    <>
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="light">
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <SessionWrapper>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/login" element={<ForcedLightWrapper><Login /></ForcedLightWrapper>} />
                      <Route path="/signup" element={<ForcedLightWrapper><Signup /></ForcedLightWrapper>} />
                      <Route path="/forgot-password" element={<ForcedLightWrapper><ForgotPassword /></ForcedLightWrapper>} />
                      <Route path="/pay/:token" element={<ForcedLightWrapper><GuestPayment /></ForcedLightWrapper>} />
                      <Route path="/pricing" element={<ForcedLightWrapper><Pricing /></ForcedLightWrapper>} />
                      <Route path="/terms" element={<ForcedLightWrapper><TermsOfService /></ForcedLightWrapper>} />
                      <Route path="/privacy" element={<ForcedLightWrapper><PrivacyPolicy /></ForcedLightWrapper>} />
                      <Route path="/faq" element={<ForcedLightWrapper><FAQ /></ForcedLightWrapper>} />
                      <Route path="/changelog" element={<ForcedLightWrapper><Changelog /></ForcedLightWrapper>} />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />

                      <Route path="/contract/:token" element={<ForcedLightWrapper><ContractViewer /></ForcedLightWrapper>} />
                      <Route path="/portal/:token" element={<ForcedLightWrapper><ClientPortal /></ForcedLightWrapper>} />

                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/clients"
                        element={
                          <ProtectedRoute>
                            <Clients />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/services"
                        element={
                          <ProtectedRoute>
                            <Services />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/proposals"
                        element={
                          <ProtectedRoute>
                            <Proposals />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/contracts"
                        element={
                          <ProtectedRoute>
                            <Contracts />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/projects"
                        element={
                          <ProtectedRoute>
                            <Projects />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/invoices"
                        element={
                          <ProtectedRoute>
                            <Invoices />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/invoices/new"
                        element={
                          <ProtectedRoute>
                            <InvoiceBuilder />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/invoices/:id"
                        element={
                          <ProtectedRoute>
                            <InvoiceDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/invoices/:id/edit"
                        element={
                          <ProtectedRoute>
                            <InvoiceBuilder />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/tax-summary"
                        element={
                          <ProtectedRoute>
                            <TaxSummary />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/projects/new"
                        element={
                          <ProtectedRoute>
                            <ProjectBuilder />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/proposals/new"
                        element={
                          <ProtectedRoute>
                            <ProposalBuilder />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/proposals/:id"
                        element={
                          <ProtectedRoute>
                            <Proposals />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/proposals/:id/edit"
                        element={
                          <ProtectedRoute>
                            <ProposalBuilder />
                          </ProtectedRoute>
                        }
                      />

                      <Route path="/" element={<ForcedLightWrapper><LandingPage /></ForcedLightWrapper>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>

                  <SupportWidget whatsappNumber="6281285864059" />
                </BrowserRouter>
              </SessionWrapper>
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </>
  );
};

export default App;

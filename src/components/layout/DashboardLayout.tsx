import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileHeader } from "./MobileHeader";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { GlobalSearch } from "@/components/GlobalSearch";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Global Search (Cmd+K) - available on all pages */}
      <GlobalSearch />

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <MobileHeader title={title} />

      {/* Main Content */}
      <main className="md:pl-64 transition-all duration-300 pb-20 md:pb-0">
        <div className="min-h-screen">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}


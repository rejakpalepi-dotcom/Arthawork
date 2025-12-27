import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { driver, DriveStep, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { supabase } from "@/integrations/supabase/client";

export function OnboardingTour() {
  const location = useLocation();
  const navigate = useNavigate();
  const [shouldStartTour, setShouldStartTour] = useState(false);
  const [driverInstance, setDriverInstance] = useState<Driver | null>(null);

  const completeOnboarding = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("id", user.id);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  }, []);

  const tourSteps: DriveStep[] = [
    // Welcome Step
    {
      popover: {
        title: "WELCOME TO ARTHA",
        description: "Your professional workspace for freelance success. Let us show you how to maximize your business potential with our powerful tools.",
        side: "over",
        align: "center",
      },
    },
    // Dashboard Stats - Pipeline Value
    {
      element: '[aria-label="Business metrics"]',
      popover: {
        title: "PIPELINE VALUE",
        description: "Monitor your potential earnings from all active proposals. Watch this number grow as you send more proposals to clients.",
        side: "bottom",
        align: "start",
      },
    },
    // Revenue Trends
    {
      element: '[aria-label="Business metrics"] + section, .lg\\:col-span-2:first-child',
      popover: {
        title: "REVENUE TRENDS",
        description: "Visualize your monthly earnings with real-time charts. Track patterns and make data-driven decisions to grow your business.",
        side: "bottom",
        align: "center",
      },
    },
    // Sidebar Navigation
    {
      element: 'aside nav',
      popover: {
        title: "NAVIGATION HUB",
        description: "Access all your tools from here: Clients, Services, Proposals, and Invoices. Everything you need to run your freelance business.",
        side: "right",
        align: "start",
      },
    },
    // New Invoice Button
    {
      element: 'aside .border-b a[href="/invoices/new"]',
      popover: {
        title: "QUICK CREATE",
        description: "Create professional invoices in minutes. Click here to start billing your clients with stunning, branded documents.",
        side: "right",
        align: "start",
      },
    },
    // Clients Menu
    {
      element: 'aside nav a[href="/clients"]',
      popover: {
        title: "CLIENT MANAGEMENT",
        description: "Store all your client information here. Contact details sync automatically to every invoice and proposal you create.",
        side: "right",
        align: "center",
      },
    },
    // Services Menu
    {
      element: 'aside nav a[href="/services"]',
      popover: {
        title: "SERVICE CATALOG",
        description: "Define your services with pricing. Quickly add them to invoices without retyping—save time on every project.",
        side: "right",
        align: "center",
      },
    },
    // Proposals Menu
    {
      element: 'aside nav a[href="/proposals"]',
      popover: {
        title: "PROPOSAL BUILDER",
        description: "Create agency-quality proposals that win clients. Track Record, Investment, and Timeline sections included.",
        side: "right",
        align: "center",
      },
    },
    // Invoices Menu
    {
      element: 'aside nav a[href="/invoices"]',
      popover: {
        title: "INVOICE CENTER",
        description: "Manage all your invoices in one place. Track paid, unpaid, and overdue invoices with real-time status updates.",
        side: "right",
        align: "center",
      },
    },
    // Settings Menu
    {
      element: 'aside a[href="/settings"]',
      popover: {
        title: "BUSINESS PROFILE",
        description: "IMPORTANT: Set up your business details and upload your logo here. They'll appear on every document you create.",
        side: "right",
        align: "center",
      },
    },
  ];

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("has_completed_onboarding")
          .eq("id", user.id)
          .single();

        if (profile && !profile.has_completed_onboarding) {
          setShouldStartTour(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    // Only start tour on dashboard
    if (!shouldStartTour || location.pathname !== "/dashboard") {
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayColor: "rgba(0, 0, 0, 0.85)",
        stagePadding: 8,
        stageRadius: 12,
        popoverClass: "artha-driver-popover",
        progressText: "{{current}} of {{total}}",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Get Started",
        onDestroyStarted: () => {
          completeOnboarding();
          driverObj.destroy();
          setShouldStartTour(false);
        },
        steps: tourSteps,
      });

      setDriverInstance(driverObj);
      driverObj.drive();
    }, 800);

    return () => {
      clearTimeout(timer);
      if (driverInstance) {
        driverInstance.destroy();
      }
    };
  }, [shouldStartTour, location.pathname, completeOnboarding]);

  return null;
}

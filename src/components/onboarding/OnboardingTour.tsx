import { useEffect, useState, useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { driver, DriveStep, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { supabase } from "@/integrations/supabase/client";

export function OnboardingTour() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [shouldStartTour, setShouldStartTour] = useState(false);
  const [driverInstance, setDriverInstance] = useState<Driver | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const completeOnboarding = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("id", user.id);
      
      // Clear URL param after tour completes
      if (searchParams.has("startTour")) {
        searchParams.delete("startTour");
        setSearchParams(searchParams, { replace: true });
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  }, [searchParams, setSearchParams]);

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
      element: '[aria-label="Business metrics"] > div:first-child',
      popover: {
        title: "PIPELINE VALUE",
        description: "Ini adalah potensi duit yang lagi lu kejar dari semua proposal aktif. Pantau angka ini buat lihat seberapa besar peluang income lu.",
        side: "bottom",
        align: "start",
      },
    },
    // Acceptance Rate
    {
      element: '[aria-label="Business metrics"] > div:nth-child(2)',
      popover: {
        title: "ACCEPTANCE RATE",
        description: "Seberapa jago lu memenangkan project? Ukur efektivitas proposal lu di sini. Makin tinggi persentase, makin oke pitching lu!",
        side: "bottom",
        align: "start",
      },
    },
    // Revenue Trends
    {
      element: '.lg\\:col-span-2',
      popover: {
        title: "REVENUE TRENDS",
        description: "Visualisasi pertumbuhan pendapatan bulanan lu secara real-time. Pantau pola dan buat keputusan bisnis berbasis data.",
        side: "bottom",
        align: "center",
      },
    },
    // Sidebar Navigation
    {
      element: 'aside nav',
      popover: {
        title: "NAVIGATION HUB",
        description: "Akses semua tools lu dari sini: Clients, Services, Proposals, dan Invoices. Semua yang lu butuhkan untuk menjalankan bisnis freelance.",
        side: "right",
        align: "start",
      },
    },
    // Clients Menu
    {
      element: 'aside nav a[href="/clients"]',
      popover: {
        title: "CLIENT MANAGEMENT",
        description: "Simpan semua info klien di sini. Detail kontak otomatis sync ke setiap invoice dan proposal yang lu buat.",
        side: "right",
        align: "center",
      },
    },
    // Services Menu
    {
      element: 'aside nav a[href="/services"]',
      popover: {
        title: "SERVICE CATALOG",
        description: "Definisikan jasa lu dengan harga. Tambahkan ke invoice dengan cepat tanpa ngetik ulang—hemat waktu di setiap project.",
        side: "right",
        align: "center",
      },
    },
    // Proposals Menu
    {
      element: 'aside nav a[href="/proposals"]',
      popover: {
        title: "PROPOSAL BUILDER",
        description: "Buat proposal berkualitas agency yang memenangkan klien. Lengkap dengan Track Record, Investment, dan Timeline.",
        side: "right",
        align: "center",
      },
    },
    // Invoices Menu
    {
      element: 'aside nav a[href="/invoices"]',
      popover: {
        title: "INVOICE CENTER",
        description: "Kelola semua invoice lu di satu tempat. Track status paid, unpaid, dan overdue dengan update real-time.",
        side: "right",
        align: "center",
      },
    },
    // Quick Actions
    {
      element: 'aside a[href="/invoices/new"]',
      popover: {
        title: "QUICK CREATE",
        description: "Buat Invoice profesional dalam hitungan menit! Klik di sini untuk mulai menagih klien dengan dokumen yang stunning.",
        side: "right",
        align: "center",
      },
    },
    // Settings Menu
    {
      element: 'aside a[href="/settings"]',
      popover: {
        title: "BUSINESS PROFILE",
        description: "PENTING: Setup profil bisnis dan upload logo lu di sini. Mereka akan muncul di setiap dokumen yang lu buat!",
        side: "right",
        align: "center",
      },
    },
  ];

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (hasChecked) return;
      
      try {
        // Check if forced via URL param
        const forceStart = searchParams.get("startTour") === "true";
        
        if (forceStart) {
          setShouldStartTour(true);
          setHasChecked(true);
          return;
        }

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
        setHasChecked(true);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    if (location.pathname === "/dashboard") {
      checkOnboardingStatus();
    }
  }, [location.pathname, searchParams, hasChecked]);

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
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (driverInstance) {
        driverInstance.destroy();
      }
    };
  }, [shouldStartTour, location.pathname, completeOnboarding]);

  return null;
}

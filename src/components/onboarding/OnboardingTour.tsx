import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { driver, DriveStep, Driver } from "driver.js";
import "driver.js/dist/driver.css";

const SESSION_TOUR_KEY = "artha_tour_shown_this_session";

export function OnboardingTour() {
  const location = useLocation();
  const [shouldStartTour, setShouldStartTour] = useState(false);
  const [driverInstance, setDriverInstance] = useState<Driver | null>(null);

  const markTourComplete = useCallback(() => {
    sessionStorage.setItem(SESSION_TOUR_KEY, "true");
  }, []);

  // Detect if mobile (sidebar not visible)
  const isMobile = () => window.innerWidth < 1024;

  const getTourSteps = (): DriveStep[] => {
    const mobileMode = isMobile();

    // Base steps that work on all devices
    const baseSteps: DriveStep[] = [
      // Welcome Step
      {
        popover: {
          title: "🚀 SELAMAT DATANG DI ARTHA",
          description: "Workspace profesional untuk kesuksesan bisnis freelance lu! Yuk kita tunjukin cara memaksimalkan potensi bisnis lu.",
          side: "over",
          align: "center",
        },
      },
      // Subscription Info
      {
        popover: {
          title: "💎 PILIH PAKET LU",
          description: "Artha punya 3 paket: Free (3 invoice/bulan), Pro (Rp 50k - unlimited), dan Business (Rp 199k - fitur tim).",
          side: "over",
          align: "center",
        },
      },
      // Payment Methods
      {
        popover: {
          title: "💳 BANYAK PILIHAN PEMBAYARAN",
          description: "Terima pembayaran via QRIS, Virtual Account (BCA, Mandiri, BNI), dan E-Wallet (GoPay, OVO, DANA)!",
          side: "over",
          align: "center",
        },
      },
    ];

    // Desktop-only steps (sidebar visible)
    const desktopSteps: DriveStep[] = [
      // Pipeline Value
      {
        element: '[aria-label="Business metrics"] > div:first-child',
        popover: {
          title: "📊 PIPELINE VALUE",
          description: "Total potensi duit dari semua proposal aktif. Pantau peluang income lu!",
          side: "bottom",
          align: "start",
        },
      },
      // Acceptance Rate
      {
        element: '[aria-label="Business metrics"] > div:nth-child(2)',
        popover: {
          title: "📈 ACCEPTANCE RATE",
          description: "Seberapa jago lu memenangkan project? Makin tinggi, makin oke pitching lu!",
          side: "bottom",
          align: "start",
        },
      },
      // Sidebar Navigation
      {
        element: 'aside nav',
        popover: {
          title: "🧭 PUSAT NAVIGASI",
          description: "Akses Clients, Services, Proposals, dan Invoices dari sini.",
          side: "right",
          align: "start",
        },
      },
      // Clients
      {
        element: 'aside nav a[href="/clients"]',
        popover: {
          title: "👥 MANAJEMEN KLIEN",
          description: "Simpan semua info klien. Auto-sync ke invoice dan proposal.",
          side: "right",
          align: "center",
        },
      },
      // Invoices
      {
        element: 'aside nav a[href="/invoices"]',
        popover: {
          title: "💰 PUSAT INVOICE",
          description: "Track status lunas, belum bayar, dan overdue.",
          side: "right",
          align: "center",
        },
      },
      // New Invoice Button
      {
        element: 'aside a[href="/invoices/new"]',
        popover: {
          title: "⚡ BUAT CEPAT",
          description: "Klik untuk buat Invoice profesional dalam hitungan menit!",
          side: "right",
          align: "center",
        },
      },
      // Settings
      {
        element: 'aside a[href="/settings"]',
        popover: {
          title: "⚙️ PENGATURAN",
          description: "Setup profil bisnis dan kelola subscription lu di sini.",
          side: "right",
          align: "center",
        },
      },
      // NEW: Contracts (Antigravity Update)
      {
        popover: {
          title: "📜 KONTRAK CERDAS (BARU!)",
          description: "Buat kontrak digital dengan tanda tangan elektronik. Client harus bayar DP dulu sebelum project dimulai - anti ghosting!",
          side: "over",
          align: "center",
        },
      },
      // NEW: Client Portal (Antigravity Update)
      {
        popover: {
          title: "🌌 PORTAL KLIEN PREMIUM (BARU!)",
          description: "Bagikan portal khusus ke klien untuk review desain. Mereka bisa klik langsung di gambar untuk kasih feedback - UI super premium!",
          side: "over",
          align: "center",
        },
      },
      // NEW: Tax Calculator (Antigravity Update)
      {
        popover: {
          title: "🧮 KALKULATOR PAJAK (BARU!)",
          description: "Otomatis hitung PPh 21 dan PPh 23 di invoice. Ada rekapitulasi tahunan untuk bantu isi SPT. Cocok buat klien korporat!",
          side: "over",
          align: "center",
        },
      },
    ];

    // Mobile-only steps (focus on visible elements)
    const mobileSteps: DriveStep[] = [
      // Stats cards (exist on mobile)
      {
        popover: {
          title: "📊 DASHBOARD STATS",
          description: "Lihat Pipeline Value, Acceptance Rate, dan Total Earnings di bagian atas. Scroll untuk jelajahi fitur lainnya!",
          side: "over",
          align: "center",
        },
      },
      // Bottom navigation hint
      {
        popover: {
          title: "📱 NAVIGASI MOBILE",
          description: "Gunakan menu di pojok kiri atas (☰) untuk akses Clients, Proposals, Invoices, dan Settings.",
          side: "over",
          align: "center",
        },
      },
    ];

    // Final step for all
    const finalStep: DriveStep = {
      popover: {
        title: "⌨️ TIPS PRO",
        description: mobileMode
          ? "Tap menu ☰ untuk mulai! Explore Clients, buat Proposal, dan kirim Invoice pertama lu!"
          : "Cmd+K = Global Search, Cmd+N = New Project. Kerja makin cepat!",
        side: "over",
        align: "center",
      },
    };

    if (mobileMode) {
      return [...baseSteps, ...mobileSteps, finalStep];
    } else {
      return [...baseSteps, ...desktopSteps, finalStep];
    }
  };

  useEffect(() => {
    // Auto-start on Dashboard mount if not shown this session
    if (location.pathname === "/dashboard") {
      const alreadyShown = sessionStorage.getItem(SESSION_TOUR_KEY);
      if (!alreadyShown) {
        setShouldStartTour(true);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    // Only start tour on dashboard
    if (!shouldStartTour || location.pathname !== "/dashboard") {
      return;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const tourSteps = getTourSteps();

      const driverObj = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayColor: "rgba(0, 0, 0, 0.85)",
        stagePadding: 8,
        stageRadius: 12,
        popoverClass: "artha-driver-popover",
        progressText: "{{current}} dari {{total}}",
        nextBtnText: "Lanjut →",
        prevBtnText: "← Kembali",
        doneBtnText: "Mulai! 🚀",
        onDestroyStarted: () => {
          markTourComplete();
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
  }, [shouldStartTour, location.pathname, markTourComplete]);

  return null;
}

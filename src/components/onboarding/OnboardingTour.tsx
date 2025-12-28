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

  const tourSteps: DriveStep[] = [
    // Welcome Step
    {
      popover: {
        title: "🚀 SELAMAT DATANG DI ARTHA",
        description: "Workspace profesional untuk kesuksesan bisnis freelance lu! Yuk kita tunjukin cara memaksimalkan potensi bisnis lu dengan tools canggih kita.",
        side: "over",
        align: "center",
      },
    },
    // Subscription Intro
    {
      popover: {
        title: "💎 PILIH PAKET LU",
        description: "Artha punya 3 paket: Free (3 invoice/bulan), Pro (Rp 50k - unlimited), dan Business (Rp 199k - fitur tim). Mulai gratis dan upgrade kapan aja!",
        side: "over",
        align: "center",
      },
    },
    // Payment Methods
    {
      popover: {
        title: "💳 BANYAK PILIHAN PEMBAYARAN",
        description: "Terima pembayaran via QRIS, Virtual Account (BCA, Mandiri, BNI), dan E-Wallet (GoPay, OVO, DANA). Klien lu bisa bayar sesuai preferensi mereka!",
        side: "over",
        align: "center",
      },
    },
    // Dashboard Stats - Pipeline Value
    {
      element: '[aria-label="Business metrics"] > div:first-child',
      popover: {
        title: "📊 PIPELINE VALUE",
        description: "Ini adalah potensi duit yang lagi lu kejar dari semua proposal aktif. Pantau angka ini buat lihat seberapa besar peluang income lu.",
        side: "bottom",
        align: "start",
      },
    },
    // Acceptance Rate
    {
      element: '[aria-label="Business metrics"] > div:nth-child(2)',
      popover: {
        title: "📈 ACCEPTANCE RATE",
        description: "Seberapa jago lu memenangkan project? Ukur efektivitas proposal lu di sini. Makin tinggi persentase, makin oke pitching lu!",
        side: "bottom",
        align: "start",
      },
    },
    // Revenue Trends
    {
      element: '.lg\\:col-span-2',
      popover: {
        title: "📉 TREN PENDAPATAN",
        description: "Visualisasi pertumbuhan pendapatan bulanan lu secara real-time. Pantau pola dan buat keputusan bisnis berbasis data.",
        side: "bottom",
        align: "center",
      },
    },
    // Sidebar Navigation
    {
      element: 'aside nav',
      popover: {
        title: "🧭 PUSAT NAVIGASI",
        description: "Akses semua tools lu dari sini: Clients, Services, Proposals, dan Invoices. Semua yang lu butuhkan untuk menjalankan bisnis freelance.",
        side: "right",
        align: "start",
      },
    },
    // Clients Menu
    {
      element: 'aside nav a[href="/clients"]',
      popover: {
        title: "👥 MANAJEMEN KLIEN",
        description: "Simpan semua info klien di sini. Detail kontak otomatis sync ke setiap invoice dan proposal yang lu buat.",
        side: "right",
        align: "center",
      },
    },
    // Proposals Menu
    {
      element: 'aside nav a[href="/proposals"]',
      popover: {
        title: "📝 PROPOSAL BUILDER",
        description: "Buat proposal berkualitas agency yang memenangkan klien. Lengkap dengan Track Record, Investment, dan Timeline.",
        side: "right",
        align: "center",
      },
    },
    // Invoices Menu
    {
      element: 'aside nav a[href="/invoices"]',
      popover: {
        title: "💰 PUSAT INVOICE",
        description: "Kelola semua invoice lu di satu tempat. Track status lunas, belum bayar, dan overdue dengan update real-time.",
        side: "right",
        align: "center",
      },
    },
    // Quick Actions
    {
      element: 'aside a[href="/invoices/new"]',
      popover: {
        title: "⚡ BUAT CEPAT",
        description: "Buat Invoice profesional dalam hitungan menit! Klik di sini untuk mulai menagih klien dengan dokumen yang stunning.",
        side: "right",
        align: "center",
      },
    },
    // Settings Menu
    {
      element: 'aside a[href="/settings"]',
      popover: {
        title: "⚙️ PENGATURAN & LANGGANAN",
        description: "Setup profil bisnis, upload logo, dan kelola subscription lu di sini. Upgrade ke Pro untuk fitur unlimited!",
        side: "right",
        align: "center",
      },
    },
    // Keyboard Shortcuts Tip
    {
      popover: {
        title: "⌨️ TIPS PRO",
        description: "Gunakan Cmd+K untuk Global Search, Cmd+N untuk New Project, dan Cmd+Shift+I untuk New Invoice. Kerja makin cepat!",
        side: "over",
        align: "center",
      },
    },
  ];

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

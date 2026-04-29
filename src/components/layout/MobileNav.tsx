import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Menu,
  X,
  Briefcase,
  Settings,
  LogOut,
  Plus,
  FileSignature,
  FolderKanban,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const arthaLogo = "/icon-512.png";

const bottomNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Klien", icon: Users, path: "/clients" },
  { label: "Baru", icon: Plus, path: "/invoices/new", isAction: true },
  { label: "Invoice", icon: Receipt, path: "/invoices" },
  { label: "Menu", icon: Menu, path: "" },
];

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Klien", icon: Users, path: "/clients" },
  { label: "Layanan", icon: Briefcase, path: "/services" },
  { label: "Proposal", icon: FileText, path: "/proposals" },
  { label: "Kontrak", icon: FileSignature, path: "/contracts" },
  { label: "Proyek", icon: FolderKanban, path: "/projects" },
  { label: "Invoice", icon: Receipt, path: "/invoices" },
  { label: "Ringkasan Pajak", icon: Calculator, path: "/tax-summary" },
  { label: "Pengaturan", icon: Settings, path: "/settings" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    sessionStorage.removeItem('artha_session_only');
    localStorage.removeItem('sb-sfkcncwbsoaqqteqguyf-auth-token');
    await supabase.auth.signOut();
    toast({
      title: "Berhasil keluar",
      description: "Kamu sudah keluar dari akun.",
    });
    navigate("/login", { replace: true });
  };

  const handleNavClick = (item: typeof bottomNavItems[0]) => {
    if (item.label === "Menu") {
      setIsOpen(true);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        data-ui-panel="mobile-nav"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-sidebar-border/70 bg-sidebar/92 backdrop-blur-xl md:hidden"
      >
        <div className="safe-area-inset-bottom mx-3 my-2 flex h-[4.5rem] items-center justify-around rounded-[28px] border border-sidebar-border/80 bg-sidebar px-2 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.65)]">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isActionButton = item.isAction;

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center px-2 py-1 transition-all",
                  isActionButton
                    ? "-mt-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25"
                    : isActive
                      ? "rounded-2xl bg-primary/10 text-primary"
                      : "rounded-2xl text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className={cn("shrink-0", isActionButton ? "w-6 h-6" : "w-5 h-5")} />
                {!isActionButton && (
                  <span className="mt-1 text-[10px] font-semibold tracking-wide">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Hamburger Menu Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[300px] border-sidebar-border/80 bg-sidebar/98 p-0 backdrop-blur-xl">
          <SheetHeader className="border-b border-sidebar-border/80 px-5 py-5">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sidebar-border/80 bg-card/80 shadow-sm">
                <img src={arthaLogo} alt="Artha" className="h-8 w-8 rounded-xl" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Menu
                </p>
                <span className="font-bold text-foreground">Artha</span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="px-3 py-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex min-h-[52px] items-center gap-3 rounded-2xl px-4 py-3 transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border/80 bg-sidebar/96 p-4">
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <AlertDialogTrigger asChild>
                <button className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Keluar</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[28px] border-border/70 bg-background/95 shadow-2xl backdrop-blur-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Keluar dari Artha?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan mengakhiri sesi kamu saat ini.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                    Keluar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

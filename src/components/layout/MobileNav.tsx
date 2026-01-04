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
  { label: "Clients", icon: Users, path: "/clients" },
  { label: "New", icon: Plus, path: "/invoices/new", isAction: true },
  { label: "Invoices", icon: Receipt, path: "/invoices" },
  { label: "Menu", icon: Menu, path: "" },
];

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Clients", icon: Users, path: "/clients" },
  { label: "Services", icon: Briefcase, path: "/services" },
  { label: "Proposals", icon: FileText, path: "/proposals" },
  { label: "Contracts", icon: FileSignature, path: "/contracts" },
  { label: "Projects", icon: FolderKanban, path: "/projects" },
  { label: "Invoices", icon: Receipt, path: "/invoices" },
  { label: "Tax Summary", icon: Calculator, path: "/tax-summary" },
  { label: "Settings", icon: Settings, path: "/settings" },
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
      title: "Signed out",
      description: "You have been signed out successfully.",
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2 safe-area-inset-bottom">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isActionButton = item.isAction;

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 py-1 rounded-lg transition-colors",
                  isActionButton
                    ? "bg-primary text-primary-foreground -mt-4 w-14 h-14 rounded-full shadow-lg"
                    : isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("shrink-0", isActionButton ? "w-6 h-6" : "w-5 h-5")} />
                {!isActionButton && (
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Hamburger Menu Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[280px] bg-sidebar border-sidebar-border p-0">
          <SheetHeader className="p-4 border-b border-sidebar-border">
            <SheetTitle className="flex items-center gap-2">
              <img src={arthaLogo} alt="Artha" className="h-8 w-8" />
              <span className="font-bold text-foreground">Artha</span>
            </SheetTitle>
          </SheetHeader>

          <div className="py-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 min-h-[48px] transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-3 w-full px-4 py-3 min-h-[48px] text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out of Artha?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end your current session.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                    Sign Out
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

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Settings,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
} from "lucide-react";
import { ArthaLogo, ArthaSymbol } from "@/components/brand/ArthaLogo";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Clients", icon: Users, path: "/clients" },
  { label: "Services", icon: Briefcase, path: "/services" },
  { label: "Proposals", icon: FileText, path: "/proposals" },
  { label: "Invoices", icon: Receipt, path: "/invoices" },
];

const bottomItems = [
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    // Clear all session-related storage
    sessionStorage.removeItem('artha_session_only');
    localStorage.removeItem('sb-sfkcncwbsoaqqteqguyf-auth-token');
    
    await supabase.auth.signOut();
    
    toast({
      title: "Signed out",
      description: "You have been signed out and your session has been cleared.",
    });
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-2 overflow-hidden", collapsed && "justify-center")}>
          {collapsed ? (
            <ArthaSymbol size="md" />
          ) : (
            <ArthaLogo size="md" withHover />
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground",
            collapsed && "absolute -right-3 top-6 bg-sidebar border border-sidebar-border"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action */}
      <div className="p-3 border-b border-sidebar-border">
        <NavLink
          to="/invoices/new"
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium transition-all duration-200 hover:bg-primary/90",
            collapsed && "justify-center px-2"
          )}
        >
          <Plus className="w-5 h-5 shrink-0" />
          {!collapsed && <span>New Invoice</span>}
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "sidebar-item",
                isActive ? "sidebar-item-active" : "sidebar-item-inactive",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "sidebar-item",
                isActive ? "sidebar-item-active" : "sidebar-item-inactive",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogTrigger asChild>
            <button
              className={cn(
                "sidebar-item sidebar-item-inactive w-full",
                collapsed && "justify-center px-2"
              )}
              aria-label="Sign out of your account"
            >
              <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out of Artha?</AlertDialogTitle>
              <AlertDialogDescription>
                This will end your current session and clear all stored authentication data. 
                You'll need to sign in again to access your account.
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
    </aside>
  );
}

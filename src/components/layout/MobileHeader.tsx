import { NotificationCenter } from "@/components/NotificationCenter";
import { useTheme } from "next-themes";
import { Moon, Sun, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { matchRoute } from "@/lib/routeConfig";

const arthaLogo = "/icon-512.png";

interface MobileHeaderProps {
  title?: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const location = useLocation();
  const routeConfig = matchRoute(location.pathname);

  // Build display: section + page title, or just page title
  const section = routeConfig?.section;
  const pageTitle = title || routeConfig?.title || "Artha";

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2 min-w-0">
          <img src={arthaLogo} alt="Artha" className="h-7 w-7 rounded-lg shrink-0" />
          {section ? (
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-sm text-muted-foreground shrink-0">
                {section}
              </span>
              <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
              <span className="font-semibold text-foreground text-sm truncate">
                {pageTitle}
              </span>
            </div>
          ) : (
            <span className="font-semibold text-foreground text-lg truncate">
              {pageTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="h-9 w-9 rounded-lg border border-border bg-card/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}

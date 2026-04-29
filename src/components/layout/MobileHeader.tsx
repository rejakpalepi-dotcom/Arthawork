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
    <header
      data-ui-panel="mobile-header"
      className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl md:hidden"
    >
      <div className="flex min-h-[4.25rem] items-center justify-between px-4 py-3">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-card/85 shadow-sm">
            <img src={arthaLogo} alt="Artha" className="h-7 w-7 rounded-xl shrink-0" />
          </div>
          {section ? (
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {section}
              </p>
              <div className="mt-0.5 flex min-w-0 items-center gap-1">
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {pageTitle}
                </span>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Workspace
              </p>
              <span className="block truncate text-base font-semibold tracking-tight text-foreground">
                {pageTitle}
              </span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-card/85 text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:text-foreground"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Ganti tema"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}

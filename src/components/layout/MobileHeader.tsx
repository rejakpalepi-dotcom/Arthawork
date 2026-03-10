import { NotificationCenter } from "@/components/NotificationCenter";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const arthaLogo = "/icon-512.png";

interface MobileHeaderProps {
  title?: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <img src={arthaLogo} alt="Artha" className="h-7 w-7 rounded-lg" />
          <span className="font-bold text-foreground text-lg">
            {title || "Artha"}
          </span>
        </div>
        <div className="flex items-center gap-2">
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

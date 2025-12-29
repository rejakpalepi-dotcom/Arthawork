import { NotificationCenter } from "@/components/NotificationCenter";

const arthaLogo = "/icon-512.png";

interface MobileHeaderProps {
  title?: string;
}

export function MobileHeader({ title }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <img src={arthaLogo} alt="Artha" className="h-7 w-7 rounded-lg" />
          <span className="font-bold text-foreground text-lg">
            {title || "Artha"}
          </span>
        </div>
        {/* Functional NotificationCenter for mobile */}
        <NotificationCenter />
      </div>
    </header>
  );
}

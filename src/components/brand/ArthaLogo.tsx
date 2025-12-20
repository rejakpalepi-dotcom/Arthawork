import { cn } from "@/lib/utils";

interface ArthaLogoProps {
  className?: string;
  showSymbolOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  withHover?: boolean;
}

const sizeMap = {
  sm: { symbol: "h-6 w-6", text: "text-lg" },
  md: { symbol: "h-8 w-8", text: "text-xl" },
  lg: { symbol: "h-10 w-10", text: "text-2xl" },
  xl: { symbol: "h-14 w-14", text: "text-4xl" },
};

export function ArthaSymbol({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizeMap[size].symbol, "shrink-0", className)}
      aria-hidden="true"
    >
      {/* Abstract minimalist 'A' - two diagonal lines with horizontal bar */}
      <defs>
        <linearGradient id="arthaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(187, 100%, 45%)" />
          <stop offset="100%" stopColor="hsl(187, 100%, 38%)" />
        </linearGradient>
      </defs>
      
      {/* Left diagonal stroke */}
      <path
        d="M8 40L22 8"
        stroke="url(#arthaGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Right diagonal stroke */}
      <path
        d="M26 8L40 40"
        stroke="url(#arthaGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Horizontal bar */}
      <path
        d="M14 28H34"
        stroke="url(#arthaGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArthaLogo({
  className,
  showSymbolOnly = false,
  size = "md",
  withHover = false,
}: ArthaLogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        withHover && "transition-transform duration-200 hover:scale-105 cursor-pointer",
        withHover && "[&:hover_svg]:drop-shadow-[0_0_8px_hsl(187,100%,45%)]",
        className
      )}
    >
      <ArthaSymbol size={size} className="transition-all duration-200" />
      
      {!showSymbolOnly && (
        <span
          className={cn(
            "font-black tracking-tighter",
            sizeMap[size].text
          )}
        >
          <span className="text-primary">A</span>
          <span className="text-foreground">rtha</span>
        </span>
      )}
    </div>
  );
}

export function ArthaLogoFooter({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <ArthaLogo size="lg" withHover />
      <p className="text-muted-foreground text-sm font-medium tracking-wide">
        Modern Business Infrastructure
      </p>
    </div>
  );
}

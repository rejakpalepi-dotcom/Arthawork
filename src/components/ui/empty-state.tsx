import { LucideIcon, Sparkles, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: "default" | "minimal";
  tips?: string[];
}

// Animated gradient background for visual appeal
function IllustrationBackground({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="relative mb-6">
      {/* Glow effect */}
      <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-primary/20 via-cyan-500/10 to-transparent rounded-full scale-150" />

      {/* Outer ring */}
      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
        {/* Inner icon container */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
          <Icon className="w-7 h-7 text-primary" />
        </div>

        {/* Decorative sparkle */}
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-primary/60 animate-pulse" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = "default",
  tips
}: EmptyStateProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm" className="mt-4">
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <IllustrationBackground icon={Icon} />

      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>

      {/* Tips section */}
      {tips && tips.length > 0 && (
        <div className="w-full max-w-sm mb-6 space-y-2">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-left p-3 rounded-lg bg-secondary/50 border border-border"
            >
              <Lightbulb className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2 group">
          {actionLabel}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      )}
    </div>
  );
}


import { CheckCircle, AlertCircle, Loader2, Circle } from "lucide-react";
import type { AutosaveStatus } from "@/hooks/useAutosave";
import { cn } from "@/lib/utils";

interface SaveStatusIndicatorProps {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  error: string | null;
  onRetry?: () => void;
  className?: string;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function SaveStatusIndicator({
  status,
  lastSavedAt,
  error,
  onRetry,
  className,
}: SaveStatusIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      {status === "idle" && (
        <>
          <Circle className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-muted-foreground/60">No changes</span>
        </>
      )}

      {status === "unsaved" && (
        <>
          <Circle className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-amber-500 dark:text-amber-400">Unsaved changes</span>
        </>
      )}

      {status === "saving" && (
        <>
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      )}

      {status === "saved" && (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400">
            Saved{lastSavedAt ? ` at ${formatTime(lastSavedAt)}` : ""}
          </span>
        </>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-destructive" />
          <span className="text-destructive">
            {error || "Failed to save"}
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

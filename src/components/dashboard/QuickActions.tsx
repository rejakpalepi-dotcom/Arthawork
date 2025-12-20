import { Plus, Send, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { label: "New Invoice", icon: Plus, variant: "default" as const },
  { label: "New Proposal", icon: FileText, variant: "secondary" as const },
  { label: "Add Client", icon: Users, variant: "secondary" as const },
  { label: "Send Reminder", icon: Send, variant: "secondary" as const },
];

export function QuickActions() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <action.icon className="w-5 h-5" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

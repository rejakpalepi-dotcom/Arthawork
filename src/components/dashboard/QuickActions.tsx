import { FilePlus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  { label: "New Invoice", icon: FilePlus, path: "/invoices/new" },
  { label: "Proposal", icon: FileText, path: "/proposals/new" },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 hover:bg-secondary transition-all duration-200"
          >
            <div className="p-3 rounded-xl bg-card">
              <action.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

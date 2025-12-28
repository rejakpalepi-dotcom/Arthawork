import { FilePlus, FileText, Users, FolderOpen, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";

const actions = [
  { label: "New Invoice", icon: FilePlus, path: "/invoices/new", color: "text-primary" },
  { label: "New Proposal", icon: FileText, path: "/proposals/new", color: "text-primary" },
  { label: "Add Client", icon: Users, path: null, action: "add-client", color: "text-success" },
  { label: "New Project", icon: FolderOpen, path: "/projects/new", color: "text-warning" },
];

export function QuickActions() {
  const navigate = useNavigate();
  const { exportReport } = useDashboardData();

  const handleAction = (action: typeof actions[0]) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.action === "add-client") {
      navigate("/clients");
      // The clients page has an "Add Client" button/modal
    }
  };

  const handleExport = () => {
    exportReport();
    toast.success("Report exported", {
      description: "Your monthly report has been downloaded as a CSV file.",
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleAction(action)}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 hover:bg-secondary transition-all duration-200"
          >
            <div className="p-2.5 rounded-xl bg-card">
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
      {/* Export Button */}
      <button
        onClick={handleExport}
        className="w-full mt-3 flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all duration-200"
      >
        <FileDown className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">Export Report</span>
      </button>
    </div>
  );
}


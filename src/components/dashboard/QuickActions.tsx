import { FilePlus, FileText, Users, FolderOpen, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const actions = [
  { label: "INVOICE BARU", icon: FilePlus, path: "/invoices/new", color: "text-primary" },
  { label: "PROPOSAL BARU", icon: FileText, path: "/proposals/new", color: "text-primary" },
  { label: "TAMBAH KLIEN", icon: Users, path: null, action: "add-client", color: "text-success" },
  { label: "PROYEK BARU", icon: FolderOpen, path: "/projects/new", color: "text-warning" },
];

interface QuickActionsProps {
  onExportReport: () => void;
}

export function QuickActions({ onExportReport }: QuickActionsProps) {
  const navigate = useNavigate();

  const handleAction = (action: typeof actions[0]) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.action === "add-client") {
      navigate("/clients");
      // Halaman klien menyediakan alur tambah klien.
    }
  };

  const handleExport = () => {
    onExportReport();
    toast.success("Laporan berhasil diekspor", {
      description: "Laporan bulanan kamu sudah diunduh dalam format CSV.",
    });
  };

  return (
    <div className="glass-card rounded-[28px] border border-border/70 p-6 shadow-sm animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold uppercase tracking-[0.04em] text-foreground">AKSI CEPAT</h3>
        <p className="mt-1 text-sm text-muted-foreground">Pintasan kerja untuk alur yang paling sering dipakai.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleAction(action)}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-secondary/40 border border-border/70 hover:border-primary/30 hover:bg-secondary transition-all duration-200"
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
        <span className="text-sm font-medium text-primary">EKSPOR LAPORAN</span>
      </button>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, MoreHorizontal, Check, X, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Project {
  id: string;
  client: string;
  clientInitials: string;
  title: string;
  deadline: string;
  progress: number;
  status: "draft" | "sent" | "approved" | "rejected" | "progressing" | "done" | "canceled";
  total: number;
}

interface ActiveProjectsProps {
  projects: Project[];
  loading?: boolean;
  onStatusChange?: () => void;
}

// Status configuration with Electric Cyan theme
const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border border-border", icon: Clock },
  sent: { label: "Sent", color: "bg-warning/20 text-warning border border-warning/30", icon: Clock },
  approved: { label: "Approved", color: "bg-success/20 text-success border border-success/30", icon: Check },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive border border-destructive/30", icon: X },
  progressing: { label: "Progressing", color: "bg-primary/20 text-primary border border-primary/30", icon: Clock },
  done: { label: "Done", color: "bg-success/20 text-success border border-success/30", icon: Check },
  canceled: { label: "Canceled", color: "bg-destructive/20 text-destructive border border-destructive/30", icon: X },
};

const avatarColors = [
  "bg-amber-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-sky-600",
];

export function ActiveProjects({ projects, loading, onStatusChange }: ActiveProjectsProps) {
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setUpdatingId(projectId);
    try {
      const { error } = await supabase
        .from("proposals")
        .update({ status: newStatus })
        .eq("id", projectId);

      if (error) throw error;

      toast.success(`Status updated to ${statusConfig[newStatus as keyof typeof statusConfig]?.label || newStatus}`);
      onStatusChange?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to update status: " + message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Active Projects</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Active Projects</h3>
        <button
          onClick={() => navigate("/proposals")}
          className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
        >
          View All
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No active projects"
          description="Projects will appear here when you create proposals."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</th>
                <th className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                <th className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Status</th>
                <th className="pb-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {projects.map((project, index) => {
                const status = statusConfig[project.status] || statusConfig.draft;
                const avatarColor = avatarColors[index % avatarColors.length];
                const StatusIcon = status.icon;
                const isUpdating = updatingId === project.id;

                return (
                  <tr key={project.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("w-8 h-8", avatarColor)}>
                          <AvatarFallback className={cn("text-xs font-medium text-white", avatarColor)}>
                            {project.clientInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">{project.client}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-muted-foreground">{project.title}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-medium text-foreground">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(project.total)}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium gap-1.5",
                        status.color,
                        isUpdating && "opacity-50"
                      )}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                            disabled={isUpdating}
                          >
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(project.id, "progressing")}
                            className="gap-2"
                          >
                            <Clock className="w-4 h-4 text-primary" />
                            <span>Progressing</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(project.id, "done")}
                            className="gap-2"
                          >
                            <Check className="w-4 h-4 text-success" />
                            <span>Done</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(project.id, "canceled")}
                            className="gap-2"
                          >
                            <X className="w-4 h-4 text-destructive" />
                            <span>Canceled</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => navigate(`/proposals/${project.id}/edit`)}
                            className="gap-2"
                          >
                            Edit Proposal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

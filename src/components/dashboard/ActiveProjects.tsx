import { useNavigate } from "react-router-dom";
import { Folder } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Project {
  id: string;
  client: string;
  clientInitials: string;
  title: string;
  deadline: string;
  progress: number;
  status: "in_progress" | "review" | "planning";
}

interface ActiveProjectsProps {
  projects: Project[];
  loading?: boolean;
}

const statusConfig = {
  in_progress: { label: "In Progress", color: "bg-primary/20 text-primary border border-primary/30" },
  review: { label: "Review", color: "bg-warning/20 text-warning border border-warning/30" },
  planning: { label: "Planning", color: "bg-muted text-muted-foreground border border-border" },
};

const avatarColors = [
  "bg-amber-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-sky-600",
];

export function ActiveProjects({ projects, loading }: ActiveProjectsProps) {
  const navigate = useNavigate();

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
          description="Projects will appear here when you create them."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</th>
                <th className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Deadline</th>
                <th className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</th>
                <th className="pb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {projects.map((project, index) => {
                const status = statusConfig[project.status];
                const avatarColor = avatarColors[index % avatarColors.length];
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
                      <span className="text-sm text-muted-foreground">{project.deadline}</span>
                    </td>
                    <td className="py-4">
                      <div className="w-32">
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-medium", status.color)}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                        {status.label}
                      </span>
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

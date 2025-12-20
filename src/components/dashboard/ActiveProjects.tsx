import { Clock, CheckCircle, AlertCircle, Folder } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface Project {
  id: string;
  client: string;
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
  in_progress: { label: "In Progress", color: "bg-primary/20 text-primary" },
  review: { label: "Review", color: "bg-warning/20 text-warning" },
  planning: { label: "Planning", color: "bg-muted text-muted-foreground" },
};

export function ActiveProjects({ projects, loading }: ActiveProjectsProps) {
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Active Projects</h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
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
              <tr className="text-left border-b border-border">
                <th className="pb-3 text-xs font-medium text-muted-foreground">Client</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground">Project</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground">Deadline</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground">Progress</th>
                <th className="pb-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const status = statusConfig[project.status];
                return (
                  <tr key={project.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 text-sm font-medium text-foreground">{project.client}</td>
                    <td className="py-4 text-sm text-muted-foreground">{project.title}</td>
                    <td className="py-4 text-sm text-muted-foreground">{project.deadline}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", status.color)}>
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

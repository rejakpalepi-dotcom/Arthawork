import { FileText, Receipt, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "invoice" | "proposal" | "client";
  title: string;
  subtitle: string;
  timestamp: string;
  status?: "sent" | "paid" | "approved" | "draft";
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "invoice",
    title: "Invoice #INV-001 Sent",
    subtitle: "Acme Corporation - $2,500.00",
    timestamp: "2 hours ago",
    status: "sent",
  },
  {
    id: "2",
    type: "proposal",
    title: "Proposal Approved",
    subtitle: "Tech Startup Inc - Website Redesign",
    timestamp: "5 hours ago",
    status: "approved",
  },
  {
    id: "3",
    type: "client",
    title: "New Client Added",
    subtitle: "Digital Agency Co.",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    type: "invoice",
    title: "Payment Received",
    subtitle: "Creative Labs - $4,200.00",
    timestamp: "2 days ago",
    status: "paid",
  },
];

const iconMap = {
  invoice: Receipt,
  proposal: FileText,
  client: Users,
};

const statusColors = {
  sent: "bg-warning/20 text-warning",
  paid: "bg-success/20 text-success",
  approved: "bg-primary/20 text-primary",
  draft: "bg-muted text-muted-foreground",
};

export function RecentActivity() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        {mockActivities.map((activity, index) => {
          const Icon = iconMap[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-2 rounded-lg bg-secondary">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {activity.timestamp}
                </div>
                {activity.status && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                      statusColors[activity.status]
                    )}
                  >
                    {activity.status}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

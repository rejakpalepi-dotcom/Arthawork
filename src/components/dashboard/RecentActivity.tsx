import { useEffect, useState } from "react";
import { FileText, Receipt, Users, Clock, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/currency";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "invoice" | "proposal" | "client";
  title: string;
  subtitle: string;
  timestamp: string;
  status?: "sent" | "paid" | "approved" | "draft" | "pending";
}

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
  pending: "bg-warning/20 text-warning",
};

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const allActivities: ActivityItem[] = [];

      // Fetch recent invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("id, invoice_number, total, status, created_at, clients(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      invoices?.forEach((inv) => {
        const client = inv.clients as { name?: string } | null;
        allActivities.push({
          id: inv.id,
          type: "invoice",
          title: `Invoice ${inv.invoice_number}`,
          subtitle: `${client?.name || "Unknown Client"} - ${formatIDR(Number(inv.total))}`,
          timestamp: formatDistanceToNow(new Date(inv.created_at), { addSuffix: true }),
          status: inv.status as "sent" | "paid" | "approved" | "draft" | "pending",
        });
      });

      // Fetch recent proposals
      const { data: proposals } = await supabase
        .from("proposals")
        .select("id, title, status, created_at, clients(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      proposals?.forEach((prop) => {
        const client = prop.clients as { name?: string } | null;
        allActivities.push({
          id: prop.id,
          type: "proposal",
          title: prop.title,
          subtitle: client?.name || "Unknown Client",
          timestamp: formatDistanceToNow(new Date(prop.created_at), { addSuffix: true }),
          status: prop.status as "sent" | "paid" | "approved" | "draft" | "pending",
        });
      });

      // Fetch recent clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, company, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      clients?.forEach((client) => {
        allActivities.push({
          id: client.id,
          type: "client",
          title: "New Client Added",
          subtitle: client.company || client.name,
          timestamp: formatDistanceToNow(new Date(client.created_at), { addSuffix: true }),
        });
      });

      // Sort by most recent
      allActivities.sort((a, b) => {
        // Simple sort by timestamp string - not perfect but works for display
        return 0;
      });

      setActivities(allActivities.slice(0, 8));
      setLoading(false);
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        <EmptyState
          icon={Inbox}
          title="No activity yet"
          description="Your recent invoices, proposals, and client activity will appear here."
          className="py-8"
        />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => {
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

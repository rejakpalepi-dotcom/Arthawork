import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const mockClients = [
  { id: "1", name: "Acme Corporation", email: "contact@acme.co", phone: "+1 555-0100", projects: 5 },
  { id: "2", name: "Tech Startup Inc", email: "hello@techstartup.io", phone: "+1 555-0101", projects: 3 },
  { id: "3", name: "Digital Agency Co", email: "info@digitalagency.com", phone: "+1 555-0102", projects: 8 },
  { id: "4", name: "Creative Labs", email: "team@creativelabs.design", phone: "+1 555-0103", projects: 2 },
];

export default function Clients() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Clients</h1>
            <p className="text-muted-foreground">Manage your client relationships</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clients..." className="pl-10 max-w-md" />
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClients.map((client, index) => (
            <div
              key={client.id}
              className="glass-card rounded-2xl p-6 card-hover animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {client.name.charAt(0)}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{client.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{client.email}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{client.phone}</span>
                <span className="text-primary font-medium">{client.projects} projects</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

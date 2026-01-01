import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Search, MoreVertical, Users, Mail, Phone, Building2, User, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { AddClientModal } from "@/components/modals/AddClientModal";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  created_at: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; client: Client | null }>({
    open: false,
    client: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; clientId: string | null }>({
    open: false,
    clientId: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("clients")
      .select("id, name, email, phone, company, address, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setClients(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.clientId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", deleteModal.clientId);

      if (error) throw error;
      toast.success("Client deleted successfully!");
      fetchClients();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete client";
      toast.error(message);
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, clientId: null });
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Clients</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage your client relationships</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Clients</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage your client relationships</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto min-h-[44px]" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4 md:mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-10 w-full md:max-w-md min-h-[44px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Clients Grid */}
        {clients.length === 0 ? (
          <div className="glass-card rounded-2xl">
            <EmptyState
              icon={Users}
              title="No clients yet"
              description="Add your first client to start managing your relationships."
              actionLabel="Add Client"
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">No clients match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredClients.map((client, index) => (
              <div
                key={client.id}
                className="glass-card rounded-2xl p-6 card-hover animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {(client.company || client.name).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem onClick={() => setEditModal({ open: true, client })}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Client
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteModal({ open: true, clientId: client.id })}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Company as primary, client name as PIC */}
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {client.company || client.name}
                </h3>

                {client.company && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <User className="w-4 h-4" />
                    <span>PIC: {client.name}</span>
                  </div>
                )}

                <div className="space-y-1.5 mt-3 pt-3 border-t border-border">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddClientModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={fetchClients}
      />

      <EditClientModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal({ open, client: editModal.client })}
        client={editModal.client}
        onSuccess={fetchClients}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, clientId: deleteModal.clientId })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Client?"
        description="This will permanently delete this client. This action cannot be undone."
      />
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { AddServiceModal } from "@/components/modals/AddServiceModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { formatIDR } from "@/lib/currency";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  price: number;
  description: string | null;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; serviceId: string | null }>({
    open: false,
    serviceId: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchServices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("services")
      .select("id, name, price, description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setServices(data.map(s => ({ ...s, price: Number(s.price) })));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.serviceId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", deleteModal.serviceId);

      if (error) throw error;
      toast.success("Service deleted successfully!");
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete service");
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, serviceId: null });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Services</h1>
              <p className="text-muted-foreground">Define your service offerings and pricing</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Services</h1>
            <p className="text-muted-foreground">Define your service offerings and pricing</p>
          </div>
          <Button className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        </div>

        {services.length === 0 ? (
          <div className="glass-card rounded-2xl">
            <EmptyState
              icon={Package}
              title="No services yet"
              description="Add your first service to start building invoices faster."
              actionLabel="Add Service"
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Service Name</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Base Price</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr
                    key={service.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-4">
                      <span className="font-medium text-foreground">{service.name}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-primary font-mono font-medium">
                        {formatIDR(service.price)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteModal({ open: true, serviceId: service.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddServiceModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={fetchServices}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, serviceId: deleteModal.serviceId })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Service?"
        description="This will permanently delete this service. This action cannot be undone."
      />
    </DashboardLayout>
  );
}

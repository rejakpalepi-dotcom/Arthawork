import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockServices = [
  { id: "1", name: "Website Design", price: 2500 },
  { id: "2", name: "Brand Identity", price: 1800 },
  { id: "3", name: "UI/UX Design", price: 3200 },
  { id: "4", name: "Mobile App Design", price: 4500 },
  { id: "5", name: "Social Media Package", price: 800 },
];

export default function Services() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Services</h1>
            <p className="text-muted-foreground">Define your service offerings and pricing</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        </div>

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
              {mockServices.map((service, index) => (
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
                      ${service.price.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

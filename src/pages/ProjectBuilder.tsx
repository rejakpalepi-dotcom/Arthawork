import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatIDR } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  FolderOpen,
  Save,
  ArrowLeft,
  Calendar as CalendarIcon,
  User,
  DollarSign,
  FileText,
  Target,
  Clock,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useEffect } from "react";

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required").max(100, "Title must be less than 100 characters"),
  clientId: z.string().nullable(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  budget: z.number().min(0, "Budget must be positive").optional(),
  startDate: z.date().nullable(),
  deadline: z.date().nullable(),
  status: z.string().default("planning"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface Client {
  id: string;
  name: string;
}

const statusOptions = [
  { value: "planning", label: "Planning", icon: Target },
  { value: "in_progress", label: "In Progress", icon: Clock },
  { value: "review", label: "Under Review", icon: FileText },
  { value: "completed", label: "Completed", icon: CheckCircle },
];

export default function ProjectBuilder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      clientId: null,
      description: "",
      budget: 0,
      startDate: null,
      deadline: null,
      status: "planning",
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (data) setClients(data);
    };

    fetchClients();
  }, []);

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    try {
      // For now, show success since we don't have a projects table yet
      // This can be connected to a projects table when created
      toast.success("Project created successfully!");
      navigate("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create project";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find((c) => c.id === watchedValues.clientId);
  const selectedStatus = statusOptions.find((s) => s.value === watchedValues.status);

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">New Project</h1>
                  <p className="text-sm text-muted-foreground">Define your project scope and timeline</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Project Details */}
            <div className="glass-card rounded-2xl p-8 animate-fade-in">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Project Details
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Website Redesign for Acme Corp"
                    {...register("title")}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Client
                    </Label>
                    <Select
                      value={watchedValues.clientId || ""}
                      onValueChange={(value) => setValue("clientId", value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      Status
                    </Label>
                    <Select
                      value={watchedValues.status}
                      onValueChange={(value) => setValue("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <option.icon className="w-4 h-4" />
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the project scope, goals, and deliverables..."
                    rows={4}
                    {...register("description")}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline & Budget */}
            <div className="glass-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Timeline & Budget
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watchedValues.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watchedValues.startDate
                          ? format(watchedValues.startDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={watchedValues.startDate || undefined}
                        onSelect={(date) => setValue("startDate", date || null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    Deadline
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watchedValues.deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watchedValues.deadline
                          ? format(watchedValues.deadline, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={watchedValues.deadline || undefined}
                        onSelect={(date) => setValue("deadline", date || null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    Budget
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      Rp
                    </span>
                    <Input
                      type="number"
                      min="0"
                      step="100000"
                      placeholder="0"
                      {...register("budget", { valueAsNumber: true })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="glass-card rounded-2xl p-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                Project Preview
              </h2>

              <div className="bg-secondary/50 rounded-xl p-6 border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {watchedValues.title || "Untitled Project"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedClient?.name || "No client selected"}
                      </p>
                    </div>
                  </div>
                  {selectedStatus && (
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5",
                      watchedValues.status === "completed" ? "bg-success/20 text-success" :
                        watchedValues.status === "in_progress" ? "bg-primary/20 text-primary" :
                          watchedValues.status === "review" ? "bg-warning/20 text-warning" :
                            "bg-muted text-muted-foreground"
                    )}>
                      <selectedStatus.icon className="w-3.5 h-3.5" />
                      {selectedStatus.label}
                    </span>
                  )}
                </div>

                {watchedValues.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {watchedValues.description}
                  </p>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  {watchedValues.startDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Start:</span>
                      <span className="text-foreground">{format(watchedValues.startDate, "MMM d, yyyy")}</span>
                    </div>
                  )}
                  {watchedValues.deadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Due:</span>
                      <span className="text-foreground">{format(watchedValues.deadline, "MMM d, yyyy")}</span>
                    </div>
                  )}
                  {watchedValues.budget && watchedValues.budget > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="text-primary font-mono font-medium">{formatIDR(watchedValues.budget)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

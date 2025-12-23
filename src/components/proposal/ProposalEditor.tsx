import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatIDR } from "@/lib/currency";
import { Layout, FileText, Briefcase, Gem, Calendar, CreditCard, Plus, Trash2, Upload, ImagePlus } from "lucide-react";
import type { ProposalData, Service, Milestone, CustomService } from "@/pages/ProposalBuilder";

interface Client {
  id: string;
  name: string;
  company: string | null;
}

interface ProposalEditorProps {
  currentPage: number;
  data: ProposalData;
  clients: Client[];
  onUpdate: (updates: Partial<ProposalData>) => void;
  onClientChange: (clientId: string) => void;
  isLoading: boolean;
}

export function ProposalEditor({
  currentPage,
  data,
  clients,
  onUpdate,
  onClientChange,
  isLoading,
}: ProposalEditorProps) {
  if (currentPage === 1) {
    return <CoverEditor data={data} clients={clients} onUpdate={onUpdate} onClientChange={onClientChange} isLoading={isLoading} />;
  }
  if (currentPage === 2) {
    return <IntroEditor data={data} onUpdate={onUpdate} />;
  }
  if (currentPage === 3) {
    return <ExperienceEditor data={data} onUpdate={onUpdate} />;
  }
  if (currentPage === 4) {
    return <ServicesEditor data={data} onUpdate={onUpdate} />;
  }
  if (currentPage === 5) {
    return <TimelineEditor data={data} onUpdate={onUpdate} />;
  }
  if (currentPage === 6) {
    return <InvestmentEditor data={data} onUpdate={onUpdate} />;
  }
  return null;
}

function CoverEditor({
  data,
  clients,
  onUpdate,
  onClientChange,
  isLoading,
}: {
  data: ProposalData;
  clients: Client[];
  onUpdate: (updates: Partial<ProposalData>) => void;
  onClientChange: (clientId: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Layout className="h-5 w-5 text-primary" />
          Cover Page
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Set up your proposal's first impression</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="studioName" className="text-sm font-medium text-foreground">
            Studio / Business Name
          </Label>
          <Input
            id="studioName"
            value={data.studioName}
            onChange={(e) => onUpdate({ studioName: e.target.value })}
            placeholder="Your Studio Name"
            className="bg-muted/50 border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client" className="text-sm font-medium text-foreground">
            Client
          </Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={data.clientId || ""} onValueChange={onClientChange}>
              <SelectTrigger className="bg-muted/50 border-border">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {clients.length === 0 && !isLoading && (
            <p className="text-xs text-muted-foreground">No clients found. Add clients first.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectTitle" className="text-sm font-medium text-foreground">
            Project Title
          </Label>
          <Input
            id="projectTitle"
            value={data.projectTitle}
            onChange={(e) => onUpdate({ projectTitle: e.target.value })}
            placeholder="The Ultimate Project Proposal"
            className="bg-muted/50 border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline" className="text-sm font-medium text-foreground">
            Tagline
          </Label>
          <Input
            id="tagline"
            value={data.tagline}
            onChange={(e) => onUpdate({ tagline: e.target.value })}
            placeholder="Design Fearlessly, Present like a Pro"
            className="bg-muted/50 border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year" className="text-sm font-medium text-foreground">
            Year
          </Label>
          <Input
            id="year"
            value={data.year}
            onChange={(e) => onUpdate({ year: e.target.value })}
            placeholder={new Date().getFullYear().toString()}
            className="bg-muted/50 border-border"
          />
        </div>
      </div>
    </div>
  );
}

function IntroEditor({
  data,
  onUpdate,
}: {
  data: ProposalData;
  onUpdate: (updates: Partial<ProposalData>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local URL for preview (in production, upload to storage)
      const url = URL.createObjectURL(file);
      onUpdate({ heroImageUrl: url });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Introduction
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Tell your story and value proposition</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="introTitle" className="text-sm font-medium text-foreground">
            Section Title
          </Label>
          <Input
            id="introTitle"
            value={data.introTitle}
            onChange={(e) => onUpdate({ introTitle: e.target.value })}
            placeholder="Why work with me?"
            className="bg-muted/50 border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="introText" className="text-sm font-medium text-foreground">
            Introduction Text
          </Label>
          <Textarea
            id="introText"
            value={data.introText}
            onChange={(e) => onUpdate({ introText: e.target.value })}
            placeholder="Tell your story..."
            className="min-h-[180px] bg-muted/50 border-border resize-none leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Hero Image</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {data.heroImageUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={data.heroImageUrl} alt="Hero" className="w-full h-40 object-cover" />
              <button
                onClick={() => onUpdate({ heroImageUrl: "" })}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30 group"
            >
              <ImagePlus className="h-10 w-10 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
              <p className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">Upload Image Here</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExperienceEditor({
  data,
  onUpdate,
}: {
  data: ProposalData;
  onUpdate: (updates: Partial<ProposalData>) => void;
}) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleLogoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newLogos = [...(data.clientLogos || [])];
      newLogos[index] = url;
      onUpdate({ clientLogos: newLogos });
    }
  };

  const removeLogo = (index: number) => {
    const newLogos = [...(data.clientLogos || [])];
    newLogos[index] = "";
    onUpdate({ clientLogos: newLogos });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Track Record
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Showcase your experience and accomplishments</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="experienceTitle" className="text-sm font-medium text-foreground">
            Headline
          </Label>
          <Textarea
            id="experienceTitle"
            value={data.experienceTitle}
            onChange={(e) => onUpdate({ experienceTitle: e.target.value })}
            placeholder="I've worked with clients near and far..."
            className="min-h-[80px] bg-muted/50 border-border resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceSubtitle" className="text-sm font-medium text-foreground">
            Subtitle
          </Label>
          <Textarea
            id="experienceSubtitle"
            value={data.experienceSubtitle}
            onChange={(e) => onUpdate({ experienceSubtitle: e.target.value })}
            placeholder="From local startups to international enterprises..."
            className="min-h-[80px] bg-muted/50 border-border resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectCount" className="text-sm font-medium text-foreground">
              Projects
            </Label>
            <Input
              id="projectCount"
              value={data.projectCount}
              onChange={(e) => onUpdate({ projectCount: e.target.value })}
              placeholder="50+"
              className="bg-muted/50 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countriesCount" className="text-sm font-medium text-foreground">
              Countries
            </Label>
            <Input
              id="countriesCount"
              value={data.countriesCount}
              onChange={(e) => onUpdate({ countriesCount: e.target.value })}
              placeholder="12"
              className="bg-muted/50 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-sm font-medium text-foreground">
              Rating
            </Label>
            <Input
              id="rating"
              value={data.rating}
              onChange={(e) => onUpdate({ rating: e.target.value })}
              placeholder="5.0"
              className="bg-muted/50 border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Client Logos</Label>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const logo = data.clientLogos?.[i];
              return (
                <div key={i} className="relative">
                  <input
                    ref={(el) => (fileInputRefs.current[i] = el)}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(i, e)}
                    className="hidden"
                  />
                  {logo ? (
                    <div className="aspect-square rounded-xl overflow-hidden border border-border relative group">
                      <img src={logo} alt={`Logo ${i + 1}`} className="w-full h-full object-contain bg-white p-2" />
                      <button
                        onClick={() => removeLogo(i)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[i]?.click()}
                      className="w-full aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30 group"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] text-muted-foreground mt-1 group-hover:text-foreground transition-colors">Upload</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
        </div>
      </div>
    </div>
  );
}

function ServicesEditor({
  data,
  onUpdate,
}: {
  data: ProposalData;
  onUpdate: (updates: Partial<ProposalData>) => void;
}) {
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data: services, error } = await supabase
          .from("services")
          .select("id, name, description, price, unit")
          .order("name");

        if (error) throw error;
        setAvailableServices(services || []);
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const toggleService = (service: Service) => {
    const isSelected = data.selectedServices.some((s) => s.id === service.id);
    if (isSelected) {
      onUpdate({
        selectedServices: data.selectedServices.filter((s) => s.id !== service.id),
      });
    } else {
      onUpdate({
        selectedServices: [...data.selectedServices, service],
      });
    }
  };

  // Custom services management
  const addCustomService = () => {
    const newService: CustomService = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      price: 0,
      unit: "project",
    };
    onUpdate({ customServices: [...(data.customServices || []), newService] });
  };

  const updateCustomService = (id: string, updates: Partial<CustomService>) => {
    onUpdate({
      customServices: (data.customServices || []).map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const removeCustomService = (id: string) => {
    onUpdate({
      customServices: (data.customServices || []).filter((s) => s.id !== id),
    });
  };

  const allServices = [
    ...data.selectedServices,
    ...(data.customServices || []),
  ];
  const totalPrice = allServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Gem className="h-5 w-5 text-primary" />
          Design Services
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Select or add custom services for this proposal</p>
      </div>

      {/* Available Services from Database */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Select From Catalog</Label>
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : availableServices.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground border border-dashed border-border rounded-xl">
            <Gem className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm">No services in catalog. Add custom services below.</p>
          </div>
        ) : (
          availableServices.map((service) => {
            const isSelected = data.selectedServices.some((s) => s.id === service.id);
            return (
              <div
                key={service.id}
                onClick={() => toggleService(service)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox checked={isSelected} className="mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground">{service.name}</h3>
                      <span className="text-sm font-semibold text-primary">
                        {formatIDR(service.price)}
                        {service.unit && <span className="text-muted-foreground font-normal">/{service.unit}</span>}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Services */}
      <div className="space-y-3 pt-4 border-t border-border">
        <Label className="text-sm font-medium text-foreground">Custom Services</Label>
        {(data.customServices || []).map((service, index) => (
          <div key={service.id} className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Custom Item {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeCustomService(service.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Service Name</Label>
                <Input
                  value={service.name}
                  onChange={(e) => updateCustomService(service.id, { name: e.target.value })}
                  placeholder="e.g., Brand Identity Design"
                  className="bg-background border-border text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Task Details / Deliverables</Label>
                <Textarea
                  value={service.description || ""}
                  onChange={(e) => updateCustomService(service.id, { description: e.target.value })}
                  placeholder="Describe the deliverables..."
                  className="bg-background border-border text-sm min-h-[60px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Investment (IDR)</Label>
                  <Input
                    type="number"
                    value={service.price}
                    onChange={(e) => updateCustomService(service.id, { price: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="bg-background border-border text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Unit</Label>
                  <Input
                    value={service.unit || ""}
                    onChange={(e) => updateCustomService(service.id, { unit: e.target.value })}
                    placeholder="e.g., project, hour"
                    className="bg-background border-border text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addCustomService}
          className="w-full border-dashed border-border hover:border-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Service
        </Button>
      </div>

      {allServices.length > 0 && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{allServices.length} service(s) total</span>
            <span className="font-semibold text-primary text-base">
              {formatIDR(totalPrice)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineEditor({
  data,
  onUpdate,
}: {
  data: ProposalData;
  onUpdate: (updates: Partial<ProposalData>) => void;
}) {
  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      week: `Week ${data.milestones.length + 1}`,
      title: "",
      description: "",
    };
    onUpdate({ milestones: [...data.milestones, newMilestone] });
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    onUpdate({
      milestones: data.milestones.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    });
  };

  const removeMilestone = (id: string) => {
    onUpdate({
      milestones: data.milestones.filter((m) => m.id !== id),
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Project Timeline
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Define project milestones and schedule</p>
      </div>

      <div className="space-y-4">
        {data.milestones.map((milestone, index) => (
          <div key={milestone.id} className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Milestone {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeMilestone(milestone.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Week/Phase</Label>
                <Input
                  value={milestone.week}
                  onChange={(e) => updateMilestone(milestone.id, { week: e.target.value })}
                  placeholder="Week 1"
                  className="bg-background border-border text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input
                  value={milestone.title}
                  onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                  placeholder="Discovery & Planning"
                  className="bg-background border-border text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={milestone.description}
                onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                placeholder="Brief description of this phase..."
                className="bg-background border-border text-sm min-h-[60px] resize-none"
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addMilestone}
          className="w-full border-dashed border-border hover:border-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>
    </div>
  );
}

function InvestmentEditor({
  data,
  onUpdate,
}: {
  data: ProposalData;
  onUpdate: (updates: Partial<ProposalData>) => void;
}) {
  // Combine selected and custom services
  const allServices = [
    ...data.selectedServices.map(s => ({ ...s, isCustom: false })),
    ...(data.customServices || []).map(s => ({ ...s, isCustom: true })),
  ];
  
  const subtotal = allServices.reduce((sum, s) => sum + s.price, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  // Add custom service directly from Investment tab
  const addCustomService = () => {
    const newService: CustomService = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      price: 0,
      unit: "project",
    };
    onUpdate({ customServices: [...(data.customServices || []), newService] });
  };

  const updateCustomService = (id: string, updates: Partial<CustomService>) => {
    onUpdate({
      customServices: (data.customServices || []).map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const removeCustomService = (id: string) => {
    onUpdate({
      customServices: (data.customServices || []).filter((s) => s.id !== id),
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Investment
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Review scope of work and pricing</p>
      </div>

      {allServices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
          <CreditCard className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-medium">No services added yet</p>
          <p className="text-xs mt-1 mb-4">Go to Design Services tab to select from catalog, or add a custom service below.</p>
          <Button
            type="button"
            variant="outline"
            onClick={addCustomService}
            className="border-dashed border-primary/50 hover:border-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Service
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Scope of Work</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCustomService}
                className="text-primary hover:text-primary/80 h-7 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Service
              </Button>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b border-border grid grid-cols-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Service</span>
                <span className="text-center">Unit</span>
                <span className="text-right">Price</span>
                <span className="text-right">Action</span>
              </div>
              {allServices.map((service) => (
                <div key={service.id} className="px-4 py-3 border-b border-border last:border-0 grid grid-cols-4 text-sm items-center gap-2">
                  <div>
                    <span className="text-foreground font-medium">{service.name || "Untitled Service"}</span>
                    {service.isCustom && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Custom</span>
                    )}
                  </div>
                  <span className="text-center text-muted-foreground">{service.unit || "—"}</span>
                  <span className="text-right text-foreground">{formatIDR(service.price)}</span>
                  <div className="flex justify-end">
                    {service.isCustom && (
                      <button
                        type="button"
                        onClick={() => removeCustomService(service.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Service Editor for new entries */}
          {(data.customServices || []).filter(s => !s.name).map((service) => (
            <div key={service.id} className="p-4 rounded-xl border border-dashed border-primary/50 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">New Custom Service</span>
                <button
                  type="button"
                  onClick={() => removeCustomService(service.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Service Name</Label>
                  <Input
                    value={service.name}
                    onChange={(e) => updateCustomService(service.id, { name: e.target.value })}
                    placeholder="e.g., Custom Design"
                    className="bg-background border-border text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Price</Label>
                  <Input
                    type="number"
                    value={service.price || ""}
                    onChange={(e) => updateCustomService(service.id, { price: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="bg-background border-border text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={data.taxRate}
                  onChange={(e) => onUpdate({ taxRate: parseFloat(e.target.value) || 0 })}
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Additional Notes</Label>
              <Textarea
                value={data.investmentNotes}
                onChange={(e) => onUpdate({ investmentNotes: e.target.value })}
                placeholder="Payment terms, conditions, etc..."
                className="min-h-[100px] bg-muted/50 border-border resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatIDR(subtotal)}</span>
            </div>
            {data.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({data.taxRate}%)</span>
                <span className="text-foreground">{formatIDR(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span className="text-foreground">Total Investment</span>
              <span className="text-primary">{formatIDR(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

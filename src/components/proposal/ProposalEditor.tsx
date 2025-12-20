import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProposalData } from "@/pages/ProposalBuilder";

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
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground font-sans">
      <div className="text-center">
        <span className="material-symbols-outlined text-4xl mb-2">construction</span>
        <p className="text-sm">This page is coming soon</p>
      </div>
    </div>
  );
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
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">home</span>
          Cover Page
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Set up your proposal's first impression</p>
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
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">article</span>
          Introduction
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Tell your story and value proposition</p>
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
            className="min-h-[180px] bg-muted/50 border-border resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Hero Image</Label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
            <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">add_photo_alternate</span>
            <p className="text-sm text-muted-foreground font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
          </div>
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
  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">work_history</span>
          Experience
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Showcase your track record</p>
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
              >
                <span className="material-symbols-outlined text-2xl text-muted-foreground">add</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Upload up to 6 client logos</p>
        </div>
      </div>
    </div>
  );
}

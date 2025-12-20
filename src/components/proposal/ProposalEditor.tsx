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
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <span className="material-symbols-outlined text-4xl mb-2">construction</span>
        <p>This page is coming soon</p>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">home</span>
          Cover Page
        </h2>
        <p className="text-sm text-muted-foreground">Set up your proposal's first impression</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="studioName">Studio / Business Name</Label>
          <Input
            id="studioName"
            value={data.studioName}
            onChange={(e) => onUpdate({ studioName: e.target.value })}
            placeholder="Your Studio Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={data.clientId || ""} onValueChange={onClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
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
          <Label htmlFor="projectTitle">Project Title</Label>
          <Input
            id="projectTitle"
            value={data.projectTitle}
            onChange={(e) => onUpdate({ projectTitle: e.target.value })}
            placeholder="The Ultimate Project Proposal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={data.tagline}
            onChange={(e) => onUpdate({ tagline: e.target.value })}
            placeholder="Design Fearlessly, Present like a Pro"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            value={data.year}
            onChange={(e) => onUpdate({ year: e.target.value })}
            placeholder={new Date().getFullYear().toString()}
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">article</span>
          Introduction
        </h2>
        <p className="text-sm text-muted-foreground">Tell your story and value proposition</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="introTitle">Section Title</Label>
          <Input
            id="introTitle"
            value={data.introTitle}
            onChange={(e) => onUpdate({ introTitle: e.target.value })}
            placeholder="Why work with me?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="introText">Introduction Text</Label>
          <Textarea
            id="introText"
            value={data.introText}
            onChange={(e) => onUpdate({ introText: e.target.value })}
            placeholder="Tell your story..."
            className="min-h-[200px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Hero Image</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">add_photo_alternate</span>
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">work_history</span>
          Experience
        </h2>
        <p className="text-sm text-muted-foreground">Showcase your track record</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="experienceTitle">Headline</Label>
          <Textarea
            id="experienceTitle"
            value={data.experienceTitle}
            onChange={(e) => onUpdate({ experienceTitle: e.target.value })}
            placeholder="I've worked with clients near and far..."
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceSubtitle">Subtitle</Label>
          <Textarea
            id="experienceSubtitle"
            value={data.experienceSubtitle}
            onChange={(e) => onUpdate({ experienceSubtitle: e.target.value })}
            placeholder="From local startups to international enterprises..."
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectCount">Projects</Label>
            <Input
              id="projectCount"
              value={data.projectCount}
              onChange={(e) => onUpdate({ projectCount: e.target.value })}
              placeholder="50+"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countriesCount">Countries</Label>
            <Input
              id="countriesCount"
              value={data.countriesCount}
              onChange={(e) => onUpdate({ countriesCount: e.target.value })}
              placeholder="12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Input
              id="rating"
              value={data.rating}
              onChange={(e) => onUpdate({ rating: e.target.value })}
              placeholder="5.0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Client Logos</Label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-video border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer"
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

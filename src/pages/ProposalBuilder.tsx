import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BuilderContextBar } from "@/components/layout/BuilderContextBar";
import { ProposalEditor } from "@/components/proposal/ProposalEditor";
import { ProposalPreview } from "@/components/proposal/ProposalPreview";
import { SaveStatusIndicator } from "@/components/ui/SaveStatusIndicator";
import { exportProposalToPDF } from "@/lib/proposalPdfExport";
import { useAutosave } from "@/hooks/useAutosave";
import { Layout, FileText, Briefcase, Gem, Calendar, CreditCard, Download, Eye, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
}

export interface CustomService {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
}

export interface Milestone {
  id: string;
  week: string;
  title: string;
  description: string;
}

export interface ProposalData {
  // Page 1 - Cover
  projectTitle: string;
  clientId: string | null;
  clientName: string;
  clientCompany: string;
  studioName: string;
  tagline: string;
  year: string;

  // Page 2 - Intro
  introTitle: string;
  introText: string;
  heroImageUrl: string;

  // Page 3 - Experience
  experienceTitle: string;
  experienceSubtitle: string;
  projectCount: string;
  countriesCount: string;
  rating: string;
  clientLogos: string[];

  // Page 4 - Services
  selectedServices: Service[];
  customServices: CustomService[];

  // Page 5 - Timeline
  milestones: Milestone[];

  // Page 6 - Investment
  taxRate: number;
  investmentNotes: string;
}

interface Client {
  id: string;
  name: string;
  company: string | null;
}

const initialProposalData: ProposalData = {
  projectTitle: "The Ultimate Project Proposal",
  clientId: null,
  clientName: "",
  clientCompany: "",
  studioName: "Artha Studio",
  tagline: "Design Fearlessly, Present like a Pro",
  year: new Date().getFullYear().toString(),

  introTitle: "Why work with me?",
  introText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  heroImageUrl: "",

  experienceTitle: "I've worked with clients near and far, big and small",
  experienceSubtitle: "From local startups to international enterprises, I bring the same level of dedication and design excellence to every partnership.",
  projectCount: "50+",
  countriesCount: "12",
  rating: "5.0",
  clientLogos: ["", "", "", "", "", ""],

  selectedServices: [],
  customServices: [],

  milestones: [
    { id: crypto.randomUUID(), week: "Week 1", title: "Initial Planning & Discovery", description: "Research, stakeholder interviews, and project kickoff" },
    { id: crypto.randomUUID(), week: "Week 2-3", title: "Design Concepts & Research", description: "Wireframes, moodboards, and initial design explorations" },
    { id: crypto.randomUUID(), week: "Week 4", title: "Refinement & Launch", description: "Final revisions and project delivery" },
  ],

  taxRate: 0,
  investmentNotes: "",
};

const pages = [
  { id: 1, label: "Cover", fullLabel: "Cover Page", icon: Layout },
  { id: 2, label: "Intro", fullLabel: "Introduction", icon: FileText },
  { id: 3, label: "Track", fullLabel: "Track Record", icon: Briefcase },
  { id: 4, label: "Services", fullLabel: "Design Services", icon: Gem },
  { id: 5, label: "Timeline", fullLabel: "Project Timeline", icon: Calendar },
  { id: 6, label: "Price", fullLabel: "Investment", icon: CreditCard },
];

export default function ProposalBuilder() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [proposalData, setProposalData] = useState<ProposalData>(initialProposalData);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [draftId, setDraftId] = useState<string | null>(editId ?? null);

  // ---------- Load clients ----------
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, company")
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error: unknown) {
      toast.error("Failed to load clients");
    }
  };

  // ---------- Load existing draft ----------
  useEffect(() => {
    const loadDraft = async () => {
      if (!editId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: proposal, error } = await supabase
          .from("proposals")
          .select("*")
          .eq("id", editId)
          .single();

        if (error || !proposal) {
          toast.error("Proposal not found");
          navigate("/proposals");
          return;
        }

        // Try to restore from JSONB first
        const jsonData = (proposal as Record<string, unknown>).proposal_data as Record<string, unknown> | null;

        if (jsonData) {
          // Full editor state available
          setProposalData(jsonData as unknown as ProposalData);
        } else {
          // Fallback: reconstruct from normalized fields
          setProposalData((prev) => ({
            ...prev,
            projectTitle: proposal.title || prev.projectTitle,
            clientId: proposal.client_id || null,
            tagline: proposal.description || prev.tagline,
          }));
        }
      } catch (err) {
        console.error("Error loading proposal draft:", err);
        toast.error("Failed to load proposal");
        navigate("/proposals");
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const updateProposalData = (updates: Partial<ProposalData>) => {
    setProposalData((prev) => ({ ...prev, ...updates }));
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      updateProposalData({
        clientId,
        clientName: client.name,
        clientCompany: client.company || "",
      });
    }
  };

  const calculateTotal = useCallback(() => {
    const allServices = [...proposalData.selectedServices, ...(proposalData.customServices || [])];
    const subtotal = allServices.reduce((sum, s) => sum + s.price, 0);
    const taxAmount = subtotal * (proposalData.taxRate / 100);
    return subtotal + taxAmount;
  }, [proposalData.selectedServices, proposalData.customServices, proposalData.taxRate]);

  // ---------- Autosave handler ----------
  const handleAutosave = useCallback(
    async (data: ProposalData) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");

      const allServices = [...data.selectedServices, ...(data.customServices || [])];
      const subtotal = allServices.reduce((sum, s) => sum + s.price, 0);
      const taxAmount = subtotal * (data.taxRate / 100);
      const total = subtotal + taxAmount;

      const proposalPayload = {
        user_id: user.id,
        client_id: data.clientId || null,
        title: data.projectTitle,
        description: data.tagline,
        total,
        status: "draft",
        proposal_data: data as unknown as Record<string, unknown>,
      };

      if (draftId) {
        // UPDATE existing
        const { error } = await supabase
          .from("proposals")
          .update(proposalPayload)
          .eq("id", draftId);

        if (error) throw new Error(error.message);
      } else {
        // INSERT new
        const { data: newProposal, error } = await supabase
          .from("proposals")
          .insert(proposalPayload)
          .select()
          .single();

        if (error) throw new Error(error.message);

        setDraftId(newProposal.id);
        // Redirect to edit URL so further saves are updates
        navigate(`/proposals/${newProposal.id}/edit`, { replace: true });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    [draftId, navigate, queryClient]
  );

  // Autosave integration
  const autosave = useAutosave({
    data: proposalData,
    onSave: handleAutosave,
    enabled: !isLoading,
    debounceMs: 2000,
  });

  // After loading a draft, mark the autosave as clean
  useEffect(() => {
    if (!isLoading && editId) {
      const timer = setTimeout(() => autosave.markClean(), 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, editId]);

  // ---------- Back navigation with unsaved changes guard ----------
  const handleBack = () => {
    if (autosave.isDirty || autosave.status === "unsaved" || autosave.status === "saving") {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (!confirmed) return;
    }
    navigate("/proposals");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">
              {editId ? "Loading proposal..." : "Loading..."}
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-2rem)] flex flex-col font-sans">
        <BuilderContextBar
          breadcrumbs={[
            { label: "Dokumen" },
            { label: "Proposals", href: "/proposals" },
            { label: editId ? "Edit Proposal" : "New Proposal" },
          ]}
          backTo="/proposals"
          onBack={handleBack}
          documentTitle={proposalData.projectTitle || undefined}
          clientName={proposalData.clientName || undefined}
          documentType="proposal"
          status="draft"
          autosave={autosave}
          actions={
            <>
              <button
                onClick={() => autosave.save()}
                disabled={autosave.status === "saving" || isExporting}
                className="px-3 md:px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 min-h-[40px]"
              >
                {autosave.status === "saving" ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={async () => {
                  setIsExporting(true);
                  try {
                    const fileName = `${proposalData.projectTitle.replace(/\s+/g, "-").toLowerCase()}-proposal.pdf`;
                    await exportProposalToPDF(proposalData, fileName);
                    toast.success("Proposal exported successfully!");
                  } catch (error) {
                    console.error("Export error:", error);
                    toast.error("Failed to export proposal");
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                className="hidden sm:flex px-3 md:px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors items-center gap-2 font-medium disabled:opacity-50 min-h-[40px]"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export PDF"}
              </button>
            </>
          }
        />

        {/* Professional Tab Navigation with Lucide Icons */}
        <div className="overflow-x-auto mb-3 md:mb-4 px-4 md:px-0 -mx-4 md:mx-0">
          <div className="flex items-center gap-1 p-1.5 bg-card rounded-xl border border-border w-fit min-w-max mx-4 md:mx-0">
            {pages.map((page) => {
              const IconComponent = page.icon;
              const isActive = currentPage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page.id)}
                  className={cn(
                    "flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all relative min-h-[40px]",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="md:hidden">{page.label}</span>
                  <span className="hidden md:inline">{page.fullLabel}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden border-t border-b border-border mb-3 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => setMobileView("form")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors min-h-[44px]",
              mobileView === "form"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground"
            )}
          >
            <FileEdit className="w-4 h-4" />
            Edit Form
          </button>
          <button
            onClick={() => setMobileView("preview")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors min-h-[44px]",
              mobileView === "preview"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground"
            )}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Split Screen Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5 min-h-0 px-4 md:px-0">
          {/* Left Panel - Editor */}
          <div className={cn(
            "bg-card rounded-xl border border-border p-4 md:p-6 overflow-y-auto",
            mobileView !== "form" && "hidden lg:block"
          )}>
            <ProposalEditor
              currentPage={currentPage}
              data={proposalData}
              clients={clients}
              onUpdate={updateProposalData}
              onClientChange={handleClientChange}
              isLoading={isLoading}
            />
          </div>

          {/* Right Panel - Live Preview with A4 aspect ratio */}
          <div className={cn(
            "bg-muted/30 rounded-xl border border-border p-3 md:p-5 overflow-hidden flex flex-col",
            mobileView !== "preview" && "hidden lg:block"
          )}>
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live Preview
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div
                className="bg-white rounded-lg shadow-2xl border-2 border-border/50 overflow-hidden w-full"
                style={{
                  aspectRatio: '8.5/11',
                  maxHeight: 'calc(100vh - 20rem)',
                  maxWidth: 'calc((100vh - 20rem) * 8.5 / 11)'
                }}
              >
                <ProposalPreview currentPage={currentPage} data={proposalData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

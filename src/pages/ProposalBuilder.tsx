import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProposalEditor } from "@/components/proposal/ProposalEditor";
import { ProposalPreview } from "@/components/proposal/ProposalPreview";

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
  
  // Page 4 - Services (future)
  // Page 5 - Timeline (future)
  // Page 6 - Investment (future)
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
  studioName: "Kalaudra Studio",
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
};

export default function ProposalBuilder() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [proposalData, setProposalData] = useState<ProposalData>(initialProposalData);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error: any) {
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

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

  const pages = [
    { id: 1, label: "Cover", icon: "home" },
    { id: 2, label: "Intro", icon: "article" },
    { id: 3, label: "Experience", icon: "work_history" },
    { id: 4, label: "Services", icon: "design_services", disabled: true },
    { id: 5, label: "Timeline", icon: "schedule", disabled: true },
    { id: 6, label: "Investment", icon: "payments", disabled: true },
  ];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Proposal Builder</h1>
            <p className="text-muted-foreground text-sm">Create a stunning proposal for your client</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/proposals")}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => toast.info("Save functionality coming in Phase 2")}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => toast.info("Export functionality coming in Phase 2")}
              className="px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">share</span>
              Export
            </button>
          </div>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1 mb-4 p-1 bg-card rounded-lg border border-border w-fit">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => !page.disabled && setCurrentPage(page.id)}
              disabled={page.disabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                currentPage === page.id
                  ? "bg-primary text-primary-foreground"
                  : page.disabled
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{page.icon}</span>
              {page.label}
            </button>
          ))}
        </div>

        {/* Split Screen Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
          {/* Left Panel - Editor */}
          <div className="bg-card rounded-xl border border-border p-6 overflow-y-auto">
            <ProposalEditor
              currentPage={currentPage}
              data={proposalData}
              clients={clients}
              onUpdate={updateProposalData}
              onClientChange={handleClientChange}
              isLoading={isLoading}
            />
          </div>

          {/* Right Panel - Live Preview */}
          <div className="bg-muted/30 rounded-xl border border-border p-4 overflow-y-auto">
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">visibility</span>
              Live Preview
            </div>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden aspect-[8.5/11] max-h-[calc(100vh-16rem)]">
              <ProposalPreview currentPage={currentPage} data={proposalData} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

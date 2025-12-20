import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProposalEditor } from "@/components/proposal/ProposalEditor";
import { ProposalPreview } from "@/components/proposal/ProposalPreview";

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string | null;
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
  
  // Page 4 - Services
  selectedServices: Service[];
  
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
  
  selectedServices: [],
  
  milestones: [
    { id: crypto.randomUUID(), week: "Week 1", title: "Initial Planning & Discovery", description: "Research, stakeholder interviews, and project kickoff" },
    { id: crypto.randomUUID(), week: "Week 2-3", title: "Design Concepts & Research", description: "Wireframes, moodboards, and initial design explorations" },
    { id: crypto.randomUUID(), week: "Week 4", title: "Refinement & Launch", description: "Final revisions and project delivery" },
  ],
  
  taxRate: 0,
  investmentNotes: "",
};

const pages = [
  { id: 1, label: "Cover", icon: "home" },
  { id: 2, label: "Intro", icon: "article" },
  { id: 3, label: "Experience", icon: "work_history" },
  { id: 4, label: "Services", icon: "design_services" },
  { id: 5, label: "Timeline", icon: "schedule" },
  { id: 6, label: "Investment", icon: "payments" },
];

export default function ProposalBuilder() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [proposalData, setProposalData] = useState<ProposalData>(initialProposalData);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  const calculateTotal = () => {
    const subtotal = proposalData.selectedServices.reduce((sum, s) => sum + s.price, 0);
    const taxAmount = subtotal * (proposalData.taxRate / 100);
    return subtotal + taxAmount;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("Please log in to save proposals");
        return;
      }

      const { error } = await supabase.from("proposals").insert({
        user_id: user.id,
        client_id: proposalData.clientId,
        title: proposalData.projectTitle,
        description: proposalData.tagline,
        total: calculateTotal(),
        status: "draft",
      });

      if (error) throw error;

      toast.success("Proposal saved successfully!");
      navigate("/proposals");
    } catch (error: any) {
      toast.error("Failed to save proposal: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-2rem)] flex flex-col font-[Inter,sans-serif]">
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
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() => toast.info("Export functionality coming soon")}
              className="px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 font-medium"
            >
              <span className="material-symbols-outlined text-lg">share</span>
              Export
            </button>
          </div>
        </div>

        {/* Page Navigation - All tabs enabled */}
        <div className="flex items-center gap-1 mb-4 p-1.5 bg-card rounded-xl border border-border w-fit">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === page.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{page.icon}</span>
              {page.label}
            </button>
          ))}
        </div>

        {/* Split Screen Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0">
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

          {/* Right Panel - Live Preview with A4 aspect ratio */}
          <div className="bg-muted/30 rounded-xl border border-border p-5 overflow-hidden flex flex-col">
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-sm">visibility</span>
              Live Preview
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div 
                className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden w-full"
                style={{ 
                  aspectRatio: '8.5/11',
                  maxHeight: 'calc(100vh - 16rem)',
                  maxWidth: 'calc((100vh - 16rem) * 8.5 / 11)'
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

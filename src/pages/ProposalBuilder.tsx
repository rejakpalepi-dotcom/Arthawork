import { useState, useEffect, useCallback } from "react";
import { transitionBuilderView, type BuilderViewState } from "@/lib/builderViewMachine";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BuilderContextBar } from "@/components/layout/BuilderContextBar";
import { ProposalEditor } from "@/components/proposal/ProposalEditor";
import { ProposalPreview } from "@/components/proposal/ProposalPreview";
import { SaveStatusIndicator } from "@/components/ui/SaveStatusIndicator";
import { Button } from "@/components/ui/button";
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
  projectTitle: "Proposal Kolaborasi Brand",
  clientId: null,
  clientName: "",
  clientCompany: "",
  studioName: "Artha Studio",
  tagline: "Presentasi yang rapi, scope yang jelas, keputusan yang lebih cepat",
  year: new Date().getFullYear().toString(),

  introTitle: "Kenapa proyek ini layak dijalankan bersama",
  introText: "Proposal ini dirancang untuk memberi gambaran yang jelas soal arah kerja, deliverable, dan hasil yang ingin dicapai. Fokusnya bukan hanya tampilan akhir, tetapi proses yang rapi dan keputusan yang lebih mudah.\n\nSetiap bagian di bawah ini membantu Anda melihat prioritas, ruang lingkup, serta investasi yang dibutuhkan agar proyek berjalan lebih tenang, cepat, dan terukur.",
  heroImageUrl: "",

  experienceTitle: "Dipercaya brand yang sedang tumbuh dan tim yang butuh kejelasan eksekusi",
  experienceSubtitle: "Dari bisnis lokal hingga tim yang bergerak cepat, pendekatan kerja tetap sama: tajam di strategi, rapi di detail, dan realistis saat dieksekusi.",
  projectCount: "50+",
  countriesCount: "12",
  rating: "5.0",
  clientLogos: ["", "", "", "", "", ""],

  selectedServices: [],
  customServices: [],

  milestones: [
    { id: crypto.randomUUID(), week: "Minggu 1", title: "Discovery dan Penyelarasan", description: "Review konteks bisnis, prioritas, dan ruang lingkup awal proyek." },
    { id: crypto.randomUUID(), week: "Minggu 2-3", title: "Eksplorasi dan Arah Desain", description: "Wireframe, referensi visual, dan penyusunan arah solusi utama." },
    { id: crypto.randomUUID(), week: "Minggu 4", title: "Penyempurnaan dan Finalisasi", description: "Perapihan akhir, revisi prioritas, dan persiapan handoff." },
  ],

  taxRate: 0,
  investmentNotes: "",
};

const pages = [
  { id: 1, label: "Sampul", fullLabel: "Halaman Sampul", icon: Layout },
  { id: 2, label: "Intro", fullLabel: "Pendahuluan", icon: FileText },
  { id: 3, label: "Profil", fullLabel: "Rekam Jejak", icon: Briefcase },
  { id: 4, label: "Ruang Lingkup", fullLabel: "Layanan dan Ruang Lingkup", icon: Gem },
  { id: 5, label: "Tahapan", fullLabel: "Timeline Proyek", icon: Calendar },
  { id: 6, label: "Biaya", fullLabel: "Investasi", icon: CreditCard },
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
  const [mobileView, setMobileView] = useState<BuilderViewState>("editor");
  const switchView = (event: "SWITCH_TO_EDITOR" | "SWITCH_TO_PREVIEW") => {
    const next = transitionBuilderView(mobileView, event);
    if (next) setMobileView(next);
  };
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
      toast.error("Gagal memuat klien");
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
          toast.error("Proposal tidak ditemukan");
          navigate("/proposals");
          return;
        }

        // Try to restore from JSONB first
        const jsonData = (proposal as Record<string, unknown>).proposal_data as Record<string, unknown> | null;

        if (jsonData) {
          // Full editor state available — merge with defaults to fill any
          // fields that may have been added after this document was saved.
          const restored = jsonData as unknown as Partial<ProposalData>;
          setProposalData((prev) => ({
            ...prev,           // initialProposalData defaults
            ...restored,       // saved data overrides
            // Ensure arrays are always arrays, even for old docs saved before these fields existed
            selectedServices: Array.isArray(restored.selectedServices) ? restored.selectedServices : prev.selectedServices,
            customServices: Array.isArray(restored.customServices) ? restored.customServices : prev.customServices,
            milestones: Array.isArray(restored.milestones) ? restored.milestones : prev.milestones,
            clientLogos: Array.isArray(restored.clientLogos) ? restored.clientLogos : prev.clientLogos,
          }));
        } else {
          // Fallback: reconstruct from normalized fields (pre-JSONB documents)
          setProposalData((prev) => ({
            ...prev,
            projectTitle: proposal.title || prev.projectTitle,
            clientId: proposal.client_id || null,
            tagline: proposal.description || prev.tagline,
          }));
        }
      } catch (err) {
        console.error("Error loading proposal draft:", err);
        toast.error("Gagal memuat proposal");
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
        "Masih ada perubahan yang belum tersimpan. Yakin ingin keluar?"
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
              {editId ? "Memuat proposal..." : "Memuat..."}
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
            { label: "Proposal", href: "/proposals" },
            { label: editId ? "Ubah Proposal" : "Proposal Baru" },
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
              <Button
                onClick={() => autosave.save()}
                disabled={autosave.status === "saving" || isExporting}
                size="sm"
                className="min-h-[40px] px-4 font-semibold"
              >
                {autosave.status === "saving" ? "Menyimpan..." : "Simpan Draf"}
              </Button>
              <Button
                onClick={async () => {
                  setIsExporting(true);
                  try {
                    const fileName = `${proposalData.projectTitle.replace(/\s+/g, "-").toLowerCase()}-proposal.pdf`;
                    const result = await exportProposalToPDF(proposalData, fileName);
                    if (result.success) {
                      toast.success("Proposal berhasil diekspor");
                    } else {
                      toast.error(result.error || "Gagal mengekspor proposal", {
                        action: {
                          label: "Coba Lagi",
                          onClick: () => {
                            // Re-trigger export
                            const retryBtn = document.querySelector('[data-export-pdf]') as HTMLButtonElement;
                            retryBtn?.click();
                          },
                        },
                      });
                    }
                  } catch (error) {
                    console.error("Export error:", error);
                    toast.error("Gagal mengekspor proposal");
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                data-export-pdf
                size="sm"
                variant="outline"
                className="hidden min-h-[40px] px-4 sm:inline-flex font-semibold"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Mengekspor..." : "Ekspor PDF"}
              </Button>
            </>
          }
        />

        {/* Professional Tab Navigation with Lucide Icons */}
        <div className="overflow-x-auto mb-3 md:mb-4 px-4 md:px-0 -mx-4 md:mx-0">
          <div className="flex items-center gap-1 p-1.5 bg-card/90 shadow-sm rounded-2xl border border-border/80 w-fit min-w-max mx-4 md:mx-0">
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
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="md:hidden">{page.label}</span>
                  <span className="hidden md:inline">{page.fullLabel}</span>
                  {isActive && (
                    <div className="absolute inset-x-3 bottom-1 h-0.5 bg-white/70 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden border-t border-b border-border mb-3 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => switchView("SWITCH_TO_EDITOR")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors min-h-[44px]",
              mobileView === "editor"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground"
            )}
          >
            <FileEdit className="w-4 h-4" />
            Form
          </button>
          <button
            onClick={() => switchView("SWITCH_TO_PREVIEW")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors min-h-[44px]",
              mobileView === "preview"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground"
            )}
          >
            <Eye className="w-4 h-4" />
            Pratinjau
          </button>
        </div>

        {/* Split Screen Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5 min-h-0 px-4 md:px-0">
          {/* Left Panel - Editor */}
          <div className={cn(
            "bg-card rounded-2xl border border-border/80 shadow-sm p-4 md:p-6 overflow-y-auto",
            mobileView !== "editor" && "hidden lg:block"
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
            "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-3 md:p-5 overflow-hidden flex flex-col",
            mobileView !== "preview" && "hidden lg:block"
          )}>
            <div className="text-xs text-slate-300 mb-3 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
              Pratinjau Langsung
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div
                className="bg-white rounded-[24px] shadow-2xl border border-white/10 overflow-hidden w-full"
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

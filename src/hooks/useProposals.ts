import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Proposal {
  id: string;
  title: string;
  description: string | null;
  client_name: string;
  client_initials: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalStats {
  pipelineValue: number;
  pipelineTrend: number;
  acceptanceRate: number;
  acceptanceTrend: number;
  activeCount: number;
  newThisWeek: number;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<ProposalStats>({
    pipelineValue: 0,
    pipelineTrend: 0,
    acceptanceRate: 0,
    acceptanceTrend: 0,
    activeCount: 0,
    newThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("proposals")
      .select("id, title, description, total, status, created_at, updated_at, clients(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    if (data) {
      const mappedProposals = data.map((p) => {
        const clientName = (p.clients as any)?.name || "Unknown Client";
        return {
          id: p.id,
          title: p.title,
          description: p.description,
          client_name: clientName,
          client_initials: getInitials(clientName),
          total: Number(p.total),
          status: p.status,
          created_at: p.created_at,
          updated_at: p.updated_at,
        };
      });

      setProposals(mappedProposals);

      // Calculate stats
      const activeProposals = mappedProposals.filter(p => p.status !== "draft");
      const acceptedProposals = mappedProposals.filter(p => p.status === "approved");
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newThisWeek = mappedProposals.filter(p => new Date(p.created_at) > oneWeekAgo).length;

      // Calculate MoM trends
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const currentMonthProposals = mappedProposals.filter(p => new Date(p.created_at) >= currentMonthStart);
      const prevMonthProposals = mappedProposals.filter(p => {
        const date = new Date(p.created_at);
        return date >= prevMonthStart && date <= prevMonthEnd;
      });

      // Pipeline: current month non-rejected vs previous month
      const currentPipeline = currentMonthProposals.filter(p => p.status !== "rejected").reduce((sum, p) => sum + p.total, 0);
      const prevPipeline = prevMonthProposals.filter(p => p.status !== "rejected").reduce((sum, p) => sum + p.total, 0);
      const pipelineTrend = calculateTrend(currentPipeline, prevPipeline);

      // Acceptance rate trend
      const currentAccepted = currentMonthProposals.filter(p => p.status === "approved").length;
      const currentTotal = currentMonthProposals.length;
      const currentRate = currentTotal > 0 ? (currentAccepted / currentTotal) * 100 : 0;
      
      const prevAccepted = prevMonthProposals.filter(p => p.status === "approved").length;
      const prevTotal = prevMonthProposals.length;
      const prevRate = prevTotal > 0 ? (prevAccepted / prevTotal) * 100 : 0;
      const acceptanceTrend = calculateTrend(currentRate, prevRate);

      setStats({
        pipelineValue: activeProposals.reduce((sum, p) => sum + p.total, 0),
        pipelineTrend,
        acceptanceRate: mappedProposals.length > 0 ? Math.round((acceptedProposals.length / mappedProposals.length) * 100) : 0,
        acceptanceTrend,
        activeCount: activeProposals.length,
        newThisWeek,
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return {
    proposals,
    stats,
    loading,
    error,
    refetch: fetchProposals,
  };
}

export function useProposalMutations() {
  const updateStatus = useCallback(async (proposalId: string, newStatus: string) => {
    const { error } = await supabase
      .from("proposals")
      .update({ status: newStatus })
      .eq("id", proposalId);

    if (error) throw new Error(error.message);
  }, []);

  const deleteProposal = useCallback(async (proposalId: string) => {
    const { error } = await supabase
      .from("proposals")
      .delete()
      .eq("id", proposalId);

    if (error) throw new Error(error.message);
  }, []);

  return {
    updateStatus,
    deleteProposal,
  };
}

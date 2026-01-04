/**
 * useProjects and useAnnotations Hooks
 * Manages projects, files, and annotations for client portal
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Project {
    id: string;
    user_id: string;
    client_id: string | null;
    contract_id: string | null;
    title: string;
    description: string | null;
    portal_token: string;
    portal_password: string | null;
    status: 'locked' | 'active' | 'review' | 'revision' | 'final' | 'archived';
    current_version: number;
    deadline: string | null;
    created_at: string;
    updated_at: string;
    clients?: {
        id: string;
        name: string;
        email: string | null;
        company: string | null;
    } | null;
}

export interface ProjectFile {
    id: string;
    project_id: string;
    filename: string;
    file_url: string;
    file_type: string | null;
    file_size: number | null;
    version: number;
    version_label: string | null;
    is_current: boolean;
    thumbnail_url: string | null;
    width: number | null;
    height: number | null;
    uploaded_at: string;
}

export interface Annotation {
    id: string;
    project_file_id: string;
    author_type: 'client' | 'designer';
    author_name: string;
    x_position: number;
    y_position: number;
    comment: string;
    status: 'open' | 'resolved';
    resolved_at: string | null;
    resolved_by: string | null;
    created_at: string;
}

export interface CreateProjectInput {
    title: string;
    description?: string;
    client_id?: string;
    contract_id?: string;
    deadline?: string;
}

export interface CreateAnnotationInput {
    project_file_id: string;
    author_type: 'client' | 'designer';
    author_name: string;
    x_position: number;
    y_position: number;
    comment: string;
}

// Projects Hook
export function useProjects() {
    const queryClient = useQueryClient();

    const { data: projects, isLoading, error, refetch } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("projects")
                .select(`
          *,
          clients (
            id,
            name,
            email,
            company
          )
        `)
                .eq("user_id", user.user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Project[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (input: CreateProjectInput) => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("projects")
                .insert({
                    user_id: user.user.id,
                    ...input,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Proyek berhasil dibuat");
        },
        onError: (error: Error) => {
            toast.error(`Gagal membuat proyek: ${error.message}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
            const { data, error } = await supabase
                .from("projects")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    return {
        projects,
        isLoading,
        error,
        refetch,
        createProject: createMutation.mutateAsync,
        updateProject: updateMutation.mutateAsync,
        isCreating: createMutation.isPending,
    };
}

// Project by token (public access)
export function useProjectByToken(token: string | undefined) {
    return useQuery({
        queryKey: ["project", token],
        queryFn: async () => {
            if (!token) return null;

            const { data, error } = await supabase
                .from("projects")
                .select(`
          *,
          clients (
            id,
            name,
            company
          )
        `)
                .eq("portal_token", token)
                .single();

            if (error) throw error;
            return data as Project;
        },
        enabled: !!token,
    });
}

// Project Files Hook
export function useProjectFiles(projectId: string | undefined) {
    const queryClient = useQueryClient();

    const { data: files, isLoading, refetch } = useQuery({
        queryKey: ["project-files", projectId],
        queryFn: async () => {
            if (!projectId) return [];

            const { data, error } = await supabase
                .from("project_files")
                .select("*")
                .eq("project_id", projectId)
                .order("version", { ascending: false });

            if (error) throw error;
            return data as ProjectFile[];
        },
        enabled: !!projectId,
    });

    const uploadMutation = useMutation({
        mutationFn: async ({
            projectId,
            file,
            versionLabel,
        }: {
            projectId: string;
            file: File;
            versionLabel?: string;
        }) => {
            // Get next version number
            const { data: existingFiles } = await supabase
                .from("project_files")
                .select("version")
                .eq("project_id", projectId)
                .order("version", { ascending: false })
                .limit(1);

            const nextVersion = existingFiles && existingFiles.length > 0
                ? existingFiles[0].version + 1
                : 1;

            // Upload file to storage
            const fileName = `${projectId}/${Date.now()}-${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("project-files")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("project-files")
                .getPublicUrl(fileName);

            // Create file record
            const { data, error } = await supabase
                .from("project_files")
                .insert({
                    project_id: projectId,
                    filename: file.name,
                    file_url: urlData.publicUrl,
                    file_type: file.type.split("/")[0],
                    file_size: file.size,
                    version: nextVersion,
                    version_label: versionLabel || `v${nextVersion}`,
                    is_current: true,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
            toast.success("File berhasil diupload");
        },
        onError: (error: Error) => {
            toast.error(`Gagal upload file: ${error.message}`);
        },
    });

    const currentFiles = files?.filter(f => f.is_current) || [];
    const archivedFiles = files?.filter(f => !f.is_current) || [];

    return {
        files,
        currentFiles,
        archivedFiles,
        isLoading,
        refetch,
        uploadFile: uploadMutation.mutateAsync,
        isUploading: uploadMutation.isPending,
    };
}

// Annotations Hook
export function useAnnotations(fileId: string | undefined) {
    const queryClient = useQueryClient();

    const { data: annotations, isLoading, refetch } = useQuery({
        queryKey: ["annotations", fileId],
        queryFn: async () => {
            if (!fileId) return [];

            const { data, error } = await supabase
                .from("annotations")
                .select("*")
                .eq("project_file_id", fileId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data as Annotation[];
        },
        enabled: !!fileId,
    });

    const createMutation = useMutation({
        mutationFn: async (input: CreateAnnotationInput) => {
            const { data, error } = await supabase
                .from("annotations")
                .insert(input)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["annotations", fileId] });
        },
    });

    const resolveMutation = useMutation({
        mutationFn: async ({ id, resolvedBy }: { id: string; resolvedBy: string }) => {
            const { data, error } = await supabase
                .from("annotations")
                .update({
                    status: "resolved",
                    resolved_at: new Date().toISOString(),
                    resolved_by: resolvedBy,
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["annotations", fileId] });
            toast.success("Komentar ditandai selesai");
        },
    });

    const openAnnotations = annotations?.filter(a => a.status === "open") || [];
    const resolvedAnnotations = annotations?.filter(a => a.status === "resolved") || [];

    return {
        annotations,
        openAnnotations,
        resolvedAnnotations,
        isLoading,
        refetch,
        addAnnotation: createMutation.mutateAsync,
        resolveAnnotation: resolveMutation.mutateAsync,
        isAdding: createMutation.isPending,
    };
}

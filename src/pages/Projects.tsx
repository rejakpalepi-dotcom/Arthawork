/**
 * Projects Management Page
 * List and manage projects with client portal links
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FolderKanban,
    Plus,
    Search,
    Copy,
    ExternalLink,
    MoreHorizontal,
    Lock,
    CheckCircle,
    Clock,
    Inbox,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string }> = {
    locked: { label: "Terkunci", color: "bg-amber-500/20 text-amber-500" },
    active: { label: "Aktif", color: "bg-green-500/20 text-green-500" },
    review: { label: "Review", color: "bg-blue-500/20 text-blue-500" },
    revision: { label: "Revisi", color: "bg-purple-500/20 text-purple-500" },
    final: { label: "Final", color: "bg-primary/20 text-primary" },
    archived: { label: "Arsip", color: "bg-muted text-muted-foreground" },
};

export default function Projects() {
    const navigate = useNavigate();
    const { projects, isLoading } = useProjects();
    const [searchQuery, setSearchQuery] = useState("");

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const copyPortalLink = (token: string) => {
        const link = `${window.location.origin}/portal/${token}`;
        navigator.clipboard.writeText(link);
        toast.success("Link portal berhasil disalin!");
    };

    const handleNewProject = () => {
        navigate("/projects/new");
    };

    const filteredProjects = projects?.filter(
        (project) =>
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="p-8">
                {/* Breadcrumb & Search */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span className="text-foreground">Projects</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-64 bg-secondary border-border"
                            />
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
                        <p className="text-muted-foreground">
                            Kelola proyek dan portal klien premium dengan pin-point feedback.
                        </p>
                    </div>
                    <Button className="gap-2" onClick={handleNewProject}>
                        <Plus className="w-4 h-4" />
                        New Project
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FolderKanban className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">Total Proyek</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{projects?.length || 0}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">Aktif</span>
                        </div>
                        <p className="text-2xl font-bold text-green-500">
                            {projects?.filter((p) => p.status === "active").length || 0}
                        </p>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Clock className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">Dalam Review</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-500">
                            {projects?.filter((p) => p.status === "review").length || 0}
                        </p>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Lock className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">Terkunci</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-500">
                            {projects?.filter((p) => p.status === "locked").length || 0}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : filteredProjects && filteredProjects.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Proyek</TableHead>
                                    <TableHead>Klien</TableHead>
                                    <TableHead>Versi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Deadline</TableHead>
                                    <TableHead className="w-[60px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProjects.map((project) => {
                                    const status = statusConfig[project.status] || statusConfig.active;
                                    return (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-medium">{project.title}</TableCell>
                                            <TableCell>{project.clients?.name || "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">v{project.current_version}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={status.color}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {project.deadline ? formatDate(project.deadline) : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => copyPortalLink(project.portal_token)}
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Salin Link Portal
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                window.open(`/portal/${project.portal_token}`, "_blank")
                                                            }
                                                        >
                                                            <ExternalLink className="h-4 w-4 mr-2" />
                                                            Buka Portal
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <EmptyState
                            icon={Inbox}
                            title="No projects yet"
                            description="Create your first project to start sharing client portals."
                            actionLabel="Create Project"
                            onAction={handleNewProject}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

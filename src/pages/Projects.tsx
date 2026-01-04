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
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Lock }> = {
    locked: { label: "Terkunci", color: "bg-amber-500/10 text-amber-500", icon: Lock },
    active: { label: "Aktif", color: "bg-green-500/10 text-green-500", icon: CheckCircle },
    review: { label: "Review", color: "bg-blue-500/10 text-blue-500", icon: Clock },
    revision: { label: "Revisi", color: "bg-purple-500/10 text-purple-500", icon: Clock },
    final: { label: "Final", color: "bg-primary/10 text-primary", icon: CheckCircle },
    archived: { label: "Arsip", color: "bg-muted text-muted-foreground", icon: FolderKanban },
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

    const filteredProjects = projects?.filter(
        (project) =>
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FolderKanban className="h-6 w-6 text-primary" />
                            Proyek
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Kelola proyek dan portal klien premium
                        </p>
                    </div>

                    <Button className="gap-2" onClick={() => navigate("/projects/new")}>
                        <Plus className="h-4 w-4" />
                        Proyek Baru
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Proyek</p>
                            <p className="text-2xl font-bold">{projects?.length || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Aktif</p>
                            <p className="text-2xl font-bold text-green-500">
                                {projects?.filter((p) => p.status === "active").length || 0}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Dalam Review</p>
                            <p className="text-2xl font-bold text-blue-500">
                                {projects?.filter((p) => p.status === "review").length || 0}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Terkunci</p>
                            <p className="text-2xl font-bold text-amber-500">
                                {projects?.filter((p) => p.status === "locked").length || 0}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari proyek..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
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
                                                <TableCell className="font-medium">
                                                    {project.title}
                                                </TableCell>
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
                            <div className="text-center py-12">
                                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="font-semibold mb-1">Belum ada proyek</h3>
                                <p className="text-muted-foreground mb-4">
                                    Buat proyek pertama untuk mulai berbagi portal ke klien
                                </p>
                                <Button onClick={() => navigate("/projects/new")}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Buat Proyek
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

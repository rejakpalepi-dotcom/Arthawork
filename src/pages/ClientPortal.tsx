/**
 * Client Portal Page
 * Premium portal for clients to view and annotate project files
 */

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useProjectByToken, useProjectFiles, useAnnotations } from "@/hooks/useProjects";
import { ImageAnnotator } from "@/components/portal/ImageAnnotator";
import { SanskritFrame, VersionTimeline, AnnotationSidebar } from "@/components/portal/PortalComponents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Building2,
    Calendar,
    Download,
    Sparkles,
    AlertTriangle,
    Lock,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function ClientPortal() {
    const { token } = useParams<{ token: string }>();
    const [searchParams] = useSearchParams();
    const { data: project, isLoading: projectLoading, error: projectError } = useProjectByToken(token);
    const { files, currentFiles } = useProjectFiles(project?.id);

    const [selectedFileIndex, setSelectedFileIndex] = useState(0);
    const selectedFile = currentFiles?.[selectedFileIndex];

    const { annotations, addAnnotation, resolveAnnotation } = useAnnotations(selectedFile?.id);

    const [clientName, setClientName] = useState("");
    const [isEntered, setIsEntered] = useState(false);
    const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

    // Load client name from localStorage
    useEffect(() => {
        const savedName = localStorage.getItem("portal_client_name");
        if (savedName) {
            setClientName(savedName);
            setIsEntered(true);
        }
    }, []);

    const handleEnter = () => {
        if (!clientName.trim()) {
            toast.error("Silakan masukkan nama Anda");
            return;
        }
        localStorage.setItem("portal_client_name", clientName.trim());
        setIsEntered(true);
    };

    const handleAddAnnotation = async (x: number, y: number, comment: string) => {
        if (!selectedFile) return;

        await addAnnotation({
            project_file_id: selectedFile.id,
            author_type: "client",
            author_name: clientName,
            x_position: x,
            y_position: y,
            comment,
        });
    };

    const handleResolve = async (id: string) => {
        await resolveAnnotation({ id, resolvedBy: clientName });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Loading State
    if (projectLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Skeleton className="h-16 w-64 mx-auto" />
                    <Skeleton className="h-[500px]" />
                </div>
            </div>
        );
    }

    // Error State
    if (projectError || !project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-red-500/30 bg-red-500/10">
                    <CardContent className="flex flex-col items-center py-12 text-center">
                        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Portal Tidak Ditemukan</h2>
                        <p className="text-muted-foreground">
                            Link portal tidak valid atau sudah kadaluarsa.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Locked State
    if (project.status === "locked") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-amber-500/30 bg-amber-500/10">
                    <CardContent className="flex flex-col items-center py-12 text-center">
                        <Lock className="h-16 w-16 text-amber-500 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Portal Terkunci</h2>
                        <p className="text-muted-foreground">
                            Portal ini akan aktif setelah pembayaran DP dikonfirmasi.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Name Entry Screen
    if (!isEntered) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10"
                >
                    <SanskritFrame>
                        <Card className="w-full max-w-md border-amber-500/30 bg-slate-900/80 backdrop-blur">
                            <CardHeader className="text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-primary/20 border border-amber-500/30">
                                        <Sparkles className="h-8 w-8 text-amber-400" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl text-white">{project.title}</CardTitle>
                                <p className="text-muted-foreground">Premium Client Portal</p>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="client-name">Nama Anda</Label>
                                    <Input
                                        id="client-name"
                                        placeholder="Masukkan nama lengkap"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                                        className="bg-slate-800/50 border-slate-700"
                                    />
                                </div>

                                <Button
                                    onClick={handleEnter}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                >
                                    Masuk ke Portal
                                </Button>
                            </CardContent>
                        </Card>
                    </SanskritFrame>
                </motion.div>
            </div>
        );
    }

    // Version data for timeline
    const versions = files?.map((f) => ({
        label: f.version_label || `v${f.version}`,
        date: f.uploaded_at,
        isCurrent: f.is_current,
    })) || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
                    <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-primary/20 border border-amber-500/30">
                                <Sparkles className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="font-semibold text-white">{project.title}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Premium Client Portal
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="bg-amber-500/10 border-amber-500/30 text-amber-400"
                        >
                            {project.status === "final" ? "Final" : "Dalam Pengerjaan"}
                        </Badge>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-6xl mx-auto p-4 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Image Preview (2/3) */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Version Timeline */}
                            {versions.length > 0 && (
                                <VersionTimeline
                                    versions={versions}
                                    onVersionClick={(i) => setSelectedFileIndex(i)}
                                />
                            )}

                            {/* Image Annotator */}
                            {selectedFile ? (
                                <SanskritFrame className="p-4">
                                    <div className="rounded-lg overflow-hidden bg-slate-800/50">
                                        <ImageAnnotator
                                            imageUrl={selectedFile.file_url}
                                            annotations={annotations || []}
                                            onAddAnnotation={handleAddAnnotation}
                                            onResolveAnnotation={handleResolve}
                                            authorName={clientName}
                                            authorType="client"
                                        />
                                    </div>
                                </SanskritFrame>
                            ) : (
                                <Card className="border-slate-700 bg-slate-800/50">
                                    <CardContent className="flex items-center justify-center py-24">
                                        <p className="text-muted-foreground">
                                            Belum ada file yang diupload
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Navigation */}
                            {currentFiles && currentFiles.length > 1 && (
                                <div className="flex justify-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={selectedFileIndex === 0}
                                        onClick={() => setSelectedFileIndex(i => i - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Sebelumnya
                                    </Button>
                                    <span className="text-sm text-muted-foreground self-center">
                                        {selectedFileIndex + 1} / {currentFiles.length}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={selectedFileIndex >= currentFiles.length - 1}
                                        onClick={() => setSelectedFileIndex(i => i + 1)}
                                    >
                                        Selanjutnya
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Sidebar (1/3) */}
                        <div className="space-y-6">
                            {/* Project Info */}
                            <Card className="border-slate-700 bg-slate-800/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Detail Proyek</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {project.clients && (
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-4 w-4 text-amber-400" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Klien</p>
                                                <p className="text-sm font-medium">{project.clients.name}</p>
                                            </div>
                                        </div>
                                    )}

                                    {project.deadline && (
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-amber-400" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Deadline</p>
                                                <p className="text-sm font-medium">{formatDate(project.deadline)}</p>
                                            </div>
                                        </div>
                                    )}

                                    <Separator className="bg-slate-700" />

                                    <p className="text-sm text-muted-foreground">
                                        <strong>Petunjuk:</strong> Klik pada gambar untuk menambahkan komentar revisi.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Annotations */}
                            <Card className="border-slate-700 bg-slate-800/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">Komentar Revisi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <AnnotationSidebar
                                        annotations={annotations || []}
                                        onResolve={handleResolve}
                                        onAnnotationClick={setActiveAnnotationId}
                                        activeAnnotationId={activeAnnotationId}
                                    />
                                </CardContent>
                            </Card>

                            {/* Download Button (for final) */}
                            {project.status === "final" && selectedFile && (
                                <Button
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                                    asChild
                                >
                                    <a href={selectedFile.file_url} download>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download File Final
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-center py-8 border-t border-slate-800 mt-12">
                    <p className="text-xs text-muted-foreground">
                        Powered by <span className="text-amber-400 font-semibold">ArthaWork</span>
                        <br />
                        Premium Client Experience
                    </p>
                </footer>
            </div>
        </div>
    );
}

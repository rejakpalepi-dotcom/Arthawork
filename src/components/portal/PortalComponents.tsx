/**
 * Sanskrit-inspired Decorative Frame Component
 * Premium aesthetic for client portal
 */

import { ReactNode } from "react";

interface SanskritFrameProps {
    children: ReactNode;
    className?: string;
}

export function SanskritFrame({ children, className = "" }: SanskritFrameProps) {
    return (
        <div className={`relative ${className}`}>
            {/* Corner Decorations */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-l-2 border-t-2 border-amber-500/50 rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-r-2 border-t-2 border-amber-500/50 rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-2 border-b-2 border-amber-500/50 rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-2 border-b-2 border-amber-500/50 rounded-br-lg" />

            {/* Inner Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

/**
 * Version Timeline Component
 * Visual progression from v1 → v2 → Final
 */

interface VersionTimelineProps {
    versions: {
        label: string;
        date: string;
        isCurrent: boolean;
    }[];
    onVersionClick?: (index: number) => void;
}

export function VersionTimeline({ versions, onVersionClick }: VersionTimelineProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {versions.map((version, index) => (
                <div key={index} className="flex items-center">
                    <button
                        onClick={() => onVersionClick?.(index)}
                        className={`
              relative px-4 py-2 rounded-lg border-2 transition-all
              ${version.isCurrent
                                ? "bg-amber-500/20 border-amber-500 text-amber-400"
                                : "bg-slate-800/50 border-slate-700 text-muted-foreground hover:border-slate-600"
                            }
            `}
                    >
                        <span className="font-semibold">{version.label}</span>
                        <span className="block text-xs opacity-70">
                            {new Date(version.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                            })}
                        </span>
                        {version.isCurrent && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                        )}
                    </button>

                    {/* Connector Line */}
                    {index < versions.length - 1 && (
                        <div className="w-8 h-0.5 bg-gradient-to-r from-slate-600 to-slate-700 mx-1" />
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * Annotation Sidebar Component
 * List of all comments with resolve actions
 */

interface AnnotationSidebarProps {
    annotations: Array<{
        id: string;
        author_name: string;
        author_type: 'client' | 'designer';
        comment: string;
        status: 'open' | 'resolved';
        created_at: string;
        resolved_by?: string | null;
    }>;
    onResolve?: (id: string) => void;
    onAnnotationClick?: (id: string) => void;
    activeAnnotationId?: string | null;
}

export function AnnotationSidebar({
    annotations,
    onResolve,
    onAnnotationClick,
    activeAnnotationId,
}: AnnotationSidebarProps) {
    const openAnnotations = annotations.filter(a => a.status === "open");
    const resolvedAnnotations = annotations.filter(a => a.status === "resolved");

    return (
        <div className="space-y-4">
            {/* Open Annotations */}
            {openAnnotations.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        Komentar Aktif ({openAnnotations.length})
                    </h4>
                    <div className="space-y-2">
                        {openAnnotations.map((annotation) => (
                            <div
                                key={annotation.id}
                                onClick={() => onAnnotationClick?.(annotation.id)}
                                className={`
                  p-3 rounded-lg border cursor-pointer transition-all
                  ${activeAnnotationId === annotation.id
                                        ? "bg-amber-500/20 border-amber-500"
                                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                                    }
                `}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`
                    text-xs font-medium px-2 py-0.5 rounded
                    ${annotation.author_type === 'client'
                                            ? 'bg-amber-500/20 text-amber-400'
                                            : 'bg-primary/20 text-primary'
                                        }
                  `}>
                                        {annotation.author_type === 'client' ? 'Klien' : 'Designer'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {annotation.author_name}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-200 line-clamp-2">{annotation.comment}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(annotation.created_at).toLocaleString("id-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                    {onResolve && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onResolve(annotation.id);
                                            }}
                                            className="text-xs text-green-500 hover:underline"
                                        >
                                            Selesai
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resolved Annotations */}
            {resolvedAnnotations.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Selesai ({resolvedAnnotations.length})
                    </h4>
                    <div className="space-y-2">
                        {resolvedAnnotations.map((annotation) => (
                            <div
                                key={annotation.id}
                                className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 opacity-70"
                            >
                                <p className="text-sm text-slate-400 line-clamp-2">{annotation.comment}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-green-500">✓ {annotation.resolved_by}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {annotations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Belum ada komentar</p>
                </div>
            )}
        </div>
    );
}

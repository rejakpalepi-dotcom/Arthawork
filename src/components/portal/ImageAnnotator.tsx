/**
 * Image Annotator Component
 * Allows pin-point feedback on images
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, MessageCircle, Send, Loader2 } from "lucide-react";
import type { Annotation } from "@/hooks/useProjects";

interface ImageAnnotatorProps {
    imageUrl: string;
    annotations: Annotation[];
    onAddAnnotation: (x: number, y: number, comment: string) => Promise<void>;
    onResolveAnnotation?: (id: string) => Promise<void>;
    authorName: string;
    authorType: 'client' | 'designer';
    readOnly?: boolean;
}

export function ImageAnnotator({
    imageUrl,
    annotations,
    onAddAnnotation,
    onResolveAnnotation,
    authorName,
    authorType,
    readOnly = false,
}: ImageAnnotatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);

    const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (readOnly) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Calculate percentage position
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setPendingPin({ x, y });
        setComment("");
        setSelectedAnnotation(null);
    }, [readOnly]);

    const handleSubmit = async () => {
        if (!pendingPin || !comment.trim()) return;

        setIsSubmitting(true);
        try {
            await onAddAnnotation(pendingPin.x, pendingPin.y, comment.trim());
            setPendingPin(null);
            setComment("");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setPendingPin(null);
        setComment("");
    };

    const handlePinClick = (e: React.MouseEvent, annotationId: string) => {
        e.stopPropagation();
        setSelectedAnnotation(selectedAnnotation === annotationId ? null : annotationId);
        setPendingPin(null);
    };

    return (
        <div className="relative w-full">
            {/* Image Container */}
            <div
                ref={containerRef}
                className="relative cursor-crosshair rounded-lg overflow-hidden bg-slate-900"
                onClick={handleImageClick}
            >
                <img
                    src={imageUrl}
                    alt="Draft Preview"
                    className="w-full h-auto"
                    draggable={false}
                />

                {/* Existing Annotations */}
                {annotations.map((annotation) => (
                    <motion.div
                        key={annotation.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute"
                        style={{
                            left: `${annotation.x_position}%`,
                            top: `${annotation.y_position}%`,
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <button
                            onClick={(e) => handlePinClick(e, annotation.id)}
                            className={`
                w-8 h-8 rounded-full flex items-center justify-center
                transition-all shadow-lg
                ${annotation.status === "resolved"
                                    ? "bg-green-500 text-white"
                                    : annotation.author_type === "client"
                                        ? "bg-amber-500 text-white"
                                        : "bg-primary text-white"
                                }
                ${selectedAnnotation === annotation.id ? "ring-4 ring-white/50 scale-110" : "hover:scale-110"}
              `}
                        >
                            <MessageCircle className="h-4 w-4" />
                        </button>

                        {/* Annotation Popup */}
                        <AnimatePresence>
                            {selectedAnnotation === annotation.id && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-1/2 top-full mt-2 -translate-x-1/2 z-50"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl min-w-[250px] max-w-[300px]">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <p className="font-semibold text-sm text-white">
                                                    {annotation.author_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(annotation.created_at).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedAnnotation(null)}
                                                className="text-muted-foreground hover:text-white"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-200">{annotation.comment}</p>

                                        {annotation.status === "open" && onResolveAnnotation && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-3 w-full"
                                                onClick={() => onResolveAnnotation(annotation.id)}
                                            >
                                                Tandai Selesai
                                            </Button>
                                        )}

                                        {annotation.status === "resolved" && (
                                            <p className="text-xs text-green-500 mt-2">
                                                ✓ Selesai oleh {annotation.resolved_by}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}

                {/* Pending Pin */}
                <AnimatePresence>
                    {pendingPin && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute z-50"
                            style={{
                                left: `${pendingPin.x}%`,
                                top: `${pendingPin.y}%`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/30 animate-pulse">
                                <MessageCircle className="h-4 w-4 text-white" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Comment Input */}
            <AnimatePresence>
                {pendingPin && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-4 rounded-lg bg-slate-800 border border-slate-700"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-sm font-semibold shrink-0">
                                {authorName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 space-y-3">
                                <Textarea
                                    placeholder="Tulis komentar revisi Anda..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="min-h-[80px] bg-slate-700/50 border-slate-600"
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancel}
                                        disabled={isSubmitting}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Batal
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSubmit}
                                        disabled={!comment.trim() || isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4 mr-1" />
                                        )}
                                        Kirim
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions */}
            {!readOnly && !pendingPin && (
                <p className="text-sm text-muted-foreground text-center mt-3">
                    Klik pada gambar untuk menambahkan komentar revisi
                </p>
            )}
        </div>
    );
}

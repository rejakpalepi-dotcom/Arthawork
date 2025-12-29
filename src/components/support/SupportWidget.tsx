import { MessageCircle, X, HelpCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SupportWidgetProps {
    whatsappNumber?: string;
    message?: string;
}

export function SupportWidget({
    whatsappNumber = "6281285864059",
    message = "Halo, saya butuh bantuan dengan Artha...",
}: SupportWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        // Hidden on mobile (< 768px) to avoid blocking navigation
        <div className="fixed bottom-4 right-4 z-40 hidden md:block">
            {/* Compact Widget */}
            {isOpen && (
                <div className="absolute bottom-14 right-0 w-64 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-150 bg-card border border-border/50">
                    {/* Header */}
                    <div className="bg-secondary/80 backdrop-blur px-4 py-3 border-b border-border/30">
                        <h3 className="font-semibold text-sm text-foreground">Butuh Bantuan?</h3>
                    </div>

                    {/* Options */}
                    <div className="p-2 space-y-1">
                        {/* WhatsApp */}
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                                <MessageCircle className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground">WhatsApp</p>
                                <p className="text-xs text-muted-foreground truncate">+62 812-8586-4059</p>
                            </div>
                        </a>

                        {/* FAQ */}
                        <Link
                            to="/faq"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                <HelpCircle className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground">FAQ</p>
                                <p className="text-xs text-muted-foreground truncate">Cari jawaban</p>
                            </div>
                        </Link>
                    </div>
                </div>
            )}

            {/* Compact FAB - Only visible on tablet/desktop */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-11 h-11 rounded-full shadow-lg transition-all duration-200",
                    isOpen
                        ? "bg-secondary hover:bg-secondary/80 text-foreground"
                        : "bg-primary hover:bg-primary/90"
                )}
                size="icon"
            >
                {isOpen ? (
                    <X className="w-5 h-5" />
                ) : (
                    <MessageCircle className="w-5 h-5" />
                )}
            </Button>
        </div>
    );
}

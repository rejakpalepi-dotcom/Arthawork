import { MessageCircle, X, HelpCircle, Sparkles } from "lucide-react";
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
        <div className="fixed bottom-6 right-6 z-50">
            {/* Expanded Widget */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 border border-border/50">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-br from-primary via-primary to-cyan-600 p-5 text-primary-foreground">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Butuh Bantuan?</h3>
                                <p className="text-sm text-white/80">Tim kami siap membantu!</p>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="bg-card p-4 space-y-3">
                        {/* WhatsApp - Primary CTA */}
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-white text-base">WhatsApp</p>
                                <p className="text-sm text-white/80">Chat langsung • Respon cepat</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        </a>

                        {/* FAQ - Secondary */}
                        <Link
                            to="/faq"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-all duration-300 border border-border/50"
                        >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <HelpCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-foreground">Pusat Bantuan</p>
                                <p className="text-sm text-muted-foreground">Cari jawaban sendiri</p>
                            </div>
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="bg-secondary/50 px-4 py-3 text-center border-t border-border/30">
                        <p className="text-xs text-muted-foreground">
                            Jam operasional: 09.00 - 21.00 WIB
                        </p>
                    </div>
                </div>
            )}

            {/* FAB Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110",
                    isOpen
                        ? "bg-secondary hover:bg-secondary/80 text-foreground"
                        : "bg-gradient-to-br from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-700"
                )}
                size="icon"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <MessageCircle className="w-6 h-6 text-white" />
                        {/* Online indicator */}
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                    </>
                )}
            </Button>
        </div>
    );
}

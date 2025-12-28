import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SupportWidgetProps {
    whatsappNumber?: string;
    message?: string;
}

export function SupportWidget({
    whatsappNumber = "6281234567890",
    message = "Halo, saya butuh bantuan dengan Artha...",
}: SupportWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Expanded state */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="bg-primary p-4 text-primary-foreground">
                        <h3 className="font-semibold">Butuh Bantuan?</h3>
                        <p className="text-sm opacity-90">Tim support kami siap membantu!</p>
                    </div>
                    <div className="p-4 space-y-3">
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">WhatsApp</p>
                                <p className="text-xs text-muted-foreground">Respon cepat</p>
                            </div>
                        </a>
                        <a
                            href="mailto:support@arthawork.com"
                            className="flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xl">✉️</span>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Email</p>
                                <p className="text-xs text-muted-foreground">support@arthawork.com</p>
                            </div>
                        </a>
                        <a
                            href="/faq"
                            className="flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xl">❓</span>
                            </div>
                            <div>
                                <p className="font-medium text-foreground">FAQ</p>
                                <p className="text-xs text-muted-foreground">Cari jawaban sendiri</p>
                            </div>
                        </a>
                    </div>
                </div>
            )}

            {/* FAB Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
                    isOpen ? "bg-secondary hover:bg-secondary/80 rotate-0" : "bg-primary hover:bg-primary/90"
                )}
                size="icon"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <MessageCircle className="w-6 h-6" />
                        {/* Ping animation */}
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full" />
                    </>
                )}
            </Button>
        </div>
    );
}

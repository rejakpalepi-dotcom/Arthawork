import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Check, X, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/lib/subscription";

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reason?: "invoice_limit" | "proposal_limit" | "client_limit" | "feature";
    featureName?: string;
}

export function UpgradeModal({ open, onOpenChange, reason, featureName }: UpgradeModalProps) {
    const navigate = useNavigate();
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("pro");

    const getReasonText = () => {
        switch (reason) {
            case "invoice_limit":
                return "Kuota invoice bulanan Anda di paket Gratis sudah habis.";
            case "proposal_limit":
                return "Kuota proposal bulanan Anda di paket Gratis sudah habis.";
            case "client_limit":
                return "Batas klien untuk paket Gratis sudah tercapai.";
            case "feature":
                return `${featureName || "Fitur ini"} tersedia di paket Pro dan Business.`;
            default:
                return "Naik paket untuk membuka fitur tanpa batas dan mengembangkan bisnis Anda.";
        }
    };

    const handleUpgrade = (tier: SubscriptionTier) => {
        onOpenChange(false);
        navigate(`/pricing?tier=${tier}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent data-ui-panel="upgrade-modal" className="sm:max-w-[600px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Zap className="w-6 h-6 text-primary" />
                        Tingkatkan Paket Anda
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {getReasonText()}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Pro Plan */}
                    <div
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTier === "pro"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                        onClick={() => setSelectedTier("pro")}
                    >
                        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                            POPULAR
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-lg">Pro</h3>
                        </div>
                        <p className="text-2xl font-bold text-foreground mb-4">
                            {SUBSCRIPTION_TIERS.pro.priceDisplay}
                            <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </p>
                        <ul className="space-y-2">
                            {SUBSCRIPTION_TIERS.pro.features.slice(0, 5).map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-success shrink-0" />
                                    <span className="text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            className="w-full mt-4"
                            variant={selectedTier === "pro" ? "default" : "outline"}
                            onClick={() => handleUpgrade("pro")}
                        >
                            Pilih Pro
                        </Button>
                    </div>

                    {/* Business Plan */}
                    <div
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTier === "business"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                        onClick={() => setSelectedTier("business")}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Rocket className="w-5 h-5 text-warning" />
                            <h3 className="font-bold text-lg">Business</h3>
                        </div>
                        <p className="text-2xl font-bold text-foreground mb-4">
                            {SUBSCRIPTION_TIERS.business.priceDisplay}
                            <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </p>
                        <ul className="space-y-2">
                            {SUBSCRIPTION_TIERS.business.features.slice(0, 5).map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-success shrink-0" />
                                    <span className="text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            className="w-full mt-4"
                            variant={selectedTier === "business" ? "default" : "outline"}
                            onClick={() => handleUpgrade("business")}
                        >
                            Pilih Business
                        </Button>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    Semua paket berisi uji coba gratis 14 hari. Anda bisa berhenti kapan saja.
                </p>
            </DialogContent>
        </Dialog>
    );
}

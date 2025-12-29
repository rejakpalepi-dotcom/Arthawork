import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Zap, Crown, Rocket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/lib/subscription";
import { cn } from "@/lib/utils";

export default function Pricing() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const highlightedTier = searchParams.get("tier") as SubscriptionTier | null;
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(highlightedTier || "pro");

    const tiers: { key: SubscriptionTier; icon: typeof Zap; iconColor: string }[] = [
        { key: "free", icon: Zap, iconColor: "text-muted-foreground" },
        { key: "pro", icon: Crown, iconColor: "text-primary" },
        { key: "business", icon: Rocket, iconColor: "text-warning" },
    ];

    const handleSelectPlan = (tier: SubscriptionTier) => {
        if (tier === "free") {
            navigate("/dashboard");
            return;
        }
        // For paid tiers, navigate to checkout with Midtrans
        navigate(`/checkout?tier=${tier}`);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </div>
            </div>

            {/* Hero */}
            <div className="py-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    Choose Your Plan
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Start free, upgrade when you're ready. All plans include a 14-day free trial.
                </p>

                {/* Coming Soon Banner */}
                <div className="mt-8 max-w-xl mx-auto">
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-xl px-6 py-4">
                        <div className="flex items-center justify-center gap-2 text-primary font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Pembayaran Pro & Business segera hadir!
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Daftar sekarang dengan paket Free untuk akses awal.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-6xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tiers.map(({ key, icon: Icon, iconColor }) => {
                        const tier = SUBSCRIPTION_TIERS[key];
                        const isHighlighted = tier.highlighted || key === highlightedTier;
                        const isSelected = selectedTier === key;

                        return (
                            <div
                                key={key}
                                className={cn(
                                    "relative rounded-2xl border-2 p-6 transition-all cursor-pointer",
                                    isHighlighted
                                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                        : "border-border hover:border-primary/50",
                                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                )}
                                onClick={() => setSelectedTier(key)}
                            >
                                {isHighlighted && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={cn("p-2 rounded-lg", isHighlighted ? "bg-primary/10" : "bg-secondary")}>
                                        <Icon className={cn("w-6 h-6", iconColor)} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground">{tier.displayName}</h2>
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-foreground">
                                        {tier.price === 0 ? "Free" : tier.priceDisplay}
                                    </span>
                                    {tier.price > 0 && (
                                        <span className="text-muted-foreground">/month</span>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full"
                                    variant={isHighlighted ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => handleSelectPlan(key)}
                                >
                                    {key === "free" ? "Continue Free" : `Get ${tier.displayName}`}
                                </Button>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ or Trust badges */}
                <div className="mt-16 text-center">
                    <p className="text-muted-foreground mb-4">
                        Trusted by 1,000+ Indonesian creatives
                    </p>
                    <div className="flex justify-center gap-8 text-muted-foreground/50">
                        <span>🔒 Secure Payment</span>
                        <span>💳 QRIS, VA, E-wallet</span>
                        <span>❌ Cancel Anytime</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

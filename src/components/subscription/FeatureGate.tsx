import { Lock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { ProFeature, BusinessFeature, getFeatureDisplayName } from "@/lib/subscription";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { useState } from "react";

interface FeatureGateProps {
    feature: ProFeature | BusinessFeature;
    type: "pro" | "business";
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showBadge?: boolean;
    className?: string;
}

/**
 * Gate a feature behind Pro or Business subscription
 * Shows upgrade modal when Free users try to access
 */
export function FeatureGate({
    feature,
    type,
    children,
    fallback,
    showBadge = true,
    className,
}: FeatureGateProps) {
    const { hasProAccess, hasBusinessAccess, isDeveloper } = useSubscription();
    const [showUpgrade, setShowUpgrade] = useState(false);

    const hasAccess =
        isDeveloper ||
        (type === "pro" ? hasProAccess(feature as ProFeature) : hasBusinessAccess(feature as BusinessFeature));

    if (hasAccess) {
        return <>{children}</>;
    }

    // Show locked state
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowUpgrade(true);
    };

    if (fallback) {
        return (
            <>
                <div onClick={handleClick} className="cursor-pointer">
                    {fallback}
                </div>
                <UpgradeModal
                    open={showUpgrade}
                    onOpenChange={setShowUpgrade}
                    reason="feature"
                    featureName={getFeatureDisplayName(feature)}
                />
            </>
        );
    }

    return (
        <>
            <div
                onClick={handleClick}
                className={cn(
                    "relative cursor-pointer group",
                    className
                )}
            >
                {/* Locked overlay */}
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span>Unlock with {type === "pro" ? "Pro" : "Business"}</span>
                    </div>
                </div>

                {/* Badge */}
                {showBadge && (
                    <div className="absolute -top-2 -right-2 z-20">
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1",
                            type === "pro"
                                ? "bg-primary text-primary-foreground"
                                : "bg-warning text-warning-foreground"
                        )}>
                            <Crown className="w-3 h-3" />
                            {type === "pro" ? "PRO" : "BUSINESS"}
                        </div>
                    </div>
                )}

                {/* Content (dimmed) */}
                <div className="opacity-50 pointer-events-none">
                    {children}
                </div>
            </div>

            <UpgradeModal
                open={showUpgrade}
                onOpenChange={setShowUpgrade}
                reason="feature"
                featureName={getFeatureDisplayName(feature)}
            />
        </>
    );
}

/**
 * Simple Pro badge to show on features
 */
export function ProBadge({ type = "pro" }: { type?: "pro" | "business" }) {
    return (
        <span className={cn(
            "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
            type === "pro"
                ? "bg-primary/20 text-primary"
                : "bg-warning/20 text-warning"
        )}>
            {type === "pro" ? "Pro" : "Business"}
        </span>
    );
}

/**
 * Hook to check feature access with modal trigger
 */
export function useFeatureAccess() {
    const { hasProAccess, hasBusinessAccess, isDeveloper } = useSubscription();
    const [upgradeModal, setUpgradeModal] = useState<{
        open: boolean;
        feature: string;
    }>({ open: false, feature: "" });

    const checkProFeature = (feature: ProFeature): boolean => {
        if (isDeveloper || hasProAccess(feature)) return true;
        setUpgradeModal({ open: true, feature: getFeatureDisplayName(feature) });
        return false;
    };

    const checkBusinessFeature = (feature: BusinessFeature): boolean => {
        if (isDeveloper || hasBusinessAccess(feature)) return true;
        setUpgradeModal({ open: true, feature: getFeatureDisplayName(feature) });
        return false;
    };

    const UpgradeModalComponent = (
        <UpgradeModal
            open={upgradeModal.open}
            onOpenChange={(open) => setUpgradeModal(prev => ({ ...prev, open }))}
            reason="feature"
            featureName={upgradeModal.feature}
        />
    );

    return {
        checkProFeature,
        checkBusinessFeature,
        UpgradeModalComponent,
    };
}

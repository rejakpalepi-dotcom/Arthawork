import { Crown, Zap, Rocket, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";
import { cn } from "@/lib/utils";

export function SubscriptionTab() {
    const navigate = useNavigate();
    const {
        tier,
        tierConfig,
        usage,
        remainingInvoices,
        remainingProposals,
        isLoading,
        isPro,
    } = useSubscription();

    if (isLoading) {
        return (
            <div className="lg:col-span-3 animate-pulse">
                <div className="h-48 bg-secondary rounded-xl" />
            </div>
        );
    }

    const invoiceLimit = tierConfig.limits.invoicesPerMonth;
    const proposalLimit = tierConfig.limits.proposalsPerMonth;
    const invoiceProgress = invoiceLimit === Infinity ? 0 : (usage.invoices / invoiceLimit) * 100;
    const proposalProgress = proposalLimit === Infinity ? 0 : (usage.proposals / proposalLimit) * 100;

    return (
        <div className="lg:col-span-3 space-y-6">
            {/* Current Plan */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {tier === "free" && <Zap className="w-6 h-6 text-muted-foreground" />}
                            {tier === "pro" && <Crown className="w-6 h-6 text-primary" />}
                            {tier === "business" && <Rocket className="w-6 h-6 text-warning" />}
                            <div>
                                <CardTitle className="text-lg">Current Plan: {tierConfig.displayName}</CardTitle>
                                <CardDescription>
                                    {tier === "free"
                                        ? "Upgrade to unlock unlimited features"
                                        : "You have access to all premium features"}
                                </CardDescription>
                            </div>
                        </div>
                        {tier === "free" && (
                            <Button onClick={() => navigate("/pricing")}>
                                Upgrade
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tierConfig.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-success shrink-0" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Usage Stats - Only show for free tier */}
            {tier === "free" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Monthly Usage</CardTitle>
                        <CardDescription>
                            Your usage resets on the 1st of each month
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Invoice Usage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Invoices</span>
                                <span className="font-medium">
                                    {usage.invoices} / {invoiceLimit}
                                </span>
                            </div>
                            <Progress
                                value={invoiceProgress}
                                className={cn(
                                    "h-2",
                                    invoiceProgress >= 80 && "bg-warning/20 [&>div]:bg-warning",
                                    invoiceProgress >= 100 && "bg-destructive/20 [&>div]:bg-destructive"
                                )}
                            />
                            <p className="text-xs text-muted-foreground">
                                {remainingInvoices()} invoices remaining this month
                            </p>
                        </div>

                        {/* Proposal Usage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Proposals</span>
                                <span className="font-medium">
                                    {usage.proposals} / {proposalLimit}
                                </span>
                            </div>
                            <Progress
                                value={proposalProgress}
                                className={cn(
                                    "h-2",
                                    proposalProgress >= 80 && "bg-warning/20 [&>div]:bg-warning",
                                    proposalProgress >= 100 && "bg-destructive/20 [&>div]:bg-destructive"
                                )}
                            />
                            <p className="text-xs text-muted-foreground">
                                {remainingProposals()} proposals remaining this month
                            </p>
                        </div>

                        {/* Client Count */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Clients</span>
                                <span className="font-medium">
                                    {usage.clients} / {tierConfig.limits.clients}
                                </span>
                            </div>
                            <Progress
                                value={(usage.clients / tierConfig.limits.clients) * 100}
                                className="h-2"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Compare Plans */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Compare Plans</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {(["free", "pro", "business"] as const).map((t) => {
                            const config = SUBSCRIPTION_TIERS[t];
                            const isCurrent = t === tier;
                            return (
                                <div
                                    key={t}
                                    className={cn(
                                        "p-4 rounded-xl border-2",
                                        isCurrent ? "border-primary bg-primary/5" : "border-border"
                                    )}
                                >
                                    <p className="font-bold text-lg">{config.displayName}</p>
                                    <p className="text-2xl font-bold text-primary my-2">
                                        {config.price === 0 ? "Free" : config.priceDisplay}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {config.limits.invoicesPerMonth === Infinity
                                            ? "Unlimited"
                                            : `${config.limits.invoicesPerMonth} invoices/mo`}
                                    </p>
                                    {!isCurrent && t !== "free" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="mt-3"
                                            onClick={() => navigate(`/pricing?tier=${t}`)}
                                        >
                                            Upgrade
                                        </Button>
                                    )}
                                    {isCurrent && (
                                        <span className="inline-block mt-3 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                            Current
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

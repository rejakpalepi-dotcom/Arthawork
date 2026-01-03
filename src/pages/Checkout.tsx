import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/lib/subscription";
import { createMayarPayment, redirectToPayment } from "@/lib/mayar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tierParam = searchParams.get("tier") as SubscriptionTier | null;
    const tier = tierParam && tierParam !== "free" ? tierParam : "pro";

    const [loading, setLoading] = useState(false);

    const tierConfig = SUBSCRIPTION_TIERS[tier];

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please log in to continue");
                navigate("/login");
                return;
            }

            // Create Mayar payment link via Edge Function
            const { paymentUrl } = await createMayarPayment({
                amount: tierConfig.price,
                tier: tier as "pro" | "business",
                customerEmail: user.email || "",
                customerName: user.user_metadata?.full_name || "Customer",
            });

            // Redirect to Mayar payment page
            toast.success("Redirecting to payment...");
            redirectToPayment(paymentUrl);
        } catch (error: unknown) {
            console.error("Checkout error:", error);
            const message = error instanceof Error ? error.message : "Failed to process payment";
            toast.error(message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Purchase</h1>
                <p className="text-muted-foreground mb-8">
                    You're upgrading to Artha {tierConfig.displayName}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Summary */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Plan</span>
                                <span className="font-medium">{tierConfig.displayName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Billing</span>
                                <span className="font-medium">Monthly</span>
                            </div>
                            <div className="border-t border-border pt-4">
                                <div className="flex justify-between text-lg">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-primary">{tierConfig.priceDisplay}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Action */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Payment</CardTitle>
                            <CardDescription>
                                You'll be redirected to our secure payment page
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-secondary/30 rounded-lg text-sm text-muted-foreground">
                                <p>We accept:</p>
                                <ul className="mt-2 space-y-1">
                                    <li>• QRIS (GoPay, ShopeePay, DANA, etc.)</li>
                                    <li>• Virtual Account (BCA, BNI, BRI, Mandiri)</li>
                                    <li>• Credit/Debit Card</li>
                                </ul>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    `Pay ${tierConfig.priceDisplay}`
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Shield className="w-4 h-4" />
                                Secured by Mayar. Your payment is safe.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

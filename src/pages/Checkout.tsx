import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "@/lib/subscription";
import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import { PaymentMethod, openSnapPopup, createSnapToken } from "@/lib/midtrans";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tierParam = searchParams.get("tier") as SubscriptionTier | null;
    const tier = tierParam && tierParam !== "free" ? tierParam : "pro";

    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
    const [loading, setLoading] = useState(false);

    const tierConfig = SUBSCRIPTION_TIERS[tier];

    const handleCheckout = async () => {
        if (!selectedPayment) {
            toast.error("Please select a payment method");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please log in to continue");
                navigate("/login");
                return;
            }

            // Generate order ID
            const orderId = `ARTHA-${tier.toUpperCase()}-${Date.now()}`;

            // Create Snap token via Edge Function
            const snapToken = await createSnapToken({
                orderId,
                amount: tierConfig.price,
                itemName: `Artha ${tierConfig.displayName} - Monthly`,
                customerEmail: user.email || "",
                customerName: user.user_metadata?.full_name || "Customer",
                paymentMethod: selectedPayment,
            });

            // Open Midtrans popup
            await openSnapPopup(snapToken, {
                onSuccess: (result) => {
                    toast.success("Payment successful! 🎉");
                    // Update subscription status
                    navigate("/dashboard?upgraded=true");
                },
                onPending: (result) => {
                    toast.info("Payment pending. Please complete your payment.");
                    navigate("/dashboard?payment=pending");
                },
                onError: (result) => {
                    toast.error("Payment failed. Please try again.");
                },
                onClose: () => {
                    toast.info("Payment cancelled");
                },
            });
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast.error(error.message || "Failed to process payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <Button variant="ghost" onClick={() => navigate("/pricing")} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Pricing
                    </Button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Purchase</h1>
                <p className="text-muted-foreground mb-8">
                    You're upgrading to Artha {tierConfig.displayName}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Order Summary */}
                    <Card className="md:col-span-1 h-fit">
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

                    {/* Payment Method */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Payment Method</CardTitle>
                            <CardDescription>
                                Choose your preferred payment method
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <PaymentMethodSelector
                                selectedMethod={selectedPayment}
                                onSelect={setSelectedPayment}
                                disabled={loading}
                            />

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={!selectedPayment || loading}
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
                                Secured by Midtrans. Your payment is safe.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

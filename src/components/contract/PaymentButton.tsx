/**
 * Payment Button Component
 * Shows payment button after contract is signed
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2, ExternalLink, QrCode, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { createContractPayment } from "@/hooks/useContracts";
import { toast } from "sonner";

interface PaymentButtonProps {
    contractToken: string;
    dpAmount: number;
    isPaid?: boolean;
}

export function PaymentButton({ contractToken, dpAmount, isPaid = false }: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const result = await createContractPayment(contractToken);

            if (result.paymentUrl) {
                // Redirect to Mayar payment page
                window.location.href = result.paymentUrl;
            } else {
                toast.error("Gagal membuat link pembayaran");
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Gagal memulai pembayaran. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isPaid) {
        return (
            <Card className="border-green-500/50 bg-green-500/10">
                <CardContent className="flex items-center justify-center py-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-3 text-green-500"
                    >
                        <div className="p-2 rounded-full bg-green-500/20">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-semibold">Pembayaran DP Berhasil</p>
                            <p className="text-sm text-green-500/80">
                                {formatCurrency(dpAmount)} telah diterima
                            </p>
                        </div>
                    </motion.div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/30 bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
            <CardContent className="p-6 space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Down Payment</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(dpAmount)}</p>
                </div>

                {/* Payment methods */}
                <div className="flex justify-center gap-6">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <QrCode className="h-6 w-6" />
                        </div>
                        <span className="text-xs">QRIS</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <span className="text-xs">E-Wallet</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <span className="text-xs">Bank Transfer</span>
                    </div>
                </div>

                <Button
                    onClick={handlePayment}
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-14 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            <CreditCard className="mr-2 h-5 w-5" />
                            Bayar DP Sekarang
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    Pembayaran akan diproses melalui Mayar Payment Gateway.
                    <br />
                    Transaksi aman dan terenkripsi.
                </p>
            </CardContent>
        </Card>
    );
}

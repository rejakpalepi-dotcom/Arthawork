/**
 * Contract Viewer Page
 * Public page for clients to view, sign, and pay contracts
 */

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useContractByToken, signContract } from "@/hooks/useContracts";
import { DigitalSignature } from "@/components/contract/DigitalSignature";
import { ContractStatusBadge } from "@/components/contract/StatusBadge";
import { PaymentButton } from "@/components/contract/PaymentButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    FileText,
    Building2,
    Calendar,
    DollarSign,
    CheckCircle,
    AlertTriangle,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import type { ContractScopeItem } from "@/hooks/useContracts";

export default function ContractViewer() {
    const { token } = useParams<{ token: string }>();
    const [searchParams] = useSearchParams();
    const { data: contract, isLoading, error, refetch } = useContractByToken(token);
    const [isSigning, setIsSigning] = useState(false);

    // Check for payment success
    useEffect(() => {
        const paymentStatus = searchParams.get("payment");
        if (paymentStatus === "success") {
            toast.success("Pembayaran berhasil! Proyek Anda akan segera dimulai.");
            refetch();
        }
    }, [searchParams, refetch]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const handleSign = async (signatureName: string) => {
        if (!contract) return;

        setIsSigning(true);
        try {
            await signContract(contract.id, signatureName);
            toast.success("Kontrak berhasil ditandatangani!");
            refetch();
        } catch (error) {
            console.error("Sign error:", error);
            toast.error("Gagal menandatangani kontrak. Silakan coba lagi.");
        } finally {
            setIsSigning(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-64" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-red-500/30 bg-red-500/10">
                    <CardContent className="flex flex-col items-center py-12 text-center">
                        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Kontrak Tidak Ditemukan</h2>
                        <p className="text-muted-foreground">
                            Link kontrak tidak valid atau sudah kadaluarsa.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isSigned = ["signed", "paid", "active", "completed"].includes(contract.status);
    const isPaid = ["paid", "active", "completed"].includes(contract.status);
    const scopeItems = contract.scope_of_work as ContractScopeItem[];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Sanskrit-inspired decorative background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto p-4 md:p-8 space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-primary/20 border border-amber-500/30">
                            <Sparkles className="h-8 w-8 text-amber-400" />
                        </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Kontrak Kerja Sama
                    </h1>
                    <p className="text-muted-foreground">
                        Silakan tinjau dan tandatangani kontrak di bawah ini
                    </p>
                </motion.div>

                {/* Contract Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl text-white">{contract.title}</CardTitle>
                                    {contract.description && (
                                        <p className="text-muted-foreground mt-1">{contract.description}</p>
                                    )}
                                </div>
                                <ContractStatusBadge status={contract.status} />
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Client & Studio Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/50">
                                    <Building2 className="h-5 w-5 text-amber-400" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Klien</p>
                                        <p className="font-medium text-white">
                                            {contract.clients?.name || "Klien"}
                                        </p>
                                        {contract.clients?.company && (
                                            <p className="text-sm text-muted-foreground">
                                                {contract.clients.company}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/50">
                                    <Calendar className="h-5 w-5 text-amber-400" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tanggal Pembayaran</p>
                                        <p className="font-medium text-white">
                                            {formatDate(contract.payment_due_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-700" />

                            {/* Scope of Work */}
                            {scopeItems && scopeItems.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2 text-white">
                                        <FileText className="h-4 w-4 text-amber-400" />
                                        Lingkup Pekerjaan
                                    </h3>
                                    <div className="space-y-2">
                                        {scopeItems.map((item, index) => (
                                            <div
                                                key={item.id || index}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30"
                                            >
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                <span className="text-sm text-slate-200">{item.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator className="bg-slate-700" />

                            {/* Pricing */}
                            <div className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2 text-white">
                                    <DollarSign className="h-4 w-4 text-amber-400" />
                                    Rincian Biaya
                                </h3>
                                <div className="p-4 rounded-lg bg-slate-700/50 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Nilai Kontrak</span>
                                        <span className="font-medium text-white">
                                            {formatCurrency(contract.total_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Down Payment ({contract.dp_percentage}%)
                                        </span>
                                        <span className="font-semibold text-amber-400">
                                            {formatCurrency(contract.dp_amount)}
                                        </span>
                                    </div>
                                    <Separator className="bg-slate-600" />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sisa Pembayaran</span>
                                        <span className="text-white">
                                            {formatCurrency(contract.total_amount - contract.dp_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Signature Section */}
                {!isSigned && contract.status === "sent" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <DigitalSignature
                            contractTitle={contract.title}
                            dpAmount={contract.dp_amount}
                            onSign={handleSign}
                            isLoading={isSigning}
                            isSigned={isSigned}
                        />
                    </motion.div>
                )}

                {/* Already Signed */}
                {isSigned && !isPaid && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-green-500/30 bg-green-500/10">
                            <CardContent className="py-6">
                                <div className="flex items-center justify-center gap-3 text-green-500 mb-4">
                                    <CheckCircle className="h-6 w-6" />
                                    <span className="font-semibold">Kontrak Ditandatangani</span>
                                </div>
                                <p className="text-sm text-center text-green-500/80">
                                    Ditandatangani oleh: <strong>{contract.client_signature_name}</strong>
                                    <br />
                                    Pada: {formatDate(contract.client_signature_date)}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Payment Section */}
                {isSigned && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <PaymentButton
                            contractToken={contract.contract_token}
                            dpAmount={contract.dp_amount}
                            isPaid={isPaid}
                        />
                    </motion.div>
                )}

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center py-6"
                >
                    <p className="text-xs text-muted-foreground">
                        Powered by <span className="text-amber-400 font-semibold">ArthaWork</span>
                        <br />
                        © {new Date().getFullYear()} | Semua hak dilindungi
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

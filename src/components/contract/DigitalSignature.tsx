/**
 * Digital Signature Component
 * Allows clients to digitally sign contracts
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileSignature, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface DigitalSignatureProps {
    contractTitle: string;
    dpAmount: number;
    onSign: (signatureName: string) => Promise<void>;
    isLoading?: boolean;
    isSigned?: boolean;
}

export function DigitalSignature({
    contractTitle,
    dpAmount,
    onSign,
    isLoading = false,
    isSigned = false,
}: DigitalSignatureProps) {
    const [signatureName, setSignatureName] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleSubmit = async () => {
        if (!signatureName.trim()) {
            setError("Nama lengkap wajib diisi");
            return;
        }
        if (signatureName.trim().length < 3) {
            setError("Nama minimal 3 karakter");
            return;
        }
        if (!agreed) {
            setError("Anda harus menyetujui syarat dan ketentuan");
            return;
        }

        setError(null);
        await onSign(signatureName.trim());
    };

    if (isSigned) {
        return (
            <Card className="border-green-500/50 bg-green-500/10">
                <CardContent className="flex items-center justify-center py-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex flex-col items-center gap-4 text-green-500"
                    >
                        <CheckCircle className="h-16 w-16" />
                        <div className="text-center">
                            <h3 className="font-semibold text-lg">Kontrak Telah Ditandatangani</h3>
                            <p className="text-sm text-muted-foreground">
                                Silakan lanjutkan ke pembayaran DP
                            </p>
                        </div>
                    </motion.div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/30">
                        <FileSignature className="h-8 w-8 text-amber-500" />
                    </div>
                </div>
                <CardTitle className="text-xl">Tanda Tangan Digital</CardTitle>
                <CardDescription>
                    Dengan menandatangani kontrak ini, Anda menyetujui untuk membayar DP sebesar{" "}
                    <span className="font-semibold text-amber-500">{formatCurrency(dpAmount)}</span>
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="signature-name">Nama Lengkap (sebagai tanda tangan)</Label>
                    <Input
                        id="signature-name"
                        placeholder="Ketik nama lengkap Anda"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        className="text-center text-lg font-semibold h-14 border-2 border-dashed border-amber-500/30 focus:border-amber-500"
                        disabled={isLoading}
                    />
                    {signatureName && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-3 bg-muted/50 rounded-md"
                        >
                            <p className="text-xs text-muted-foreground mb-1">Pratinjau tanda tangan:</p>
                            <p className="text-2xl font-serif italic text-amber-600 dark:text-amber-400">
                                {signatureName}
                            </p>
                        </motion.div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                        <Checkbox
                            id="terms"
                            checked={agreed}
                            onCheckedChange={(checked) => setAgreed(checked as boolean)}
                            disabled={isLoading}
                        />
                        <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                            Saya menyetujui <strong>{contractTitle}</strong> dan berkomitmen untuk membayar
                            Down Payment sesuai dengan yang tertera. Tanda tangan ini memiliki kekuatan hukum yang sama
                            dengan tanda tangan basah.
                        </label>
                    </div>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-500 text-center"
                    >
                        {error}
                    </motion.p>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !signatureName || !agreed}
                    className="w-full h-12 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            <FileSignature className="mr-2 h-5 w-5" />
                            Tandatangani Kontrak
                        </>
                    )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    Dengan menandatangani, Anda menyatakan bahwa semua informasi yang diberikan adalah benar.
                    Tanggal dan waktu tanda tangan: {new Date().toLocaleString("id-ID")}
                </p>
            </CardContent>
        </Card>
    );
}

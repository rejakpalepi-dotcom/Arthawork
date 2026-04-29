/**
 * 2FA Settings Component
 * Enable/disable TOTP-based 2FA with QR code
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ShieldCheck, ShieldOff, Smartphone, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    hasMFAEnabled,
    enrollMFA,
    verifyMFAEnrollment,
    unenrollMFA,
    getMFAFactors,
    type EnrollMFAResponse,
    type MFAFactor,
} from "@/lib/mfa";

export function TwoFactorSettings() {
    const [loading, setLoading] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const [factors, setFactors] = useState<MFAFactor[]>([]);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollData, setEnrollData] = useState<EnrollMFAResponse | null>(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    const loadMFAStatus = async () => {
        setLoading(true);
        const isEnabled = await hasMFAEnabled();
        const userFactors = await getMFAFactors();
        setEnabled(isEnabled);
        setFactors(userFactors);
        setLoading(false);
    };

    useEffect(() => {
        loadMFAStatus();
    }, []);

    const handleEnroll = async () => {
        setEnrolling(true);
        const data = await enrollMFA("Artha Authenticator");
        if (data) {
            setEnrollData(data);
            setShowDialog(true);
        } else {
            toast.error("Gagal mengaktifkan 2FA. Coba lagi.");
        }
        setEnrolling(false);
    };

    const handleVerify = async () => {
        if (!enrollData || verifyCode.length !== 6) return;

        setVerifying(true);
        const success = await verifyMFAEnrollment(enrollData.id, verifyCode);

        if (success) {
            toast.success("2FA berhasil diaktifkan", {
                description: "Akun kamu sekarang lebih aman.",
            });
            setShowDialog(false);
            setEnrollData(null);
            setVerifyCode("");
            await loadMFAStatus();
        } else {
            toast.error("Kode salah. Coba lagi.");
        }
        setVerifying(false);
    };

    const handleDisable = async (factorId: string) => {
        const confirmed = window.confirm("Yakin ingin menonaktifkan 2FA? Akun akan kurang aman.");
        if (!confirmed) return;

        const success = await unenrollMFA(factorId);
        if (success) {
            toast.success("2FA dinonaktifkan");
            await loadMFAStatus();
        } else {
            toast.error("Gagal menonaktifkan 2FA");
        }
    };

    const copySecret = () => {
        if (enrollData?.totp.secret) {
            navigator.clipboard.writeText(enrollData.totp.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Secret key disalin!");
        }
    };

    if (loading) {
        return (
            <Card data-ui-panel="twofactor-settings" className="overflow-hidden rounded-[30px] border-border/70 bg-card/96 shadow-[0_22px_54px_-28px_rgba(15,23,42,0.35)]">
                <CardHeader className="border-b border-border/70">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="p-6">
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card data-ui-panel="twofactor-settings" className="overflow-hidden rounded-[30px] border-border/70 bg-card/96 shadow-[0_22px_54px_-28px_rgba(15,23,42,0.35)]">
                <CardHeader className="border-b border-border/70 bg-gradient-to-r from-primary/[0.07] via-background to-background">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-2xl p-3 ${enabled ? "bg-green-500/10" : "bg-muted"}`}>
                                {enabled ? (
                                    <ShieldCheck className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Shield className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                            <div>
                                <CardTitle className="text-lg">Autentikasi Dua Faktor (2FA)</CardTitle>
                                <CardDescription>
                                    Lindungi akun dengan kode dari aplikasi authenticator
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant={enabled ? "default" : "secondary"} className="rounded-full px-3 py-1">
                            {enabled ? "Aktif" : "Nonaktif"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {enabled ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-[24px] border border-green-500/20 bg-green-500/5 p-4">
                                <ShieldCheck className="w-8 h-8 text-green-500" />
                                <div>
                                    <p className="font-medium text-green-700 dark:text-green-400">
                                        2FA sudah aktif!
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Akun kamu dilindungi dengan autentikasi dua faktor.
                                    </p>
                                </div>
                            </div>

                            {factors.filter(f => f.status === "verified").map((factor) => (
                                <div key={factor.id} className="flex items-center justify-between rounded-[24px] border border-border/70 bg-secondary/25 p-4">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{factor.friendly_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Ditambahkan {new Date(factor.created_at).toLocaleDateString("id-ID")}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDisable(factor.id)}
                                    >
                                        <ShieldOff className="w-4 h-4 mr-1" />
                                        Nonaktifkan
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-[24px] border border-amber-500/20 bg-amber-500/5 p-4">
                                <Shield className="w-8 h-8 text-amber-500" />
                                <div>
                                    <p className="font-medium text-amber-700 dark:text-amber-400">
                                        Tingkatkan keamanan akun
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Aktifkan 2FA untuk perlindungan ekstra dari akses tidak sah.
                                    </p>
                                </div>
                            </div>

                            <Button onClick={handleEnroll} disabled={enrolling} className="gap-2">
                                {enrolling ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-4 h-4" />
                                )}
                                Aktifkan 2FA
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md rounded-[30px] border-border/70 bg-background/95 shadow-2xl backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-primary" />
                            Siapkan Aplikasi Autentikator
                        </DialogTitle>
                        <DialogDescription>
                            Pindai QR code ini dengan Google Authenticator, Authy, atau aplikasi serupa.
                        </DialogDescription>
                    </DialogHeader>

                    {enrollData && (
                        <div className="space-y-6">
                            {/* QR Code */}
                            <div className="flex justify-center rounded-[24px] border border-border/70 bg-white p-4 shadow-sm">
                                <img
                                    src={enrollData.totp.qr_code}
                                    alt="QR code autentikator"
                                    className="w-48 h-48"
                                />
                            </div>

                            {/* Secret Key */}
                            <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">
                                    Atau masukkan kode ini secara manual:
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={enrollData.totp.secret}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button variant="outline" size="icon" onClick={copySecret}>
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Verification */}
                            <div className="space-y-2">
                                <Label>Masukkan 6 digit kode dari aplikasi:</Label>
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    placeholder="000000"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                                    className="text-center text-2xl font-mono tracking-widest"
                                />
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleVerify}
                                disabled={verifyCode.length !== 6 || verifying}
                            >
                                {verifying ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                )}
                                Verifikasi & Aktifkan
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, ShieldCheck, ShieldAlert, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { authAudit } from "@/lib/auditLog";

interface MFASetupProps {
    onComplete?: () => void;
}

export function MFASetup({ onComplete }: MFASetupProps) {
    const [loading, setLoading] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [factorId, setFactorId] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [showVerify, setShowVerify] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        checkMFAStatus();
    }, []);

    const checkMFAStatus = async () => {
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) throw error;

            const totpFactor = data.totp.find((f) => f.status === "verified");
            setMfaEnabled(!!totpFactor);
            setFactorId(totpFactor?.id || null);
        } catch (error) {
            console.error("Gagal memeriksa status MFA:", error);
        }
    };

    const handleEnableMFA = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: "totp",
                friendlyName: "Artha Authenticator",
            });

            if (error) throw error;

            setQrCode(data.totp.qr_code);
            setSecret(data.totp.secret);
            setFactorId(data.id);
            setShowVerify(true);

            toast.info("Pindai QR code dengan aplikasi autentikator kamu");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menyiapkan MFA";
            toast.error("Gagal menyiapkan MFA", { description: message });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyMFA = async () => {
        if (!factorId || verifyCode.length !== 6) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.mfa.challengeAndVerify({
                factorId,
                code: verifyCode,
            });

            if (error) throw error;

            await authAudit.mfaEnabled();
            setMfaEnabled(true);
            setShowVerify(false);
            setQrCode(null);
            setSecret(null);
            toast.success("Autentikasi dua langkah berhasil diaktifkan");
            onComplete?.();
        } catch (error: unknown) {
            toast.error("Kode tidak valid", { description: "Periksa kembali lalu coba lagi." });
        } finally {
            setLoading(false);
        }
    };

    const handleDisableMFA = async () => {
        if (!factorId) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.mfa.unenroll({
                factorId,
            });

            if (error) throw error;

            await authAudit.mfaDisabled();
            setMfaEnabled(false);
            setFactorId(null);
            toast.success("Autentikasi dua langkah dinonaktifkan");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Gagal menonaktifkan MFA";
            toast.error("Gagal menonaktifkan MFA", { description: message });
        } finally {
            setLoading(false);
        }
    };

    const copySecret = () => {
        if (secret) {
            navigator.clipboard.writeText(secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Card data-ui-panel="mfa-setup" className="overflow-hidden rounded-[30px] border-border/70 bg-card/96 shadow-[0_22px_54px_-28px_rgba(15,23,42,0.35)]">
            <CardHeader className="border-b border-border/70 bg-gradient-to-r from-primary/[0.07] via-background to-background">
                <div className="flex items-center gap-3">
                    {mfaEnabled ? (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/12 text-success">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                            <Shield className="w-6 h-6" />
                        </div>
                    )}
                    <div>
                        <CardTitle className="text-lg">AUTENTIKASI DUA LANGKAH</CardTitle>
                        <CardDescription>
                            Tambahkan lapisan keamanan ekstra untuk akunmu
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
                {showVerify && qrCode ? (
                    <div className="space-y-4">
                        <div className="rounded-[26px] border border-border/70 bg-secondary/35 p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                        Langkah 1
                                    </p>
                                    <p className="text-sm font-medium text-foreground">
                                        Pindai kode QR dengan aplikasi autentikator
                                    </p>
                                </div>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                                    Persiapan
                                </span>
                            </div>
                            <div className="flex justify-center">
                            <img
                                src={qrCode}
                                alt="QR code untuk aplikasi autentikator"
                                className="w-48 h-48 rounded-lg border border-border"
                            />
                        </div>
                        </div>

                        {secret && (
                            <div className="rounded-2xl border border-border/70 bg-secondary/35 p-4">
                                <p className="mb-1 text-xs font-medium text-muted-foreground">
                                    Atau masukkan kode ini secara manual:
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-sm font-mono break-all">{secret}</code>
                                    <Button variant="ghost" size="icon" onClick={copySecret}>
                                        {copied ? (
                                            <Check className="w-4 h-4 text-success" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 rounded-2xl border border-border/70 bg-background p-4">
                            <Label htmlFor="verifyCode">Masukkan 6 digit kode dari aplikasi</Label>
                            <Input
                                id="verifyCode"
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="000000"
                                className="text-center text-2xl tracking-widest font-mono"
                                maxLength={6}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowVerify(false);
                                    setQrCode(null);
                                    setSecret(null);
                                }}
                                disabled={loading}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleVerifyMFA}
                                disabled={loading || verifyCode.length !== 6}
                                className="flex-1"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Verifikasi & Aktifkan
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between rounded-[24px] border border-border/70 bg-secondary/30 px-4 py-4">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={mfaEnabled}
                                onCheckedChange={(checked) => {
                                    if (checked) handleEnableMFA();
                                    else handleDisableMFA();
                                }}
                                disabled={loading}
                            />
                            <span className={mfaEnabled ? "text-success" : "text-muted-foreground"}>
                                {mfaEnabled ? "Aktif" : "Nonaktif"}
                            </span>
                        </div>

                        {mfaEnabled && (
                            <div className="flex items-center gap-2 text-sm text-success">
                                <ShieldCheck className="w-4 h-4" />
                                Akunmu sudah terlindungi
                            </div>
                        )}
                    </div>
                )}

                {!mfaEnabled && !showVerify && (
                    <div className="flex items-start gap-2 rounded-2xl border border-warning/20 bg-warning/10 p-4 text-sm">
                        <ShieldAlert className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        <p className="text-muted-foreground">
                            Kami sarankan mengaktifkan 2FA agar akunmu lebih aman dari akses yang tidak sah.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

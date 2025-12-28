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
            console.error("Failed to check MFA status:", error);
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

            toast.info("Scan the QR code with your authenticator app");
        } catch (error: any) {
            toast.error("Failed to set up MFA", { description: error.message });
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
            toast.success("Two-Factor Authentication enabled!");
            onComplete?.();
        } catch (error: any) {
            toast.error("Invalid code", { description: "Please check and try again." });
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
            toast.success("Two-Factor Authentication disabled");
        } catch (error: any) {
            toast.error("Failed to disable MFA", { description: error.message });
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
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    {mfaEnabled ? (
                        <ShieldCheck className="w-6 h-6 text-success" />
                    ) : (
                        <Shield className="w-6 h-6 text-muted-foreground" />
                    )}
                    <div>
                        <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                        <CardDescription>
                            Add an extra layer of security to your account
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {showVerify && qrCode ? (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <img
                                src={qrCode}
                                alt="QR Code for authenticator app"
                                className="w-48 h-48 rounded-lg border border-border"
                            />
                        </div>

                        {secret && (
                            <div className="p-3 bg-secondary rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">
                                    Or enter this code manually:
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

                        <div className="space-y-2">
                            <Label htmlFor="verifyCode">Enter 6-digit code from app</Label>
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
                                Cancel
                            </Button>
                            <Button
                                onClick={handleVerifyMFA}
                                disabled={loading || verifyCode.length !== 6}
                                className="flex-1"
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Verify & Enable
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
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
                                {mfaEnabled ? "Enabled" : "Disabled"}
                            </span>
                        </div>

                        {mfaEnabled && (
                            <div className="flex items-center gap-2 text-sm text-success">
                                <ShieldCheck className="w-4 h-4" />
                                Your account is protected
                            </div>
                        )}
                    </div>
                )}

                {!mfaEnabled && !showVerify && (
                    <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg text-sm">
                        <ShieldAlert className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        <p className="text-muted-foreground">
                            We recommend enabling 2FA to protect your account from unauthorized access.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

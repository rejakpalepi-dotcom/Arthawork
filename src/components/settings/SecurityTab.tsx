import { MFASetup } from "@/components/settings/MFASetup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Clock, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { exportAuditLogs, getLocalAuditLogs, clearLocalAuditLogs } from "@/lib/auditLog";

export function SecurityTab() {
    const handleExportLogs = async () => {
        const logs = await exportAuditLogs();
        const blob = new Blob([logs], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `artha-audit-logs-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Log audit berhasil diekspor");
    };

    const handleClearLogs = () => {
        clearLocalAuditLogs();
        toast.success("Log audit berhasil dibersihkan");
    };

    const logCount = getLocalAuditLogs().length;

    return (
        <div className="lg:col-span-3 space-y-6" data-ui-panel="security-tab">
            {/* MFA Setup */}
            <MFASetup />

            {/* Session Settings */}
            <Card className="rounded-[28px] border-border/70 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-lg">Keamanan Sesi</CardTitle>
                            <CardDescription>
                                Atur batas waktu sesi dan kontrol keamanan dasar tanpa layout terasa datar.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Logout otomatis saat tidak aktif</Label>
                            <p className="text-sm text-muted-foreground">
                                Keluar otomatis setelah 30 menit tanpa aktivitas
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card className="rounded-[28px] border-border/70 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-lg">Jejak Audit</CardTitle>
                            <CardDescription>
                                Tinjau dan ekspor histori aktivitas keamanan dengan tampilan yang lebih tenang.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {logCount} aktivitas tercatat secara lokal
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportLogs}>
                            <Download className="w-4 h-4 mr-2" />
                            Ekspor Log
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleClearLogs}>
                            Bersihkan Log
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

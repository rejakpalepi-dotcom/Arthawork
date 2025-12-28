import { MFASetup } from "@/components/settings/MFASetup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Clock, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { exportAuditLogs, getAuditLogs, clearAuditLogs } from "@/lib/auditLog";

export function SecurityTab() {
    const handleExportLogs = () => {
        const logs = exportAuditLogs();
        const blob = new Blob([logs], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `artha-audit-logs-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Audit logs exported");
    };

    const handleClearLogs = () => {
        clearAuditLogs();
        toast.success("Audit logs cleared");
    };

    const logCount = getAuditLogs().length;

    return (
        <div className="lg:col-span-3 space-y-6">
            {/* MFA Setup */}
            <MFASetup />

            {/* Session Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-lg">Session Security</CardTitle>
                            <CardDescription>
                                Manage session timeout and security settings
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto-logout on inactivity</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically log out after 30 minutes of inactivity
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-lg">Audit Logs</CardTitle>
                            <CardDescription>
                                View and export security activity logs
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {logCount} events logged locally
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportLogs}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Logs
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleClearLogs}>
                            Clear Logs
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

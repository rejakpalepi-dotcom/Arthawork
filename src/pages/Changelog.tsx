import { ArrowLeft, Sparkles, Bug, Wrench, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChangelogItem {
    version: string;
    date: string;
    type: "feature" | "improvement" | "fix";
    title: string;
    description: string;
}

const changelog: ChangelogItem[] = [
    {
        version: "1.3.0",
        date: "29 Desember 2024",
        type: "feature",
        title: "Subscription & Payment Integration",
        description: "Tambahan paket Pro dan Business dengan pembayaran via QRIS, Virtual Account, dan E-Wallet (Midtrans)."
    },
    {
        version: "1.3.0",
        date: "29 Desember 2024",
        type: "feature",
        title: "Feature Gating",
        description: "Fitur premium sekarang terbatas untuk subscriber Pro/Business dengan upgrade modal."
    },
    {
        version: "1.2.0",
        date: "28 Desember 2024",
        type: "feature",
        title: "Advanced Security Features",
        description: "Rate limiting, input validation (Zod), CSP headers, audit logging, session timeout, dan 2FA support."
    },
    {
        version: "1.2.0",
        date: "28 Desember 2024",
        type: "improvement",
        title: "Onboarding Tour Update",
        description: "Tour guide yang lebih informatif dengan info subscription dan payment methods."
    },
    {
        version: "1.1.0",
        date: "27 Desember 2024",
        type: "feature",
        title: "Global Search (Cmd+K)",
        description: "Cari clients, invoices, dan proposals dengan cepat menggunakan keyboard shortcut."
    },
    {
        version: "1.1.0",
        date: "27 Desember 2024",
        type: "feature",
        title: "Notification Center",
        description: "Real-time notifications untuk invoice paid, proposal accepted, dan deadline approaching."
    },
    {
        version: "1.1.0",
        date: "27 Desember 2024",
        type: "improvement",
        title: "Custom Hooks Refactor",
        description: "Refactored data fetching ke custom hooks (useClients, useInvoices, useProposals) untuk performa lebih baik."
    },
    {
        version: "1.0.0",
        date: "20 Desember 2024",
        type: "feature",
        title: "Initial Release",
        description: "Launch pertama Artha dengan fitur clients, proposals, invoices, dan PDF export."
    },
];

const typeConfig = {
    feature: { label: "Fitur Baru", icon: Sparkles, color: "text-success bg-success/10" },
    improvement: { label: "Peningkatan", icon: Wrench, color: "text-primary bg-primary/10" },
    fix: { label: "Perbaikan", icon: Bug, color: "text-warning bg-warning/10" },
};

export default function Changelog() {
    // Group by version
    const groupedChangelog = changelog.reduce((acc, item) => {
        if (!acc[item.version]) {
            acc[item.version] = { date: item.date, items: [] };
        }
        acc[item.version].items.push(item);
        return acc;
    }, {} as Record<string, { date: string; items: ChangelogItem[] }>);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Hero */}
            <div className="py-12 text-center">
                <h1 className="text-4xl font-bold text-foreground mb-4">Changelog</h1>
                <p className="text-muted-foreground">
                    Lihat semua update dan fitur baru di Artha
                </p>
            </div>

            {/* Changelog List */}
            <div className="max-w-3xl mx-auto px-4 pb-12">
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

                    <div className="space-y-8">
                        {Object.entries(groupedChangelog).map(([version, { date, items }]) => (
                            <div key={version} className="relative">
                                {/* Version badge */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center z-10">
                                        <span className="text-primary-foreground font-bold text-sm">v{version}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">Version {version}</h2>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {date}
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="ml-16 space-y-3">
                                    {items.map((item, i) => {
                                        const config = typeConfig[item.type];
                                        const Icon = config.icon;
                                        return (
                                            <div
                                                key={i}
                                                className="p-4 rounded-xl bg-card border border-border"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={cn("p-2 rounded-lg shrink-0", config.color)}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                                                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", config.color)}>
                                                                {config.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

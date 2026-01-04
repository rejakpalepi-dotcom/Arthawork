/**
 * Contract Status Badge Component
 */

import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Send,
    FileSignature,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";

interface ContractStatusBadgeProps {
    status: string;
    size?: "sm" | "md" | "lg";
}

const statusConfig: Record<string, {
    label: string;
    icon: typeof FileText;
    className: string;
}> = {
    draft: {
        label: "Draft",
        icon: FileText,
        className: "bg-muted text-muted-foreground border-muted-foreground/30",
    },
    sent: {
        label: "Dikirim",
        icon: Send,
        className: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    },
    signed: {
        label: "Ditandatangani",
        icon: FileSignature,
        className: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    },
    paid: {
        label: "DP Dibayar",
        icon: CreditCard,
        className: "bg-green-500/10 text-green-500 border-green-500/30",
    },
    active: {
        label: "Aktif",
        icon: CheckCircle,
        className: "bg-green-500/10 text-green-500 border-green-500/30",
    },
    completed: {
        label: "Selesai",
        icon: CheckCircle,
        className: "bg-primary/10 text-primary border-primary/30",
    },
    cancelled: {
        label: "Dibatalkan",
        icon: XCircle,
        className: "bg-red-500/10 text-red-500 border-red-500/30",
    },
    pending: {
        label: "Menunggu",
        icon: Clock,
        className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    },
};

export function ContractStatusBadge({ status, size = "md" }: ContractStatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1",
        lg: "text-base px-3 py-1.5",
    };

    const iconSizes = {
        sm: "h-3 w-3",
        md: "h-3.5 w-3.5",
        lg: "h-4 w-4",
    };

    return (
        <Badge
            variant="outline"
            className={`${config.className} ${sizeClasses[size]} flex items-center gap-1.5`}
        >
            <Icon className={iconSizes[size]} />
            {config.label}
        </Badge>
    );
}

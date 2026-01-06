/**
 * Contracts Management Page
 * List and manage contracts with DP tracking
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useContracts } from "@/hooks/useContracts";
import { ContractStatusBadge } from "@/components/contract/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FileSignature,
    Plus,
    Search,
    Copy,
    ExternalLink,
    MoreHorizontal,
    Inbox,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function Contracts() {
    const navigate = useNavigate();
    const { contracts, isLoading } = useContracts();
    const [searchQuery, setSearchQuery] = useState("");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const copyContractLink = (token: string) => {
        const link = `${window.location.origin}/contract/${token}`;
        navigator.clipboard.writeText(link);
        toast.success("Link kontrak berhasil disalin!");
    };

    const handleNewContract = () => {
        navigate("/proposals/new");
        toast.info("Buat proposal terlebih dahulu, lalu convert ke kontrak");
    };

    const filteredContracts = contracts?.filter(
        (contract) =>
            contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8">
                {/* Breadcrumb & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span className="text-foreground">Contracts</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-64 bg-secondary border-border min-h-[44px]"
                        />
                    </div>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Contracts</h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Kelola kontrak dengan sistem DP Lock anti-ghosting.
                        </p>
                    </div>
                    <Button className="gap-2 w-full sm:w-auto min-h-[44px]" onClick={handleNewContract}>
                        <Plus className="w-4 h-4" />
                        New Contract
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FileSignature className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">Total Kontrak</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{contracts?.length || 0}</p>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <FileSignature className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">Menunggu Tanda Tangan</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-500">
                            {contracts?.filter((c) => c.status === "sent").length || 0}
                        </p>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <FileSignature className="w-5 h-5 text-green-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">DP Diterima</span>
                        </div>
                        <p className="text-2xl font-bold text-green-500">
                            {contracts?.filter((c) => c.payment_status === "paid").length || 0}
                        </p>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FileSignature className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">Total Nilai</span>
                        </div>
                        <p className="text-xl font-bold text-foreground">
                            {formatCurrency(
                                contracts?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0
                            )}
                        </p>
                    </div>
                </div>

                {/* Contracts List */}
                <>
                    {isLoading ? (
                        <div className="glass-card rounded-2xl p-6 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : filteredContracts && filteredContracts.length > 0 ? (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-3">
                                {filteredContracts.map((contract, index) => (
                                    <div
                                        key={contract.id}
                                        className="glass-card rounded-xl p-4 card-hover animate-fade-in"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-foreground truncate">{contract.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-0.5">{contract.clients?.name || "-"}</p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] -mr-2 -mt-1">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => copyContractLink(contract.contract_token)}
                                                    >
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Salin Link
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            window.open(`/contract/${contract.contract_token}`, "_blank")
                                                        }
                                                    >
                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                        Lihat Kontrak
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono font-bold text-primary">
                                                {formatCurrency(contract.total_amount)}
                                            </span>
                                            <Badge
                                                variant={contract.payment_status === "paid" ? "default" : "outline"}
                                            >
                                                {contract.payment_status === "paid"
                                                    ? "Lunas"
                                                    : `DP ${contract.dp_percentage}%`}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <ContractStatusBadge status={contract.status} size="sm" />
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(contract.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block glass-card rounded-2xl">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kontrak</TableHead>
                                            <TableHead>Klien</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>DP</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead className="w-[60px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredContracts.map((contract) => (
                                            <TableRow key={contract.id}>
                                                <TableCell className="font-medium">{contract.title}</TableCell>
                                                <TableCell>{contract.clients?.name || "-"}</TableCell>
                                                <TableCell>{formatCurrency(contract.total_amount)}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={contract.payment_status === "paid" ? "default" : "outline"}
                                                    >
                                                        {contract.payment_status === "paid"
                                                            ? "Lunas"
                                                            : `${contract.dp_percentage}%`}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <ContractStatusBadge status={contract.status} size="sm" />
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(contract.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => copyContractLink(contract.contract_token)}
                                                            >
                                                                <Copy className="h-4 w-4 mr-2" />
                                                                Salin Link
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    window.open(`/contract/${contract.contract_token}`, "_blank")
                                                                }
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                                Lihat Kontrak
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    ) : (
                        <div className="glass-card rounded-2xl">
                            <EmptyState
                                icon={Inbox}
                                title="No contracts yet"
                                description="Create your first contract to start receiving DP from clients."
                                actionLabel="Create Contract"
                                onAction={handleNewContract}
                            />
                        </div>
                    )}
                </>
            </div>
        </DashboardLayout>
    );
}

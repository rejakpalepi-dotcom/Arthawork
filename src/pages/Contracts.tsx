/**
 * Contracts Management Page
 * List and manage contracts with DP tracking
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useContracts } from "@/hooks/useContracts";
import { ContractStatusBadge } from "@/components/contract/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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

    const filteredContracts = contracts?.filter(
        (contract) =>
            contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contract.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FileSignature className="h-6 w-6 text-primary" />
                            Kontrak
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Kelola kontrak dengan sistem DP Lock anti-ghosting
                        </p>
                    </div>

                    <Button className="gap-2" onClick={() => navigate("/contracts/new")}>
                        <Plus className="h-4 w-4" />
                        Kontrak Baru
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Kontrak</p>
                            <p className="text-2xl font-bold">{contracts?.length || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Menunggu Tanda Tangan</p>
                            <p className="text-2xl font-bold text-amber-500">
                                {contracts?.filter((c) => c.status === "sent").length || 0}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">DP Diterima</p>
                            <p className="text-2xl font-bold text-green-500">
                                {contracts?.filter((c) => c.payment_status === "paid").length || 0}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Nilai</p>
                            <p className="text-xl font-bold">
                                {formatCurrency(
                                    contracts?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari kontrak..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : filteredContracts && filteredContracts.length > 0 ? (
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
                                            <TableCell className="font-medium">
                                                {contract.title}
                                            </TableCell>
                                            <TableCell>{contract.clients?.name || "-"}</TableCell>
                                            <TableCell>{formatCurrency(contract.total_amount)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        contract.payment_status === "paid"
                                                            ? "default"
                                                            : "outline"
                                                    }
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
                                                            onClick={() =>
                                                                copyContractLink(contract.contract_token)
                                                            }
                                                        >
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Salin Link
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                window.open(
                                                                    `/contract/${contract.contract_token}`,
                                                                    "_blank"
                                                                )
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
                        ) : (
                            <div className="text-center py-12">
                                <FileSignature className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="font-semibold mb-1">Belum ada kontrak</h3>
                                <p className="text-muted-foreground mb-4">
                                    Buat kontrak pertama untuk mulai menerima DP dari klien
                                </p>
                                <Button onClick={() => navigate("/contracts/new")}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Buat Kontrak
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

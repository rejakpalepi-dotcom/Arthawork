/**
 * Tax Summary Dashboard
 * Annual tax recap for SPT preparation
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Receipt,
    Calculator,
    TrendingUp,
    FileText,
    Download,
    Calendar,
    PiggyBank,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { formatIDR } from "@/lib/taxCalculation";

interface TaxSummaryData {
    tax_year: number;
    tax_month: number | null;
    total_gross_income: number;
    total_pph21_paid: number;
    total_pph23_withheld: number;
    total_net_income: number;
    invoice_count: number;
}

export default function TaxSummary() {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());

    // Fetch yearly summary
    const { data: yearlySummary, isLoading: yearlyLoading } = useQuery({
        queryKey: ["tax-summary", selectedYear],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("tax_summary")
                .select("*")
                .eq("user_id", user.user.id)
                .eq("tax_year", parseInt(selectedYear))
                .is("tax_month", null)
                .single();

            if (error && error.code !== "PGRST116") throw error;
            return data as TaxSummaryData | null;
        },
    });

    // Fetch monthly breakdown
    const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
        queryKey: ["tax-summary-monthly", selectedYear],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("tax_summary")
                .select("*")
                .eq("user_id", user.user.id)
                .eq("tax_year", parseInt(selectedYear))
                .not("tax_month", "is", null)
                .order("tax_month", { ascending: true });

            if (error) throw error;
            return data as TaxSummaryData[];
        },
    });

    // Fetch invoice stats for the year
    const { data: invoiceStats } = useQuery({
        queryKey: ["invoice-stats", selectedYear],
        queryFn: async () => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");

            const startDate = `${selectedYear}-01-01`;
            const endDate = `${selectedYear}-12-31`;

            const { data, error } = await supabase
                .from("invoices")
                .select("id, total, tax_type, pph_amount, status")
                .eq("user_id", user.user.id)
                .gte("issue_date", startDate)
                .lte("issue_date", endDate);

            if (error) throw error;

            const paid = data?.filter(i => i.status === "paid") || [];
            const withTax = data?.filter(i => i.tax_type && i.tax_type !== "none") || [];

            return {
                totalInvoices: data?.length || 0,
                paidInvoices: paid.length,
                invoicesWithTax: withTax.length,
                totalRevenue: paid.reduce((sum, i) => sum + (i.total || 0), 0),
            };
        },
    });

    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const totalTax = (yearlySummary?.total_pph21_paid || 0) + (yearlySummary?.total_pph23_withheld || 0);

    return (
        <DashboardLayout>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Receipt className="h-6 w-6 text-primary" />
                            Rekapitulasi Pajak
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Ringkasan pajak untuk persiapan SPT Tahunan
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[140px]">
                                <Calendar className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        Tahun {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Penghasilan Bruto</p>
                                    {yearlyLoading ? (
                                        <Skeleton className="h-8 w-32 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold">
                                            {formatIDR(yearlySummary?.total_gross_income || 0)}
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 rounded-full bg-primary/10">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                                <ArrowUpRight className="h-4 w-4" />
                                <span>{invoiceStats?.totalInvoices || 0} invoice</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">PPh 21 Dibayar</p>
                                    {yearlyLoading ? (
                                        <Skeleton className="h-8 w-32 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold text-amber-500">
                                            {formatIDR(yearlySummary?.total_pph21_paid || 0)}
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 rounded-full bg-amber-500/10">
                                    <Calculator className="h-5 w-5 text-amber-500" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Pajak penghasilan freelancer
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">PPh 23 Dipotong</p>
                                    {yearlyLoading ? (
                                        <Skeleton className="h-8 w-32 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold text-blue-500">
                                            {formatIDR(yearlySummary?.total_pph23_withheld || 0)}
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 rounded-full bg-blue-500/10">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Dipotong oleh klien
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Penghasilan Netto</p>
                                    {yearlyLoading ? (
                                        <Skeleton className="h-8 w-32 mt-1" />
                                    ) : (
                                        <p className="text-2xl font-bold text-green-500">
                                            {formatIDR(yearlySummary?.total_net_income || 0)}
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 rounded-full bg-green-500/10">
                                    <PiggyBank className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 mt-2 text-sm text-red-500">
                                <ArrowDownRight className="h-4 w-4" />
                                <span>-{formatIDR(totalTax)} pajak</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tax Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tax Composition */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Komposisi Pajak</CardTitle>
                            <CardDescription>Breakdown pajak tahun {selectedYear}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>PPh 21 (Freelancer)</span>
                                    <span className="font-medium">{formatIDR(yearlySummary?.total_pph21_paid || 0)}</span>
                                </div>
                                <Progress
                                    value={totalTax > 0 ? ((yearlySummary?.total_pph21_paid || 0) / totalTax) * 100 : 0}
                                    className="h-2 bg-amber-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>PPh 23 (Dipotong Klien)</span>
                                    <span className="font-medium">{formatIDR(yearlySummary?.total_pph23_withheld || 0)}</span>
                                </div>
                                <Progress
                                    value={totalTax > 0 ? ((yearlySummary?.total_pph23_withheld || 0) / totalTax) * 100 : 0}
                                    className="h-2 bg-blue-100"
                                />
                            </div>

                            <Separator />

                            <div className="flex justify-between font-semibold">
                                <span>Total Pajak</span>
                                <span className="text-primary">{formatIDR(totalTax)}</span>
                            </div>

                            <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                                <p className="font-medium mb-1">💡 Tips SPT</p>
                                <p>
                                    PPh 23 yang dipotong klien dapat dikreditkan saat pengisian SPT Tahunan.
                                    Pastikan Anda menyimpan bukti potong dari setiap klien.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Breakdown Bulanan</CardTitle>
                            <CardDescription>Rincian per bulan tahun {selectedYear}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {monthlyLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : monthlyData && monthlyData.length > 0 ? (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {monthlyData.map((month) => (
                                        <div
                                            key={month.tax_month}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="w-20 justify-center">
                                                    {months[(month.tax_month || 1) - 1]?.slice(0, 3)}
                                                </Badge>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {formatIDR(month.total_gross_income)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {month.invoice_count} invoice
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-red-500">
                                                    -{formatIDR(month.total_pph21_paid + month.total_pph23_withheld)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>Belum ada data pajak untuk tahun {selectedYear}</p>
                                    <p className="text-sm mt-1">
                                        Data akan muncul setelah Anda membuat invoice dengan pengaturan pajak
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Info Box */}
                <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-amber-500/20">
                                <Calculator className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Tentang Rekapitulasi Pajak</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• <strong>PPh 21</strong>: Pajak atas penghasilan sebagai freelancer/pekerja bebas. DPP = 50% dari penghasilan bruto.</li>
                                    <li>• <strong>PPh 23</strong>: Pajak yang dipotong oleh klien (pemberi kerja) atas jasa yang Anda berikan. Tarif 2% (dengan NPWP) atau 4% (tanpa NPWP).</li>
                                    <li>• Simpan semua bukti potong PPh 23 untuk dikreditkan saat pengisian SPT Tahunan.</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

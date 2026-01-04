/**
 * Tax Toggle Component
 * Include/Exclude tax switch for invoices
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Receipt, Info } from "lucide-react";
import { formatNPWP, validateNPWP, calculateInvoiceTax, formatIDR } from "@/lib/taxCalculation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaxToggleProps {
    taxType: 'pph21' | 'pph23' | 'none';
    taxMode: 'include' | 'exclude';
    hasNPWP: boolean;
    npwpNumber: string;
    onTaxTypeChange: (type: 'pph21' | 'pph23' | 'none') => void;
    onTaxModeChange: (mode: 'include' | 'exclude') => void;
    onNPWPChange: (hasNPWP: boolean, number: string) => void;
}

export function TaxToggle({
    taxType,
    taxMode,
    hasNPWP,
    npwpNumber,
    onTaxTypeChange,
    onTaxModeChange,
    onNPWPChange,
}: TaxToggleProps) {
    const handleNPWPNumberChange = (value: string) => {
        // Only allow digits and format
        const digits = value.replace(/\D/g, '').slice(0, 15);
        const formatted = formatNPWP(digits);
        const isValid = validateNPWP(digits);
        onNPWPChange(isValid && digits.length === 15, formatted);
    };

    return (
        <Card className="border-muted bg-muted/30">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-primary" />
                        <Label className="font-semibold">Pengaturan Pajak</Label>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {taxType === 'none' ? 'Tanpa Pajak' : taxType.toUpperCase()}
                    </Badge>
                </div>

                {/* Tax Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Jenis Pajak</Label>
                        <Select value={taxType} onValueChange={(v) => onTaxTypeChange(v as typeof taxType)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis pajak" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tanpa Pajak</SelectItem>
                                <SelectItem value="pph23">PPh 23 (Jasa)</SelectItem>
                                <SelectItem value="pph21">PPh 21 (Freelancer)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {taxType !== 'none' && (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Mode Kalkulasi</Label>
                            <Select value={taxMode} onValueChange={(v) => onTaxModeChange(v as typeof taxMode)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="exclude">+ Pajak (ditambahkan)</SelectItem>
                                    <SelectItem value="include">- Pajak (sudah termasuk)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* NPWP Section */}
                {taxType !== 'none' && (
                    <div className="space-y-3 pt-2 border-t border-muted-foreground/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="npwp-toggle" className="text-sm">Klien Punya NPWP</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[250px]">
                                            <p className="text-xs">
                                                {taxType === 'pph23'
                                                    ? "PPh 23: 2% dengan NPWP, 4% tanpa NPWP"
                                                    : "PPh 21: +20% surcharge jika tidak punya NPWP"
                                                }
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Switch
                                id="npwp-toggle"
                                checked={hasNPWP}
                                onCheckedChange={(checked) => onNPWPChange(checked, npwpNumber)}
                            />
                        </div>

                        {hasNPWP && (
                            <div className="space-y-2">
                                <Label htmlFor="npwp-number" className="text-xs text-muted-foreground">
                                    Nomor NPWP
                                </Label>
                                <Input
                                    id="npwp-number"
                                    placeholder="XX.XXX.XXX.X-XXX.XXX"
                                    value={npwpNumber}
                                    onChange={(e) => handleNPWPNumberChange(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Tax Calculator Preview
 * Shows tax calculation breakdown
 */

interface TaxCalculatorProps {
    amount: number;
    taxType: 'pph21' | 'pph23' | 'none';
    taxMode: 'include' | 'exclude';
    hasNPWP: boolean;
}

export function TaxCalculator({ amount, taxType, taxMode, hasNPWP }: TaxCalculatorProps) {
    if (taxType === 'none' || amount <= 0) return null;

    const result = calculateInvoiceTax(amount, taxType, taxMode, hasNPWP);

    return (
        <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                    <Calculator className="h-4 w-4" />
                    <span className="font-semibold text-sm">Kalkulasi Pajak</span>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">DPP</span>
                        <span>{formatIDR(result.dpp)}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {taxType.toUpperCase()} ({result.taxRate.toFixed(1)}%)
                            {!hasNPWP && <span className="text-amber-500 ml-1">(Non-NPWP)</span>}
                        </span>
                        <span className="text-red-500">-{formatIDR(result.taxAmount)}</span>
                    </div>

                    <div className="border-t border-primary/20 pt-2 flex justify-between font-semibold">
                        <span>
                            {taxMode === 'include' ? 'Yang Diterima' : 'Total Tagihan'}
                        </span>
                        <span className="text-primary">
                            {formatIDR(taxMode === 'include' ? result.netAmount : result.grossAmount)}
                        </span>
                    </div>
                </div>

                {taxMode === 'exclude' && (
                    <p className="text-xs text-muted-foreground">
                        * Klien membayar pajak di atas nilai invoice
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * NPWP Input Component
 * Standalone NPWP input with formatting
 */

interface NPWPInputProps {
    value: string;
    onChange: (value: string, isValid: boolean) => void;
    label?: string;
    className?: string;
}

export function NPWPInput({ value, onChange, label = "Nomor NPWP", className }: NPWPInputProps) {
    const handleChange = (inputValue: string) => {
        const digits = inputValue.replace(/\D/g, '').slice(0, 15);
        const formatted = digits.length > 0 ? formatNPWP(digits) : '';
        const isValid = validateNPWP(digits);
        onChange(formatted, isValid);
    };

    const isValid = validateNPWP(value);

    return (
        <div className={`space-y-2 ${className}`}>
            <Label htmlFor="npwp-input" className="text-sm">{label}</Label>
            <Input
                id="npwp-input"
                placeholder="XX.XXX.XXX.X-XXX.XXX"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                className={`font-mono ${isValid ? 'border-green-500' : ''}`}
            />
            {value && !isValid && (
                <p className="text-xs text-amber-500">NPWP harus 15 digit</p>
            )}
        </div>
    );
}

import { useState } from "react";
import { Check, QrCode, Building2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS, PaymentMethod, PaymentCategory, getPaymentMethodsByCategory } from "@/lib/midtrans";

interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethod | null;
    onSelect: (method: PaymentMethod) => void;
    disabled?: boolean;
}

const categories: { key: PaymentCategory; name: string; icon: typeof QrCode; description: string }[] = [
    { key: "qris", name: "QRIS", icon: QrCode, description: "Scan QR code dengan app banking" },
    { key: "virtual_account", name: "Virtual Account", icon: Building2, description: "Transfer dari ATM atau m-banking" },
    { key: "ewallet", name: "E-Wallet", icon: Wallet, description: "Bayar dengan dompet digital" },
];

export function PaymentMethodSelector({ selectedMethod, onSelect, disabled }: PaymentMethodSelectorProps) {
    const [activeCategory, setActiveCategory] = useState<PaymentCategory>("qris");

    return (
        <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(({ key, name, icon: Icon }) => (
                    <button
                        key={key}
                        type="button"
                        disabled={disabled}
                        onClick={() => setActiveCategory(key)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                            activeCategory === key
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        {name}
                    </button>
                ))}
            </div>

            {/* Category Description */}
            <p className="text-sm text-muted-foreground">
                {categories.find((c) => c.key === activeCategory)?.description}
            </p>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {getPaymentMethodsByCategory(activeCategory).map((method) => (
                    <button
                        key={method.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(method.id)}
                        className={cn(
                            "relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                            selectedMethod === method.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium text-foreground">{method.name}</span>
                        {selectedMethod === method.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

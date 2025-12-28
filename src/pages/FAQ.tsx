import { ArrowLeft, Search, ChevronDown, ChevronUp, MessageCircle, Mail, FileText, CreditCard, Users, Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqData: FAQItem[] = [
    // Getting Started
    {
        category: "Memulai",
        question: "Bagaimana cara membuat akun Artha?",
        answer: "Klik tombol 'Sign Up' di halaman login, masukkan email dan password, lalu verifikasi email Anda. Setelah itu, Anda bisa langsung mulai menggunakan Artha dengan paket Free."
    },
    {
        category: "Memulai",
        question: "Apa bedanya paket Free, Pro, dan Business?",
        answer: "Paket Free: 3 invoice dan 5 proposal per bulan. Paket Pro (Rp 50k/bulan): Unlimited invoice, proposal, dan fitur premium seperti template dan payment reminders. Paket Business (Rp 199k/bulan): Semua fitur Pro + 5 team members, API access, dan white-label."
    },
    {
        category: "Memulai",
        question: "Bagaimana cara upgrade ke Pro atau Business?",
        answer: "Buka Settings > Subscription, pilih paket yang diinginkan, lalu bayar menggunakan QRIS, Virtual Account (BCA/Mandiri/BNI), atau E-Wallet (GoPay/OVO/DANA)."
    },
    // Invoice
    {
        category: "Invoice",
        question: "Bagaimana cara membuat invoice?",
        answer: "Klik '+ New Invoice' di sidebar, pilih klien, tambahkan item/jasa, set tanggal jatuh tempo, lalu simpan. Anda bisa langsung export ke PDF atau kirim link ke klien."
    },
    {
        category: "Invoice",
        question: "Bagaimana klien saya membayar invoice?",
        answer: "Setiap invoice memiliki link pembayaran unik. Kirim link tersebut ke klien, dan mereka bisa bayar langsung via QRIS, VA, atau E-Wallet. Status invoice akan otomatis update ke 'Paid'."
    },
    {
        category: "Invoice",
        question: "Bisakah saya membuat invoice berulang (recurring)?",
        answer: "Fitur recurring invoice akan segera hadir! Untuk saat ini, Anda bisa duplicate invoice yang sudah ada."
    },
    // Proposal
    {
        category: "Proposal",
        question: "Apa template proposal yang tersedia?",
        answer: "Artha menyediakan template profesional dengan section: About, Services, Timeline, Investment, dan Terms. Anda bisa customize setiap section sesuai kebutuhan."
    },
    {
        category: "Proposal",
        question: "Bagaimana cara share proposal ke klien?",
        answer: "Setelah proposal selesai, klik 'Share' untuk mendapatkan link. Klien bisa melihat proposal tanpa perlu login. Anda juga bisa export ke PDF."
    },
    // Client
    {
        category: "Klien",
        question: "Bagaimana cara menambah klien baru?",
        answer: "Buka halaman Clients, klik '+ Add Client', isi nama, email, dan informasi kontak lainnya. Data klien akan tersedia saat membuat invoice atau proposal."
    },
    // Payment & Billing
    {
        category: "Pembayaran",
        question: "Metode pembayaran apa yang diterima?",
        answer: "Kami menerima QRIS (scan dengan semua e-wallet dan m-banking), Virtual Account (BCA, Mandiri, BNI, BRI, Permata), dan E-Wallet (GoPay, ShopeePay, DANA)."
    },
    {
        category: "Pembayaran",
        question: "Bagaimana cara membatalkan langganan?",
        answer: "Buka Settings > Subscription, klik 'Cancel Subscription'. Akun Anda akan tetap Pro/Business sampai akhir periode pembayaran, lalu otomatis downgrade ke Free."
    },
    // Security
    {
        category: "Keamanan",
        question: "Apakah data saya aman?",
        answer: "Ya! Kami menggunakan enkripsi end-to-end, Row Level Security di database, dan server Supabase yang memenuhi standar SOC2. Kami juga menyediakan 2FA untuk keamanan ekstra."
    },
    {
        category: "Keamanan",
        question: "Bagaimana cara mengaktifkan 2FA?",
        answer: "Buka Settings > Security, klik 'Enable 2FA', scan QR code dengan Google Authenticator atau app sejenis, lalu verifikasi dengan kode 6 digit."
    },
];

const categories = ["Semua", "Memulai", "Invoice", "Proposal", "Klien", "Pembayaran", "Keamanan"];

const categoryIcons: Record<string, typeof FileText> = {
    Memulai: Settings,
    Invoice: FileText,
    Proposal: FileText,
    Klien: Users,
    Pembayaran: CreditCard,
    Keamanan: Shield,
};

export default function FAQ() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [openItems, setOpenItems] = useState<number[]>([0]);

    const filteredFAQ = faqData.filter((item) => {
        const matchesSearch =
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "Semua" || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleItem = (index: number) => {
        setOpenItems((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Hero */}
            <div className="py-12 text-center bg-gradient-to-b from-primary/5 to-transparent">
                <h1 className="text-4xl font-bold text-foreground mb-4">Pusat Bantuan</h1>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                    Temukan jawaban untuk pertanyaan yang sering diajukan tentang Artha
                </p>
                <div className="max-w-md mx-auto px-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Cari pertanyaan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            variant={activeCategory === cat ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* FAQ List */}
            <div className="max-w-4xl mx-auto px-4 pb-12">
                <div className="space-y-3">
                    {filteredFAQ.map((item, index) => {
                        const Icon = categoryIcons[item.category] || FileText;
                        const isOpen = openItems.includes(index);
                        return (
                            <div
                                key={index}
                                className="border border-border rounded-xl overflow-hidden bg-card"
                            >
                                <button
                                    onClick={() => toggleItem(index)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Icon className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="font-medium text-foreground">{item.question}</span>
                                    </div>
                                    {isOpen ? (
                                        <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                                    )}
                                </button>
                                <div
                                    className={cn(
                                        "overflow-hidden transition-all",
                                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                    )}
                                >
                                    <div className="p-4 pt-0 pl-16 text-muted-foreground">
                                        {item.answer}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredFAQ.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Tidak ada hasil ditemukan</p>
                    </div>
                )}

                {/* Contact Support */}
                <div className="mt-12 p-6 rounded-2xl bg-card border border-border text-center">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Masih butuh bantuan?</h2>
                    <p className="text-muted-foreground mb-6">Tim support kami siap membantu Anda</p>
                    <div className="flex justify-center gap-4">
                        <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                            <Button className="gap-2">
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp Support
                            </Button>
                        </a>
                        <a href="mailto:support@arthawork.com">
                            <Button variant="outline" className="gap-2">
                                <Mail className="w-4 h-4" />
                                Email Support
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

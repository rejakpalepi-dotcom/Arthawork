import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import {
    InvoiceIcon,
    ProposalIcon,
    ClientsIcon,
    ClockIcon,
    ShieldIcon,
    MobileIcon,
    ArrowRightIcon,
    CheckIcon,
} from "@/lib/icons";

const arthaLogo = "/icon-512.png";

// Feature data with custom icons
const features = [
    {
        Icon: InvoiceIcon,
        title: "Invoice Professional",
        description: "Buat invoice dengan berbagai metode pembayaran: QRIS, VA, E-Wallet.",
    },
    {
        Icon: ProposalIcon,
        title: "Proposal Builder",
        description: "Template proposal profesional dengan timeline dan milestone.",
    },
    {
        Icon: ClientsIcon,
        title: "Kelola Klien",
        description: "Database klien terpusat, tersinkronisasi ke semua dokumen.",
    },
    {
        Icon: ClockIcon,
        title: "Hemat Waktu",
        description: "Dari proposal sampai invoice dalam hitungan menit.",
    },
    {
        Icon: ShieldIcon,
        title: "Aman & Terenkripsi",
        description: "Data terenkripsi, login dengan autentikasi dua faktor.",
    },
    {
        Icon: MobileIcon,
        title: "Mobile Ready",
        description: "Akses dari mana saja via browser atau install sebagai PWA.",
    },
];

// Pricing tiers - synced with subscription.ts
const pricingTiers = [
    {
        name: "Free",
        price: "Rp 0",
        period: "selamanya",
        description: "Untuk yang baru mulai",
        features: [
            "3 invoice/bulan",
            "5 proposal/bulan",
            "10 klien",
            "Template dasar",
            "Ada watermark Artha",
        ],
        cta: "Mulai Gratis",
        popular: false,
    },
    {
        name: "Pro",
        price: "Rp 50.000",
        period: "/bulan",
        description: "Untuk freelancer serius",
        features: [
            "Unlimited invoice & proposal",
            "Unlimited klien",
            "Template premium",
            "Custom branding (logo + warna)",
            "Payment reminders",
            "Tanpa watermark",
            "Smart Contracts dengan DP Lock",
            "Priority email support",
        ],
        cta: "Pilih Pro",
        popular: true,
    },
    {
        name: "Business",
        price: "Rp 199.000",
        period: "/bulan",
        description: "Untuk agensi & studio",
        features: [
            "Semua fitur Pro",
            "5 anggota tim",
            "Premium Client Portal",
            "Indonesian Tax Engine (PPh 21/23)",
            "Recurring invoices (auto-bill)",
            "White-label 100%",
            "Advanced analytics",
            "Dedicated account manager",
        ],
        cta: "Pilih Business",
        popular: false,
    },
];

// Stats
const stats = [
    { value: "500+", label: "Invoice Dibuat" },
    { value: "50+", label: "Freelancer Aktif" },
    { value: "99.9%", label: "Uptime" },
];

export default function LandingPage() {
    return (
        <>
            <SEOHead
                title="Artha - Invoice & Proposal Builder untuk Freelancer Indonesia"
                description="Buat invoice profesional dan proposal yang memenangkan klien. Terima pembayaran via QRIS, VA, dan E-Wallet. Gratis untuk mulai!"
                canonical="https://arthawork.vercel.app/"
            />

            <div className="min-h-screen bg-background">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
                    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={arthaLogo} alt="Artha" className="h-8 w-8 rounded-lg" />
                            <span className="font-bold text-xl text-foreground">Artha</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
                            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Harga</a>
                            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">Masuk</Button>
                            </Link>
                            <Link to="/signup">
                                <Button size="sm">Daftar Gratis</Button>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4">
                    <div className="max-w-6xl mx-auto text-center">
                        {/* Badge - simpler, no icon */}
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                            Invoice Builder untuk Freelancer Indonesia
                        </div>

                        {/* Headline - no gradient, solid color */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
                            Kelola Bisnis Freelance
                            <br />
                            <span className="text-primary">dengan Profesional</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Buat dokumen profesional yang memenangkan klien.
                            Terima pembayaran via QRIS, Virtual Account, dan E-Wallet.
                        </p>

                        {/* Single CTA - no dual buttons, no glow */}
                        <div className="flex justify-center mb-16">
                            <Link to="/signup">
                                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                                    Mulai Gratis <ArrowRightIcon className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>

                        {/* Stats - cleaner layout */}
                        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
                            {stats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 px-4 bg-card/30">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Semua yang Kamu Butuhkan
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Tools lengkap untuk menjalankan bisnis freelance
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="bg-card rounded-xl p-6 border border-border card-hover"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <feature.Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Mulai dalam 3 Langkah
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { step: "1", title: "Daftar Gratis", desc: "Buat akun dalam 30 detik, tanpa kartu kredit." },
                                { step: "2", title: "Buat Dokumen", desc: "Pilih template, isi data, kirim ke klien." },
                                { step: "3", title: "Terima Bayaran", desc: "Klien bayar via QRIS/VA, uang masuk otomatis." },
                            ].map((item) => (
                                <div key={item.step} className="text-center">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                                        <span className="text-xl font-bold text-primary">{item.step}</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 px-4 bg-card/30">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Harga Transparan
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Mulai gratis, upgrade kapan saja
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {pricingTiers.map((tier) => (
                                <div
                                    key={tier.name}
                                    className={`bg-card rounded-xl p-6 border relative ${tier.popular ? "border-primary" : "border-border"
                                        }`}
                                >
                                    {tier.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                            POPULER
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                                    <p className="text-muted-foreground text-sm mb-4">{tier.description}</p>
                                    <div className="mb-6">
                                        <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                                        <span className="text-muted-foreground">{tier.period}</span>
                                    </div>
                                    <ul className="space-y-3 mb-6">
                                        {tier.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2 text-sm">
                                                <CheckIcon className="w-4 h-4 text-primary shrink-0" />
                                                <span className="text-muted-foreground">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to={tier.name === "Free" ? "/signup" : "/pricing"}>
                                        <Button
                                            className="w-full"
                                            variant={tier.popular ? "default" : "outline"}
                                        >
                                            {tier.cta}
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Payment note - no emoji */}
                        <p className="text-center text-sm text-muted-foreground mt-8">
                            Pembayaran Pro & Business aktif via Mayar (QRIS, VA, E-Wallet).
                        </p>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            Siap Tingkatkan Bisnis Freelance?
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10">
                            Gabung dengan ratusan freelancer Indonesia yang sudah menggunakan Artha.
                        </p>
                        <Link to="/signup">
                            <Button size="lg" className="gap-2 text-lg px-10 py-6">
                                Daftar Gratis Sekarang <ArrowRightIcon className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <img src={arthaLogo} alt="Artha" className="h-8 w-8 rounded-lg" />
                                <span className="font-bold text-foreground">Artha</span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <Link to="/terms" className="hover:text-foreground transition-colors">Syarat & Ketentuan</Link>
                                <Link to="/privacy" className="hover:text-foreground transition-colors">Kebijakan Privasi</Link>
                                <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                © 2025 Artha. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

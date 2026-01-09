import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useState, useEffect } from "react";
import {
    InvoiceIcon,
    ProposalIcon,
    ClientsIcon,
    ClockIcon,
    ShieldIcon,
    MobileIcon,
    ArrowRightIcon,
    CheckIcon,
    PlayIcon,
} from "@/lib/icons";

const arthaLogo = "/icon-512.png";

// Animated words for hero - ALL CAPS with proper spacing
const animatedWords = ["DRAFT IT.", "SEND IT.", "GET PAID."];

// Feature data with custom icons
const features = [
    {
        Icon: InvoiceIcon,
        title: "Invoice Profesional",
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
            "Custom branding",
            "Payment reminders",
            "Tanpa watermark",
            "Smart Contracts",
            "Priority support",
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
            "Client Portal",
            "Tax Engine (PPh 21/23)",
            "Recurring invoices",
            "White-label 100%",
            "Analytics",
            "Account manager",
        ],
        cta: "Pilih Business",
        popular: false,
    },
];

// Use cases
const useCases = [
    { title: "Freelance Designer", desc: "Invoice desain, proposal project" },
    { title: "Fotografer", desc: "Quote wedding, invoice event" },
    { title: "Developer", desc: "Kontrak project, milestone billing" },
    { title: "Agensi Kreatif", desc: "Team billing, client portal" },
    { title: "Konsultan", desc: "Retainer invoice, recurring billing" },
    { title: "Content Creator", desc: "Brand deal, sponsorship invoice" },
];

// Stats counter
const stats = [
    { value: 500, suffix: "+", label: "Invoice Dibuat" },
    { value: 50, suffix: "+", label: "Freelancer Aktif" },
    { value: 99.9, suffix: "%", label: "Uptime" },
];

// Animated counter hook
function useCounter(target: number, duration: number = 2000) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (hasAnimated) return;

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setCount(Math.floor(target * eased));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setHasAnimated(true);
            }
        };

        const timer = setTimeout(() => requestAnimationFrame(animate), 500);
        return () => clearTimeout(timer);
    }, [target, duration, hasAnimated]);

    return count;
}

export default function LandingPage() {
    const [currentWord, setCurrentWord] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // Animate headline words
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % animatedWords.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Stats counters
    const stat1 = useCounter(stats[0].value);
    const stat2 = useCounter(stats[1].value);
    const stat3 = useCounter(stats[2].value);
    const statValues = [stat1, stat2, stat3];

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
                <section className="pt-24 md:pt-28 pb-8 md:pb-12 px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Animated Headline - wider container */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
                            {animatedWords.map((word, index) => (
                                <span
                                    key={word}
                                    className={`inline-block transition-colors duration-500 mr-1 sm:mr-2 md:mr-3 ${index === currentWord
                                        ? "text-primary"
                                        : "text-foreground"
                                        }`}
                                >
                                    {word}
                                </span>
                            ))}
                        </h1>

                        {/* Tagline - improved contrast */}
                        <p className="text-base md:text-lg text-foreground/70 max-w-lg mx-auto mb-6 md:mb-8">
                            Invoice & Proposal Builder untuk Freelancer Indonesia.
                            Profesional dalam hitungan menit.
                        </p>

                        {/* CTA Button */}
                        <Link to="/signup">
                            <Button size="lg" className="gap-2 px-6 md:px-8 py-5 md:py-6">
                                Mulai Gratis <ArrowRightIcon className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Video Demo Section */}
                <section className="py-12 px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                                Lihat cara kerja Artha
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Buat invoice profesional dalam 60 detik
                            </p>
                        </div>

                        {/* Video Container - Placeholder for now */}
                        <div
                            className="relative aspect-video bg-card rounded-2xl border border-border overflow-hidden cursor-pointer group"
                            onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                        >
                            {!isVideoPlaying ? (
                                <>
                                    {/* Video Thumbnail Placeholder */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                                <PlayIcon className="w-8 h-8 text-primary-foreground ml-1" />
                                            </div>
                                            <p className="text-muted-foreground text-sm">Klik untuk play demo</p>
                                        </div>
                                    </div>
                                    {/* Decorative UI elements */}
                                    <div className="absolute top-4 left-4 bg-card/80 backdrop-blur px-3 py-1.5 rounded-lg border border-border">
                                        <span className="text-xs text-muted-foreground">Demo Video</span>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                                    <p className="text-white text-lg">Video coming soon...</p>
                                    <Button
                                        variant="ghost"
                                        className="absolute top-4 right-4 text-white"
                                        onClick={(e) => { e.stopPropagation(); setIsVideoPlaying(false); }}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-12 md:py-20 px-4 bg-card/30">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                                Fitur Artha
                            </h2>
                            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
                                Tools lengkap untuk menjalankan bisnis freelance
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <feature.Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Use Cases Section */}
                <section className="py-12 md:py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                                Dibuat untuk semua kreator
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Dari freelancer hingga agensi
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {useCases.map((useCase) => (
                                <div
                                    key={useCase.title}
                                    className="bg-card/50 rounded-xl p-5 border border-border text-center hover:bg-card transition-colors"
                                >
                                    <h3 className="font-semibold text-foreground mb-1">{useCase.title}</h3>
                                    <p className="text-sm text-muted-foreground">{useCase.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <Link to="/signup">
                                <Button variant="outline" className="gap-2">
                                    Explore semua fitur <ArrowRightIcon className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Stats Counter Section */}
                <section className="py-16 px-4 bg-primary/5 border-y border-primary/10">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <p className="text-lg text-muted-foreground">
                                Dipercaya freelancer di seluruh Indonesia
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-16 md:gap-24">
                            {stats.map((stat, index) => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-4xl md:text-5xl font-bold text-primary">
                                        {statValues[index]}{stat.suffix}
                                    </p>
                                    <p className="text-muted-foreground mt-2">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-12 md:py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
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
                                    className={`bg-card rounded-2xl p-6 border relative ${tier.popular ? "border-primary ring-2 ring-primary/20" : "border-border"
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

                        <p className="text-center text-sm text-muted-foreground mt-8">
                            Pembayaran via QRIS, Virtual Account, dan E-Wallet.
                        </p>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-16 px-4 bg-card/30">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                            Siap untuk mulai?
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Gratis selamanya. Upgrade kapan saja.
                        </p>
                        <Link to="/signup">
                            <Button size="lg" className="gap-2 px-8 py-6">
                                Daftar Gratis Sekarang <ArrowRightIcon className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                            {/* Brand */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <img src={arthaLogo} alt="Artha" className="h-8 w-8 rounded-lg" />
                                    <span className="font-bold text-foreground">Artha</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Invoice & Proposal Builder untuk Freelancer Indonesia
                                </p>
                            </div>

                            {/* Product */}
                            <div>
                                <h4 className="font-semibold text-foreground mb-4">Product</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#features" className="text-muted-foreground hover:text-foreground">Fitur</a></li>
                                    <li><a href="#pricing" className="text-muted-foreground hover:text-foreground">Harga</a></li>
                                    <li><Link to="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
                                </ul>
                            </div>

                            {/* Company */}
                            <div>
                                <h4 className="font-semibold text-foreground mb-4">Company</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Syarat & Ketentuan</Link></li>
                                    <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Kebijakan Privasi</Link></li>
                                </ul>
                            </div>

                            {/* Newsletter */}
                            <div>
                                <h4 className="font-semibold text-foreground mb-4">Stay Updated</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Dapatkan tips freelance & update fitur terbaru
                                </p>
                                {/* Placeholder - can add email input later */}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">
                                © 2026 Artha. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

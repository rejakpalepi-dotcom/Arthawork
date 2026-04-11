import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import {
    InvoiceIcon,
    ProposalIcon,
    ClientsIcon,
    ClockIcon,
    ShieldIcon,
    MobileIcon,
    ArrowRightIcon,
    CheckIcon,
    MessageIcon,
    MailIcon,
    FileIcon,
    LinkIcon,
    ChevronDownIcon,
} from "@/lib/icons";
import { fadeInUp, fadeIn, staggerContainer, scaleIn } from "@/lib/landingAnimations";

// Reusable animated section wrapper
function AnimatedSection({
    children,
    className = "",
    variants = fadeInUp
}: {
    children: React.ReactNode;
    className?: string;
    variants?: Variants;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={className}
        >
            {children}
        </motion.div>
    );
}

const arthaLogo = "/icon-512.png";

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

// Stats
const stats = [
    { value: "500+", label: "Invoice Dibuat" },
    { value: "50+", label: "Freelancer Aktif" },
    { value: "99.9%", label: "Uptime" },
];

// Testimonials data
const testimonials = [
    {
        name: "Andi Pratama",
        role: "Freelance Designer",
        avatar: "AP",
        quote: "Invoice saya jadi lebih profesional. Client langsung bayar tanpa tanya-tanya lagi!",
    },
    {
        name: "Sari Dewi",
        role: "Fotografer Wedding",
        avatar: "SD",
        quote: "Proposal wedding jadi lebih mudah dibuat. Hemat waktu banget!",
    },
    {
        name: "Budi Santoso",
        role: "Web Developer",
        avatar: "BS",
        quote: "Milestone billing jadi gampang. Tracking pembayaran jelas.",
    },
    {
        name: "Maya Putri",
        role: "Content Creator",
        avatar: "MP",
        quote: "Brand deal invoice nya profesional. Sponsor jadi lebih trust.",
    },
    {
        name: "Rizky Fauzan",
        role: "Video Editor",
        avatar: "RF",
        quote: "Sebelumnya pakai Excel, sekarang 10x lebih cepat!",
    },
    {
        name: "Dian Kusuma",
        role: "UI/UX Designer",
        avatar: "DK",
        quote: "Client portal nya keren, client bisa langsung approve proposal.",
    },
];

// Export/Share methods with proper icons
const exportMethods = [
    { name: "WhatsApp", Icon: MessageIcon, desc: "Kirim langsung ke chat" },
    { name: "Email", Icon: MailIcon, desc: "Otomatis dengan template" },
    { name: "PDF", Icon: FileIcon, desc: "Download berkualitas tinggi" },
    { name: "Link", Icon: LinkIcon, desc: "Share via link unik" },
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
                <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
                    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={arthaLogo} alt="Artha" className="h-8 w-8 rounded-lg" />
                            <span className="font-semibold text-xl text-foreground">Artha</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
                            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Harga</a>
                            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
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
                <section className="pt-24 md:pt-32 pb-8 md:pb-12 px-4 relative overflow-hidden">
                    {/* Subtle hero-only background accent */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(800px circle at 30% 20%, hsl(187 100% 38% / 0.06), transparent 50%)`,
                        }}
                    />

                    <motion.div
                        className="max-w-4xl mx-auto text-center relative z-10"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        {/* Static headline — clear and direct */}
                        <motion.h1
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight mb-4 md:mb-6 text-foreground"
                            variants={fadeInUp}
                        >
                            DRAFT IT. SEND IT. GET PAID.
                        </motion.h1>

                        {/* Tagline */}
                        <motion.p
                            className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto mb-6 md:mb-8"
                            variants={fadeInUp}
                        >
                            Invoice & Proposal Builder untuk Freelancer Indonesia.
                            Profesional dalam hitungan menit.
                        </motion.p>

                        {/* CTA Button */}
                        <motion.div variants={fadeInUp}>
                            <Link to="/signup">
                                <Button size="lg" className="gap-2 px-6 md:px-8 py-5 md:py-6">
                                    Mulai Gratis <ArrowRightIcon className="w-4 h-4" />
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Video Demo Section */}
                <section className="py-12 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                                Lihat cara kerja Artha
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Buat invoice profesional dalam 60 detik
                            </p>
                        </div>

                        <AnimatedSection variants={scaleIn}>
                            <div className="relative aspect-video bg-card rounded-2xl border border-border overflow-hidden shadow-md">
                                <video
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="auto"
                                >
                                    <source src="/videos/new video thumbnails.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </AnimatedSection>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-12 md:py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <AnimatedSection className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                                Fitur Artha
                            </h2>
                            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                                Tools lengkap untuk menjalankan bisnis freelance
                            </p>
                        </AnimatedSection>

                        <motion.div
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-80px" }}
                            variants={staggerContainer}
                        >
                            {features.map((feature) => (
                                <motion.div
                                    key={feature.title}
                                    className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors"
                                    variants={fadeInUp}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <feature.Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Use Cases Section */}
                <section className="py-12 md:py-16 px-4 bg-muted/30">
                    <div className="max-w-6xl mx-auto">
                        <AnimatedSection className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                                Dibuat untuk semua kreator
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Dari freelancer hingga agensi
                            </p>
                        </AnimatedSection>

                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={staggerContainer}
                        >
                            {useCases.map((useCase) => (
                                <motion.div
                                    key={useCase.title}
                                    className="bg-card rounded-xl p-5 border border-border text-center"
                                    variants={fadeInUp}
                                >
                                    <h3 className="font-semibold text-foreground mb-1">{useCase.title}</h3>
                                    <p className="text-sm text-muted-foreground">{useCase.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        <AnimatedSection className="text-center mt-10">
                            <Link to="/signup">
                                <Button variant="outline" className="gap-2">
                                    Explore semua fitur <ArrowRightIcon className="w-4 h-4" />
                                </Button>
                            </Link>
                        </AnimatedSection>
                    </div>
                </section>

                {/* Stats Counter Section */}
                <section className="py-12 px-4 border-y border-border">
                    <div className="max-w-4xl mx-auto">
                        <AnimatedSection className="text-center mb-8">
                            <p className="text-lg text-muted-foreground">
                                Dipercaya freelancer di seluruh Indonesia
                            </p>
                        </AnimatedSection>
                        <motion.div
                            className="flex flex-wrap justify-center gap-16 md:gap-24"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            {stats.map((stat) => (
                                <motion.div
                                    key={stat.label}
                                    className="text-center"
                                    variants={fadeInUp}
                                >
                                    <p className="text-3xl md:text-4xl font-semibold font-numeric text-foreground">
                                        {stat.value}
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-sm">{stat.label}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Export/Share Showcase Section */}
                <section className="py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        <AnimatedSection className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                                Kirim Invoice ke Mana Saja
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Satu klik, langsung sampai ke client
                            </p>
                        </AnimatedSection>

                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            {exportMethods.map((method) => (
                                <motion.div
                                    key={method.name}
                                    className="bg-card rounded-xl p-6 border border-border text-center"
                                    variants={fadeInUp}
                                >
                                    <div className="flex justify-center mb-3">
                                        <method.Icon className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-1">{method.name}</h3>
                                    <p className="text-sm text-muted-foreground">{method.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className="py-12 px-4 bg-muted/30 overflow-hidden">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
                            {/* Left Side - Title & Stats */}
                            <AnimatedSection className="md:sticky md:top-32">
                                <p className="text-sm text-primary font-medium mb-2 uppercase tracking-wide">
                                    TESTIMONIALS
                                </p>
                                <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                                    Dipercaya Freelancer Indonesia
                                </h2>
                                <p className="text-muted-foreground mb-8">
                                    Lihat apa kata mereka tentang Artha
                                </p>

                                {/* Mini Stats */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-2xl md:text-3xl font-semibold font-numeric text-foreground">500+</p>
                                        <p className="text-sm text-muted-foreground">Invoice Dibuat</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl md:text-3xl font-semibold font-numeric text-foreground">50+</p>
                                        <p className="text-sm text-muted-foreground">Freelancer Aktif</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl md:text-3xl font-semibold font-numeric text-foreground">99.9%</p>
                                        <p className="text-sm text-muted-foreground">Uptime</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl md:text-3xl font-semibold font-numeric text-foreground">4.9/5</p>
                                        <p className="text-sm text-muted-foreground">User Rating</p>
                                    </div>
                                </div>
                            </AnimatedSection>

                            {/* Right Side - Scrolling Testimonials */}
                            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                                {/* Gradient Fade Top */}
                                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-muted/30 to-transparent z-10 pointer-events-none" />
                                {/* Gradient Fade Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-muted/30 to-transparent z-10 pointer-events-none" />

                                {/* Scrolling Column */}
                                <div
                                    className="space-y-4"
                                    style={{
                                        animation: 'scrollUp 20s linear infinite'
                                    }}
                                >
                                    {/* Triple for seamless loop */}
                                    {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                                        <div
                                            key={`${testimonial.name}-${index}`}
                                            className="bg-card rounded-xl p-5 border border-border"
                                        >
                                            <p className="text-foreground text-sm mb-4">"{testimonial.quote}"</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                    {testimonial.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                                                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CSS Keyframes for vertical scroll */}
                        <style>{`
                            @keyframes scrollUp {
                                0% {
                                    transform: translateY(0);
                                }
                                100% {
                                    transform: translateY(calc(-136px * 6 - 96px));
                                }
                            }
                        `}</style>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-12 md:py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <AnimatedSection className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                                Harga Transparan
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Mulai gratis, upgrade kapan saja
                            </p>
                        </AnimatedSection>

                        <motion.div
                            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-80px" }}
                            variants={staggerContainer}
                        >
                            {pricingTiers.map((tier) => (
                                <motion.div
                                    key={tier.name}
                                    className={`bg-card rounded-xl p-6 border relative ${tier.popular ? "border-primary ring-1 ring-primary/20" : "border-border"
                                        }`}
                                    variants={fadeInUp}
                                >
                                    {tier.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                            POPULER
                                        </div>
                                    )}
                                    <h3 className="text-xl font-semibold text-foreground mb-2">{tier.name}</h3>
                                    <p className="text-muted-foreground text-sm mb-4">{tier.description}</p>
                                    <div className="mb-6">
                                        <span className="text-3xl font-semibold font-numeric text-foreground">{tier.price}</span>
                                        <span className="text-muted-foreground ml-1">{tier.period}</span>
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
                                </motion.div>
                            ))}
                        </motion.div>

                        <AnimatedSection className="text-center mt-8">
                            <p className="text-sm text-muted-foreground">
                                Pembayaran via QRIS, Virtual Account, dan E-Wallet.
                            </p>
                        </AnimatedSection>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-12 md:py-16 px-4 bg-muted/30">
                    <div className="max-w-3xl mx-auto">
                        <AnimatedSection className="text-center mb-10">
                            <p className="text-sm text-primary font-medium mb-2 uppercase tracking-wide">
                                FAQ
                            </p>
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                                Pertanyaan yang Sering Ditanyakan
                            </h2>
                            <p className="text-muted-foreground">
                                Jawaban untuk pertanyaan umum tentang Artha
                            </p>
                        </AnimatedSection>

                        <motion.div
                            className="space-y-3"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            {[
                                {
                                    q: "Apa itu Artha?",
                                    a: "Artha adalah platform invoice dan proposal builder profesional untuk freelancer Indonesia. Dengan Artha, kamu bisa buat invoice menarik dengan berbagai metode pembayaran (QRIS, VA, E-Wallet) dan proposal profesional dengan template premium."
                                },
                                {
                                    q: "Apakah Artha gratis?",
                                    a: "Ya! Artha punya tier Free yang gratis selamanya. Kamu bisa buat 3 invoice/bulan, 5 proposal/bulan, dan kelola 10 klien tanpa biaya. Untuk fitur unlimited, bisa upgrade ke Pro (Rp 50.000/bulan) atau Business (Rp 199.000/bulan)."
                                },
                                {
                                    q: "Metode pembayaran apa saja yang didukung?",
                                    a: "Artha mendukung berbagai metode pembayaran: QRIS (scan QR), Virtual Account (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, OVO, DANA, ShopeePay), dan transfer bank. Semua terintegrasi otomatis, klien tinggal bayar dan kamu dapat notifikasi."
                                },
                                {
                                    q: "Apakah Artha menghitung pajak otomatis?",
                                    a: "Ya! Artha memiliki fitur Tax Summary yang menghitung PPh 21 dan PPh 23 secara otomatis. Sangat membantu freelancer untuk laporan pajak tahunan."
                                },
                                {
                                    q: "Bisa custom branding di invoice?",
                                    a: "Tentu! Dengan Artha Pro dan Business, kamu bisa tambahkan logo sendiri, warna brand, dan hapus watermark Artha. Invoice terlihat 100% profesional dengan branding kamu."
                                }
                            ].map((faq, index) => (
                                <motion.details
                                    key={index}
                                    className="bg-card rounded-xl border border-border group"
                                    variants={fadeInUp}
                                >
                                    <summary className="p-5 cursor-pointer list-none flex justify-between items-center">
                                        <h3 className="font-medium text-foreground pr-4">{faq.q}</h3>
                                        <ChevronDownIcon className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180 shrink-0" />
                                    </summary>
                                    <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                                        {faq.a}
                                    </div>
                                </motion.details>
                            ))}
                        </motion.div>

                        {/* Last Updated for GEO */}
                        <p className="text-center text-xs text-muted-foreground mt-8">
                            Terakhir diperbarui: Februari 2026
                        </p>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-12 md:py-16 px-4">
                    <AnimatedSection className="max-w-2xl mx-auto text-center">
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
                    </AnimatedSection>
                </section>

                {/* Footer */}
                <footer className="border-t border-border py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                            {/* Brand */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <img src={arthaLogo} alt="Artha" className="h-8 w-8 rounded-lg" />
                                    <span className="font-semibold text-foreground">Artha</span>
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
                                &copy; 2026 Artha. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

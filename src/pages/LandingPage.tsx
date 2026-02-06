import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useState, useEffect } from "react";
import { motion, useInView, useAnimation, Variants, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
    MessageIcon,
    MailIcon,
    FileIcon,
    LinkIcon,
    ChevronDownIcon,
} from "@/lib/icons";

// ===== PACETION-STYLE ANIMATION VARIANTS =====

// Smooth fade up with blur (like Pacetion's sections)
const fadeInUp: Variants = {
    hidden: {
        opacity: 0,
        y: 40,
        filter: "blur(10px)"
    },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.8,
            ease: [0.25, 0.4, 0.25, 1] // smooth cubic bezier
        }
    }
};

const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.6 }
    }
};

// Stagger container with more dramatic timing
const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

// Scale in with spring physics (for cards and images)
const scaleIn: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.85,
        y: 20
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.7
        }
    }
};

// Slide in from sides with blur
const slideInLeft: Variants = {
    hidden: {
        opacity: 0,
        x: -60,
        filter: "blur(8px)"
    },
    visible: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }
    }
};

const slideInRight: Variants = {
    hidden: {
        opacity: 0,
        x: 60,
        filter: "blur(8px)"
    },
    visible: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }
    }
};

// Floating animation for cards (Pacetion-style floating UI elements)
const floatingCard: Variants = {
    initial: { y: 0 },
    animate: {
        y: [-10, 10, -10],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

// Text character reveal animation
const textRevealContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.2
        }
    }
};

const textRevealChar: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        rotateX: -90
    },
    visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
            type: "spring",
            stiffness: 150,
            damping: 15
        }
    }
};

// Glow pulse animation for accent elements
const glowPulse: Variants = {
    initial: {
        boxShadow: "0 0 20px rgba(var(--primary), 0.3)"
    },
    animate: {
        boxShadow: [
            "0 0 20px rgba(var(--primary), 0.3)",
            "0 0 40px rgba(var(--primary), 0.5)",
            "0 0 20px rgba(var(--primary), 0.3)"
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

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
    const isInView = useInView(ref, { once: true, margin: "-100px" });

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

// Text reveal component for hero headlines
function AnimatedText({ text, className = "" }: { text: string; className?: string }) {
    return (
        <motion.span
            className={className}
            variants={textRevealContainer}
            initial="hidden"
            animate="visible"
        >
            {text.split("").map((char, index) => (
                <motion.span
                    key={index}
                    variants={textRevealChar}
                    style={{ display: "inline-block" }}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </motion.span>
    );
}

// Floating preview card component (Pacetion-style)
function FloatingCard({
    children,
    delay = 0,
    className = ""
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{
                opacity: 1,
                y: [0, -15, 0],
                scale: 1
            }}
            transition={{
                opacity: { duration: 0.5, delay },
                scale: { duration: 0.5, delay },
                y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay + 0.5
                }
            }}
        >
            {children}
        </motion.div>
    );
}

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

// Testimonials data
const testimonials = [
    {
        name: "Andi Pratama",
        role: "Freelance Designer",
        avatar: "AP",
        quote: "Invoice saya jadi lebih profesional. Client langsung bayar tanpa tanya-tanya lagi!",
        rating: 5,
    },
    {
        name: "Sari Dewi",
        role: "Fotografer Wedding",
        avatar: "SD",
        quote: "Proposal wedding jadi lebih mudah dibuat. Hemat waktu banget!",
        rating: 5,
    },
    {
        name: "Budi Santoso",
        role: "Web Developer",
        avatar: "BS",
        quote: "Milestone billing jadi gampang. Tracking pembayaran jelas.",
        rating: 5,
    },
    {
        name: "Maya Putri",
        role: "Content Creator",
        avatar: "MP",
        quote: "Brand deal invoice nya profesional. Sponsor jadi lebih trust.",
        rating: 5,
    },
    {
        name: "Rizky Fauzan",
        role: "Video Editor",
        avatar: "RF",
        quote: "Sebelumnya pakai Excel, sekarang 10x lebih cepat!",
        rating: 5,
    },
    {
        name: "Dian Kusuma",
        role: "UI/UX Designer",
        avatar: "DK",
        quote: "Client portal nya keren, client bisa langsung approve proposal.",
        rating: 5,
    },
];

// Export/Share methods with proper icons
const exportMethods = [
    { name: "WhatsApp", Icon: MessageIcon, desc: "Kirim langsung ke chat" },
    { name: "Email", Icon: MailIcon, desc: "Otomatis dengan template" },
    { name: "PDF", Icon: FileIcon, desc: "Download berkualitas tinggi" },
    { name: "Link", Icon: LinkIcon, desc: "Share via link unik" },
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
                <section className="pt-24 md:pt-28 pb-8 md:pb-12 px-4 relative overflow-hidden">
                    {/* Gradient Orbs Background */}
                    <motion.div
                        className="absolute top-20 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none"
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />
                    <motion.div
                        className="absolute -bottom-20 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"
                        animate={{
                            scale: [1, 1.3, 1],
                            x: [-20, 20, -20]
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />

                    <motion.div
                        className="max-w-5xl mx-auto text-center"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        {/* Animated Headline - wider container */}
                        <motion.h1
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6"
                            variants={fadeInUp}
                        >
                            {animatedWords.map((word, index) => (
                                <motion.span
                                    key={word}
                                    className={`inline-block transition-colors duration-500 mr-1 sm:mr-2 md:mr-3 ${index === currentWord
                                        ? "text-primary"
                                        : "text-foreground"
                                        }`}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.h1>

                        {/* Tagline - improved contrast */}
                        <motion.p
                            className="text-base md:text-lg text-foreground/70 max-w-lg mx-auto mb-6 md:mb-8"
                            variants={fadeInUp}
                        >
                            Invoice & Proposal Builder untuk Freelancer Indonesia.
                            Profesional dalam hitungan menit.
                        </motion.p>

                        {/* CTA Button */}
                        <motion.div variants={fadeInUp}>
                            <Link to="/signup">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button size="lg" className="gap-2 px-6 md:px-8 py-5 md:py-6">
                                        Mulai Gratis <ArrowRightIcon className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Video Demo Section */}
                <section className="py-12 px-4">
                    <div className="max-w-5xl mx-auto relative">
                        <div className="text-center mb-8">
                            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                                Lihat cara kerja Artha
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Buat invoice profesional dalam 60 detik
                            </p>
                        </div>

                        {/* Video Container with Floating Cards */}
                        <div className="relative">
                            {/* Floating Invoice Card - Left */}
                            <FloatingCard
                                delay={0.3}
                                className="absolute -left-4 lg:-left-20 top-1/4 z-10 hidden md:block"
                            >
                                <div className="bg-card/95 backdrop-blur-md rounded-xl p-4 border border-border/50 shadow-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-xs text-muted-foreground">Invoice Dikirim</span>
                                    </div>
                                    <p className="font-semibold text-foreground">Rp 2.500.000</p>
                                    <p className="text-xs text-muted-foreground">Client: PT Maju Jaya</p>
                                </div>
                            </FloatingCard>

                            {/* Floating Status Card - Top Right */}
                            <FloatingCard
                                delay={0.5}
                                className="absolute -right-4 lg:-right-16 top-8 z-10 hidden md:block"
                            >
                                <div className="bg-primary/10 backdrop-blur-md rounded-xl p-3 border border-primary/20 shadow-2xl">
                                    <div className="flex items-center gap-2">
                                        <CheckIcon className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium text-primary">Pembayaran Diterima!</span>
                                    </div>
                                </div>
                            </FloatingCard>

                            {/* Floating Proposal Card - Bottom Right */}
                            <FloatingCard
                                delay={0.7}
                                className="absolute -right-4 lg:-right-20 bottom-1/4 z-10 hidden md:block"
                            >
                                <div className="bg-card/95 backdrop-blur-md rounded-xl p-4 border border-border/50 shadow-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-xs text-muted-foreground">Proposal Baru</span>
                                    </div>
                                    <p className="font-semibold text-foreground">Website Redesign</p>
                                    <p className="text-xs text-muted-foreground">Rp 15.000.000</p>
                                </div>
                            </FloatingCard>

                            {/* Video */}
                            <AnimatedSection variants={scaleIn}>
                                <div className="relative aspect-video bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
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
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-12 md:py-20 px-4 bg-card/30">
                    <div className="max-w-6xl mx-auto">
                        <AnimatedSection className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                                Fitur Artha
                            </h2>
                            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto">
                                Tools lengkap untuk menjalankan bisnis freelance
                            </p>
                        </AnimatedSection>

                        <motion.div
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
                                    variants={fadeInUp}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                >
                                    <motion.div
                                        className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        <feature.Icon className="w-6 h-6 text-primary" />
                                    </motion.div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Use Cases Section */}
                <section className="py-12 md:py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <AnimatedSection className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                                Dibuat untuk semua kreator
                            </h2>
                            <p className="text-xl text-muted-foreground">
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
                                    className="bg-card/50 rounded-xl p-5 border border-border text-center hover:bg-card transition-colors"
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                                >
                                    <h3 className="font-semibold text-foreground mb-1">{useCase.title}</h3>
                                    <p className="text-sm text-muted-foreground">{useCase.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        <AnimatedSection className="text-center mt-10">
                            <Link to="/signup">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button variant="outline" className="gap-2">
                                        Explore semua fitur <ArrowRightIcon className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            </Link>
                        </AnimatedSection>
                    </div>
                </section>

                {/* Stats Counter Section */}
                <section className="py-16 px-4 bg-primary/5 border-y border-primary/10">
                    <div className="max-w-4xl mx-auto">
                        <AnimatedSection className="text-center mb-10">
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
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    className="text-center"
                                    variants={scaleIn}
                                >
                                    <motion.p
                                        className="text-4xl md:text-5xl font-bold text-primary"
                                        initial={{ scale: 0.5 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ type: "spring", stiffness: 200, delay: index * 0.1 }}
                                    >
                                        {statValues[index]}{stat.suffix}
                                    </motion.p>
                                    <p className="text-muted-foreground mt-2">{stat.label}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Export/Share Showcase Section */}
                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto">
                        <AnimatedSection className="text-center mb-12">
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
                            {exportMethods.map((method, index) => (
                                <motion.div
                                    key={method.name}
                                    className="bg-card rounded-2xl p-6 border border-border text-center group cursor-pointer"
                                    variants={fadeInUp}
                                    whileHover={{
                                        y: -8,
                                        scale: 1.02,
                                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                                        transition: { duration: 0.3 }
                                    }}
                                >
                                    <motion.div
                                        className="flex justify-center mb-3"
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <method.Icon className="w-10 h-10 text-primary" />
                                    </motion.div>
                                    <h3 className="font-semibold text-foreground mb-1">{method.name}</h3>
                                    <p className="text-sm text-muted-foreground">{method.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Testimonial Section - Pacetion Style */}
                <section className="py-16 px-4 bg-card/30 overflow-hidden">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
                            {/* Left Side - Title & Stats */}
                            <AnimatedSection className="md:sticky md:top-32">
                                <p className="text-sm text-primary font-medium mb-2 uppercase tracking-wide">
                                    TESTIMONIALS
                                </p>
                                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                                    Dipercaya Freelancer Indonesia
                                </h2>
                                <p className="text-muted-foreground mb-8">
                                    Lihat apa kata mereka tentang Artha
                                </p>

                                {/* Mini Stats */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-3xl md:text-4xl font-bold text-foreground">500+</p>
                                        <p className="text-sm text-muted-foreground">Invoice Dibuat</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl md:text-4xl font-bold text-foreground">50+</p>
                                        <p className="text-sm text-muted-foreground">Freelancer Aktif</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl md:text-4xl font-bold text-foreground">99.9%</p>
                                        <p className="text-sm text-muted-foreground">Uptime</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl md:text-4xl font-bold text-foreground">4.9/5</p>
                                        <p className="text-sm text-muted-foreground">User Rating</p>
                                    </div>
                                </div>
                            </AnimatedSection>

                            {/* Right Side - Scrolling Testimonials */}
                            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                                {/* Gradient Fade Top */}
                                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background/80 to-transparent z-10 pointer-events-none" />
                                {/* Gradient Fade Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none" />

                                {/* Scrolling Column */}
                                <div
                                    className="space-y-4"
                                    style={{
                                        animation: 'scrollUp 20s linear infinite'
                                    }}
                                >
                                    {/* Triple for seamless loop */}
                                    {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                                        <motion.div
                                            key={`${testimonial.name}-${index}`}
                                            className="bg-card rounded-xl p-5 border border-border"
                                            whileHover={{ scale: 1.02, x: -4 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <p className="text-foreground text-sm mb-4">"{testimonial.quote}"</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                                                    {testimonial.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                                                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                                </div>
                                            </div>
                                        </motion.div>
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
                <section id="pricing" className="py-12 md:py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <AnimatedSection className="text-center mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                                Harga Transparan
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Mulai gratis, upgrade kapan saja
                            </p>
                        </AnimatedSection>

                        <motion.div
                            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                        >
                            {pricingTiers.map((tier, index) => (
                                <motion.div
                                    key={tier.name}
                                    className={`bg-card rounded-2xl p-6 border relative ${tier.popular ? "border-primary ring-2 ring-primary/20" : "border-border"
                                        }`}
                                    variants={fadeInUp}
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                >
                                    {tier.popular && (
                                        <motion.div
                                            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", delay: 0.5 }}
                                        >
                                            POPULER
                                        </motion.div>
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
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button
                                                className="w-full"
                                                variant={tier.popular ? "default" : "outline"}
                                            >
                                                {tier.cta}
                                            </Button>
                                        </motion.div>
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

                {/* FAQ Section (GEO Optimized) */}
                <section id="faq" className="py-16 px-4">
                    <div className="max-w-3xl mx-auto">
                        <AnimatedSection className="text-center mb-12">
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
                            className="space-y-4"
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
                                        <ChevronDownIcon className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180" />
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
                <section className="py-16 px-4 bg-card/30 relative overflow-hidden">
                    {/* Gradient Mesh */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
                    <motion.div
                        className="absolute top-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 6, repeat: Infinity }}
                    />
                    <AnimatedSection className="max-w-2xl mx-auto text-center relative z-10">
                        <motion.h2
                            className="text-2xl md:text-3xl font-semibold text-foreground mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            Siap untuk mulai?
                        </motion.h2>
                        <motion.p
                            className="text-muted-foreground mb-8"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            Gratis selamanya. Upgrade kapan saja.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <Link to="/signup">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button size="lg" className="gap-2 px-8 py-6">
                                        Daftar Gratis Sekarang <ArrowRightIcon className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>
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

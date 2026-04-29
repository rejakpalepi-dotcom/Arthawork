import { Link } from "react-router-dom";
import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import {
  ArrowRightIcon,
  CheckIcon,
  ClientsIcon,
  ClockIcon,
  InvoiceIcon,
  LinkIcon,
  MailIcon,
  MessageIcon,
  MobileIcon,
  ProposalIcon,
  ShieldIcon,
} from "@/lib/icons";
import {
  fadeIn,
  fadeInUp,
  scaleIn,
  staggerContainer,
} from "@/lib/landingAnimations";

function AnimatedSection({
  children,
  className = "",
  variants = fadeInUp,
}: {
  children: ReactNode;
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

const trustPoints = [
  "Template proposal yang siap dikirim ke klien Indonesia",
  "Invoice profesional dengan QRIS, VA, dan e-wallet",
  "Rapi dipakai solo freelancer maupun studio kecil",
];

const problemCards = [
  {
    title: "Proposal lama terasa generik",
    description:
      "Klien lambat approve karena deck, timeline, dan ruang lingkup tidak terasa jelas sejak layar pertama.",
  },
  {
    title: "Invoice sering telat dibayar",
    description:
      "Pembayaran molor ketika invoice kurang rapi, metode bayar terbatas, atau follow-up masih manual.",
  },
  {
    title: "Data klien tercecer",
    description:
      "Nama bisnis, PIC, pricing, dan revisi sering tersebar di chat, drive, dan spreadsheet yang berbeda.",
  },
];

const valueMetrics = [
  { value: "< 10 menit", label: "Dari draft ke dokumen siap kirim" },
  { value: "3 alur", label: "Proposal, invoice, dan manajemen klien dalam satu workspace" },
  { value: "ID-first", label: "Dirancang untuk workflow freelancer Indonesia" },
];

const features = [
  {
    Icon: ProposalIcon,
    title: "Builder Proposal",
    description:
      "Susun scope, deliverables, timeline, dan milestone payment dalam format yang enak dibaca klien.",
  },
  {
    Icon: InvoiceIcon,
    title: "Invoice yang lebih cepat dibayar",
    description:
      "Tambahkan QRIS, virtual account, atau transfer supaya klien tidak berhenti di tahap approval.",
  },
  {
    Icon: ClientsIcon,
    title: "Data klien terpusat",
    description:
      "Semua data klien, histori dokumen, dan detail project tersimpan rapi untuk project berikutnya.",
  },
  {
    Icon: ClockIcon,
    title: "Workflow hemat waktu",
    description:
      "Duplikasi template, reuse item fee, dan ubah brief jadi dokumen operasional tanpa mulai dari nol.",
  },
  {
    Icon: ShieldIcon,
    title: "Profesional sejak awal",
    description:
      "Copy, hierarchy, spacing, dan struktur dokumen dibuat agar terlihat lebih kredibel sejak pertama dibuka.",
  },
  {
    Icon: MobileIcon,
    title: "Tetap enak di mobile",
    description:
      "Buka, review, dan kirim dokumen dari desktop maupun mobile tanpa layout pecah atau CTA tenggelam.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Bangun proposal dari brief",
    description:
      "Pilih template, rapikan scope, dan tetapkan milestone agar klien langsung paham apa yang dibeli.",
  },
  {
    step: "02",
    title: "Kirim dan share tanpa friksi",
    description:
      "Bagikan via link, PDF, email, atau WhatsApp sesuai channel yang paling sering dipakai klienmu.",
  },
  {
    step: "03",
    title: "Naikkan ke invoice saat deal",
    description:
      "Begitu klien approve, ubah alur menjadi invoice profesional tanpa bongkar data dari awal.",
  },
];

const audienceCards = [
  {
    title: "Freelance Designer",
    description: "Proposal branding, website, social media retainer, hingga invoice revisi tambahan.",
  },
  {
    title: "Fotografer & Videografer",
    description: "Quote wedding, event rundown, DP structure, dan invoice pelunasan yang lebih mudah diikuti.",
  },
  {
    title: "Developer Web",
    description: "Scope sprint, breakdown milestone, serah-terima, dan invoicing project berbasis fase.",
  },
  {
    title: "Studio Kreatif",
    description: "Rapikan handoff internal dan tampilkan proposal yang terasa lebih premium di depan klien besar.",
  },
];

const socialProof = [
  {
    name: "Andi Pratama",
    role: "Desainer Freelance",
    quote:
      "Proposal saya jadi lebih jelas dan klien tidak lagi banyak tanya soal scope. Approval terasa lebih cepat.",
  },
  {
    name: "Sari Dewi",
    role: "Wedding Photographer",
    quote:
      "Invoice jadi lebih profesional dan flow DP sampai pelunasan lebih rapi buat tim maupun klien.",
  },
  {
    name: "Budi Santoso",
    role: "Web Developer",
    quote:
      "Yang paling terasa itu saya tidak lagi mindahin data manual dari chat ke invoice setiap kali closing.",
  },
];

const exportMethods = [
  { name: "WhatsApp", Icon: MessageIcon, desc: "Kirim cepat ke channel yang paling sering dipakai klien." },
  { name: "Email", Icon: MailIcon, desc: "Bawaan terlihat formal untuk project bernilai lebih besar." },
  { name: "Link Share", Icon: LinkIcon, desc: "Praktis untuk review tanpa bolak-balik file versi." },
];

const pricingTiers = [
  {
    name: "Gratis",
    price: "Rp 0",
    period: "selamanya",
    description: "Untuk validasi workflow sebelum pindah penuh ke Artha.",
    features: [
      "3 invoice per bulan",
      "5 proposal per bulan",
      "10 data klien",
      "Template dasar",
    ],
    cta: "Mulai Gratis",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "Rp 50.000",
    period: "/bulan",
    description: "Untuk freelancer yang sudah rutin closing project dan butuh workflow lebih tajam.",
    features: [
      "Invoice & proposal tanpa batas",
      "Data klien tanpa batas",
      "Branding kustom",
      "Pengingat pembayaran",
      "Tanpa watermark",
    ],
    cta: "Pilih Pro",
    href: "/pricing",
    popular: true,
  },
  {
    name: "Bisnis",
    price: "Rp 199.000",
    period: "/bulan",
    description: "Untuk studio kecil atau tim yang perlu konsistensi antar account.",
    features: [
      "Semua fitur Pro",
      "5 anggota tim",
      "Portal klien",
      "Ringkasan pajak",
      "White-label",
    ],
    cta: "Lihat Bisnis",
    href: "/pricing",
    popular: false,
  },
];

const faqs = [
  {
    q: "Apa yang membedakan Artha dari template invoice biasa?",
    a: "Artha bukan hanya template. Kamu punya alur lengkap dari proposal, client records, sampai invoice yang tetap konsisten secara visual dan operasional.",
  },
  {
    q: "Apakah Artha cocok untuk freelancer Indonesia?",
    a: "Ya. Copy, struktur, dan metode pembayaran diprioritaskan untuk kebutuhan freelancer Indonesia, termasuk QRIS dan kanal pembayaran yang familiar di pasar lokal.",
  },
  {
    q: "Kalau saya masih pakai Google Docs atau Excel, apakah migrasinya ribet?",
    a: "Tidak. Kamu bisa mulai dari workflow baru dulu, lalu pindahkan template atau struktur fee yang paling sering dipakai secara bertahap.",
  },
  {
    q: "Apakah klien saya harus membuat akun?",
    a: "Tidak selalu. Dokumen bisa dibagikan lewat format yang ringan seperti link, PDF, email, atau WhatsApp sesuai kebutuhan interaksi dengan klien.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SEOHead
        title="Artha | Proposal & Invoice Builder untuk Freelancer Indonesia"
        description="Artha membantu freelancer Indonesia membuat proposal yang lebih meyakinkan, invoice yang lebih cepat dibayar, dan workflow klien yang lebih rapi."
        canonical="https://arthawork.vercel.app/"
      />

      <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(190_48%_97%)_24%,hsl(var(--background))_100%)] font-sans text-foreground">
        <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={arthaLogo} alt="Artha" className="h-9 w-9 rounded-2xl shadow-sm" />
              <div>
                <p className="text-base font-semibold leading-none">Artha</p>
                <p className="text-xs text-muted-foreground">Proposal & invoice untuk freelancer</p>
              </div>
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Fitur</a>
              <a href="#workflow" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Alur</a>
              <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Harga</a>
              <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
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

        <main>
          <section className="relative overflow-hidden px-4 pb-16 pt-28 md:pb-24 md:pt-36">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[8%] top-20 h-48 w-48 rounded-full bg-primary/8 blur-3xl" />
              <div className="absolute right-[10%] top-24 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl" />
              <div className="absolute bottom-4 left-1/2 h-40 w-[30rem] -translate-x-1/2 rounded-full bg-white/55 blur-3xl" />
            </div>

            <motion.div
              className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <div className="max-w-2xl">
                <motion.div
                  variants={fadeInUp}
                  className="mb-6 inline-flex rounded-full border border-primary/15 bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary shadow-sm"
                >
                  PLATFORM UNTUK FREELANCER INDONESIA
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="max-w-3xl font-heading uppercase text-[2.9rem] font-bold leading-[0.96] tracking-[-0.05em] text-slate-950 sm:text-[3.7rem] lg:text-[4.6rem]"
                >
                  Proposal lebih meyakinkan. Invoice lebih cepat dibayar.
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="mt-6 max-w-xl text-[1.02rem] leading-8 text-slate-600 md:text-[1.12rem]"
                >
                  Artha membantu freelancer, konsultan, dan studio kecil merapikan alur dari brief,
                  proposal, approval, sampai invoice tanpa lagi bergantung pada dokumen yang terasa
                  seadanya.
                </motion.p>

                <motion.div variants={fadeInUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link to="/signup">
                    <Button size="lg" className="min-w-[228px] gap-2 rounded-2xl px-8 font-semibold">
                      Mulai Gratis Sekarang <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="#product-preview">
                    <Button size="lg" variant="outline" className="min-w-[228px] rounded-2xl px-8 font-semibold">
                      Lihat alur produk
                    </Button>
                  </a>
                </motion.div>

                <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-slate-500">
                  <span>Tanpa kartu kredit</span>
                  <span>Setup cepat</span>
                  <span>Siap untuk proposal, invoice, dan alur klien</span>
                </motion.div>

                <motion.ul variants={fadeInUp} className="mt-8 grid gap-3 sm:grid-cols-3">
                  {trustPoints.map((point) => (
                    <li
                      key={point}
                      className="rounded-2xl border border-white/70 bg-white/82 px-4 py-4 text-sm font-medium leading-6 text-slate-700 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.35)] backdrop-blur"
                    >
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      {point}
                    </li>
                  ))}
                </motion.ul>
              </div>

              <motion.div variants={scaleIn} id="product-preview" className="relative mx-auto w-full max-w-[33rem] lg:mx-0">
                <div className="absolute -left-5 top-12 hidden h-28 w-28 rounded-full bg-primary/12 blur-3xl lg:block" />
                <div className="overflow-hidden rounded-[2rem] border border-white/85 bg-white/88 p-4 shadow-[0_42px_110px_-52px_rgba(8,15,24,0.52)] backdrop-blur">
                  <div className="rounded-[1.6rem] border border-slate-800/80 bg-slate-950 p-5 text-white">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/85">PROPOSAL AKTIF</p>
                        <p className="mt-2 text-[1.15rem] font-semibold uppercase tracking-[-0.02em] text-white">Retainer redesign website</p>
                      </div>
                      <div className="rounded-full border border-emerald-300/18 bg-emerald-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                        SIAP DIKIRIM
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/56">RINGKASAN PROPOSAL</p>
                          <p className="mt-2 text-[1.45rem] font-semibold uppercase leading-8 tracking-[-0.03em] text-white">
                            Brand overhaul + sprint landing page
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/6 px-3 py-2 text-right">
                          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">TIMELINE</p>
                          <p className="mt-1 text-sm font-semibold text-white">3 minggu</p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {["Discovery", "Refinement UI", "Handoff invoice"].map((phase) => (
                          <div key={phase} className="rounded-2xl border border-white/8 bg-slate-900/55 px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/60">{phase}</p>
                            <div className="mt-3 h-1.5 rounded-full bg-white/8">
                              <div className="h-1.5 w-2/3 rounded-full bg-cyan-300/80" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
                      <div className="rounded-[1.45rem] border border-cyan-300/20 bg-cyan-400/10 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/74">NILAI PROYEK</p>
                        <p className="mt-2 text-[1.95rem] font-semibold tracking-[-0.03em] text-white">Rp 18.500.000</p>
                        <p className="mt-2 text-sm leading-6 text-white/68">
                          Naikkan proposal ke invoice tanpa bongkar ulang detail proyek.
                        </p>
                      </div>

                      <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">RINGKASAN KLIEN</p>
                        <p className="mt-2 text-base font-semibold text-white">Mitra Studio</p>
                        <p className="mt-1 text-sm leading-6 text-white/68">
                          2 proposal aktif, 4 invoice, 1 retainer ongoing.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {["WhatsApp", "Email", "Link share"].map((item) => (
                            <span key={item} className="rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/78">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </section>

          <section className="px-4 pb-8">
            <div className="mx-auto grid max-w-6xl gap-4 rounded-[2rem] border border-border/70 bg-white/75 p-5 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur md:grid-cols-3 md:p-7">
              {valueMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[1.5rem] border border-border/80 bg-background/80 p-5">
                  <p className="text-[1.8rem] font-semibold tracking-[-0.04em] text-slate-950">{metric.value}</p>
                  <p className="mt-2 text-[0.95rem] leading-6 text-slate-600">{metric.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="px-4 py-16 md:py-24">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <AnimatedSection>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Masalah yang sering terasa</p>
                <h2 className="mt-4 max-w-lg font-heading uppercase text-[2.2rem] font-bold leading-[1.04] tracking-[-0.04em] text-slate-950 md:text-[2.9rem]">
                  Kalau proposal dan invoice terlihat biasa, conversion ikut ikut turun.
                </h2>
                <p className="mt-4 max-w-xl text-[1.02rem] leading-8 text-slate-600">
                  Banyak freelancer sebenarnya tidak kalah di skill. Yang sering kalah justru di
                  cara menyusun offer, meletakkan detail biaya, dan menutup proses pembayaran dengan
                  workflow yang terasa profesional.
                </p>
              </AnimatedSection>

              <motion.div
                className="grid gap-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={staggerContainer}
              >
                {problemCards.map((card) => (
                  <motion.div
                    key={card.title}
                    variants={fadeInUp}
                    className="rounded-[1.6rem] border border-border/80 bg-card/90 p-6 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)]"
                  >
                    <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">{card.title}</h3>
                    <p className="mt-2 text-[0.95rem] leading-7 text-slate-600">{card.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <section id="features" className="px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <AnimatedSection className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Fitur inti</p>
                <h2 className="mt-4 max-w-3xl font-heading uppercase text-[2.2rem] font-bold leading-[1.04] tracking-[-0.04em] text-slate-950 md:text-[2.9rem]">
                  Dirancang untuk menaikkan rasa percaya sebelum klien membuka angka.
                </h2>
                <p className="mt-4 max-w-2xl text-[1.02rem] leading-8 text-slate-600">
                  Bukan sekadar tampilan cantik. Setiap blok di Artha dibuat untuk membantu
                  freelancer menyusun narasi, harga, dan langkah berikutnya dengan lebih jelas.
                </p>
              </AnimatedSection>

              <motion.div
                className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={staggerContainer}
              >
                {features.map((feature) => (
                  <motion.article
                    key={feature.title}
                    variants={fadeInUp}
                    className="rounded-[1.75rem] border border-border/80 bg-white/85 p-6 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.42)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <feature.Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-slate-950">{feature.title}</h3>
                    <p className="mt-2 text-[0.95rem] leading-7 text-slate-600">{feature.description}</p>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </section>

          <section id="workflow" className="bg-muted/35 px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <AnimatedSection className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">ALUR KERJA</p>
                <h2 className="mt-4 font-heading uppercase text-[2.2rem] font-bold leading-[1.04] tracking-[-0.04em] text-slate-950 md:text-[2.9rem]">
                  Dari brief sampai invoice, tanpa putus konteks.
                </h2>
              </AnimatedSection>

              <motion.div
                className="mt-10 grid gap-5 lg:grid-cols-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {workflowSteps.map((step) => (
                  <motion.div
                    key={step.step}
                    variants={fadeInUp}
                    className="rounded-[1.75rem] border border-border/80 bg-card p-6"
                  >
                    <p className="text-sm font-medium tracking-[0.18em] text-primary">{step.step}</p>
                    <h3 className="mt-4 text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950">{step.title}</h3>
                    <p className="mt-3 text-[0.95rem] leading-7 text-slate-600">{step.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <section className="px-4 py-16 md:py-24">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr]">
              <AnimatedSection className="rounded-[2rem] border border-border/80 bg-slate-950 p-7 text-white shadow-[0_40px_100px_-60px_rgba(8,15,24,0.85)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">KENAPA INI LEBIH EFEKTIF</p>
                <h2 className="mt-4 font-heading uppercase text-[2.2rem] font-bold leading-[1.04] tracking-[-0.04em] text-white md:text-[2.9rem]">
                  Dokumen yang rapi bukan bonus. Itu bagian dari proses closing.
                </h2>
                <div className="mt-8 space-y-4">
                  {[
                    "Headline proposal, scope, dan CTA pembayaran disusun dengan hierarchy yang lebih jelas.",
                    "Visual document lebih tenang dan kredibel, jadi pembaca fokus ke nilai project.",
                    "Aksi lanjut seperti kirim link, PDF, email, atau WhatsApp tetap terasa seamless.",
                  ].map((point) => (
                    <div key={point} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <p className="text-[0.95rem] leading-7 text-white/82">{point}</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection variants={fadeIn}>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">USE CASES</p>
                <h2 className="mt-4 font-heading uppercase text-[2.2rem] font-bold leading-[1.04] tracking-[-0.04em] text-slate-950 md:text-[2.9rem]">
                  Cocok untuk banyak pola kerja, bukan satu niche yang sempit.
                </h2>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {audienceCards.map((card) => (
                    <article
                      key={card.title}
                      className="rounded-[1.6rem] border border-border/80 bg-white/85 p-5 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.4)]"
                    >
                      <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">{card.title}</h3>
                      <p className="mt-2 text-[0.95rem] leading-7 text-slate-600">{card.description}</p>
                    </article>
                  ))}
                </div>

                <div className="mt-8 rounded-[1.75rem] border border-primary/10 bg-primary/5 p-5">
                  <p className="text-sm font-semibold text-foreground">
                    Keyword intent yang sengaja dibangun:
                  </p>
                  <p className="mt-2 text-[0.95rem] leading-7 text-slate-600">
                    proposal freelancer Indonesia, invoice profesional, software invoice QRIS,
                    template proposal jasa, proposal branding client, invoice wedding photographer,
                    proposal web developer, dan client workflow untuk studio kecil.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </section>

          <section className="bg-muted/35 px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <AnimatedSection className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">DISTRIBUSI</p>
                <h2 className="mt-4 font-heading uppercase text-[2.2rem] font-bold leading-[1.04] tracking-[-0.04em] text-slate-950 md:text-[2.9rem]">
                  Kirim dokumen lewat channel yang sudah dipakai klienmu.
                </h2>
              </AnimatedSection>

              <motion.div
                className="mt-10 grid gap-5 md:grid-cols-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {exportMethods.map((method) => (
                  <motion.div
                    key={method.name}
                    variants={fadeInUp}
                    className="rounded-[1.6rem] border border-border/80 bg-card p-6 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <method.Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-slate-950">{method.name}</h3>
                    <p className="mt-2 text-[0.95rem] leading-7 text-slate-600">{method.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          <section className="px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <AnimatedSection className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">TESTIMONI</p>
                  <h2 className="mt-4 font-heading uppercase text-[2.2rem] font-bold leading-[1.04] tracking-[-0.04em] text-slate-950 md:text-[2.9rem]">
                    Dipakai untuk membuat first impression yang lebih matang.
                  </h2>
                </div>
                <p className="max-w-xl text-[0.95rem] leading-7 text-slate-600">
                  Social proof tetap penting, tapi saya sengaja tampilkan dengan nada yang lebih
                  realistis supaya tidak terasa seperti halaman SaaS generik.
                </p>
              </AnimatedSection>

              <motion.div
                className="mt-10 grid gap-5 lg:grid-cols-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {socialProof.map((item) => (
                  <motion.blockquote
                    key={item.name}
                    variants={fadeInUp}
                    className="rounded-[1.75rem] border border-border/80 bg-white/90 p-6 shadow-[0_30px_70px_-52px_rgba(15,23,42,0.45)]"
                  >
                    <p className="text-[1.02rem] leading-8 text-foreground/92">"{item.quote}"</p>
                    <footer className="mt-6 border-t border-border/80 pt-4">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.role}</p>
                    </footer>
                  </motion.blockquote>
                ))}
              </motion.div>
            </div>
          </section>

          <section id="pricing" className="px-4 py-16 md:py-24">
            <div className="mx-auto max-w-6xl">
              <AnimatedSection className="text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">HARGA</p>
                  <h2 className="mt-4 font-heading uppercase text-[2.2rem] font-bold leading-[1.04] tracking-[-0.04em] text-slate-950 md:text-[2.9rem]">
                    Mulai gratis. Upgrade saat workflow-mu memang sudah butuh lebih.
                  </h2>
                <p className="mx-auto mt-4 max-w-2xl text-[1.02rem] leading-8 text-slate-600">
                  Harga dibuat mudah dipahami. Tidak ada jargon yang menyembunyikan batasan utama
                  atau membuat user merasa harus nebak fitur penting ada di tier mana.
                </p>
              </AnimatedSection>

              <motion.div
                className="mt-10 grid gap-5 xl:grid-cols-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {pricingTiers.map((tier) => (
                  <motion.article
                    key={tier.name}
                    variants={fadeInUp}
                    className={`rounded-[1.9rem] border p-6 ${
                      tier.popular
                        ? "border-primary/35 bg-slate-950 text-white shadow-[0_38px_100px_-58px_rgba(13,148,136,0.65)]"
                        : "border-border/80 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[1.35rem] font-semibold tracking-[-0.03em]">{tier.name}</h3>
                        <p className={`mt-2 text-[0.95rem] leading-7 ${tier.popular ? "text-white/72" : "text-slate-600"}`}>
                          {tier.description}
                        </p>
                      </div>
                      {tier.popular ? (
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                          Paling dipilih
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-7 flex items-end gap-2">
                      <span className="text-4xl font-semibold tracking-[-0.03em]">{tier.price}</span>
                      <span className={tier.popular ? "pb-1 text-white/70" : "pb-1 text-muted-foreground"}>
                        {tier.period}
                      </span>
                    </div>

                    <ul className="mt-7 space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-3">
                          <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg ${tier.popular ? "bg-white/10 text-cyan-200" : "bg-primary/10 text-primary"}`}>
                            <CheckIcon className="h-3.5 w-3.5" />
                          </span>
                          <span className={`text-[0.95rem] leading-7 ${tier.popular ? "text-white/84" : "text-slate-600"}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link to={tier.href} className="mt-8 block">
                      <Button
                        size="lg"
                        variant={tier.popular ? "default" : "outline"}
                        className={`w-full rounded-2xl ${tier.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                      >
                        {tier.cta}
                      </Button>
                    </Link>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </section>

          <section id="faq" className="bg-muted/35 px-4 py-16 md:py-24">
            <div className="mx-auto max-w-4xl">
              <AnimatedSection className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
                <h2 className="mt-4 font-heading uppercase text-[2.2rem] font-bold leading-[1.04] tracking-[-0.04em] text-slate-950 md:text-[2.9rem]">
                  Hal yang biasanya ditanya sebelum pindah workflow.
                </h2>
              </AnimatedSection>

              <motion.div
                className="mt-10 space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {faqs.map((faq) => (
                  <motion.details
                    key={faq.q}
                    variants={fadeInUp}
                    className="group rounded-[1.6rem] border border-border/80 bg-card p-0"
                  >
                    <summary className="cursor-pointer list-none px-6 py-5 text-left">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-[1.08rem] font-semibold leading-7 tracking-[-0.02em] text-slate-950">{faq.q}</h3>
                        <span className="mt-1 text-sm text-muted-foreground transition-transform group-open:rotate-45">+</span>
                      </div>
                    </summary>
                    <div className="px-6 pb-6 text-[0.95rem] leading-7 text-slate-600">
                      {faq.a}
                    </div>
                  </motion.details>
                ))}
              </motion.div>

              <p className="mt-8 text-center text-xs text-muted-foreground">
                Terakhir diperbarui: 29 April 2026
              </p>
            </div>
          </section>

          <section className="px-4 py-16 md:py-24">
            <AnimatedSection className="mx-auto max-w-4xl rounded-[2.25rem] border border-border/80 bg-slate-950 px-6 py-10 text-center text-white shadow-[0_40px_120px_-70px_rgba(8,15,24,0.95)] md:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">SIAP MULAI</p>
              <h2 className="mt-4 font-heading uppercase text-[2.35rem] font-bold leading-[1.02] tracking-[-0.05em] md:text-[3.8rem]">
                Kalau kamu sudah lelah dengan proposal yang terlihat biasa, Artha layak dicoba.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[0.98rem] leading-8 text-white/74 md:text-[1.05rem]">
                Mulai dari tier gratis untuk melihat apakah workflow, tone, dan struktur dokumennya
                benar-benar cocok dengan cara kamu closing project.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/signup">
                  <Button size="lg" className="min-w-[220px] rounded-2xl">
                    Daftar Gratis
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="min-w-[220px] rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                    Bandingkan paket
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </section>
        </main>

        <footer className="border-t border-border/70 px-4 py-10">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <div className="flex items-center gap-3">
                <img src={arthaLogo} alt="Artha" className="h-9 w-9 rounded-2xl" />
                <div>
                  <p className="font-semibold">Artha</p>
                  <p className="text-sm text-muted-foreground">Proposal & invoice untuk freelancer</p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                Platform untuk freelancer Indonesia yang ingin proposal lebih meyakinkan, invoice lebih
                cepat dibayar, dan workflow klien yang terasa lebih profesional.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/85">Produk</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Fitur</a></li>
                <li><a href="#workflow" className="hover:text-foreground">Alur</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Harga</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/85">Referensi</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Syarat & Ketentuan</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground">Kebijakan Privasi</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/85">Aksi</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li><Link to="/signup" className="hover:text-foreground">Mulai gratis</Link></li>
                <li><Link to="/login" className="hover:text-foreground">Masuk</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Lihat paket</Link></li>
              </ul>
            </div>
          </div>

          <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>&copy; 2026 Artha. All rights reserved.</p>
            <p>Built for Indonesia-first freelance workflows.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

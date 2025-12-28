import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link to="/login">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
                <p className="text-muted-foreground mb-8">Terakhir diperbarui: 29 Desember 2024</p>

                <div className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Penerimaan Ketentuan</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Dengan mengakses dan menggunakan layanan Artha ("Layanan"), Anda menyetujui untuk terikat dengan
                            Ketentuan Layanan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan Layanan kami.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. Deskripsi Layanan</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Artha adalah platform SaaS (Software as a Service) yang menyediakan fitur pembuatan invoice,
                            proposal, dan manajemen klien untuk profesional kreatif dan freelancer di Indonesia.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. Akun Pengguna</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda.</li>
                            <li>Anda harus memberikan informasi yang akurat dan lengkap saat mendaftar.</li>
                            <li>Anda bertanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.</li>
                            <li>Anda harus segera memberitahu kami jika ada penggunaan tidak sah atas akun Anda.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Pembayaran dan Langganan</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Paket berbayar akan ditagih sesuai dengan periode langganan yang dipilih.</li>
                            <li>Semua pembayaran tidak dapat dikembalikan (non-refundable) kecuali dinyatakan lain.</li>
                            <li>Kami berhak mengubah harga dengan pemberitahuan 30 hari sebelumnya.</li>
                            <li>Pembayaran diproses melalui Midtrans dengan metode QRIS, Virtual Account, dan E-Wallet.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">5. Penggunaan yang Dilarang</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">Anda dilarang menggunakan Layanan untuk:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Aktivitas ilegal atau penipuan.</li>
                            <li>Mengirim spam atau konten yang tidak diinginkan.</li>
                            <li>Mengganggu atau merusak infrastruktur Layanan.</li>
                            <li>Mengakses akun pengguna lain tanpa izin.</li>
                            <li>Melanggar hak kekayaan intelektual pihak ketiga.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data dan Privasi</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Penggunaan data pribadi Anda diatur dalam <Link to="/privacy" className="text-primary hover:underline">Kebijakan Privasi</Link> kami.
                            Dengan menggunakan Layanan, Anda menyetujui pengumpulan dan penggunaan data sesuai dengan kebijakan tersebut.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">7. Hak Kekayaan Intelektual</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Semua konten, fitur, dan fungsionalitas Layanan adalah milik Artha dan dilindungi oleh hukum
                            hak cipta, merek dagang, dan hak kekayaan intelektual lainnya.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">8. Batasan Tanggung Jawab</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Artha tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, atau konsekuensial
                            yang timbul dari penggunaan Layanan. Tanggung jawab maksimal kami terbatas pada jumlah yang Anda
                            bayarkan untuk Layanan dalam 12 bulan terakhir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">9. Perubahan Ketentuan</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Kami dapat memperbarui Ketentuan Layanan ini dari waktu ke waktu. Perubahan material akan
                            diberitahukan melalui email atau notifikasi dalam aplikasi setidaknya 30 hari sebelum berlaku efektif.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">10. Hukum yang Berlaku</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Ketentuan Layanan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia.
                            Setiap sengketa akan diselesaikan melalui Badan Arbitrase Nasional Indonesia (BANI).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">11. Hubungi Kami</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Jika Anda memiliki pertanyaan tentang Ketentuan Layanan ini, silakan hubungi kami di:
                        </p>
                        <ul className="list-none text-muted-foreground mt-4 space-y-1">
                            <li>Email: <a href="mailto:support@arthawork.com" className="text-primary hover:underline">support@arthawork.com</a></li>
                            <li>WhatsApp: <a href="https://wa.me/6281234567890" className="text-primary hover:underline">+62 812-3456-7890</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}

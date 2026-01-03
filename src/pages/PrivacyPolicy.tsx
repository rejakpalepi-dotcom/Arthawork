import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
                <h1 className="text-4xl font-bold text-foreground mb-2">Kebijakan Privasi</h1>
                <p className="text-muted-foreground mb-8">Terakhir diperbarui: 29 Desember 2024</p>

                <div className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">1. Pendahuluan</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Artha ("kami", "kita") berkomitmen untuk melindungi privasi Anda. Kebijakan Privasi ini menjelaskan
                            bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat
                            menggunakan layanan kami.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">2. Data yang Kami Kumpulkan</h2>
                        <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.1 Data yang Anda Berikan</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Nama lengkap dan alamat email saat pendaftaran.</li>
                            <li>Informasi bisnis (nama perusahaan, alamat, NPWP).</li>
                            <li>Data klien yang Anda input (nama, kontak, alamat).</li>
                            <li>Konten invoice dan proposal yang Anda buat.</li>
                            <li>Informasi pembayaran untuk langganan.</li>
                        </ul>

                        <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.2 Data yang Dikumpulkan Otomatis</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Alamat IP dan informasi perangkat.</li>
                            <li>Data penggunaan aplikasi dan interaksi.</li>
                            <li>Cookies dan teknologi pelacakan serupa.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">3. Penggunaan Data</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">Kami menggunakan data Anda untuk:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Menyediakan dan memelihara layanan Artha.</li>
                            <li>Memproses pembayaran dan langganan.</li>
                            <li>Mengirim notifikasi terkait layanan.</li>
                            <li>Meningkatkan dan mengembangkan fitur baru.</li>
                            <li>Mencegah penipuan dan aktivitas ilegal.</li>
                            <li>Mematuhi kewajiban hukum.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">4. Berbagi Data</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Kami TIDAK menjual data pribadi Anda. Kami hanya membagikan data dengan:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li><strong>Penyedia layanan:</strong> Supabase (database), Mayar (pembayaran).</li>
                            <li><strong>Analytics:</strong> untuk analisis penggunaan agregat (anonim).</li>
                            <li><strong>Otoritas hukum:</strong> jika diwajibkan oleh hukum.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">5. Keamanan Data</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Kami menerapkan langkah-langkah keamanan industri untuk melindungi data Anda:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                            <li>Enkripsi data saat transit (HTTPS/TLS) dan saat disimpan.</li>
                            <li>Row Level Security (RLS) di database.</li>
                            <li>Autentikasi dua faktor (2FA) tersedia.</li>
                            <li>Audit log untuk aktivitas sensitif.</li>
                            <li>Backup data harian otomatis.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">6. Retensi Data</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Kami menyimpan data Anda selama akun aktif atau sesuai kebutuhan bisnis/hukum.
                            Setelah penghapusan akun, data akan dihapus dalam 30 hari, kecuali data yang
                            diperlukan untuk kepatuhan hukum (misalnya, catatan keuangan untuk keperluan pajak).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">7. Hak Anda</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">Anda memiliki hak untuk:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li><strong>Akses:</strong> Meminta salinan data pribadi Anda.</li>
                            <li><strong>Koreksi:</strong> Memperbaiki data yang tidak akurat.</li>
                            <li><strong>Penghapusan:</strong> Meminta penghapusan data Anda.</li>
                            <li><strong>Portabilitas:</strong> Mengekspor data Anda dalam format standar.</li>
                            <li><strong>Keberatan:</strong> Menolak penggunaan data untuk tujuan tertentu.</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Untuk menggunakan hak-hak ini, hubungi kami di <a href="mailto:privacy@arthawork.com" className="text-primary hover:underline">privacy@arthawork.com</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Kami menggunakan cookies untuk:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                            <li><strong>Essential cookies:</strong> Untuk fungsi dasar aplikasi (login, session).</li>
                            <li><strong>Analytics cookies:</strong> Untuk memahami penggunaan (dapat dinonaktifkan).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">9. Perubahan Kebijakan</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Kami dapat memperbarui Kebijakan Privasi ini. Perubahan material akan diberitahukan
                            melalui email atau notifikasi dalam aplikasi. Penggunaan berkelanjutan setelah perubahan
                            berarti Anda menyetujui kebijakan yang diperbarui.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-4">10. Hubungi Kami</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Untuk pertanyaan terkait privasi, hubungi:
                        </p>
                        <ul className="list-none text-muted-foreground mt-4 space-y-1">
                            <li>Email: <a href="mailto:privacy@arthawork.com" className="text-primary hover:underline">privacy@arthawork.com</a></li>
                            <li>WhatsApp: <a href="https://wa.me/6281285864059" className="text-primary hover:underline">+62 812-8586-4059</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}

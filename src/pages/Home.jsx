import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800">
      {/* Navigasi Atas */}
      <header className="border-b border-slate-100">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/logo_nobg.png"
              alt="Logo SesuaiDompet"
              className="h-8 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            {!loading && user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="flex-1">
        {/* Bagian Pembuka */}
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24 text-center">
          <img
            src="/images/logo_nobg.png"
            alt="Logo SesuaiDompet"
            className="mx-auto mb-6 h-20 w-auto object-contain"
          />
          
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6 leading-tight">
            Pilih Smartphone yang Tepat, <br className="hidden sm:block" />
            <span className="text-emerald-600">Sesuai Budget Anda.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed">
            Sistem Pendukung Keputusan (SPK) berbasis metode <strong>Simple Additive Weighting (SAW)</strong>. 
            Kami membantu Anda menilai dan memeringkat smartphone secara objektif berdasarkan kriteria yang Anda tentukan sendiri.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!loading && user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <span>Lanjut ke Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Mulai Pilih HP</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <hr className="border-slate-100 max-w-5xl mx-auto" />

        {/* Bagian Cara Kerja */}
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Bagaimana Metode SAW Bekerja?</h2>
            <p className="text-slate-600 max-w-2xl">
              Proses perhitungan dilakukan secara sistematis dan transparan. Berikut adalah langkah-langkah yang dilakukan oleh sistem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Tentukan Alternatif & Kriteria</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Anda memasukkan daftar smartphone (alternatif) dan kriteria penilaian seperti Harga, RAM, Kamera, Baterai, dan Prosesor.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Berikan Bobot Kepentingan</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Setiap kriteria diberikan bobot sesuai prioritas Anda. Sistem akan menormalisasi bobot tersebut agar totalnya menjadi 1 (100%).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Normalisasi Nilai (Benefit & Cost)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Nilai spesifikasi asli diubah ke skala yang seragam. Untuk kriteria <em>Cost</em> (seperti harga), nilai terkecil menjadi yang terbaik. Untuk <em>Benefit</em> (seperti RAM), nilai terbesar yang terbaik.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Perangkingan Akhir</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sistem mengalikan nilai normalisasi dengan bobot kriteria dan menjumlahkannya (Nilai Preferensi V). Nilai tertinggi menjadi rekomendasi terbaik.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bagian Rumus Matematis */}
        <div className="bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Dasar Perhitungan Matematis</h2>
              <p className="text-slate-600">Rumus standar metode SAW yang diterapkan pada sistem ini.</p>
            </div>

            <div className="space-y-10 max-w-3xl mx-auto">
              
              {/* Rumus 1 - Polos tanpa kotak berwarna */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                  1. Normalisasi Matriks Keputusan (r<sub>ij</sub>)
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Dilakukan untuk mengubah nilai dari berbagai kriteria menjadi nilai yang dapat dibandingkan pada skala yang sama.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block mb-1">Kriteria Benefit</span>
                    <div className="font-mono text-slate-800 my-2 text-sm">
                      r<sub>ij</sub> = X<sub>ij</sub> / Max(X<sub>ij</sub>)
                    </div>
                    <p className="text-sm text-slate-500">Semakin besar nilai aslinya, semakin baik (Contoh: RAM, Kamera, Baterai).</p>
                  </div>

                  <div>
                    <span className="text-sm font-bold text-slate-800 block mb-1">Kriteria Cost</span>
                    <div className="font-mono text-slate-800 my-2 text-sm">
                      r<sub>ij</sub> = Min(X<sub>ij</sub>) / X<sub>ij</sub>
                    </div>
                    <p className="text-sm text-slate-500">Semakin kecil nilai aslinya, semakin baik (Contoh: Harga).</p>
                  </div>
                </div>
              </div>

              {/* Rumus 2 - Polos tanpa kotak berwarna */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                  2. Nilai Preferensi Akhir (V<sub>i</sub>)
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Menghitung nilai akhir dengan mengalikan matriks normalisasi dengan bobot kriteria, lalu menjumlahkannya.
                </p>
                
                <div>
                  <div className="font-mono text-slate-800 my-3 text-base">
                    V<sub>i</sub> = Σ ( W<sub>j</sub> × r<sub>ij</sub> )
                  </div>
                  <ul className="text-sm text-slate-600 space-y-1 mb-4">
                    <li><strong className="text-slate-800">V<sub>i</sub></strong> = Nilai preferensi alternatif ke-i.</li>
                    <li><strong className="text-slate-800">W<sub>j</sub></strong> = Bobot kriteria ke-j.</li>
                    <li><strong className="text-slate-800">r<sub>ij</sub></strong> = Nilai normalisasi alternatif ke-i pada kriteria ke-j.</li>
                  </ul>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Nilai V tertinggi menunjukkan alternatif smartphone terbaik.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} SesuaiDompet. SPK Pemilihan Smartphone.
        </p>
      </footer>
    </div>
  );
}
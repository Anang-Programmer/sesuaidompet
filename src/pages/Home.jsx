import { useState } from 'react';
import { Link } from 'react-router-dom';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
  ArrowRight,
  BatteryCharging,
  Bot,
  Calculator,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  History,
  LayoutDashboard,
  LogIn,
  Menu,
  Mic,
  Scale,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  UserPlus,
  Wallet,
  X,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

/* =========================================
   DATA KONTEN
========================================= */

const NAV_LINKS = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#kriteria', label: 'Kriteria' },
  { href: '#metode', label: 'Metode SAW' },
  { href: '#faq', label: 'FAQ' },
];

const HIGHLIGHTS = [
  { value: '6', label: 'Kriteria penilaian', detail: 'Harga, kamera, RAM, baterai, memori, AnTuTu' },
  { value: '7', label: 'Langkah perhitungan', detail: 'Dari penentuan kriteria hingga ranking' },
  { value: 'AI', label: 'Asisten SEDO AI', detail: 'Chat & percakapan suara interaktif' },
  { value: '100%', label: 'Transparan', detail: 'Setiap angka dapat ditelusuri ulang' },
];

const FEATURES = [
  {
    icon: Bot,
    title: 'SEDO AI Assistant',
    description:
      'Sebutkan nama smartphone, AI otomatis mengumpulkan enam spesifikasi dan menyiapkannya untuk dihitung.',
    tag: 'AI',
  },
  {
    icon: Mic,
    title: 'Mode Live Suara',
    description:
      'Bercakap dua arah dengan SEDO AI menggunakan suara, lengkap dengan transkrip dan animasi real-time.',
    tag: 'Baru',
  },
  {
    icon: Scale,
    title: 'Bandingkan Berdampingan',
    description:
      'Pilih beberapa smartphone dan lihat perbedaan spesifikasi serta skor SAW dalam satu tampilan.',
  },
  {
    icon: Calculator,
    title: 'Perhitungan Transparan',
    description:
      'Matriks keputusan, normalisasi, hingga nilai preferensi ditampilkan langkah demi langkah.',
  },
  {
    icon: Wallet,
    title: 'Filter Sesuai Budget',
    description:
      'Batasi alternatif berdasarkan anggaran agar rekomendasi benar-benar sesuai isi dompet.',
  },
  {
    icon: History,
    title: 'Riwayat Tersimpan',
    description:
      'Simpan snapshot hasil perhitungan untuk ditinjau kembali atau dijadikan bahan pertimbangan.',
  },
];

const STEPS = [
  {
    icon: Database,
    title: 'Pilih alternatif',
    description: 'Ambil smartphone dari database atau tambahkan lewat SEDO AI.',
  },
  {
    icon: ClipboardCheck,
    title: 'Lengkapi penilaian',
    description: 'Pastikan keenam nilai kriteria setiap smartphone sudah terisi.',
  },
  {
    icon: Calculator,
    title: 'Hitung dengan SAW',
    description: 'Sistem menormalisasi nilai dan menghitung skor preferensi.',
  },
  {
    icon: Trophy,
    title: 'Dapatkan rekomendasi',
    description: 'Lihat peringkat akhir dan simpan hasilnya ke riwayat.',
  },
];

const CRITERIA = [
  { code: 'C1', name: 'Harga', unit: 'Rupiah', type: 'cost', weight: 0.229, icon: Wallet },
  { code: 'C2', name: 'Kamera Utama', unit: 'MP', type: 'benefit', weight: 0.077, icon: Camera },
  { code: 'C3', name: 'RAM', unit: 'GB', type: 'benefit', weight: 0.265, icon: Cpu },
  { code: 'C4', name: 'Baterai', unit: 'mAh', type: 'benefit', weight: 0.177, icon: BatteryCharging },
  { code: 'C5', name: 'Penyimpanan', unit: 'GB', type: 'benefit', weight: 0.152, icon: HardDrive },
  { code: 'C6', name: 'Prosesor (AnTuTu)', unit: 'Skor', type: 'benefit', weight: 0.1, icon: Gauge },
];

const SAMPLE_RANKING = [
  { rank: 1, name: 'Realme C55', price: 'Rp2.199.000', score: 0.9051 },
  { rank: 2, name: 'Oppo A77s', price: 'Rp1.637.090', score: 0.855 },
  { rank: 3, name: 'Samsung Galaxy A54', price: 'Rp5.999.000', score: 0.7406 },
];

const FAQS = [
  {
    q: 'Apa itu metode Simple Additive Weighting (SAW)?',
    a: 'SAW adalah metode penjumlahan terbobot. Nilai setiap alternatif pada tiap kriteria dinormalisasi, dikalikan bobot kriteria, lalu dijumlahkan. Alternatif dengan nilai preferensi tertinggi menjadi rekomendasi terbaik.',
  },
  {
    q: 'Mengapa harga termasuk kriteria cost?',
    a: 'Karena semakin murah harga, semakin baik bagi pengguna. Kriteria cost dinormalisasi dengan membagi nilai minimum terhadap nilai alternatif, sedangkan kriteria benefit membagi nilai alternatif terhadap nilai maksimum.',
  },
  {
    q: 'Bagaimana SEDO AI memperoleh spesifikasi smartphone?',
    a: 'SEDO AI terlebih dahulu mencocokkan nama smartphone dengan database. Jika belum tersedia, AI mencari referensi spesifikasi dari web, lalu menampilkannya dalam formulir yang tetap bisa kamu periksa dan ubah sebelum dihitung.',
  },
  {
    q: 'Apakah saya bisa menyimpan hasil perhitungan?',
    a: 'Bisa. Setelah perhitungan selesai, hasil beserta bobot dan rincian matriksnya dapat disimpan ke halaman Riwayat Perhitungan pada akunmu.',
  },
];

/* =========================================
   KOMPONEN PENDUKUNG
========================================= */

function Formula({ tex, display = false, className = '' }) {
  const html = katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
  });

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function SectionHeader({ eyebrow, title, description, center = false }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      
      <h2 className="mt-4 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-[#183b29] sm:text-[34px]">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-7 text-[#68796d] sm:text-[15px]">
          {description}
        </p>
      )}
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#a9e9b5]/45 blur-3xl" />
      <div className="absolute -bottom-12 -left-10 h-56 w-56 rounded-full bg-[#c9efd0]/70 blur-3xl" />

      {/* Jendela aplikasi */}
      <div className="relative overflow-hidden rounded-[26px] border border-[#dfeae1] bg-white shadow-[0_30px_80px_rgba(24,72,40,0.16)]">
        <div className="flex items-center gap-2 border-b border-[#edf2ed] bg-[#f8fbf8] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f1b7ae]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f3dc9b]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#a9dcb5]" />
          <span className="ml-3 truncate rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-[#8a988d] ring-1 ring-[#e6eee7]">
            sesuaidompet / hasil-rekomendasi
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {/* Juara */}
          <div className="rounded-2xl bg-gradient-to-br from-[#143f2b] via-[#1a5a3a] to-[#26884b] p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-bold text-[#d6f7dc] ring-1 ring-white/15">
                <Trophy size={12} />
                Rekomendasi Terbaik
              </span>
              <span className="text-[11px] font-semibold text-white/60">Metode SAW</span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/20">
                  <Smartphone size={24} strokeWidth={1.6} />
                </span>
                <div>
                  <p className="text-lg font-extrabold leading-tight">Realme C55</p>
                  <p className="text-xs text-white/70">Rp2.199.000 · 8/256 GB</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/60">Nilai V</p>
                <p className="font-mono text-2xl font-extrabold text-[#b9f3c5]">0,9051</p>
              </div>
            </div>
          </div>

          {/* Ranking */}
          <div className="mt-5">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#2a4a34]">Peringkat alternatif</span>
              <span className="text-[11px] font-semibold text-[#8a988d]">3 smartphone</span>
            </div>
            <div className="space-y-2">
              {SAMPLE_RANKING.map((row) => (
                <div
                  key={row.rank}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    row.rank === 1
                      ? 'border-[#cfe4d3] bg-[#f0f8f1]'
                      : 'border-[#edf2ed] bg-white'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold ${
                      row.rank === 1 ? 'bg-[#287b44] text-white' : 'bg-[#eef3ee] text-[#6b7b6e]'
                    }`}
                  >
                    #{row.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-extrabold text-[#2f4f39]">{row.name}</p>
                      <p className="font-mono text-xs font-extrabold text-[#287b44]">
                        {row.score.toFixed(4).replace('.', ',')}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#ebf2ec]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#26884b] to-[#5ac779]"
                        style={{ width: `${row.score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Kartu mengambang */}
      <div className="absolute -left-6 top-1/3 hidden rounded-2xl border border-[#e2ece3] bg-white px-4 py-3 shadow-[0_14px_35px_rgba(24,72,40,0.12)] md:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f5eb] text-[#2d8a4e]">
            <Bot size={18} />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-[#8a988d]">SEDO AI</p>
            <p className="text-xs font-extrabold text-[#2a4a34]">Spesifikasi terisi otomatis</p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 right-4 hidden rounded-2xl border border-[#e2ece3] bg-white px-4 py-3 shadow-[0_14px_35px_rgba(24,72,40,0.12)] sm:block">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#2d8a4e]" />
          <span className="text-xs font-extrabold text-[#2a4a34]">6 kriteria · bobot terukur</span>
        </div>
      </div>
    </div>
  );
}

function AiChatMockup() {
  return (
    <div className="relative rounded-[24px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2ca458] to-[#166034]">
          <Bot size={18} />
        </span>
        <div>
          <p className="text-sm font-extrabold">SEDO AI</p>
          <p className="text-[11px] text-[#a7c9b0]">Asisten SesuaiDompet</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#3caf62]/20 px-2.5 py-1 text-[11px] font-bold text-[#a9f0b8]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ee18d]" />
          Online
        </span>
      </div>

      <div className="mt-5 space-y-3 text-[13px]">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[#2ea458] px-4 py-2.5 font-semibold text-white">
          Bandingkan Oppo A77s dengan Realme C55 dong
        </div>

        <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-white/90">
          Saya menemukan 2 smartphone. Berikut spesifikasi enam kriterianya, kamu bisa mengubah angkanya sebelum dihitung.
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { name: 'Oppo A77s', spec: '8/128 GB · 5000 mAh' },
              { name: 'Realme C55', spec: '8/256 GB · 4880 mAh' },
            ].map((p) => (
              <div key={p.name} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-xs font-extrabold text-white">{p.name}</p>
                <p className="mt-0.5 text-[11px] text-[#a7c9b0]">{p.spec}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[#3caf62]/40 bg-[#3caf62]/15 px-4 py-3 text-white/95">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#a9f0b8]">
            <Trophy size={13} />
            Hasil SAW
          </span>
          <p className="mt-1">
            <strong>Realme C55</strong> unggul berkat penyimpanan dan skor AnTuTu yang lebih tinggi.
          </p>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  return (
    <details className="group rounded-2xl border border-[#e1ebe2] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(24,67,38,0.03)] transition open:border-[#c5e2cb] open:shadow-[0_10px_26px_rgba(24,67,38,0.06)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-[#25462f] [&::-webkit-details-marker]:hidden">
        {q}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#edf6ef] text-[#2d8a4e] transition group-open:rotate-180">
          <ChevronDown size={15} />
        </span>
      </summary>
      <p className="mt-3 text-[13px] leading-6 text-[#6c7d71]">{a}</p>
    </details>
  );
}

/* =========================================
   HALAMAN UTAMA
========================================= */

export default function Home() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = !loading && Boolean(user);

  const primaryCta = isLoggedIn
    ? { to: '/dashboard', label: 'Buka Dashboard', icon: LayoutDashboard }
    : { to: '/register', label: 'Mulai Gratis', icon: ArrowRight };

  const PrimaryIcon = primaryCta.icon;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f8f4] text-[#193a29]">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-[#e3ece4] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-7">
          <Link to="/" aria-label="SesuaiDompet - Beranda" className="shrink-0">
            <img
              src="/images/logo_nobg.png"
              alt="SesuaiDompet"
              className="h-11 w-auto max-w-[165px] object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi beranda">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#5d7163] transition hover:bg-[#eef6ef] hover:text-[#21803f]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 sm:flex">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="sd-button-dark inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold"
              >
                Dashboard
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#4d6553] transition hover:bg-[#eef6ef] hover:text-[#21803f]"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="sd-button-dark inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold"
                >
                  <UserPlus size={15} />
                  Daftar
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e1ebe2] bg-white text-[#2d5a3a] lg:hidden"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#e3ece4] bg-white px-5 pb-5 pt-3 lg:hidden">
            <nav className="flex flex-col" aria-label="Navigasi beranda seluler">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#4d6553] hover:bg-[#eef6ef]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="sd-button-dark col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="sd-button-light inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="sd-button-dark inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-extrabold"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ================= HERO ================= */}
        <section
          className="relative overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 85% 30%, rgba(188,235,196,0.55), transparent 40%), radial-gradient(ellipse at 5% 0%, rgba(215,241,219,0.8), transparent 42%), linear-gradient(135deg, #f3f9f3 0%, #eaf5ec 55%, #f6faf6 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'linear-gradient(#dcebdf 1px, transparent 1px), linear-gradient(90deg, #dcebdf 1px, transparent 1px)',
              backgroundSize: '44px 44px',
              maskImage: 'radial-gradient(ellipse at 30% 20%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at 30% 20%, black 20%, transparent 70%)',
            }}
          />

          <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-20 pt-14 sm:px-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-28 lg:pt-20">
            <div className="max-w-[600px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe5d2] bg-white/80 py-1.5 pl-1.5 pr-3.5 text-xs font-bold text-[#35834d] shadow-sm backdrop-blur">
                <span className="rounded-full bg-[#26884b] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  SPK
                </span>
                Metode Simple Additive Weighting + AI Assistant
              </span>

              <h1 className="mt-6 text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#163826] sm:text-5xl lg:text-[58px]">
                Keputusan cerdas memilih smartphone,{' '}
                <span className="bg-gradient-to-r from-[#21834a] to-[#48b96a] bg-clip-text text-transparent">
                  sesuai dompetmu.
                </span>
              </h1>

              <p className="mt-6 max-w-[540px] text-[15px] leading-8 text-[#60746a] sm:text-base">
                SesuaiDompet membantu kamu membandingkan smartphone secara objektif
                berdasarkan enam kriteria terukur. Setiap rekomendasi dihitung dengan
                metode SAW dan dapat ditelusuri hingga ke angka terakhir.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to={primaryCta.to}
                  className="inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#26884b] to-[#3caf62] px-6 py-3 text-sm font-extrabold !text-white shadow-[0_12px_28px_rgba(38,136,75,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(38,136,75,0.32)]"
                >
                  {primaryCta.label}
                  <PrimaryIcon size={17} />
                </Link>

                {isLoggedIn ? (
                  <Link
                    to="/sedo-ai"
                    className="inline-flex min-h-[50px] items-center gap-2 rounded-xl border border-[#d5e5d8] bg-white/90 px-6 py-3 text-sm font-bold text-[#2d5a3a] shadow-sm transition hover:-translate-y-0.5 hover:border-[#aad5b4]"
                  >
                    <Bot size={16} />
                    Tanya SEDO AI
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex min-h-[50px] items-center gap-2 rounded-xl border border-[#d5e5d8] bg-white/90 px-6 py-3 text-sm font-bold text-[#2d5a3a] shadow-sm transition hover:-translate-y-0.5 hover:border-[#aad5b4]"
                  >
                    <LogIn size={16} />
                    Saya sudah punya akun
                  </Link>
                )}
              </div>

              <ul className="mt-9 grid max-w-[520px] grid-cols-1 gap-3 text-[13px] font-semibold text-[#5f7465] sm:grid-cols-3">
                {['Perhitungan sistematis', 'Bobot kriteria terukur', 'Hasil siap disimpan'].map(
                  (item) => (
                    <li key={item} className="inline-flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0 text-[#2f9a55]" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            <HeroMockup />
          </div>
        </section>

        {/* ================= HIGHLIGHTS ================= */}
        <section className="relative z-10 border-y border-[#e1ebe2] bg-white">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 px-5 sm:px-7 lg:grid-cols-4">
            {HIGHLIGHTS.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-3 py-3 sm:px-5 sm:py-3.5 ${index % 2 === 1 ? 'border-l border-[#edf2ed]' : ''} ${
                  index >= 2 ? 'border-t border-[#edf2ed] lg:border-t-0' : ''
                } ${index === 2 ? 'lg:border-l' : ''}`}
              >
                <p className="shrink-0 bg-gradient-to-r from-[#21834a] to-[#48b96a] bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl">
                  {item.value}
                </p>
                <div className="min-w-0">
                  <p className="truncate text-xs font-extrabold text-[#25462f] sm:text-[13px]">{item.label}</p>
                  <p className="truncate text-[11px] text-[#869489]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= FITUR ================= */}
        <section id="fitur" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 py-20 sm:px-7 lg:py-28">
          <SectionHeader
            center
            eyebrow="Fitur Utama"
            title="Semua yang kamu butuhkan untuk memilih dengan yakin"
            description="Dari pengumpulan data hingga rekomendasi akhir, setiap tahap dirancang agar mudah dipahami dan dapat dipertanggungjawabkan."
          />

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description, tag }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-[22px] border border-[#e1ebe2] bg-white p-6 shadow-[0_6px_20px_rgba(24,67,38,0.035)] transition duration-200 hover:-translate-y-1 hover:border-[#c5e2cb] hover:shadow-[0_18px_38px_rgba(24,67,38,0.08)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#eff8f0] opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="relative flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8f5eb] to-[#d6eedc] text-[#2a874b]">
                    <Icon size={22} />
                  </span>
                  {tag && (
                    <span className="rounded-full bg-[#26884b] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
                      {tag}
                    </span>
                  )}
                </div>
                <h3 className="relative mt-5 text-base font-extrabold text-[#223f2c]">{title}</h3>
                <p className="relative mt-2 text-[13px] leading-6 text-[#6f8074]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ================= CARA KERJA ================= */}
        <section id="cara-kerja" className="scroll-mt-24 border-y border-[#e2ece3] bg-white">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-7 lg:py-24">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <SectionHeader
                eyebrow="Cara Kerja"
                title="Empat langkah menuju rekomendasi terbaik"
                description="Alur kerja yang ringkas, baik kamu memulai dari database maupun langsung bertanya kepada SEDO AI."
              />
              <Link
                to={isLoggedIn ? '/perhitungan' : '/register'}
                className="inline-flex items-center gap-2 self-start text-sm font-extrabold text-[#26884b] hover:underline lg:self-auto"
              >
                {isLoggedIn ? 'Lihat proses perhitungan' : 'Coba sekarang'}
                <ArrowRight size={16} />
              </Link>
            </div>

            <ol className="relative mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pointer-events-none absolute left-[12%] right-[12%] top-7 hidden h-px bg-gradient-to-r from-transparent via-[#cfe4d3] to-transparent lg:block" />
              {STEPS.map(({ icon: Icon, title, description }, index) => (
                <li key={title} className="relative rounded-[22px] border border-[#e6eee7] bg-[#fafcfa] p-6">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#2a874b] shadow-[0_6px_18px_rgba(24,67,38,0.08)] ring-1 ring-[#e1ebe2]">
                      <Icon size={23} />
                      <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#26884b] text-[11px] font-extrabold text-white ring-2 ring-white">
                        {index + 1}
                      </span>
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-extrabold text-[#223f2c]">{title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-[#6f8074]">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ================= KRITERIA ================= */}
        <section id="kriteria" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 py-20 sm:px-7 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <SectionHeader
                eyebrow="Kriteria & Bobot"
                title="Enam kriteria yang menentukan nilai sebuah smartphone"
                description="Setiap kriteria memiliki bobot kepentingan. Kriteria cost bernilai lebih baik jika semakin kecil, sedangkan kriteria benefit lebih baik jika semakin besar."
              />

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#f0dfc3] bg-[#fffaf0] p-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#a9782e]">Cost</span>
                  <p className="mt-1.5 text-[13px] leading-5 text-[#8a7243]">Semakin rendah, semakin baik. Contoh: harga.</p>
                </div>
                <div className="rounded-2xl border border-[#d2e9d6] bg-[#eef8f0] p-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2c7944]">Benefit</span>
                  <p className="mt-1.5 text-[13px] leading-5 text-[#4f7259]">Semakin tinggi, semakin baik. Contoh: RAM.</p>
                </div>
              </div>

              <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#869489]">
                <Settings2 size={14} className="mt-0.5 shrink-0 text-[#2f9a55]" />
                Bobot di samping adalah bobot default sistem dan dapat disesuaikan oleh administrator.
              </p>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-[#e1ebe2] bg-white shadow-[0_14px_40px_rgba(24,67,38,0.06)]">
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[#edf2ed] bg-[#f8fbf8] px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-[#7d8d81]">
                <span>Kriteria</span>
                <span>Bobot</span>
              </div>
              <ul className="divide-y divide-[#f0f4f0]">
                {CRITERIA.map(({ code, name, unit, type, weight, icon: Icon }) => (
                  <li key={code} className="flex items-center gap-4 px-5 py-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5eb] text-[#2a874b]">
                      <Icon size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#f0f5f0] px-1.5 py-0.5 text-[11px] font-extrabold text-[#6f8274]">
                          {code}
                        </span>
                        <span className="text-sm font-extrabold text-[#25462f]">{name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            type === 'cost'
                              ? 'bg-[#fff4e2] text-[#a9782e]'
                              : 'bg-[#e6f5ea] text-[#2c7944]'
                          }`}
                        >
                          {type}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#edf3ee]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#26884b] to-[#5ac779]"
                            style={{ width: `${(weight / 0.265) * 100}%` }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right text-[11px] font-semibold text-[#94a197]">
                          {unit}
                        </span>
                      </div>
                    </div>
                    <span className="w-14 shrink-0 text-right font-mono text-sm font-extrabold text-[#287b44]">
                      {(weight * 100).toFixed(1).replace('.', ',')}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= METODE SAW ================= */}
        <section id="metode" className="scroll-mt-24 border-y border-[#e2ece3] bg-white">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-7 lg:py-24">
            <SectionHeader
              center
              eyebrow="Metode SAW"
              title="Tujuh langkah perhitungan yang jelas dan dapat diverifikasi"
              description="Simple Additive Weighting memproses data melalui tujuh tahapan terstruktur, mulai dari penentuan alternatif hingga perangkingan rekomendasi terbaik."
            />

            {/* Langkah 1 - 4 */}
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-[22px] border border-[#e1ebe2] bg-[#f8fbf8] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2c7944]">
                    Langkah 01
                  </span>
                  <span className="rounded-lg bg-[#e8f5eb] px-2 py-0.5 text-[11px] font-extrabold text-[#2a874b]">
                    Input
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-extrabold text-[#223f2c]">
                  Alternatif &amp; Kriteria
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-[#6f8074]">
                  Menyiapkan minimal 2 smartphone dengan spesifikasi lengkap serta 6 kriteria bertipe cost atau benefit.
                </p>
              </article>

              <article className="rounded-[22px] border border-[#e1ebe2] bg-[#f8fbf8] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2c7944]">
                    Langkah 02
                  </span>
                  <span className="rounded-lg bg-[#e8f5eb] px-2 py-0.5 text-[11px] font-extrabold text-[#2a874b]">
                    Bobot
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-extrabold text-[#223f2c]">
                  Normalisasi Bobot
                </h3>
                <div className="mt-3 overflow-x-auto rounded-xl border border-[#e1ebe2] bg-white px-3 py-2.5 text-xs text-[#1f4a30]">
                  <Formula display tex="\sum_{j=1}^{n} w_j = 1" />
                </div>
                <p className="mt-2.5 text-[13px] leading-6 text-[#6f8074]">
                  Menyamakan total proporsi bobot kepentingan seluruh kriteria menjadi tepat 1.
                </p>
              </article>

              <article className="rounded-[22px] border border-[#e1ebe2] bg-[#f8fbf8] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2c7944]">
                    Langkah 03
                  </span>
                  <span className="rounded-lg bg-[#e8f5eb] px-2 py-0.5 text-[11px] font-extrabold text-[#2a874b]">
                    Matriks X
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-extrabold text-[#223f2c]">
                  Matriks Keputusan
                </h3>
                <div className="mt-3 overflow-x-auto rounded-xl border border-[#e1ebe2] bg-white px-3 py-2.5 text-xs text-[#1f4a30]">
                  <Formula display tex="X = [x_{ij}]" />
                </div>
                <p className="mt-2.5 text-[13px] leading-6 text-[#6f8074]">
                  Menyusun nilai asli setiap alternatif smartphone pada keenam kriteria ke dalam tabel matriks.
                </p>
              </article>

              <article className="rounded-[22px] border border-[#e1ebe2] bg-[#f8fbf8] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2c7944]">
                    Langkah 04
                  </span>
                  <span className="rounded-lg bg-[#e8f5eb] px-2 py-0.5 text-[11px] font-extrabold text-[#2a874b]">
                    Acuan
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-extrabold text-[#223f2c]">
                  Nilai Max &amp; Min
                </h3>
                <div className="mt-3 overflow-x-auto rounded-xl border border-[#e1ebe2] bg-white px-3 py-2.5 text-xs text-[#1f4a30]">
                  <Formula display tex="\max_i x_{ij} \;\;/\;\; \min_i x_{ij}" />
                </div>
                <p className="mt-2.5 text-[13px] leading-6 text-[#6f8074]">
                  Menentukan nilai maksimum untuk kriteria benefit dan minimum untuk kriteria cost.
                </p>
              </article>
            </div>

            {/* Langkah 5 - 7 */}
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <article className="rounded-[22px] border border-[#e1ebe2] bg-[#f8fbf8] p-6">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2c7944]">
                  Langkah 05 · Normalisasi Matriks (R)
                </span>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="overflow-x-auto rounded-2xl border border-[#e1ebe2] bg-white px-4 py-3 text-[#1f4a30]">
                    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2c7944]">
                      Benefit
                    </p>
                    <Formula display tex="r_{ij} = \dfrac{x_{ij}}{\max_i x_{ij}}" />
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-[#e1ebe2] bg-white px-4 py-3 text-[#1f4a30]">
                    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#a9782e]">
                      Cost
                    </p>
                    <Formula display tex="r_{ij} = \dfrac{\min_i x_{ij}}{x_{ij}}" />
                  </div>
                </div>
                <p className="mt-4 text-[13px] leading-6 text-[#6f8074]">
                  Mengubah seluruh nilai kriteria ke skala seragam 0 sampai 1 agar dapat dibandingkan secara adil.
                </p>
              </article>

              <article className="rounded-[22px] border border-[#e1ebe2] bg-[#f8fbf8] p-6">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2c7944]">
                  Langkah 06 · Nilai Preferensi (V)
                </span>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-[#e1ebe2] bg-white px-4 py-6 text-[#1f4a30]">
                  <Formula display tex="V_i = \sum_{j=1}^{n} w_j \, r_{ij}" />
                </div>
                <p className="mt-4 text-[13px] leading-6 text-[#6f8074]">
                  Mengalikan setiap nilai ternormalisasi <Formula tex="r_{ij}" /> dengan bobot kriteria <Formula tex="w_j" />, lalu menjumlahkannya untuk memperoleh skor akhir setiap smartphone.
                </p>
              </article>

              <article className="flex flex-col justify-between rounded-[22px] border border-[#cfe4d3] bg-gradient-to-br from-[#eef8f0] to-[#f8fbf8] p-6">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2c7944]">
                    Langkah 07 · Perangkingan Akhir
                  </span>
                  <div className="mt-4 rounded-2xl border border-[#cfe4d3] bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#26884b] text-white">
                        <Trophy size={20} />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold text-[#223f2c]">
                          Rekomendasi Terbaik
                        </p>
                        <p className="text-[12px] text-[#6f8074]">
                          Urutan berdasarkan nilai <Formula tex="V_i" /> tertinggi
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-[13px] leading-6 text-[#6f8074]">
                    Alternatif diurutkan dari skor <Formula tex="V_i" /> terbesar. Jika skor sama, harga lebih terjangkau menjadi penentu peringkat pertama.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#e7f4e9] px-3.5 py-2.5 text-xs font-bold text-[#2c7944]">
                  <CheckCircle2 size={15} className="shrink-0" />
                  Peringkat 1 siap disimpan ke riwayat
                </div>
              </article>
            </div>

            <div className="mt-6 grid gap-3 rounded-[20px] border border-[#e1ebe2] bg-[#fafcfa] p-5 text-[13px] text-[#5f7465] sm:grid-cols-3">
              <p><strong className="font-extrabold text-[#25462f]"><Formula tex="x_{ij}" />:</strong> nilai alternatif ke-<em>i</em> pada kriteria ke-<em>j</em></p>
              <p><strong className="font-extrabold text-[#25462f]"><Formula tex="w_j" />:</strong> bobot kriteria ke-<em>j</em> (total bobot = 1)</p>
              <p><strong className="font-extrabold text-[#25462f]"><Formula tex="r_{ij}" />:</strong> nilai ternormalisasi pada rentang 0 sampai 1</p>
            </div>
          </div>
        </section>

        {/* ================= SEDO AI ================= */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2f1f] via-[#164a30] to-[#1f6f40] text-white">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#3caf62]/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-[#5ee18d]/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-20 sm:px-7 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#b9f3c5]">
                <Sparkles size={13} />
                SEDO AI
              </span>
              <h2 className="mt-5 text-[28px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[36px]">
                Cukup sebutkan nama HP-nya, biar SEDO AI yang menyiapkan datanya.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-7 text-[#c3dccb]">
                Tidak perlu mencari spesifikasi satu per satu. SEDO AI mengenali smartphone yang
                kamu sebutkan, melengkapi data enam kriteria, menghitung SAW, lalu menjelaskan
                alasan rekomendasinya dalam bahasa yang mudah dipahami.
              </p>

              <ul className="mt-7 space-y-3 text-sm">
                {[
                  'Ekstraksi nama smartphone dari kalimat bebas',
                  'Spesifikasi dapat diperiksa dan diedit sebelum dihitung',
                  'Mode Live: percakapan suara dua arah ala asisten virtual',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#7ee39b]" />
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={isLoggedIn ? '/sedo-ai' : '/register'}
                className="sd-button-light mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold !text-[#1a5a36] shadow-lg transition hover:-translate-y-0.5"
              >
                <Bot size={17} />
                {isLoggedIn ? 'Mulai chat dengan SEDO AI' : 'Daftar untuk mencoba'}
              </Link>
            </div>

            <AiChatMockup />
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section id="faq" className="scroll-mt-24 border-t border-[#e2ece3] bg-white">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 sm:px-7 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
            <SectionHeader
              eyebrow="FAQ"
              title="Pertanyaan yang sering diajukan"
              description="Belum menemukan jawabanmu? Tanyakan langsung kepada SEDO AI setelah masuk ke akun."
            />
            <div className="space-y-3">
              {FAQS.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="border-t border-[#cfe4d3] bg-gradient-to-r from-[#e9f6ec] via-[#f2faf3] to-[#e4f3e8]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-5 py-16 sm:px-7 lg:flex-row lg:items-center lg:py-20">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#183b29] sm:text-[28px]">
                Siap menemukan smartphone terbaikmu?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[#60746a]">
                Buat akun gratis dan dapatkan rekomendasi yang objektif dalam hitungan menit.
              </p>
            </div>
            <Link
              to={primaryCta.to}
              className="inline-flex min-h-[50px] shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#26884b] to-[#3caf62] px-7 py-3 text-sm font-extrabold !text-white shadow-[0_12px_28px_rgba(38,136,75,0.25)] transition hover:-translate-y-0.5"
            >
              {primaryCta.label}
              <PrimaryIcon size={17} />
            </Link>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#e2ece3] bg-white">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 sm:px-7 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <img
              src="/images/logo_nobg.png"
              alt="SesuaiDompet"
              className="h-11 w-auto max-w-[165px] object-contain"
            />
            <p className="mt-4 max-w-sm text-[13px] leading-6 text-[#6f8074]">
              Sistem Pendukung Keputusan pemilihan smartphone berbasis metode Simple
              Additive Weighting, dilengkapi asisten cerdas SEDO AI.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#25462f]">Jelajahi</h3>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[#6f8074] transition hover:text-[#21803f]">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#25462f]">Akun</h3>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {isLoggedIn ? (
                <>
                  <li><Link to="/dashboard" className="text-[#6f8074] hover:text-[#21803f]">Dashboard</Link></li>
                  <li><Link to="/sedo-ai" className="text-[#6f8074] hover:text-[#21803f]">SEDO AI</Link></li>
                  <li><Link to="/riwayat" className="text-[#6f8074] hover:text-[#21803f]">Riwayat Perhitungan</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="text-[#6f8074] hover:text-[#21803f]">Masuk</Link></li>
                  <li><Link to="/register" className="text-[#6f8074] hover:text-[#21803f]">Daftar Akun</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#edf2ed]">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-[#94a197] sm:flex-row sm:px-7">
            <p>© {new Date().getFullYear()} SesuaiDompet. Seluruh hak dilindungi.</p>
            <p>Sistem Pendukung Keputusan Pemilihan Smartphone</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

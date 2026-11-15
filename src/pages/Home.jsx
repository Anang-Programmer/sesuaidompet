
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BatteryFull,
  Camera,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  Gauge,
  LogIn,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  UserPlus,
  Wallet,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

const steps = [
  {
    number: '01',
    icon: Database,
    title: 'Data alternatif',
    description:
      'Pilih dan kelola daftar smartphone yang ingin kamu bandingkan.',
  },
  {
    number: '02',
    icon: Scale,
    title: 'Kriteria & bobot',
    description:
      'Tentukan kriteria dan tingkat kepentingannya sesuai kebutuhan.',
  },
  {
    number: '03',
    icon: Gauge,
    title: 'Perhitungan SAW',
    description:
      'Sistem melakukan normalisasi dan menghitung nilai preferensi.',
  },
  {
    number: '04',
    icon: Trophy,
    title: 'Hasil rekomendasi',
    description:
      'Lihat peringkat smartphone berdasarkan hasil perhitungan.',
  },
];

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[510px]">

      {/* Dekorasi latar */}

      <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#a9e9b5]/50 blur-3xl" />
      <div className="absolute -bottom-10 -left-8 h-52 w-52 rounded-full bg-[#c9efd0]/70 blur-3xl" />

      {/* Panel ilustrasi */}

      <div className="relative overflow-hidden rounded-[30px] border border-white/90 bg-white/80 p-5 shadow-[0_25px_70px_rgba(30,83,46,0.12)] backdrop-blur-xl sm:p-7">

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#398754]">
              Preview sistem
            </div>

            <h3 className="mt-1 text-lg font-extrabold text-[#183e2a]">
              Pemilihan Smartphone
            </h3>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e3f5e7] text-[#27884a]">
            <Smartphone size={23} />
          </div>
        </div>

        {/* Kartu ilustrasi smartphone */}

        <div className="mt-6 rounded-[22px] bg-gradient-to-br from-[#123c2a] via-[#185438] to-[#247b46] p-5 text-white shadow-lg shadow-green-950/10">

          <div className="flex items-center justify-between">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-bold tracking-wide text-[#dcf9e1]">
              METODE SAW
            </span>

            <Sparkles size={17} className="text-[#a7eeb3]" />
          </div>

          <div className="mt-7 flex items-center gap-4">
            <div className="flex h-[76px] w-[58px] shrink-0 items-center justify-center rounded-[15px] border border-white/35 bg-white/10 shadow-inner backdrop-blur">
              <Smartphone size={34} strokeWidth={1.5} />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-medium text-white/60">
                Sistem rekomendasi
              </div>

              <div className="mt-1 text-lg font-extrabold leading-tight">
                Temukan pilihan terbaik
              </div>

              <div className="mt-1 text-[10px] text-white/70">
                Sesuai kebutuhan dan anggaran
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { label: 'Alternatif', icon: Database },
              { label: 'Kriteria', icon: Scale },
              { label: 'Ranking', icon: Trophy },
            ].map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/[0.08] p-3 text-center"
              >
                <Icon size={19} className="mx-auto text-[#a9edb4]" />
                <div className="mt-2 text-[9px] font-semibold text-white/85">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informasi kriteria */}

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#274a34]">
              Aspek penilaian
            </span>

            <span className="text-[9px] font-semibold text-[#829187]">
              Sesuai kebutuhan
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">

            {[
              { label: 'Harga', icon: Wallet },
              { label: 'RAM & Penyimpanan', icon: Cpu },
              { label: 'Kamera', icon: Camera },
              { label: 'Baterai', icon: BatteryFull },
            ].map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#e5eee6] bg-[#f8fbf8] px-3 py-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e5f4e8] text-[#338650]">
                  <Icon size={16} />
                </span>

                <span className="text-[10px] font-bold text-[#536b59]">
                  {label}
                </span>
              </div>
            ))}

          </div>
        </div>

        {/* Catatan preview */}

        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#eaf6ed] px-3.5 py-3 text-[10px] font-semibold text-[#327448]">
          <ShieldCheck size={16} className="shrink-0" />
          Proses perhitungan yang terstruktur dan transparan.
        </div>

      </div>

      {/* Elemen dekoratif di luar panel */}

      <div className="absolute -right-3 top-24 hidden h-12 w-12 items-center justify-center rounded-2xl border border-white bg-white/90 text-[#359454] shadow-lg sm:flex">
        <CheckCircle2 size={22} />
      </div>

      <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-lg sm:block">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#3c9e5b]" />
          <span className="text-[10px] font-extrabold text-[#31583c]">
            Pilih lebih cerdas
          </span>
        </div>
      </div>

    </div>
  );
}


export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden bg-[#f4f8f4] text-[#193a29]">

      {/* HEADER — SATU-SATUNYA LOGO DI HOME */}

      <header className="sticky top-0 z-40 border-b border-[#e3ece4] bg-white/85 backdrop-blur-xl">

        <div className="mx-auto flex h-[78px] max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-7">

          <Link
            to="/"
            aria-label="SesuaiDompet - Beranda"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-white px-3 py-1.5 transition duration-200 hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,255,255,0.98)',
              boxShadow:
                '0 0 0 4px rgba(255,255,255,0.55), 0 0 28px rgba(255,255,255,0.95), 0 7px 20px rgba(25,69,38,0.08)',
            }}
          >
            <img
              src="/images/logo_nobg.png"
              alt="SesuaiDompet"
              className="h-12 w-auto max-w-[175px] object-contain"
            />
          </Link>


          <nav className="flex shrink-0 items-center gap-3 sm:gap-5">

            {!loading && user ? (

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#e7f4ea] px-4 py-2.5 text-xs font-extrabold text-[#247743] transition hover:bg-[#d9efde] sm:text-sm"
              >
                Dashboard
                <ArrowRight size={15} />
              </Link>

            ) : (

              <>
                <Link
                  to="/login"
                  className="text-xs font-bold text-[#617468] transition hover:text-[#218047] sm:text-sm"
                >
                  Masuk
                </Link>

                <Link
                  to="/register"
                  className="sd-button-light inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition hover:-translate-y-0.5 sm:px-5 sm:text-sm"
                >
                  <UserPlus size={15} />
                  Daftar Akun
                </Link>
              </>

            )}

          </nav>
        </div>
      </header>


      {/* HERO */}

      <main>

        <section
          className="relative overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 82% 35%, rgba(188,235,196,0.58), transparent 38%), radial-gradient(ellipse at 10% 0%, rgba(215,241,219,0.75), transparent 40%), linear-gradient(135deg, #f3f9f3 0%, #eaf5ec 55%, #f6faf6 100%)',
          }}
        >

          <div className="pointer-events-none absolute -right-32 top-10 h-[400px] w-[400px] rounded-full border border-white/50" />
          <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full border border-white/50" />

          <div className="relative mx-auto grid min-h-[620px] max-w-[1200px] items-center gap-14 px-5 py-16 sm:px-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-20">

            {/* Teks hero */}

            <div className="relative z-10 max-w-[620px]">

              <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe5d2] bg-white/75 px-3.5 py-2 text-[9px] font-extrabold tracking-[0.12em] text-[#35834d] shadow-sm backdrop-blur sm:text-[10px]">
                <span className="h-2 w-2 rounded-full bg-[#3eae60] shadow-[0_0_9px_rgba(62,174,96,0.55)]" />
                SISTEM PENDUKUNG KEPUTUSAN
              </div>

              <h1 className="mt-7 text-[38px] font-extrabold leading-[1.12] tracking-[-0.045em] text-[#183b29] sm:text-5xl lg:text-[57px]">
                Pilih Smartphone yang Tepat,
                <span className="mt-2 block bg-gradient-to-r from-[#21834a] to-[#48b96a] bg-clip-text text-transparent">
                  Sesuai Budget Anda.
                </span>
              </h1>

              <p className="mt-6 max-w-[550px] text-sm leading-7 text-[#65796b] sm:text-base sm:leading-8">
                Temukan smartphone yang sesuai dengan kebutuhan dan anggaranmu.
                Bandingkan berbagai alternatif menggunakan metode{' '}
                <strong className="font-extrabold text-[#315a3d]">
                  Simple Additive Weighting (SAW)
                </strong>
                {' '}untuk mendapatkan rekomendasi berdasarkan kriteria yang kamu tentukan.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">

                {!loading && user ? (

                  <Link
                    to="/dashboard"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#26884b] to-[#3caf62] px-6 py-3 text-sm font-extrabold text-white shadow-[0_9px_22px_rgba(38,136,75,0.22)] transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Masuk ke Dashboard
                    <ArrowRight size={17} />
                  </Link>

                ) : (

                  <>
                    <Link
                      to="/register"
                      className="sd-button-dark inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold transition hover:-translate-y-0.5"
                    >
                      Mulai Pilih HP
                      <ArrowUpRight size={17} />
                    </Link>

                    <Link
                      to="/login"
                      className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-[#d5e5d8] bg-white/85 px-6 py-3 text-sm font-bold text-[#31583d] shadow-sm transition hover:-translate-y-0.5 hover:border-[#aad5b4] hover:bg-white"
                    >
                      <LogIn size={16} />
                      Masuk
                    </Link>
                  </>

                )}

              </div>


              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-semibold text-[#6d8273] sm:text-[11px]">

                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#329957]" />
                  Perhitungan sistematis
                </span>

                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#329957]" />
                  Kriteria fleksibel
                </span>

                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#329957]" />
                  Hasil perangkingan
                </span>

              </div>

            </div>


            {/* Ilustrasi tanpa logo kedua */}

            <div className="relative z-10 px-1 sm:px-5 lg:px-0">
              <HeroPreview />
            </div>

          </div>

        </section>


        {/* CARA KERJA */}

        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-7 lg:py-24">

          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div className="max-w-2xl">
              <div className="text-[10px] font-extrabold tracking-[0.15em] text-[#39945a]">
                PROSES PENGAMBILAN KEPUTUSAN
              </div>

              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#193d2b] sm:text-3xl">
                Bagaimana Metode SAW Bekerja?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#738278]">
                Proses perhitungan dilakukan melalui tahapan yang jelas,
                mulai dari pengelolaan alternatif hingga menghasilkan
                peringkat rekomendasi.
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs font-bold text-[#428b56] sm:flex">
              Empat tahapan utama
              <ChevronRight size={16} />
            </div>

          </div>


          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {steps.map(({ number, icon: Icon, title, description }) => (

              <article
                key={number}
                className="group rounded-[22px] border border-[#e1ebe2] bg-white/85 p-6 shadow-[0_8px_24px_rgba(26,69,40,0.045)] transition duration-200 hover:-translate-y-1 hover:border-[#c5e2cb] hover:shadow-[0_16px_35px_rgba(26,69,40,0.09)]"
              >

                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5eb] text-[#2d8a4e] transition group-hover:bg-[#d7efdd]">
                    <Icon size={22} />
                  </div>

                  <span className="text-sm font-extrabold tracking-widest text-[#b1c2b4]">
                    {number}
                  </span>
                </div>

                <h3 className="mt-6 text-base font-extrabold text-[#2a4a34]">
                  {title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-[#7a897e]">
                  {description}
                </p>

              </article>

            ))}

          </div>

        </section>


        {/* RUMUS SAW */}

        <section className="border-y border-[#e2ece3] bg-white/75">

          <div className="mx-auto max-w-[1100px] px-5 py-20 sm:px-7 lg:py-24">

            <div className="mx-auto mb-12 max-w-2xl text-center">

              <div className="text-[10px] font-extrabold tracking-[0.15em] text-[#39945a]">
                TRANSPARANSI PERHITUNGAN
              </div>

              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#193d2b] sm:text-3xl">
                Dasar Perhitungan Matematis
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#738278]">
                Metode SAW mengubah nilai setiap kriteria menjadi nilai
                yang dapat dibandingkan, kemudian menghitung nilai
                preferensi untuk setiap alternatif.
              </p>

            </div>


            <div className="grid gap-5 lg:grid-cols-2">

              {/* Benefit dan Cost */}

              <article className="rounded-[22px] border border-[#e0ebe2] bg-[#f8fbf8] p-6 sm:p-8">

                <div className="flex items-center gap-3 border-b border-[#e1ebe3] pb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f4e8] text-[#31884f]">
                    <Scale size={20} />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#254a32]">
                      1. Normalisasi
                    </h3>

                    <p className="mt-1 text-[10px] text-[#829087]">
                      Matriks keputusan
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-xs leading-6 text-[#748278]">
                  Normalisasi digunakan agar nilai dari berbagai kriteria
                  dapat dibandingkan dalam skala yang seragam.
                </p>

                <div className="mt-5 space-y-3">

                  <div className="rounded-xl border border-[#deebdf] bg-white p-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#33864d]">
                      Benefit
                    </span>

                    <div className="my-3 font-mono text-sm font-bold text-[#294c35]">
                      r<sub>ij</sub> = X<sub>ij</sub> / Max(X<sub>ij</sub>)
                    </div>

                    <p className="text-[10px] leading-5 text-[#829087]">
                      Nilai yang lebih besar dianggap lebih baik.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#deebdf] bg-white p-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#33864d]">
                      Cost
                    </span>

                    <div className="my-3 font-mono text-sm font-bold text-[#294c35]">
                      r<sub>ij</sub> = Min(X<sub>ij</sub>) / X<sub>ij</sub>
                    </div>

                    <p className="text-[10px] leading-5 text-[#829087]">
                      Nilai yang lebih kecil dianggap lebih baik.
                    </p>
                  </div>

                </div>

              </article>


              {/* Nilai preferensi */}

              <article className="rounded-[22px] border border-[#e0ebe2] bg-[#f8fbf8] p-6 sm:p-8">

                <div className="flex items-center gap-3 border-b border-[#e1ebe3] pb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f4e8] text-[#31884f]">
                    <Trophy size={20} />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#254a32]">
                      2. Nilai Preferensi
                    </h3>

                    <p className="mt-1 text-[10px] text-[#829087]">
                      Perhitungan nilai akhir
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-xs leading-6 text-[#748278]">
                  Nilai normalisasi dikalikan dengan bobot masing-masing
                  kriteria, kemudian dijumlahkan untuk memperoleh
                  nilai preferensi setiap alternatif.
                </p>

                <div className="mt-5 rounded-2xl border border-[#dcebdd] bg-white p-5 text-center">

                  <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#819287]">
                    Rumus nilai preferensi
                  </div>

                  <div className="mt-4 font-mono text-lg font-extrabold text-[#287a45]">
                    V<sub>i</sub> = Σ (W<sub>j</sub> × r<sub>ij</sub>)
                  </div>

                </div>

                <div className="mt-5 space-y-3 text-xs text-[#718176]">
                  <p>
                    <strong className="text-[#294b35]">Vᵢ</strong>:
                    {' '}Nilai preferensi alternatif ke-i.
                  </p>

                  <p>
                    <strong className="text-[#294b35]">Wⱼ</strong>:
                    {' '}Bobot kriteria ke-j.
                  </p>

                  <p>
                    <strong className="text-[#294b35]">rᵢⱼ</strong>:
                    {' '}Nilai normalisasi alternatif ke-i pada kriteria ke-j.
                  </p>
                </div>

                <div className="mt-6 flex items-start gap-2 rounded-xl bg-[#e7f4e9] p-3.5 text-[11px] font-semibold leading-5 text-[#317747]">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  Nilai preferensi tertinggi menjadi peringkat terbaik.
                </div>

              </article>

            </div>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="bg-[#f4f8f4] px-5 py-8 text-center">

        <p className="text-xs text-[#849188]">
          © {new Date().getFullYear()} SesuaiDompet
        </p>

        <p className="mt-1 text-[10px] text-[#a0aaa3]">
          Sistem Pendukung Keputusan Pemilihan Smartphone
        </p>

      </footer>

    </div>
  );
}

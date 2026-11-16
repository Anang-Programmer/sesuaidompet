
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

function mapAuthError(message = '') {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return 'Email atau password salah. Periksa kembali data kamu.';
  }

  if (lower.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Cek kotak masuk email kamu terlebih dahulu.';
  }

  return message || 'Terjadi kesalahan saat masuk.';
}

function FeatureItem({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#c5edcd]">
        <Icon size={17} />
      </span>

      <div>
        <p className="text-xs font-extrabold text-white">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-5 text-white/65">
          {description}
        </p>
      </div>
    </div>
  );
}

function BrandLogo({ compact = false }) {
  return (
    <Link
      to="/"
      aria-label="Kembali ke halaman utama SesuaiDompet"
      className={`inline-flex items-center justify-center rounded-2xl bg-white p-2.5 shadow-[0_8px_24px_rgba(10,40,20,0.12)] ${
        compact ? 'w-[174px]' : 'w-[205px]'
      }`}
    >
      <img
        src="/images/logo_nobg.png"
        alt="Logo SesuaiDompet"
        className="h-auto w-full object-contain"
      />
    </Link>
  );
}

export default function Login() {
  const {
    user,
    loading: authLoading,
    signIn,
  } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setSubmitting(true);

    const { error: signInError } = await signIn(
      email.trim(),
      password
    );

    setSubmitting(false);

    if (signInError) {
      setError(mapAuthError(signInError.message));
      return;
    }

    navigate('/dashboard', { replace: true });
  }

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-white">
      {/* Dekorasi latar */}
      <div className="pointer-events-none absolute -left-32 -top-36 h-80 w-80 rounded-full bg-[#dcefe0]/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -right-28 h-96 w-96 rounded-full bg-[#e0f0e2]/70 blur-3xl" />

<div className="relative z-10 flex w-full h-screen overflow-hidden bg-white">
        {/* =================================
            PANEL IDENTITAS
        ================================= */}
<aside className="relative hidden h-full w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#174d2e] via-[#216c3b] to-[#2e874a] p-8 lg:p-10 md:flex">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[38px] border-white/[0.06]" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#7fd18b]/10 blur-3xl" />

          <div className="relative z-10">
            <BrandLogo />

            <div className="mt-12 max-w-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#d8f0dd]">
                <Sparkles size={12} />
                Sistem Pendukung Keputusan
              </span>

              <h1 className="mt-5 text-3xl font-extrabold leading-[1.2] tracking-tight text-white xl:text-[36px]">
                Temukan smartphone yang paling sesuai dengan kebutuhanmu.
              </h1>

              <p className="mt-4 text-xs leading-7 text-white/70">
                SesuaiDompet membantu kamu membandingkan smartphone
                berdasarkan harga, spesifikasi, serta perhitungan
                metode Simple Additive Weighting (SAW).
              </p>
            </div>

            <div className="mt-10 space-y-5">
              <FeatureItem
                icon={Smartphone}
                title="Perbandingan smartphone"
                description="Bandingkan spesifikasi dan harga dari berbagai alternatif."
              />

              <FeatureItem
                icon={Trophy}
                title="Rekomendasi berbasis SAW"
                description="Dapatkan peringkat berdasarkan kriteria dan bobot penilaian."
              />

              <FeatureItem
                icon={ShieldCheck}
                title="Data tersimpan"
                description="Simpan hasil perhitungan untuk dilihat kembali."
              />
            </div>
          </div>

          <div className="relative z-10 border-t border-white/15 pt-5">
            <p className="text-[9px] leading-5 text-white/50">
              SesuaiDompet · Sistem Pendukung Keputusan Pemilihan Smartphone
            </p>
          </div>
        </aside>

        {/* =================================
            FORM LOGIN
        ================================= */}
        <section className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-5 sm:p-8 lg:p-10">
          {/* Logo khusus mobile */}
          <div className="mb-7 flex flex-col items-center text-center md:hidden">
            <BrandLogo compact />

            <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#729078]">
              Sistem Pendukung Keputusan Smartphone
            </p>
          </div>

          <div className="mx-auto w-full max-w-[390px]">
            <Link
              to="/"
              className="mb-7 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#849188] transition hover:text-[#347c49] md:mb-10"
            >
              <ArrowLeft size={13} />
              Kembali ke halaman utama
            </Link>

            <div className="mb-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dceade] bg-[#f0f8f1] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#397b4b]">
                <LockKeyhole size={11} />
                Akun SesuaiDompet
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#294d34] sm:text-[28px]">
                Selamat datang kembali!
              </h2>

              <p className="mt-2 text-[11px] leading-6 text-[#849188]">
                Masuk ke akunmu untuk melanjutkan analisis dan menemukan
                rekomendasi smartphone terbaik.
              </p>
            </div>

            {/* Pesan error */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#f0d9d6] bg-[#fff7f6] px-3.5 py-3 text-[10px] leading-5 text-[#a54a42]"
              >
                <ShieldCheck
                  size={15}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[10px] font-extrabold text-[#526b57]"
                >
                  Alamat Email
                </label>

                <div className="relative">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91a093]"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="nama@email.com"
                    required
                    className="min-h-[46px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] py-3 pl-10 pr-3.5 text-[11px] font-medium text-[#36543d] outline-none transition placeholder:font-normal placeholder:text-[#a0aba2] hover:border-[#cadfcd] focus:border-[#80b78b] focus:bg-white focus:ring-4 focus:ring-[#e7f3e9]"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[10px] font-extrabold text-[#526b57]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91a093]"
                  />

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Masukkan password"
                    required
                    className="min-h-[46px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] py-3 pl-10 pr-11 text-[11px] font-medium text-[#36543d] outline-none transition placeholder:font-normal placeholder:text-[#a0aba2] hover:border-[#cadfcd] focus:border-[#80b78b] focus:bg-white focus:ring-4 focus:ring-[#e7f3e9]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Lihat password'
                    }
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-[#8d9b90] transition hover:bg-[#f0f7f1] hover:text-[#347c49]"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* TOMBOL LOGIN */}
              <button
                type="submit"
                disabled={submitting}
                className="sd-button-dark mt-2 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[11px] font-extrabold transition disabled:cursor-not-allowed disabled:opacity-55"
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Masuk ke Akun
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* PEMISAH */}
            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#e6ece6]" />

              <span className="text-[9px] font-semibold text-[#9aa59c]">
                atau masuk menggunakan
              </span>

              <span className="h-px flex-1 bg-[#e6ece6]" />
            </div>

            <GoogleAuthButton
              label="Masuk dengan Google"
              onError={setError}
            />

            {/* DAFTAR */}
            <div className="mt-6 rounded-xl border border-[#e5eee6] bg-[#f8fbf8] p-4 text-center">
              <p className="text-[10px] font-medium text-[#758579]">
                Belum punya akun?
              </p>

              <Link
                to="/register"
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#347c49] transition hover:text-[#1e6337] hover:underline"
              >
                Daftar akun baru
                <ArrowRight size={13} />
              </Link>
            </div>

            <p className="mt-6 text-center text-[8px] leading-5 text-[#a0aaa2]">
              Dengan masuk, kamu dapat menggunakan fitur perbandingan,
              analisis SAW, dan penyimpanan riwayat SesuaiDompet.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

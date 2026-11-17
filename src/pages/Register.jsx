
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserPlus,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

function mapRegisterError(message = '') {
  const lower = message.toLowerCase();

  if (lower.includes('already registered')) {
    return 'Email ini sudah terdaftar. Silakan masuk melalui halaman Login.';
  }

  if (lower.includes('password')) {
    return 'Password minimal harus 6 karakter.';
  }

  return message || 'Gagal mendaftarkan akun.';
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

        <p className="mt-1 text-xs leading-5 text-white/65">
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

export default function Register() {
  const {
    user,
    loading: authLoading,
    signUp,
  } = useAuth();

  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setInfoMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setSubmitting(true);

    const { data, error: signUpError } = await signUp(
      name.trim(),
      email.trim(),
      password
    );

    setSubmitting(false);

    if (signUpError) {
      setError(mapRegisterError(signUpError.message));
      return;
    }

    if (data?.session) {
      navigate('/dashboard', { replace: true });
      return;
    }

    setInfoMessage(
      'Pendaftaran berhasil! Silakan cek kotak masuk email kamu untuk verifikasi sebelum login.'
    );

    setPassword('');
    setConfirmPassword('');
  }

  return (
    <main className="relative grid min-h-screen w-full bg-white md:grid-cols-2 lg:grid-cols-[0.92fr_1.08fr]">
      {/* =================================
          PANEL IDENTITAS
      ================================= */}
      <aside className="relative hidden min-h-screen flex-col justify-between overflow-y-auto bg-gradient-to-br from-[#174d2e] via-[#216c3b] to-[#2e874a] p-8 lg:p-12 md:flex">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[38px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#7fd18b]/10 blur-3xl" />

        <div className="relative z-10">
          <BrandLogo />

          <div className="mt-12 max-w-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.13em] text-[#d8f0dd]">
              <Sparkles size={12} />
              Mulai perjalananmu
            </span>

            <h1 className="mt-5 text-3xl font-extrabold leading-[1.2] tracking-tight text-white xl:text-[36px]">
              Buat akun dan pilih smartphone dengan lebih percaya diri.
            </h1>

            <p className="mt-4 text-xs leading-7 text-white/70">
              Daftarkan akun SesuaiDompet untuk menggunakan fitur
              perbandingan, mendapatkan rekomendasi SAW, dan menyimpan
              hasil analisis.
            </p>
          </div>

          <div className="mt-10 space-y-5">
            <FeatureItem
              icon={Smartphone}
              title="Temukan pilihan yang tepat"
              description="Bandingkan berbagai smartphone berdasarkan kebutuhan dan budget."
            />

            <FeatureItem
              icon={CheckCircle2}
              title="Analisis lebih terarah"
              description="Gunakan kriteria dan bobot untuk mendapatkan rekomendasi."
            />

            <FeatureItem
              icon={ShieldCheck}
              title="Akun pribadi"
              description="Simpan hasil perhitungan dan akses kembali saat dibutuhkan."
            />
          </div>
        </div>

        <div className="relative z-10 border-t border-white/15 pt-5">
          <p className="text-xs leading-5 text-white/50">
            SesuaiDompet · Sistem Pendukung Keputusan Pemilihan Smartphone
          </p>
        </div>
      </aside>

      {/* =================================
          FORM REGISTER
      ================================= */}
      <section className="flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
        <div className="my-auto w-full max-w-[410px]">
          {/* Logo khusus mobile */}
          <div className="mb-6 flex flex-col items-center text-center md:hidden">
            <BrandLogo compact />

            <p className="mt-2.5 text-xs font-semibold uppercase tracking-[0.13em] text-[#729078]">
              Sistem Pendukung Keputusan Smartphone
            </p>
          </div>

          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#849188] transition hover:text-[#347c49] md:mb-8"
          >
            <ArrowLeft size={13} />
            Kembali ke halaman utama
          </Link>

            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dceade] bg-[#f0f8f1] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[#397b4b]">
                <UserPlus size={11} />
                Pendaftaran akun
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#294d34] sm:text-[28px]">
                Buat akun baru
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#849188]">
                Isi data berikut untuk mulai menggunakan SesuaiDompet.
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#f0d9d6] bg-[#fff7f6] px-3.5 py-3 text-xs leading-5 text-[#a54a42]"
              >
                <ShieldCheck
                  size={15}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {/* INFORMASI VERIFIKASI */}
            {infoMessage && (
              <div
                role="status"
                aria-live="polite"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#cfe4d3] bg-[#eff8f1] px-3.5 py-3 text-xs leading-5 text-[#347849]"
              >
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* NAMA LENGKAP */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-xs font-extrabold text-[#526b57]"
                >
                  Nama Lengkap
                </label>

                <div className="relative">
                  <UserRound
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91a093]"
                  />

                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Masukkan nama lengkap"
                    required
                    className="min-h-[44px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] py-2.5 pl-10 pr-3.5 text-sm font-medium text-[#36543d] outline-none transition placeholder:font-normal placeholder:text-[#a0aba2] hover:border-[#cadfcd] focus:border-[#80b78b] focus:bg-white focus:ring-4 focus:ring-[#e7f3e9]"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-extrabold text-[#526b57]"
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
                    className="min-h-[44px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] py-2.5 pl-10 pr-3.5 text-sm font-medium text-[#36543d] outline-none transition placeholder:font-normal placeholder:text-[#a0aba2] hover:border-[#cadfcd] focus:border-[#80b78b] focus:bg-white focus:ring-4 focus:ring-[#e7f3e9]"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-extrabold text-[#526b57]"
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
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                    required
                    className="min-h-[44px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] py-2.5 pl-10 pr-11 text-sm font-medium text-[#36543d] outline-none transition placeholder:font-normal placeholder:text-[#a0aba2] hover:border-[#cadfcd] focus:border-[#80b78b] focus:bg-white focus:ring-4 focus:ring-[#e7f3e9]"
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

                <p className="mt-1.5 text-xs text-[#929e94]">
                  Gunakan minimal 6 karakter.
                </p>
              </div>

              {/* KONFIRMASI PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-xs font-extrabold text-[#526b57]"
                >
                  Konfirmasi Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91a093]"
                  />

                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Ulangi password"
                    minLength={6}
                    required
                    className="min-h-[44px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] py-2.5 pl-10 pr-11 text-sm font-medium text-[#36543d] outline-none transition placeholder:font-normal placeholder:text-[#a0aba2] hover:border-[#cadfcd] focus:border-[#80b78b] focus:bg-white focus:ring-4 focus:ring-[#e7f3e9]"
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
                    title={
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

              {/* TOMBOL DAFTAR */}
              <button
                type="submit"
                disabled={submitting}
                className="sd-button-dark mt-2 inline-flex min-h-[45px] w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-55"
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    Mendaftarkan...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Daftar Akun
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* PEMISAH */}
            <div className="my-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#e6ece6]" />

              <span className="text-xs font-semibold text-[#9aa59c]">
                atau daftar menggunakan
              </span>

              <span className="h-px flex-1 bg-[#e6ece6]" />
            </div>

            <GoogleAuthButton
              label="Daftar / Masuk dengan Google"
              onError={setError}
            />

            {/* LOGIN */}
            <div className="mt-5 rounded-xl border border-[#e5eee6] bg-[#f8fbf8] p-4 text-center">
              <p className="text-xs font-medium text-[#758579]">
                Sudah punya akun?
              </p>

              <Link
                to="/login"
                className="mt-1 inline-flex items-center gap-1 text-sm font-extrabold text-[#347c49] transition hover:text-[#1e6337] hover:underline"
              >
                Masuk ke akun
                <ArrowRight size={13} />
              </Link>
            </div>

            <p className="mt-5 text-center text-sm leading-5 text-[#a0aaa2]">
              Dengan mendaftar, akun baru akan menggunakan hak akses
              pengguna biasa sesuai pengaturan aplikasi.
            </p>
          </div>
        </section>
    </main>
  );
}

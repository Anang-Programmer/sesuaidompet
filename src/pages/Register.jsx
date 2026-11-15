import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
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

export default function Register() {
  const { user, loading: authLoading, signUp } = useAuth();
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

  async function handleSubmit(e) {
    e.preventDefault();
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-3 py-5">
      <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col items-center text-center">
          <Link to="/">
            <img
              src="/images/logo_nobg.png"
              alt="Logo SesuaiDompet"
              className="h-16 w-auto object-contain"
            />
          </Link>
          <h1 className="mt-2 text-lg font-bold text-slate-900">Daftar Akun Baru</h1>
          <p className="mt-0.5 text-xs text-slate-500">Buat akun untuk mencari rekomendasi smartphone terbaik</p>
        </div>

        {error && (
          <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="mb-3 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Jaka Perdana"
              required
              className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="w-full rounded-sm border border-slate-300 py-2 pl-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              required
              className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Daftar</span>
              </>
            )}
          </button>
        </form>

        <div className="my-3.5 flex items-center gap-2.5">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">atau</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <GoogleAuthButton label="Daftar / Masuk dengan Google" onError={setError} />

        <p className="mt-4 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

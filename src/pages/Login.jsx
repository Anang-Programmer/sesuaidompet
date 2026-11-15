import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
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

export default function Login() {
  const { user, loading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (signInError) {
      setError(mapAuthError(signInError.message));
      return;
    }

    navigate('/dashboard', { replace: true });
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
          <h1 className="mt-2 text-lg font-bold text-slate-900">Masuk ke SesuaiDompet</h1>
          <p className="mt-0.5 text-xs text-slate-500">SPK Pemilihan Smartphone Terbaik (Metode SAW)</p>
        </div>

        {error && (
          <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
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

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        <div className="my-3.5 flex items-center gap-2.5">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">atau</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <GoogleAuthButton label="Masuk dengan Google" onError={setError} />

        <p className="mt-4 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

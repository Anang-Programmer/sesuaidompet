import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/logo_nobg.png"
              alt="Logo SesuaiDompet"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-2">
            {!loading && user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Daftar</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-3 py-8 sm:px-4">
        <div className="max-w-2xl text-center">
          <img
            src="/images/logo_nobg.png"
            alt="Logo SesuaiDompet"
            className="mx-auto mb-3 h-20 w-auto object-contain"
          />
          <span className="inline-block rounded-xs bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            SPK Pemilihan Smartphone Terbaik • Metode SAW
          </span>
          <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Halaman Beranda (Default Root) - SesuaiDompet
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Ini adalah placeholder halaman utama (<code className="rounded-xs bg-slate-200 px-1 py-0.5 text-xs">src/pages/Home.jsx</code>)
            yang bisa kamu desain dan isi sesuai kebutuhan nanti.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {!loading && user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk ke Aplikasi</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Buat Akun Baru</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


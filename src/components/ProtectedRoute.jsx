
import { Navigate, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

function AuthenticationLoading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#f3f8f3] px-4 py-8"
      aria-label="Memeriksa autentikasi"
      aria-busy="true"
    >
      <section className="w-full max-w-md rounded-[26px] border border-[#dfe9e0] bg-white p-6 shadow-[0_18px_55px_rgba(30,75,42,0.08)] sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6ef] text-[#347c49]">
            <ShieldCheck size={26} />
          </div>

          <div className="mt-4 h-5 w-48 animate-pulse rounded-lg bg-[#e8f0e9]" />

          <div className="mt-2 h-3 w-64 max-w-full animate-pulse rounded-lg bg-[#eef3ee]" />

          <div className="mt-7 w-full space-y-3">
            <div className="h-12 w-full animate-pulse rounded-xl bg-[#edf4ed]" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-[#edf4ed]" />
            <div className="h-10 w-2/3 animate-pulse rounded-xl bg-[#f3f7f3]" />
          </div>

          <p className="mt-6 text-xs font-semibold text-[#829086]">
            Memeriksa sesi akun...
          </p>
        </div>
      </section>
    </main>
  );
}

export function ProtectedRoute({ adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <AuthenticationLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

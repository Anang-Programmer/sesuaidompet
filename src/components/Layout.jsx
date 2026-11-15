import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Award,
  Bot,
  Calculator,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Scale,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sedo-ai', label: 'SEDO AI', icon: Bot, isAi: true },
  { to: '/kriteria', label: 'Kriteria & Bobot', icon: SlidersHorizontal },
  { to: '/alternatif', label: 'Data Alternatif', icon: Smartphone },
  { to: '/penilaian', label: 'Data Penilaian', icon: ClipboardList },
  { to: '/bandingkan', label: 'Bandingkan HP', icon: Scale },
  { to: '/perhitungan', label: 'Proses Perhitungan', icon: Calculator },
  { to: '/hasil', label: 'Hasil & Rekomendasi', icon: Award },
  { to: '/riwayat', label: 'Riwayat Perhitungan', icon: History },
];

export function Layout() {
  const { profile, user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName =
    profile?.name || user?.email?.split('@')[0] || 'Pengguna';

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-3.5">
          <NavLink
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2"
          >
            <img
              src="/images/logo_nobg.png"
              alt="Logo SesuaiDompet"
              className="h-10 w-auto object-contain"
            />
            <span className='font-bold flex gap-1'>
              <p className='text-[#1D3254]'>Sesuai</p>
              <p className='text-[#61A969]'>Dompet</p>
            </span>
          </NavLink>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-sm p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-2.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, isAi }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isAi ? 'text-emerald-600' : ''
                }`}
              />
              <span className="flex-1">{label}</span>
              {isAi && (
                <span className="rounded-xs bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  AI
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 rounded-sm bg-slate-50 p-2.5">
            <p className="truncate text-sm font-semibold text-slate-800">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
            {isAdmin && (
              <span className="mt-1.5 inline-block rounded-xs bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                Admin
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-3 backdrop-blur sm:px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-sm p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden text-sm text-slate-500 lg:block">
            Sistem Pendukung Keputusan Pemilihan Smartphone Terbaik
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              {displayName}
            </span>
            {isAdmin && (
              <span className="rounded-xs bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Admin
              </span>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-6xl p-3 sm:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


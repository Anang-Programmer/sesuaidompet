
import { useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Award,
  Bot,
  Calculator,
  ClipboardCheck,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Scale,
  Settings2,
  Smartphone,
  X,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sedo-ai', label: 'SEDO AI', icon: Bot, isAi: true },
  { to: '/kriteria', label: 'Kriteria & Bobot', icon: Settings2 },
  { to: '/alternatif', label: 'Data Alternatif', icon: Smartphone },
  { to: '/penilaian', label: 'Data Penilaian', icon: ClipboardCheck },
  { to: '/bandingkan', label: 'Bandingkan HP', icon: Scale },
  { to: '/perhitungan', label: 'Proses Perhitungan', icon: Calculator },
  { to: '/hasil', label: 'Hasil & Rekomendasi', icon: Award },
  { to: '/riwayat', label: 'Riwayat Perhitungan', icon: History },
];

function getInitials(name) {
  return String(name || 'Pengguna')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function Layout() {
  const { profile, user, isAdmin, signOut } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName =
    profile?.name || user?.email?.split('@')[0] || 'Pengguna';

  const activePage =
    NAV_ITEMS.find((item) => item.to === location.pathname)?.label ||
    'Ruang Kerja';

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="sd-app-shell">

      {sidebarOpen && (
        <button
          type="button"
          className="sd-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup navigasi"
        />
      )}

      <aside
        className={`sd-sidebar ${sidebarOpen ? 'is-open' : ''}`}
      >

        <div className="sd-sidebar-brand">

          <NavLink
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            aria-label="SesuaiDompet - Dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-white px-3 py-1.5 transition duration-200 hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.98)',
              boxShadow:
                '0 0 0 5px rgba(255,255,255,0.10), 0 0 28px rgba(255,255,255,0.43), 0 8px 24px rgba(0,0,0,0.13)',
            }}
          >
            <img
              src="/images/logo_nobg.png"
              alt="SesuaiDompet"
              className="sd-brand-logo"
              style={{
                width: '165px',
                height: '70px',
                objectFit: 'contain',
              }}
            />
          </NavLink>

          <button
            type="button"
            className="sd-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={19} />
          </button>

        </div>


        <p className="sd-nav-label">
          Menu utama
        </p>

        <nav
          className="sd-nav-list"
          aria-label="Navigasi utama"
        >

          {NAV_ITEMS.map(({ to, label, icon: Icon, isAi }) => (

            <NavLink
              key={to}
              to={to}
              end
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sd-nav-link ${isActive ? 'is-active' : ''}`
              }
            >

              <Icon aria-hidden="true" />

              <span>{label}</span>

              {isAi && (
                <span className="sd-nav-ai-tag">
                  AI
                </span>
              )}

            </NavLink>

          ))}

        </nav>


        <div className="sd-sidebar-footer">

          <div className="sd-profile-card">

            <div className="sd-avatar" aria-hidden="true">
              {getInitials(displayName)}
            </div>

            <div className="sd-profile-meta">

              <div className="sd-profile-name">
                {displayName}
              </div>

              <div className="sd-profile-email">
                {user?.email || 'Akun pengguna'}
              </div>

              {isAdmin && (
                <span className="sd-role-tag">
                  Administrator
                </span>
              )}

            </div>

          </div>

          <button
            type="button"
            className="sd-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            <span>Keluar dari akun</span>
          </button>

        </div>

      </aside>


      <div className="sd-main-area">

        <header className="sd-topbar">

          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              className="sd-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={sidebarOpen}
            >
              <Menu size={20} />
            </button>

            <div className="sd-topbar-context">

              <span className="sd-topbar-eyebrow">
                SesuaiDompet workspace
              </span>

              <span className="sd-topbar-title">
                {activePage}
              </span>

            </div>

          </div>

          <div className="sd-topbar-user">

            <div className="sd-topbar-user-meta">

              <div className="sd-topbar-user-name">
                {displayName}
              </div>

              <div className="sd-topbar-user-role">
                {isAdmin ? 'Administrator' : 'Pengguna'}
              </div>

            </div>

            <div className="sd-avatar" aria-hidden="true">
              {getInitials(displayName)}
            </div>

          </div>

        </header>

        <main className="sd-main-content">

          <Outlet />

          <footer className="sd-footer-note">
            SesuaiDompet · Sistem Pendukung Keputusan Pemilihan Smartphone
          </footer>

        </main>

      </div>

    </div>
  );
}

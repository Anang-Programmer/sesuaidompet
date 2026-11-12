import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Calculator,
  CheckCircle2,
  ClipboardList,
  History,
  SlidersHorizontal,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/PageHeader';
import { DashboardSkeleton } from '../components/Skeleton';
import {
  fetchCriteria,
  fetchHistoriesCount,
  fetchSmartphones,
} from '../services/spkService';
import { calculateSAW, isCompleteSmartphone } from '../utils/sawCalculator';
import {
  formatCriterionValue,
  formatDecimal,
  formatRupiah,
} from '../utils/formatters';

export default function Dashboard() {
  const { user, profile, isAdmin } = useAuth();
  const [criteria, setCriteria] = useState([]);
  const [smartphones, setSmartphones] = useState([]);
  const [historiesCount, setHistoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const [criteriaData, phoneData, historyTotal] = await Promise.all([
          fetchCriteria(),
          fetchSmartphones(),
          fetchHistoriesCount(),
        ]);
        if (!active) return;
        setCriteria(criteriaData);
        setSmartphones(phoneData);
        setHistoriesCount(historyTotal);
      } catch (err) {
        if (active) {
          setError(err.message || 'Gagal memuat ringkasan dashboard.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const readyCount = smartphones.filter((s) =>
      isCompleteSmartphone(s, criteria)
    ).length;
    const incompleteCount = smartphones.length - readyCount;

    return { totalCount: smartphones.length, readyCount, incompleteCount };
  }, [smartphones, criteria]);

  const sawPreview = useMemo(
    () => calculateSAW(criteria, smartphones),
    [criteria, smartphones]
  );

  const displayName =
    profile?.name || user?.email?.split('@')[0] || 'Pengguna';

  if (loading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      label: 'Total Smartphone',
      value: stats.totalCount,
      sub: 'Alternatif terdaftar',
      icon: Smartphone,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Siap Dihitung SAW',
      value: stats.readyCount,
      sub:
        stats.incompleteCount > 0
          ? `${stats.incompleteCount} belum lengkap`
          : 'Semua spesifikasi lengkap',
      icon: CheckCircle2,
      tone: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Kriteria Aktif',
      value: criteria.length,
      sub: 'Metode SAW (100%)',
      icon: SlidersHorizontal,
      tone: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Riwayat Tersimpan',
      value: historiesCount,
      sub: 'Snapshot perhitungan',
      icon: History,
      tone: 'bg-amber-50 text-amber-700',
    },
  ];

  const topPhone = sawPreview.rekomendasiTerbaik;

  return (
    <div>
      <PageHeader
        title={`Halo, ${displayName}!`}
        description="Selamat datang di SesuaiDompet, Sistem Pendukung Keputusan pemilihan smartphone berbasis metode SAW."
        badge={
          isAdmin ? (
            <span className="rounded-xs bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              Admin
            </span>
          ) : null
        }
      />

      {error && (
        <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* 4 Kartu Statistik */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, sub, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
              </div>
              <div className={`rounded-sm p-2 ${tone}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rekomendasi Peringkat 1 Saat Ini */}
      <div className="mt-3.5 rounded-sm border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-emerald-600 text-white">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Rekomendasi Peringkat #1 Saat Ini
              </h2>
              <p className="text-xs text-slate-500">
                Berdasarkan bobot kriteria aktif dan seluruh smartphone yang spesifikasinya lengkap
              </p>
            </div>
          </div>

          <Link
            to="/perhitungan"
            className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <Calculator className="h-4 w-4" />
            <span>Lihat Proses Perhitungan</span>
          </Link>
        </div>

        {topPhone ? (
          <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50/60 p-3.5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-block rounded-xs bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  Peringkat 1 • {topPhone.code}
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {topPhone.smartphone.name}
                </h3>
                <p className="text-sm font-medium text-emerald-700">
                  {formatRupiah(topPhone.smartphone.price)}
                </p>
              </div>

              <div className="rounded-sm bg-white px-3.5 py-2 text-left shadow-2xs ring-1 ring-emerald-200 sm:text-right">
                <p className="text-xs font-medium text-slate-500">
                  Nilai Preferensi (V)
                </p>
                <p className="text-xl font-bold text-emerald-700">
                  {formatDecimal(topPhone.totalScore, 4)}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {criteria.map((c) => (
                <div
                  key={c.code}
                  className="rounded-xs bg-white/90 px-2.5 py-1.5 ring-1 ring-slate-200/80"
                >
                  <p className="text-[11px] font-medium text-slate-500">
                    {c.code} • {c.name}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-800">
                    {formatCriterionValue(c.field, topPhone.smartphone[c.field])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            <p className="text-sm font-medium text-slate-700">
              Belum ada smartphone dengan spesifikasi lengkap untuk dihitung.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tambahkan data smartphone dan lengkapi ke-6 spesifikasinya (Harga, Kamera, RAM, Baterai, ROM, AnTuTu).
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link
                to="/alternatif"
                className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <Smartphone className="h-4 w-4" />
                <span>Tambah Alternatif</span>
              </Link>
              <Link
                to="/penilaian"
                className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ClipboardList className="h-4 w-4" />
                <span>Isi Data Penilaian</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Akses Cepat */}
      <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          to="/bandingkan"
          className="group rounded-sm border border-slate-200 bg-white p-3.5 transition hover:border-emerald-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Bandingkan HP</h3>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Bandingkan 2 sampai 4 HP pilihanmu secara berdampingan dan lihat skor SAW-nya.
          </p>
        </Link>

        <Link
          to="/kriteria"
          className="group rounded-sm border border-slate-200 bg-white p-3.5 transition hover:border-emerald-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Kriteria & Bobot</h3>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
          </div>
          <p className="mt-1 text-xs text-slate-600">
            {isAdmin
              ? 'Lihat dan kelola bobot C1–C6 beserta jenis Cost/Benefit.'
              : 'Lihat rincian bobot C1–C6 berdasarkan gabungan 2 jurnal referensi.'}
          </p>
        </Link>

        <Link
          to="/alternatif"
          className="group rounded-sm border border-slate-200 bg-white p-3.5 transition hover:border-emerald-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Data Alternatif</h3>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Kelola daftar smartphone dan lengkapi spesifikasi alternatif yang tersedia.
          </p>
        </Link>

        <Link
          to="/riwayat"
          className="group rounded-sm border border-slate-200 bg-white p-3.5 transition hover:border-emerald-300 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Riwayat Perhitungan</h3>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Buka kembali snapshot hasil perhitungan dan rekomendasi sebelumnya.
          </p>
        </Link>
      </div>
    </div>
  );
}

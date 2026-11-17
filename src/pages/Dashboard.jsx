
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Bot,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Database,
  History,
  ListChecks,
  Settings2,
  Smartphone,
  Trophy,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/PageHeader';

import {
  fetchCriteria,
  fetchHistoriesCount,
  fetchSmartphones,
} from '../services/spkService';

import {
  calculateSAW,
  isCompleteSmartphone,
} from '../utils/sawCalculator';

import {
  formatCriterionValue,
  formatDecimal,
  formatRupiah,
} from '../utils/formatters';


/* =========================================
   LOADING DASHBOARD
========================================= */

function DashboardLoading() {
  return (
    <div
      className="sd-dashboard"
      aria-label="Memuat dashboard"
      aria-busy="true"
    >
      <div className="space-y-3">
        <div className="sd-loading-block w-28" />
        <div className="sd-loading-block h-9 w-2/3" />
        <div className="sd-loading-block w-full max-w-xl" />
      </div>

      <div className="rounded-2xl border border-[#e2ede4] bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="sd-loading-block h-6 w-36 rounded-full" />
          <div className="sd-loading-block h-6 w-44 rounded-full" />
        </div>
        <div className="sd-loading-block h-7 w-2/3" />
        <div className="sd-loading-block h-4 w-full max-w-xl" />
        <div className="sd-loading-block h-2 w-full rounded-full" />
      </div>

      <div className="sd-stats-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="sd-stat-card" key={index}>
            <div className="sd-loading-block h-11 w-11 rounded-xl" />

            <div className="flex-1 space-y-2">
              <div className="sd-loading-block w-20" />
              <div className="sd-loading-block h-7 w-14" />
              <div className="sd-loading-block w-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="sd-recommendation-card space-y-4">
        <div className="sd-loading-block w-48" />
        <div className="sd-loading-block h-32 w-full" />
      </div>
    </div>
  );
}


/* =========================================
   KOMPONEN KARTU STATISTIK
========================================= */

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}) {
  return (
    <article className="sd-stat-card">
      <div className="sd-stat-icon">
        <Icon aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <div className="sd-stat-label">
          {label}
        </div>

        <div className="sd-stat-value">
          {value}
        </div>

        <div className="sd-stat-sub">
          {description}
        </div>
      </div>
    </article>
  );
}


/* =========================================
   KOMPONEN JUDUL BAGIAN
========================================= */

function SectionHeading({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="sd-section-heading">
      <div className="sd-section-title-wrap">
        <div className="sd-section-icon">
          <Icon aria-hidden="true" />
        </div>

        <div>
          <h2 className="sd-section-title">
            {title}
          </h2>

          {description && (
            <p className="sd-section-description">
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}


/* =========================================
   DASHBOARD UTAMA
========================================= */

export default function Dashboard() {
  const { user, profile, isAdmin } = useAuth();

  const [criteria, setCriteria] = useState([]);
  const [smartphones, setSmartphones] = useState([]);
  const [historiesCount, setHistoriesCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  /* Mengambil data dashboard dari Supabase */

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const [
          criteriaData,
          phoneData,
          historyTotal,
        ] = await Promise.all([
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
          setError(
            err.message || 'Gagal memuat ringkasan dashboard.'
          );
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, []);


  /* Menghitung statistik */

  const stats = useMemo(() => {
    const readyCount = smartphones.filter((smartphone) =>
      isCompleteSmartphone(smartphone, criteria)
    ).length;

    const incompleteCount = smartphones.length - readyCount;

    return {
      totalCount: smartphones.length,
      readyCount,
      incompleteCount,
    };
  }, [smartphones, criteria]);


  /* Preview hasil metode SAW */

  const sawPreview = useMemo(
    () => calculateSAW(criteria, smartphones),
    [criteria, smartphones]
  );

  /* Kriteria dengan bobot tertinggi */

  const dominantCriterion = useMemo(() => {
    if (!criteria || criteria.length === 0) return null;
    return [...criteria].sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];
  }, [criteria]);


  /* Informasi pengguna */

  const displayName =
    profile?.name || user?.email?.split('@')[0] || 'Pengguna';

  const firstName =
    displayName.trim().split(/\s+/)[0] || 'Pengguna';


  if (loading) {
    return <DashboardLoading />;
  }


  /* Data kartu statistik */

  const statCards = [
    {
      label: 'Total smartphone',
      value: stats.totalCount.toLocaleString('id-ID'),
      description: 'Alternatif terdaftar',
      icon: Smartphone,
    },
    {
      label: 'Siap dihitung SAW',
      value: stats.readyCount.toLocaleString('id-ID'),
      description:
        stats.incompleteCount > 0
          ? `${stats.incompleteCount} data belum lengkap`
          : 'Semua data sudah lengkap',
      icon: CheckCircle2,
    },
    {
      label: 'Kriteria aktif',
      value: criteria.length.toLocaleString('id-ID'),
      description: 'Kriteria dalam metode SAW',
      icon: Settings2,
    },
    {
      label: 'Riwayat tersimpan',
      value: historiesCount.toLocaleString('id-ID'),
      description: 'Snapshot perhitungan',
      icon: History,
    },
  ];


  const topPhone = sawPreview.rekomendasiTerbaik;

  const completionPercentage =
    stats.totalCount > 0
      ? Math.round((stats.readyCount / stats.totalCount) * 100)
      : 0;

  const isReadyForSAW = stats.readyCount >= 2;


  return (
    <div className="sd-dashboard">

      {/* HEADER DASHBOARD */}

      <PageHeader
        kicker="Ringkasan aktivitas"
        title={`Selamat datang, ${firstName}!`}
        description="Temukan smartphone yang paling sesuai dengan kebutuhan dan anggaranmu melalui perhitungan yang terstruktur."
        badge={
          isAdmin ? (
            <span className="sd-admin-pill">
              Administrator
            </span>
          ) : null
        }
      />


      {/* PESAN ERROR */}

      {error && (
        <div
          className="sd-error-alert"
          role="alert"
        >
          {error}
        </div>
      )}


      {/* STATUS PIPELINE & PUSAT AKSI SPK */}

      <section className="rounded-2xl border border-[#e2ede4] bg-white p-5 shadow-[0_4px_20px_rgba(20,50,30,0.04)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold ${
                  isReadyForSAW
                    ? 'border border-[#cbe8d2] bg-[#eef8f0] text-[#247541]'
                    : 'border border-[#fae2c8] bg-[#fef7ee] text-[#b45309]'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isReadyForSAW ? 'bg-[#2f9e59] animate-pulse' : 'bg-[#f59e0b]'
                  }`}
                />
                {isReadyForSAW
                  ? 'Sistem Siap Menghitung SAW'
                  : 'Memerlukan Minimal 2 Alternatif Lengkap'}
              </span>

              {dominantCriterion && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#e3ebe4] bg-[#f4f8f4] px-2.5 py-1 text-xs font-semibold text-[#526b57]">
                  Prioritas Utama: <strong className="font-extrabold text-[#254632]">{dominantCriterion.name} ({dominantCriterion.weight}%)</strong>
                </span>
              )}
            </div>

            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-[#1b3d2b] sm:text-xl">
                Status Pipeline Pengambilan Keputusan
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#687b6e]">
                {stats.readyCount} dari {stats.totalCount} smartphone terdaftar siap dihitung dengan metode SAW. Pastikan seluruh kriteria terisi untuk rekomendasi yang akurat.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-sm font-bold text-[#506655]">
                <span>Kelengkapan Spesifikasi Alternatif</span>
                <span>{completionPercentage}% ({stats.readyCount}/{stats.totalCount} HP)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e9f2eb]">
                <div
                  className="h-full rounded-full bg-[#2f9e59] transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 lg:w-52 lg:flex-col lg:items-stretch shrink-0">
            <Link
              to="/perhitungan"
              className="sd-button-dark inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold !text-white shadow-xs transition"
            >
              <Calculator size={15} className="!text-white shrink-0" />
              <span className="!text-white">Hitung SAW Sekarang</span>
              <ArrowRight size={13} className="!text-white shrink-0" />
            </Link>

            <Link
              to="/bandingkan"
              className="sd-button-light inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition"
            >
              <ListChecks size={15} className="shrink-0" />
              <span>Bandingkan HP</span>
            </Link>

            <Link
              to="/sedo-ai"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cbe5cf] bg-[#f0f8f1] px-4 py-2.5 text-sm font-extrabold text-[#23683b] transition hover:bg-[#e4f3e6]"
            >
              <Bot size={15} className="shrink-0" />
              <span>Tanya SEDO AI</span>
            </Link>
          </div>
        </div>
      </section>


      {/* RINGKASAN STATISTIK */}

      <section
        className="sd-stats-grid"
        aria-label="Ringkasan data aplikasi"
      >
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            {...card}
          />
        ))}
      </section>


      {/* REKOMENDASI TERBAIK */}

      <section className="sd-recommendation-card">

        <SectionHeading
          icon={Trophy}
          title="Rekomendasi terbaik saat ini"
          description="Berdasarkan bobot kriteria aktif dan smartphone dengan data spesifikasi lengkap."
          action={
            <Link
              to="/perhitungan"
              className="sd-outline-button"
            >
              Detail perhitungan
              <ArrowRight size={14} />
            </Link>
          }
        />


        {topPhone ? (

          <div className="sd-recommendation-body">

            <div className="min-w-0">

              <span className="sd-rank-label">
                <Award size={13} />
                Peringkat pertama · {topPhone.code}
              </span>

              <h3 className="sd-recommendation-name">
                {topPhone.smartphone.name}
              </h3>

              <div className="sd-recommendation-price">
                {formatRupiah(topPhone.smartphone.price)}
              </div>

              <p className="sd-recommendation-note">
                Rekomendasi dihitung dari data yang tersedia
                dan bobot kriteria aktif.
              </p>

            </div>


            <div className="sd-score-panel">

              <div className="sd-score-caption">
                Nilai preferensi (V)
              </div>

              <div className="sd-score-value">
                {formatDecimal(topPhone.totalScore, 4)}
              </div>

              <div className="sd-score-footnote">
                Skor hasil metode SAW
              </div>

            </div>

          </div>

        ) : (

          <div className="sd-empty-state">

            <div className="sd-empty-icon">
              <Database size={23} />
            </div>

            <h3 className="sd-empty-title">
              Belum ada smartphone yang siap dihitung
            </h3>

            <p className="sd-empty-description">
              Tambahkan alternatif dan lengkapi enam
              spesifikasi penilaian (harga, kamera, RAM,
              baterai, penyimpanan, dan skor AnTuTu)
              untuk melihat rekomendasi.
            </p>

            <div className="sd-button-row">

              <Link
                to="/alternatif"
                className="sd-primary-button"
              >
                <Smartphone size={15} />
                Tambah alternatif
              </Link>

              <Link
                to="/penilaian"
                className="sd-outline-button"
              >
                <ClipboardList size={15} />
                Lengkapi penilaian
              </Link>

            </div>

          </div>

        )}


        {/* DETAIL KRITERIA SMARTPHONE TERBAIK */}

        {topPhone && criteria.length > 0 && (
          <div className="sd-criteria-grid">

            {criteria.map((criterion) => (
              <div
                className="sd-criterion-item"
                key={criterion.code}
              >

                <div className="sd-criterion-code">
                  {criterion.code}
                </div>

                <div className="sd-criterion-name">
                  {criterion.name}
                </div>

                <div className="sd-criterion-value">
                  {formatCriterionValue(
                    criterion.field,
                    topPhone.smartphone[criterion.field]
                  )}
                </div>

              </div>
            ))}

          </div>
        )}

      </section>


      {/* AKSES CEPAT DAN SEDO AI */}

      <section className="sd-lower-grid">

        <div className="sd-panel">

          <SectionHeading
            icon={ListChecks}
            title="Akses cepat"
            description="Lanjutkan ke bagian aplikasi yang ingin kamu gunakan."
          />

          <div className="sd-quick-list">

            <Link
              to="/alternatif"
              className="sd-quick-link"
            >
              <span className="sd-quick-icon">
                <Smartphone size={17} />
              </span>

              <span className="sd-quick-copy">
                <span className="sd-quick-title">
                  Data alternatif smartphone
                </span>

                <span className="sd-quick-description">
                  Lihat dan kelola daftar smartphone.
                </span>
              </span>

              <ArrowRight className="sd-quick-arrow" />
            </Link>


            <Link
              to="/kriteria"
              className="sd-quick-link"
            >
              <span className="sd-quick-icon">
                <Settings2 size={17} />
              </span>

              <span className="sd-quick-copy">
                <span className="sd-quick-title">
                  Kriteria dan bobot
                </span>

                <span className="sd-quick-description">
                  Tinjau enam kriteria dan pembobotan SAW.
                </span>
              </span>

              <ArrowRight className="sd-quick-arrow" />
            </Link>


            <Link
              to="/penilaian"
              className="sd-quick-link"
            >
              <span className="sd-quick-icon">
                <ClipboardList size={17} />
              </span>

              <span className="sd-quick-copy">
                <span className="sd-quick-title">
                  Data penilaian
                </span>

                <span className="sd-quick-description">
                  Periksa kelengkapan spesifikasi alternatif.
                </span>
              </span>

              <ArrowRight className="sd-quick-arrow" />
            </Link>


            <Link
              to="/riwayat"
              className="sd-quick-link"
            >
              <span className="sd-quick-icon">
                <Clock3 size={17} />
              </span>

              <span className="sd-quick-copy">
                <span className="sd-quick-title">
                  Riwayat perhitungan
                </span>

                <span className="sd-quick-description">
                  Buka snapshot rekomendasi sebelumnya.
                </span>
              </span>

              <ArrowRight className="sd-quick-arrow" />
            </Link>

          </div>
        </div>


        {/* PANEL SEDO AI */}

        <div className="sd-ai-panel">

          <div className="sd-ai-content">

            <div className="sd-ai-icon">
              <Bot size={21} />
            </div>

            <h2 className="sd-ai-title">
              Butuh bantuan memilih HP?
            </h2>

            <p className="sd-ai-description">
              Ceritakan kebutuhan dan pilihan smartphone-mu.
              SEDO AI membantu menyiapkan perbandingan
              dan proses rekomendasi.
            </p>

          </div>

          <Link
            to="/sedo-ai"
            className="sd-primary-button"
          >
            Coba SEDO AI
            <ArrowUpRight size={16} />
          </Link>

        </div>

      </section>


      {/* ALUR PENGAMBILAN KEPUTUSAN */}

      <section className="sd-panel">

        <SectionHeading
          icon={Calculator}
          title="Alur pengambilan keputusan"
          description="Gambaran singkat proses yang digunakan SesuaiDompet."
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          {[
            {
              number: '01',
              title: 'Data alternatif',
              text: 'Daftar smartphone yang akan dinilai.',
              icon: Smartphone,
            },
            {
              number: '02',
              title: 'Kriteria & bobot',
              text: 'Tentukan prioritas penilaian.',
              icon: Settings2,
            },
            {
              number: '03',
              title: 'Perhitungan SAW',
              text: 'Normalisasi dan hitung nilai preferensi.',
              icon: Calculator,
            },
            {
              number: '04',
              title: 'Hasil rekomendasi',
              text: 'Lihat urutan smartphone terbaik.',
              icon: Trophy,
            },
          ].map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="flex items-start gap-3 rounded-2xl border border-[#e6eee7] bg-[#f8fbf8] p-3.5"
              >

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5f4e8] text-[#28834a]">
                  <Icon size={18} />
                </div>

                <div className="min-w-0">

                  <div className="text-xs font-extrabold tracking-[0.12em] text-[#89a092]">
                    LANGKAH {step.number}
                  </div>

                  <div className="mt-1 text-sm font-extrabold text-[#254632]">
                    {step.title}
                  </div>

                  <div className="mt-1 text-xs leading-relaxed text-[#86938a]">
                    {step.text}
                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </section>

    </div>
  );
}

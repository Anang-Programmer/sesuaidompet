import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkCheck,
  Calculator,
  CheckCircle2,
  Loader2,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ResultsSkeleton } from '../components/Skeleton';
import { RankingTable } from '../components/RankingTable';
import { useAuth } from '../hooks/useAuth';
import { useSawExecution } from '../hooks/useSawExecution';
import { createHistory } from '../services/spkService';
import {
  formatCriterionValue,
  formatDecimal,
  formatRupiah,
} from '../utils/formatters';

function buildDefaultTitle(parsedBudget) {
  const dateLabel = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  if (parsedBudget) {
    return `Rekomendasi Budget ≤ ${formatRupiah(parsedBudget)} (${dateLabel})`;
  }
  return `Rekomendasi Smartphone SAW (${dateLabel})`;
}

export default function Hasil() {
  const { user, isAdmin } = useAuth();
  const {
    criteria,
    parsedBudget,
    weightMode,
    sawResult,
    loading,
    error,
  } = useSawExecution();

  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function handleSaveHistory(e) {
    e.preventDefault();
    if (!sawResult.isReady || !sawResult.rekomendasiTerbaik) return;

    setSaving(true);
    setSaveError('');
    setSavedSuccess(false);

    const top = sawResult.rekomendasiTerbaik;
    const finalTitle = title.trim() || buildDefaultTitle(parsedBudget);

    const weightsUsed = sawResult.bobotTernormalisasi.map((c) => ({
      code: c.code,
      name: c.name,
      type: c.type,
      rawWeight: Number(c.rawWeight),
      normalizedWeight: Number(c.normalizedWeight.toFixed(4)),
    }));

    const resultsSnapshot = {
      wasWeightNormalized: sawResult.wasWeightNormalized,
      weightSum: sawResult.weightSum,
      bobotTernormalisasi: sawResult.bobotTernormalisasi,
      nilaiMaxMin: sawResult.nilaiMaxMin,
      matriksAwal: sawResult.matriksAwal.map((row) => ({
        code: row.code,
        name: row.smartphone.name,
        values: row.values,
      })),
      matriksNormalisasi: sawResult.matriksNormalisasi.map((row) => ({
        code: row.code,
        name: row.smartphone.name,
        values: row.values,
      })),
      rincianPreferensi: sawResult.rincianPreferensi.map((row) => ({
        code: row.code,
        name: row.smartphone.name,
        weightedValues: row.weightedValues,
        totalScore: row.totalScore,
      })),
      hasilAkhir: sawResult.hasilAkhir.map((row) => ({
        rank: row.rank,
        code: row.code,
        name: row.smartphone.name,
        price: row.smartphone.price,
        totalScore: row.totalScore,
      })),
    };

    try {
      await createHistory({
        user_id: user.id,
        title: finalTitle,
        max_budget: parsedBudget,
        weights_used: weightsUsed,
        top_smartphone_name: top.smartphone.name,
        top_score: Number(top.totalScore.toFixed(4)),
        results_snapshot: resultsSnapshot,
      });
      setSavedSuccess(true);
      setTitle('');
    } catch (err) {
      setSaveError(err.message || 'Gagal menyimpan riwayat perhitungan.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ResultsSkeleton />;
  }

  const top = sawResult.rekomendasiTerbaik;

  return (
    <div>
      <PageHeader
        title="Hasil Rekomendasi & Perankingan"
        description="Langkah 7 & 8 metode SAW: urutan nilai preferensi (V_i) dari terbesar ke terkecil dan kesimpulan alternatif terbaik."
        action={
          <Link
            to="/perhitungan"
            className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Cek Detail Perhitungan (X, R, V)</span>
          </Link>
        }
      />

      {error && (
        <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Ringkasan Parameter Sesi */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="inline-flex items-center gap-1 rounded-xs bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700">
          Alternatif dinilai: <strong>{sawResult.hasilAkhir.length} HP</strong>
        </span>
        <span className="inline-flex items-center gap-1 rounded-xs bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700">
          Budget:{' '}
          <strong>
            {parsedBudget ? `≤ ${formatRupiah(parsedBudget)}` : 'Semua Harga'}
          </strong>
        </span>
        {isAdmin && weightMode === 'custom' && (
          <span className="inline-flex items-center gap-1 rounded-xs bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-800 ring-1 ring-emerald-200">
            <SlidersHorizontal className="h-3 w-3" />
            Bobot: <strong>Kustom</strong>
          </span>
        )}
      </div>

      {sawResult.isReady && top ? (
        <div className="space-y-3.5">
          {/* Langkah 8: Champion Card & Kesimpulan */}
          <section className="rounded-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-2xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-xs bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  <Trophy className="h-3.5 w-3.5" />
                  Rekomendasi Terbaik (#1) • {top.code}
                </span>
                <h2 className="mt-1.5 text-xl font-bold text-slate-900">
                  {top.smartphone.name}
                </h2>
                <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                  {formatRupiah(top.smartphone.price)}
                </p>
              </div>

              <div className="rounded-sm border border-emerald-200 bg-white px-4 py-2 text-left sm:text-right">
                <p className="text-xs font-medium text-slate-500">
                  Skor Preferensi Tertinggi (V)
                </p>
                <p className="font-mono text-2xl font-bold text-emerald-700">
                  {formatDecimal(top.totalScore, 4)}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {criteria.map((c) => (
                <div
                  key={c.code}
                  className="rounded-xs border border-slate-200 bg-white px-2.5 py-1.5"
                >
                  <p className="text-[11px] font-medium text-slate-500">
                    {c.code} • {c.name}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-900">
                    {formatCriterionValue(c.field, top.smartphone[c.field])}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-sm border border-emerald-200/80 bg-white/90 px-3 py-2 text-sm text-slate-700">
              <strong>Langkah 8 (Kesimpulan):</strong> Berdasarkan hasil perhitungan
              metode SAW terhadap {sawResult.hasilAkhir.length} alternatif,{' '}
              <strong>{top.smartphone.name}</strong> ({top.code}) menempati peringkat
              pertama dengan nilai preferensi tertinggi{' '}
              <strong>{formatDecimal(top.totalScore, 4)}</strong> sehingga menjadi
              smartphone yang paling direkomendasikan sesuai kriteria dan bobot aktif.
            </div>
          </section>

          {/* Langkah 7: Tabel Perangkingan */}
          <section className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs">
            <div className="mb-2">
              <h3 className="text-base font-bold text-slate-900">
                Langkah 7: Tabel Perangkingan Lengkap (Descending)
              </h3>
              <p className="text-xs text-slate-500">
                Diurutkan dari nilai preferensi (V_i) terbesar hingga terkecil.
              </p>
            </div>
            <RankingTable rows={sawResult.hasilAkhir} />
          </section>

          {/* Panel Simpan ke Riwayat */}
          <section className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900">
              Simpan ke Riwayat Perhitungan
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Menyimpan snapshot bobot, matriks, dan hasil ranking saat ini agar tetap bisa dibuka kapan saja.
            </p>

            {saveError && (
              <div className="mt-2.5 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {saveError}
              </div>
            )}

            {savedSuccess && (
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Riwayat perhitungan berhasil disimpan!
                </span>
                <Link to="/riwayat" className="font-semibold underline">
                  Buka Halaman Riwayat →
                </Link>
              </div>
            )}

            <form
              onSubmit={handleSaveHistory}
              className="mt-3 flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={buildDefaultTitle(parsedBudget)}
                className="flex-1 rounded-sm border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BookmarkCheck className="h-4 w-4" />
                )}
                <span>{saving ? 'Menyimpan...' : 'Simpan ke Riwayat'}</span>
              </button>
            </form>
          </section>
        </div>
      ) : (
        <div className="rounded-sm border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Belum ada hasil rekomendasi untuk konfigurasi saat ini.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Cek filter budget atau lengkapi spesifikasi alternatif terlebih dahulu.
          </p>
          <Link
            to="/perhitungan"
            className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <Calculator className="h-4 w-4" />
            <span>Buka Proses Perhitungan</span>
          </Link>
        </div>
      )}
    </div>
  );
}

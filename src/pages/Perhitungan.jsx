import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckSquare,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Square,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { CalculationSkeleton } from '../components/Skeleton';
import { SawStepTables } from '../components/SawStepTables';
import { SourceBadge } from '../components/SmartphoneBadges';
import { useAuth } from '../hooks/useAuth';
import { useSawExecution } from '../hooks/useSawExecution';
import { formatDecimal, formatRupiah } from '../utils/formatters';

const BUDGET_PRESETS = [
  { label: 'Semua Harga', value: '' },
  { label: '≤ Rp 2 Jt', value: '2000000' },
  { label: '≤ Rp 3 Jt', value: '3000000' },
  { label: '≤ Rp 4 Jt', value: '4000000' },
  { label: '≤ Rp 5 Jt', value: '5000000' },
  { label: '≤ Rp 8 Jt', value: '8000000' },
];

export default function Perhitungan() {
  const { user, isAdmin } = useAuth();
  const {
    criteria,
    completePhones,
    incompleteCount,
    eligiblePhones,
    selectedPhones,
    maxBudget,
    parsedBudget,
    weightMode,
    customWeights,
    customWeightSum,
    deselectedIds,
    sawResult,
    loading,
    error,
    setMaxBudget,
    setWeightMode,
    setCustomWeight,
    applyCriteriaAsCustom,
    toggleSmartphoneId,
    selectAllIds,
    deselectIds,
    resetSession,
  } = useSawExecution();

  if (loading) {
    return <CalculationSkeleton />;
  }

  return (
    <div>
      <PageHeader
        title="Proses & Detail Perhitungan SAW"
        description="Atur batas budget, pilih alternatif, dan periksa langkah 1–6 algoritma SAW sesuai referensi PPT perkuliahan."
        action={
          <button
            type="button"
            onClick={() => resetSession(criteria)}
            className="inline-flex items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Pengaturan</span>
          </button>
        }
      />

      {error && (
        <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Panel Pengaturan Sesi */}
      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {/* Kiri: Filter Budget & Mode Bobot */}
        <div className="space-y-3 rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Filter Budget Maksimal (SesuaiDompet)
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setMaxBudget(preset.value)}
                  className={`rounded-sm px-2.5 py-1 text-xs font-semibold transition ${
                    maxBudget === preset.value
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-2.5">
              <label
                htmlFor="budget-custom"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Atau masukkan nominal budget maksimal (Rupiah):
              </label>
              <input
                id="budget-custom"
                type="number"
                min="0"
                step="100000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="Kosongkan untuk semua harga"
                className="w-full rounded-sm border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="border-t border-slate-200 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">Mode Bobot Kriteria</h2>
                </div>

                {weightMode === 'custom' && (
                  <button
                    type="button"
                    onClick={() => applyCriteriaAsCustom(criteria)}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Samakan ke Standar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWeightMode('default')}
                  className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition ${
                    weightMode === 'default'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Bobot Standar
                </button>
                <button
                  type="button"
                  onClick={() => setWeightMode('custom')}
                  className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition ${
                    weightMode === 'custom'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Bobot Kustom
                </button>
              </div>

              {weightMode === 'custom' && (
                <div className="mt-2.5 space-y-2 rounded-sm bg-slate-50 p-3">
                  <p className="text-[11px] text-slate-600">
                    Masukkan bobot bebas (desimal atau skala 0–100). Jika total ≠ 1, sistem
                    otomatis menormalisasinya (W_j = w_j / Σw_j) tanpa mengubah bobot standar di database.
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {criteria.map((c) => (
                      <div key={c.code}>
                        <label
                          htmlFor={`cw-${c.code}`}
                          className="mb-0.5 block text-[11px] font-semibold text-slate-700"
                        >
                          {c.code} • {c.name}
                        </label>
                        <input
                          id={`cw-${c.code}`}
                          type="number"
                          min="0"
                          step="any"
                          value={customWeights[c.code] ?? ''}
                          onChange={(e) => setCustomWeight(c.code, e.target.value)}
                          className="w-full rounded-sm border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-900 outline-none focus:border-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                  <p
                    className={`text-xs font-semibold ${
                      customWeightSum > 0 ? 'text-slate-700' : 'text-rose-600'
                    }`}
                  >
                    Total input bobot: {formatDecimal(customWeightSum, 3)}
                    {customWeightSum <= 0 && ' (Minimal satu kriteria harus > 0)'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kanan: Pemilihan Alternatif Smartphone */}
        <div className="flex flex-col rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Alternatif Terpilih ({selectedPhones.length} / {eligiblePhones.length})
              </h2>
              <p className="text-xs text-slate-500">
                {parsedBudget
                  ? `Menampilkan HP lengkap dengan harga ≤ ${formatRupiah(parsedBudget)}`
                  : `Menampilkan seluruh ${completePhones.length} HP dengan spesifikasi lengkap`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllIds}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Pilih Semua
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => deselectIds(eligiblePhones.map((p) => p.id))}
                className="text-xs font-semibold text-slate-500 hover:underline"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <div className="max-h-64 flex-1 space-y-1 overflow-y-auto pr-1">
            {eligiblePhones.length === 0 ? (
              <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-500">
                Tidak ada smartphone lengkap yang memenuhi batas budget ini.
              </div>
            ) : (
              eligiblePhones.map((phone) => {
                const checked = !deselectedIds.includes(phone.id);
                return (
                  <button
                    key={phone.id}
                    type="button"
                    onClick={() => toggleSmartphoneId(phone.id)}
                    className={`flex w-full items-center justify-between rounded-sm border px-2.5 py-1.5 text-left text-xs transition ${
                      checked
                        ? 'border-emerald-200 bg-emerald-50/50 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {checked ? (
                        <CheckSquare className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Square className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                      <span className="truncate font-semibold">{phone.name}</span>
                      <SourceBadge
                        ownerId={phone.user_id}
                        currentUserId={user?.id}
                      />
                    </div>
                    <span className="ml-2 shrink-0 font-medium text-slate-700">
                      {formatRupiah(phone.price)}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {incompleteCount > 0 && (
            <p className="mt-2.5 text-[11px] text-amber-700">
              Catatan: {incompleteCount} smartphone belum memiliki 6 spesifikasi lengkap
              sehingga belum diikutkan.{' '}
              <Link to="/penilaian" className="font-semibold underline">
                Lengkapi di Data Penilaian
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Peringatan jumlah alternatif / bobot */}
      {selectedPhones.length === 1 && (
        <div className="mb-3 flex items-center gap-2 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Baru 1 alternatif yang dipilih. Pilih minimal <strong>2 smartphone</strong> agar
            perbandingan normalisasi SAW lebih bermakna.
          </span>
        </div>
      )}

      {sawResult.isReady ? (
        <>
          <SawStepTables sawResult={sawResult} />

          <div className="mt-3.5 flex flex-col items-center justify-between gap-2.5 rounded-sm border border-emerald-200 bg-emerald-50/70 p-3.5 sm:flex-row">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Perhitungan Langkah 1–6 Selesai
              </p>
              <p className="text-xs text-slate-600">
                Lanjut ke halaman Hasil &amp; Rekomendasi untuk melihat peringkat (Langkah 7–8) dan menyimpannya ke Riwayat.
              </p>
            </div>
            <Link
              to="/hasil"
              className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <span>Lihat Hasil Rekomendasi &amp; Ranking</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      ) : (
        <div className="rounded-sm border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Belum ada perhitungan SAW yang dapat dijalankan.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Pastikan minimal ada 1 smartphone lengkap yang terpilih dan total bobot &gt; 0.
          </p>
        </div>
      )}
    </div>
  );
}

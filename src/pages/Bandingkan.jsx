import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  RotateCcw,
  Scale,
  Search,
  SlidersHorizontal,
  Trophy,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { CompareSkeleton } from '../components/Skeleton';
import { SawStepTables } from '../components/SawStepTables';
import { SourceBadge } from '../components/SmartphoneBadges';
import { SmartphoneModal } from '../components/SmartphoneModal';
import { useAuth } from '../hooks/useAuth';
import { useSawSession } from '../hooks/useSawSession';
import {
  createHistory,
  createSmartphone,
  fetchCriteria,
  fetchSmartphones,
} from '../services/spkService';
import { calculateSAW, isCompleteSmartphone } from '../utils/sawCalculator';
import {
  formatCriterionValue,
  formatDecimal,
  formatRupiah,
} from '../utils/formatters';

const MAX_COMPARE = 4;

export default function Bandingkan() {
  const { user, isAdmin } = useAuth();
  const {
    compareIds: selectedIds,
    compareInitialized,
    toggleCompareId,
    setCompareIds,
    removeCompareId,
    clearCompareIds,
  } = useSawSession();
  const initialCompareRef = useRef({
    initialized: compareInitialized,
    count: selectedIds.length,
  });

  const [criteria, setCriteria] = useState([]);
  const [smartphones, setSmartphones] = useState([]);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'mine'

  const [weightMode, setWeightMode] = useState('default'); // 'default' | 'custom'
  const [customWeights, setCustomWeights] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [savingHistory, setSavingHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAllData() {
    const [criteriaData, phoneData] = await Promise.all([
      fetchCriteria(),
      fetchSmartphones(),
    ]);
    setCriteria(criteriaData);
    setSmartphones(phoneData);
    return { criteriaData, phoneData };
  }

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const [criteriaData, phoneData] = await Promise.all([
          fetchCriteria(),
          fetchSmartphones(),
        ]);
        if (!active) return;

        setCriteria(criteriaData);
        setSmartphones(phoneData);

        const defaultWeights = {};
        for (const c of criteriaData) {
          defaultWeights[c.code] = String(c.weight);
        }
        setCustomWeights(defaultWeights);

        // Pilih otomatis 2 smartphone lengkap pertama hanya jika user belum pernah memilih
        if (
          !initialCompareRef.current.initialized &&
          initialCompareRef.current.count === 0
        ) {
          const readyPhones = phoneData.filter((p) =>
            isCompleteSmartphone(p, criteriaData)
          );
          if (readyPhones.length >= 2) {
            setCompareIds([readyPhones[0].id, readyPhones[1].id]);
          } else if (readyPhones.length === 1) {
            setCompareIds([readyPhones[0].id]);
          }
        }
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat data perbandingan.');
      } finally {
        if (active) setLoading(false);
      }
    }

    init();
    return () => {
      active = false;
    };
  }, [setCompareIds]);

  const completePhones = useMemo(
    () => smartphones.filter((p) => isCompleteSmartphone(p, criteria)),
    [smartphones, criteria]
  );

  const incompleteCount = smartphones.length - completePhones.length;

  const hasMyPhones = useMemo(
    () => completePhones.some((p) => p.user_id && p.user_id === user?.id),
    [completePhones, user?.id]
  );

  const filteredPhones = useMemo(() => {
    const q = search.trim().toLowerCase();
    return completePhones.filter((phone) => {
      if (q && !phone.name.toLowerCase().includes(q)) return false;
      if (sourceFilter === 'mine' && phone.user_id !== user?.id) return false;
      return true;
    });
  }, [completePhones, search, sourceFilter, user?.id]);

  const comparedPhones = useMemo(() => {
    const byId = new Map(completePhones.map((p) => [p.id, p]));
    return selectedIds.map((id) => byId.get(id)).filter(Boolean);
  }, [completePhones, selectedIds]);

  const effectiveWeightMode = isAdmin ? weightMode : 'default';

  const customWeightMap = useMemo(() => {
    if (effectiveWeightMode !== 'custom') return null;
    const map = {};
    for (const c of criteria) {
      const val = Number(customWeights[c.code]);
      map[c.code] = Number.isFinite(val) && val >= 0 ? val : 0;
    }
    return map;
  }, [effectiveWeightMode, customWeights, criteria]);

  const customWeightSum = useMemo(() => {
    if (!customWeightMap) return 1;
    return Object.values(customWeightMap).reduce((sum, w) => sum + w, 0);
  }, [customWeightMap]);

  const sawResult = useMemo(() => {
    if (comparedPhones.length < 2) {
      return calculateSAW(criteria, [], null);
    }
    if (effectiveWeightMode === 'custom' && customWeightSum <= 0) {
      return calculateSAW(criteria, [], null);
    }
    return calculateSAW(criteria, comparedPhones, customWeightMap);
  }, [criteria, comparedPhones, customWeightMap, effectiveWeightMode, customWeightSum]);

  const rankByPhoneId = useMemo(() => {
    const map = new Map();
    for (const item of sawResult.hasilAkhir) {
      map.set(item.smartphone.id, item);
    }
    return map;
  }, [sawResult.hasilAkhir]);

  const normalizedByPhoneId = useMemo(() => {
    const map = new Map();
    for (const row of sawResult.matriksNormalisasi) {
      map.set(row.smartphone.id, row.values);
    }
    return map;
  }, [sawResult.matriksNormalisasi]);

  const extremaByCode = useMemo(() => {
    const map = new Map();
    for (const item of sawResult.nilaiMaxMin) {
      map.set(item.code, item);
    }
    return map;
  }, [sawResult.nilaiMaxMin]);

  function togglePhoneSelection(phoneId) {
    setSaveSuccess(false);
    setSaveError('');
    toggleCompareId(phoneId);
  }

  function removePhoneSelection(phoneId) {
    setSaveSuccess(false);
    removeCompareId(phoneId);
  }

  function resetWeightsToDefault() {
    const next = {};
    for (const c of criteria) {
      next[c.code] = String(c.weight);
    }
    setCustomWeights(next);
    setWeightMode('default');
  }

  async function handleSaveManualPhone(payload) {
    setError('');
    const created = await createSmartphone({
      ...payload,
      user_id: isAdmin ? null : user.id,
    });
    await loadAllData();

    if (created?.id) {
      setCompareIds((prev) => {
        if (prev.includes(created.id)) return prev;
        if (prev.length < MAX_COMPARE) return [...prev, created.id];
        return [...prev.slice(0, MAX_COMPARE - 1), created.id];
      });
    }
  }

  async function handleSaveToHistory() {
    if (!sawResult.isReady || !sawResult.rekomendasiTerbaik) return;

    setSavingHistory(true);
    setSaveError('');
    setSaveSuccess(false);

    const top = sawResult.rekomendasiTerbaik;
    const comparedTitle = comparedPhones.map((p) => p.name).join(' vs ');
    const finalTitle =
      comparedTitle.length > 90
        ? `Perbandingan ${comparedPhones.length} HP (${top.smartphone.name} #1)`
        : `Perbandingan: ${comparedTitle}`;

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
        max_budget: null,
        weights_used: weightsUsed,
        top_smartphone_name: top.smartphone.name,
        top_score: Number(top.totalScore.toFixed(4)),
        results_snapshot: resultsSnapshot,
      });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err.message || 'Gagal menyimpan perbandingan ke riwayat.');
    } finally {
      setSavingHistory(false);
    }
  }

  if (loading) {
    return <CompareSkeleton />;
  }

  const top = sawResult.rekomendasiTerbaik;

  return (
    <div>
      <PageHeader
        title="Bandingkan Smartphone"
        description={`Pilih 2 hingga ${MAX_COMPARE} smartphone sesuai kemauanmu untuk melihat perbandingan spesifikasi side-by-side dan pemenangnya via SAW.`}
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah HP Manual</span>
          </button>
        }
      />

      {error && (
        <div className="mb-3 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Panel Pilih HP (& Pengaturan Bobot khusus Admin) */}
      <div className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        {/* Kiri: Slot Terpilih & Daftar Pencarian */}
        <div
          className={`rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs ${
            isAdmin ? 'lg:col-span-7' : 'lg:col-span-12'
          }`}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Daftar HP Dibandingkan ({comparedPhones.length} / {MAX_COMPARE})
              </h2>
            </div>
            {comparedPhones.length > 0 && (
              <button
                type="button"
                onClick={clearCompareIds}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 hover:underline"
              >
                Kosongkan Pilihan
              </button>
            )}
          </div>

          {/* Slot HP terpilih */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {comparedPhones.length === 0 ? (
              <span className="text-xs text-slate-500">
                Belum ada HP yang dipilih. Pilih minimal 2 HP dari daftar di bawah.
              </span>
            ) : (
              comparedPhones.map((phone, idx) => (
                <div
                  key={phone.id}
                  className="inline-flex items-center gap-1.5 rounded-xs border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-900"
                >
                  <span className="text-emerald-700">#{idx + 1}</span>
                  <span>{phone.name}</span>
                  <button
                    type="button"
                    onClick={() => removePhoneSelection(phone.id)}
                    className="rounded-xs p-0.5 text-emerald-700 hover:bg-emerald-200/70"
                    aria-label={`Hapus ${phone.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pencarian & Filter Sumber */}
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama smartphone..."
                className="w-full rounded-sm border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {hasMyPhones && (
              <div className="flex items-center gap-1 rounded-sm border border-slate-200 bg-slate-50 p-0.5">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'mine', label: 'Input Saya' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSourceFilter(tab.id)}
                    className={`rounded-xs px-2 py-1 text-[11px] font-semibold transition ${
                      sourceFilter === tab.id
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Daftar Pilihan HP */}
          <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
            {filteredPhones.length === 0 ? (
              <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                <p className="text-xs font-medium text-slate-700">
                  {search.trim()
                    ? `Smartphone "${search.trim()}" tidak ditemukan di daftar yang siap dibandingkan.`
                    : 'Belum ada smartphone lengkap pada filter ini.'}
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="mt-2 inline-flex items-center gap-1 rounded-sm bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah HP Manual Sekarang</span>
                </button>
              </div>
            ) : (
              filteredPhones.map((phone) => {
                const isSelected = selectedIds.includes(phone.id);
                const disableAdd = !isSelected && selectedIds.length >= MAX_COMPARE;

                return (
                  <button
                    key={phone.id}
                    type="button"
                    disabled={disableAdd}
                    onClick={() => togglePhoneSelection(phone.id)}
                    className={`flex w-full items-center justify-between rounded-sm border px-2.5 py-1.5 text-left text-xs transition ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-50/70 text-slate-900'
                        : disableAdd
                          ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border text-[10px] font-bold ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <span className="truncate font-semibold">{phone.name}</span>
                      <SourceBadge
                        ownerId={phone.user_id}
                        currentUserId={user?.id}
                      />
                    </div>
                    <span className="ml-2 shrink-0 font-medium text-slate-600">
                      {formatRupiah(phone.price)}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {incompleteCount > 0 && (
            <p className="mt-2 text-[11px] text-amber-700">
              {incompleteCount} smartphone belum memiliki 6 spesifikasi lengkap sehingga belum bisa dibandingkan.{' '}
              <Link to="/penilaian" className="font-semibold underline">
                Lengkapi di Data Penilaian
              </Link>
            </p>
          )}
        </div>

        {/* Kanan: Pengaturan Bobot Compare (Khusus Admin) */}
        {isAdmin && (
          <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xs lg:col-span-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Mode Bobot Perbandingan
                </h2>
              </div>
              <button
                type="button"
                onClick={resetWeightsToDefault}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Standar</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWeightMode('default')}
                className={`rounded-sm border px-2.5 py-1.5 text-xs font-semibold transition ${
                  effectiveWeightMode === 'default'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Bobot Standar
              </button>
              <button
                type="button"
                onClick={() => setWeightMode('custom')}
                className={`rounded-sm border px-2.5 py-1.5 text-xs font-semibold transition ${
                  effectiveWeightMode === 'custom'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Bobot Kustom
              </button>
            </div>

            {effectiveWeightMode === 'default' ? (
              <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {criteria.map((c) => (
                  <div
                    key={c.code}
                    className="rounded-xs border border-slate-200 bg-slate-50 px-2.5 py-1.5"
                  >
                    <p className="text-[11px] font-medium text-slate-500">
                      {c.code} • {c.name}
                    </p>
                    <p className="font-mono text-xs font-bold text-slate-800">
                      {(Number(c.weight) * 100).toFixed(1).replace('.', ',')}%
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2.5 space-y-2 rounded-sm bg-slate-50 p-2.5">
                <p className="text-[11px] text-slate-600">
                  Masukkan bobot kustom (otomatis dinormalisasi oleh SAW tanpa mengubah bobot standar di database).
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {criteria.map((c) => (
                    <div key={c.code}>
                      <label
                        htmlFor={`cmp-w-${c.code}`}
                        className="mb-0.5 block text-[11px] font-semibold text-slate-700"
                      >
                        {c.code} • {c.name}
                      </label>
                      <input
                        id={`cmp-w-${c.code}`}
                        type="number"
                        min="0"
                        step="any"
                        value={customWeights[c.code] ?? ''}
                        onChange={(e) =>
                          setCustomWeights((prev) => ({
                            ...prev,
                            [c.code]: e.target.value,
                          }))
                        }
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

      {/* Hasil Perbandingan Side-by-Side */}
      {comparedPhones.length < 2 ? (
        <div className="rounded-sm border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Pilih minimal 2 smartphone untuk mulai membandingkan.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Centang 2 hingga {MAX_COMPARE} HP dari daftar di atas, atau klik &ldquo;Tambah HP Manual&rdquo; jika model yang dicari belum tersedia.
          </p>
        </div>
      ) : !sawResult.isReady ? (
        <div className="rounded-sm border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700">
          Pastikan minimal ada satu kriteria dengan bobot lebih dari 0 untuk menghitung perbandingan SAW.
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Tabel Head-to-Head */}
          <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="min-w-[190px] px-3.5 py-3 align-top text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Kriteria &amp; Spesifikasi
                    </th>
                    {comparedPhones.map((phone) => {
                      const rankInfo = rankByPhoneId.get(phone.id);
                      const isWinner = rankInfo?.rank === 1;

                      return (
                        <th
                          key={phone.id}
                          className={`min-w-[200px] border-l border-slate-200 px-3.5 py-3 align-top ${
                            isWinner ? 'bg-emerald-50/70' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-xs px-2 py-0.5 text-[11px] font-bold ${
                                isWinner
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isWinner && <Trophy className="h-3 w-3" />}
                              Peringkat #{rankInfo?.rank ?? '-'}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePhoneSelection(phone.id)}
                              className="rounded-xs p-0.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
                              aria-label={`Keluarkan ${phone.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <p className="mt-1.5 text-sm font-bold text-slate-900">
                            {phone.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <SourceBadge
                              ownerId={phone.user_id}
                              currentUserId={user?.id}
                            />
                            <span className="font-mono text-xs font-bold text-emerald-700">
                              V = {formatDecimal(rankInfo?.totalScore ?? 0, 4)}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {sawResult.bobotTernormalisasi.map((c) => {
                    const isCost = String(c.type).toLowerCase() === 'cost';
                    const extrema = extremaByCode.get(c.code);
                    const allSame =
                      extrema && Math.abs(extrema.max - extrema.min) < 1e-9;

                    return (
                      <tr key={c.code} className="hover:bg-slate-50/60">
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">
                              {c.code}
                            </span>
                            <span className="font-medium text-slate-800">
                              {c.name}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span
                              className={`rounded-xs px-1.5 py-0.5 font-semibold ${
                                isCost
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isCost ? 'Cost' : 'Benefit'}
                            </span>
                            <span>
                              Bobot: {(c.normalizedWeight * 100).toFixed(1).replace('.', ',')}%
                            </span>
                          </div>
                        </td>

                        {comparedPhones.map((phone) => {
                          const rawVal = Number(phone[c.field]);
                          const normMap = normalizedByPhoneId.get(phone.id) || {};
                          const normVal = normMap[c.code] ?? 0;
                          const isBest =
                            !allSame &&
                            extrema &&
                            Math.abs(rawVal - extrema.extrema) < 1e-9;
                          const isWinnerCol =
                            rankByPhoneId.get(phone.id)?.rank === 1;

                          return (
                            <td
                              key={phone.id}
                              className={`border-l border-slate-200 px-3.5 py-2.5 ${
                                isWinnerCol ? 'bg-emerald-50/20' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`font-semibold ${
                                    isBest ? 'text-emerald-700' : 'text-slate-900'
                                  }`}
                                >
                                  {formatCriterionValue(c.field, rawVal)}
                                </span>
                                {isBest && (
                                  <span className="rounded-xs bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                    Unggul
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                                Normalisasi (r): {formatDecimal(normVal, 4)}
                              </p>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                  <tr>
                    <td className="px-3.5 py-2.5 text-sm font-bold text-slate-900">
                      Skor Akhir SAW (V_i)
                    </td>
                    {comparedPhones.map((phone) => {
                      const rankInfo = rankByPhoneId.get(phone.id);
                      const isWinner = rankInfo?.rank === 1;
                      return (
                        <td
                          key={phone.id}
                          className={`border-l border-slate-200 px-3.5 py-2.5 ${
                            isWinner ? 'bg-emerald-50/70' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`font-mono text-base font-bold ${
                                isWinner ? 'text-emerald-700' : 'text-slate-800'
                              }`}
                            >
                              {formatDecimal(rankInfo?.totalScore ?? 0, 4)}
                            </span>
                            <span
                              className={`rounded-xs px-2 py-0.5 text-xs font-bold ${
                                isWinner
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              #{rankInfo?.rank ?? '-'}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Kesimpulan & Simpan ke Riwayat */}
          {top && (
            <div className="rounded-sm border border-emerald-200 bg-emerald-50/60 p-3.5">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-800">
                  <strong>Kesimpulan Perbandingan:</strong> Dari {comparedPhones.length} HP
                  yang dibandingkan, <strong>{top.smartphone.name}</strong> unggul di peringkat #1
                  dengan nilai preferensi SAW <strong>{formatDecimal(top.totalScore, 4)}</strong>.
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowSteps((prev) => !prev)}
                    className="inline-flex items-center gap-1 rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {showSteps ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {showSteps ? 'Sembunyikan Rincian SAW' : 'Lihat Rincian SAW (X, R, V)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={savingHistory}
                    onClick={handleSaveToHistory}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {savingHistory ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <BookmarkCheck className="h-3.5 w-3.5" />
                    )}
                    <span>{savingHistory ? 'Menyimpan...' : 'Simpan ke Riwayat'}</span>
                  </button>
                </div>
              </div>

              {saveError && (
                <div className="mt-2.5 rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Hasil perbandingan berhasil disimpan ke Riwayat!
                  </span>
                  <Link to="/riwayat" className="font-semibold underline">
                    Buka Halaman Riwayat →
                  </Link>
                </div>
              )}
            </div>
          )}

          {showSteps && <SawStepTables sawResult={sawResult} />}
        </div>
      )}

      {modalOpen && (
        <SmartphoneModal
          mode="alternatif"
          requireSpecs
          smartphone={null}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveManualPhone}
        />
      )}
    </div>
  );
}


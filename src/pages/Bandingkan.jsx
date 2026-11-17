
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  AlertCircle,
  Award,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Database,
  Loader2,
  Plus,
  RotateCcw,
  Scale,
  Search,
  SlidersHorizontal,
  Smartphone,
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
   KOMPONEN KECIL
========================================= */

function SectionHeading({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5eb] text-[#32844e]">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-[#244832]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs leading-5 text-[#87948a]">
              {description}
            </p>
          )}
        </div>

      </div>

      {action}

    </div>
  );
}


function InfoCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e1ebe2] bg-white p-4 shadow-[0_5px_18px_rgba(24,67,38,0.035)]">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5eb] text-[#32844e]">
        <Icon size={19} />
      </div>

      <div className="min-w-0">

        <p className="text-xs font-bold text-[#839087]">
          {label}
        </p>

        <p className="mt-1 text-xl font-extrabold tracking-tight text-[#254832]">
          {value}
        </p>

        <p className="mt-0.5 truncate text-xs text-[#94a097]">
          {description}
        </p>

      </div>

    </div>
  );
}


/* =========================================
   KARTU PILIHAN SMARTPHONE
========================================= */

function PhoneOption({
  phone,
  selected,
  disabled,
  onClick,
  currentUserId,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition duration-150 ${
        selected
          ? 'border-[#a8d8b2] bg-[#edf8ef] shadow-[0_3px_12px_rgba(37,120,62,0.07)]'
          : disabled
            ? 'cursor-not-allowed border-[#e8ece8] bg-[#f5f7f5] opacity-50'
            : 'border-[#e6ede6] bg-white hover:border-[#b9ddc0] hover:bg-[#f7fbf7]'
      }`}
    >

      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          selected
            ? 'bg-[#d6efdc] text-[#257541]'
            : 'bg-[#f0f5f0] text-[#829287]'
        }`}
      >
        <Smartphone size={18} />
      </span>


      <span className="min-w-0 flex-1">

        <span className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-extrabold text-[#31513a]">
            {phone.name}
          </span>

          <SourceBadge
            ownerId={phone.user_id}
            currentUserId={currentUserId}
          />
        </span>

        <span className="mt-1 block text-xs font-semibold text-[#37834d]">
          {formatRupiah(phone.price)}
        </span>

      </span>


      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
          selected
            ? 'border-[#267c43] bg-[#267c43] text-white'
            : 'border-[#dce7dd] bg-white text-transparent'
        }`}
      >
        <Check size={14} />
      </span>

    </button>
  );
}


/* =========================================
   KARTU SMARTPHONE TERPILIH
========================================= */

function SelectedPhoneCard({
  phone,
  rank,
  rankInfo,
  isWinner,
  currentUserId,
  onRemove,
}) {
  return (
    <article
      className={`relative w-[82vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-[20px] border bg-white p-4 shadow-[0_6px_18px_rgba(24,67,38,0.045)] ${
        isWinner
          ? 'border-[#a9d9b2] ring-1 ring-[#d8efdd]'
          : 'border-[#e2ebe3]'
      }`}
    >

      {isWinner && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-[#257a42] to-[#3ba75c] px-3 py-1.5 text-xs font-extrabold text-white shadow-sm">
          <span className="inline-flex items-center gap-1">
            <Trophy size={11} />
            TERBAIK
          </span>
        </div>
      )}


      <div className="flex items-start justify-between gap-2">

        <div className="flex min-w-0 items-start gap-3">

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isWinner
                ? 'bg-[#e4f4e7] text-[#2d854a]'
                : 'bg-[#f0f5f0] text-[#718579]'
            }`}
          >
            <Smartphone size={21} />
          </div>

          <div className="min-w-0">

            <div className="text-xs font-extrabold text-[#8b998e]">
              ALTERNATIF A{rankInfo?.code?.replace('A', '') || rank}
            </div>

            <h3 className="mt-1 line-clamp-2 pr-1 text-xs font-extrabold leading-snug text-[#294a34]">
              {phone.name}
            </h3>

            <div className="mt-1.5">
              <SourceBadge
                ownerId={phone.user_id}
                currentUserId={currentUserId}
              />
            </div>

          </div>

        </div>


        <button
          type="button"
          onClick={onRemove}
          aria-label={`Keluarkan ${phone.name} dari perbandingan`}
          title="Keluarkan dari perbandingan"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#9aa69c] transition hover:bg-[#fff0ef] hover:text-[#b24d4d]"
        >
          <X size={16} />
        </button>

      </div>


      <div className="mt-4 rounded-xl bg-[#f5faf6] px-3.5 py-3">

        <p className="text-xs font-semibold text-[#86948a]">
          Harga smartphone
        </p>

        <p className="mt-1 text-base font-extrabold text-[#267a43]">
          {formatRupiah(phone.price)}
        </p>

      </div>


      <div className="mt-3 flex items-end justify-between gap-2">

        <div>
          <p className="text-xs font-semibold text-[#8a988e]">
            Skor preferensi SAW
          </p>

          <p
            className={`mt-1 font-mono text-xl font-extrabold ${
              isWinner ? 'text-[#237b42]' : 'text-[#365840]'
            }`}
          >
            {rankInfo
              ? formatDecimal(rankInfo.totalScore, 4)
              : '-'}
          </p>
        </div>


        <span
          className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${
            isWinner
              ? 'bg-[#267d44] text-white'
              : 'border border-[#e1e9e2] bg-white text-[#65776a]'
          }`}
        >
          Peringkat #{rankInfo?.rank ?? '-'}
        </span>

      </div>

    </article>
  );
}


/* =========================================
   KARTU KRITERIA PERBANDINGAN
========================================= */

function CriteriaLabel({ criterion, isCost }) {
  return (
    <div className="min-w-[165px]">

      <div className="flex items-center gap-1.5">
        <span className="rounded-md bg-[#f0f5f0] px-2 py-1 text-xs font-extrabold text-[#718477]">
          {criterion.code}
        </span>

        <span className="text-sm font-extrabold text-[#34513a]">
          {criterion.name}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">

        <span
          className={`rounded-full px-2 py-1 text-xs font-extrabold ${
            isCost
              ? 'bg-[#fff5e7] text-[#a5762f]'
              : 'bg-[#e9f6eb] text-[#2d7a44]'
          }`}
        >
          {isCost ? 'Cost' : 'Benefit'}
        </span>

        <span className="text-xs text-[#89968c]">
          Bobot {(Number(criterion.normalizedWeight) * 100)
            .toFixed(1)
            .replace('.', ',')}%
        </span>

      </div>

    </div>
  );
}


/* =========================================
   HALAMAN UTAMA
========================================= */

export default function Bandingkan() {
  const { user, isAdmin } = useAuth();

  const {
    compareIds: selectedIds,
    compareInitialized,
    toggleCompareId,
    setCompareIds,
    removeCompareId,
  } = useSawSession();


  /* Catatan kondisi sebelum pemilihan otomatis */

  const initialCompareRef = useRef({
    initialized: compareInitialized,
    count: selectedIds.length,
  });


  /* Data aplikasi */

  const [criteria, setCriteria] = useState([]);
  const [smartphones, setSmartphones] = useState([]);


  /* Pencarian */

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');


  /* Pengaturan bobot */

  const [weightMode, setWeightMode] = useState('default');
  const [customWeights, setCustomWeights] = useState({});


  /* Tampilan dan penyimpanan */

  const [showSteps, setShowSteps] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [savingHistory, setSavingHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  /* =========================================
     MEMUAT DATA
  ========================================= */

  async function loadAllData() {
    const [criteriaData, phoneData] = await Promise.all([
      fetchCriteria(),
      fetchSmartphones(),
    ]);

    setCriteria(criteriaData);
    setSmartphones(phoneData);

    return {
      criteriaData,
      phoneData,
    };
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

        for (const criterion of criteriaData) {
          defaultWeights[criterion.code] = String(
            criterion.weight
          );
        }

        setCustomWeights(defaultWeights);


        /*
         * Pemilihan otomatis dua HP lengkap pertama
         * hanya jika pengguna belum pernah menentukan
         * pilihan perbandingan sebelumnya.
         */

        if (
          !initialCompareRef.current.initialized &&
          initialCompareRef.current.count === 0
        ) {
          const readyPhones = phoneData.filter((phone) =>
            isCompleteSmartphone(phone, criteriaData)
          );

          if (readyPhones.length >= 2) {
            setCompareIds([
              readyPhones[0].id,
              readyPhones[1].id,
            ]);

          } else if (readyPhones.length === 1) {
            setCompareIds([readyPhones[0].id]);
          }
        }

      } catch (err) {
        if (active) {
          setError(
            err.message || 'Gagal memuat data perbandingan.'
          );
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      active = false;
    };

  }, [setCompareIds]);


  /* =========================================
     DATA YANG SIAP DIBANDINGKAN
  ========================================= */

  const completePhones = useMemo(
    () =>
      smartphones.filter((phone) =>
        isCompleteSmartphone(phone, criteria)
      ),
    [smartphones, criteria]
  );


  const incompleteCount =
    smartphones.length - completePhones.length;


  const hasMyPhones = useMemo(
    () =>
      completePhones.some(
        (phone) =>
          phone.user_id && phone.user_id === user?.id
      ),
    [completePhones, user?.id]
  );


  const filteredPhones = useMemo(() => {
    const query = search.trim().toLowerCase();

    return completePhones.filter((phone) => {

      const name = String(phone.name ?? '').toLowerCase();

      if (query && !name.includes(query)) {
        return false;
      }

      if (
        sourceFilter === 'mine' &&
        phone.user_id !== user?.id
      ) {
        return false;
      }

      return true;
    });

  }, [completePhones, search, sourceFilter, user?.id]);


  const comparedPhones = useMemo(() => {
    const byId = new Map(
      completePhones.map((phone) => [phone.id, phone])
    );

    return selectedIds
      .map((id) => byId.get(id))
      .filter(Boolean);

  }, [completePhones, selectedIds]);


  /* =========================================
     PENGATURAN BOBOT SAW
  ========================================= */

  const effectiveWeightMode = isAdmin
    ? weightMode
    : 'default';


  const customWeightMap = useMemo(() => {
    if (effectiveWeightMode !== 'custom') {
      return null;
    }

    const map = {};

    for (const criterion of criteria) {
      const value = Number(
        customWeights[criterion.code]
      );

      map[criterion.code] =
        Number.isFinite(value) && value >= 0
          ? value
          : 0;
    }

    return map;

  }, [effectiveWeightMode, customWeights, criteria]);


  const customWeightSum = useMemo(() => {
    if (!customWeightMap) {
      return 1;
    }

    return Object.values(customWeightMap).reduce(
      (sum, value) => sum + value,
      0
    );

  }, [customWeightMap]);


  /* =========================================
     PERHITUNGAN SAW
  ========================================= */

  const sawResult = useMemo(() => {

    if (comparedPhones.length < 2) {
      return calculateSAW(criteria, [], null);
    }

    if (
      effectiveWeightMode === 'custom' &&
      customWeightSum <= 0
    ) {
      return calculateSAW(criteria, [], null);
    }

    return calculateSAW(
      criteria,
      comparedPhones,
      customWeightMap
    );

  }, [
    criteria,
    comparedPhones,
    customWeightMap,
    effectiveWeightMode,
    customWeightSum,
  ]);


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


  const top = sawResult.rekomendasiTerbaik;


  /* =========================================
     AKSI PEMILIHAN SMARTPHONE
  ========================================= */

  function togglePhoneSelection(phoneId) {
    setSaveSuccess(false);
    setSaveError('');

    toggleCompareId(phoneId);
  }


  function removePhoneSelection(phoneId) {
    setSaveSuccess(false);
    setSaveError('');

    removeCompareId(phoneId);
  }

  /* =========================================
     RESET BOBOT
  ========================================= */

  function resetWeightsToDefault() {
    const next = {};

    for (const criterion of criteria) {
      next[criterion.code] = String(
        criterion.weight
      );
    }

    setCustomWeights(next);
    setWeightMode('default');
  }


  /* =========================================
     TAMBAH SMARTPHONE MANUAL
  ========================================= */

  async function handleSaveManualPhone(payload) {
    setError('');

    const created = await createSmartphone({
      ...payload,
      user_id: isAdmin ? null : user.id,
    });

    await loadAllData();

    if (created?.id) {
      setCompareIds((previous) => {

        if (previous.includes(created.id)) {
          return previous;
        }

        return [...previous, created.id];
      });
    }
  }


  /* =========================================
     SIMPAN KE RIWAYAT
  ========================================= */

  async function handleSaveToHistory() {
    if (
      !sawResult.isReady ||
      !sawResult.rekomendasiTerbaik
    ) {
      return;
    }

    setSavingHistory(true);
    setSaveError('');
    setSaveSuccess(false);


    const best = sawResult.rekomendasiTerbaik;

    const comparedTitle = comparedPhones
      .map((phone) => phone.name)
      .join(' vs ');


    const finalTitle =
      comparedTitle.length > 90
        ? `Perbandingan ${comparedPhones.length} HP (${best.smartphone.name} #1)`
        : `Perbandingan: ${comparedTitle}`;


    const weightsUsed =
      sawResult.bobotTernormalisasi.map((criterion) => ({
        code: criterion.code,
        name: criterion.name,
        type: criterion.type,
        rawWeight: Number(criterion.rawWeight),
        normalizedWeight: Number(
          criterion.normalizedWeight.toFixed(4)
        ),
      }));


    /*
     * Bentuk snapshot dipertahankan sesuai
     * struktur riwayat yang sudah digunakan aplikasi.
     */

    const resultsSnapshot = {
      wasWeightNormalized: sawResult.wasWeightNormalized,
      weightSum: sawResult.weightSum,

      bobotTernormalisasi:
        sawResult.bobotTernormalisasi,

      nilaiMaxMin:
        sawResult.nilaiMaxMin,

      matriksAwal:
        sawResult.matriksAwal.map((row) => ({
          code: row.code,
          name: row.smartphone.name,
          values: row.values,
        })),

      matriksNormalisasi:
        sawResult.matriksNormalisasi.map((row) => ({
          code: row.code,
          name: row.smartphone.name,
          values: row.values,
        })),

      rincianPreferensi:
        sawResult.rincianPreferensi.map((row) => ({
          code: row.code,
          name: row.smartphone.name,
          weightedValues: row.weightedValues,
          totalScore: row.totalScore,
        })),

      hasilAkhir:
        sawResult.hasilAkhir.map((row) => ({
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
        top_smartphone_name: best.smartphone.name,
        top_score: Number(best.totalScore.toFixed(4)),
        results_snapshot: resultsSnapshot,
      });

      setSaveSuccess(true);

    } catch (err) {
      setSaveError(
        err.message || 'Gagal menyimpan perbandingan ke riwayat.'
      );

    } finally {
      setSavingHistory(false);
    }
  }


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return <CompareSkeleton />;
  }


  /* =========================================
     TAMPILAN HALAMAN
  ========================================= */

  return (
    <div className="space-y-6">


      {/* HEADER HALAMAN */}

      <PageHeader
        kicker="Analisis smartphone"
        title="Bandingkan Smartphone"
        description="Pilih minimal 2 smartphone untuk membandingkan spesifikasi dan melihat rekomendasi berdasarkan metode SAW."
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="sd-button-dark inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Tambah HP Manual
          </button>
        }
      />


      {/* PESAN ERROR */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-2xl border border-[#f0d6d4] bg-[#fff5f4] px-4 py-3 text-xs leading-5 text-[#a44747]"
        >
          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}


      {/* STATISTIK */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <InfoCard
          icon={Database}
          label="Alternatif tersedia"
          value={completePhones.length}
          description="Smartphone dengan spesifikasi lengkap"
        />

        <InfoCard
          icon={Scale}
          label="Dipilih untuk perbandingan"
          value={`${comparedPhones.length} HP`}
          description="Alternatif yang dibandingkan"
        />

        <InfoCard
          icon={CheckCircle2}
          label="Siap dihitung"
          value={comparedPhones.length >= 2 ? 'Ya' : 'Belum'}
          description={
            comparedPhones.length >= 2
              ? 'Minimal alternatif terpenuhi'
              : 'Pilih minimal dua smartphone'
          }
        />

      </section>


      {/* PANEL UTAMA PEMILIHAN */}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">


        {/* DAFTAR SMARTPHONE */}

        <div className="min-w-0 rounded-[22px] border border-[#e1ebe2] bg-white p-4 shadow-[0_6px_20px_rgba(24,67,38,0.04)] sm:p-5 xl:col-span-7">

          <SectionHeading
            icon={Smartphone}
            title="Pilih smartphone"
            description="Pilih perangkat yang ingin kamu bandingkan."
            action={
              <span className="rounded-full bg-[#eaf5ec] px-3 py-1.5 text-xs font-extrabold text-[#367c4a]">
                {comparedPhones.length} dipilih
              </span>
            }
          />


          {/* SLOT PILIHAN */}

          <div className="mb-4">
            {comparedPhones.length === 0 ? (
              <div className="flex min-h-[72px] items-center justify-center rounded-xl border border-dashed border-[#dce7dd] bg-[#fafcfa] p-3 text-center text-xs font-medium text-[#a1aca3]">
                Belum ada smartphone dipilih. Klik smartphone pada daftar di bawah untuk membandingkan (minimal 2 HP).
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {comparedPhones.map((phone, index) => (
                  <div
                    key={phone.id}
                    className="flex min-h-[80px] flex-col justify-between rounded-xl border border-[#cce5d1] bg-[#f0f8f1] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#89978d]">
                        HP #{index + 1}
                      </span>
                      <CheckCircle2
                        size={14}
                        className="text-[#31834b]"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-1">
                      <span className="line-clamp-2 text-xs font-extrabold leading-snug text-[#31533a]">
                        {phone.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removePhoneSelection(phone.id)
                        }
                        aria-label={`Hapus ${phone.name}`}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[#849388] transition hover:bg-[#fff0ef] hover:text-[#b34e4e]"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* PENCARIAN DAN FILTER */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative min-w-0 flex-1">

              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa79d]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari nama smartphone..."
                aria-label="Cari nama smartphone"
                className="min-h-[42px] w-full rounded-xl border border-[#e0e9e1] bg-[#f9fbf9] py-2.5 pl-10 pr-3 text-xs text-[#31513a] outline-none transition placeholder:text-[#a0aaa2] focus:border-[#83c894] focus:bg-white focus:ring-4 focus:ring-[#dff1e2]"
              />

            </div>


            {hasMyPhones && (

              <div className="flex items-center gap-1 rounded-xl border border-[#e2ebe3] bg-[#f5f9f5] p-1">

                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'mine', label: 'Input Saya' },
                ].map((tab) => (

                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={sourceFilter === tab.id}
                    onClick={() => setSourceFilter(tab.id)}
                    className={`min-h-[34px] rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      sourceFilter === tab.id
                        ? 'bg-[#267f45] text-white shadow-sm'
                        : 'text-[#718176] hover:bg-white hover:text-[#287a43]'
                    }`}
                  >
                    {tab.label}
                  </button>

                ))}

              </div>

            )}

          </div>


          {/* DAFTAR PILIHAN */}

          <div className="mt-4">

            <div className="mb-2 flex items-center justify-between gap-2">

              <p className="text-xs font-extrabold text-[#63776a]">
                Alternatif siap dibandingkan
              </p>

              <span className="text-xs text-[#99a49b]">
                {filteredPhones.length} ditemukan
              </span>

            </div>


            {filteredPhones.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-[#d5e3d7] bg-[#f9fcf9] px-4 py-8 text-center">

                <Search
                  size={22}
                  className="mx-auto text-[#96aa9a]"
                />

                <p className="mt-3 text-xs font-extrabold text-[#526b58]">
                  Smartphone tidak ditemukan
                </p>

                <p className="mt-1 text-xs leading-5 text-[#89968c]">
                  Coba kata pencarian lain atau ubah sumber data.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSourceFilter('all');
                  }}
                  className="mt-3 text-xs font-bold text-[#327d49] hover:underline"
                >
                  Reset pencarian dan filter
                </button>

              </div>

            ) : (

              <div className="max-h-[390px] space-y-2 overflow-y-auto pr-1">

                {filteredPhones.map((phone) => {

                  const selected = selectedIds.includes(phone.id);

                  const disabled = false;

                  return (
                    <PhoneOption
                      key={phone.id}
                      phone={phone}
                      selected={selected}
                      disabled={disabled}
                      currentUserId={user?.id}
                      onClick={() =>
                        togglePhoneSelection(phone.id)
                      }
                    />
                  );

                })}

              </div>

            )}

          </div>


          {/* INFORMASI ALTERNATIF TIDAK LENGKAP */}

          {incompleteCount > 0 && (

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#f0e5cb] bg-[#fffaf0] px-3 py-3">

              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-[#ad813c]"
              />

              <p className="text-xs leading-5 text-[#8d713e]">
                <strong>{incompleteCount} smartphone</strong> belum
                memiliki enam spesifikasi lengkap sehingga belum dapat
                dibandingkan. Lengkapi melalui{' '}
                <Link
                  to="/penilaian"
                  className="font-extrabold underline decoration-[#b69a69] underline-offset-2"
                >
                  Data Penilaian
                </Link>.
              </p>

            </div>

          )}

        </div>


        {/* PENGATURAN BOBOT ADMIN */}

        {isAdmin && (

          <div className="min-w-0 rounded-[22px] border border-[#e1ebe2] bg-white p-4 shadow-[0_6px_20px_rgba(24,67,38,0.04)] sm:p-5 xl:col-span-5">

            <SectionHeading
              icon={SlidersHorizontal}
              title="Pengaturan bobot"
              description="Pilih bobot standar atau atur bobot kustom."
              action={
                <button
                  type="button"
                  onClick={resetWeightsToDefault}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-[#708174] transition hover:bg-[#f1f7f2] hover:text-[#287943]"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              }
            />


            {/* MODE BOBOT */}

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f3f7f3] p-1">

              <button
                type="button"
                onClick={() => setWeightMode('default')}
                className={`min-h-[38px] rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                  effectiveWeightMode === 'default'
                    ? 'bg-[#267f45] text-white shadow-sm'
                    : 'text-[#6f8172] hover:bg-white'
                }`}
              >
                Bobot Standar
              </button>

              <button
                type="button"
                onClick={() => setWeightMode('custom')}
                className={`min-h-[38px] rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                  effectiveWeightMode === 'custom'
                    ? 'bg-[#267f45] text-white shadow-sm'
                    : 'text-[#6f8172] hover:bg-white'
                }`}
              >
                Bobot Kustom
              </button>

            </div>


            {effectiveWeightMode === 'default' ? (

              <div className="mt-4 space-y-2">

                <div className="text-xs font-bold text-[#7b8b7f]">
                  Bobot dari database
                </div>

                {criteria.map((criterion) => {

                  const percentage =
                    Number(criterion.weight) * 100;

                  return (
                    <div
                      key={criterion.code}
                      className="rounded-xl border border-[#e7eee7] bg-[#fbfdfb] px-3 py-2.5"
                    >

                      <div className="mb-2 flex items-center justify-between gap-2">

                        <div className="min-w-0">
                          <span className="mr-1.5 text-xs font-extrabold text-[#87958b]">
                            {criterion.code}
                          </span>

                          <span className="text-xs font-bold text-[#516b57]">
                            {criterion.name}
                          </span>
                        </div>

                        <span className="shrink-0 font-mono text-sm font-extrabold text-[#2d7d47]">
                          {percentage.toFixed(1).replace('.', ',')}%
                        </span>

                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-[#e9f0e9]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#287f45] to-[#65c97b]"
                          style={{
                            width: `${Math.min(
                              Math.max(percentage, 0),
                              100
                            )}%`,
                          }}
                        />
                      </div>

                    </div>
                  );

                })}

                <p className="pt-1 text-xs leading-5 text-[#8c998f]">
                  Bobot standar mengikuti pengaturan Kriteria & Bobot.
                </p>

              </div>

            ) : (

              <div className="mt-4 space-y-3">

                <div className="rounded-xl border border-[#dcebdd] bg-[#f0f8f1] p-3 text-xs leading-5 text-[#607b66]">
                  Bobot kustom hanya digunakan untuk perbandingan ini.
                  Bobot standar dalam database tidak akan diubah.
                  Sistem melakukan normalisasi otomatis pada proses SAW.
                </div>


                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {criteria.map((criterion) => (

                    <div key={criterion.code}>

                      <label
                        htmlFor={`cmp-w-${criterion.code}`}
                        className="mb-1.5 block text-xs font-bold text-[#64766a]"
                      >
                        {criterion.code} · {criterion.name}
                      </label>

                      <input
                        id={`cmp-w-${criterion.code}`}
                        type="number"
                        min="0"
                        step="any"
                        value={customWeights[criterion.code] ?? ''}
                        onChange={(event) =>
                          setCustomWeights((previous) => ({
                            ...previous,
                            [criterion.code]: event.target.value,
                          }))
                        }
                        className="min-h-[39px] w-full rounded-xl border border-[#dfe9e0] bg-[#fbfdfb] px-3 py-2 font-mono text-xs font-semibold text-[#31513a] outline-none transition focus:border-[#83c894] focus:bg-white focus:ring-4 focus:ring-[#e2f2e5]"
                      />

                    </div>

                  ))}

                </div>


                <div
                  className={`rounded-xl px-3 py-2.5 text-xs font-bold ${
                    customWeightSum > 0
                      ? 'bg-[#f0f7f1] text-[#357849]'
                      : 'bg-[#fff3f2] text-[#b14d4d]'
                  }`}
                >
                  Total input bobot:{' '}
                  {formatDecimal(customWeightSum, 3)}

                  {customWeightSum <= 0 && (
                    <span>
                      {' '}(Minimal satu kriteria harus lebih dari 0)
                    </span>
                  )}
                </div>

              </div>

            )}

          </div>

        )}

      </section>


      {/* KARTU SMARTPHONE TERPILIH */}

      {comparedPhones.length > 0 && (

        <section>

          <SectionHeading
            icon={Scale}
            title="Smartphone yang dibandingkan"
            description="Periksa pilihan dan urutan peringkat berdasarkan hasil perhitungan."
          />


          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-4">

            {comparedPhones.map((phone, index) => {

              const rankInfo = rankByPhoneId.get(phone.id);

              return (
                <SelectedPhoneCard
                  key={phone.id}
                  phone={phone}
                  rank={index + 1}
                  rankInfo={rankInfo}
                  isWinner={rankInfo?.rank === 1}
                  currentUserId={user?.id}
                  onRemove={() =>
                    removePhoneSelection(phone.id)
                  }
                />
              );

            })}

          </div>

        </section>

      )}


      {/* PESAN JIKA BELUM CUKUP ALTERNATIF */}

      {comparedPhones.length < 2 && (

        <section className="flex min-h-[230px] flex-col items-center justify-center rounded-[23px] border border-dashed border-[#cbdccb] bg-white px-5 py-10 text-center">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f5eb] text-[#388550]">
            <Scale size={25} />
          </div>

          <h2 className="mt-4 text-sm font-extrabold text-[#2b4c35]">
            Pilih minimal dua smartphone
          </h2>

          <p className="mt-2 max-w-md text-xs leading-6 text-[#839087]">
            Pilih dua hingga empat smartphone dari daftar di atas.
            Setelah itu, sistem akan menampilkan perbandingan
            spesifikasi dan hasil perhitungan SAW.
          </p>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="sd-button-dark mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition hover:-translate-y-0.5"
          >
            <Plus size={15} />
            Tambah HP Manual
          </button>

        </section>

      )}


      {/* PERINGATAN BOBOT */}

      {comparedPhones.length >= 2 &&
        effectiveWeightMode === 'custom' &&
        customWeightSum <= 0 && (

          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-[#f0d6d4] bg-[#fff5f4] px-4 py-3 text-sm leading-5 text-[#a44747]"
          >
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0"
            />

            Total bobot kustom harus lebih dari nol.
            Isi setidaknya satu bobot sebelum melihat hasil SAW.
          </div>

        )}


      {/* HASIL PERBANDINGAN */}

      {comparedPhones.length >= 2 && sawResult.isReady && (

        <section className="space-y-4">


          {/* HEADER HASIL */}

          <SectionHeading
            icon={Trophy}
            title="Hasil perbandingan"
            description="Perbandingan nilai asli, normalisasi, dan skor akhir setiap smartphone."
            action={
              <span className="rounded-full border border-[#d8eadb] bg-[#edf7ef] px-3 py-1.5 text-xs font-extrabold text-[#327948]">
                {comparedPhones.length} alternatif
              </span>
            }
          />


          {/* BANNER PEMENANG */}

          {top && (

            <div className="relative overflow-hidden rounded-[23px] border border-[#b9dfc0] bg-gradient-to-r from-[#eaf7ed] via-[#f3faf4] to-[#e4f4e7] p-5 shadow-[0_8px_24px_rgba(33,111,56,0.07)] sm:p-6">

              <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-[#c5e7ca]/70" />
              <div className="pointer-events-none absolute -right-4 -top-16 h-44 w-44 rounded-full border border-[#c5e7ca]/70" />


              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex min-w-0 items-start gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#277f45] to-[#3ca95f] text-white shadow-[0_8px_18px_rgba(37,125,67,0.2)]">
                    <Trophy size={26} />
                  </div>

                  <div className="min-w-0">

                    <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#3a8b53]">
                      Rekomendasi terbaik
                    </span>

                    <h3 className="mt-1.5 break-words text-lg font-extrabold leading-tight text-[#1f512f] sm:text-xl">
                      {top.smartphone.name}
                    </h3>

                    <p className="mt-1.5 text-xs font-bold text-[#337a47]">
                      {formatRupiah(top.smartphone.price)}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#6f8874]">
                      Memperoleh peringkat pertama dari{' '}
                      {comparedPhones.length} smartphone yang dibandingkan.
                    </p>

                  </div>

                </div>


                <div className="relative flex shrink-0 items-center justify-between gap-5 rounded-2xl border border-white/80 bg-white/85 px-5 py-4 shadow-sm backdrop-blur sm:min-w-[180px] sm:flex-col sm:justify-center sm:gap-1">

                  <div className="text-xs font-bold text-[#829287]">
                    NILAI PREFERENSI
                  </div>

                  <div className="font-mono text-3xl font-extrabold tracking-tight text-[#267b43]">
                    {formatDecimal(top.totalScore, 4)}
                  </div>

                  <div className="text-xs font-bold text-[#6c8a73]">
                    Peringkat #1
                  </div>

                </div>

              </div>

            </div>

          )}


          {/* TABEL PERBANDINGAN */}

          <div className="overflow-hidden rounded-[22px] border border-[#e1ebe2] bg-white shadow-[0_7px_22px_rgba(25,68,39,0.045)]">

            <div className="flex flex-col gap-1 border-b border-[#e8efe8] bg-[#fbfdfb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="text-xs font-extrabold text-[#2b4b35]">
                  Perbandingan spesifikasi
                </h3>

                <p className="mt-1 text-xs text-[#89968d]">
                  Geser tabel ke samping jika layar tidak cukup lebar.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6c8a73]">
                <CheckCircle2 size={13} />
                Data siap dibandingkan
              </span>

            </div>


            <div className="hidden overflow-x-auto md:block">

              <table className="w-full min-w-[760px] border-collapse text-left">

                <thead>

                  <tr className="border-b border-[#e4ece5] bg-[#f5f9f5]">

                    <th className="sticky left-0 z-10 min-w-[190px] bg-[#f5f9f5] px-4 py-4 text-xs font-extrabold uppercase tracking-wide text-[#718176]">
                      Kriteria
                    </th>


                    {comparedPhones.map((phone) => {

                      const rankInfo = rankByPhoneId.get(phone.id);
                      const isWinner = rankInfo?.rank === 1;

                      return (
                        <th
                          key={phone.id}
                          className={`min-w-[190px] border-l border-[#e4ece5] px-4 py-4 align-top ${
                            isWinner ? 'bg-[#edf7ef]' : ''
                          }`}
                        >

                          <div className="flex items-center justify-between gap-2">

                            <span
                              className={`rounded-lg px-2 py-1 text-xs font-extrabold ${
                                isWinner
                                  ? 'bg-[#267d44] text-white'
                                  : 'bg-white text-[#718176] ring-1 ring-[#e1e9e2]'
                              }`}
                            >
                              {isWinner ? 'TERBAIK' : `#${rankInfo?.rank ?? '-'}`}
                            </span>

                            {isWinner && (
                              <Trophy
                                size={14}
                                className="text-[#30844b]"
                              />
                            )}

                          </div>


                          <p className="mt-3 line-clamp-2 text-xs font-extrabold leading-snug text-[#2b4b35]">
                            {phone.name}
                          </p>

                          <p className="mt-1.5 text-xs font-extrabold text-[#398650]">
                            {formatRupiah(phone.price)}
                          </p>

                          <div className="mt-2 font-mono text-xs font-extrabold text-[#2d7b46]">
                            V = {formatDecimal(rankInfo?.totalScore ?? 0, 4)}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removePhoneSelection(phone.id)
                            }
                            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#9a817e] transition hover:text-[#b34e4e]"
                          >
                            <X size={12} />
                            Keluarkan
                          </button>

                        </th>
                      );

                    })}

                  </tr>

                </thead>


                <tbody>

                  {sawResult.bobotTernormalisasi.map((criterion) => {

                    const isCost =
                      String(criterion.type).toLowerCase() === 'cost';

                    const extrema =
                      extremaByCode.get(criterion.code);

                    const allSame =
                      extrema &&
                      Math.abs(extrema.max - extrema.min) < 1e-9;

                    return (
                      <tr
                        key={criterion.code}
                        className="border-b border-[#edf1ed] transition hover:bg-[#fbfdfb]"
                      >

                        <td className="sticky left-0 z-[1] border-r border-[#edf1ed] bg-white px-4 py-4 align-top">

                          <CriteriaLabel
                            criterion={criterion}
                            isCost={isCost}
                          />

                          <p className="mt-2 text-xs text-[#98a39a]">
                            Satuan: {criterion.unit || '-'}
                          </p>

                        </td>


                        {comparedPhones.map((phone) => {

                          const rawValue = Number(
                            phone[criterion.field]
                          );

                          const normalizedMap =
                            normalizedByPhoneId.get(phone.id) || {};

                          const normalizedValue =
                            normalizedMap[criterion.code] ?? 0;

                          const isBest =
                            !allSame &&
                            extrema &&
                            Math.abs(
                              rawValue - extrema.extrema
                            ) < 1e-9;

                          const isWinner =
                            rankByPhoneId.get(phone.id)?.rank === 1;

                          return (
                            <td
                              key={phone.id}
                              className={`border-l border-[#edf1ed] px-4 py-4 align-top ${
                                isWinner ? 'bg-[#fbfefb]' : ''
                              }`}
                            >

                              <div className="flex flex-wrap items-center gap-2">

                                <span className={`text-xs font-extrabold ${
                                  isBest
                                    ? 'text-[#287e45]'
                                    : 'text-[#435e49]'
                                }`}>
                                  {formatCriterionValue(
                                    criterion.field,
                                    rawValue
                                  )}
                                </span>

                                {isBest && (
                                  <span className="rounded-full bg-[#e3f3e6] px-2 py-1 text-sm font-extrabold text-[#2b7b43]">
                                    Unggul
                                  </span>
                                )}

                              </div>


                              <p className="mt-2 text-xs font-medium text-[#8b998e]">
                                Normalisasi
                              </p>

                              <p className="mt-0.5 font-mono text-sm font-bold text-[#667c6a]">
                                {formatDecimal(normalizedValue, 4)}
                              </p>

                            </td>
                          );

                        })}

                      </tr>
                    );

                  })}

                </tbody>


                {/* TOTAL SKOR */}

                <tfoot>

                  <tr className="border-t-2 border-[#dce8de] bg-[#f5f9f5]">

                    <td className="sticky left-0 bg-[#f5f9f5] px-4 py-4 text-xs font-extrabold text-[#36533d]">
                      Skor akhir SAW (Vᵢ)
                    </td>


                    {comparedPhones.map((phone) => {

                      const rankInfo =
                        rankByPhoneId.get(phone.id);

                      const isWinner =
                        rankInfo?.rank === 1;

                      return (
                        <td
                          key={phone.id}
                          className={`border-l border-[#e2ebe3] px-4 py-4 ${
                            isWinner ? 'bg-[#eaf6ec]' : ''
                          }`}
                        >

                          <div className="flex flex-wrap items-center justify-between gap-2">

                            <span
                              className={`font-mono text-base font-extrabold ${
                                isWinner
                                  ? 'text-[#267b43]'
                                  : 'text-[#425d49]'
                              }`}
                            >
                              {formatDecimal(
                                rankInfo?.totalScore ?? 0,
                                4
                              )}
                            </span>

                            <span
                              className={`rounded-lg px-2 py-1 text-xs font-extrabold ${
                                isWinner
                                  ? 'bg-[#267d44] text-white'
                                  : 'bg-white text-[#647569] ring-1 ring-[#e1e9e2]'
                              }`}
                            >
                              Peringkat #{rankInfo?.rank ?? '-'}
                            </span>

                          </div>

                        </td>
                      );

                    })}

                  </tr>

                </tfoot>

              </table>

            </div>
            {/* TAMPILAN KHUSUS MOBILE */}

            <div className="space-y-3 p-3 md:hidden">

              <div className="rounded-xl border border-[#dceade] bg-[#f0f8f1] px-3.5 py-3">
                <p className="text-xs font-extrabold text-[#327849]">
                  Perbandingan spesifikasi
                </p>

                <p className="mt-1 text-xs leading-5 text-[#718476]">
                  Buka setiap kriteria untuk melihat perbedaan nilai
                  dari seluruh smartphone yang dipilih.
                </p>
              </div>

              {sawResult.bobotTernormalisasi.map((criterion) => {

                const isCost =
                  String(criterion.type).toLowerCase() === 'cost';

                const extrema = extremaByCode.get(criterion.code);

                const allSame =
                  extrema &&
                  Math.abs(extrema.max - extrema.min) < 1e-9;

                return (
                  <details
                    key={criterion.code}
                    className="group overflow-hidden rounded-2xl border border-[#e1ebe2] bg-white shadow-[0_4px_14px_rgba(24,67,38,0.035)]"
                  >

                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="rounded-md bg-[#edf5ee] px-2 py-1 text-xs font-extrabold text-[#3c754a]">
                            {criterion.code}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-xs font-extrabold ${
                              isCost
                                ? 'bg-[#fff5e7] text-[#a5762f]'
                                : 'bg-[#e9f6eb] text-[#2d7a44]'
                            }`}
                          >
                            {isCost ? 'Cost' : 'Benefit'}
                          </span>

                        </div>

                        <h4 className="mt-2 text-xs font-extrabold text-[#31513a]">
                          {criterion.name}
                        </h4>

                        <p className="mt-1 text-xs text-[#89968c]">
                          Bobot {(Number(criterion.normalizedWeight) * 100)
                            .toFixed(1)
                            .replace('.', ',')}%
                        </p>

                      </div>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#edf6ef] text-[#347d49] transition group-open:rotate-180">
                        <ChevronDown size={16} />
                      </span>

                    </summary>


                    <div className="space-y-2 border-t border-[#edf1ed] bg-[#fafcfa] p-3">

                      {comparedPhones.map((phone) => {

                        const rawValue = Number(
                          phone[criterion.field]
                        );

                        const normalizedMap =
                          normalizedByPhoneId.get(phone.id) || {};

                        const normalizedValue =
                          normalizedMap[criterion.code] ?? 0;

                        const isBest =
                          !allSame &&
                          extrema &&
                          Math.abs(rawValue - extrema.extrema) < 1e-9;

                        const rankInfo =
                          rankByPhoneId.get(phone.id);

                        const isWinner = rankInfo?.rank === 1;

                        return (

                          <div
                            key={phone.id}
                            className={`rounded-xl border p-3 ${
                              isWinner
                                ? 'border-[#cce5d1] bg-[#f0f8f1]'
                                : 'border-[#e8eee8] bg-white'
                            }`}
                          >

                            <div className="flex items-start justify-between gap-2">

                              <div className="min-w-0">

                                <p className="break-words text-sm font-extrabold leading-snug text-[#31513a]">
                                  {phone.name}
                                </p>

                                <p className="mt-1 text-xs text-[#89968c]">
                                  Peringkat #{rankInfo?.rank ?? '-'}
                                </p>

                              </div>

                              {isWinner && (
                                <span className="shrink-0 rounded-full bg-[#267d44] px-2 py-1 text-sm font-extrabold text-white">
                                  Terbaik
                                </span>
                              )}

                            </div>


                            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">

                              <div>

                                <p className="text-xs font-semibold text-[#8a988e]">
                                  Nilai asli
                                </p>

                                <p className={`mt-1 text-sm font-extrabold ${
                                  isBest
                                    ? 'text-[#287e45]'
                                    : 'text-[#435e49]'
                                }`}>
                                  {formatCriterionValue(
                                    criterion.field,
                                    rawValue
                                  )}
                                </p>

                              </div>


                              <div className="text-right">

                                <p className="text-xs font-semibold text-[#8a988e]">
                                  Normalisasi (R)
                                </p>

                                <p className="mt-1 font-mono text-xs font-extrabold text-[#367b49]">
                                  {formatDecimal(normalizedValue, 4)}
                                </p>

                              </div>

                            </div>


                            {isBest && (
                              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#e4f4e7] px-2.5 py-1 text-xs font-extrabold text-[#2b7b43]">
                                <CheckCircle2 size={11} />
                                Nilai terbaik pada kriteria ini
                              </div>
                            )}

                          </div>

                        );

                      })}

                    </div>

                  </details>

                );

              })}

            </div>
          </div>


          {/* KESIMPULAN DAN PENYIMPANAN RIWAYAT */}

          {top && (

            <div className="rounded-[22px] border border-[#dceade] bg-white p-5 shadow-[0_6px_20px_rgba(24,67,38,0.035)]">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="min-w-0">

                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#398653]">
                    <Award size={14} />
                    Kesimpulan perbandingan
                  </div>

                  <p className="mt-2 text-xs leading-6 text-[#65786a]">

                    Dari{' '}
                    <strong className="text-[#31533a]">
                      {comparedPhones.length} smartphone
                    </strong>
                    {' '}yang dibandingkan,{' '}

                    <strong className="text-[#267b43]">
                      {top.smartphone.name}
                    </strong>
                    {' '}berada pada peringkat pertama dengan nilai
                    preferensi SAW{' '}

                    <strong className="font-mono text-[#267b43]">
                      {formatDecimal(top.totalScore, 4)}
                    </strong>.

                  </p>

                </div>


                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">

                  <button
                    type="button"
                    onClick={() =>
                      setShowSteps((previous) => !previous)
                    }
                    className="sd-button-light inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition"
                  >
                    {showSteps ? (
                      <ChevronUp size={15} />
                    ) : (
                      <ChevronDown size={15} />
                    )}

                    {showSteps
                      ? 'Sembunyikan Rincian'
                      : 'Lihat Rincian SAW'}
                  </button>


                  <button
                    type="button"
                    disabled={savingHistory}
                    onClick={handleSaveToHistory}
                    className="sd-button-dark inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {savingHistory ? (
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <BookmarkCheck size={15} />
                    )}

                    {savingHistory
                      ? 'Menyimpan...'
                      : 'Simpan ke Riwayat'}

                  </button>

                </div>

              </div>


              {/* ERROR RIWAYAT */}

              {saveError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-xl border border-[#f0d6d4] bg-[#fff5f4] px-3.5 py-3 text-xs leading-5 text-[#a44747]"
                >
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {saveError}
                </div>
              )}


              {/* BERHASIL DISIMPAN */}

              {saveSuccess && (

                <div
                  role="status"
                  className="mt-4 flex flex-col gap-2 rounded-xl border border-[#d6ead9] bg-[#f0f8f1] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                >

                  <span className="flex items-center gap-2 text-xs font-bold text-[#337949]">
                    <CheckCircle2 size={15} />
                    Hasil perbandingan berhasil disimpan ke Riwayat.
                  </span>

                  <Link
                    to="/riwayat"
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-[#267944] hover:underline"
                  >
                    Buka Riwayat
                    <ChevronRight size={13} />
                  </Link>

                </div>

              )}

            </div>

          )}


          {/* RINCIAN LANGKAH SAW */}

          {showSteps && (
            <SawStepTables sawResult={sawResult} />
          )}

        </section>

      )}


      {/* MODAL TAMBAH HP MANUAL */}

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
